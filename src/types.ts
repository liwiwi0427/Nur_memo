export type ShiftType = 'day' | 'evening' | 'night';

export type UserRole = 'admin' | 'nurse';

export type O2DeviceType =
  | 'Room Air'
  | 'Nasal Cannula'
  | 'Simple Mask'
  | 'Venturi Mask'
  | 'Non-Rebreathing Mask'
  | 'High Flow (HFNC)'
  | 'Endotracheal Tube';

export interface VitalSignsData {
  bt: string;         // Body Temperature (°C)
  hr: string;         // Heart Rate (bpm)
  rr: string;         // Respiration Rate (bpm)
  sbp: string;        // Systolic Blood Pressure (mmHg)
  dbp: string;        // Diastolic Blood Pressure (mmHg)
  spo2: string;       // Oxygen Saturation (%)
  o2Device: O2DeviceType;
  o2Flow: string;     // L/min
  painScore: string;  // NRS 0-10
  painLocation: string; // e.g. 手術傷口, 腹部, 胸部, 頭部
  painNature: string;   // e.g. 悶痛, 刺痛, 抽痛, 脹痛, 鈍痛
  bloodSugar: string; // mg/dL
}

export interface GCSData {
  eye: number;        // 1-4
  verbal: number | string; // 1-5 or 'T' (tracheostomy) or 'E' (intubated)
  motor: number;      // 1-6
  leftPupilSize: string;  // mm (e.g. 2.5)
  rightPupilSize: string; // mm (e.g. 2.5)
  leftPupilReflex: '+' | '±' | '-';
  rightPupilReflex: '+' | '±' | '-';
}

export type PreferredShiftOption = 'auto' | 'day' | 'evening' | 'night';

export interface UserSettings {
  uid?: string;
  email?: string;
  displayName?: string;
  unitName: string;                     // e.g. "8B 綜合病房", "ICU", "急診"
  preferredShift: PreferredShiftOption; // 'auto' (by current time) or fixed 'day' | 'evening' | 'night'
  defaultBedPrefix: string;             // e.g. "8B-", "12-"
  nurseSignature: string;               // Optional nurse name / ID
  role?: UserRole;                      // 'admin' or 'nurse'
  lastActive?: string;                  // ISO timestamp
  createdAt?: string;                   // ISO timestamp
  status?: 'active' | 'suspended';      // account status
}

export interface PatientContext {
  unitName: string;   // Ward / Unit (e.g., 8B 綜合病房, ICU, 急診)
  bedNumber: string;
  recordDate: string; // YYYY-MM-DD
  recordTime: string; // HH:mm
  shift: ShiftType;
  chiefComplaint: string;
  nurseName?: string; // Optional staff signature
}

export interface InterventionData {
  focusCategory: string;
  actionDetail: string;
  responseDetail: string;
  followUpTime: string;
  followUpBT: string;
  followUpPain: string;
  followUpSpO2: string;
  followUpRR: string;
  customNotes: string;
  drainTubeName: string;
  drainAmount: string;
  drainColor: string;
  woundLocation: string;
}

export interface CannedTemplate {
  id: string;
  name: string;
  category: 'DART' | 'SOAP' | 'ROUTINE' | 'CUSTOM';
  description: string;
  templateText: string;
  isDefault?: boolean;
  isActive?: boolean;
  userId?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SavedRecord {
  id: string;
  userId?: string;
  createdAt: string;
  bedNumber: string;
  unitName?: string;
  date: string;
  time: string;
  shift: ShiftType;
  templateName: string;
  focus: string;
  content: string;
  vitalSummary: string;
}

export interface FirebaseUsageStats {
  recordCount: number;
  userCount: number;
  customTemplateCount: number;
  systemTemplateCount: number;
  estimatedStorageKb: number;
  sessionReads: number;
  sessionWrites: number;
  lastPingMs: number | null;
  lastPingTime: string | null;
  syncHealth: 'healthy' | 'degraded' | 'offline';
}
