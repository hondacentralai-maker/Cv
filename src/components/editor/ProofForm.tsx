import React, { useState } from 'react';
import { LANGUAGE_LEVELS } from '../../data/presets';
import { sanitizeUrl } from '../../lib/sanitize';
import type {
  AwardItem,
  CertificateItem,
  LanguageItem,
  TestimonialItem,
  VolunteerItem,
} from '../../types/portfolio';
import { useToast } from '../layout/ToastProvider';

interface ProofFormProps {
  testimonials: TestimonialItem[];
  languages: LanguageItem[];
  certificates: CertificateItem[];
  awards: AwardItem[];
  volunteer: VolunteerItem[];
  onChangeTestimonials: (next: TestimonialItem[], ensureBlockVisible?: boolean) => void;
  onChangeLanguages: (next: LanguageItem[], ensureBlockVisible?: boolean) => void;
  onChangeCertificates: (next: CertificateItem[], ensureBlockVisible?: boolean) => void;
  onChangeAwards: (next: AwardItem[], ensureBlockVisible?: boolean) => void;
  onChangeVolunteer: (next: VolunteerItem[], ensureBlockVisible?: boolean) => void;
}

interface TestDraft {
  name: string;
  role: string;
  quote: string;
  verified: boolean;
}

const EMPTY_TEST: TestDraft = { name: '', role: '', quote: '', verified: true };

export const ProofForm: React.FC<ProofFormProps> = ({
  testimonials,
  languages,
  certificates,
  awards,
  volunteer,
  onChangeTestimonials,
  onChangeLanguages,
  onChangeCertificates,
  onChangeAwards,
  onChangeVolunteer,
}) => {
  const { showToast } = useToast();

  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editTestDraft, setEditTestDraft] = useState<TestDraft>(EMPTY_TEST);
  const [newTestDraft, setNewTestDraft] = useState<TestDraft>(EMPTY_TEST);

  const [newLangName, setNewLangName] = useState('');
  const [newLangLevel, setNewLangLevel] = useState(LANGUAGE_LEVELS[1] ?? 'متقدم / طليق');

  const [certDraft, setCertDraft] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
    url: '',
  });
  const [awardDraft, setAwardDraft] = useState({
    title: '',
    awarder: '',
    date: '',
    summary: '',
  });
  const [volDraft, setVolDraft] = useState({
    role: '',
    organization: '',
    period: '',
    summary: '',
  });

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certDraft.name.trim() || !certDraft.issuer.trim()) return;
    const item: CertificateItem = {
      id: `cert_${Date.now()}`,
      name: certDraft.name.trim(),
      issuer: certDraft.issuer.trim(),
      date: certDraft.date.trim(),
      credentialId: certDraft.credentialId.trim(),
      url: sanitizeUrl(certDraft.url),
    };
    onChangeCertificates([...certificates, item], true);
    setCertDraft({ name: '', issuer: '', date: '', credentialId: '', url: '' });
    showToast(`تمت إضافة الشهادة المهنية «${item.name}»`);
  };

  const handleAddAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardDraft.title.trim()) return;
    const item: AwardItem = {
      id: `aw_${Date.now()}`,
      title: awardDraft.title.trim(),
      awarder: awardDraft.awarder.trim(),
      date: awardDraft.date.trim(),
      summary: awardDraft.summary.trim(),
    };
    onChangeAwards([...awards, item], true);
    setAwardDraft({ title: '', awarder: '', date: '', summary: '' });
    showToast('تمت إضافة الجائزة / التكريم بنجاح');
  };

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volDraft.role.trim() || !volDraft.organization.trim()) return;
    const item: VolunteerItem = {
      id: `vol_${Date.now()}`,
      role: volDraft.role.trim(),
      organization: volDraft.organization.trim(),
      period: volDraft.period.trim(),
      summary: volDraft.summary.trim(),
    };
    onChangeVolunteer([...volunteer, item], true);
    setVolDraft({ role: '', organization: '', period: '', summary: '' });
    showToast('تمت إضافة الخبرة التطوعية بنجاح');
  };

  const handleSaveEditTest = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editTestDraft.name.trim() || !editTestDraft.quote.trim()) return;
    onChangeTestimonials(
      testimonials.map((t) =>
        t.id === id
          ? {
              ...t,
              name: editTestDraft.name.trim(),
              role: editTestDraft.role.trim(),
              quote: editTestDraft.quote.trim(),
              verified: editTestDraft.verified,
            }
          : t
      )
    );
    setEditingTestId(null);
    showToast('تم حفظ تعديل التوصية بنجاح');
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestDraft.name.trim() || !newTestDraft.quote.trim()) return;
    const item: TestimonialItem = {
      id: `t_${Date.now()}`,
      name: newTestDraft.name.trim(),
      role: newTestDraft.role.trim(),
      quote: newTestDraft.quote.trim(),
      verified: newTestDraft.verified,
    };
    onChangeTestimonials([item, ...testimonials], true);
    setNewTestDraft(EMPTY_TEST);
    showToast('تمت إضافة التوصية بنجاح');
  };

  const handleAddLang = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newLangName.trim();
    if (!name) return;
    const item: LanguageItem = {
      id: `lg_${Date.now()}`,
      name,
      level: newLangLevel,
    };
    onChangeLanguages([...languages, item], true);
    setNewLangName('');
    showToast(`تمت إضافة اللغة «${name}»`);
  };

  return (
    <div className="space-y-5">
      {/* Verified Testimonials */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-ink">
            آراء وتوصيات العملاء والمدراء ({testimonials.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">
            إضافة توصية حقيقية ترفع ثقة أصحاب العمل والعملاء في كفاءتك بشكل مضاعف
          </p>
        </div>

        <div className="space-y-2.5">
          {testimonials.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-muted">
              لا توجد توصيات بعد — أضف شهادة مدير أو عميل سابق بالأسفل
            </div>
          ) : (
            testimonials.map((t) => {
              if (editingTestId === t.id) {
                return (
                  <form
                    key={t.id}
                    onSubmit={(e) => handleSaveEditTest(e, t.id)}
                    className="p-4 rounded-xl border-2 border-teal-600 bg-white space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-800">تعديل التوصية</span>
                      <button
                        type="button"
                        onClick={() => setEditingTestId(null)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                      >
                        إلغاء
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={editTestDraft.name}
                        onChange={(e) =>
                          setEditTestDraft({ ...editTestDraft, name: e.target.value })
                        }
                        placeholder="اسم الموصي *"
                        className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                      />
                      <input
                        type="text"
                        required
                        value={editTestDraft.role}
                        onChange={(e) =>
                          setEditTestDraft({ ...editTestDraft, role: e.target.value })
                        }
                        placeholder="منصبه وجهته *"
                        className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={editTestDraft.quote}
                      onChange={(e) =>
                        setEditTestDraft({ ...editTestDraft, quote: e.target.value })
                      }
                      placeholder="نص التوصية *"
                      className="w-full px-3 py-2 rounded-xl border border-line text-xs leading-relaxed focus:outline-none focus:border-teal-600"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editTestDraft.verified}
                        onChange={(e) =>
                          setEditTestDraft({ ...editTestDraft, verified: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-teal-700"
                      />
                      <span>إظهار شارة «توصية موثّقة»</span>
                    </label>
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
                  key={t.id}
                  className="p-3.5 rounded-xl border border-line bg-slate-50/60 flex items-start justify-between gap-2.5"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-ink">{t.name}</span>
                      {t.verified && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          موثّقة ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">{t.role}</div>
                    <p className="text-xs text-slate-700 italic leading-relaxed">«{t.quote}»</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTestId(t.id);
                        setEditTestDraft({
                          name: t.name,
                          role: t.role,
                          quote: t.quote,
                          verified: t.verified,
                        });
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      title="تعديل التوصية"
                      aria-label={`تعديل توصية ${t.name}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingTestId === t.id) setEditingTestId(null);
                        onChangeTestimonials(testimonials.filter((x) => x.id !== t.id));
                        showToast('تم حذف التوصية');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف التوصية"
                      aria-label={`حذف توصية ${t.name}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={handleAddTest}
          className="p-4 rounded-xl border border-line bg-white space-y-2.5"
        >
          <div className="text-xs font-bold text-ink">إضافة توصية أو رأي عميل جديد</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={newTestDraft.name}
              onChange={(e) => setNewTestDraft({ ...newTestDraft, name: e.target.value })}
              placeholder="اسم العميل / المدير *"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
            />
            <input
              type="text"
              required
              value={newTestDraft.role}
              onChange={(e) => setNewTestDraft({ ...newTestDraft, role: e.target.value })}
              placeholder="المنصب والجهة *"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
            />
          </div>
          <textarea
            rows={2}
            required
            value={newTestDraft.quote}
            onChange={(e) => setNewTestDraft({ ...newTestDraft, quote: e.target.value })}
            placeholder="نص الشهادة أو التوصية *"
            className="w-full px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={newTestDraft.verified}
              onChange={(e) =>
                setNewTestDraft({ ...newTestDraft, verified: e.target.checked })
              }
              className="w-4 h-4 rounded accent-teal-700"
            />
            <span>إظهار شارة «توصية موثّقة»</span>
          </label>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-95 transition-opacity"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            إضافة التوصية للبورتفوليو
          </button>
        </form>
      </div>

      {/* Languages Section */}
      <div className="space-y-3 pt-4 border-t border-line">
        <div>
          <h3 className="text-sm font-bold text-ink">
            اللغات ومستوى الإتقان ({languages.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">
            تظهر تلقائياً في البورتفوليو وفي السيرة الذاتية المتوافقة مع ATS
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {languages.map((lg) => (
            <span
              key={lg.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/80"
            >
              <span>
                <strong>{lg.name}</strong> — {lg.level}
              </span>
              <button
                type="button"
                onClick={() => onChangeLanguages(languages.filter((x) => x.id !== lg.id))}
                className="text-slate-400 hover:text-rose-600 font-bold leading-none"
                aria-label={`حذف اللغة ${lg.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddLang} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            required
            value={newLangName}
            onChange={(e) => setNewLangName(e.target.value)}
            placeholder="اللغة (مثال: الفرنسية)"
            className="sm:col-span-5 px-3 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-teal-600"
          />
          <select
            value={newLangLevel}
            onChange={(e) => setNewLangLevel(e.target.value)}
            className="sm:col-span-5 px-3 py-2 rounded-xl border border-line bg-white text-xs focus:outline-none focus:border-teal-600"
          >
            {LANGUAGE_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="sm:col-span-2 py-2 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            إضافة
          </button>
        </form>
      </div>

      {/* Professional Certificates with Verification Links (JSON Resume & RenderCV standard) */}
      <div className="space-y-3 pt-4 border-t border-line">
        <div>
          <h3 className="text-sm font-bold text-ink">
            الشهادات المهنية والاعتمادات ({certificates.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">
            تظهر مع رقم الاعتماد ورابط التحقق الرسمي في السيرة الذاتية ATS والبورتفوليو
          </p>
        </div>

        <div className="space-y-2">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl border border-line bg-slate-50/60 flex items-start justify-between gap-2"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-bold text-ink">{c.name}</div>
                <div className="text-[11px] text-muted">
                  {c.issuer}
                  {c.date ? ` • ${c.date}` : ''}
                  {c.credentialId ? ` • ID: ${c.credentialId}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChangeCertificates(certificates.filter((x) => x.id !== c.id));
                  showToast('تم حذف الشهادة المهنية');
                }}
                className="p-1 text-slate-400 hover:text-rose-600 text-xs font-bold shrink-0"
                aria-label={`حذف شهادة ${c.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCert} className="p-3.5 rounded-xl border border-line bg-white space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={certDraft.name}
              onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })}
              placeholder="اسم الشهادة (مثال: PMP / AWS) *"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs"
            />
            <input
              type="text"
              required
              value={certDraft.issuer}
              onChange={(e) => setCertDraft({ ...certDraft, issuer: e.target.value })}
              placeholder="الجهة المانحة (مثال: PMI / Coursera) *"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={certDraft.date}
              onChange={(e) => setCertDraft({ ...certDraft, date: e.target.value })}
              placeholder="السنة / التاريخ"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs"
            />
            <input
              type="text"
              value={certDraft.credentialId}
              onChange={(e) => setCertDraft({ ...certDraft, credentialId: e.target.value })}
              placeholder="رقم الشهادة (اختياري)"
              className="w-full px-3 py-2 rounded-xl border border-line text-xs"
            />
            <input
              type="url"
              dir="ltr"
              value={certDraft.url}
              onChange={(e) => setCertDraft({ ...certDraft, url: e.target.value })}
              placeholder="رابط التحقق https://..."
              className="w-full px-3 py-2 rounded-xl border border-line text-xs text-left"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            + إضافة شهادة مهنية
          </button>
        </form>
      </div>

      {/* Awards & Honors */}
      <details className="p-3.5 rounded-xl bg-slate-50 border border-line space-y-3">
        <summary className="cursor-pointer text-xs font-bold text-ink select-none flex items-center justify-between">
          <span>الجوائز والتكريم ({awards.length})</span>
          <span className="text-[11px] text-muted">+ فتح / إضافة</span>
        </summary>
        <div className="space-y-2 pt-2">
          {awards.map((a) => (
            <div key={a.id} className="p-2.5 rounded-xl bg-white border border-line flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-ink">{a.title}</div>
                <div className="text-[11px] text-muted">
                  {a.awarder} {a.date ? `• ${a.date}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChangeAwards(awards.filter((x) => x.id !== a.id))}
                className="text-slate-400 hover:text-rose-600 font-bold text-xs"
                aria-label={`حذف جائزة ${a.title}`}
              >
                ×
              </button>
            </div>
          ))}
          <form onSubmit={handleAddAward} className="space-y-2">
            <input
              type="text"
              required
              value={awardDraft.title}
              onChange={(e) => setAwardDraft({ ...awardDraft, title: e.target.value })}
              placeholder="عنوان الجائزة أو التكريم *"
              className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={awardDraft.awarder}
                onChange={(e) => setAwardDraft({ ...awardDraft, awarder: e.target.value })}
                placeholder="الجهة المانحة"
                className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
              />
              <input
                type="text"
                value={awardDraft.date}
                onChange={(e) => setAwardDraft({ ...awardDraft, date: e.target.value })}
                placeholder="السنة"
                className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
              />
            </div>
            <input
              type="text"
              value={awardDraft.summary}
              onChange={(e) => setAwardDraft({ ...awardDraft, summary: e.target.value })}
              placeholder="ملخص الإنجاز (اختياري)"
              className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              إضافة الجائزة
            </button>
          </form>
        </div>
      </details>

      {/* Volunteer & Community Leadership */}
      <details className="p-3.5 rounded-xl bg-slate-50 border border-line space-y-3">
        <summary className="cursor-pointer text-xs font-bold text-ink select-none flex items-center justify-between">
          <span>العمل التطوعي والمبادرات ({volunteer.length})</span>
          <span className="text-[11px] text-muted">+ فتح / إضافة</span>
        </summary>
        <div className="space-y-2 pt-2">
          {volunteer.map((v) => (
            <div key={v.id} className="p-2.5 rounded-xl bg-white border border-line flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-ink">{v.role}</div>
                <div className="text-[11px] text-muted">
                  {v.organization} {v.period ? `• ${v.period}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChangeVolunteer(volunteer.filter((x) => x.id !== v.id))}
                className="text-slate-400 hover:text-rose-600 font-bold text-xs"
                aria-label={`حذف تطوع ${v.role}`}
              >
                ×
              </button>
            </div>
          ))}
          <form onSubmit={handleAddVolunteer} className="space-y-2">
            <input
              type="text"
              required
              value={volDraft.role}
              onChange={(e) => setVolDraft({ ...volDraft, role: e.target.value })}
              placeholder="الدور التطوعي (مثال: مرشد برمجي) *"
              className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={volDraft.organization}
                onChange={(e) => setVolDraft({ ...volDraft, organization: e.target.value })}
                placeholder="الجهة / المبادرة *"
                className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
              />
              <input
                type="text"
                value={volDraft.period}
                onChange={(e) => setVolDraft({ ...volDraft, period: e.target.value })}
                placeholder="الفترة"
                className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
              />
            </div>
            <input
              type="text"
              value={volDraft.summary}
              onChange={(e) => setVolDraft({ ...volDraft, summary: e.target.value })}
              placeholder="الأثر أو المساهمة"
              className="w-full px-3 py-2 rounded-xl border border-line bg-white text-xs"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              إضافة المبادرة التطوعية
            </button>
          </form>
        </div>
      </details>
    </div>
  );
};
