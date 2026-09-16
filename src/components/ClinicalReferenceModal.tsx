import React, { useState } from 'react';
import { BookOpen, X, HelpCircle, Check, Sparkles, Activity, FileText, Stethoscope, Languages } from 'lucide-react';

interface ClinicalReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalReferenceModal: React.FC<ClinicalReferenceModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'GCS' | 'ABBR' | 'VS' | 'DART'>('GCS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">臨床護理速查手冊 (Clinical Quick Reference)</h3>
              <p className="text-xs text-slate-500">GCS、瞳孔、常用縮寫與焦點記錄指引</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          {(
            [
              { key: 'GCS', label: 'GCS 昏迷評分標竿', icon: Stethoscope },
              { key: 'VS', label: '生命徵象與危急值', icon: Activity },
              { key: 'DART', label: 'DART焦點記錄規範', icon: FileText },
              { key: 'ABBR', label: '常用醫護英文縮寫', icon: Languages },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`pb-2.5 px-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'border-teal-600 text-teal-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-700">
          {tab === 'GCS' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-indigo-700 mb-1">睜眼反應 (Eye Opening, E) - 最高 4 分</h4>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li><strong>4分：</strong>自發性睜眼 (Spontaneous)</li>
                  <li><strong>3分：</strong>呼喚/對聲音睜眼 (To speech)</li>
                  <li><strong>2分：</strong>痛刺激睜眼 (To pain)</li>
                  <li><strong>1分：</strong>無睜眼反應 (None)</li>
                  <li><strong>C：</strong>因眼腫無法睜眼 (Closed by swelling)</li>
                </ul>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-indigo-700 mb-1">語言反應 (Verbal Response, V) - 最高 5 分</h4>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li><strong>5分：</strong>人、時、地導向良好清晰 (Oriented)</li>
                  <li><strong>4分：</strong>對話混亂、答非所問 (Confused conversation)</li>
                  <li><strong>3分：</strong>單詞胡言亂語、不恰當字詞 (Inappropriate words)</li>
                  <li><strong>2分：</strong>無意義呻吟、叫聲 (Incomprehensible sounds)</li>
                  <li><strong>1分：</strong>無語言反應 (None)</li>
                  <li><strong>VT：</strong>氣切管無法言語 (Tracheostomy)</li>
                  <li><strong>VE：</strong>氣管插管 (Endotracheal tube)</li>
                  <li><strong>VA：</strong>失語症 (Aphasia)</li>
                </ul>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-indigo-700 mb-1">運動反應 (Motor Response, M) - 最高 6 分</h4>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li><strong>6分：</strong>能聽從指令動作 (Obeys commands)</li>
                  <li><strong>5分：</strong>對痛刺激能定位 (Localizes pain)</li>
                  <li><strong>4分：</strong>對痛刺激能屈曲迴避 (Withdrawal from pain)</li>
                  <li><strong>3分：</strong>去皮質異常屈曲 (Decorticate flexion)</li>
                  <li><strong>2分：</strong>去大腦異常伸展 (Decerebrate extension)</li>
                  <li><strong>1分：</strong>無運動反應 (None)</li>
                </ul>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
                <strong>總分判讀：</strong>15分正常；13-14分輕度腦損(嗜睡)；9-12分中度腦損；&le;8分為重度腦昏迷(Coma)，需立即維護呼吸道。
              </div>
            </div>
          )}

          {tab === 'VS' && (
            <div className="space-y-3">
              <table className="w-full border border-slate-200 rounded-lg overflow-hidden text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2 border-b border-slate-200">指標</th>
                    <th className="p-2 border-b border-slate-200">成人正常範圍</th>
                    <th className="p-2 border-b border-slate-200">危急警戒值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-semibold">體溫 (BT)</td>
                    <td className="p-2">36.0 - 37.4 °C</td>
                    <td className="p-2 text-rose-600 font-medium">&ge; 38.5 °C (高燒) 或 &lt; 35.0 °C</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">脈搏 (HR)</td>
                    <td className="p-2">60 - 100 次/分</td>
                    <td className="p-2 text-rose-600 font-medium">&gt; 120 次/分 或 &lt; 50 次/分</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">呼吸 (RR)</td>
                    <td className="p-2">12 - 20 次/分</td>
                    <td className="p-2 text-rose-600 font-medium">&gt; 24 次/分 或 &lt; 10 次/分</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">血壓 (BP)</td>
                    <td className="p-2">&lt; 120 / &lt; 80 mmHg</td>
                    <td className="p-2 text-rose-600 font-medium">SBP &gt; 180 或 &lt; 90 mmHg</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">血氧 (SpO2)</td>
                    <td className="p-2">&ge; 95% (Room air)</td>
                    <td className="p-2 text-rose-600 font-medium">&lt; 90% (需立即給氧處置)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === 'DART' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <span className="font-bold text-teal-800 block mb-1">D (Data 主客觀資料)</span>
                <p className="text-slate-600">包含主觀陳述(病患主訴)與客觀徵象(生命徵象、檢查報告、傷口外觀、管路狀況、身體評估等)。</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                <span className="font-bold text-sky-800 block mb-1">A (Action 護理措施)</span>
                <p className="text-slate-600">針對問題所採取的獨立性或依醫囑之處置(如給藥、擺位、換藥、抽痰、衛教、通知醫師等)。</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <span className="font-bold text-indigo-800 block mb-1">R (Response 處置後反應)</span>
                <p className="text-slate-600">處置介入後特定時間內(如30-60分鐘)病患之成效評估與追蹤數值變化。</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="font-bold text-purple-800 block mb-1">T (Teaching 衛生教育)</span>
                <p className="text-slate-600">針對該焦點給予病人及家屬的健康照護指導、自我防護與注意事項。</p>
              </div>
            </div>
          )}

          {tab === 'ABBR' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { abbr: 'QD', desc: '每日一次 (每天)' },
                { abbr: 'BID', desc: '每日兩次' },
                { abbr: 'TID', desc: '每日三次' },
                { abbr: 'QID', desc: '每日四次' },
                { abbr: 'Q4H / Q6H', desc: '每4/6小時一次' },
                { abbr: 'PRN', desc: '需要時給予' },
                { abbr: 'STAT / ST', desc: '即刻給予一次' },
                { abbr: 'AC', desc: '飯前' },
                { abbr: 'PC', desc: '飯後' },
                { abbr: 'HS', desc: '睡前' },
                { abbr: 'NPO', desc: '禁食禁水' },
                { abbr: 'DC', desc: '停止/停用醫囑' },
                { abbr: 'C/O', desc: '主訴 (Complains of)' },
                { abbr: 'S/P', desc: '術後 / 處置後狀態' },
                { abbr: 'SOB / DOE', desc: '呼吸急促 / 活動後氣喘' },
                { abbr: 'IVF', desc: '靜脈點滴輸液' },
                { abbr: 'CD', desc: '乾淨消毒換藥' },
                { abbr: 'I/O', desc: '攝入量與排出量' },
              ].map((item) => (
                <div key={item.abbr} className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-slate-800 font-mono text-xs">{item.abbr}</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer"
          >
            關閉速查
          </button>
        </div>
      </div>
    </div>
  );
};
