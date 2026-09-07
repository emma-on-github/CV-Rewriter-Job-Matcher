import React, { useRef, useState } from 'react';
import { FileText, Upload, Sparkles, Trash2, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { SanitizationResult } from '../types';
import { PiiInspector } from './PiiInspector';
import { SAMPLE_CVS } from '../data/sampleData';

interface CvInputSectionProps {
  cvText: string;
  onCvTextChange: (text: string) => void;
  sanitization: SanitizationResult;
  onSelectSample: (cvText: string) => void;
}

export const CvInputSection: React.FC<CvInputSectionProps> = ({
  cvText,
  onCvTextChange,
  sanitization,
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      // Check file type
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
        onCvTextChange(text);
        setActiveTab('paste');
        setIsUploading(false);
        return;
      }

      // For PDF / DOCX, safely extract text using our ephemeral in-memory API
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
            throw new Error(errData.error || 'Extraction failed');
          }

          const data = await response.json();
          if (!data.text || data.text.trim().length === 0) {
            throw new Error('No readable text found in document. Please paste the CV text manually.');
          }

          onCvTextChange(data.text);
          setActiveTab('paste');
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const wordCount = cvText.trim() ? cvText.trim().split(/\s+/).length : 0;
  const charCount = cvText.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-full">
      {/* Title & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Candidate CV / Resume</h2>
            <p className="text-xs text-slate-400">Paste text or upload PDF/DOCX (Processed in volatile RAM)</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              activeTab === 'paste' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              activeTab === 'upload' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
        </div>
      </div>

      {/* Main Input Area */}
      {activeTab === 'paste' ? (
        <div className="flex-1 flex flex-col space-y-2">
          <div className="relative flex-1 min-h-[320px]">
            <textarea
              value={cvText}
              onChange={(e) => onCvTextChange(e.target.value)}
              placeholder="Paste your current CV / Resume here (Contact info, work experience, achievements, education, technical skills)..."
              className="w-full h-full min-h-[320px] p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 text-xs sm:text-sm font-sans placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition resize-y"
              spellCheck="false"
            />
            {cvText && (
              <button
                type="button"
                onClick={() => onCvTextChange('')}
                className="absolute top-3 right-3 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer"
                title="Clear CV text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters
            </span>
            {uploadedFileName && (
              <span className="text-emerald-400 text-[11px] truncate max-w-[200px]">
                Imported from {uploadedFileName}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center min-h-[320px]">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-950/20'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-xs font-medium text-slate-200">Extracting text safely in RAM...</span>
                <span className="text-[11px] text-slate-400">Zero files saved to disk</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Upload className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Click or drag &amp; drop your CV here</p>
                  <p className="text-xs text-slate-400">Supports PDF, Word (.docx), TXT, and Markdown</p>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">PDF</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">DOCX</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">TXT</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">MD</span>
                </div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* PII Guardrail Status Inspector */}
      {cvText.trim().length > 0 && (
        <PiiInspector sanitization={sanitization} rawText={cvText} />
      )}

      {/* 1-Click Sample CVs */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Quick Test CV:</span>
        <div className="flex items-center space-x-2">
          {SAMPLE_CVS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample.rawText)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer text-[11px] font-medium"
            >
              <Sparkles className="w-3 h-3 inline mr-1 text-emerald-400" />
              {sample.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
