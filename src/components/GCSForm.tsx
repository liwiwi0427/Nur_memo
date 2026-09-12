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
    <div id="gcs-assessment-panel" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-base">神經意識評估 (GCS & Pupils)</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {gcsResult.totalText}
              </span>
            </div>
            <p className="text-xs text-slate-500">格拉斯哥昏迷指數 (E, V, M) 與雙側瞳孔檢查</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-600 font-medium mr-1">快捷帶入:</span>
          <button
            type="button"
            id="preset-gcs-alert"
            onClick={setClearAlert}
            className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            清醒滿分 (15分)
          </button>
          <button
            type="button"
            id="preset-gcs-drowsy"
            onClick={setDrowsy}
            className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            嗜睡/遲鈍 (E3V4M6)
          </button>
          <button
            type="button"
            id="preset-gcs-intubated"
            onClick={setIntubated}
            className="text-xs px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            插管 (E4VEM6)
          </button>
          <button
            type="button"
            id="preset-gcs-stupor"
            onClick={setStupor}
            className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            昏迷 (8分)
          </button>
        </div>
      </div>

      {/* 3 Columns: E, V, M */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Eye (E) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">睜眼反應 (Eye Opening, E)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              E{gcs.eye}
            </span>
          </div>
          <div className="space-y-1">
            {EYE_OPTIONS.map((item) => (
              <button
                key={item.score}
                type="button"
                onClick={() => updateField('eye', item.score)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between cursor-pointer ${
                  gcs.eye === item.score
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                <span>{item.label}</span>
                {gcs.eye === item.score && <Sparkles className="w-3 h-3 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Verbal (V) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">語言反應 (Verbal Response, V)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              V{gcs.verbal}
            </span>
          </div>
          <div className="space-y-1">
            {VERBAL_OPTIONS.map((item) => (
              <button
                key={String(item.score)}
                type="button"
                onClick={() => updateField('verbal', item.score)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between cursor-pointer ${
                  String(gcs.verbal) === String(item.score)
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                <span>{item.label}</span>
                {String(gcs.verbal) === String(item.score) && <Sparkles className="w-3 h-3 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Motor (M) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">動作反應 (Motor Response, M)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              M{gcs.motor}
            </span>
          </div>
          <div className="space-y-1">
            {MOTOR_OPTIONS.map((item) => (
              <button
                key={item.score}
                type="button"
                onClick={() => updateField('motor', item.score)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between cursor-pointer ${
                  gcs.motor === item.score
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                <span>{item.label}</span>
                {gcs.motor === item.score && <Sparkles className="w-3 h-3 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pupil Evaluation Sub-Panel */}
      <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-700">雙側瞳孔大小與對光反應 (Pupil Reflex)</span>
          <span className="text-[11px] text-slate-600">正常常規大小約 2.0 ~ 3.5 mm，兩側等大對稱 (+)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Eye */}
          <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 w-12">左眼 (L):</span>
              <div className="flex items-center gap-1">
                <select
                  value={gcs.leftPupilSize}
                  onChange={(e) => updateField('leftPupilSize', e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium text-slate-800"
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
              <span className="text-[11px] text-slate-600 mr-1">對光:</span>
              {(['+', '±', '-'] as const).map((reflex) => (
                <button
                  key={reflex}
                  type="button"
                  onClick={() => updateField('leftPupilReflex', reflex)}
                  className={`px-2 py-0.5 text-xs rounded font-bold cursor-pointer transition-colors ${
                    gcs.leftPupilReflex === reflex
                      ? reflex === '+'
                        ? 'bg-emerald-600 text-white'
                        : reflex === '±'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {reflex === '+' ? '+ 靈敏' : reflex === '±' ? '± 遲鈍' : '- 無'}
                </button>
              ))}
            </div>
          </div>

          {/* Right Eye */}
          <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 w-12">右眼 (R):</span>
              <div className="flex items-center gap-1">
                <select
                  value={gcs.rightPupilSize}
                  onChange={(e) => updateField('rightPupilSize', e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium text-slate-800"
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
              <span className="text-[11px] text-slate-600 mr-1">對光:</span>
              {(['+', '±', '-'] as const).map((reflex) => (
                <button
                  key={reflex}
                  type="button"
                  onClick={() => updateField('rightPupilReflex', reflex)}
                  className={`px-2 py-0.5 text-xs rounded font-bold cursor-pointer transition-colors ${
                    gcs.rightPupilReflex === reflex
                      ? reflex === '+'
                        ? 'bg-emerald-600 text-white'
                        : reflex === '±'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-600 text-white'
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
