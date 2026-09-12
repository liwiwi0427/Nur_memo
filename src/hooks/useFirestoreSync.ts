import { useState, useEffect, useRef, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SavedRecord, CannedTemplate, UserSettings, FirebaseUsageStats } from '../types';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { User } from 'firebase/auth';

const LOCAL_RECORDS_KEY = 'nursing_app_saved_records';
const LOCAL_TEMPLATES_KEY = 'nursing_app_custom_templates';
const LOCAL_SYSTEM_TEMPLATES_KEY = 'nursing_app_system_templates';

const DEFAULT_TEMPLATE_IDS = new Set(DEFAULT_TEMPLATES.map((t) => t.id));

export function useFirestoreSync(user: User | null, isAdmin: boolean = false) {
  const [records, setRecords] = useState<SavedRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_RECORDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [systemTemplates, setSystemTemplates] = useState<CannedTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SYSTEM_TEMPLATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, CannedTemplate>();
          parsed.forEach((t: CannedTemplate) => {
            if (t && t.id) map.set(t.id, t);
          });
          return Array.from(map.values());
        }
      }
    } catch {}
    return DEFAULT_TEMPLATES.map((t) => ({ ...t, isActive: true, isDefault: true }));
  });

  const [customTemplates, setCustomTemplates] = useState<CannedTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_TEMPLATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly filter out any default templates that were saved into custom templates key in earlier app versions
          const onlyCustom = parsed.filter(
            (t: CannedTemplate) => t && !t.isDefault && !DEFAULT_TEMPLATE_IDS.has(t.id)
          );
          if (onlyCustom.length !== parsed.length) {
            localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(onlyCustom));
          }
          return onlyCustom;
        }
      }
    } catch {}
    return [];
  });

  const [allUsers, setAllUsers] = useState<UserSettings[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'synced' | 'local'>('local');

  // Metrics state
  const [sessionReads, setSessionReads] = useState<number>(0);
  const [sessionWrites, setSessionWrites] = useState<number>(0);
  const [lastPingMs, setLastPingMs] = useState<number | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [syncHealth, setSyncHealth] = useState<'healthy' | 'degraded' | 'offline'>('healthy');

  const incReads = (count: number = 1) => setSessionReads((prev) => prev + count);
  const incWrites = (count: number = 1) => setSessionWrites((prev) => prev + count);

  // 1. Listen to System Templates from Firestore
  useEffect(() => {
    let isSubscribed = true;
    try {
      const sysCol = collection(db, 'system_templates');
      const unsub = onSnapshot(
        sysCol,
        (snapshot) => {
          if (!isSubscribed) return;
          incReads(snapshot.docChanges().length || 1);
          if (snapshot.empty) {
            // Not initialized yet in firestore, keep defaults
            setSystemTemplates(DEFAULT_TEMPLATES.map((t) => ({ ...t, isActive: true, isDefault: true })));
          } else {
            const map = new Map<string, CannedTemplate>();
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as CannedTemplate;
              map.set(docSnap.id, {
                ...data,
                id: docSnap.id,
                isDefault: true,
                isActive: data.isActive !== false,
              });
            });
            const list = Array.from(map.values());
            setSystemTemplates(list);
            localStorage.setItem(LOCAL_SYSTEM_TEMPLATES_KEY, JSON.stringify(list));
          }
        },
        (err) => {
          console.warn('System templates snapshot warning (using fallback):', err);
          setSystemTemplates(DEFAULT_TEMPLATES.map((t) => ({ ...t, isActive: true, isDefault: true })));
        }
      );
      return () => {
        isSubscribed = false;
        unsub();
      };
    } catch (e) {
      console.warn('Failed to listen to system templates:', e);
    }
  }, []);

  // 2. Firestore user records listener when user is logged in
  useEffect(() => {
    if (!user) {
      setCloudStatus('local');
      try {
        const saved = localStorage.getItem(LOCAL_RECORDS_KEY);
        if (saved) setRecords(JSON.parse(saved));
      } catch {}
      return;
    }

    setCloudStatus('synced');
    setIsSyncing(true);

    const q = query(collection(db, 'records'), where('userId', '==', user.uid));
    const unsubscribeRecords = onSnapshot(
      q,
      (snapshot) => {
        incReads(snapshot.docChanges().length || 1);
        const firestoreList: SavedRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as SavedRecord;
          firestoreList.push({
            ...data,
            id: docSnap.id,
          });
        });
        firestoreList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setRecords(firestoreList);
        setIsSyncing(false);
        localStorage.setItem(`records_user_${user.uid}`, JSON.stringify(firestoreList));
      },
      (err) => {
        console.error('Records snapshot error:', err);
        setIsSyncing(false);
      }
    );

    // Also listen to user's custom templates
    const tmplQ = query(collection(db, 'custom_templates'), where('userId', '==', user.uid));
    const unsubscribeTemplates = onSnapshot(
      tmplQ,
      (snapshot) => {
        incReads(snapshot.docChanges().length || 1);
        const userCustom: CannedTemplate[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CannedTemplate;
          if (!DEFAULT_TEMPLATE_IDS.has(docSnap.id)) {
            userCustom.push({
              ...data,
              id: docSnap.id,
              isDefault: false,
            });
          }
        });
        setCustomTemplates(userCustom);
      },
      (err) => {
        console.error('Templates snapshot error:', err);
      }
    );

    return () => {
      unsubscribeRecords();
      unsubscribeTemplates();
    };
  }, [user]);

  // 3. Admin: Listen to all registered users
  useEffect(() => {
    if (!isAdmin) {
      setAllUsers([]);
      return;
    }

    try {
      const usersCol = collection(db, 'users');
      const unsub = onSnapshot(
        usersCol,
        (snapshot) => {
          incReads(snapshot.docChanges().length || 1);
          const uList: UserSettings[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserSettings;
            uList.push({
              ...data,
              uid: docSnap.id,
            });
          });
          uList.sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''));
          setAllUsers(uList);
        },
        (err) => {
          console.warn('Admin users snapshot note:', err);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Users listener error:', err);
    }
  }, [isAdmin]);

  // Combined Active Templates for normal nursing use
  // Strictly deduplicated by template ID so no duplicate keys can ever occur
  const activeTemplates: CannedTemplate[] = useMemo(() => {
    const map = new Map<string, CannedTemplate>();
    // First, register system templates that are active
    systemTemplates
      .filter((t) => t.isActive !== false)
      .forEach((t) => {
        if (t && t.id) map.set(t.id, t);
      });
    // Then register custom templates (user custom templates take precedence if identical ID)
    customTemplates.forEach((t) => {
      if (t && t.id) map.set(t.id, t);
    });
    return Array.from(map.values());
  }, [systemTemplates, customTemplates]);

  // Save new record
  const saveRecord = async (recordData: Omit<SavedRecord, 'id' | 'createdAt'>) => {
    const recordId = 'rec_' + Date.now();
    const newRecord: SavedRecord = {
      ...recordData,
      id: recordId,
      userId: user ? user.uid : undefined,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      setIsSyncing(true);
      try {
        await setDoc(doc(db, 'records', recordId), newRecord);
        incWrites();
      } catch (err) {
        console.error('Failed to save record to Firestore:', err);
      } finally {
        setIsSyncing(false);
      }
    } else {
      const updated = [newRecord, ...records];
      setRecords(updated);
      localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(updated));
    }
  };

  // Delete single record
  const deleteRecord = async (recordId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'records', recordId));
        incWrites();
      } catch (err) {
        console.error('Failed to delete record in Firestore:', err);
      }
    } else {
      const updated = records.filter((r) => r.id !== recordId);
      setRecords(updated);
      localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(updated));
    }
  };

  // Clear all user records
  const clearAllRecords = async () => {
    if (user) {
      try {
        const batch = writeBatch(db);
        records.forEach((r) => {
          batch.delete(doc(db, 'records', r.id));
        });
        await batch.commit();
        incWrites(records.length);
      } catch (err) {
        console.error('Failed to clear records in Firestore:', err);
      }
    } else {
      setRecords([]);
      localStorage.removeItem(LOCAL_RECORDS_KEY);
    }
  };

  // Save or update custom template (Nurse user)
  const saveCustomTemplate = async (tmpl: CannedTemplate) => {
    if (user) {
      const docRef = doc(db, 'custom_templates', tmpl.id);
      await setDoc(
        docRef,
        {
          ...tmpl,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      incWrites();
    } else {
      const existingIdx = customTemplates.findIndex((t) => t.id === tmpl.id);
      let updated: CannedTemplate[];
      if (existingIdx >= 0) {
        updated = [...customTemplates];
        updated[existingIdx] = tmpl;
      } else {
        updated = [tmpl, ...customTemplates];
      }
      setCustomTemplates(updated);
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(updated));
    }
  };

  // Delete custom template (Nurse user)
  const deleteCustomTemplate = async (templateId: string) => {
    if (user) {
      await deleteDoc(doc(db, 'custom_templates', templateId));
      incWrites();
    } else {
      const updated = customTemplates.filter((t) => t.id !== templateId);
      setCustomTemplates(updated);
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(updated));
    }
  };

  // Reset to default templates (fallback)
  const resetDefaultTemplates = () => {
    setCustomTemplates([]);
    localStorage.removeItem(LOCAL_TEMPLATES_KEY);
  };

  // --- ADMIN OPERATIONS ---

  // Save or update system template
  const saveSystemTemplate = async (tmpl: CannedTemplate) => {
    const docId = tmpl.id || 'sys_' + Date.now();
    const docData: CannedTemplate = {
      ...tmpl,
      id: docId,
      isDefault: true,
      isActive: tmpl.isActive !== false,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'admin',
    };

    if (user) {
      try {
        await setDoc(doc(db, 'system_templates', docId), docData, { merge: true });
        incWrites();
      } catch (err) {
        console.error('Failed to save system template:', err);
        throw err;
      }
    } else {
      // Local admin preview
      const idx = systemTemplates.findIndex((t) => t.id === docId);
      let updated: CannedTemplate[];
      if (idx >= 0) {
        updated = [...systemTemplates];
        updated[idx] = docData;
      } else {
        updated = [docData, ...systemTemplates];
      }
      setSystemTemplates(updated);
      localStorage.setItem(LOCAL_SYSTEM_TEMPLATES_KEY, JSON.stringify(updated));
    }
  };

  // Delete system template
  const deleteSystemTemplate = async (templateId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'system_templates', templateId));
        incWrites();
      } catch (err) {
        console.error('Failed to delete system template:', err);
        throw err;
      }
    } else {
      const updated = systemTemplates.filter((t) => t.id !== templateId);
      setSystemTemplates(updated);
      localStorage.setItem(LOCAL_SYSTEM_TEMPLATES_KEY, JSON.stringify(updated));
    }
  };

  // Toggle active state of system template
  const toggleSystemTemplateActive = async (templateId: string, isActive: boolean) => {
    if (user) {
      try {
        await setDoc(doc(db, 'system_templates', templateId), { isActive, updatedAt: new Date().toISOString() }, { merge: true });
        incWrites();
      } catch (err) {
        console.error('Failed to toggle system template:', err);
      }
    } else {
      const updated = systemTemplates.map((t) => (t.id === templateId ? { ...t, isActive } : t));
      setSystemTemplates(updated);
      localStorage.setItem(LOCAL_SYSTEM_TEMPLATES_KEY, JSON.stringify(updated));
    }
  };

  // Initialize/Seed default system templates into Firestore
  const initializeDefaultSystemTemplates = async () => {
    if (!user) {
      setSystemTemplates(DEFAULT_TEMPLATES.map((t) => ({ ...t, isActive: true, isDefault: true })));
      localStorage.setItem(
        LOCAL_SYSTEM_TEMPLATES_KEY,
        JSON.stringify(DEFAULT_TEMPLATES.map((t) => ({ ...t, isActive: true, isDefault: true })))
      );
      return;
    }

    try {
      const batch = writeBatch(db);
      DEFAULT_TEMPLATES.forEach((tmpl) => {
        const ref = doc(db, 'system_templates', tmpl.id);
        batch.set(ref, {
          ...tmpl,
          isDefault: true,
          isActive: true,
          updatedAt: new Date().toISOString(),
          updatedBy: user.email || 'system_init',
        });
      });
      await batch.commit();
      incWrites(DEFAULT_TEMPLATES.length);
    } catch (err) {
      console.error('Failed to batch initialize default templates:', err);
      throw err;
    }
  };

  // Admin: Update user role
  const updateUserRole = async (targetUid: string, role: 'admin' | 'nurse') => {
    try {
      await setDoc(doc(db, 'users', targetUid), { role, updatedAt: new Date().toISOString() }, { merge: true });
      incWrites();
      setAllUsers((prev) => prev.map((u) => (u.uid === targetUid ? { ...u, role } : u)));
    } catch (err) {
      console.error('Failed to update user role:', err);
      throw err;
    }
  };

  // Admin: Update user account status
  const updateUserStatus = async (targetUid: string, status: 'active' | 'suspended') => {
    try {
      await setDoc(doc(db, 'users', targetUid), { status, updatedAt: new Date().toISOString() }, { merge: true });
      incWrites();
      setAllUsers((prev) => prev.map((u) => (u.uid === targetUid ? { ...u, status } : u)));
    } catch (err) {
      console.error('Failed to update user status:', err);
      throw err;
    }
  };

  // Admin: Diagnostic Latency Test
  const runDiagnosticPing = async (): Promise<number> => {
    const start = performance.now();
    try {
      const testId = 'ping_' + Date.now();
      await setDoc(doc(db, 'system_metrics', testId), {
        timestamp: new Date().toISOString(),
        client: 'admin_dashboard',
      });
      // Delete test doc
      await deleteDoc(doc(db, 'system_metrics', testId));
      const duration = Math.round(performance.now() - start);
      setLastPingMs(duration);
      setLastPingTime(new Date().toLocaleTimeString());
      setSyncHealth(duration < 300 ? 'healthy' : 'degraded');
      incWrites(2);
      return duration;
    } catch (err) {
      console.error('Diagnostic ping failed:', err);
      setSyncHealth('offline');
      throw err;
    }
  };

  // Estimate storage usage
  const estimatedStorageKb = Math.round(
    (JSON.stringify(records).length +
      JSON.stringify(systemTemplates).length +
      JSON.stringify(customTemplates).length +
      JSON.stringify(allUsers).length) /
      1024
  );

  const usageStats: FirebaseUsageStats = {
    recordCount: records.length,
    userCount: allUsers.length > 0 ? allUsers.length : (user ? 1 : 0),
    customTemplateCount: customTemplates.length,
    systemTemplateCount: systemTemplates.length,
    estimatedStorageKb: Math.max(12, estimatedStorageKb),
    sessionReads,
    sessionWrites,
    lastPingMs,
    lastPingTime,
    syncHealth,
  };

  return {
    records,
    templates: activeTemplates,
    systemTemplates,
    customTemplates,
    allUsers,
    usageStats,
    isSyncing,
    cloudStatus,
    saveRecord,
    deleteRecord,
    clearAllRecords,
    saveCustomTemplate,
    deleteCustomTemplate,
    resetDefaultTemplates,
    // Admin features
    saveSystemTemplate,
    deleteSystemTemplate,
    toggleSystemTemplateActive,
    initializeDefaultSystemTemplates,
    updateUserRole,
    updateUserStatus,
    runDiagnosticPing,
  };
}
