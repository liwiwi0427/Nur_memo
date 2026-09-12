import React, { useState } from 'react';
import { SavedRecord } from '../types';
import { History, Copy, Trash2, Check, Download, ExternalLink, Search, FileDown } from 'lucide-react';

interface SavedRecordsDrawerProps {
  records: SavedRecord[];
  onLoadRecord: (record: SavedRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const SavedRecordsDrawer: React.FC<SavedRecordsDrawerProps> = ({
  records,
  onLoadRecord,
  onDeleteRecord,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.bedNumber.toLowerCase().includes(term) ||
      r.focus.toLowerCase().includes(term) ||
      r.content.toLowerCase().includes(term) ||
      r.time.includes(term)
    );
  });

  const handleCopySingle = async (rec: SavedRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(rec.content);
      setCopiedId(rec.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportAll = () => {
    if (records.length === 0) return;
    const consolidated = records
      .map(
        (r, i) =>
          `=== [${i + 1}] 床號: ${r.bedNumber} | 時間: ${r.date} ${r.time} (${r.shift}) ===\n${r.content}\n`
      )
      .join('\n----------------------------------------\n\n');

    const filename = `護理班別記錄匯總_${new Date().toISOString().split('T')[0]}.txt`;
    const element = document.createElement('a');
    const file = new Blob([consolidated], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="saved-records-panel" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-base">本機已存記錄庫 (Saved Records)</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {records.length} 筆
              </span>
            </div>
            <p className="text-xs text-slate-500">暫存於瀏覽器以防丟失，隨時可一鍵快速調用、複製與交班匯出</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportAll}
                className="text-xs px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                匯出全班記錄總表
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('確定要清空所有已存記錄嗎？此動作無法復原。')) {
                    onClearAll();
                  }
                }}
                className="text-xs p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="清空所有記錄"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {records.length > 0 && (
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋床號、焦點關鍵字或記錄內文..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      )}

      {/* List */}
      {records.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          尚未儲存任何護理記錄。
          <br />
          在右側預覽區點選「儲存此筆記錄」即可將內容暫存於此。
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          查無符合「{searchTerm}」的記錄。
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onLoadRecord(rec)}
              className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 bg-white transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-white">
                    {rec.bedNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{rec.focus}</span>
                  <span className="text-[11px] text-slate-600">
                    {rec.date} {rec.time}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleCopySingle(rec, e)}
                    className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      copiedId === rec.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
                    }`}
                  >
                    {copiedId === rec.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>已複製</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>複製</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('確定刪除此筆記錄？')) {
                        onDeleteRecord(rec.id);
                      }
                    }}
                    title="刪除此記錄"
                    className="p-1 text-slate-300 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {rec.vitalSummary && (
                <div className="text-[11px] text-teal-700 font-mono mb-1 truncate">
                  {rec.vitalSummary}
                </div>
              )}

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans bg-slate-50/70 p-2 rounded border border-slate-100">
                {rec.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
