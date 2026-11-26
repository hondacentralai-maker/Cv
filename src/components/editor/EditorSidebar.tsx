import React from 'react';
import { EDITOR_SECTIONS, type EditorSectionId } from '../../data/presets';
import type { PortfolioData } from '../../types/portfolio';
import { DesignForm } from './DesignForm';
import { ExperienceForm } from './ExperienceForm';
import { IdentityForm } from './IdentityForm';
import { ProjectsForm } from './ProjectsForm';
import { ProofForm } from './ProofForm';
import { SkillsLinksForm } from './SkillsLinksForm';

interface EditorSidebarProps {
  data: PortfolioData;
  activeSection: EditorSectionId;
  onSelectSection: (sec: EditorSectionId) => void;
  onUpdateData: (updater: (prev: PortfolioData) => PortfolioData) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  data,
  activeSection,
  onSelectSection,
  onUpdateData,
}) => {
  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Editor Sub-Navigation Tabs */}
      <div className="border-b border-line bg-slate-50/80 p-2.5">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="أقسام المحرر">
          {EDITOR_SECTIONS.map((sec) => {
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-white text-ink shadow-xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-ink hover:bg-white/60 border border-transparent'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Editor Section Content */}
      <div className="p-4 sm:p-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">
        {activeSection === 'identity' && (
          <IdentityForm
            profile={data.profile}
            presetId={data.presetId}
            onChange={(profile) => onUpdateData((prev) => ({ ...prev, profile }))}
          />
        )}

        {activeSection === 'design' && (
          <DesignForm
            design={data.design}
            onChange={(design) => onUpdateData((prev) => ({ ...prev, design }))}
          />
        )}

        {activeSection === 'projects' && (
          <ProjectsForm
            projects={data.projects}
            presetId={data.presetId}
            onChange={(projects, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                projects,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, projects: true } }
                  : prev.design,
              }))
            }
          />
        )}

        {activeSection === 'experience' && (
          <ExperienceForm
            experience={data.experience}
            education={data.education}
            presetId={data.presetId}
            onChangeExperience={(experience, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                experience,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, experience: true } }
                  : prev.design,
              }))
            }
            onChangeEducation={(education) =>
              onUpdateData((prev) => ({ ...prev, education }))
            }
          />
        )}

        {activeSection === 'skills' && (
          <SkillsLinksForm
            skills={data.skills}
            links={data.links}
            presetId={data.presetId}
            onChangeSkills={(skills) => onUpdateData((prev) => ({ ...prev, skills }))}
            onChangeLinks={(links, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                links,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, links: true } }
                  : prev.design,
              }))
            }
          />
        )}

        {activeSection === 'proof' && (
          <ProofForm
            testimonials={data.testimonials}
            languages={data.languages}
            certificates={data.certificates}
            awards={data.awards}
            volunteer={data.volunteer}
            onChangeTestimonials={(testimonials, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                testimonials,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, testimonials: true } }
                  : prev.design,
              }))
            }
            onChangeLanguages={(languages, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                languages,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, languages: true } }
                  : prev.design,
              }))
            }
            onChangeCertificates={(certificates, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                certificates,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, certificates: true } }
                  : prev.design,
              }))
            }
            onChangeAwards={(awards, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                awards,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, awards: true } }
                  : prev.design,
              }))
            }
            onChangeVolunteer={(volunteer, ensureVisible) =>
              onUpdateData((prev) => ({
                ...prev,
                volunteer,
                design: ensureVisible
                  ? { ...prev.design, blocks: { ...prev.design.blocks, volunteer: true } }
                  : prev.design,
              }))
            }
          />
        )}
      </div>
    </div>
  );
};
