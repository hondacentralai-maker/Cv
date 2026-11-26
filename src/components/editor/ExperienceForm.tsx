import React, { useState } from 'react';
import { moveArrayItem, PRESET_LIST } from '../../data/presets';
import { getActiveWritingAssist } from '../../data/writingAssist';
import type { EducationItem, ExperienceItem, PresetId } from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';

interface ExperienceFormProps {
  experience: ExperienceItem[];
  education: EducationItem[];
  presetId: PresetId;
  onChangeExperience: (next: ExperienceItem[], ensureBlockVisible?: boolean) => void;
  onChangeEducation: (next: EducationItem[]) => void;
}

interface ExpDraft {
  role: string;
  company: string;
  period: string;
  achievements: string;
}

const EMPTY_EXP: ExpDraft = { role: '', company: '', period: '', achievements: '' };

interface EduDraft {
  degree: string;
  institution: string;
  year: string;
}

const EMPTY_EDU: EduDraft = { degree: '', institution: '', year: '' };

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  education,
  presetId,
  onChangeExperience,
  onChangeEducation,
}) => {
  const { showToast } = useToast();
  const assist = getActiveWritingAssist(presetId);
  const presetLabel = PRESET_LIST.find((x) => x.id === presetId)?.label ?? PRESET_LIST[0]!.label;

  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDraft, setEditExpDraft] = useState<ExpDraft>(EMPTY_EXP);
  const [newExpDraft, setNewExpDraft] = useState<ExpDraft>(EMPTY_EXP);

  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [editEduDraft, setEditEduDraft] = useState<EduDraft>(EMPTY_EDU);
  const [newEduDraft, setNewEduDraft] = useState<EduDraft>(EMPTY_EDU);

  const renderAchievementBank = (onAppend: (phrase: string) => void) => (
    <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
      <span className="block text-[11px] font-bold text-teal-900">
        بنك عبارات الإنجازات لمجال ({presetLabel}) — اضغط لإضافتها:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {assist.achievementPhrases.map((ph) => (
          <button
            key={ph}
            type="button"
            onClick={() => {
              onAppend(ph);
              showToast('تمت إضافة عبارة الإنجاز — يمكنك تعديل الأرقام بين الأقواس');
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-700 hover:text-white text-teal-900 border border-teal-200 text-[10px] font-medium transition-colors text-right"
          >
            + {ph}
          </button>
        ))}
      </div>
    </div>
  );

  const appendLine = (current: string, addition: string) => {
    const trimmed = current.trim();
    return trimmed ? `${trimmed}\n${addition}` : addition;
  };

  const handleSaveExpEdit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editExpDraft.role.trim() || !editExpDraft.company.trim()) return;
    onChangeExperience(
      experience.map((x) =>
        x.id === id
          ? {
              ...x,
              role: editExpDraft.role.trim(),
              company: editExpDraft.company.trim(),
              period: editExpDraft.period.trim(),
              achievements: editExpDraft.achievements.trim(),
            }
          : x
      )
    );
    setEditingExpId(null);
    showToast('تم حفظ تعديلات الخبرة العملية بنجاح');
  };

  const handleAddExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDraft.role.trim() || !newExpDraft.company.trim()) return;
    const item: ExperienceItem = {
      id: `e_${Date.now()}`,
      role: newExpDraft.role.trim(),
      company: newExpDraft.company.trim(),
      period: newExpDraft.period.trim(),
      achievements: newExpDraft.achievements.trim(),
    };
    onChangeExperience([item, ...experience], true);
    setNewExpDraft(EMPTY_EXP);
    showToast('تمت إضافة الخبرة العملية بنجاح');
  };

  const handleSaveEduEdit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editEduDraft.degree.trim() || !editEduDraft.institution.trim()) return;
    onChangeEducation(
      education.map((x) =>
        x.id === id
          ? {
              ...x,
              degree: editEduDraft.degree.trim(),
              institution: editEduDraft.institution.trim(),
              year: editEduDraft.year.trim(),
            }
          : x
      )
    );
    setEditingEduId(null);
    showToast('تم حفظ تعديل المؤهل بنجاح');
  };

  const handleAddEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEduDraft.degree.trim() || !newEduDraft.institution.trim()) return;
    const item: EducationItem = {
      id: `ed_${Date.now()}`,
      degree: newEduDraft.degree.trim(),
      institution: newEduDraft.institution.trim(),
      year: newEduDraft.year.trim(),
    };
    onChangeEducation([...education, item]);
    setNewEduDraft(EMPTY_EDU);
    showToast('تمت إضافة المؤهل بنجاح');
  };

  return (
    <div className="space-y-5">
      {/* Before / After CV Writing Coach Card */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
        <div className="text-xs font-bold text-ink flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-teal-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span>دليل الكتابة الذكي (كيف تكتب إنجازاً يجتاز ATS؟)</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-[11px] leading-relaxed">
          <div className="px-2.5 py-1.5 rounded-lg bg-rose-50/80 border border-rose-200/70 text-rose-900">
            <strong>❌ تجنّب الوصف العام:</strong> {assist.mistakeExample.bad}
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-emerald-900">
            <strong>✅ اكتب بأسلوب النتيجة والرقم:</strong> {assist.mistakeExample.good}
          </div>
        </div>
      </div>

      {/* Work Experience */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-ink">
            الخبرات العملية والتدريب ({experience.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">
            اضغط «تعديل» لتغيير أي خبرة أو استخدم بنك العبارات بالأسفل لصياغة إنجازاتك
          </p>
        </div>

        <div className="space-y-2.5">
          {experience.map((exp, eIdx) => {
            if (editingExpId === exp.id) {
              return (
                <form
                  key={exp.id}
                  onSubmit={(e) => handleSaveExpEdit(e, exp.id)}
                  className="p-4 rounded-xl border-2 border-teal-600 bg-white space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">تعديل الخبرة العملية</span>
                    <button
                      type="button"
                      onClick={() => setEditingExpId(null)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editExpDraft.role}
                    onChange={(e) => setEditExpDraft({ ...editExpDraft, role: e.target.value })}
                    placeholder="المسمى الوظيفي *"
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      value={editExpDraft.company}
                      onChange={(e) =>
                        setEditExpDraft({ ...editExpDraft, company: e.target.value })
                      }
                      placeholder="اسم الجهة / الشركة *"
                      className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                    />
                    <input
                      type="text"
                      required
                      value={editExpDraft.period}
                      onChange={(e) =>
                        setEditExpDraft({ ...editExpDraft, period: e.target.value })
                      }
                      placeholder="الفترة *"
                      className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={editExpDraft.achievements}
                    onChange={(e) =>
                      setEditExpDraft({ ...editExpDraft, achievements: e.target.value })
                    }
                    placeholder="أبرز الإنجازات (كل إنجاز في سطر منفصل) *"
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs leading-relaxed focus:outline-none focus:border-teal-600"
                  />
                  {renderAchievementBank((ph) =>
                    setEditExpDraft({
                      ...editExpDraft,
                      achievements: appendLine(editExpDraft.achievements, ph),
                    })
                  )}
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
                      onClick={() => setEditingExpId(null)}
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
                key={exp.id}
                className="p-3.5 rounded-xl border border-line bg-slate-50/60 flex items-start justify-between gap-2"
              >
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-bold text-ink">{exp.role}</div>
                  <div className="text-[11px] text-muted">
                    {exp.company} • {exp.period}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={eIdx === 0}
                    onClick={() => onChangeExperience(moveArrayItem(experience, eIdx, -1))}
                    className="p-1 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-200/70 disabled:opacity-30 transition-colors"
                    title="تحريك لأعلى"
                    aria-label={`تحريك ${exp.role} لأعلى`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={eIdx === experience.length - 1}
                    onClick={() => onChangeExperience(moveArrayItem(experience, eIdx, 1))}
                    className="p-1 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-200/70 disabled:opacity-30 transition-colors"
                    title="تحريك لأسفل"
                    aria-label={`تحريك ${exp.role} لأسفل`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpId(exp.id);
                      setEditExpDraft({
                        role: exp.role,
                        company: exp.company,
                        period: exp.period,
                        achievements: exp.achievements,
                      });
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title="تعديل الخبرة"
                    aria-label={`تعديل ${exp.role}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingExpId === exp.id) setEditingExpId(null);
                      onChangeExperience(experience.filter((x) => x.id !== exp.id));
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف الخبرة"
                    aria-label={`حذف ${exp.role}`}
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

        <form
          onSubmit={handleAddExp}
          className="p-4 rounded-xl border border-line bg-white space-y-2.5"
        >
          <div className="text-xs font-bold text-ink">إضافة خبرة عملية أو تدريب جديد</div>
          <input
            type="text"
            required
            value={newExpDraft.role}
            onChange={(e) => setNewExpDraft({ ...newExpDraft, role: e.target.value })}
            placeholder="المسمى الوظيفي *"
            className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              value={newExpDraft.company}
              onChange={(e) => setNewExpDraft({ ...newExpDraft, company: e.target.value })}
              placeholder="اسم الجهة / الشركة *"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
            />
            <input
              type="text"
              required
              value={newExpDraft.period}
              onChange={(e) => setNewExpDraft({ ...newExpDraft, period: e.target.value })}
              placeholder="الفترة (مثال: 2022 – 2025) *"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
            />
          </div>
          <textarea
            rows={3}
            required
            value={newExpDraft.achievements}
            onChange={(e) => setNewExpDraft({ ...newExpDraft, achievements: e.target.value })}
            placeholder="أبرز الإنجازات (ضع كل إنجاز في سطر منفصل، أو اختر من العبارات الجاهزة بالأسفل) *"
            className="w-full px-3 py-2 rounded-xl border border-line text-xs leading-relaxed focus:outline-none focus:border-teal-600"
          />
          {renderAchievementBank((ph) =>
            setNewExpDraft({
              ...newExpDraft,
              achievements: appendLine(newExpDraft.achievements, ph),
            })
          )}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            إضافة الخبرة العملية
          </button>
        </form>
      </div>

      {/* Education & Certifications */}
      <div className="space-y-3 pt-4 border-t border-line">
        <h3 className="text-sm font-bold text-ink">
          التعليم والشهادات المهنية ({education.length})
        </h3>
        <div className="space-y-2">
          {education.map((edu) => {
            if (editingEduId === edu.id) {
              return (
                <form
                  key={edu.id}
                  onSubmit={(e) => handleSaveEduEdit(e, edu.id)}
                  className="p-3.5 rounded-xl border-2 border-teal-600 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">تعديل المؤهل / الشهادة</span>
                    <button
                      type="button"
                      onClick={() => setEditingEduId(null)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editEduDraft.degree}
                    onChange={(e) => setEditEduDraft({ ...editEduDraft, degree: e.target.value })}
                    placeholder="الدرجة أو الشهادة"
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={editEduDraft.institution}
                      onChange={(e) =>
                        setEditEduDraft({ ...editEduDraft, institution: e.target.value })
                      }
                      placeholder="الجامعة / الجهة"
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                    />
                    <input
                      type="text"
                      required
                      value={editEduDraft.year}
                      onChange={(e) => setEditEduDraft({ ...editEduDraft, year: e.target.value })}
                      placeholder="السنة"
                      className="px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>
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
                key={edu.id}
                className="p-3 rounded-xl border border-line bg-slate-50/60 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-ink">{edu.degree}</div>
                  <div className="text-[11px] text-muted">
                    {edu.institution} • {edu.year}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEduId(edu.id);
                      setEditEduDraft({
                        degree: edu.degree,
                        institution: edu.institution,
                        year: edu.year,
                      });
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    title="تعديل المؤهل"
                    aria-label={`تعديل ${edu.degree}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingEduId === edu.id) setEditingEduId(null);
                      onChangeEducation(education.filter((x) => x.id !== edu.id));
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف المؤهل"
                    aria-label={`حذف ${edu.degree}`}
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

        <form onSubmit={handleAddEdu} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            required
            value={newEduDraft.degree}
            onChange={(e) => setNewEduDraft({ ...newEduDraft, degree: e.target.value })}
            placeholder="الدرجة أو الشهادة"
            className="sm:col-span-5 px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <input
            type="text"
            required
            value={newEduDraft.institution}
            onChange={(e) => setNewEduDraft({ ...newEduDraft, institution: e.target.value })}
            placeholder="الجامعة / الجهة"
            className="sm:col-span-4 px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <input
            type="text"
            required
            value={newEduDraft.year}
            onChange={(e) => setNewEduDraft({ ...newEduDraft, year: e.target.value })}
            placeholder="السنة"
            className="sm:col-span-3 px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <button
            type="submit"
            className="sm:col-span-12 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            + إضافة مؤهل أو شهادة
          </button>
        </form>
      </div>
    </div>
  );
};
