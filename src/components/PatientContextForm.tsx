import React from 'react';
import { PatientContext, ShiftType, InterventionData } from '../types';
import { Clock, Calendar, Bed, Pill, Building2, User, Sun, Sunset, Moon } from 'lucide-react';

interface PatientContextFormProps {
  context: PatientContext;
  intervention: InterventionData;
  onContextChange: (ctx: PatientContext) => void;
  onInterventionChange: (inter: InterventionData) => void;
}

const COMMON_ACTIONS: {
  label: string;
  text: string;
  postTime: string;
  followBT?: string;
  followPain?: string;
  followSpO2?: string;
}[] = [
  {
    label: '常規照護防跌',
    text: '予常規病房巡房，床欄雙側拉起固定，病床調至最低，呼叫鈴置於身旁，衛教下床安全',
    postTime: '每班巡查',
  },
  {
    label: '發燒口服退燒',
    text: '依醫囑給予 Acetaminophen 500mg 1# PO，提供冰枕使用，衛教多攝取溫水與保暖',
    postTime: '1小時後 (約 ' + getRelativeTime(60) + ')',
    followBT: '37.1',
  },
  {
    label: '發燒塞劑降溫',
    text: '依醫囑給予 Voren supp 12.5mg (或 25mg) 肛門塞劑使用，予冰枕降溫並維持室溫',
    postTime: '1小時後',
    followBT: '37.0',
  },
  {
    label: '口服止痛給藥',
    text: '依醫囑給予 Ultracet 1# PO，指導採舒適臥位，深呼吸放鬆',
    postTime: '45分鐘後',
    followPain: '2',
  },
  {
    label: '針劑止痛(Keto)',
    text: '依醫囑給予 Ketorolac 30mg 1 amp IV st，觀察有無胃部不適，放鬆平躺休息',
    postTime: '30分鐘後',
    followPain: '1',
  },
  {
    label: '呼吸喘鼻導管給氧',
    text: '床頭搖高 45-60 度採半坐臥姿，給予 Nasal cannula 2-3 L/min，通知值班醫師到場',
    postTime: '30分鐘後',
    followSpO2: '98',
  },
  {
    label: '傷口消毒換藥 (CD)',
    text: '採嚴格無菌技術以優碘及生理食鹽水消毒傷口(CD)，更換無菌紗布並妥善固定',
    postTime: '換藥完成後',
  },
  {
    label: '低血糖含糖補給',
    text: '意識清楚立即口服給予糖水或果汁 150-200ml，囑臥床休息並注意防跌',
    postTime: '15分鐘後',
  },
];

function getRelativeTime(addMinutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + addMinutes);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const PatientContextForm: React.FC<PatientContextFormProps> = ({
  context,
  intervention,
  onContextChange,
  onInterventionChange,
}) => {
  const updateCtx = (field: keyof PatientContext, val: any) => {
    onContextChange({ ...context, [field]: val });
  };

  const updateInter = (field: keyof InterventionData, val: any) => {
    onInterventionChange({ ...intervention, [field]: val });
  };

  const setNowTime = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];
    onContextChange({
      ...context,
      recordDate: dateStr,
      recordTime: timeStr,
    });
  };

  return (
    <div id="patient-context-panel" className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 font-bold shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">記錄時點與臨床處置 (Context & Intervention)</h3>
            <p className="text-xs text-slate-500">班別、單位、時間、床號及執行之護理措施與追蹤評估</p>
          </div>
        </div>

        <button
          type="button"
          onClick={setNowTime}
          className="text-xs px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/80 transition-colors flex items-center gap-1.5 font-semibold cursor-pointer shadow-2xs"
        >
          <Clock className="w-3.5 h-3.5" />
          帶入現在時間
        </button>
      </div>

      {/* Row 1: Unit, Date, Time, Shift, Bed Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {/* Unit Name */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            病房 / 單位
          </label>
          <input
            type="text"
            value={context.unitName}
            onChange={(e) => updateCtx('unitName', e.target.value)}
            placeholder="例: 8B 綜合病房"
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Date */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            記錄日期
          </label>
          <input
            type="date"
            value={context.recordDate}
            onChange={(e) => updateCtx('recordDate', e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Time */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              記錄時間
            </label>
            <div className="flex gap-1 overflow-x-auto">
              {['08:00', '16:00', '00:00'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateCtx('recordTime', t)}
                  className="text-[10px] px-1.5 py-0.5 bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-700 cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <input
            type="time"
            value={context.recordTime}
            onChange={(e) => updateCtx('recordTime', e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Shift */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">班別 (Shift)</label>
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { key: 'day', label: '白班', icon: Sun },
                { key: 'evening', label: '小夜', icon: Sunset },
                { key: 'night', label: '大夜', icon: Moon },
              ] as const
            ).map((s) => {
              const IconComp = s.icon;
              const isSelected = context.shift === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => updateCtx('shift', s.key as ShiftType)}
                  className={`py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-2xs font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <IconComp className={`w-3 h-3 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bed Number */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
            <Bed className="w-3.5 h-3.5 text-slate-500" />
            床號 / 病患代號
          </label>
          <input
            type="text"
            value={context.bedNumber}
            onChange={(e) => updateCtx('bedNumber', e.target.value)}
            placeholder="例: 8B-12"
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Row 2: Intervention Quick Chips & Custom Input */}
      <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/70">
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">護理處置介入 (Action)</span>
          </div>
          <span className="text-[11px] text-slate-500">點擊下方常用片語可快速帶入處置與追蹤時間：</span>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {COMMON_ACTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                updateInter('actionDetail', item.text);
                updateInter('followUpTime', item.postTime);
                if (item.followBT) updateInter('followUpBT', item.followBT);
                if (item.followPain) updateInter('followUpPain', item.followPain);
                if (item.followSpO2) updateInter('followUpSpO2', item.followSpO2);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs font-medium"
            >
              + {item.label}
            </button>
          ))}
        </div>

        {/* Action Detail Textarea */}
        <div className="mb-3">
          <textarea
            rows={2}
            value={intervention.actionDetail}
            onChange={(e) => updateInter('actionDetail', e.target.value)}
            placeholder="詳細處置內容 (例: 依醫囑給予降溫藥物、提供冰枕、衛教防跌...)"
            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
          />
        </div>

        {/* Follow-up / Response Sub-Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 border-t border-slate-200/70">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              追蹤評估時間
            </label>
            <input
              type="text"
              value={intervention.followUpTime}
              onChange={(e) => updateInter('followUpTime', e.target.value)}
              placeholder="例: 1小時後"
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              追蹤體溫 (°C)
            </label>
            <input
              type="text"
              value={intervention.followUpBT}
              onChange={(e) => updateInter('followUpBT', e.target.value)}
              placeholder="例: 37.1"
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              追蹤疼痛評分 (NRS)
            </label>
            <input
              type="text"
              value={intervention.followUpPain}
              onChange={(e) => updateInter('followUpPain', e.target.value)}
              placeholder="例: 1"
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              追蹤血氧 SpO2 (%)
            </label>
            <input
              type="text"
              value={intervention.followUpSpO2}
              onChange={(e) => updateInter('followUpSpO2', e.target.value)}
              placeholder="例: 98"
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
