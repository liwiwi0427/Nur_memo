import React, { useState, useMemo } from 'react';
import { CannedTemplate } from '../types';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
  BookOpen,
  LayoutGrid,
  Target,
  ClipboardList,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface TemplateSelectorProps {
  templates: CannedTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (template: CannedTemplate) => void;
  onSaveCustomTemplate: (template: CannedTemplate) => void;
  onDeleteCustomTemplate: (id: string) => void;
  onResetDefaults: () => void;
  onOpenHelpGuide?: () => void;
}

const AVAILABLE_TAGS = [
  { tag: '{{時間}}', label: '時間' },
  { tag: '{{日期}}', label: '日期' },
  { tag: '{{床號}}', label: '床號' },
  { tag: '{{班別}}', label: '班別' },
  { tag: '{{體溫}}', label: '體溫' },
  { tag: '{{脈搏}}', label: '心率' },
  { tag: '{{呼吸}}', label: '呼吸' },
  { tag: '{{血壓}}', label: '血壓' },
  { tag: '{{SpO2}}', label: '血氧' },
  { tag: '{{給氧方式}}', label: '給氧' },
  { tag: '{{生命徵象}}', label: '完整VS組合' },
  { tag: '{{GCS}}', label: 'GCS' },
  { tag: '{{瞳孔}}', label: '瞳孔' },
  { tag: '{{疼痛分數}}', label: '疼痛NRS' },
  { tag: '{{疼痛}}', label: '完整疼痛描寫' },
  { tag: '{{血糖}}', label: '血糖' },
  { tag: '{{處置}}', label: '處置措施' },
  { tag: '{{處置後時間}}', label: '處置後時間' },
  { tag: '{{追蹤體溫}}', label: '追蹤體溫' },
  { tag: '{{追蹤疼痛分數}}', label: '追蹤疼痛' },
  { tag: '{{追蹤SpO2}}', label: '追蹤血氧' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onSaveCustomTemplate,
  onDeleteCustomTemplate,
  onResetDefaults,
  onOpenHelpGuide,
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'DART' | 'SOAP' | 'ROUTINE' | 'CUSTOM'>('ALL');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CannedTemplate | null>(null);

  // Deduplicate incoming templates strictly by ID to prevent duplicate React keys
  const safeTemplates = useMemo(() => {
    const map = new Map<string, CannedTemplate>();
    templates.forEach((t) => {
      if (t && t.id && !map.has(t.id)) {
        map.set(t.id, t);
      }
    });
    return Array.from(map.values());
  }, [templates]);

  // Filtered list
  const filteredTemplates = useMemo(() => {
    return safeTemplates.filter((t) => {
      if (activeCategory === 'ALL') return true;
      return t.category === activeCategory;
    });
  }, [safeTemplates, activeCategory]);

  const handleOpenNew = () => {
    setEditingTemplate({
      id: 'custom-' + Date.now(),
      name: '',
      category: 'CUSTOM',
      description: '',
      templateText: `{{時間}} #焦點名稱\nD: 病人意識清醒，生命徵象：{{生命徵象}}。\nA: 予以照護處置：{{處置}}。\nR: 追蹤評估病況穩定。`,
      isDefault: false,
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (tmpl: CannedTemplate) => {
    setEditingTemplate({ ...tmpl });
    setIsEditorOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.name.trim() || !editingTemplate.templateText.trim()) {
      return;
    }
    onSaveCustomTemplate(editingTemplate);
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  const insertTagToEditor = (tag: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      templateText: editingTemplate.templateText + tag,
    });
  };

  return (
    <div id="template-library-section" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">護理記錄罐頭語句庫 (Template Library)</h3>
            <p className="text-xs text-slate-500">選擇臨床記錄範本，可即時替換時間、生命徵象與處置</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenHelpGuide && (
            <button
              type="button"
              onClick={onOpenHelpGuide}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="查看罐頭設定說明與動態變數標籤教學"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">設定說明</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenNew}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            新增自訂罐頭
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定要將罐頭範本庫重置回臨床預設值嗎？自訂範本將被保留。')) {
                onResetDefaults();
              }
            }}
            title="重設預設範本"
            className="text-xs p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-100 text-xs">
        {(
          [
            { key: 'ALL', label: '全部範本', icon: LayoutGrid },
            { key: 'DART', label: 'DART焦點記錄 (臨床首選)', icon: Target },
            { key: 'SOAP', label: 'SOAP標準病歷', icon: ClipboardList },
            { key: 'ROUTINE', label: '交班速記流水', icon: Clock },
            { key: 'CUSTOM', label: '我的自訂罐頭', icon: Sparkles },
          ] as const
        ).map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-violet-100 text-violet-800 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-violet-700' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredTemplates.map((t) => {
          const isSelected = t.id === selectedTemplateId;
          return (
            <div
              key={t.id}
              onClick={() => onSelectTemplate(t)}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? 'border-violet-500 bg-violet-50/50 shadow-xs ring-1 ring-violet-400'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.category === 'DART'
                          ? 'bg-teal-100 text-teal-800'
                          : t.category === 'SOAP'
                          ? 'bg-blue-100 text-blue-800'
                          : t.category === 'ROUTINE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {t.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{t.name}</h4>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                  {t.description || '點選套用此罐頭語句'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[10px] text-slate-400">
                <span className="truncate max-w-[150px]">
                  {t.isDefault ? '臨床內建標準' : '使用者自訂'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(t);
                    }}
                    title="編輯此範本"
                    className="p-1 hover:text-violet-600 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {!t.isDefault && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`確定要刪除「${t.name}」自訂範本嗎？`)) {
                          onDeleteCustomTemplate(t.id);
                        }
                      }}
                      title="刪除此範本"
                      className="p-1 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating / Editing Template */}
      {isEditorOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingTemplate.isDefault ? '另存/自訂現有範本' : '自訂護理記錄罐頭語句'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    範本名稱 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="例: #跌倒後緊急處置 (DART)"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-200 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">類別</label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-200"
                  >
                    <option value="DART">DART 焦點記錄法</option>
                    <option value="SOAP">SOAP 病歷格式</option>
                    <option value="ROUTINE">交班流水速記</option>
                    <option value="CUSTOM">其他自訂</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  簡短描述說明 (用途提示)
                </label>
                <input
                  type="text"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  placeholder="例: 適用於大夜班常規巡房或術後止痛處置"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>

              {/* Tag Quick Inserters */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">可帶入變數標籤 (點擊插入)：</span>
                  <span className="text-[11px] text-slate-600">系統將自動替換成使用者輸入之數據</span>
                </div>
                <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-lg border border-slate-100 max-h-24 overflow-y-auto">
                  {AVAILABLE_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => insertTagToEditor(t.tag)}
                      className="text-[11px] px-2 py-0.5 bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200 rounded cursor-pointer transition-colors"
                    >
                      {t.tag} ({t.label})
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Content */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  罐頭語句本文 *
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingTemplate.templateText}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, templateText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-violet-200 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-md shadow-xs cursor-pointer"
                >
                  儲存罐頭範本
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
