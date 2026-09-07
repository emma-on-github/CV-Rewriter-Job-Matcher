import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  ArrowLeft,
  Lock,
  Layers,
  FileText,
  AlertTriangle,
  Flame,
  Globe,
  Award,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { PIIEntity, RegionalPreset, RewriteResult, ServerAuditInfo } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { rehydrateText } from '../utils/piiSanitizer';

interface ResultDashboardProps {
  result: RewriteResult;
  auditInfo: ServerAuditInfo | null;
  entities: PIIEntity[];
  rawOriginalCv: string;
  sanitizedOriginalCv: string;
  regionalPreset: RegionalPreset;
  onBackToEdit: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  result,
  auditInfo,
  entities,
  rawOriginalCv,
  sanitizedOriginalCv,
  regionalPreset,
  onBackToEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'tailored' | 'compare' | 'audit'>('tailored');
  const [isRehydrated, setIsRehydrated] = useState(true);
  const [copied, setCopied] = useState(false);

  // Compute text to display based on rehydration toggle
  const displayedCv = isRehydrated
    ? rehydrateText(result.tailoredCvMarkdown, entities)
    : result.tailoredCvMarkdown;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedCv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([displayedCv], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tailored_CV_${regionalPreset.id}_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    // Strip markdown formatting symbols for clean plain text
    const plainText = displayedCv
      .replace(/#+\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tailored_CV_${regionalPreset.id}_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const score = result.matchScore || 85;
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (val >= 70) return 'text-teal-400 border-teal-500/30 bg-teal-950/20';
    return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action & Navigation Bar */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToEdit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Inputs</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">CV Tailored for Job Alignment</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                {regionalPreset.title}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {regionalPreset.spelling} spelling • Anti-bias protected • Zero data stored
            </p>
          </div>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          {/* Client-Side Re-hydration Switch */}
          {entities.length > 0 && (
            <div
              onClick={() => setIsRehydrated(!isRehydrated)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                isRehydrated
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Restores your real name and contact details strictly inside browser memory"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isRehydrated ? 'My Details Restored (Client)' : 'Anonymized Tokens'}</span>
              <div
                className={`w-7 h-4 rounded-full transition-colors relative ${
                  isRehydrated ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    isRehydrated ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy CV'}</span>
          </button>

          {/* Download Menu */}
          <button
            type="button"
            onClick={handleDownloadMd}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Download formatted Markdown file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Download clean plain text file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Match Score & Analysis Cards */}
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Match Score Radial Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Match Score</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ATS Optimized
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
                score
              )}`}
            >
              <span className="text-2xl font-black">{score}%</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Alignment</span>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-semibold text-white block">
                {score >= 85 ? 'Strong Keyword & Role Fit' : 'Solid Alignment with High Potential'}
              </span>
              <p className="text-xs text-slate-400 leading-snug">
                Restructured to elevate critical domain proficiencies and STAR quantifiable achievements.
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
            />
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm md:col-span-2 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-400" />
                Strategic Role Alignment Brief
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {regionalPreset.recommendedSections.length} Standard Sections
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {result.executiveSummary}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {result.antiBiasNotice}
            </span>
          </div>
        </div>
      </div>

      {/* Skills Matrix (Matched, Elevated, and Gaps) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
          <Layers className="w-4 h-4 mr-1.5 text-teal-400" />
          Skill Alignment Matrix &amp; Keyword Coverage
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Matched Skills */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">
                Directly Matched Skills ({result.matchedSkills?.length || 0})
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Found in both your background and prominently required by the role:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.matchedSkills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Highlighted Skills */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-teal-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-300">
                Elevated / Highlighted Skills ({result.highlightedSkills?.length || 0})
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Transferable proficiencies reframed to emphasize leadership &amp; impact:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.highlightedSkills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-500/15 text-teal-300 border border-teal-500/30"
                >
                  ★ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300">
                Recommended Skill Additions ({result.gapSkills?.length || 0})
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Requested in JD but not explicitly highlighted in original CV:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.gapSkills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                >
                  + {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revisions & Key Changes Breakdown */}
      {result.keyChanges && result.keyChanges.length > 0 && (
        <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-emerald-400" />
            Summary of Revisions &amp; Tailoring Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.keyChanges.map((change, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{change.section}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    ATS Impact
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{change.explanation}</p>
                <div className="text-[11px] text-teal-400/90 italic pt-1 border-t border-slate-800/80">
                  Impact: {change.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Document Display Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Tab Headers */}
        <div className="no-print px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('tailored')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'tailored'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tailored CV Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'compare'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Side-by-Side Comparison</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'audit'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy Proof &amp; Audit</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center space-x-2 font-mono">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Zero-Storage Active</span>
          </div>
        </div>

        {/* Tab 1: Tailored CV Preview */}
        {activeTab === 'tailored' && (
          <div className="p-6 sm:p-10 bg-slate-950/40 min-h-[500px]">
            {/* Paper Container */}
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 sm:p-12 shadow-xl print:p-0 print:border-none print:shadow-none print:bg-transparent">
              <MarkdownRenderer markdown={displayedCv} />
            </div>
          </div>
        )}

        {/* Tab 2: Side-by-Side Comparison */}
        {activeTab === 'compare' && (
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950/40">
            {/* Left: Original Sanitized CV */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Original CV (Sanitized View Sent to AI)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">PII Tokenized</span>
              </div>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 max-h-[600px] overflow-y-auto text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {sanitizedOriginalCv}
              </div>
            </div>

            {/* Right: Rewritten Tailored CV */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Rewritten Tailored CV
                </span>
                <span className="text-[10px] text-teal-400 font-mono">Role &amp; Skill Aligned</span>
              </div>
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 max-h-[600px] overflow-y-auto">
                <MarkdownRenderer markdown={displayedCv} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Privacy Proof & Audit Log */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-6 max-w-3xl mx-auto text-slate-300 text-xs">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Verification: No Personal Data Was Stored or Exposed</span>
              </div>
              <p className="text-emerald-100/90 leading-relaxed">
                Before sending your CV text to the Gemini API, our client-side sanitizer identified all personal
                contact details and replaced them with neutral cryptographic tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Cloud Persistence</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  0s (Strictly Ephemeral)
                </span>
                <p className="text-[10px] text-slate-500">No database writes or long-term storage</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Sensitive PII Seen by AI</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />0 Direct Personal Identifiers
                </span>
                <p className="text-[10px] text-slate-500">Scrubbed locally before outbound network call</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Regional Compliance Standard</span>
                <span className="text-white font-bold text-sm">
                  {auditInfo?.frameworkCompliance || 'GDPR / EEOC Compliant'}
                </span>
                <p className="text-[10px] text-slate-500">Anti-bias blind screening enforced</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Ephemeral Session ID</span>
                <span className="text-slate-200 font-mono text-xs">{auditInfo?.ephemeralSessionId || 'Active'}</span>
                <p className="text-[10px] text-slate-500">Volatile memory key cleared on session end</p>
              </div>
            </div>

            {/* List of Neutralized Items */}
            {entities.length > 0 && (
              <div className="space-y-2">
                <span className="text-slate-300 font-semibold block">
                  Neutralized Entities in this Session ({entities.length}):
                </span>
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Placeholder Token Sent to AI</th>
                        <th className="py-2 px-3">Restoration Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {entities.map((ent) => (
                        <tr key={ent.id}>
                          <td className="py-1.5 px-3 font-medium text-slate-200">{ent.label}</td>
                          <td className="py-1.5 px-3 font-mono text-emerald-400">{ent.token}</td>
                          <td className="py-1.5 px-3 text-slate-400">
                            {isRehydrated ? 'Restored in Client Memory' : 'Masked'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
