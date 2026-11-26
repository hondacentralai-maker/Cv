import React from 'react';
import { PRESET_LIST } from '../../data/presets';
import type { PresetId } from '../../types/portfolio';

interface PresetBarProps {
  activePresetId: PresetId;
  onSelectPreset: (presetId: PresetId) => void;
}

export const PresetBar: React.FC<PresetBarProps> = ({ activePresetId, onSelectPreset }) => {
  return (
    <div className="bg-white border border-line rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">
              قوالب جاهزة لـ 8 مجالات مهنية (قابلة للتعديل بالكامل)
            </h2>
            <p className="text-xs text-muted">
              اختر مجالك لتعبئة السيرة والبورتفوليو بمحتوى احترافي جاهز، ثم عدّل كل كلمة بسهولة
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <span>مع مساعد كتابة CV ذكي</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESET_LIST.map((item) => {
          const active = activePresetId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPreset(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                active
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              style={active ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
