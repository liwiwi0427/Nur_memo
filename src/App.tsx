import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  PatientContext,
  VitalSignsData,
  GCSData,
  InterventionData,
  CannedTemplate,
  SavedRecord,
  ShiftType,
  UserSettings,
} from './types';
import { replaceTemplateVariables } from './utils/templateReplacer';
import { PatientContextForm } from './components/PatientContextForm';
import { VitalSignsForm } from './components/VitalSignsForm';
import { GCSForm } from './components/GCSForm';
import { TemplateSelector } from './components/TemplateSelector';
import { RecordPreview } from './components/RecordPreview';
import { SavedRecordsDrawer } from './components/SavedRecordsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { ClinicalReferenceModal } from './components/ClinicalReferenceModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { useAuth } from './context/AuthContext';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import {
  ClipboardList,
  BookOpen,
  History,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Hospital,
  Settings,
  LogIn,
  LogOut,
  UserCheck,
  Cloud,
  CloudOff,
  User,
  ChevronDown,
  Clock,
  Thermometer,
  Activity,
  Wind,
  KeyRound,
  Building2,
  CheckCircle2,
  Users,
} from 'lucide-react';

export default function App() {
  const {
    user,
    userSettings,
    isAdmin,
    updateUserSettings,
    logout,
    loginWithEmail,
    registerWithEmail,
    loginAsLocalNurse,
  } = useAuth();
  const {
    records: savedRecords,
    templates,
    systemTemplates,
    allUsers,
    usageStats,
    isSyncing,
    cloudStatus,
    saveRecord: handleSaveRecord,
    deleteRecord: handleDeleteRecord,
    clearAllRecords: handleClearAllRecords,
    saveCustomTemplate: handleSaveCustomTemplate,
    deleteCustomTemplate: handleDeleteCustomTemplate,
    resetDefaultTemplates: handleResetDefaults,
    saveSystemTemplate: handleSaveSystemTemplate,
    deleteSystemTemplate: handleDeleteSystemTemplate,
    toggleSystemTemplateActive: handleToggleSystemTemplate,
    initializeDefaultSystemTemplates: handleInitDefaultSystemTemplates,
    updateUserRole: handleUpdateUserRole,
    updateUserStatus: handleUpdateUserStatus,
    runDiagnosticPing: handleRunDiagnosticPing,
  } = useFirestoreSync(user, isAdmin);

  // Custom User Menu and Quick Login Dropdowns
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickLoginRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (quickLoginRef.current && !quickLoginRef.current.contains(e.target as Node)) {
        setIsQuickLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Quick 1-Click Nurse Login Helper (with automatic fallback if Firebase Email/Password auth isn't enabled)
  const handleQuickNurseLogin = async (type: 'nurseA' | 'nurseB') => {
    const email = type === 'nurseA' ? 'nurse.lin@hospital.tw' : 'nurse.chen@hospital.tw';
    const pass = 'nurse123456';
    const name = type === 'nurseA' ? '林雅婷 N2 (MICU)' : '陳冠宇 RN (8B病房)';
    try {
      try {
        await loginWithEmail(email, pass);
      } catch (loginErr: any) {
        const code = loginErr?.code || '';
        if (code === 'auth/operation-not-allowed') {
          loginAsLocalNurse(email, name, 'nurse');
          setIsQuickLoginOpen(false);
          return;
        }
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
          try {
            await registerWithEmail(email, pass, name);
          } catch (regErr: any) {
            if (regErr?.code === 'auth/operation-not-allowed') {
              loginAsLocalNurse(email, name, 'nurse');
              setIsQuickLoginOpen(false);
              return;
            }
            throw regErr;
          }
        } else {
          throw loginErr;
        }
      }
      setIsQuickLoginOpen(false);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        loginAsLocalNurse(email, name, 'nurse');
        setIsQuickLoginOpen(false);
      } else {
        setIsAuthModalOpen(true);
        setIsQuickLoginOpen(false);
      }
    }
  };

  // Settings State
  const activeSettings: UserSettings = useMemo(() => {
    if (userSettings) return userSettings;
    return {
      unitName: '8B 綜合病房',
      preferredShift: 'auto',
      defaultBedPrefix: '8B-',
      nurseSignature: '',
    };
  }, [userSettings]);

  // Current Date & Time initialization
  const getInitialContext = (): PatientContext => {
    const now = new Date();
    const hours = now.getHours();
    let defaultShift: ShiftType = 'day';
    if (activeSettings.preferredShift !== 'auto') {
      defaultShift = activeSettings.preferredShift;
    } else {
      if (hours >= 16 && hours < 24) defaultShift = 'evening';
      else if (hours < 8) defaultShift = 'night';
    }

    return {
      unitName: activeSettings.unitName || '8B 綜合病房',
      bedNumber: activeSettings.defaultBedPrefix ? `${activeSettings.defaultBedPrefix}12` : '12-1',
      recordDate: now.toISOString().split('T')[0],
      recordTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      shift: defaultShift,
      chiefComplaint: '無特殊主訴',
      nurseName: activeSettings.nurseSignature || '',
    };
  };

  const [context, setContext] = useState<PatientContext>(getInitialContext);

  // Update context defaults when settings change
  React.useEffect(() => {
    if (activeSettings.unitName) {
      setContext((prev) => ({
        ...prev,
        unitName: activeSettings.unitName,
        shift: activeSettings.preferredShift !== 'auto' ? activeSettings.preferredShift : prev.shift,
        nurseName: activeSettings.nurseSignature || prev.nurseName,
      }));
    }
  }, [activeSettings]);

  const [vitalSigns, setVitalSigns] = useState<VitalSignsData>({
    bt: '36.8',
    hr: '76',
    rr: '18',
    sbp: '120',
    dbp: '78',
    spo2: '98',
    o2Device: 'Room Air',
    o2Flow: '',
    painScore: '0',
    painLocation: '手術傷口',
    painNature: '悶痛',
    bloodSugar: '',
  });

  const [gcs, setGcs] = useState<GCSData>({
    eye: 4,
    verbal: 5,
    motor: 6,
    leftPupilSize: '2.5',
    rightPupilSize: '2.5',
    leftPupilReflex: '+',
    rightPupilReflex: '+',
  });

  const [intervention, setIntervention] = useState<InterventionData>({
    focusCategory: '常規病況穩定',
    actionDetail: '予常規病房巡房，維持病室安全，床欄拉起固定，呼叫鈴置於身旁，衛教下床防跌',
    responseDetail: '病人精神可，情緒平穩，表示清楚防跌注意事項',
    followUpTime: '每班巡房',
    followUpBT: '36.8',
    followUpPain: '0',
    followUpSpO2: '98',
    followUpRR: '18',
    customNotes: '',
    drainTubeName: 'JP引流管',
    drainAmount: '25',
    drainColor: '淡血水色',
    woundLocation: '腹部傷口',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<CannedTemplate>(templates[0] || {
    id: 'dart-routine',
    name: '#常規病況穩定 (DART)',
    category: 'DART',
    description: '病房每班常規巡房、防跌安全評估與生命徵象穩定記錄',
    templateText: `{{時間}} #常規病況穩定\nD: 病人意識清楚 (GCS: {{GCS}})，雙側瞳孔等大 {{瞳孔}}。生命徵象測量值：{{生命徵象}}。呼吸平順未發紺，無胸悶呼吸喘，皮膚溫暖微乾。{{疼痛}}。無主訴不適。\nA: 予以常規護理巡房，維持病室環境安靜整潔。病床降至最低高度，雙側床欄確實拉起定位固定，呼叫鈴置於病人隨手可觸及處。衛教病患及家屬下床活動需有陪病者攙扶協助，漸進式起身防範姿位性低血壓跌倒。\nR: 病患表示清楚理解下床防跌注意事項，能遵從指示呼叫醫護人員協助。各項生命徵象平穩，持續給予病房常規照護與每班巡查。`,
  });

  // Keep selectedTemplate in sync if templates array changes
  React.useEffect(() => {
    if (templates.length > 0) {
      const exists = templates.find((t) => t.id === selectedTemplate.id);
      if (!exists) setSelectedTemplate(templates[0]);
    }
  }, [templates]);

  // Generated Text State & Manual Override
  const [manualText, setManualText] = useState<string | null>(null);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Compute Auto Generated Text
  const autoGeneratedText = useMemo(() => {
    return replaceTemplateVariables(selectedTemplate.templateText, context, vitalSigns, gcs, intervention);
  }, [selectedTemplate, context, vitalSigns, gcs, intervention]);

  const displayedText = manualText !== null ? manualText : autoGeneratedText;

  // Handle template selection
  const handleSelectTemplate = (tmpl: CannedTemplate) => {
    setSelectedTemplate(tmpl);
    setManualText(null);
  };

  // Handle load record into editor
  const handleLoadRecord = (record: SavedRecord) => {
    setContext((prev) => ({
      ...prev,
      unitName: record.unitName || prev.unitName,
      bedNumber: record.bedNumber,
      recordDate: record.date,
      recordTime: record.time,
      shift: record.shift,
    }));
    setManualText(record.content);
    const el = document.getElementById('record-preview-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Quick Clinical Case Scenarios
  const applyClinicalCase = (type: 'fever' | 'pain' | 'dyspnea' | 'routine') => {
    setManualText(null);
    if (type === 'fever') {
      const tmpl = templates.find((t) => t.id === 'dart-fever') || templates[0];
      setSelectedTemplate(tmpl);
      setVitalSigns({
        bt: '38.8',
        hr: '104',
        rr: '22',
        sbp: '130',
        dbp: '82',
        spo2: '97',
        o2Device: 'Room Air',
        o2Flow: '',
        painScore: '0',
        painLocation: '',
        painNature: '',
        bloodSugar: '',
      });
      setIntervention((prev) => ({
        ...prev,
        actionDetail: '依醫囑給予 Acetaminophen 500mg 1# PO，提供冰枕使用，鼓勵多喝溫開水與保暖',
        followUpTime: '1小時後',
        followUpBT: '37.1',
      }));
    } else if (type === 'pain') {
      const tmpl = templates.find((t) => t.id === 'dart-pain') || templates[0];
      setSelectedTemplate(tmpl);
      setVitalSigns({
        bt: '36.8',
        hr: '88',
        rr: '20',
        sbp: '138',
        dbp: '86',
        spo2: '98',
        o2Device: 'Room Air',
        o2Flow: '',
        painScore: '6',
        painLocation: '腹部手術傷口',
        painNature: '牽扯刺痛',
        bloodSugar: '',
      });
      setIntervention((prev) => ({
        ...prev,
        actionDetail: '依醫囑給予 Ultracet 1# PO，協助抬高床頭與膝部墊枕採舒適臥位，指導深呼吸放鬆',
        followUpTime: '45分鐘後',
        followUpPain: '2',
      }));
    } else if (type === 'dyspnea') {
      const tmpl = templates.find((t) => t.id === 'dart-dyspnea') || templates[0];
      setSelectedTemplate(tmpl);
      setVitalSigns({
        bt: '37.0',
        hr: '112',
        rr: '26',
        sbp: '144',
        dbp: '90',
        spo2: '90',
        o2Device: 'Nasal Cannula',
        o2Flow: '3',
        painScore: '0',
        painLocation: '',
        painNature: '',
        bloodSugar: '',
      });
      setIntervention((prev) => ({
        ...prev,
        actionDetail: '立即協助床頭抬高 60 度採半坐臥姿，給予 Nasal cannula 3 L/min 使用，並即刻通知值班醫師到場評估',
        followUpTime: '30分鐘後',
        followUpSpO2: '98',
        followUpRR: '18',
      }));
    } else {
      const tmpl = templates.find((t) => t.id === 'dart-routine') || templates[0];
      setSelectedTemplate(tmpl);
      setVitalSigns({
        bt: '36.7',
        hr: '74',
        rr: '18',
        sbp: '118',
        dbp: '76',
        spo2: '98',
        o2Device: 'Room Air',
        o2Flow: '',
        painScore: '0',
        painLocation: '',
        painNature: '',
        bloodSugar: '',
      });
      setGcs({
        eye: 4,
        verbal: 5,
        motor: 6,
        leftPupilSize: '2.5',
        rightPupilSize: '2.5',
        leftPupilReflex: '+',
        rightPupilReflex: '+',
      });
      setIntervention((prev) => ({
        ...prev,
        actionDetail: '予常規病房巡房，維持病室安全，床欄拉起固定，呼叫鈴置於身旁，衛教下床防跌',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  護理記錄快打產生器
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  臨床護理即時代入
                </span>
                {user ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    Firebase 雲端已連線
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 inline-flex items-center gap-1">
                    <CloudOff className="w-3 h-3 text-slate-600" />
                    本機單機模式
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 hidden md:block">
                快速輸入生命徵象、昏迷指數與臨床處置，自動套入焦點罐頭片語，一鍵複製貼入HIS系統
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Case Populators */}
            <div className="hidden xl:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-600 font-medium px-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                案例快捷:
              </span>
              <button
                type="button"
                onClick={() => applyClinicalCase('routine')}
                className="px-2 py-0.5 rounded text-[11px] font-medium hover:bg-white hover:shadow-xs transition-colors cursor-pointer text-slate-700 flex items-center gap-1"
                title="快速套用常規巡房數值與記錄"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                <span>常規巡房</span>
              </button>
              <button
                type="button"
                onClick={() => applyClinicalCase('fever')}
                className="px-2 py-0.5 rounded text-[11px] font-medium hover:bg-white hover:shadow-xs transition-colors cursor-pointer text-amber-800 flex items-center gap-1"
                title="快速帶入體溫 38.8℃ 與退燒處置"
              >
                <Thermometer className="w-3 h-3 text-amber-500" />
                <span>發燒處置</span>
              </button>
              <button
                type="button"
                onClick={() => applyClinicalCase('pain')}
                className="px-2 py-0.5 rounded text-[11px] font-medium hover:bg-white hover:shadow-xs transition-colors cursor-pointer text-rose-800 flex items-center gap-1"
                title="快速帶入傷口疼痛 NRS 7 分與止痛處置"
              >
                <Activity className="w-3 h-3 text-rose-500" />
                <span>止痛評估</span>
              </button>
              <button
                type="button"
                onClick={() => applyClinicalCase('dyspnea')}
                className="px-2 py-0.5 rounded text-[11px] font-medium hover:bg-white hover:shadow-xs transition-colors cursor-pointer text-sky-800 flex items-center gap-1"
                title="快速帶入 SpO2 89% 與氧氣鼻導管給氧處置"
              >
                <Wind className="w-3 h-3 text-sky-500" />
                <span>呼吸喘給氧</span>
              </button>
            </div>

            {/* Reference Guide Button */}
            <button
              type="button"
              id="open-reference-modal-button"
              onClick={() => setIsReferenceModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">臨床速查表</span>
            </button>

            {/* Settings Menu Button */}
            <button
              type="button"
              id="open-settings-menu-button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="偏好病房單位與班別設定"
            >
              <Settings className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">偏好設定</span>
              {activeSettings.unitName && (
                <span className="max-w-[65px] truncate text-[10px] bg-teal-100 text-teal-800 px-1 py-0.5 rounded hidden lg:inline">
                  {activeSettings.unitName}
                </span>
              )}
            </button>

            {/* Admin Console Button */}
            <button
              type="button"
              id="open-admin-portal-button"
              onClick={() => setIsAdminModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border border-slate-700 hover:border-teal-400/60"
              title="系統管理員主控台：管理預設罐頭、使用者與 Firebase 雲端用量監控"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>管理員後台</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono">
                Admin
              </span>
            </button>

            {/* Integrated Login & User Interface */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  id="user-profile-menu-button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/90 py-1 px-2.5 rounded-lg transition-all cursor-pointer group shadow-2xs"
                  title="點擊開啟個人檔案與雲端同步選單"
                >
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
                      {(user.displayName || user.email || 'N').slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-950 leading-tight flex items-center gap-1">
                      <span className="max-w-[90px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                      {isAdmin && (
                        <span className="text-[9px] bg-slate-900 text-teal-300 px-1 rounded font-mono">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-700 leading-none">
                      {activeSettings.unitName || '臨床護理站'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ml-0.5" />
                </button>

                {/* Dropdown User Profile & Cloud Control Card */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                    {/* User Card Header */}
                    <div className="p-3 bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-xl border border-slate-100 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {(user.displayName || user.email || 'N').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                            <span>{user.displayName || user.email?.split('@')[0]}</span>
                            {isAdmin && (
                              <span className="text-[9px] px-1 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">
                                管理員
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                          <div className="text-[10px] text-teal-700 font-medium mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-teal-600" />
                            <span>{activeSettings.unitName || '未指定病房單位'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cloud Sync Status */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                          Firebase 雲端同步
                        </span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          即時連線中
                        </span>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2 text-center">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500">已存病歷</div>
                        <div className="text-sm font-bold text-slate-800">{savedRecords.length} 筆</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500">可用罐頭</div>
                        <div className="text-sm font-bold text-teal-700">{templates.length} 組</div>
                      </div>
                    </div>

                    {/* Navigation items */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium">設定常規病房與輪班</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAdminModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-teal-50 text-teal-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-medium">系統管理員主控台</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium">切換其他同仁帳號</span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span className="font-bold">安全登出帳號</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Main Login Button */}
                <button
                  type="button"
                  id="open-auth-modal-button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>護理同仁登入</span>
                </button>

                {/* Quick 1-Click Fast Login Dropdown */}
                <div className="relative" ref={quickLoginRef}>
                  <button
                    type="button"
                    onClick={() => setIsQuickLoginOpen(!isQuickLoginOpen)}
                    className="px-2 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="免打字一鍵速登臨床示範護理師帳號"
                  >
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span className="hidden sm:inline">一鍵速登</span>
                    <ChevronDown className="w-3 h-3 text-teal-600" />
                  </button>

                  {isQuickLoginOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        臨床測試帳號一鍵切換
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickNurseLogin('nurseA')}
                        className="w-full text-left px-3 py-2 hover:bg-teal-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px]">
                          林
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">林雅婷 N2</div>
                          <div className="text-[10px] text-slate-500">加護病房 (MICU)</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickNurseLogin('nurseB')}
                        className="w-full text-left px-3 py-2 hover:bg-teal-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                          陳
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">陳冠宇 RN</div>
                          <div className="text-[10px] text-slate-500">8B 綜合病房</div>
                        </div>
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsQuickLoginOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-teal-700 font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                        <span>自訂帳號登入 / 註冊...</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jump to Saved Records */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('saved-records-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>已存 ({savedRecords.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 w-full grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Data Input Modules (Context, Vital Signs, GCS, Template Selector) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Date, Time, Shift, Bed & Intervention */}
            <PatientContextForm
              context={context}
              intervention={intervention}
              onContextChange={setContext}
              onInterventionChange={setIntervention}
            />

            {/* 2. Vital Signs & Pain & Blood Sugar */}
            <VitalSignsForm vitalSigns={vitalSigns} onChange={setVitalSigns} />

            {/* 3. GCS Neurological Score & Pupils */}
            <GCSForm gcs={gcs} onChange={setGcs} />

            {/* 4. Canned Template Selector & Customizer */}
            <TemplateSelector
              templates={templates}
              selectedTemplateId={selectedTemplate.id}
              onSelectTemplate={handleSelectTemplate}
              onSaveCustomTemplate={handleSaveCustomTemplate}
              onDeleteCustomTemplate={handleDeleteCustomTemplate}
              onResetDefaults={handleResetDefaults}
            />
          </div>

          {/* Right Column: Live Generated Record & Local History Scratchpad */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* Live Generated Record Output Card */}
            <RecordPreview
              generatedText={displayedText}
              onTextChange={(newTxt) => setManualText(newTxt)}
              currentTemplate={selectedTemplate}
              context={context}
              vitalSigns={vitalSigns}
              onSaveRecord={handleSaveRecord}
              onResetRecord={() => setManualText(null)}
            />

            {/* Saved Records Drawer */}
            <SavedRecordsDrawer
              records={savedRecords}
              onLoadRecord={handleLoadRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAllRecords}
              isSyncing={isSyncing}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Hospital className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold text-slate-700">護理記錄快打產生器</span>
            <span>- 臨床輔助工具，專供病房、ICU、門急診快速書寫代入</span>
          </div>
          <div className="text-slate-600 flex items-center gap-2">
            {user ? (
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <Cloud className="w-3.5 h-3.5" />
                已連接 Firebase 專案（代號：965874093834 / nur-memo），記錄與偏好已即時安全同步
              </span>
            ) : (
              <span>登入帳號即可啟用 Firebase 雲端自動同步，跨裝置安全備份護理記錄與自訂罐頭</span>
            )}
          </div>
        </div>
      </footer>

      {/* Clinical Reference Handbook Modal */}
      <ClinicalReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />

      {/* User Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={activeSettings}
        onSaveSettings={updateUserSettings}
      />

      {/* Auth Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Admin Management Dashboard Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        systemTemplates={systemTemplates}
        allUsers={allUsers}
        usageStats={usageStats}
        onSaveSystemTemplate={handleSaveSystemTemplate}
        onDeleteSystemTemplate={handleDeleteSystemTemplate}
        onToggleSystemTemplate={handleToggleSystemTemplate}
        onInitDefaults={handleInitDefaultSystemTemplates}
        onUpdateUserRole={handleUpdateUserRole}
        onUpdateUserStatus={handleUpdateUserStatus}
        onRunDiagnosticPing={handleRunDiagnosticPing}
      />
    </div>
  );
}
