import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, X, Stethoscope, AlertCircle, CheckCircle2, Shield, User, Lock, Mail } from 'lucide-react';

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
        setErrorMsg('帳號或密碼不正確，請重新檢查');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('此電子郵件已被註冊，請直接點選下方切換至登入');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('電子郵件格式不正確');
      } else {
        setErrorMsg(err.message || '操作失敗，請稍後再試');
      }
    }
  };

  const handleQuickDemoFill = (type: 'nurseA' | 'nurseB') => {
    if (type === 'nurseA') {
      setEmail('nurse.lin@hospital.tw');
      setPassword('nurse123456');
      setDisplayName('林雅婷 N2 (MICU)');
    } else {
      setEmail('nurse.chen@hospital.tw');
      setPassword('nurse123456');
      setDisplayName('陳冠宇 RN (8B病房)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 text-white p-6 relative">
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
              <span className="text-xs uppercase font-bold tracking-wider text-teal-200">
                Cloud Sync & Multi-User
              </span>
              <h2 className="text-xl font-bold tracking-tight">護理人員登入專區</h2>
            </div>
          </div>
          <p className="text-xs text-teal-100 leading-relaxed">
            登入後可將病歷速記、自訂 DART 罐頭語句與常規班別自動同步至 Firebase 雲端，跨裝置存取無縫銜接。
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              電子郵件 (Email)
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位字元"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-300 transition-all font-medium"
              />
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
                <span>立即註冊並啟用雲端同步</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>安全登入</span>
              </>
            )}
          </button>

          {/* Switch Login / Register */}
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            {isRegister ? (
              <p>
                已經有帳號？{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                  }}
                  className="text-teal-600 font-semibold hover:underline cursor-pointer"
                >
                  切換至登入
                </button>
              </p>
            ) : (
              <p>
                尚無帳號？{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMsg('');
                  }}
                  className="text-teal-600 font-semibold hover:underline cursor-pointer"
                >
                  建立新使用者
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 font-semibold text-slate-700 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>快速測試帶入帳號（免手動敲字）：</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('nurseA')}
                className="flex-1 py-1 px-2 bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200 rounded text-slate-700 transition-colors text-center cursor-pointer font-medium"
              >
                加護病房 林護理師
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('nurseB')}
                className="flex-1 py-1 px-2 bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200 rounded text-slate-700 transition-colors text-center cursor-pointer font-medium"
              >
                8B病房 陳護理師
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
