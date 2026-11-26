import { del, get, set } from 'idb-keyval';
import { buildPresetData } from '../data/presets';
import {
  MAX_PROFILE_VERSIONS,
  VaultStateSchema,
  type PortfolioData,
  type PresetId,
  type VaultState,
} from '../types/portfolio';

export type StorageBackend = 'indexeddb' | 'localstorage';

const GUEST_DIRTY_KEY = 'basma_guest_dirty_v1';

export class VaultStorageError extends Error {
  readonly code: 'QUOTA_EXCEEDED' | 'STORAGE_ERROR';

  constructor(code: 'QUOTA_EXCEEDED' | 'STORAGE_ERROR', message: string) {
    super(message);
    this.name = 'VaultStorageError';
    this.code = code;
  }
}

export function getVaultStorageKey(userId: string | null): string {
  return userId ? `basma_vault_user_${userId}` : 'basma_vault_guest';
}

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: number; message?: string };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014 ||
    Boolean(e.message && /quota/i.test(e.message))
  );
}

export function createDefaultVault(initialPresetId: PresetId = 'dev'): VaultState {
  const defaultId = 'v_default';
  return {
    version: 2,
    activeVersionId: defaultId,
    versions: [
      {
        id: defaultId,
        name: 'النسخة الأساسية',
        updatedAt: new Date().toISOString(),
        data: buildPresetData(initialPresetId),
      },
    ],
  };
}

function writeLocalStorage(key: string, value: VaultState): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (isQuotaError(err)) {
      throw new VaultStorageError(
        'QUOTA_EXCEEDED',
        'امتلات مساحة التخزين في المتصفح. جرّب ضغط أو حذف الصورة الشخصية أو حفظ نسخة احتياطية JSON.'
      );
    }
    throw new VaultStorageError(
      'STORAGE_ERROR',
      'تعذّر الحفظ في المتصفح — تأكد من عدم حظر التخزين المحلي أو احفظ نسخة JSON.'
    );
  }
}

function readLocalStorage(key: string): VaultState | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = VaultStateSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

async function readRawVault(key: string): Promise<{ vault: VaultState | null; backend: StorageBackend }> {
  try {
    const idbVal = await get<unknown>(key);
    if (idbVal !== undefined && idbVal !== null) {
      const parsed = VaultStateSchema.safeParse(idbVal);
      if (parsed.success) {
        return { vault: parsed.data, backend: 'indexeddb' };
      }
    }
    // Check localStorage fallback if IndexedDB has no entry
    const lsVal = readLocalStorage(key);
    if (lsVal) {
      return { vault: lsVal, backend: 'indexeddb' };
    }
    return { vault: null, backend: 'indexeddb' };
  } catch {
    return { vault: readLocalStorage(key), backend: 'localstorage' };
  }
}

export async function loadVault(
  userId: string | null
): Promise<{ vault: VaultState; backend: StorageBackend }> {
  const key = getVaultStorageKey(userId);
  const { vault, backend } = await readRawVault(key);
  if (vault) {
    return { vault, backend };
  }
  const fresh = createDefaultVault('dev');
  return { vault: fresh, backend };
}

export async function saveVault(userId: string | null, vault: VaultState): Promise<StorageBackend> {
  const key = getVaultStorageKey(userId);
  try {
    await set(key, vault);
    // Keep lightweight cleanup: if IDB succeeds, remove redundant localStorage copy if any
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore cleanup failure
    }
    return 'indexeddb';
  } catch (err) {
    if (isQuotaError(err)) {
      throw new VaultStorageError(
        'QUOTA_EXCEEDED',
        'امتلأت مساحة IndexedDB على جهازك. يرجى حذف/تصغير الصورة الشخصية أو تصدير نسخة احتياطية JSON.'
      );
    }
    // Fallback to localStorage when IndexedDB is blocked (e.g. Private Browsing)
    writeLocalStorage(key, vault);
    return 'localstorage';
  }
}

export async function clearVault(userId: string | null): Promise<void> {
  const key = getVaultStorageKey(userId);
  try {
    await del(key);
  } catch {
    // Ignore IDB failure in restricted contexts
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore
  }
  if (!userId) {
    clearGuestDirtyFlag();
  }
}

export function markGuestDirty(): void {
  try {
    window.localStorage.setItem(GUEST_DIRTY_KEY, '1');
  } catch {
    // Ignore
  }
}

export function isGuestDirty(): boolean {
  try {
    return window.localStorage.getItem(GUEST_DIRTY_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearGuestDirtyFlag(): void {
  try {
    window.localStorage.removeItem(GUEST_DIRTY_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Automatically migrates a guest draft into the signed-in user's isolated vault.
 * - If the user has no existing vault yet, moves the guest vault directly.
 * - If the user already has a vault and the guest actively edited a draft,
 *   appends it as a new version (when under the 3-version cap) without overwriting existing data.
 */
export async function migrateGuestVaultToUser(
  userId: string
): Promise<{ migrated: boolean; mode: 'moved' | 'appended' | 'none' }> {
  const guestKey = getVaultStorageKey(null);
  const userKey = getVaultStorageKey(userId);

  const { vault: guestVault } = await readRawVault(guestKey);
  if (!guestVault) {
    clearGuestDirtyFlag();
    return { migrated: false, mode: 'none' };
  }

  const { vault: existingUserVault } = await readRawVault(userKey);
  const guestWasEdited = isGuestDirty();

  if (!existingUserVault) {
    await saveVault(userId, guestVault);
    await clearVault(null);
    return { migrated: true, mode: 'moved' };
  }

  if (guestWasEdited && existingUserVault.versions.length < MAX_PROFILE_VERSIONS) {
    const guestActive =
      guestVault.versions.find((v) => v.id === guestVault.activeVersionId) ?? guestVault.versions[0];
    if (guestActive) {
      const migratedVersionId = `v_guest_${Date.now()}`;
      const nextVault: VaultState = {
        ...existingUserVault,
        activeVersionId: migratedVersionId,
        versions: [
          ...existingUserVault.versions,
          {
            id: migratedVersionId,
            name: 'مسودة الضيف المنقولة',
            updatedAt: new Date().toISOString(),
            data: structuredClone(guestActive.data),
          },
        ],
      };
      await saveVault(userId, nextVault);
      await clearVault(null);
      return { migrated: true, mode: 'appended' };
    }
  }

  if (!guestWasEdited) {
    await clearVault(null);
  }
  return { migrated: false, mode: 'none' };
}

export function getActiveVersion(vault: VaultState) {
  return vault.versions.find((v) => v.id === vault.activeVersionId) ?? vault.versions[0]!;
}

export function updateActiveVersionData(vault: VaultState, nextData: PortfolioData): VaultState {
  const now = new Date().toISOString();
  return {
    ...vault,
    versions: vault.versions.map((v) =>
      v.id === vault.activeVersionId ? { ...v, updatedAt: now, data: nextData } : v
    ),
  };
}
