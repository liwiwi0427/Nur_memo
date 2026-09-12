import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserSettings, PreferredShiftOption } from '../types';
import { Settings, Save, RotateCcw, X, Building2, Clock, Check, Bed, User, Cloud } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UserSettings>({ ...settings });
  const [savedBadge, setSavedBadge] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
      setSavedBadge(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedBadge(true);
    setTimeout(() => {
      setSavedBadge(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    const defaults: UserSettings = {
      unitName: '8B 綜合病房',
      preferredShift: 'auto',
      defaultBedPrefix: '8B-',
      nurseSignature: '',
    };
    setFormData(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">偏好設定 (User Defaults)</h3>
                {user && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5" />
                    已連線 Firebase 雲端
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">自訂預設病房單位與班別，往後開啟免重複輸入</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
          {/* Unit / Ward Name */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              預設病房 / 單位名稱 (Unit Name)
            </label>
            <input
              type="text"
              value={formData.unitName}
              onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
              placeholder="例: 8B 綜合病房, 內科加護病房(MICU), 急診檢傷"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-200 transition-all"
            />
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400">快速填入範例：</span>
              {['8B 綜合病房', '5A 外科病房', 'ICU 加護病房', '急診檢傷'].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setFormData({ ...formData, unitName: ex })}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Shift */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              預設記錄班別 (Preferred Shift Type)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(
                [
                  { key: 'auto', label: '依時間自動', sub: '系統計算' },
                  { key: 'day', label: '白班 (D)', sub: '08:00-16:00' },
                  { key: 'evening', label: '小夜 (E)', sub: '16:00-00:00' },
                  { key: 'night', label: '大夜 (N)', sub: '00:00-08:00' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredShift: opt.key as PreferredShiftOption })}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    formData.preferredShift === opt.key
                      ? 'border-teal-500 bg-teal-50/70 text-teal-900 font-semibold ring-1 ring-teal-400'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Bed Prefix */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1 text-xs">
              <Bed className="w-3.5 h-3.5 text-indigo-600" />
              預設床號前綴 (Bed Prefix)
            </label>
            <input
              type="text"
              value={formData.defaultBedPrefix}
              onChange={(e) => setFormData({ ...formData, defaultBedPrefix: e.target.value })}
              placeholder="例: 8B- 或 12-"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-200 transition-all"
            />
          </div>

          {/* Nurse Signature / ID */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1 text-xs">
              <User className="w-3.5 h-3.5 text-purple-600" />
              護理師簽章 / 員編 (選填)
            </label>
            <input
              type="text"
              value={formData.nurseSignature}
              onChange={(e) => setFormData({ ...formData, nurseSignature: e.target.value })}
              placeholder="例: 王雅婷 RN (99120)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-200 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 py-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              回復預設
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {savedBadge ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已儲存！</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>儲存設定</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
