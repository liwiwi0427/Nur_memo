import React, { useState } from 'react';
import { Copy, Check, Save, Download, RotateCcw, Type, CheckCircle2, Cloud } from 'lucide-react';
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
    <div id="record-preview-panel" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 text-base">產出護理記錄 (Generated Nursing Note)</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {currentTemplate.name}
            </span>
          </div>
          <p className="text-xs text-slate-500">已自動套入各項臨床數值，可直接在此微調潤飾後複製</p>
        </div>

        {/* Font size control */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <span className="text-[10px] text-slate-400 pl-1.5 flex items-center gap-0.5">
            <Type className="w-3 h-3" />
          </span>
          {(
            [
              { key: 'normal', label: '標準' },
              { key: 'large', label: '舒適' },
              { key: 'xlarge', label: '大字' },
            ] as const
          ).map((sz) => (
            <button
              key={sz.key}
              type="button"
              onClick={() => setFontSize(sz.key)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                fontSize === sz.key ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {sz.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
        <div className="flex items-center gap-2">
          {/* Main Copy Button */}
          <button
            type="button"
            id="copy-to-clipboard-button"
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-600 hover:bg-teal-700 active:scale-98 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>已複製到剪貼簿！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>一鍵複製記錄 (Copy)</span>
              </>
            )}
          </button>

          {/* Save to History */}
          <button
            type="button"
            id="save-record-button"
            onClick={handleSave}
            className={`px-3 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user ? '已同步儲存至 Firebase！' : '已儲存於本機！'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>儲存此筆記錄</span>
                {user && <Cloud className="w-3 h-3 text-teal-600" />}
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Download txt */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            title="下載為 TXT 純文字檔案"
            className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">匯出 TXT</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定要清空並還原此筆內容嗎？')) {
                onResetRecord();
              }
            }}
            title="還原預設套用內容"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editable Output Textarea */}
      <div className="grow relative">
        <textarea
          id="nursing-record-output-textarea"
          rows={14}
          value={generatedText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="護理記錄內容將自動在此產生..."
          className={`w-full h-full min-h-[300px] p-4 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-200 font-sans leading-relaxed transition-all resize-y ${
            fontSize === 'normal' ? 'text-xs sm:text-sm' : fontSize === 'large' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
          }`}
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <span>字數統計: {charCount} 字</span>
          <span>•</span>
          <span>行數: {lineCount} 行</span>
        </div>
        <div className="text-slate-600">
          💡 提示：點擊右上角「複製」後，至醫院 HIS 系統直接按 <kbd className="px-1 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-[10px]">Ctrl+V</kbd> 即可貼上
        </div>
      </div>
    </div>
  );
};
