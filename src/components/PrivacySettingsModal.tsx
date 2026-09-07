import React from 'react';
import { X, ShieldCheck, Lock, Globe, AlertTriangle, Check, CheckCircle2, UserX, EyeOff, Info } from 'lucide-react';
import { ComplianceFramework, PrivacySettings, RedactionLevel } from '../types';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrivacySettings;
  onUpdateSettings: (newSettings: PrivacySettings) => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const handleFrameworkChange = (fw: ComplianceFramework) => {
    let updated: Partial<PrivacySettings> = { framework: fw };
    if (fw === 'EEOC') {
      updated = {
        ...updated,
        maskProtectedDemographics: true,
        maskName: true,
        maskGraduationYears: true,
      };
    } else if (fw === 'GDPR') {
      updated = {
        ...updated,
        maskProtectedDemographics: true,
        maskAddress: true,
        maskEmail: true,
        maskPhone: true,
      };
    }
    onUpdateSettings({ ...settings, ...updated });
  };

  const handleRedactionLevelChange = (level: RedactionLevel) => {
    if (level === 'maximum') {
      onUpdateSettings({
        ...settings,
        redactionLevel: level,
        maskName: true,
        maskEmail: true,
        maskPhone: true,
        maskAddress: true,
        maskLinks: true,
        maskProtectedDemographics: true,
        maskGraduationYears: true,
      });
    } else if (level === 'balanced') {
      onUpdateSettings({
        ...settings,
        redactionLevel: level,
        maskName: true,
        maskEmail: true,
        maskPhone: true,
        maskAddress: true,
        maskLinks: true,
        maskProtectedDemographics: true,
        maskGraduationYears: false,
      });
    } else {
      onUpdateSettings({
        ...settings,
        redactionLevel: level,
        maskName: false,
        maskEmail: true,
        maskPhone: true,
        maskAddress: true,
        maskLinks: false,
        maskProtectedDemographics: false,
        maskGraduationYears: false,
      });
    }
  };

  const toggleField = (key: keyof PrivacySettings) => {
    if (typeof settings[key] === 'boolean') {
      onUpdateSettings({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Regional Compliance &amp; Privacy Guardrails</h2>
              <p className="text-xs text-slate-400">Control data anonymization, anti-bias policies, and privacy standards</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Zero Data Storage Proof Box */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 space-y-1">
              <span className="font-semibold text-emerald-300 block">Strict Ephemeral Zero-Storage Guarantee</span>
              <p className="text-emerald-100/80 leading-relaxed">
                Your CV and Job Descriptions are processed entirely in ephemeral volatile RAM. No database exists, no files are stored on disk, and no user content is logged. PII is scrubbed before any data reaches the AI.
              </p>
            </div>
          </div>

          {/* Compliance Framework Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Regional Compliance Framework
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'GDPR' as ComplianceFramework, label: 'GDPR (EU & UK)', desc: 'Art. 6/9 data minimization' },
                { id: 'EEOC' as ComplianceFramework, label: 'EEOC (United States)', desc: 'Blind anti-bias screening' },
                { id: 'CCPA' as ComplianceFramework, label: 'CCPA (California)', desc: 'Zero data sales/sharing' },
                { id: 'INTERNATIONAL' as ComplianceFramework, label: 'International', desc: 'Universal ATS standard' }
              ].map(fw => (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => handleFrameworkChange(fw.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    settings.framework === fw.id
                      ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs">{fw.label}</span>
                    {settings.framework === fw.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">{fw.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Redaction Level Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Redaction Level Preset
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'maximum' as RedactionLevel,
                  title: 'Maximum (Blind Audit)',
                  desc: 'Masks Name, Contacts, Demographics, URLs & Grad Years'
                },
                {
                  id: 'balanced' as RedactionLevel,
                  title: 'Balanced (Standard)',
                  desc: 'Masks Direct Identifiers, Contacts & Protected Attributes'
                },
                {
                  id: 'contact_only' as RedactionLevel,
                  title: 'Contact Details Only',
                  desc: 'Masks Email, Phone & Street Address only'
                }
              ].map(level => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => handleRedactionLevelChange(level.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    settings.redactionLevel === level.id
                      ? 'bg-teal-500/15 border-teal-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-medium text-xs mb-1 text-slate-100">{level.title}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Guardrail Toggles */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              3. Granular PII &amp; Demographic Controls
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-800/30 p-3.5 rounded-xl border border-slate-800">
              {[
                { key: 'maskName' as const, label: 'Mask Candidate Full Name', sub: 'e.g., [CANDIDATE_NAME]' },
                { key: 'maskEmail' as const, label: 'Mask Email Addresses', sub: 'e.g., [EMAIL_ADDRESS_1]' },
                { key: 'maskPhone' as const, label: 'Mask Phone Numbers', sub: 'e.g., [PHONE_NUMBER_1]' },
                { key: 'maskAddress' as const, label: 'Mask Physical Address & Postcodes', sub: 'e.g., [STREET_ADDRESS_1]' },
                { key: 'maskLinks' as const, label: 'Mask LinkedIn & Portfolio URLs', sub: 'e.g., [LINKEDIN_PROFILE]' },
                {
                  key: 'maskProtectedDemographics' as const,
                  label: 'Strip Protected Demographics',
                  sub: 'Age, DOB, Marital status, Gender, Nationality'
                },
                {
                  key: 'maskGraduationYears' as const,
                  label: 'Mask Historical Grad Dates (Anti-Age Bias)',
                  sub: 'Redacts degree years >10 yrs ago'
                },
                {
                  key: 'clientSideRehydration' as const,
                  label: 'Enable Client-Side Re-hydration',
                  sub: 'Restore your real details on export without sending to AI'
                }
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => toggleField(item.key)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/70 transition cursor-pointer border border-transparent hover:border-slate-700/50"
                >
                  <div className="pr-3">
                    <span className="text-xs font-medium text-slate-200 block">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block">{item.sub}</span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                      settings[item.key] ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                        settings[item.key] ? 'translate-x-4.5' : 'translate-x-0.75'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
            Privacy guardrails will apply to your current session
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
