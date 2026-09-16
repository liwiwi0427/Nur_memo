import React from 'react';
import { GCSData } from '../types';
import { calculateGCSTotal } from '../utils/templateReplacer';
import { Brain, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

interface GCSFormProps {
  gcs: GCSData;
  onChange: (updated: GCSData) => void;
}

const EYE_OPTIONS = [
  { score: 4, label: 'E4 自發性睜眼 (Spontaneous)' },
  { score: 3, label: 'E3 呼喚睜眼 (To speech)' },
  { score: 2, label: 'E2 痛刺激睜眼 (To pain)' },
  { score: 1, label: 'E1 無反應 (None)' },
];

const VERBAL_OPTIONS = [
  { score: 5, label: 'V5 人時地清楚對答 (Oriented)' },
  { score: 4, label: 'V4 對答混亂/答非所問 (Confused)' },
  { score: 3, label: 'V3 語無倫次/不適當字詞 (Inappropriate words)' },
  { score: 2, label: 'V2 無意義呻吟叫聲 (Incomprehensible sounds)' },
  { score: 1, label: 'V1 無語言反應 (None)' },
  { score: 'T', label: 'VT 氣切管無法發聲 (Tracheostomy)' },
  { score: 'E', label: 'VE 氣管內管插管 (Endotracheal tube)' },
];

const MOTOR_OPTIONS = [
  { score: 6, label: 'M6 能遵從指令動作 (Obeys commands)' },
  { score: 5, label: 'M5 痛刺激能定位 (Localizes pain)' },
  { score: 4, label: 'M4 肢體對痛刺激屈曲迴避 (Withdrawal)' },
  { score: 3, label: 'M3 去皮質異常屈曲 (Decorticate flexion)' },
  { score: 2, label: 'M2 去大腦異常伸展 (Decerebrate extension)' },
  { score: 1, label: 'M1 無運動反應 (None)' },
];

export const GCSForm: React.FC<GCSFormProps> = ({ gcs, onChange }) => {
  const updateField = (field: keyof GCSData, val: any) => {
    onChange({
      ...gcs,
      [field]: val,
    });
  };

  const gcsResult = calculateGCSTotal(gcs);

  // Quick Presets
  const setClearAlert = () => {
    onChange({
      ...gcs,
      eye: 4,
      verbal: 5,
      motor: 6,
      leftPupilSize: '2.5',
      rightPupilSize: '2.5',
      leftPupilReflex: '+',
      rightPupilReflex: '+',
    });
  };

  const setDrowsy = () => {
    onChange({
      ...gcs,
      eye: 3,
      verbal: 4,
      motor: 6,
    });
  };

  const setStupor = () => {
    onChange({
      ...gcs,
      eye: 2,
      verbal: 2,
      motor: 4,
    });
  };

  const setIntubated = () => {
    onChange({
      ...gcs,
      eye: 4,
      verbal: 'E',
      motor: 6,
    });
  };

  return (
    <div id="gcs-assessment-panel" className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 font-bold shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">神經意識評估 (GCS & Pupils)</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100/80 text-teal-900 border border-teal-200">
                {gcsResult.totalText}
              </span>
            </div>
            <p className="text-xs text-slate-500">格拉斯哥昏迷指數 (E, V, M) 與雙側瞳孔反射</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-medium mr-1">快捷帶入:</span>
          <button
            type="button"
            id="preset-gcs-alert"
            onClick={setClearAlert}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-all flex items-center gap-1.5 font-semibold cursor-pointer shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            清醒滿分 (15分)
          </button>
          <button
            type="button"
            id="preset-gcs-drowsy"
            onClick={setDrowsy}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80 transition-all flex items-center gap-1.5 font-semibold cursor-pointer shadow-2xs"
          >
            嗜睡/遲鈍 (E3V4M6)
          </button>
          <button
            type="button"
            id="preset-gcs-intubated"
            onClick={setIntubated}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200/80 transition-all flex items-center gap-1.5 font-semibold cursor-pointer shadow-2xs"
          >
            插管 (E4VEM6)
          </button>
          <button
            type="button"
            id="preset-gcs-stupor"
            onClick={setStupor}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200/80 transition-all flex items-center gap-1.5 font-semibold cursor-pointer shadow-2xs"
          >
            昏迷 (8分)
          </button>
        </div>
      </div>

      {/* 3 Columns: E, V, M */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Eye (E) */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">睜眼反應 (Eye Opening, E)</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-900">
              E{gcs.eye}
            </span>
          </div>
          <div className="space-y-1">
            {EYE_OPTIONS.map((item) => (
              <button
                key={item.score}
                type="button"
                onClick={() => updateField('eye', item.score)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                  gcs.eye === item.score
                    ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {gcs.eye === item.score && <Sparkles className="w-3.5 h-3.5 text-teal-200 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Verbal (V) */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">語言反應 (Verbal Response, V)</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-900">
              V{gcs.verbal}
            </span>
          </div>
          <div className="space-y-1">
            {VERBAL_OPTIONS.map((item) => (
              <button
                key={String(item.score)}
                type="button"
                onClick={() => updateField('verbal', item.score)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                  String(gcs.verbal) === String(item.score)
                    ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {String(gcs.verbal) === String(item.score) && <Sparkles className="w-3.5 h-3.5 text-teal-200 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Motor (M) */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">動作反應 (Motor Response, M)</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-900">
              M{gcs.motor}
            </span>
          </div>
          <div className="space-y-1">
            {MOTOR_OPTIONS.map((item) => (
              <button
                key={item.score}
                type="button"
                onClick={() => updateField('motor', item.score)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                  gcs.motor === item.score
                    ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/60 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {gcs.motor === item.score && <Sparkles className="w-3.5 h-3.5 text-teal-200 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pupil Evaluation Sub-Panel */}
      <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/70">
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <Eye className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800">雙側瞳孔大小與對光反應 (Pupil Reflex)</span>
          <span className="text-[11px] text-slate-500">正常常規大小約 2.0 ~ 3.5 mm，兩側等大對稱 (+)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left Eye */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 w-12">左眼 (L):</span>
              <div className="flex items-center gap-1">
                <select
                  value={gcs.leftPupilSize}
                  onChange={(e) => updateField('leftPupilSize', e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {['1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '6.0'].map((s) => (
                    <option key={s} value={s}>
                      {s} mm
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 mr-1 font-medium">對光:</span>
              {(['+', '±', '-'] as const).map((reflex) => (
                <button
                  key={reflex}
                  type="button"
                  onClick={() => updateField('leftPupilReflex', reflex)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold cursor-pointer transition-all ${
                    gcs.leftPupilReflex === reflex
                      ? reflex === '+'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : reflex === '±'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {reflex === '+' ? '+ 靈敏' : reflex === '±' ? '± 遲鈍' : '- 無'}
                </button>
              ))}
            </div>
          </div>

          {/* Right Eye */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 w-12">右眼 (R):</span>
              <div className="flex items-center gap-1">
                <select
                  value={gcs.rightPupilSize}
                  onChange={(e) => updateField('rightPupilSize', e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {['1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '6.0'].map((s) => (
                    <option key={s} value={s}>
                      {s} mm
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 mr-1 font-medium">對光:</span>
              {(['+', '±', '-'] as const).map((reflex) => (
                <button
                  key={reflex}
                  type="button"
                  onClick={() => updateField('rightPupilReflex', reflex)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold cursor-pointer transition-all ${
                    gcs.rightPupilReflex === reflex
                      ? reflex === '+'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : reflex === '±'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {reflex === '+' ? '+ 靈敏' : reflex === '±' ? '± 遲鈍' : '- 無'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
