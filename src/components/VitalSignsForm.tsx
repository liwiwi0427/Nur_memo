import React from 'react';
import { VitalSignsData, O2DeviceType } from '../types';
import { Activity, Flame, Wind, Heart, Gauge, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VitalSignsFormProps {
  vitalSigns: VitalSignsData;
  onChange: (updated: VitalSignsData) => void;
}

export const VitalSignsForm: React.FC<VitalSignsFormProps> = ({ vitalSigns, onChange }) => {
  const updateField = (field: keyof VitalSignsData, val: any) => {
    onChange({
      ...vitalSigns,
      [field]: val,
    });
  };

  // Quick Preset Handlers
  const applyNormalPreset = () => {
    onChange({
      ...vitalSigns,
      bt: '36.7',
      hr: '76',
      rr: '18',
      sbp: '118',
      dbp: '76',
      spo2: '98',
      o2Device: 'Room Air',
      o2Flow: '',
      painScore: '0',
    });
  };

  const applyFeverPreset = () => {
    onChange({
      ...vitalSigns,
      bt: '38.6',
      hr: '102',
      rr: '22',
      sbp: '128',
      dbp: '80',
      spo2: '97',
      o2Device: 'Room Air',
    });
  };

  const applyDyspneaPreset = () => {
    onChange({
      ...vitalSigns,
      bt: '37.1',
      hr: '110',
      rr: '26',
      sbp: '142',
      dbp: '88',
      spo2: '91',
      o2Device: 'Nasal Cannula',
      o2Flow: '3',
    });
  };

  // Validation Warnings
  const isFever = Number(vitalSigns.bt) >= 38.0;
  const isHypoBT = Number(vitalSigns.bt) > 0 && Number(vitalSigns.bt) < 35.5;
  const isTachycardia = Number(vitalSigns.hr) > 100;
  const isBradycardia = Number(vitalSigns.hr) > 0 && Number(vitalSigns.hr) < 60;
  const isTachypnea = Number(vitalSigns.rr) > 22;
  const isLowSpO2 = Number(vitalSigns.spo2) > 0 && Number(vitalSigns.spo2) < 95;
  const isHypertension = Number(vitalSigns.sbp) >= 140 || Number(vitalSigns.dbp) >= 90;
  const isHypotension = (Number(vitalSigns.sbp) > 0 && Number(vitalSigns.sbp) < 90) || (Number(vitalSigns.dbp) > 0 && Number(vitalSigns.dbp) < 60);

  return (
    <div id="vital-signs-panel" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">生命徵象評估 (Vital Signs)</h3>
            <p className="text-xs text-slate-500">TPR & BP、給氧及疼痛評估</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-600 font-medium mr-1">快捷帶入:</span>
          <button
            type="button"
            id="preset-normal-vs"
            onClick={applyNormalPreset}
            className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            正常常規值
          </button>
          <button
            type="button"
            id="preset-fever-vs"
            onClick={applyFeverPreset}
            className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <Flame className="w-3 h-3" />
            發燒 38.6°C
          </button>
          <button
            type="button"
            id="preset-dyspnea-vs"
            onClick={applyDyspneaPreset}
            className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <Wind className="w-3 h-3" />
            氣喘 SpO2 91%
          </button>
        </div>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {/* BT */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-bt" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              體溫 (BT)
            </label>
            <span className="text-[10px] text-slate-600">°C</span>
          </div>
          <div className="relative">
            <input
              id="input-bt"
              type="number"
              step="0.1"
              value={vitalSigns.bt}
              onChange={(e) => updateField('bt', e.target.value)}
              placeholder="36.8"
              className={`w-full bg-white border rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 ${
                isFever
                  ? 'border-rose-300 text-rose-700 focus:ring-rose-200 bg-rose-50/40'
                  : isHypoBT
                  ? 'border-blue-300 text-blue-700 focus:ring-blue-200'
                  : 'border-slate-200 focus:ring-teal-200'
              }`}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">常規 36.0-37.4</span>
            {isFever && <span className="text-rose-600 font-semibold flex items-center gap-0.5">發燒</span>}
          </div>
        </div>

        {/* HR */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-hr" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" />
              脈搏 (HR)
            </label>
            <span className="text-[10px] text-slate-600">次/分</span>
          </div>
          <input
            id="input-hr"
            type="number"
            value={vitalSigns.hr}
            onChange={(e) => updateField('hr', e.target.value)}
            placeholder="76"
            className={`w-full bg-white border rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 ${
              isTachycardia
                ? 'border-amber-300 text-amber-700 focus:ring-amber-200'
                : isBradycardia
                ? 'border-indigo-300 text-indigo-700 focus:ring-indigo-200'
                : 'border-slate-200 focus:ring-teal-200'
            }`}
          />
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">常規 60-100</span>
            {isTachycardia && <span className="text-amber-600 font-medium">偏快</span>}
            {isBradycardia && <span className="text-indigo-600 font-medium">偏慢</span>}
          </div>
        </div>

        {/* RR */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-rr" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-600" />
              呼吸 (RR)
            </label>
            <span className="text-[10px] text-slate-600">次/分</span>
          </div>
          <input
            id="input-rr"
            type="number"
            value={vitalSigns.rr}
            onChange={(e) => updateField('rr', e.target.value)}
            placeholder="18"
            className={`w-full bg-white border rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 ${
              isTachypnea
                ? 'border-amber-300 text-amber-700 focus:ring-amber-200'
                : 'border-slate-200 focus:ring-teal-200'
            }`}
          />
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">常規 12-20</span>
            {isTachypnea && <span className="text-amber-600 font-medium">過速</span>}
          </div>
        </div>

        {/* BP */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-500" />
              血壓 (BP 收縮/舒張)
            </label>
            <span className="text-[10px] text-slate-600">mmHg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              id="input-sbp"
              type="number"
              value={vitalSigns.sbp}
              onChange={(e) => updateField('sbp', e.target.value)}
              placeholder="120"
              className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-200"
            />
            <span className="text-slate-400 font-medium">/</span>
            <input
              id="input-dbp"
              type="number"
              value={vitalSigns.dbp}
              onChange={(e) => updateField('dbp', e.target.value)}
              placeholder="80"
              className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">目標 &lt;120/80</span>
            {isHypertension && <span className="text-rose-600 font-medium">偏高</span>}
            {isHypotension && <span className="text-blue-600 font-medium">偏低</span>}
          </div>
        </div>

        {/* SpO2 */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-spo2" className="text-xs font-semibold text-slate-600">
              血氧 (SpO2)
            </label>
            <span className="text-[10px] text-slate-600">%</span>
          </div>
          <input
            id="input-spo2"
            type="number"
            value={vitalSigns.spo2}
            onChange={(e) => updateField('spo2', e.target.value)}
            placeholder="98"
            className={`w-full bg-white border rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 ${
              isLowSpO2
                ? 'border-rose-300 text-rose-700 bg-rose-50/40 focus:ring-rose-200'
                : 'border-slate-200 focus:ring-teal-200'
            }`}
          />
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">&ge;95% 正常</span>
            {isLowSpO2 && <span className="text-rose-600 font-semibold flex items-center gap-0.5"><AlertCircle className="w-2.5 h-2.5"/>偏低</span>}
          </div>
        </div>
      </div>

      {/* Oxygen Support & Pain & Blood Sugar Sub-row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {/* Oxygen Support */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            給氧設備與流速 (O2 Therapy)
          </label>
          <div className="flex gap-2">
            <select
              id="select-o2-device"
              value={vitalSigns.o2Device}
              onChange={(e) => updateField('o2Device', e.target.value as O2DeviceType)}
              className="grow bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-200"
            >
              <option value="Room Air">Room Air (未給氧)</option>
              <option value="Nasal Cannula">Nasal Cannula (鼻導管)</option>
              <option value="Simple Mask">Simple Mask (簡易面罩)</option>
              <option value="Venturi Mask">Venturi Mask (凡德里面罩)</option>
              <option value="Non-Rebreathing Mask">Non-Rebreathing Mask (非再吸入型)</option>
              <option value="High Flow (HFNC)">High Flow (經鼻高流量)</option>
              <option value="Endotracheal Tube">Endotracheal Tube (氣管插管)</option>
            </select>
            {vitalSigns.o2Device !== 'Room Air' && (
              <div className="w-24 shrink-0 flex items-center bg-slate-50 border border-slate-200 rounded-md px-2">
                <input
                  type="number"
                  value={vitalSigns.o2Flow}
                  onChange={(e) => updateField('o2Flow', e.target.value)}
                  placeholder="2"
                  className="w-full text-xs bg-transparent text-slate-800 font-medium focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-600 shrink-0">L/min</span>
              </div>
            )}
          </div>
        </div>

        {/* Pain Assessment */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              疼痛評估 (NRS: {vitalSigns.painScore || '0'} 分)
            </label>
            <span className="text-[11px] text-slate-600">
              {vitalSigns.painScore === '0' || !vitalSigns.painScore ? '無痛' : Number(vitalSigns.painScore) <= 3 ? '輕度' : Number(vitalSigns.painScore) <= 6 ? '中度' : '重度'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateField('painScore', String(num))}
                className={`flex-1 py-1 text-xs rounded font-medium transition-all ${
                  String(vitalSigns.painScore) === String(num)
                    ? num === 0
                      ? 'bg-slate-700 text-white'
                      : num <= 3
                      ? 'bg-emerald-600 text-white'
                      : num <= 6
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          {Number(vitalSigns.painScore) > 0 && (
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <input
                type="text"
                value={vitalSigns.painLocation}
                onChange={(e) => updateField('painLocation', e.target.value)}
                placeholder="疼痛部位 (如: 腹部傷口)"
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
              />
              <input
                type="text"
                value={vitalSigns.painNature}
                onChange={(e) => updateField('painNature', e.target.value)}
                placeholder="性質 (如: 刺痛、悶痛)"
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
              />
            </div>
          )}
        </div>

        {/* Blood Sugar (Sugar) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="input-blood-sugar" className="text-xs font-semibold text-slate-700">
              指尖血糖 (Blood Sugar)
            </label>
            <span className="text-[10px] text-slate-600">mg/dL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              id="input-blood-sugar"
              type="number"
              value={vitalSigns.bloodSugar}
              onChange={(e) => updateField('bloodSugar', e.target.value)}
              placeholder="110 (選填)"
              className="grow bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-200"
            />
            <button
              type="button"
              onClick={() => updateField('bloodSugar', '105')}
              className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
            >
              正常飯前
            </button>
          </div>
          <p className="text-[11px] text-slate-600">空腹常規: 70-99 mg/dL；飯後 &lt;140 mg/dL</p>
        </div>
      </div>
    </div>
  );
};
