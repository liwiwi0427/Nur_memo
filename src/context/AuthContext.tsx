import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserSettings } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userSettings: UserSettings | null;
  isAdmin: boolean;
  devAdminOverride: boolean;
  setDevAdminOverride: (val: boolean) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
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
      setUser(currentUser);
      if (currentUser) {
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

            // Update lastActive and role if admin in firestore
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
          console.error('Failed to load user profile from Firestore:', err);
          setUserSettings({
            ...DEFAULT_SETTINGS,
            role: currentUser.email === 'lixpang0427@gmail.com' ? 'admin' : 'nurse',
          });
        }
      } else {
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
      await setDoc(userDocRef, newSettings);
      setUserSettings(newSettings);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserSettings = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    if (user) {
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
        localStorage.setItem(`nursing_settings_${user.uid}`, JSON.stringify(newSettings));
      } catch (err) {
        console.error('Failed to persist user settings to Firestore:', err);
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
