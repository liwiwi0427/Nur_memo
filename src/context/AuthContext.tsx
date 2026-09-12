import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserSettings } from '../types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isLocalSession?: boolean;
}

interface AuthContextType {
  user: (User | AppUser) | null;
  loading: boolean;
  userSettings: UserSettings | null;
  isAdmin: boolean;
  devAdminOverride: boolean;
  setDevAdminOverride: (val: boolean) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsLocalNurse: (email: string, displayName?: string, role?: 'nurse' | 'admin') => void;
  logout: () => Promise<void>;
  updateUserSettings: (settings: UserSettings) => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  unitName: '8B 綜合病房',
  preferredShift: 'auto',
  defaultBedPrefix: '8B-',
  nurseSignature: '',
  role: 'nurse',
  status: 'active',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User | AppUser) | null>(() => {
    try {
      const saved = localStorage.getItem('nursing_local_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(() => {
    try {
      const savedUser = localStorage.getItem('nursing_local_auth_session');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const savedSettings = localStorage.getItem(`nursing_settings_${u.uid}`);
        if (savedSettings) return JSON.parse(savedSettings);
      }
    } catch {}
    return null;
  });
  const [devAdminOverride, setDevAdminOverride] = useState<boolean>(() => {
    return localStorage.getItem('nursing_dev_admin_mode') === 'true';
  });

  const isAdmin = Boolean(
    devAdminOverride ||
    (user && (user.email === 'lixpang0427@gmail.com' || userSettings?.role === 'admin'))
  );

  const handleSetDevAdmin = (val: boolean) => {
    setDevAdminOverride(val);
    localStorage.setItem('nursing_dev_admin_mode', val ? 'true' : 'false');
  };

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Clear local simulation when a real Firebase user logs in
        localStorage.removeItem('nursing_local_auth_session');
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          const isLixPang = currentUser.email === 'lixpang0427@gmail.com';
          const assignedRole = isLixPang ? 'admin' : undefined;

          if (snap.exists()) {
            const data = snap.data();
            const resolvedRole = assignedRole || data.role || 'nurse';
            const updatedProfile: UserSettings = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || data.displayName || '',
              unitName: data.unitName || DEFAULT_SETTINGS.unitName,
              preferredShift: data.preferredShift || DEFAULT_SETTINGS.preferredShift,
              defaultBedPrefix: data.defaultBedPrefix || DEFAULT_SETTINGS.defaultBedPrefix,
              nurseSignature: data.nurseSignature || currentUser.displayName || '',
              role: resolvedRole,
              status: data.status || 'active',
              lastActive: new Date().toISOString(),
            };
            setUserSettings(updatedProfile);

            // Update lastActive and role in firestore
            await setDoc(userDocRef, {
              ...updatedProfile,
              lastActive: new Date().toISOString(),
            }, { merge: true });
          } else {
            // Check local fallback
            const localSaved = localStorage.getItem(`nursing_settings_${currentUser.uid}`);
            const initial = localSaved ? JSON.parse(localSaved) : DEFAULT_SETTINGS;
            const newDoc: UserSettings = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              ...initial,
              role: assignedRole || initial.role || 'nurse',
              createdAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              status: 'active',
            };
            await setDoc(userDocRef, newDoc);
            setUserSettings(newDoc);
          }
        } catch (err) {
          console.warn('Failed to load user profile from Firestore (using fallback):', err);
          setUserSettings({
            ...DEFAULT_SETTINGS,
            role: currentUser.email === 'lixpang0427@gmail.com' ? 'admin' : 'nurse',
          });
        }
      } else {
        // Check if there is an active local nurse session before resetting
        try {
          const savedLocal = localStorage.getItem('nursing_local_auth_session');
          if (savedLocal) {
            const parsed = JSON.parse(savedLocal);
            if (parsed && parsed.uid) {
              setUser(parsed);
              const localSettings = localStorage.getItem(`nursing_settings_${parsed.uid}`);
              if (localSettings) {
                setUserSettings(JSON.parse(localSettings));
              }
              setLoading(false);
              return;
            }
          }
        } catch {}
        setUser(null);
        setUserSettings(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, displayName?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && res.user) {
      await updateProfile(res.user, { displayName });
    }
    // create profile doc
    if (res.user) {
      const isLixPang = res.user.email === 'lixpang0427@gmail.com';
      const userDocRef = doc(db, 'users', res.user.uid);
      const newSettings: UserSettings = {
        ...DEFAULT_SETTINGS,
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: displayName || '',
        nurseSignature: displayName || '',
        role: isLixPang ? 'admin' : 'nurse',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'active',
      };
      try {
        await setDoc(userDocRef, newSettings);
      } catch (e) {
        console.warn('Could not save user profile to Firestore:', e);
      }
      setUserSettings(newSettings);
      localStorage.setItem(`nursing_settings_${res.user.uid}`, JSON.stringify(newSettings));
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginAsLocalNurse = (email: string, displayName?: string, role?: 'nurse' | 'admin') => {
    const cleanEmail = email.trim().toLowerCase();
    const isLixPang = cleanEmail === 'lixpang0427@gmail.com';
    const resolvedRole = role || (isLixPang ? 'admin' : 'nurse');
    const uid = 'local_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const localUser: AppUser = {
      uid,
      email: cleanEmail,
      displayName: displayName || (isLixPang ? '系統管理員' : cleanEmail.split('@')[0]),
      isLocalSession: true,
    };
    localStorage.setItem('nursing_local_auth_session', JSON.stringify(localUser));
    setUser(localUser);

    const localSaved = localStorage.getItem(`nursing_settings_${uid}`);
    const settings: UserSettings = localSaved
      ? JSON.parse(localSaved)
      : {
          ...DEFAULT_SETTINGS,
          uid,
          email: cleanEmail,
          displayName: localUser.displayName || '',
          nurseSignature: localUser.displayName || '',
          unitName: cleanEmail.includes('micu') || displayName?.includes('N2') ? 'MICU 加護病房' : '8B 綜合病房',
          role: resolvedRole,
          status: 'active',
          lastActive: new Date().toISOString(),
        };
    setUserSettings(settings);
    localStorage.setItem(`nursing_settings_${uid}`, JSON.stringify(settings));
  };

  const logout = async () => {
    localStorage.removeItem('nursing_local_auth_session');
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setUserSettings(null);
  };

  const updateUserSettings = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    if (user) {
      localStorage.setItem(`nursing_settings_${user.uid}`, JSON.stringify(newSettings));
      if (!user.isLocalSession) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(
            userDocRef,
            {
              ...newSettings,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Failed to persist user settings to Firestore:', err);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userSettings,
        isAdmin,
        devAdminOverride,
        setDevAdminOverride: handleSetDevAdmin,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsLocalNurse,
        logout,
        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
