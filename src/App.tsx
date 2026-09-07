import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sliders,
  FileCheck,
  Scale,
} from 'lucide-react';
import { Header } from './components/Header';
import { CvInputSection } from './components/CvInputSection';
import { JobInputSection } from './components/JobInputSection';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { ResultDashboard } from './components/ResultDashboard';
import { REGIONAL_PRESETS } from './data/regionalPresets';
import { DEFAULT_PRIVACY_SETTINGS, sanitizeCvText } from './utils/piiSanitizer';
import { PrivacySettings, RegionalPreset, ResumeTone, RewriteResult, ServerAuditInfo } from './types';

export default function App() {
  const [cvText, setCvText] = useState<string>('');
  const [jobText, setJobText] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<RegionalPreset>(REGIONAL_PRESETS[0]); // Default US
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [tone, setTone] = useState<ResumeTone>('impact_driven');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  const [auditInfo, setAuditInfo] = useState<ServerAuditInfo | null>(null);

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Compute client-side PII sanitization in real-time
  const sanitization = useMemo(() => {
    return sanitizeCvText(cvText, privacySettings);
  }, [cvText, privacySettings]);

  // Handle CV Rewrite submission
  const handleRewrite = async () => {
    setErrorMessage(null);

    if (!cvText.trim()) {
      setErrorMessage('Please paste or upload your CV to proceed.');
      return;
    }

    if (!jobText.trim()) {
      setErrorMessage('Please provide a target job description so we can tailor your skills and experience.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/rewrite-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sanitizedCvText: sanitization.sanitizedText,
          jobDescription: jobText,
          countryLocation: selectedPreset.country,
          regionalPreset: selectedPreset,
          tone,
          complianceFramework: privacySettings.framework,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rewrite CV.');
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('Received unexpected empty response from AI engine.');
      }

      setRewriteResult(data.result);
      setAuditInfo(data.serverAudit || null);
    } catch (err: any) {
      console.error('Rewrite failed:', err);
      setErrorMessage(err.message || 'An error occurred while tailoring your CV. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear all CV and job description data from browser memory?')) {
      setCvText('');
      setJobText('');
      setRewriteResult(null);
      setAuditInfo(null);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        framework={privacySettings.framework}
        onOpenPrivacySettings={() => setIsPrivacyModalOpen(true)}
        onReset={handleReset}
        hasContent={Boolean(cvText || jobText || rewriteResult)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Results View */}
        {rewriteResult ? (
          <ResultDashboard
            result={rewriteResult}
            auditInfo={auditInfo}
            entities={sanitization.entities}
            rawOriginalCv={cvText}
            sanitizedOriginalCv={sanitization.sanitizedText}
            regionalPreset={selectedPreset}
            onBackToEdit={() => setRewriteResult(null)}
          />
        ) : (
          /* Input / Configuration View */
          <div className="space-y-6">
            {/* Privacy & Guardrails Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Guaranteed Ephemeral Processing
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                  <span className="text-xs text-slate-400 font-medium">Zero Data Stored</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Tailor your CV for any job without compromising personal privacy
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Personal identifying info (names, phone numbers, emails, addresses, demographic details) is
                  automatically scrubbed in browser memory before AI processing. Outputs are tailored to match
                  target job keywords and country-specific hiring standards.
                </p>
              </div>

              {/* Guardrail quick items */}
              <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-300 font-medium">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Client-Side PII Scrubbing</span>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <Scale className="w-3 h-3 text-teal-400" />
                  <span>EEOC / GDPR Anti-Bias</span>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Two Column Layout: CV Input (Left) & Target Job (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <CvInputSection
                cvText={cvText}
                onCvTextChange={setCvText}
                sanitization={sanitization}
                onSelectSample={(sampleText) => setCvText(sampleText)}
              />

              <JobInputSection
                jobText={jobText}
                onJobTextChange={setJobText}
                selectedPreset={selectedPreset}
                onSelectPreset={setSelectedPreset}
                tone={tone}
                onSelectTone={setTone}
                onSelectSample={(sampleJob) => setJobText(sampleJob)}
              />
            </div>

            {/* Central Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>
                    Format: <strong className="text-white">{selectedPreset.title}</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">
                    {sanitization.entities.length} PII tokens will be protected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Rewrites bullet points with quantifiable STAR results, elevates matching skills, and checks ATS keywords.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRewrite}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing &amp; Tailoring CV...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Tailor CV for Target Role</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-center space-x-2 text-[11px]">
          <span className="text-emerald-500">●</span>
          <span>Zero-Storage Active</span>
          <span>•</span>
          <span>GDPR Art. 6/9 Compliant</span>
          <span>•</span>
          <span>EEOC Blind-Screening Compatible</span>
        </div>
        <p className="text-[10px] text-slate-600">
          Candidate data is never logged, stored in any database, or used to train public models.
        </p>
      </footer>

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        settings={privacySettings}
        onUpdateSettings={setPrivacySettings}
      />
    </div>
  );
}
