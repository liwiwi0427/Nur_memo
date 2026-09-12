import { GCSData, InterventionData, PatientContext, VitalSignsData } from '../types';

export function calculateGCSTotal(gcs: GCSData): { totalText: string; score: number | null } {
  const e = Number(gcs.eye) || 0;
  const m = Number(gcs.motor) || 0;

  if (typeof gcs.verbal === 'string' && (gcs.verbal === 'T' || gcs.verbal === 'E')) {
    const numericPart = e + m;
    return {
      totalText: `E${e}V${gcs.verbal}M${m} (E+M=${numericPart}分)`,
      score: numericPart,
    };
  }

  const v = Number(gcs.verbal) || 0;
  const total = e + v + m;
  return {
    totalText: `E${e}V${v}M${m} (滿分15/實得分${total})`,
    score: total,
  };
}

export function formatPupilString(gcs: GCSData): string {
  const leftSize = gcs.leftPupilSize || '2.5';
  const rightSize = gcs.rightPupilSize || '2.5';
  const leftRef = gcs.leftPupilReflex || '+';
  const rightRef = gcs.rightPupilReflex || '+';

  if (leftSize === rightSize && leftRef === rightRef) {
    return `雙側 ${leftSize}mm (${leftRef}/${leftRef})`;
  }
  return `L: ${leftSize}mm (${leftRef}) / R: ${rightSize}mm (${rightRef})`;
}

export function formatO2String(vs: VitalSignsData): string {
  if (vs.o2Device === 'Room Air') {
    return 'Room Air';
  }
  const flow = vs.o2Flow ? ` ${vs.o2Flow} L/min` : '';
  return `${vs.o2Device}${flow}`;
}

export function formatBloodPressure(vs: VitalSignsData): string {
  if (!vs.sbp && !vs.dbp) return '120/80';
  return `${vs.sbp || '--'}/${vs.dbp || '--'}`;
}

export function formatVitalSignsSummary(vs: VitalSignsData): string {
  const parts: string[] = [];
  if (vs.bt) parts.push(`BT: ${vs.bt}°C`);
  if (vs.hr) parts.push(`HR: ${vs.hr}次/分`);
  if (vs.rr) parts.push(`RR: ${vs.rr}次/分`);
  if (vs.sbp || vs.dbp) parts.push(`BP: ${formatBloodPressure(vs)}mmHg`);
  if (vs.spo2) parts.push(`SpO2: ${vs.spo2}% (${formatO2String(vs)})`);
  return parts.join(', ');
}

export function formatPainSummary(vs: VitalSignsData): string {
  const score = vs.painScore || '0';
  if (score === '0') return 'NRS 0分 (無疼痛)';
  const loc = vs.painLocation ? `，部位：${vs.painLocation}` : '';
  const nat = vs.painNature ? `，性質：${vs.painNature}` : '';
  return `NRS ${score}分 (${loc}${nat})`;
}

export function replaceTemplateVariables(
  templateText: string,
  context: PatientContext,
  vitalSigns: VitalSignsData,
  gcs: GCSData,
  intervention: InterventionData,
): string {
  const gcsResult = calculateGCSTotal(gcs);
  const pupilStr = formatPupilString(gcs);
  const bpStr = formatBloodPressure(vitalSigns);
  const o2Str = formatO2String(vitalSigns);
  const vsSummary = formatVitalSignsSummary(vitalSigns);
  const painSummary = formatPainSummary(vitalSigns);

  const shiftLabels: Record<string, string> = {
    day: '白班 (D)',
    evening: '小夜班 (E)',
    night: '大夜班 (N)',
  };

  const replacements: Record<string, string> = {
    '{{日期}}': context.recordDate || new Date().toISOString().split('T')[0],
    '{{時間}}': context.recordTime || '08:00',
    '{{班別}}': shiftLabels[context.shift] || '白班',
    '{{床號}}': context.bedNumber ? `${context.bedNumber}床` : '病患',
    '{{主訴}}': context.chiefComplaint || '無特殊主訴',

    '{{體溫}}': vitalSigns.bt || '36.8',
    '{{脈搏}}': vitalSigns.hr || '76',
    '{{呼吸}}': vitalSigns.rr || '18',
    '{{血壓}}': bpStr,
    '{{SpO2}}': vitalSigns.spo2 || '98',
    '{{給氧方式}}': o2Str,
    '{{生命徵象}}': vsSummary,
    '{{血糖}}': vitalSigns.bloodSugar || '110',

    '{{疼痛分數}}': vitalSigns.painScore || '0',
    '{{疼痛部位}}': vitalSigns.painLocation || '手術傷口',
    '{{疼痛性質}}': vitalSigns.painNature || '悶痛',
    '{{疼痛}}': painSummary,

    '{{GCS}}': gcsResult.totalText,
    '{{E}}': String(gcs.eye || 4),
    '{{V}}': String(gcs.verbal || 5),
    '{{M}}': String(gcs.motor || 6),
    '{{瞳孔}}': pupilStr,

    '{{處置}}': intervention.actionDetail || '予以常規照護並密切觀察',
    '{{處置後時間}}': intervention.followUpTime || '1小時後',
    '{{追蹤體溫}}': intervention.followUpBT || '36.9',
    '{{追蹤疼痛分數}}': intervention.followUpPain || '1',
    '{{追蹤SpO2}}': intervention.followUpSpO2 || '98',
    '{{追蹤呼吸}}': intervention.followUpRR || '18',
    '{{追蹤血糖}}': '115',

    '{{傷口部位}}': intervention.woundLocation || '腹部手術傷口',
    '{{管路名稱}}': intervention.drainTubeName || 'JP引流管',
    '{{引流量}}': intervention.drainAmount || '30',
    '{{引流顏色}}': intervention.drainColor || '淡血水色',
  };

  let result = templateText;
  for (const [placeholder, val] of Object.entries(replacements)) {
    result = result.split(placeholder).join(val);
  }

  return result;
}
