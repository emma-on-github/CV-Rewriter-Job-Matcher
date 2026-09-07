import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, ChevronDown, ChevronUp, Lock, CheckCircle2 } from 'lucide-react';
import { PIIEntity, SanitizationResult } from '../types';

interface PiiInspectorProps {
  sanitization: SanitizationResult;
  rawText: string;
}

export const PiiInspector: React.FC<PiiInspectorProps> = ({ sanitization, rawText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sanitized' | 'raw'>('sanitized');

  const { entities, stats } = sanitization;
  const hasEntities = entities.length > 0;

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-2.5 transition">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-emerald-300">
                {hasEntities ? `${entities.length} Sensitive Data Items Shielded` : 'Zero Identifiable PII Detected'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Client-Side Scrubbed
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80">
              Personal identifiers are scrubbed and replaced with anonymous tokens before reaching the AI
            </p>
          </div>
        </div>

        {hasEntities && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/20 transition cursor-pointer"
          >
            <span>{isOpen ? 'Hide Audit' : 'Inspect Tokens'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Entity Breakdown */}
      {isOpen && hasEntities && (
        <div className="pt-2 border-t border-emerald-500/20 space-y-3">
          {/* Quick Stats Pills */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {stats.names > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                👤 Names: {stats.names}
              </span>
            )}
            {stats.emails > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                ✉️ Emails: {stats.emails}
              </span>
            )}
            {stats.phones > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                📞 Phones: {stats.phones}
              </span>
            )}
            {stats.addresses > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                📍 Addresses: {stats.addresses}
              </span>
            )}
            {stats.urls > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                🔗 Links: {stats.urls}
              </span>
            )}
            {stats.demographics > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                🛡️ Demographics: {stats.demographics}
              </span>
            )}
          </div>

          {/* Table of Entities */}
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] text-slate-400 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2 px-3">Classification</th>
                  <th className="py-2 px-3">Original User Data (Local Only)</th>
                  <th className="py-2 px-3">Neutral Anonymized Token Sent to AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {entities.map(e => (
                  <tr key={e.id} className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 font-medium text-slate-200">{e.label}</td>
                    <td className="py-1.5 px-3 text-rose-300/90 font-mono text-[10px] truncate max-w-[160px]">
                      {e.originalValue}
                    </td>
                    <td className="py-1.5 px-3 text-emerald-400 font-mono text-[10px]">
                      {e.token}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Toggle View Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Preview Sanitized Payload (AI View):</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode('sanitized')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    previewMode === 'sanitized'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Sanitized (Sent to AI)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('raw')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    previewMode === 'raw'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Original Raw
                </button>
              </div>
            </div>
            <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {previewMode === 'sanitized' ? sanitization.sanitizedText : rawText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
