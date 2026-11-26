import QRCode from 'qrcode';
import { getAccentMeta, getAvailabilityMeta, getInitials } from '../data/presets';
import type { PortfolioData } from '../types/portfolio';
import { escapeHtml, sanitizeAvatarSrc, sanitizeFilenamePart, sanitizeUrl } from './sanitize';

function cleanVCardValue(val: string): string {
  return val.replace(/[\r\n]+/g, ' ').replace(/([,;\\])/g, '\\$1').trim();
}

/**
 * Generates a standards-compliant vCard 3.0 payload for offline QR scanning & .vcf download.
 */
export function buildVCardString(data: PortfolioData, includePhone: boolean): string {
  const p = data.profile;
  const fullName = p.fullName.trim() || 'Basma Profile';
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? fullName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const safeUrl = sanitizeUrl(p.primaryPortfolioLink);

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${cleanVCardValue(fullName)}`,
    `N:${cleanVCardValue(lastName)};${cleanVCardValue(firstName)};;;`,
  ];

  if (p.jobTitle.trim()) {
    lines.push(`TITLE:${cleanVCardValue(p.jobTitle)}`);
  }
  if (p.email.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${p.email.trim()}`);
  }
  if (includePhone && p.phone.trim()) {
    lines.push(`TEL;TYPE=CELL:${p.phone.trim()}`);
  }
  if (p.city.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${cleanVCardValue(p.city)};;;;`);
  }
  if (safeUrl) {
    lines.push(`URL:${safeUrl}`);
  }
  if (p.bio.trim()) {
    lines.push(`NOTE:${cleanVCardValue(p.bio.slice(0, 220))}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export async function generateQrDataUrl(vcardText: string, size = 240): Promise<string> {
  return QRCode.toDataURL(vcardText, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
}

export function triggerDownloadBlob(filename: string, content: BlobPart, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadQrPng(
  data: PortfolioData,
  includePhone: boolean
): Promise<void> {
  const vcard = buildVCardString(data, includePhone);
  const dataUrl = await generateQrDataUrl(vcard, 512);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const slug = sanitizeFilenamePart(data.profile.fullName);
  triggerDownloadBlob(`basma-qr-${slug}.png`, blob, 'image/png');
}

export function downloadVCardFile(data: PortfolioData, includePhone: boolean): void {
  const vcard = buildVCardString(data, includePhone);
  const slug = sanitizeFilenamePart(data.profile.fullName);
  triggerDownloadBlob(`basma-card-${slug}.vcf`, vcard, 'text/vcard;charset=utf-8');
}

export function downloadJsonBackup(data: PortfolioData, versionName: string): void {
  const slug = sanitizeFilenamePart(data.profile.fullName);
  const payload = {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    versionName,
    portfolio: data,
  };
  triggerDownloadBlob(
    `basma-backup-${slug}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8'
  );
}

export function buildShareIntroMessage(data: PortfolioData): string {
  const p = data.profile;
  const safeLink = sanitizeUrl(p.primaryPortfolioLink);
  const parts = [
    'السلام عليكم،',
    `أنا ${p.fullName || '—'}${p.jobTitle ? ` — ${p.jobTitle}` : ''}.`,
  ];

  if (p.city) parts.push(`المقر: ${p.city}`);
  if (p.email) parts.push(`البريد الإلكتروني: ${p.email}`);
  if (!p.hidePhoneInPortfolio && p.phone) parts.push(`الجوال: ${p.phone}`);
  if (safeLink) parts.push(`الملف المهني: ${safeLink}`);

  return parts.join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Generates a completely self-contained, zero-CDN offline HTML portfolio file
 * matching the selected template (executive | creative | minimal) and privacy settings.
 */
export function buildStandaloneHtmlDocument(data: PortfolioData): string {
  const p = data.profile;
  const d = data.design;
  const accentMeta = getAccentMeta(d.accent);
  const availMeta = getAvailabilityMeta(p.availability);
  const safeAvatar = sanitizeAvatarSrc(p.avatarDataUrl);
  const safePrimaryLink = sanitizeUrl(p.primaryPortfolioLink);
  const initials = escapeHtml(getInitials(p.fullName));

  const template = d.template;
  const isCreative = template === 'creative';
  const isMinimal = template === 'minimal';
  const isBento = template === 'bento';
  const isObsidian = template === 'obsidian';
  const isSwiss = template === 'swiss_editorial';
  const isSidebarPro = template === 'sidebar_pro';
  const useGridProjects = isCreative || isBento || isObsidian;

  const avatarMarkup = safeAvatar
    ? `<div class="avatar"><img src="${escapeHtml(safeAvatar)}" alt="${escapeHtml(p.fullName)}" /></div>`
    : `<div class="avatar avatar-initials">${initials}</div>`;

  const availBadgeMarkup = availMeta.badge
    ? `<span class="avail-badge ${isCreative || isObsidian ? 'avail-dark' : 'avail-light'}"><span class="avail-dot"></span>${escapeHtml(availMeta.badge)}</span>`
    : '';

  const contactChips = [
    p.city ? `<span>📍 ${escapeHtml(p.city)}</span>` : '',
    p.email ? `<span dir="ltr"><a class="contact-link" href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></span>` : '',
    !p.hidePhoneInPortfolio && p.phone ? `<span dir="ltr">${escapeHtml(p.phone)}</span>` : '',
    safePrimaryLink
      ? `<span dir="ltr"><a class="contact-link" href="${escapeHtml(safePrimaryLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(safePrimaryLink)}</a></span>`
      : '',
  ]
    .filter(Boolean)
    .join('');

  const heroHtml = isCreative
    ? `
      <header class="hero hero-creative">
        <div class="hero-top">
          <div class="hero-identity">
            ${avatarMarkup}
            <div>
              <div class="hero-title-row">
                <h1>${escapeHtml(p.fullName)}</h1>
                ${availBadgeMarkup}
              </div>
              <p class="job-title">${escapeHtml(p.jobTitle)}</p>
            </div>
          </div>
        </div>
        ${p.bio ? `<p class="bio">${escapeHtml(p.bio)}</p>` : ''}
        ${contactChips ? `<div class="contacts">${contactChips}</div>` : ''}
      </header>
    `
    : isObsidian
    ? `
      <header class="hero hero-obsidian">
        <div class="obsidian-top">
          <div class="win-dots" aria-hidden="true"><span></span><span></span><span></span><small dir="ltr">~/portfolio/profile</small></div>
          ${availBadgeMarkup}
        </div>
        <div class="hero-identity">
          ${avatarMarkup}
          <div>
            <h1>${escapeHtml(p.fullName)}</h1>
            <p class="job-title">${escapeHtml(p.jobTitle)}</p>
          </div>
        </div>
        ${p.bio ? `<p class="bio">${escapeHtml(p.bio)}</p>` : ''}
        ${contactChips ? `<div class="contacts">${contactChips}</div>` : ''}
      </header>
    `
    : isBento
    ? `
      <header class="bento-hero-grid">
        <div class="panel bento-main">
          <div class="hero-identity">
            ${avatarMarkup}
            <div>
              <div class="hero-title-row">
                <h1>${escapeHtml(p.fullName)}</h1>
                ${availBadgeMarkup}
              </div>
              <p class="job-title">${escapeHtml(p.jobTitle)}</p>
            </div>
          </div>
          ${p.bio ? `<p class="bio">${escapeHtml(p.bio)}</p>` : ''}
        </div>
        <div class="bento-side">
          <div class="bento-side-label">ملخص سريع والتواصل</div>
          <div class="bento-side-contacts">${contactChips}</div>
        </div>
      </header>
    `
    : isSwiss
    ? `
      <header class="hero hero-swiss">
        <div class="swiss-grid">
          <div class="hero-identity">
            ${safeAvatar ? avatarMarkup : ''}
            <div>
              <div class="hero-minimal-tag">
                <span class="swiss-eyebrow">SWISS GRID PORTFOLIO</span>
                ${availBadgeMarkup}
              </div>
              <h1>${escapeHtml(p.fullName)}</h1>
              <p class="job-title">${escapeHtml(p.jobTitle)}</p>
            </div>
          </div>
          <div class="swiss-contacts">${contactChips}</div>
        </div>
        ${p.bio ? `<p class="bio">${escapeHtml(p.bio)}</p>` : ''}
      </header>
    `
    : isSidebarPro
    ? `
      <header class="hero hero-sidebar">
        <div class="stack">
          ${avatarMarkup}
          <div>
            <h1>${escapeHtml(p.fullName)}</h1>
            <p class="job-title">${escapeHtml(p.jobTitle)}</p>
          </div>
          ${availBadgeMarkup}
        </div>
        ${contactChips ? `<div class="contacts contacts-exec">${contactChips}</div>` : ''}
      </header>
    `
    : isMinimal
    ? `
      <header class="hero hero-minimal">
        <div class="hero-identity">
          ${safeAvatar ? avatarMarkup : ''}
          <div>
            <div class="hero-minimal-tag">
              <span class="minimal-eyebrow">الملف التعريفي المهني</span>
              ${availBadgeMarkup}
            </div>
            <h1>${escapeHtml(p.fullName)}</h1>
            <p class="job-title">${escapeHtml(p.jobTitle)}</p>
          </div>
        </div>
        ${p.bio ? `<p class="bio">${escapeHtml(p.bio)}</p>` : ''}
        ${contactChips ? `<div class="contacts">${contactChips}</div>` : ''}
      </header>
    `
    : `
      <header class="hero hero-executive">
        <div class="exec-bar"></div>
        <div class="exec-body">
          <div class="hero-identity">
            ${avatarMarkup}
            <div>
              <div class="hero-title-row">
                <h1>${escapeHtml(p.fullName)}</h1>
                ${availBadgeMarkup}
              </div>
              <p class="job-title">${escapeHtml(p.jobTitle)}</p>
            </div>
          </div>
          ${p.bio ? `<p class="bio">${escapeHtml(p.bio)}</p>` : ''}
          ${contactChips ? `<div class="contacts contacts-exec">${contactChips}</div>` : ''}
        </div>
      </header>
    `;

  const projectsHtml =
    d.blocks.projects && data.projects.length > 0
      ? `
      <section class="section">
        <div class="section-head">
          <h2><span class="accent-pill"></span>أبرز المشاريع والأعمال</h2>
          <span class="section-count">${data.projects.length} أعمال</span>
        </div>
        <div class="${useGridProjects ? 'projects-grid' : 'stack'}">
          ${data.projects
            .map((proj) => {
              const safeUrl = sanitizeUrl(proj.url);
              const tag = safeUrl ? 'a' : 'article';
              const linkAttrs = safeUrl
                ? `href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer"`
                : '';
              return `
                <${tag} ${linkAttrs} class="card ${isMinimal ? 'card-minimal' : 'card-boxed'}">
                  ${isCreative ? '<div class="creative-line"></div>' : ''}
                  <div class="card-head">
                    <div>
                      <span class="cat-badge">${escapeHtml(proj.category)}</span>
                      <h3>${escapeHtml(proj.title)}</h3>
                    </div>
                    ${safeUrl ? '<span class="ext-arrow" aria-hidden="true">↗</span>' : ''}
                  </div>
                  <p class="desc">${escapeHtml(proj.description)}</p>
                  ${proj.impact ? `<div class="impact">📈 ${escapeHtml(proj.impact)}</div>` : ''}
                </${tag}>
              `;
            })
            .join('')}
        </div>
      </section>
    `
      : '';

  const experienceHtml =
    d.blocks.experience && data.experience.length > 0
      ? `
      <section class="section">
        <h2 class="section-title"><span class="accent-pill"></span>الخبرات العملية</h2>
        <div class="${isMinimal ? 'stack-lg' : 'panel stack-lg'}">
          ${data.experience
            .map((exp, idx) => {
              const bullets = exp.achievements
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean);
              return `
                <div class="${idx > 0 ? 'divider-top' : ''}">
                  <div class="row-between">
                    <div>
                      <h3>${escapeHtml(exp.role)}</h3>
                      <div class="company">${escapeHtml(exp.company)}</div>
                    </div>
                    <span class="period-pill">${escapeHtml(exp.period)}</span>
                  </div>
                  ${
                    bullets.length > 0
                      ? `<ul class="bullets">${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
                      : ''
                  }
                </div>
              `;
            })
            .join('')}
        </div>
      </section>
    `
      : '';

  const skillsHtml =
    d.blocks.skills && data.skills.length > 0
      ? `
      <section class="section">
        <h2 class="section-title"><span class="accent-pill"></span>المهارات والتقنيات</h2>
        <div class="tags">
          ${data.skills.map((sk) => `<span class="skill-tag">${escapeHtml(sk)}</span>`).join('')}
        </div>
      </section>
    `
      : '';

  const eduHtml =
    d.blocks.education && data.education.length > 0
      ? `
      <section class="section">
        <h2 class="section-title"><span class="accent-pill"></span>التعليم والشهادات</h2>
        <div class="${isMinimal ? 'stack' : 'panel stack'}">
          ${data.education
            .map(
              (ed, idx) => `
              <div class="row-between ${idx > 0 ? 'divider-top' : ''}">
                <div>
                  <div class="edu-deg">${escapeHtml(ed.degree)}</div>
                  <div class="edu-inst">${escapeHtml(ed.institution)}</div>
                </div>
                <span class="period-pill">${escapeHtml(ed.year)}</span>
              </div>
            `
            )
            .join('')}
        </div>
      </section>
    `
      : '';

  const testimonialsHtml =
    d.blocks.testimonials && data.testimonials.length > 0
      ? `
      <section class="section">
        <h2 class="section-title"><span class="accent-pill"></span>آراء وتوصيات مهنية</h2>
        <div class="testimonials-grid">
          ${data.testimonials
            .map(
              (t) => `
              <blockquote class="card card-boxed testimonial">
                <p class="quote">«${escapeHtml(t.quote)}»</p>
                <footer class="testimonial-foot">
                  <div>
                    <div class="test-name">${escapeHtml(t.name)}</div>
                    <div class="test-role">${escapeHtml(t.role)}</div>
                  </div>
                  ${t.verified ? '<span class="verified-badge">موثّقة ✓</span>' : ''}
                </footer>
              </blockquote>
            `
            )
            .join('')}
        </div>
      </section>
    `
      : '';

  const languagesHtml =
    d.blocks.languages && data.languages.length > 0
      ? `
      <section class="section">
        <h2 class="section-title"><span class="accent-pill"></span>اللغات</h2>
        <div class="tags">
          ${data.languages
            .map(
              (lg) => `
              <span class="lang-tag">
                <strong>${escapeHtml(lg.name)}</strong>
                <span>•</span>
                <span>${escapeHtml(lg.level)}</span>
              </span>
            `
            )
            .join('')}
        </div>
      </section>
    `
      : '';

  const safeLinks = data.links
    .map((lnk) => ({ label: lnk.label, url: sanitizeUrl(lnk.url) }))
    .filter((lnk) => lnk.url !== '');

  const linksHtml =
    d.blocks.links && safeLinks.length > 0
      ? `
      <section class="section">
        <h2 class="section-title"><span class="accent-pill"></span>تواصل معي</h2>
        <div class="tags">
          ${safeLinks
            .map(
              (lnk) => `
              <a class="link-btn" href="${escapeHtml(lnk.url)}" target="_blank" rel="noopener noreferrer">
                <span>${escapeHtml(lnk.label)}</span>
                <span aria-hidden="true">↗</span>
              </a>
            `
            )
            .join('')}
        </div>
      </section>
    `
      : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(p.fullName)} — ${escapeHtml(p.jobTitle)}</title>
  <meta name="description" content="${escapeHtml(p.bio)}" />
  <style>
    :root {
      --accent: ${accentMeta.hex};
      --accent-soft: ${accentMeta.soft};
      --surface: ${isObsidian ? '#020617' : isBento ? '#F5F5F7' : isSwiss ? '#FAFAFA' : '#F8FAFC'};
      --card-bg: ${isObsidian ? '#111827' : '#FFFFFF'};
      --ink: ${isObsidian ? '#F8FAFC' : '#0F172A'};
      --muted: ${isObsidian ? '#CBD5E1' : '#475569'};
      --line: ${isObsidian ? '#1E293B' : isSwiss ? '#0F172A' : '#E2E8F0'};
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px 14px;
      background: var(--surface);
      color: var(--ink);
      font-family: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif;
      line-height: 1.65;
    }
    a { color: inherit; text-decoration: none; }
    .container {
      max-width: ${isSidebarPro ? '980px' : '880px'};
      margin: 0 auto;
      background: ${isObsidian ? '#0B1120' : isMinimal || isSwiss ? '#FFFFFF' : isBento ? '#F5F5F7' : '#F8FAFC'};
      border: ${isSwiss ? '2px' : '1px'} solid var(--line);
      border-radius: ${isSwiss ? '0px' : '24px'};
      padding: 28px;
      box-shadow: ${isSwiss ? 'none' : '0 10px 30px -12px rgba(15, 23, 42, 0.08)'};
    }
    .sidebar-layout { display: grid; grid-template-columns: 280px 1fr; gap: 22px; align-items: start; }
    .sidebar-col { background: var(--accent-soft); border: 1px solid var(--line); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
    .bento-hero-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
    .bento-main { border-radius: 20px; }
    .bento-side { background: var(--accent); color: #FFFFFF; border-radius: 20px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; }
    .bento-side-label { font-size: 11px; font-weight: 700; opacity: 0.85; }
    .bento-side-contacts .contacts { margin-top: 6px; padding-top: 8px; flex-direction: column; gap: 6px; }
    .hero-obsidian { background: #111827; border: 1px solid #1E293B; border-radius: 18px; padding: 22px; color: #FFFFFF; }
    .obsidian-top { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; margin-bottom: 14px; border-bottom: 1px solid #1E293B; }
    .win-dots { display: flex; align-items: center; gap: 6px; }
    .win-dots span { width: 9px; height: 9px; border-radius: 999px; background: #475569; display: inline-block; }
    .win-dots small { font-family: monospace; font-size: 11px; color: #94A3B8; margin-right: 6px; }
    .hero-swiss { border: 2px solid #0F172A; background: #FFFFFF; padding: 22px; }
    .swiss-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; border-bottom: 1px solid #0F172A; padding-bottom: 14px; margin-bottom: 12px; }
    .swiss-eyebrow { font-size: 10px; font-weight: 700; padding: 2px 6px; border: 1px solid #0F172A; background: var(--accent-soft); color: var(--accent); }
    .swiss-contacts .contacts { margin-top: 0; padding-top: 0; border-top: 0; color: var(--muted); flex-direction: column; gap: 4px; }
    .stack { display: flex; flex-direction: column; gap: 12px; }
    .stack-lg { display: flex; flex-direction: column; gap: 18px; }
    .section { margin-top: 26px; }
    .section-head, .row-between {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }
    .section-head { margin-bottom: 12px; }
    h2, .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: var(--ink);
    }
    .section-head h2 { margin: 0; }
    .section-count { font-size: 12px; color: #94A3B8; }
    .accent-pill {
      display: inline-block;
      width: 6px;
      height: 16px;
      border-radius: 999px;
      background: var(--accent);
    }
    .hero-creative {
      border-radius: 18px;
      padding: 26px;
      color: #FFFFFF;
      background: linear-gradient(135deg, var(--accent) 0%, #0F172A 100%);
    }
    .hero-executive {
      background: #FFFFFF;
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
    }
    .exec-bar { height: 6px; background: var(--accent); }
    .exec-body { padding: 24px; }
    .hero-minimal { padding-bottom: 22px; border-bottom: 1px solid var(--line); }
    .hero-minimal-tag { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 6px; }
    .minimal-eyebrow { font-size: 11px; font-weight: 700; color: var(--accent); }
    .hero-identity { display: flex; align-items: center; gap: 14px; }
    .hero-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    h1 { margin: 0; font-size: 22px; font-weight: 700; line-height: 1.3; }
    .job-title { margin: 4px 0 0; font-size: 14px; opacity: 0.9; font-weight: 500; }
    .bio { margin: 16px 0 0; font-size: 14px; line-height: 1.75; max-width: 68ch; }
    .hero-executive .bio, .hero-minimal .bio { color: var(--muted); }
    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      background: var(--accent);
      color: #FFFFFF;
    }
    .hero-creative .avatar { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); }
    .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .avail-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 999px;
      border: 1px solid;
    }
    .avail-dark { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.28); color: #FFFFFF; }
    .avail-light { background: #ECFDF5; border-color: #A7F3D0; color: #065F46; }
    .avail-dot { width: 6px; height: 6px; border-radius: 999px; background: #10B981; }
    .contacts {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 18px;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.16);
      font-size: 12.5px;
    }
    .contacts-exec, .hero-minimal .contacts {
      border-top: 1px solid #F1F5F9;
      color: var(--muted);
    }
    .contact-link:hover { text-decoration: underline; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: ${isSwiss ? '0px' : '16px'};
      padding: 18px;
    }
    .card { display: block; transition: border-color 0.15s, box-shadow 0.15s; }
    .card-boxed {
      background: var(--card-bg);
      border: 1px solid var(--line);
      border-radius: ${isSwiss ? '0px' : isBento ? '20px' : '16px'};
      padding: 16px;
    }
    a.card-boxed:hover { border-color: #CBD5E1; box-shadow: 0 4px 14px -6px rgba(15, 23, 42, 0.1); }
    .card-minimal { padding: 14px 4px; border-bottom: 1px solid var(--line); }
    .creative-line { height: 6px; border-radius: 999px; margin-bottom: 12px; background: linear-gradient(90deg, var(--accent), transparent); opacity: 0.85; }
    .card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    .cat-badge {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: ${isObsidian ? 'rgba(255,255,255,0.1)' : 'var(--accent-soft)'};
      color: ${isObsidian ? '#E2E8F0' : 'var(--accent)'};
      margin-bottom: 6px;
    }
    h3 { margin: 0; font-size: 14.5px; font-weight: 700; color: var(--ink); }
    .ext-arrow { font-size: 13px; color: #94A3B8; }
    .desc { margin: 8px 0 0; font-size: 13px; color: var(--muted); }
    .impact {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      background: ${isObsidian ? 'rgba(16, 185, 129, 0.14)' : 'var(--accent-soft)'};
      color: ${isObsidian ? '#A7F3D0' : 'var(--accent)'};
    }
    .company { font-size: 12.5px; font-weight: 600; color: ${isObsidian ? '#93C5FD' : 'var(--accent)'}; margin-top: 2px; }
    .period-pill {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--muted);
      background: ${isObsidian ? '#1E293B' : '#F1F5F9'};
      padding: 3px 10px;
      border-radius: 8px;
    }
    .bullets { margin: 10px 0 0; padding: 0 18px 0 0; font-size: 13px; color: var(--muted); }
    .bullets li + li { margin-top: 4px; }
    .divider-top { padding-top: 14px; border-top: 1px solid var(--line); }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag {
      padding: 6px 12px;
      border-radius: ${isSwiss ? '0px' : '10px'};
      font-size: 12.5px;
      font-weight: 600;
      background: ${isObsidian ? '#1E293B' : isSwiss ? '#FFFFFF' : 'var(--accent-soft)'};
      color: ${isObsidian ? '#E2E8F0' : isSwiss ? '#0F172A' : 'var(--accent)'};
      border: 1px solid ${isObsidian ? '#334155' : isSwiss ? '#0F172A' : 'rgba(15, 23, 42, 0.08)'};
    }
    .edu-deg { font-size: 14px; font-weight: 700; color: var(--ink); }
    .edu-inst { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
    .testimonial { margin: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
    .quote { margin: 0; font-size: 13px; color: var(--muted); }
    .testimonial-foot {
      padding-top: 10px;
      border-top: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .test-name { font-size: 12.5px; font-weight: 700; color: var(--ink); }
    .test-role { font-size: 11.5px; color: var(--muted); }
    .verified-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      background: #ECFDF5;
      color: #047857;
      border: 1px solid #A7F3D0;
    }
    .lang-tag, .link-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: ${isSwiss ? '0px' : '12px'};
      background: var(--card-bg);
      border: 1px solid var(--line);
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink);
    }
    .link-btn:hover { border-color: #94A3B8; }
    .site-footer {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
      color: #94A3B8;
    }
    @media (max-width: 720px) {
      .sidebar-layout, .bento-hero-grid, .swiss-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .container { padding: 18px; border-radius: 16px; }
      .hero-creative, .exec-body { padding: 18px; }
    }
  </style>
</head>
<body>
  <main class="container">
    ${
      isSidebarPro
        ? `<div class="sidebar-layout">
            <aside class="sidebar-col">
              ${heroHtml}
              ${skillsHtml}
              ${languagesHtml}
              ${linksHtml}
            </aside>
            <div>
              ${
                p.bio
                  ? `<section class="panel"><h2 class="section-title"><span class="accent-pill"></span>النبذة المهنية</h2><p class="bio" style="margin-top:0">${escapeHtml(p.bio)}</p></section>`
                  : ''
              }
              ${projectsHtml}
              ${experienceHtml}
              ${eduHtml}
              ${testimonialsHtml}
            </div>
          </div>`
        : `${heroHtml}
           ${projectsHtml}
           ${experienceHtml}
           ${skillsHtml}
           ${eduHtml}
           ${testimonialsHtml}
           ${languagesHtml}
           ${linksHtml}`
    }
    <footer class="site-footer">
      <span>صُنع عبر منصة <strong>بصمة | Basma</strong></span>
      <span>ملف بورتفوليو مستقل يعمل محلياً دون اتصال</span>
    </footer>
  </main>
</body>
</html>`;
}

export function downloadStandaloneHtml(data: PortfolioData): void {
  const html = buildStandaloneHtmlDocument(data);
  const slug = sanitizeFilenamePart(data.profile.fullName);
  triggerDownloadBlob(`basma-portfolio-${slug}.html`, html, 'text/html;charset=utf-8');
}
