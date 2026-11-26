import React from 'react';
import { sanitizeUrl } from '../../lib/sanitize';
import type { PortfolioData } from '../../types/portfolio';

interface AtsSheetProps {
  data: PortfolioData;
}

export const AtsSheet: React.FC<AtsSheetProps> = ({ data }) => {
  const p = data.profile;
  const safePrimaryLink = sanitizeUrl(p.primaryPortfolioLink);

  const contactParts = [p.city, p.email, p.phone, safePrimaryLink]
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <article
      id="ats-print-sheet"
      className="ats-paper rounded-2xl p-6 sm:p-10 md:p-12 mx-auto max-w-[820px]"
    >
      {/* ATS Header: Pure text, single column, zero graphics */}
      <header className="pb-4 border-b-2 border-black">
        <h1 className="text-2xl font-bold text-black tracking-tight">
          {p.fullName || 'الاسم الكامل'}
        </h1>
        {p.jobTitle && (
          <p className="text-sm font-semibold text-neutral-800 mt-1">{p.jobTitle}</p>
        )}
        {contactParts.length > 0 && (
          <p className="text-xs text-neutral-800 mt-2 leading-relaxed flex flex-wrap gap-x-2 gap-y-1">
            {contactParts.map((part, idx) => (
              <React.Fragment key={`${part}-${idx}`}>
                {idx > 0 && <span aria-hidden="true">|</span>}
                <span dir={part.includes('@') || part.startsWith('http') || part.startsWith('+') ? 'ltr' : undefined}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </p>
        )}
      </header>

      {/* Professional Summary */}
      {p.bio.trim() && (
        <section className="mt-5">
          <h2 className="text-sm font-bold text-black pb-1 border-b border-neutral-400">
            الملخص المهني
          </h2>
          <p className="text-xs sm:text-[13px] text-neutral-900 mt-2 leading-relaxed">
            {p.bio}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {data.experience.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-bold text-black pb-1 border-b border-neutral-400">
            الخبرات العملية
          </h2>
          <div className="mt-2.5 space-y-4">
            {data.experience.map((exp) => {
              const bullets = exp.achievements
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean);
              return (
                <div key={exp.id} className="ats-section-item">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[13px] font-bold text-black">
                      {exp.role} — {exp.company}
                    </h3>
                    <span className="text-xs font-medium text-neutral-700">{exp.period}</span>
                  </div>
                  {bullets.length > 0 && (
                    <ul className="mt-1.5 space-y-1 text-xs sm:text-[13px] text-neutral-900 list-disc pr-5">
                      {bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Key Projects */}
      {data.projects.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-bold text-black pb-1 border-b border-neutral-400">
            أبرز المشاريع
          </h2>
          <div className="mt-2.5 space-y-3">
            {data.projects.map((proj) => (
              <div key={proj.id} className="ats-section-item">
                <h3 className="text-[13px] font-bold text-black">
                  {proj.title} ({proj.category})
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-900 mt-0.5 leading-relaxed">
                  {proj.description}
                </p>
                {proj.impact.trim() && (
                  <p className="text-xs sm:text-[13px] text-black font-semibold mt-0.5">
                    الأثر المحقق: {proj.impact}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mt-5 ats-section-item">
          <h2 className="text-sm font-bold text-black pb-1 border-b border-neutral-400">
            المهارات التقنية والمهنية
          </h2>
          <p className="text-xs sm:text-[13px] text-neutral-900 mt-2 leading-relaxed">
            {data.skills.join(' • ')}
          </p>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mt-5 ats-section-item">
          <h2 className="text-sm font-bold text-black pb-1 border-b border-neutral-400">
            التعليم والشهادات
          </h2>
          <ul className="mt-2 space-y-1.5 text-xs sm:text-[13px] text-neutral-900">
            {data.education.map((ed) => (
              <li key={ed.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span>
                  <strong>{ed.degree}</strong> — {ed.institution}
                </span>
                <span className="text-xs text-neutral-700">{ed.year}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <section className="mt-5 ats-section-item">
          <h2 className="text-sm font-bold text-black pb-1 border-b border-neutral-400">
            اللغات
          </h2>
          <p className="text-xs sm:text-[13px] text-neutral-900 mt-2 leading-relaxed">
            {data.languages.map((lg) => `${lg.name} (${lg.level})`).join(' • ')}
          </p>
        </section>
      )}
    </article>
  );
};
