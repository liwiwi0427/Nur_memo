import React, { useState } from 'react';
import {
  Copy,
  Check,
  Save,
  Download,
  RotateCcw,
  Type,
  CheckCircle2,
  Cloud,
  FileText,
  Keyboard,
  Sparkles,
  Share2,
} from 'lucide-react';
import { CannedTemplate, PatientContext, SavedRecord, VitalSignsData } from '../types';
import { formatVitalSignsSummary } from '../utils/templateReplacer';
import { useAuth } from '../context/AuthContext';

interface RecordPreviewProps {
  generatedText: string;
  onTextChange: (text: string) => void;
  currentTemplate: CannedTemplate;
  context: PatientContext;
  vitalSigns: VitalSignsData;
  onSaveRecord: (rec: Omit<SavedRecord, 'id' | 'createdAt'>) => void;
  onResetRecord: () => void;
}

export const RecordPreview: React.FC<RecordPreviewProps> = ({
  generatedText,
  onTextChange,
  currentTemplate,
  context,
  vitalSigns,
  onSaveRecord,
  onResetRecord,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleSave = () => {
    if (!generatedText) return;
    onSaveRecord({
      bedNumber: context.bedNumber || '未設定床號',
      unitName: context.unitName || '',
      date: context.recordDate,
      time: context.recordTime,
      shift: context.shift,
      templateName: currentTemplate.name,
      focus: currentTemplate.name.replace(/\(.*?\)/g, '').trim(),
      content: generatedText,
      vitalSummary: formatVitalSignsSummary(vitalSigns),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadTxt = () => {
    const filename = `護理記錄_${context.bedNumber || '紀錄'}_${context.recordDate}_${context.recordTime.replace(':', '')}.txt`;
    const element = document.createElement('a');
    const file = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const charCount = generatedText.length;
  const lineCount = generatedText.split('\n').filter(Boolean).length;

  return (
    <div id="record-preview-panel" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden transition-all">
      {/* 1. Header with Metadata & Typography Toolbar */}
      <div className="px-4 py-3.5 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                護理記錄即時產出 (Nursing Note)
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-100/90 text-teal-800 border border-teal-200/80 truncate max-w-[170px]">
                {currentTemplate.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {context.bedNumber ? `床號: ${context.bedNumber} · ` : ''}
              {context.recordTime} ({context.shift === 'day' ? '白班' : context.shift === 'evening' ? '小夜' : '大夜'}) · 數據即時替換
            </p>
          </div>
        </div>

        {/* Font size control */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 pl-1.5 pr-1 flex items-center gap-0.5">
            <Type className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">字級:</span>
          </span>
          {(
            [
              { key: 'normal', label: '標準' },
              { key: 'large', label: '適中' },
              { key: 'xlarge', label: '大字' },
            ] as const
          ).map((sz) => (
            <button
              key={sz.key}
              type="button"
              onClick={() => setFontSize(sz.key)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                fontSize === sz.key
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {sz.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Unified Action Command Toolbar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Copy Button */}
          <button
            type="button"
            id="copy-to-clipboard-button"
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98 ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-teal-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>已複製至剪貼簿！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>一鍵複製記錄</span>
                <span className="text-[10px] opacity-80 font-mono hidden sm:inline">(Ctrl+C)</span>
              </>
            )}
          </button>

          {/* Save Record Button */}
          <button
            type="button"
            id="save-record-button"
            onClick={handleSave}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all border cursor-pointer active:scale-98 ${
              savedSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user ? '已存至 Firebase 雲端' : '已儲存至本機'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>儲存此筆</span>
                {user ? (
                  <Cloud className="w-3 h-3 text-teal-600" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-normal">本機</span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Secondary Toolset */}
        <div className="flex items-center gap-1.5">
          {/* Export TXT */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            title="匯出為 TXT 文字檔"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">匯出文字檔</span>
          </button>

          {/* Reset Content Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定要清空並還原此筆為範本預設內容嗎？')) {
                onResetRecord();
              }
            }}
            title="還原為原始罐頭片語"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Editable Output Textarea */}
      <div className="grow relative p-3 sm:p-4 bg-slate-50/40">
        <textarea
          id="nursing-record-output-textarea"
          rows={14}
          value={generatedText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="護理記錄內容將自動在此產生..."
          className={`w-full h-full min-h-[320px] p-4 bg-white border border-slate-200/90 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 font-sans leading-relaxed transition-all resize-y shadow-2xs ${
            fontSize === 'normal'
              ? 'text-xs sm:text-sm'
              : fontSize === 'large'
              ? 'text-sm sm:text-base'
              : 'text-base sm:text-lg'
          }`}
        />
      </div>

      {/* 4. Footer Info & HIS Paste Tip */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
            {charCount} 字
          </span>
          <span>•</span>
          <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
            {lineCount} 行
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <Keyboard className="w-3 h-3 text-slate-400" />
          <span>複製後至 HIS 系統按</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-800 font-mono text-[10px] shadow-2xs font-bold">
            Ctrl + V
          </kbd>
          <span>即可直接貼上</span>
        </div>
      </div>
    </div>
  );
};
