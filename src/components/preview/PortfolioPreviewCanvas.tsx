import React, { useEffect, useState } from 'react';
import { getAccentMeta, getAvailabilityMeta, getInitials } from '../../data/presets';
import { sanitizeAvatarSrc, sanitizeUrl } from '../../lib/sanitize';
import type { PortfolioData } from '../../types/portfolio';

interface PortfolioPreviewCanvasProps {
  data: PortfolioData;
  versionName: string;
  onOpenAtsTab: () => void;
  onExportStandaloneHtml: () => void;
}

export const PortfolioPreviewCanvas: React.FC<PortfolioPreviewCanvasProps> = ({
  data,
  versionName,
  onOpenAtsTab,
  onExportStandaloneHtml,
}) => {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [data.profile.avatarDataUrl]);

  const p = data.profile;
  const d = data.design;
  const accentMeta = getAccentMeta(d.accent);
  const availMeta = getAvailabilityMeta(p.availability);
  const safeAvatar = !imgError ? sanitizeAvatarSrc(p.avatarDataUrl) : '';
  const safePrimaryLink = sanitizeUrl(p.primaryPortfolioLink);
  const initials = getInitials(p.fullName);

  const isCreative = d.template === 'creative';
  const isMinimal = d.template === 'minimal';
  const isBento = d.template === 'bento';
  const isObsidian = d.template === 'obsidian';
  const isSwiss = d.template === 'swiss_editorial';
  const isSidebarPro = d.template === 'sidebar_pro';
  const useGridProjects =
    (isCreative || isBento || isObsidian) && viewportMode !== 'mobile';

  const renderAvatar = (sizeCls: string, extraCls: string, bgHex?: string) => {
    if (safeAvatar) {
      return (
        <div
          className={`${sizeCls} ${extraCls} overflow-hidden relative flex items-center justify-center shrink-0`}
          style={bgHex ? { backgroundColor: bgHex } : undefined}
        >
          <img
            src={safeAvatar}
            alt={p.fullName || 'الصورة الشخصية'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return (
      <div
        className={`${sizeCls} ${extraCls} flex items-center justify-center font-bold shrink-0`}
        style={bgHex ? { backgroundColor: bgHex } : undefined}
      >
        {initials}
      </div>
    );
  };

  const renderContactChips = (darkMode: boolean) => (
    <div
      className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs ${
        darkMode
          ? 'mt-4 pt-4 border-t border-white/15 text-white/85'
          : isMinimal || isSwiss
          ? 'text-slate-600'
          : 'pt-3 border-t border-slate-100 text-slate-500'
      }`}
    >
      {p.city && (
        <span className="inline-flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 opacity-75"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {p.city}
        </span>
      )}
      {p.email && (
        <span className="inline-flex items-center gap-1.5" dir="ltr">
          <svg
            className="w-3.5 h-3.5 opacity-75"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
          {p.email}
        </span>
      )}
      {!p.hidePhoneInPortfolio && p.phone && (
        <span className="inline-flex items-center gap-1.5" dir="ltr">
          <svg
            className="w-3.5 h-3.5 opacity-75"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {p.phone}
        </span>
      )}
      {safePrimaryLink && (
        <a
          href={safePrimaryLink}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="inline-flex items-center gap-1 hover:underline truncate max-w-[230px]"
        >
          <span>{safePrimaryLink}</span>
        </a>
      )}
    </div>
  );

  const availBadgeLight = availMeta.badge ? (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${availMeta.pillClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${availMeta.dot} animate-pulse`} />
      {availMeta.badge}
    </span>
  ) : null;

  const availBadgeDark = availMeta.badge ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 border border-white/25 text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      {availMeta.badge}
    </span>
  ) : null;

  const outerCanvasClass = isObsidian
    ? 'p-5 sm:p-7 space-y-6 bg-[#0B1120] text-slate-100'
    : isBento
    ? 'p-5 sm:p-7 space-y-6 bg-[#F5F5F7]'
    : isSwiss
    ? 'p-5 sm:p-7 space-y-6 bg-[#FAFAFA]'
    : isMinimal
    ? 'p-5 sm:p-7 space-y-6 bg-white'
    : 'p-5 sm:p-7 space-y-6';

  const sectionHeadingCls = isObsidian
    ? 'text-sm font-bold text-white flex items-center gap-2'
    : isSwiss
    ? 'text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-1.5 border-b border-slate-900'
    : 'text-sm font-bold text-ink flex items-center gap-2';

  const heroSection = isCreative ? (
    <div
      className="rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${accentMeta.hex} 0%, #0F172A 100%)`,
      }}
    >
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {renderAvatar(
            'w-14 h-14',
            'rounded-2xl bg-white/15 backdrop-blur border border-white/25 text-lg text-white'
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {p.fullName || 'الاسم الكامل'}
              </h1>
              {availBadgeDark}
            </div>
            <p className="text-sm text-white/85 mt-0.5">{p.jobTitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAtsTab}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>عرض السيرة الذاتية ATS</span>
        </button>
      </div>
      {p.bio && (
        <p className="relative z-10 text-xs sm:text-sm text-white/90 leading-relaxed mt-5 max-w-2xl">
          {p.bio}
        </p>
      )}
      {renderContactChips(true)}
    </div>
  ) : isObsidian ? (
    <div className="rounded-2xl bg-[#111827] border border-slate-800 p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <span dir="ltr" className="text-[11px] font-mono text-slate-400 mr-2">
            ~/portfolio/profile
          </span>
        </div>
        {availBadgeDark}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {renderAvatar(
            'w-14 h-14',
            'rounded-2xl border border-slate-700 text-white text-lg',
            accentMeta.hex
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {p.fullName || 'الاسم الكامل'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{p.jobTitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAtsTab}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold hover:opacity-95 transition-opacity shrink-0 border border-white/15"
          style={{ backgroundColor: accentMeta.hex }}
        >
          <span>السيرة الذاتية ATS</span>
        </button>
      </div>
      {p.bio && (
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">{p.bio}</p>
      )}
      {renderContactChips(true)}
    </div>
  ) : isBento ? (
    <div
      className={`grid grid-cols-1 ${
        viewportMode === 'mobile' ? '' : 'sm:grid-cols-12'
      } gap-3.5`}
    >
      <div
        className={`${
          viewportMode === 'mobile' ? '' : 'sm:col-span-8'
        } bg-white border border-slate-200/80 rounded-[20px] p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {renderAvatar('w-14 h-14', 'rounded-2xl text-white text-lg', accentMeta.hex)}
            <div>
              <h1 className="text-xl font-bold text-ink">{p.fullName || 'الاسم الكامل'}</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{p.jobTitle}</p>
            </div>
          </div>
          {availBadgeLight}
        </div>
        {p.bio && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.bio}</p>}
      </div>

      <div
        className={`${
          viewportMode === 'mobile' ? '' : 'sm:col-span-4'
        } rounded-[20px] p-5 text-white flex flex-col justify-between gap-3 shadow-xs`}
        style={{ backgroundColor: accentMeta.hex }}
      >
        <div className="space-y-1.5 text-xs text-white/90">
          <div className="text-[11px] font-bold text-white/75">ملخص سريع والتواصل</div>
          {p.city && <div>📍 {p.city}</div>}
          {p.email && (
            <div dir="ltr" className="text-right truncate">
              {p.email}
            </div>
          )}
          {!p.hidePhoneInPortfolio && p.phone && (
            <div dir="ltr" className="text-right">
              {p.phone}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenAtsTab}
          className="w-full py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors"
        >
          عرض السيرة الذاتية ATS
        </button>
      </div>
    </div>
  ) : isSwiss ? (
    <div className="border-2 border-slate-900 bg-white p-5 sm:p-6 space-y-4">
      <div
        className={`grid grid-cols-1 ${
          viewportMode === 'mobile' ? '' : 'sm:grid-cols-12'
        } gap-4 items-start border-b border-slate-900 pb-4`}
      >
        <div className={`${viewportMode === 'mobile' ? '' : 'sm:col-span-8'} flex items-start gap-3.5`}>
          {safeAvatar &&
            renderAvatar('w-14 h-14', 'rounded-none border border-slate-900 shrink-0')}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 border border-slate-900"
                style={{ backgroundColor: accentMeta.soft, color: accentMeta.hex }}
              >
                SWISS GRID PORTFOLIO
              </span>
              {availBadgeLight}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {p.fullName || 'الاسم الكامل'}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">{p.jobTitle}</p>
          </div>
        </div>
        <div
          className={`${
            viewportMode === 'mobile' ? '' : 'sm:col-span-4'
          } flex flex-col gap-1.5 text-xs text-slate-700`}
        >
          {p.city && <div>{p.city}</div>}
          {p.email && (
            <div dir="ltr" className="text-right truncate">
              {p.email}
            </div>
          )}
          {!p.hidePhoneInPortfolio && p.phone && (
            <div dir="ltr" className="text-right">
              {p.phone}
            </div>
          )}
          {safePrimaryLink && (
            <div dir="ltr" className="text-right truncate opacity-85">
              {safePrimaryLink}
            </div>
          )}
          <button
            type="button"
            onClick={onOpenAtsTab}
            className="mt-1 px-3 py-2 bg-slate-900 text-white text-xs font-bold hover:opacity-90 text-center"
          >
            السيرة الذاتية ATS ←
          </button>
        </div>
      </div>
      {p.bio && <p className="text-sm text-slate-700 leading-relaxed">{p.bio}</p>}
    </div>
  ) : isMinimal ? (
    <div className="pb-6 border-b border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {safeAvatar &&
            renderAvatar('w-14 h-14', 'rounded-2xl border border-slate-200 shadow-xs')}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className="inline-block text-[11px] font-bold tracking-wide"
                style={{ color: accentMeta.hex }}
              >
                الملف التعريفي المهني
              </span>
              {availBadgeLight}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {p.fullName || 'الاسم الكامل'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">{p.jobTitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAtsTab}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-xs font-bold transition-colors shrink-0"
        >
          <span>عرض السيرة الذاتية ATS</span>
        </button>
      </div>
      {p.bio && <p className="text-sm text-slate-700 leading-relaxed max-w-2xl">{p.bio}</p>}
      {renderContactChips(false)}
    </div>
  ) : (
    <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-xs">
      <div className="h-1.5 w-full" style={{ backgroundColor: accentMeta.hex }} />
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {renderAvatar('w-12 h-12', 'rounded-xl text-white text-base shadow-xs', accentMeta.hex)}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-ink">{p.fullName || 'الاسم الكامل'}</h1>
                {availBadgeLight}
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">{p.jobTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAtsTab}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity shrink-0"
            style={{ backgroundColor: accentMeta.hex }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>عرض السيرة الذاتية ATS</span>
          </button>
        </div>
        {p.bio && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.bio}</p>}
        {renderContactChips(false)}
      </div>
    </div>
  );

  const projectsSection =
    d.blocks.projects && data.projects.length > 0 ? (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={sectionHeadingCls}>
            {!isSwiss && (
              <span
                className="w-1.5 h-4 rounded-full"
                style={{ backgroundColor: accentMeta.hex }}
              />
            )}
            <span>{isObsidian ? '~/أبرز المشاريع والأعمال' : 'أبرز المشاريع والأعمال'}</span>
          </h2>
          <span className="text-[11px] text-slate-400">{data.projects.length} أعمال</span>
        </div>
        <div className={useGridProjects ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' : 'space-y-3'}>
          {data.projects.map((proj) => {
            const safeUrl = sanitizeUrl(proj.url);
            const cardCls = isObsidian
              ? 'block bg-[#111827] border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-all'
              : isSwiss
              ? 'block bg-white border border-slate-900 p-4 hover:bg-slate-50 transition-colors'
              : isBento
              ? 'block bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-xs hover:shadow-md transition-all'
              : isMinimal
              ? 'block py-3.5 border-b border-slate-200 hover:bg-slate-50/70 px-2 -mx-2 rounded-xl transition-colors'
              : 'block bg-white border border-line rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm transition-all';

            const cardInner = (
              <>
                {isCreative && (
                  <div
                    className="h-2 rounded-full mb-3 opacity-80"
                    style={{
                      background: `linear-gradient(90deg, ${accentMeta.hex}, transparent)`,
                    }}
                  />
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5"
                      style={{
                        backgroundColor: isObsidian ? `${accentMeta.hex}33` : accentMeta.soft,
                        color: isObsidian ? '#E2E8F0' : accentMeta.hex,
                      }}
                    >
                      {proj.category}
                    </span>
                    <h3
                      className={`text-sm font-bold group-hover:underline ${
                        isObsidian ? 'text-white' : 'text-ink'
                      }`}
                    >
                      {proj.title}
                    </h3>
                  </div>
                  {safeUrl && (
                    <span
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                        isObsidian
                          ? 'bg-slate-800 text-slate-300 group-hover:text-white'
                          : 'bg-slate-50 text-slate-400 group-hover:text-slate-900'
                      }`}
                      aria-hidden="true"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed mt-2 ${
                    isObsidian ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {proj.description}
                </p>
                {proj.impact && (
                  <div
                    className="mt-3 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-start gap-1.5"
                    style={{
                      backgroundColor: isObsidian ? `${accentMeta.hex}25` : accentMeta.soft,
                      color: isObsidian ? '#A7F3D0' : accentMeta.hex,
                    }}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <span>{proj.impact}</span>
                  </div>
                )}
              </>
            );

            return safeUrl ? (
              <a
                key={proj.id}
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group ${cardCls}`}
              >
                {cardInner}
              </a>
            ) : (
              <article key={proj.id} className={cardCls}>
                {cardInner}
              </article>
            );
          })}
        </div>
      </section>
    ) : null;

  const experienceSection =
    d.blocks.experience && data.experience.length > 0 ? (
      <section className="space-y-3">
        <h2 className={sectionHeadingCls}>
          {!isSwiss && (
            <span
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: accentMeta.hex }}
            />
          )}
          <span>{isObsidian ? '~/الخبرات العملية' : 'الخبرات العملية'}</span>
        </h2>
        <div
          className={
            isObsidian
              ? 'bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-5'
              : isSwiss
              ? 'bg-white border border-slate-900 p-4 sm:p-5 space-y-5'
              : isMinimal
              ? 'space-y-4'
              : 'bg-white border border-line rounded-2xl p-4 sm:p-5 space-y-5'
          }
        >
          {data.experience.map((exp, idx) => {
            const bullets = exp.achievements
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean);
            return (
              <div
                key={exp.id}
                className={
                  idx > 0
                    ? `pt-4 border-t ${isObsidian ? 'border-slate-800' : 'border-slate-100'}`
                    : ''
                }
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className={`text-sm font-bold ${isObsidian ? 'text-white' : 'text-ink'}`}>
                      {exp.role}
                    </h3>
                    <div
                      className="text-xs font-medium mt-0.5"
                      style={{ color: isObsidian ? '#93C5FD' : accentMeta.hex }}
                    >
                      {exp.company}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                      isObsidian ? 'text-slate-300 bg-slate-800' : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {exp.period}
                  </span>
                </div>
                {bullets.length > 0 && (
                  <ul
                    className={`mt-2.5 space-y-1.5 text-xs list-disc list-inside ${
                      isObsidian ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {bullets.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    ) : null;

  const skillsSection =
    d.blocks.skills && data.skills.length > 0 ? (
      <section className="space-y-2.5">
        <h2 className={sectionHeadingCls}>
          {!isSwiss && (
            <span
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: accentMeta.hex }}
            />
          )}
          <span>المهارات والتقنيات</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((sk, idx) => (
            <span
              key={`${sk}-${idx}`}
              className={`px-3 py-1.5 text-xs font-semibold border ${
                isSwiss ? 'rounded-none border-slate-900 bg-white text-slate-900' : 'rounded-xl'
              }`}
              style={
                isSwiss
                  ? undefined
                  : isObsidian
                  ? {
                      backgroundColor: '#1E293B',
                      color: '#E2E8F0',
                      borderColor: '#334155',
                    }
                  : {
                      backgroundColor: accentMeta.soft,
                      color: accentMeta.hex,
                      borderColor: `${accentMeta.hex}22`,
                    }
              }
            >
              {sk}
            </span>
          ))}
        </div>
      </section>
    ) : null;

  const educationSection =
    d.blocks.education && data.education.length > 0 ? (
      <section className="space-y-2.5">
        <h2 className={sectionHeadingCls}>
          {!isSwiss && (
            <span
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: accentMeta.hex }}
            />
          )}
          <span>التعليم والشهادات</span>
        </h2>
        <div
          className={
            isObsidian
              ? 'bg-[#111827] border border-slate-800 rounded-2xl p-4 space-y-3'
              : isSwiss
              ? 'bg-white border border-slate-900 p-4 space-y-3'
              : isMinimal
              ? 'space-y-2.5'
              : 'bg-white border border-line rounded-2xl p-4 space-y-3'
          }
        >
          {data.education.map((ed, idx) => (
            <div
              key={ed.id}
              className={`flex flex-wrap items-baseline justify-between gap-2 ${
                idx > 0
                  ? `pt-3 border-t ${isObsidian ? 'border-slate-800' : 'border-slate-100'}`
                  : ''
              }`}
            >
              <div>
                <div className={`text-xs sm:text-sm font-bold ${isObsidian ? 'text-white' : 'text-ink'}`}>
                  {ed.degree}
                </div>
                <div className={`text-xs mt-0.5 ${isObsidian ? 'text-slate-400' : 'text-muted'}`}>
                  {ed.institution}
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                  isObsidian ? 'text-slate-300 bg-slate-800' : 'text-slate-500 bg-slate-100'
                }`}
              >
                {ed.year}
              </span>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const testimonialsSection =
    d.blocks.testimonials && data.testimonials.length > 0 ? (
      <section className="space-y-3">
        <h2 className={sectionHeadingCls}>
          {!isSwiss && (
            <span
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: accentMeta.hex }}
            />
          )}
          <span>آراء وتوصيات مهنية</span>
        </h2>
        <div
          className={`grid grid-cols-1 ${
            viewportMode === 'mobile' ? '' : 'sm:grid-cols-2'
          } gap-3`}
        >
          {data.testimonials.map((t) => (
            <div
              key={t.id}
              className={
                isObsidian
                  ? 'bg-[#111827] border border-slate-800 rounded-2xl p-4 space-y-2.5 flex flex-col justify-between'
                  : isSwiss
                  ? 'bg-white border border-slate-900 p-4 space-y-2.5 flex flex-col justify-between'
                  : 'bg-white border border-line rounded-2xl p-4 space-y-2.5 flex flex-col justify-between'
              }
            >
              <p className={`text-xs leading-relaxed ${isObsidian ? 'text-slate-300' : 'text-slate-700'}`}>
                «{t.quote}»
              </p>
              <div
                className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
                  isObsidian ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div>
                  <div className={`text-xs font-bold ${isObsidian ? 'text-white' : 'text-ink'}`}>
                    {t.name}
                  </div>
                  <div className={`text-[11px] ${isObsidian ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t.role}
                  </div>
                </div>
                {t.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    موثّقة ✓
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const languagesSection =
    d.blocks.languages && data.languages.length > 0 ? (
      <section className="space-y-2.5">
        <h2 className={sectionHeadingCls}>
          {!isSwiss && (
            <span
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: accentMeta.hex }}
            />
          )}
          <span>اللغات</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.languages.map((lg) => (
            <span
              key={lg.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
                isObsidian
                  ? 'bg-[#111827] border-slate-800 text-slate-300'
                  : 'bg-white border-line text-slate-700'
              }`}
            >
              <strong className={`font-bold ${isObsidian ? 'text-white' : 'text-ink'}`}>
                {lg.name}
              </strong>
              <span className="text-slate-400">•</span>
              <span>{lg.level}</span>
            </span>
          ))}
        </div>
      </section>
    ) : null;

  const linksSection =
    d.blocks.links && data.links.length > 0 ? (
      <section className="space-y-2.5">
        <h2 className={sectionHeadingCls}>
          {!isSwiss && (
            <span
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: accentMeta.hex }}
            />
          )}
          <span>تواصل معي</span>
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {data.links.map((lnk) => {
            const safeUrl = sanitizeUrl(lnk.url);
            if (!safeUrl) return null;
            return (
              <a
                key={lnk.id}
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isObsidian
                    ? 'bg-[#111827] border-slate-700 text-white hover:border-slate-500'
                    : 'bg-white border-line hover:border-slate-400 hover:shadow-xs text-ink'
                }`}
              >
                <span>{lnk.label}</span>
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            );
          })}
        </div>
      </section>
    ) : null;

  const portfolioBody = isSidebarPro ? (
    <div className={outerCanvasClass}>
      <div
        className={`grid grid-cols-1 ${
          viewportMode === 'mobile' ? '' : 'sm:grid-cols-12'
        } gap-6 items-start`}
      >
        {/* Executive Sidebar */}
        <aside
          className={`${
            viewportMode === 'mobile' ? '' : 'sm:col-span-4'
          } rounded-2xl p-5 border border-line space-y-5`}
          style={{ backgroundColor: accentMeta.soft }}
        >
          <div className="space-y-3">
            {renderAvatar('w-16 h-16', 'rounded-2xl text-white text-xl shadow-xs', accentMeta.hex)}
            <div>
              <h1 className="text-lg font-bold text-ink">{p.fullName || 'الاسم الكامل'}</h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{p.jobTitle}</p>
            </div>
            {availBadgeLight}
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200/80">
            {p.city && <div>📍 {p.city}</div>}
            {p.email && (
              <div dir="ltr" className="text-right truncate">
                {p.email}
              </div>
            )}
            {!p.hidePhoneInPortfolio && p.phone && (
              <div dir="ltr" className="text-right">
                {p.phone}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenAtsTab}
            className="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95"
            style={{ backgroundColor: accentMeta.hex }}
          >
            السيرة الذاتية ATS
          </button>

          {skillsSection}
          {languagesSection}
          {linksSection}
        </aside>

        {/* Main Column */}
        <div className={`${viewportMode === 'mobile' ? '' : 'sm:col-span-8'} space-y-6`}>
          {p.bio && (
            <div className="bg-white border border-line rounded-2xl p-5">
              <h2 className="text-xs font-bold mb-1.5" style={{ color: accentMeta.hex }}>
                النبذة المهنية
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{p.bio}</p>
            </div>
          )}
          {experienceSection}
          {projectsSection}
          {educationSection}
          {testimonialsSection}
        </div>
      </div>

      <footer className="pt-5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          صُنع عبر منصة <strong className="text-slate-600">بصمة | Basma</strong>
        </span>
        <span>ملف بورتفوليو محلي قابل للتصدير المستقل</span>
      </footer>
    </div>
  ) : (
    <div className={outerCanvasClass}>
      {heroSection}
      {projectsSection}
      {experienceSection}
      {skillsSection}
      {educationSection}
      {testimonialsSection}
      {languagesSection}
      {linksSection}

      <footer
        className={`pt-5 border-t flex items-center justify-between text-[11px] ${
          isObsidian
            ? 'border-slate-800 text-slate-400'
            : 'border-slate-200/80 text-slate-400'
        }`}
      >
        <span>
          صُنع عبر منصة{' '}
          <strong className={isObsidian ? 'text-slate-200' : 'text-slate-600'}>
            بصمة | Basma
          </strong>
        </span>
        <span>ملف بورتفوليو محلي قابل للتصدير المستقل</span>
      </footer>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="bg-white border border-line rounded-2xl shadow-md overflow-hidden flex flex-col">
        {/* Clean Preview Header Bar (No fake basma.app/username or publish toggle) */}
        <div className="bg-slate-50 border-b border-line px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 shrink-0" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-ink truncate max-w-[180px]">{versionName}</span>
              <span className="text-[11px] text-muted hidden sm:inline">• معاينة حية</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className="hidden sm:inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5"
              role="group"
              aria-label="حجم شاشة المعاينة"
            >
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewportMode === 'desktop'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-ink'
                }`}
                title="معاينة سطح المكتب"
                aria-label="معاينة سطح المكتب"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewportMode === 'mobile'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-ink'
                }`}
                title="معاينة الجوال"
                aria-label="معاينة الجوال"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={onExportStandaloneHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>تصدير HTML مستقل</span>
            </button>
          </div>
        </div>

        {/* Live Canvas */}
        <div className="bg-slate-50/40 min-h-[540px] max-h-[calc(100vh-200px)] overflow-y-auto">
          {viewportMode === 'mobile' ? (
            <div className="py-5 px-3 flex justify-center bg-slate-100/80 min-h-full">
              <div className="w-full max-w-[390px] bg-slate-50 rounded-[28px] border-[6px] border-slate-800 shadow-xl overflow-hidden">
                <div className="bg-slate-800 py-1.5 flex justify-center">
                  <span className="w-16 h-1 rounded-full bg-slate-600" />
                </div>
                {portfolioBody}
              </div>
            </div>
          ) : (
            portfolioBody
          )}
        </div>
      </div>
    </div>
  );
};
