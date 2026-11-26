import React, { useState } from 'react';
import { moveArrayItem } from '../../data/presets';
import { getActiveWritingAssist } from '../../data/writingAssist';
import { isSafeLinkOrEmpty, sanitizeUrl } from '../../lib/sanitize';
import type { PresetId, ProjectItem } from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';

interface ProjectsFormProps {
  projects: ProjectItem[];
  presetId: PresetId;
  onChange: (nextProjects: ProjectItem[], ensureBlockVisible?: boolean) => void;
}

interface ProjectDraft {
  title: string;
  category: string;
  description: string;
  impact: string;
  url: string;
}

const EMPTY_DRAFT: ProjectDraft = {
  title: '',
  category: '',
  description: '',
  impact: '',
  url: '',
};

export const ProjectsForm: React.FC<ProjectsFormProps> = ({
  projects,
  presetId,
  onChange,
}) => {
  const { showToast } = useToast();
  const assist = getActiveWritingAssist(presetId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProjectDraft>(EMPTY_DRAFT);
  const [newDraft, setNewDraft] = useState<ProjectDraft>(EMPTY_DRAFT);

  const renderImpactHelper = (onSelectPhrase: (phrase: string) => void) => (
    <div className="pt-1 space-y-1.5">
      <span className="block text-[11px] font-semibold text-teal-800">
        صيغ أثر رقمي جاهزة (اضغط للتعبئة):
      </span>
      <div className="flex flex-wrap gap-1.5">
        {assist.impactPhrases.map((ph) => (
          <button
            key={ph}
            type="button"
            onClick={() => {
              onSelectPhrase(ph);
              showToast('تمت تعبئة صيغة الأثر الرقمي — يمكنك تعديل الأرقام الآن');
            }}
            className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-900 border border-teal-200/80 text-[10px] font-medium transition-colors text-right"
          >
            + {ph}
          </button>
        ))}
      </div>
    </div>
  );

  const startEdit = (proj: ProjectItem) => {
    setEditingId(proj.id);
    setEditDraft({
      title: proj.title,
      category: proj.category,
      description: proj.description,
      impact: proj.impact,
      url: proj.url,
    });
  };

  const handleSaveEdit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editDraft.title.trim() || !editDraft.description.trim()) return;
    if (!isSafeLinkOrEmpty(editDraft.url)) {
      showToast('رابط المشروع يجب أن يبدأ بـ https:// أو http://', 'amber');
      return;
    }

    const safeUrl = sanitizeUrl(editDraft.url);
    const next = projects.map((p) =>
      p.id === id
        ? {
            ...p,
            title: editDraft.title.trim(),
            category: editDraft.category.trim() || 'مشروع مهني',
            description: editDraft.description.trim(),
            impact: editDraft.impact.trim(),
            url: safeUrl,
          }
        : p
    );
    onChange(next);
    setEditingId(null);
    showToast('تم حفظ تعديلات المشروع بنجاح');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraft.title.trim() || !newDraft.description.trim()) return;
    if (!isSafeLinkOrEmpty(newDraft.url)) {
      showToast('رابط المشروع يجب أن يبدأ بـ https:// أو http://', 'amber');
      return;
    }

    const created: ProjectItem = {
      id: `p_${Date.now()}`,
      title: newDraft.title.trim(),
      category: newDraft.category.trim() || 'مشروع مهني',
      description: newDraft.description.trim(),
      impact: newDraft.impact.trim(),
      url: sanitizeUrl(newDraft.url),
    };

    onChange([created, ...projects], true);
    setNewDraft(EMPTY_DRAFT);
    showToast(`تمت إضافة مشروع «${created.title}» بنجاح`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-ink">إدارة المشاريع والأعمال ({projects.length})</h3>
        <p className="text-xs text-muted mt-0.5">
          اضغط «تعديل» لتغيير أي مشروع جاهز أو أضف مشروعاً جديداً بالأسفل
        </p>
      </div>

      {/* Existing Projects */}
      <div className="space-y-2.5">
        {projects.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-muted">
            لا توجد مشاريع بعد — أضف أول مشروع بالأسفل
          </div>
        ) : (
          projects.map((proj, pIdx) => {
            if (editingId === proj.id) {
              return (
                <form
                  key={proj.id}
                  onSubmit={(e) => handleSaveEdit(e, proj.id)}
                  className="p-4 rounded-xl border-2 border-teal-600 bg-white space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">تعديل المشروع</span>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      value={editDraft.title}
                      onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                      placeholder="عنوان المشروع *"
                      className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                    />
                    <input
                      type="text"
                      value={editDraft.category}
                      onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                      placeholder="التصنيف"
                      className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={editDraft.description}
                    onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                    placeholder="وصف المشروع *"
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                  />
                  <input
                    type="text"
                    value={editDraft.impact}
                    onChange={(e) => setEditDraft({ ...editDraft, impact: e.target.value })}
                    placeholder="النتيجة / الأثر الرقمي"
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                  />
                  {renderImpactHelper((ph) => setEditDraft({ ...editDraft, impact: ph }))}
                  <input
                    type="url"
                    dir="ltr"
                    spellCheck={false}
                    value={editDraft.url}
                    onChange={(e) => setEditDraft({ ...editDraft, url: e.target.value })}
                    placeholder="https://project-link.com"
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs text-left focus:outline-none focus:border-teal-600"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      حفظ التعديلات
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={proj.id}
                className="p-3.5 rounded-xl border border-line bg-slate-50/60 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-ink">{proj.title}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-line text-[10px] font-semibold text-slate-600">
                      {proj.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>
                  {proj.impact && (
                    <div className="text-[11px] font-semibold text-teal-800">
                      الأثر: {proj.impact}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={pIdx === 0}
                    onClick={() => onChange(moveArrayItem(projects, pIdx, -1))}
                    className="p-1 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-200/70 disabled:opacity-30 transition-colors"
                    title="تحريك لأعلى"
                    aria-label={`تحريك ${proj.title} لأعلى`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={pIdx === projects.length - 1}
                    onClick={() => onChange(moveArrayItem(projects, pIdx, 1))}
                    className="p-1 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-200/70 disabled:opacity-30 transition-colors"
                    title="تحريك لأسفل"
                    aria-label={`تحريك ${proj.title} لأسفل`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(proj)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title="تعديل المشروع"
                    aria-label={`تعديل ${proj.title}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingId === proj.id) setEditingId(null);
                      onChange(projects.filter((p) => p.id !== proj.id));
                      showToast('تم حذف المشروع');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف المشروع"
                    aria-label={`حذف ${proj.title}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Project Form */}
      <form
        onSubmit={handleAddProject}
        className="p-4 rounded-xl border border-line bg-white space-y-3"
      >
        <div className="text-xs font-bold text-ink flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            style={{ color: 'var(--accent)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
          <span>إضافة مشروع جديد</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            required
            value={newDraft.title}
            onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })}
            placeholder="عنوان المشروع *"
            className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <input
            type="text"
            value={newDraft.category}
            onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value })}
            placeholder="التصنيف (مثال: تطبيق، دراسة حالة)"
            className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
        </div>
        <textarea
          rows={2}
          required
          value={newDraft.description}
          onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })}
          placeholder="وصف مختصر لما قمت بتنفيذه *"
          className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
        />
        <input
          type="text"
          value={newDraft.impact}
          onChange={(e) => setNewDraft({ ...newDraft, impact: e.target.value })}
          placeholder="النتيجة / الأثر الرقمي (مثال: زيادة المبيعات 35%)"
          className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
        />
        {renderImpactHelper((ph) => setNewDraft({ ...newDraft, impact: ph }))}
        <input
          type="url"
          dir="ltr"
          spellCheck={false}
          value={newDraft.url}
          onChange={(e) => setNewDraft({ ...newDraft, url: e.target.value })}
          placeholder="https://project-link.com"
          className="w-full px-3 py-2 rounded-xl border border-line text-xs text-left focus:outline-none focus:border-teal-600"
        />
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          إضافة المشروع للبورتفوليو
        </button>
      </form>
    </div>
  );
};
