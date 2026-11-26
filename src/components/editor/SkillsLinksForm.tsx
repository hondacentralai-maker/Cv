import React, { useState } from 'react';
import { PRESET_LIST } from '../../data/presets';
import { getActiveWritingAssist } from '../../data/writingAssist';
import { sanitizeUrl } from '../../lib/sanitize';
import type { LinkItem, PresetId } from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';

interface SkillsLinksFormProps {
  skills: string[];
  links: LinkItem[];
  presetId: PresetId;
  onChangeSkills: (nextSkills: string[]) => void;
  onChangeLinks: (nextLinks: LinkItem[], ensureBlockVisible?: boolean) => void;
}

export const SkillsLinksForm: React.FC<SkillsLinksFormProps> = ({
  skills,
  links,
  presetId,
  onChangeSkills,
  onChangeLinks,
}) => {
  const { showToast } = useToast();
  const assist = getActiveWritingAssist(presetId);
  const presetLabel = PRESET_LIST.find((x) => x.id === presetId)?.label ?? PRESET_LIST[0]!.label;

  const [newSkill, setNewSkill] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkLabel, setEditLinkLabel] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const remainingSuggestions = assist.suggestedSkills.filter((sk) => !skills.includes(sk));

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newSkill.trim();
    if (!val) return;
    if (!skills.includes(val)) {
      onChangeSkills([...skills, val]);
    }
    setNewSkill('');
  };

  const handleSaveEditLink = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const safeUrl = sanitizeUrl(editLinkUrl);
    if (!editLinkLabel.trim() || !safeUrl) {
      showToast('يجب أن يبدأ الرابط بـ https:// أو http:// أو mailto:', 'amber');
      return;
    }
    onChangeLinks(
      links.map((l) =>
        l.id === id ? { ...l, label: editLinkLabel.trim(), url: safeUrl } : l
      )
    );
    setEditingLinkId(null);
    showToast('تم حفظ تعديل الرابط بنجاح');
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const safeUrl = sanitizeUrl(newLinkUrl);
    if (!newLinkLabel.trim() || !safeUrl) {
      showToast('يجب أن يبدأ الرابط بـ https:// أو http:// أو mailto:', 'amber');
      return;
    }
    const created: LinkItem = {
      id: `l_${Date.now()}`,
      label: newLinkLabel.trim(),
      url: safeUrl,
    };
    onChangeLinks([...links, created], true);
    setNewLinkLabel('');
    setNewLinkUrl('');
    showToast(`تمت إضافة رابط «${created.label}»`);
  };

  return (
    <div className="space-y-5">
      {/* Skills Tag Manager */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-ink">إدارة المهارات ({skills.length})</h3>
          <p className="text-xs text-muted mt-0.5">
            يوصى بـ 5 مهارات على الأقل لتعزيز توافق السيرة الذاتية مع أنظمة الفرز
          </p>
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="اكتب مهارة واضغط إضافة (مثال: إدارة المشاريع)..."
            className="flex-1 px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            إضافة
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {skills.map((sk, idx) => (
            <span
              key={`${sk}-${idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/80"
            >
              <span>{sk}</span>
              <button
                type="button"
                onClick={() => onChangeSkills(skills.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-rose-600 font-bold leading-none"
                aria-label={`حذف المهارة ${sk}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {remainingSuggestions.length > 0 && (
          <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
            <span className="block text-[11px] font-bold text-teal-900">
              مهارات مقترحة لمجال ({presetLabel}) — اضغط للإضافة فوراً:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {remainingSuggestions.map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => {
                    onChangeSkills([...skills, sk]);
                    showToast(`تمت إضافة مهارة «${sk}»`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-700 hover:text-white text-teal-900 border border-teal-200 text-[11px] font-semibold transition-colors"
                >
                  + {sk}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Social & Contact Links */}
      <div className="space-y-3 pt-4 border-t border-line">
        <div>
          <h3 className="text-sm font-bold text-ink">
            روابط التواصل والأعمال ({links.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">
            تُقبل الروابط الآمنة فقط (https / http / mailto) لمنع أي روابط ضارة
          </p>
        </div>

        <div className="space-y-2">
          {links.map((lnk) => {
            if (editingLinkId === lnk.id) {
              return (
                <form
                  key={lnk.id}
                  onSubmit={(e) => handleSaveEditLink(e, lnk.id)}
                  className="p-3.5 rounded-xl border-2 border-teal-600 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">تعديل الرابط</span>
                    <button
                      type="button"
                      onClick={() => setEditingLinkId(null)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editLinkLabel}
                    onChange={(e) => setEditLinkLabel(e.target.value)}
                    placeholder="عنوان الرابط"
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                  />
                  <input
                    type="url"
                    dir="ltr"
                    spellCheck={false}
                    required
                    value={editLinkUrl}
                    onChange={(e) => setEditLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs text-left focus:outline-none focus:border-teal-600"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    حفظ التعديل
                  </button>
                </form>
              );
            }

            return (
              <div
                key={lnk.id}
                className="p-3 rounded-xl border border-line bg-slate-50/60 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-ink truncate">{lnk.label}</div>
                  <div className="text-[11px] text-muted truncate" dir="ltr">
                    {lnk.url}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLinkId(lnk.id);
                      setEditLinkLabel(lnk.label);
                      setEditLinkUrl(lnk.url);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title="تعديل الرابط"
                    aria-label={`تعديل ${lnk.label}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingLinkId === lnk.id) setEditingLinkId(null);
                      onChangeLinks(links.filter((l) => l.id !== lnk.id));
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                    title="حذف الرابط"
                    aria-label={`حذف ${lnk.label}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAddLink} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            required
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            placeholder="عنوان الرابط (مثال: LinkedIn)"
            className="sm:col-span-5 px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <input
            type="url"
            dir="ltr"
            spellCheck={false}
            required
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="https://..."
            className="sm:col-span-7 px-3 py-2 rounded-xl border border-line text-xs text-left focus:outline-none focus:border-teal-600"
          />
          <button
            type="submit"
            className="sm:col-span-12 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            + إضافة رابط تواصل
          </button>
        </form>
      </div>
    </div>
  );
};
