export type ShiftType = 'day' | 'evening' | 'night';

export type O2DeviceType = 'Room Air' | 'Nasal Cannula' | 'Simple Mask' | 'Venturi Mask' | 'Non-Rebreathing Mask' | 'High Flow (HFNC)' | 'Endotracheal Tube';

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

export interface PatientContext {
  bedNumber: string;
  recordDate: string; // YYYY-MM-DD
  recordTime: string; // HH:mm
  shift: ShiftType;
  chiefComplaint: string;
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
}

export interface SavedRecord {
  id: string;
  createdAt: string;
  bedNumber: string;
  date: string;
  time: string;
  shift: ShiftType;
  templateName: string;
  focus: string;
  content: string;
  vitalSummary: string;
}
