import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  UserPlus,
  X,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Shield,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CloudCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const [isRegister, setIsRegister] = useState(defaultMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (!email || !password) {
      setErrorMsg('請輸入電子信箱與密碼');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('密碼長度至少需 6 個字元');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName.trim());
        setSuccessNotice('註冊成功！已自動登入並建立個人專屬雲端庫');
      } else {
        await loginWithEmail(email, password);
        setSuccessNotice('登入成功！正在載入您的護理資料與偏好');
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('帳號或密碼不正確，若尚未註冊可切換至「註冊新人員帳號」');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('此電子郵件已被註冊，請直接點選切換至「護理同仁登入」');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('電子郵件格式不正確');
      } else {
        setErrorMsg(err.message || '操作失敗，請稍後再試');
      }
    }
  };

  // Instant 1-Click Login / Auto-provision demo nurse account
  const handleInstantQuickLogin = async (type: 'nurseA' | 'nurseB' | 'admin') => {
    setErrorMsg('');
    setSuccessNotice('');
    setIsSubmitting(true);

    let targetEmail = '';
    let targetPass = 'nurse123456';
    let targetName = '';

    if (type === 'nurseA') {
      targetEmail = 'nurse.lin@hospital.tw';
      targetName = '林雅婷 N2 (MICU)';
    } else if (type === 'nurseB') {
      targetEmail = 'nurse.chen@hospital.tw';
      targetName = '陳冠宇 RN (8B病房)';
    } else {
      targetEmail = 'lixpang0427@gmail.com';
      targetPass = 'admin123456';
      targetName = '系統管理員 (Admin)';
    }

    setEmail(targetEmail);
    setPassword(targetPass);
    if (type !== 'admin') {
      setDisplayName(targetName);
    }

    try {
      // First attempt direct login
      try {
        await loginWithEmail(targetEmail, targetPass);
        setSuccessNotice(`登入成功！歡迎 ${targetName}`);
      } catch (loginErr: any) {
        // If account does not exist on Firebase yet, auto-register it seamlessly
        const code = loginErr?.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
          await registerWithEmail(targetEmail, targetPass, targetName);
          setSuccessNotice(`首次使用已自動建立帳號並登入！歡迎 ${targetName}`);
        } else {
          throw loginErr;
        }
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || '快速登入失敗，請手動輸入帳號密碼');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-inner">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200">
                  Firebase Cloud Sync
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  已就緒
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">護理人員登入與同步專區</h2>
            </div>
          </div>
          <p className="text-xs text-teal-100 leading-relaxed">
            登入後可自動將病歷速記、自訂 DART 罐頭語句與常規班別同步至雲端，跨護理站電腦與行動裝置無縫銜接。
          </p>
        </div>

        {/* Tab Switcher with Icons */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
              setSuccessNotice('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <LogIn className={`w-3.5 h-3.5 ${!isRegister ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>護理同仁登入</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
              setSuccessNotice('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isRegister
                ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <UserPlus className={`w-3.5 h-3.5 ${isRegister ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>註冊新人員帳號</span>
          </button>
        </div>

        {/* 1-Click Fast Login / Demo Switcher */}
        {!isRegister && (
          <div className="px-5 pt-4">
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  臨床快速切換登入 (一鍵速登)
                </span>
                <span className="text-[10px] text-teal-700 bg-teal-100/80 px-1.5 py-0.5 rounded font-mono">
                  免手動輸入
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleInstantQuickLogin('nurseA')}
                  className="p-2 bg-white hover:bg-teal-100/50 text-left border border-teal-200 rounded-lg shadow-2xs transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                      林
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-teal-800">
                        林雅婷 N2
                      </div>
                      <div className="text-[10px] text-slate-500">MICU 加護病房</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleInstantQuickLogin('nurseB')}
                  className="p-2 bg-white hover:bg-teal-100/50 text-left border border-teal-200 rounded-lg shadow-2xs transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                      陳
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-teal-800">
                        陳冠宇 RN
                      </div>
                      <div className="text-[10px] text-slate-500">8B 綜合病房</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-teal-200/50 flex justify-between items-center">
                <span className="text-[10px] text-teal-700">管理職權限帳號：</span>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleInstantQuickLogin('admin')}
                  className="text-[11px] font-bold text-slate-700 hover:text-teal-700 bg-white hover:bg-teal-50 px-2 py-1 rounded border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-teal-600" />
                  <span>管理員帳號 (lixpang)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
          {/* Status Notifications */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* If Register: Name */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                護理人員姓名 / 職稱代號
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例: 王雅婷 RN (員編 10892)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-300 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              電子郵件 (Email / 院內信箱)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nurse@hospital.tw"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-300 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              密碼 (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位字元"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-300 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>立即建立護理帳號並同步</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>安全登入雲端帳號</span>
              </>
            )}
          </button>

          {/* Guest Mode Assurance */}
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 flex flex-col items-center gap-1">
            <p className="text-[11px] text-slate-500">
              不想登入？系統支援本機離線模式，記錄與打字皆可正常運作
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-teal-700 font-medium underline cursor-pointer"
            >
              保持本機訪客模式並返回編輯
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

