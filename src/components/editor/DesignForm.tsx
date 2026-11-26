import React from 'react';
import { ACCENT_OPTIONS, LAYOUT_PRESETS } from '../../data/presets';
import type { BlocksConfig, DesignConfig } from '../../types/portfolio';

interface DesignFormProps {
  design: DesignConfig;
  onChange: (nextDesign: DesignConfig) => void;
}

const BLOCK_ITEMS: { key: keyof BlocksConfig; label: string; desc: string }[] = [
  { key: 'projects', label: 'المشاريع والأعمال', desc: 'عرض أبرز أعمالك ونتائجها القابلة للقياس' },
  { key: 'experience', label: 'الخبرات العملية', desc: 'السجل المهني وأبرز الإنجازات في كل منصب' },
  { key: 'skills', label: 'المهارات والتقنيات', desc: 'وسوم المهارات الرئيسية لتخصصك' },
  { key: 'education', label: 'التعليم والشهادات', desc: 'المؤهلات الأكاديمية والاعتمادات المهنية' },
  { key: 'testimonials', label: 'آراء وتوصيات العملاء', desc: 'إثبات موثوقية عبر شهادات مدراء وعملاء سابقين' },
  { key: 'languages', label: 'اللغات ومستوى الإتقان', desc: 'إظهار اللغات التي تتقنها في البورتفوليو' },
  { key: 'links', label: 'روابط التواصل', desc: 'أزرار الوصول السريع لحساباتك وواتساب' },
];

export const DesignForm: React.FC<DesignFormProps> = ({ design, onChange }) => {
  return (
    <div className="space-y-5">
      {/* Layout Presets */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-ink">اختر قالب العرض</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {LAYOUT_PRESETS.map((tpl) => {
            const active = design.template === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChange({ ...design, template: tpl.id })}
                className={`text-right p-3 rounded-xl border transition-all ${
                  active
                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                    : 'bg-white border-line hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-ink">{tpl.name}</span>
                  {active && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </div>
                <p className="text-[11px] text-muted leading-snug">{tpl.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Swatches */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-ink">اللون الأساسي للهوية</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          {ACCENT_OPTIONS.map((c) => {
            const active = design.accent === c.hex;
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange({ ...design, accent: c.hex })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  active
                    ? 'border-slate-900 bg-slate-50 font-bold text-ink'
                    : 'border-line bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white"
                  style={{ backgroundColor: c.hex }}
                >
                  {active && (
                    <svg
                      className="w-2.5 h-2.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modular Blocks Toggle Switches */}
      <div className="space-y-2.5">
        <div>
          <h3 className="text-sm font-bold text-ink">الأقسام المرنة (Modular Blocks)</h3>
          <p className="text-xs text-muted mt-0.5">أظهر أو أخفِ الأقسام حسب طبيعة مهنتك</p>
        </div>
        <div className="space-y-2">
          {BLOCK_ITEMS.map((b) => {
            const on = Boolean(design.blocks[b.key]);
            return (
              <label
                key={b.key}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-line bg-white hover:bg-slate-50/70 cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-ink">{b.label}</div>
                  <div className="text-[11px] text-muted">{b.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) =>
                    onChange({
                      ...design,
                      blocks: { ...design.blocks, [b.key]: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded accent-teal-700 cursor-pointer shrink-0"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
