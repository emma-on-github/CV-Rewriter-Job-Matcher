import React from 'react';
import { ShieldCheck, Lock, Sliders, RefreshCw, Globe, CheckCircle2 } from 'lucide-react';
import { ComplianceFramework } from '../types';

interface HeaderProps {
  framework: ComplianceFramework;
  onOpenPrivacySettings: () => void;
  onReset: () => void;
  hasContent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  framework,
  onOpenPrivacySettings,
  onReset,
  hasContent
}) => {
  return (
    <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-950/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                CV Rewriter &amp; Job Matcher
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock className="w-3 h-3 mr-1" />
                Zero Cloud Storage
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Privacy-first CV tailoring • Client-side PII guardrails • Regional compliance
            </p>
          </div>
        </div>

        {/* Action Controls & Compliance Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Standard Badge */}
          <button
            type="button"
            onClick={onOpenPrivacySettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Configure regional compliance standards & PII settings"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold text-white">{framework}</span>
            <span className="text-slate-400 hidden lg:inline">Standards</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1"></span>
          </button>

          {/* Privacy Settings Trigger */}
          <button
            type="button"
            onClick={onOpenPrivacySettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition cursor-pointer shadow-sm shadow-emerald-900/30"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Privacy Guardrails</span>
          </button>

          {/* Reset button if active */}
          {hasContent && (
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
              title="Clear all session data from browser memory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
