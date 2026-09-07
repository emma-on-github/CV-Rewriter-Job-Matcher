import React, { useRef, useState } from 'react';
import { Briefcase, Globe, Sparkles, Trash2, HelpCircle, Upload, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import { RegionalPreset, ResumeTone } from '../types';
import { REGIONAL_PRESETS } from '../data/regionalPresets';
import { SAMPLE_JOBS } from '../data/sampleData';

interface JobInputSectionProps {
  jobText: string;
  onJobTextChange: (text: string) => void;
  selectedPreset: RegionalPreset;
  onSelectPreset: (preset: RegionalPreset) => void;
  tone: ResumeTone;
  onSelectTone: (tone: ResumeTone) => void;
  onSelectSample: (jobText: string) => void;
}

export const JobInputSection: React.FC<JobInputSectionProps> = ({
  jobText,
  onJobTextChange,
  selectedPreset,
  onSelectPreset,
  tone,
  onSelectTone,
  onSelectSample,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = jobText.trim() ? jobText.trim().split(/\s+/).length : 0;

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const lowerName = file.name.toLowerCase();
      const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
      const isDocx =
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        lowerName.endsWith('.docx');
      const isText =
        file.type.startsWith('text/') ||
        lowerName.endsWith('.txt') ||
        lowerName.endsWith('.md') ||
        lowerName.endsWith('.rtf');

      if (!isPdf && !isDocx && !isText) {
        throw new Error('Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt, .md).');
      }

      // If text/markdown, read directly in client
      if (isText && !isPdf && !isDocx) {
        const text = await file.text();
        onJobTextChange(text);
        setIsUploading(false);
        return;
      }

      // For PDF / DOCX, extract safely via in-memory ephemeral endpoint
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const response = await fetch('/api/extract-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              filename: file.name,
              mimeType: file.type,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Document extraction failed');
          }

          const data = await response.json();
          if (!data.text || data.text.trim().length === 0) {
            throw new Error('No readable text found in document. Please paste the job description manually.');
          }

          onJobTextChange(data.text);
        } catch (err: any) {
          setUploadError(err.message || 'Failed to process document');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read file.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
          // Reset file input value so re-uploading same file triggers change
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Title & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Target Job Description</h2>
            <p className="text-xs text-slate-400">Paste text or upload job specification file</p>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center space-x-1.5">
          <label className="text-[11px] text-slate-400 hidden sm:inline">Tone:</label>
          <select
            value={tone}
            onChange={(e) => onSelectTone(e.target.value as ResumeTone)}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="impact_driven">STAR &amp; Impact (Metrics)</option>
            <option value="executive">Executive Leadership</option>
            <option value="technical">Technical Specialist</option>
            <option value="concise">Crisp &amp; Concise</option>
          </select>
        </div>
      </div>

      {/* Country Location Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center">
            <Globe className="w-3.5 h-3.5 mr-1 text-teal-400" />
            Target Country / Hiring Location
          </label>
          <span className="text-[11px] text-teal-400 font-mono">
            {selectedPreset.spelling} Spelling • {selectedPreset.pageStandard}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {REGIONAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center space-y-0.5 ${
                selectedPreset.id === preset.id
                  ? 'bg-teal-500/15 border-teal-500 text-white shadow-xs'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <span className="text-base">{preset.flag}</span>
              <span className="text-[11px] font-semibold truncate w-full">{preset.country.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Regional Norms Box */}
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
          <HelpCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="text-slate-200 font-medium block">{selectedPreset.title}</span>
            <p className="text-slate-400">
              {selectedPreset.antiBiasRules[0]}. Standard sections: {selectedPreset.recommendedSections.slice(1, 4).join(', ')}.
            </p>
          </div>
        </div>
      </div>

      {/* Main Textarea with Upload Button Bar */}
      <div className="flex-1 flex flex-col space-y-2">
        {/* Upload Action Bar */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Paste or Upload Job Description
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border border-teal-500/30 text-xs font-medium transition cursor-pointer hover:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload a PDF, DOCX, TXT or Markdown file to auto-populate the job description"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>Reading File...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-teal-400" />
                <span>Upload File (PDF / DOCX / TXT)</span>
              </>
            )}
          </button>
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div
          className="relative flex-1 min-h-[220px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <textarea
            value={jobText}
            onChange={(e) => onJobTextChange(e.target.value)}
            placeholder="Paste target job description, requirements, company context, and qualifications here (or click 'Upload File' above)..."
            className="w-full h-full min-h-[220px] p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 text-xs sm:text-sm font-sans placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 transition resize-y"
            spellCheck="false"
          />
          {jobText && (
            <button
              type="button"
              onClick={() => {
                onJobTextChange('');
                setUploadedFileName(null);
              }}
              className="absolute top-3 right-3 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer"
              title="Clear job description"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center space-x-2">
            <span>{wordCount.toLocaleString()} words</span>
            {uploadedFileName && (
              <span className="text-teal-400 text-[11px] font-medium flex items-center truncate max-w-[200px]">
                <FileCheck className="w-3 h-3 mr-1 inline" />
                {uploadedFileName}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">Keywords and requirements will be analyzed</span>
        </div>
      </div>

      {/* 1-Click Sample JDs */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Quick Test Job:</span>
        <div className="flex items-center space-x-2">
          {SAMPLE_JOBS.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => onSelectSample(job.description)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer text-[11px] font-medium"
            >
              <Sparkles className="w-3 h-3 inline mr-1 text-teal-400" />
              {job.title.split(' ')[0]} {job.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
