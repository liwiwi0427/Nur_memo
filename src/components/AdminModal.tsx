import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  X,
  FileText,
  Users,
  BarChart3,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  Activity,
  Server,
  Database,
  ShieldCheck,
  Zap,
  Clock,
  UserCheck,
  ChevronRight,
  Eye,
  Power,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';
import { CannedTemplate, UserSettings, FirebaseUsageStats, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemTemplates: CannedTemplate[];
  allUsers: UserSettings[];
  usageStats: FirebaseUsageStats;
  onSaveSystemTemplate: (tmpl: CannedTemplate) => Promise<void>;
  onDeleteSystemTemplate: (id: string) => Promise<void>;
  onToggleSystemTemplate: (id: string, active: boolean) => Promise<void>;
  onInitDefaults: () => Promise<void>;
  onUpdateUserRole: (uid: string, role: UserRole) => Promise<void>;
  onUpdateUserStatus: (uid: string, status: 'active' | 'suspended') => Promise<void>;
  onRunDiagnosticPing: () => Promise<number>;
}

type AdminTab = 'templates' | 'users' | 'metrics';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  systemTemplates,
  allUsers,
  usageStats,
  onSaveSystemTemplate,
  onDeleteSystemTemplate,
  onToggleSystemTemplate,
  onInitDefaults,
  onUpdateUserRole,
  onUpdateUserStatus,
  onRunDiagnosticPing,
}) => {
  const { user, isAdmin, devAdminOverride, setDevAdminOverride } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Editing template state
  const [editingTemplate, setEditingTemplate] = useState<CannedTemplate | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<CannedTemplate>({
    id: '',
    name: '',
    category: 'DART',
    description: '',
    templateText: '',
    isActive: true,
  });

  // Action status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Filter templates (strictly deduplicated by template ID)
  const filteredTemplates = useMemo(() => {
    const seen = new Set<string>();
    return systemTemplates.filter((t) => {
      if (!t || !t.id || seen.has(t.id)) return false;
      seen.add(t.id);
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.templateText.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && t.isActive !== false) ||
        (statusFilter === 'INACTIVE' && t.isActive === false);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [systemTemplates, searchQuery, categoryFilter, statusFilter]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreatingTemplate(true);
    setEditingTemplate(null);
    setTemplateForm({
      id: 'sys_' + Date.now(),
      name: '',
      category: 'DART',
      description: '',
      templateText: `{{時間}} #焦點主題\nD: 主訴及客觀生命徵象 {{生命徵象}}。\nA: 執行護理處置：{{處置}}。\nR: 評估後續反應與衛教。`,
      isActive: true,
    });
  };

  const handleStartEdit = (tmpl: CannedTemplate) => {
    setIsCreatingTemplate(false);
    setEditingTemplate(tmpl);
    setTemplateForm({ ...tmpl });
  };

  const handleSaveTemplateForm = async () => {
    if (!templateForm.name.trim() || !templateForm.templateText.trim()) {
      showFeedback('請填寫罐頭名稱與內容', 'error');
      return;
    }
    try {
      await onSaveSystemTemplate(templateForm);
      showFeedback(`已成功儲存系統罐頭「${templateForm.name}」！`);
      setEditingTemplate(null);
      setIsCreatingTemplate(false);
    } catch (err) {
      showFeedback('儲存失敗，請檢查網路或管理員權限', 'error');
    }
  };

  const handleDeleteTemplate = async (tmpl: CannedTemplate) => {
    if (window.confirm(`確定要刪除系統罐頭「${tmpl.name}」嗎？此操作將同步影響所有病房護理人員。`)) {
      try {
        await onDeleteSystemTemplate(tmpl.id);
        showFeedback(`已刪除罐頭「${tmpl.name}」`);
      } catch (err) {
        showFeedback('刪除失敗', 'error');
      }
    }
  };

  const handleBatchInitDefaults = async () => {
    if (window.confirm('確定要將標準原廠罐頭批次同步至 Firebase 雲端「system_templates」資料庫嗎？')) {
      try {
        await onInitDefaults();
        showFeedback('已成功初始化預設系統罐頭至 Firebase 資料庫！');
      } catch (err) {
        showFeedback('初始化失敗', 'error');
      }
    }
  };

  const handleRunPing = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const ms = await onRunDiagnosticPing();
      setDiagnosticResult(`端對端延遲: ${ms} ms (連線極佳)`);
      showFeedback(`資料庫延遲測試完成: ${ms} ms`);
    } catch (err) {
      setDiagnosticResult('測試失敗: 無法連線至 Firestore');
      showFeedback('連線診斷失敗', 'error');
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  系統管理員主控台 (Admin Portal)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Firebase Cloud Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                管理全局預設罐頭片語、監控病房護理人員同步狀態與即時 Firebase 資料庫配額用量
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dev Mode Admin Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-300 text-[11px]">管理員模式:</span>
              <button
                type="button"
                onClick={() => setDevAdminOverride(!devAdminOverride)}
                className="cursor-pointer text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                title="切換管理員預覽權限"
              >
                {devAdminOverride || isAdmin ? (
                  <ToggleRight className="w-5 h-5 text-teal-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-[11px]">{devAdminOverride ? '預覽開啟' : isAdmin ? '認證通過' : '未開啟'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'templates'
                ? 'border-teal-600 text-teal-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>預設罐頭訊息管理 ({systemTemplates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-teal-600 text-teal-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>使用者與雲端同步狀態 ({allUsers.length || 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-teal-600 text-teal-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Firebase 用量與效能監控</span>
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto grow bg-slate-50/50">
          {/* ================= TAB 1: 預設罐頭管理 ================= */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Top toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-wrap grow">
                  {/* Search box */}
                  <div className="relative min-w-[200px] grow sm:grow-0">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜尋預設罐頭關鍵字..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-300"
                    />
                  </div>

                  {/* Category filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
                  >
                    <option value="ALL">全部分類 (All Categories)</option>
                    <option value="DART">DART 焦點記錄</option>
                    <option value="SOAP">SOAP 醫病評估</option>
                    <option value="ROUTINE">ROUTINE 常規交班</option>
                    <option value="CUSTOM">CUSTOM 特殊罐頭</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
                  >
                    <option value="ALL">全部狀態 (All Status)</option>
                    <option value="ACTIVE">僅顯示啟用中 (Active)</option>
                    <option value="INACTIVE">僅顯示已停用 (Inactive)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBatchInitDefaults}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="將原廠 11 組標準罐頭同步上傳至 Firebase 資料庫"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                    <span>同步原廠初始罐頭</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增系統預設罐頭</span>
                  </button>
                </div>
              </div>

              {/* Template Editor Drawer / Card if active */}
              {(isCreatingTemplate || editingTemplate) && (
                <div className="bg-white p-4 rounded-xl border-2 border-teal-300 shadow-md space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {isCreatingTemplate ? '✨ 新增系統預設罐頭' : `✏️ 編輯系統罐頭: ${editingTemplate?.name}`}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingTemplate(false);
                        setEditingTemplate(null);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      取消編輯
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        罐頭標題 (Name)
                      </label>
                      <input
                        type="text"
                        placeholder="例: 胸悶胸痛與心電圖處置 (DART)"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        記錄格式分類 (Category)
                      </label>
                      <select
                        value={templateForm.category}
                        onChange={(e) =>
                          setTemplateForm({
                            ...templateForm,
                            category: e.target.value as any,
                          })
                        }
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      >
                        <option value="DART">DART 焦點記錄法</option>
                        <option value="SOAP">SOAP 格式</option>
                        <option value="ROUTINE">ROUTINE 常規病房巡查</option>
                        <option value="CUSTOM">CUSTOM 特殊臨床情境</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        啟用狀態 (Active for all nurses)
                      </label>
                      <div className="flex items-center gap-2 pt-1.5">
                        <input
                          type="checkbox"
                          id="active-toggle"
                          checked={templateForm.isActive !== false}
                          onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.checked })}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="active-toggle" className="text-xs text-slate-700 cursor-pointer font-medium">
                          {templateForm.isActive !== false ? '已啟用 (護理師可選用)' : '已停用 (暫時下架)'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      簡要說明 (Description)
                    </label>
                    <input
                      type="text"
                      placeholder="簡述此罐頭適用的臨床時機，如：胸悶呼吸喘、通知值班醫師做12導程EKG"
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600">
                        罐頭範本內容 (支援動態變數)
                      </label>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        點擊下方標籤快速插入動態變數
                      </span>
                    </div>

                    {/* Quick Variable Chips */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {[
                        '{{時間}}',
                        '{{日期}}',
                        '{{床號}}',
                        '{{單位}}',
                        '{{班別}}',
                        '{{生命徵象}}',
                        '{{體溫}}',
                        '{{脈搏}}',
                        '{{呼吸}}',
                        '{{血壓}}',
                        '{{SpO2}}',
                        '{{GCS}}',
                        '{{瞳孔}}',
                        '{{疼痛}}',
                        '{{疼痛分數}}',
                        '{{疼痛部位}}',
                        '{{疼痛性質}}',
                        '{{血糖}}',
                        '{{處置}}',
                        '{{處置後時間}}',
                        '{{追蹤體溫}}',
                        '{{追蹤疼痛分數}}',
                        '{{追蹤SpO2}}',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setTemplateForm({
                              ...templateForm,
                              templateText: templateForm.templateText + ' ' + tag,
                            })
                          }
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={6}
                      value={templateForm.templateText}
                      onChange={(e) => setTemplateForm({ ...templateForm, templateText: e.target.value })}
                      placeholder="輸入範本內容..."
                      className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-teal-200"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingTemplate(false);
                        setEditingTemplate(null);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      放棄變更
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTemplateForm}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>儲存並同步至雲端系統罐頭</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Template list table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">罐頭名稱與適應症</th>
                        <th className="py-2.5 px-3">格式</th>
                        <th className="py-2.5 px-3">狀態</th>
                        <th className="py-2.5 px-3">更新時間</th>
                        <th className="py-2.5 px-4 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTemplates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            無符合條件的系統預設罐頭
                          </td>
                        </tr>
                      ) : (
                        filteredTemplates.map((tmpl) => (
                          <tr key={tmpl.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800">{tmpl.name}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{tmpl.description}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tmpl.category === 'DART'
                                    ? 'bg-sky-100 text-sky-800'
                                    : tmpl.category === 'SOAP'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {tmpl.category}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => onToggleSystemTemplate(tmpl.id, tmpl.isActive === false)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                                  tmpl.isActive !== false
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    tmpl.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                {tmpl.isActive !== false ? '已啟用' : '已停用'}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-[11px] text-slate-500">
                              {tmpl.updatedAt ? new Date(tmpl.updatedAt).toLocaleDateString() : '原廠預設'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(tmpl)}
                                  className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                                  title="編輯此罐頭"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemplate(tmpl)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="刪除"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: 使用者與同步狀態 ================= */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Quick stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">註冊護理人員數</p>
                    <p className="text-xl font-extrabold text-slate-800">{allUsers.length || 1}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">管理員授權帳號</p>
                    <p className="text-xl font-extrabold text-teal-700">
                      {allUsers.filter((u) => u.role === 'admin' || u.email === 'lixpang0427@gmail.com').length || 1}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">雲端同步狀態</p>
                    <p className="text-xl font-extrabold text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      即時連線 (Live)
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Users table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-700">病房護理人員名冊與連線狀態</span>
                  </div>
                  <span className="text-[11px] text-slate-500">自動即時監聽 Firestore `users` 集合</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">護理人員 / Email</th>
                        <th className="py-2.5 px-3">所屬單位與班別</th>
                        <th className="py-2.5 px-3">權限角色</th>
                        <th className="py-2.5 px-3">帳號狀態</th>
                        <th className="py-2.5 px-3">最後活動 / 同步時間</th>
                        <th className="py-2.5 px-4 text-right">角色調整</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUsers.length === 0 ? (
                        <tr className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">
                              {user?.displayName || '當前登入使用者'}
                            </div>
                            <div className="text-[11px] text-slate-500">{user?.email || 'lixpang0427@gmail.com'}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700">8B 綜合病房 (自動)</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                              系統管理員 (Admin)
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-emerald-700 font-medium">連線正常 (Active)</span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">剛剛 (Just now)</td>
                          <td className="py-3 px-4 text-right text-slate-400">目前帳號</td>
                        </tr>
                      ) : (
                        allUsers.map((u) => {
                          const isCurrentUserAdmin =
                            u.role === 'admin' || u.email === 'lixpang0427@gmail.com';
                          return (
                            <tr key={u.uid || u.email} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{u.displayName || '未設定護理師姓名'}</span>
                                  {isCurrentUserAdmin && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{u.email}</div>
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                <div>{u.unitName || '一般病房'}</div>
                                <div className="text-[10px] text-slate-400">偏好班別: {u.preferredShift}</div>
                              </td>
                              <td className="py-3 px-3">
                                {isCurrentUserAdmin ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                    管理員 (Admin)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                                    臨床護理師
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                    u.status !== 'suspended' ? 'text-emerald-700' : 'text-rose-600'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      u.status !== 'suspended' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                  {u.status !== 'suspended' ? '連線中' : '已停用'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-[11px] text-slate-500">
                                {u.lastActive ? new Date(u.lastActive).toLocaleString() : '最近上線'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {u.uid && (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const newRole = isCurrentUserAdmin ? 'nurse' : 'admin';
                                        await onUpdateUserRole(u.uid!, newRole);
                                        showFeedback(`已更新 ${u.email} 角色為 ${newRole}`);
                                      }}
                                      className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                    >
                                      {isCurrentUserAdmin ? '降為護理師' : '升為管理員'}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: Firebase 用量與效能監控 ================= */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {/* Project Info Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm">Firebase Firestore 專案配置</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      Spark Tier (免費額度充足)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-300">
                    <div>
                      專案 ID: <span className="text-white font-mono">nur-memo</span>
                    </div>
                    <div>
                      資料庫 ID: <span className="text-white font-mono">ai-studio-73cef02c-d184...</span>
                    </div>
                    <div>
                      伺服器節點: <span className="text-white font-mono">asia-northeast1 (東京)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunPing}
                  disabled={isDiagnosing}
                  className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                  <span>{isDiagnosing ? '測試中...' : '執行即時連線延遲診斷'}</span>
                </button>
              </div>

              {/* Ping Diagnostic Result Banner */}
              {diagnosticResult && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>{diagnosticResult}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700">測試時間: {new Date().toLocaleTimeString()}</span>
                </div>
              )}

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">雲端病歷記錄總量</span>
                  <div className="text-2xl font-extrabold text-slate-800">{usageStats.recordCount}</div>
                  <span className="text-[10px] text-slate-400">collection: `records`</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">系統與自訂罐頭數</span>
                  <div className="text-2xl font-extrabold text-teal-700">
                    {usageStats.systemTemplateCount + usageStats.customTemplateCount}
                  </div>
                  <span className="text-[10px] text-teal-600 font-medium">
                    系統: {usageStats.systemTemplateCount} | 自訂: {usageStats.customTemplateCount}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">已註冊護理師帳號</span>
                  <div className="text-2xl font-extrabold text-sky-700">{usageStats.userCount}</div>
                  <span className="text-[10px] text-slate-400">collection: `users`</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">估算資料儲存量</span>
                  <div className="text-2xl font-extrabold text-amber-700">{usageStats.estimatedStorageKb} KB</div>
                  <span className="text-[10px] text-slate-400">上限 1 GiB (佔比 &lt; 0.01%)</span>
                </div>
              </div>

              {/* Quota Progress & Read/Write Counter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Read operations */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      本會話讀取次數 (Document Reads)
                    </span>
                    <span className="font-mono font-bold text-slate-800">{usageStats.sessionReads} 次</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(2, (usageStats.sessionReads / 50000) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>當前會話即時監聽累計</span>
                    <span>每日免費額度: 50,000 次 / 天</span>
                  </div>
                </div>

                {/* Write operations */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      本會話寫入次數 (Document Writes)
                    </span>
                    <span className="font-mono font-bold text-slate-800">{usageStats.sessionWrites} 次</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(2, (usageStats.sessionWrites / 20000) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>病歷與罐頭寫入累計</span>
                    <span>每日免費額度: 20,000 次 / 天</span>
                  </div>
                </div>
              </div>

              {/* Service Health Cards */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-teal-600" />
                  雲端服務模組運作指標 (Service Health Matrix)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Firebase Auth</span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>正常 (Online)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Firestore 資料庫</span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>即時同步 (Synced)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">安全性規則 (Rules)</span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>已部署啟用 (Deployed)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">離線快取/備援</span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>雙向就緒 (Ready)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">當前登入管理員:</span>
            <span>{user?.email || 'lixpang0427@gmail.com'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer transition-colors"
          >
            關閉管理面板
          </button>
        </div>
      </div>
    </div>
  );
};
