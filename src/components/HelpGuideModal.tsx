import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Sparkles,
  BookOpen,
  Copy,
  PlusCircle,
  Database,
  Cloud,
  CheckCircle2,
  FileText,
  Keyboard,
  Shield,
  Layers,
  ArrowRight,
  Code2,
  Settings,
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomTemplate?: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenCustomTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'custom_template' | 'variables' | 'dart_guide' | 'faq'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-guide-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 border border-white/10 shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="help-guide-title" className="font-bold text-base sm:text-lg tracking-tight">
                DITTO 4U — 系統使用說明
              </h3>
              <p className="text-xs text-teal-200/90">
                如何快速產出記錄、自訂焦點片語、活用變數代碼與 HIS 貼上技巧
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="關閉說明視窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 sm:gap-2 text-xs font-semibold overflow-x-auto">
          {(
            [
              { key: 'quickstart', label: '🚀 30秒快速上手', icon: Sparkles },
              { key: 'custom_template', label: '📝 如何自訂罐頭片語', icon: PlusCircle },
              { key: 'variables', label: '🏷️ 動態替換變數清單', icon: Code2 },
              { key: 'dart_guide', label: '🩺 DART 記錄格式規範', icon: BookOpen },
              { key: 'faq', label: '💡 常見問題與備份', icon: HelpCircle },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-teal-600 text-teal-700 font-bold bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto grow text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
          {/* TAB 1: 30秒快速上手 */}
          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <div className="bg-teal-50/70 rounded-xl p-4 border border-teal-200/80">
                <h4 className="font-bold text-teal-900 text-sm mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  臨床護理三步快打流程
                </h4>
                <p className="text-xs text-teal-800">
                  專為台灣各醫院病房、ICU 與門急診護理師設計，消除重複鍵盤輸入，減少護理書寫加班時間。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 relative">
                  <span className="absolute top-2 right-2.5 text-2xl font-black text-slate-200">1</span>
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    填寫床號與處置
                  </div>
                  <p className="text-xs text-slate-600">
                    在左側填寫床號、記錄時間（支援一鍵填入「現在」）、勾選常用臨床處置（如換藥、發燒給藥、防跌指導等）。
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 relative">
                  <span className="absolute top-2 right-2.5 text-2xl font-black text-slate-200">2</span>
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-teal-600" />
                    選擇焦點範本
                  </div>
                  <p className="text-xs text-slate-600">
                    在中央「範本庫」點選對應焦點（例如：常規巡房、發燒處置、急性疼痛等），系統即時將生理數值帶入 DART 內容。
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 relative">
                  <span className="absolute top-2 right-2.5 text-2xl font-black text-slate-200">3</span>
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                    <Copy className="w-4 h-4 text-teal-600" />
                    一鍵複製貼入 HIS
                  </div>
                  <p className="text-xs text-slate-600">
                    檢視右側產出的護理紀錄，需要時可直接打字微調，按 <strong className="text-teal-700">「一鍵複製」</strong> 後切至醫院電子病歷按 <kbd className="px-1 bg-white border border-slate-300 rounded font-mono text-[10px]">Ctrl+V</kbd> 貼上。
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  💡 臨床提速秘訣：案例快捷鍵
                </div>
                <p className="text-xs text-amber-800">
                  頂部導覽列提供「常規巡房」、「發燒處置」、「止痛評估」、「呼吸喘給氧」四種一鍵帶入按鈕，可瞬間完成全套數值模擬與測試！
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 如何自訂罐頭片語 */}
          {activeTab === 'custom_template' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-teal-600" />
                  如何建立屬於自己的臨床罐頭片語？
                </h4>
                <p className="text-xs text-slate-600">
                  每位護理師或各專科病房都有習慣的書寫措辭。本系統支援自訂並永久保存您的常用片語：
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">點擊「＋ 自訂片語」</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      在中央下方「焦點護理記錄罐頭範本庫」右上角，點擊綠色或淺色「＋ 自訂片語」按鈕展開編輯抽屜。
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">設定片語名稱與分類</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      輸入清晰名稱（例如：<code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded font-mono">自訂-化療給藥照護 (Chemo)</code>），選擇分類（常規、管路、呼吸、疼痛等）。
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">在內文中嵌入「變數代碼」</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      將您欲動態替換的數據以雙大括號標註（如 <code className="text-teal-700 font-bold bg-teal-50 px-1 rounded">&#123;&#123;生命徵象&#125;&#125;</code>、<code className="text-teal-700 font-bold bg-teal-50 px-1 rounded">&#123;&#123;時間&#125;&#125;</code>、<code className="text-teal-700 font-bold bg-teal-50 px-1 rounded">&#123;&#123;GCS&#125;&#125;</code>），套用時系統會自動填入數值！
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">儲存與同步</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      點擊「儲存自訂範本」。若您已登入，該片語會即時加密存入 Firebase 雲端；未登入狀態則安全保存在當前瀏覽器中。
                    </p>
                  </div>
                </div>
              </div>

              {onOpenCustomTemplate && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCustomTemplate();
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>立即前往新增自訂片語</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 動態替換變數清單 */}
          {activeTab === 'variables' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                  <Code2 className="w-4 h-4 text-teal-600" />
                  可用動態代碼表（在片語中使用，產生時自動帶入）
                </div>
                <p className="text-xs text-slate-600">
                  撰寫罐頭時支援中文雙括號 <code className="text-teal-700 font-mono">&#123;&#123;變數&#125;&#125;</code> 或英文代碼 <code className="text-teal-700 font-mono">&#123;VAR&#125;</code>，大小寫皆可自動識別：
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">變數標籤</th>
                      <th className="p-2.5">對應數值</th>
                      <th className="p-2.5">代入範例</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;時間&#125;&#125; 或 &#123;TIME&#125;</td>
                      <td className="p-2.5 font-sans">記錄填寫時間</td>
                      <td className="p-2.5 text-slate-600">08:30</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;日期&#125;&#125; 或 &#123;DATE&#125;</td>
                      <td className="p-2.5 font-sans">記錄日期</td>
                      <td className="p-2.5 text-slate-600">2026-09-16</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;床號&#125;&#125; 或 &#123;BED&#125;</td>
                      <td className="p-2.5 font-sans">病患床號</td>
                      <td className="p-2.5 text-slate-600">802-1</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;班別&#125;&#125; 或 &#123;SHIFT&#125;</td>
                      <td className="p-2.5 font-sans">當班班別</td>
                      <td className="p-2.5 text-slate-600">白班 / 小夜 / 大夜</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;生命徵象&#125;&#125; 或 &#123;VS&#125;</td>
                      <td className="p-2.5 font-sans">整合生理數值摘要</td>
                      <td className="p-2.5 text-slate-600 text-[11px]">BT: 36.8℃, HR: 76次/分, BP: 120/78 mmHg, SpO2: 98%</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;GCS&#125;&#125;</td>
                      <td className="p-2.5 font-sans">昏迷指數評分</td>
                      <td className="p-2.5 text-slate-600">E4V5M6 (15分)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;瞳孔&#125;&#125;</td>
                      <td className="p-2.5 font-sans">雙側瞳孔大小及反射</td>
                      <td className="p-2.5 text-slate-600">2.5mm / 2.5mm (+/+)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;疼痛&#125;&#125; 或 &#123;PAIN&#125;</td>
                      <td className="p-2.5 font-sans">疼痛部位、性質與 NRS</td>
                      <td className="p-2.5 text-slate-600">手術傷口 悶痛 NRS: 0分</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;處置&#125;&#125; 或 &#123;INTERVENTIONS&#125;</td>
                      <td className="p-2.5 font-sans">左側勾選的臨床處置清單</td>
                      <td className="p-2.5 text-slate-600">予常規巡房、維持防跌安全、床欄拉起固定</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-teal-700 font-bold font-mono">&#123;&#123;簽章&#125;&#125; 或 &#123;SIGN&#125;</td>
                      <td className="p-2.5 font-sans">護理師簽名與單位</td>
                      <td className="p-2.5 text-slate-600">陳冠宇 RN / 8B綜合病房</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DART 規範 */}
          {activeTab === 'dart_guide' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  焦點護理記錄 (Focus Charting / DART) 撰寫原則
                </h4>
                <p className="text-xs text-slate-600">
                  醫院評鑑與臨床交班廣泛採用的焦點標準結構，清晰呈現「病患事件」與「護理處置成果」：
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50">
                  <div className="font-bold text-sky-900 text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center font-bold text-xs">D</span>
                    Data（主客觀資料）
                  </div>
                  <p className="text-xs text-slate-600">
                    記錄病患主訴（S）、生命徵象、客觀檢查評估結果（O，如 GCS、傷口外觀、呼吸音等）。
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50">
                  <div className="font-bold text-teal-900 text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-xs">A</span>
                    Action（護理處置行動）
                  </div>
                  <p className="text-xs text-slate-600">
                    針對上述問題實施的獨立或醫囑護理措施（如依醫囑給藥、床欄拉起防跌、給氧、傷口換藥等）。
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">R</span>
                    Response（病患反應結果）
                  </div>
                  <p className="text-xs text-slate-600">
                    處置後病患的主觀回饋或客觀改善情況（如體溫由 38.8℃ 降至 37.2℃、疼痛緩解至 2 分等）。
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
                  <div className="font-bold text-indigo-900 text-xs flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">T</span>
                    Teaching（衛教與後續追蹤）
                  </div>
                  <p className="text-xs text-slate-600">
                    向病患或家屬執行的衛教指導內容、警訊徵兆說明，以及預計追蹤評估之時間點。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 常見問題與備份 */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-teal-600" />
                  Q1: 我記錄的資料會外洩嗎？有符合病人隱私（HIPAA）嗎？
                </h5>
                <p className="text-xs text-slate-600 mt-1 pl-5">
                  本系統設計上<strong>不儲存病患真實身分證字號與姓名</strong>（僅記錄床號代碼與當班數值）。所有雲端同步皆受 Firebase 安全規則嚴格防護，只有您登入的帳號才能讀取自己的病歷草稿。
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-teal-600" />
                  Q2: 如果在醫院不能連上外部網路，還能用嗎？
                </h5>
                <p className="text-xs text-slate-600 mt-1 pl-5">
                  完全可以！系統具備<strong>本機離線優先機制</strong>。未登入或網路中斷時，所有產出的紀錄與自訂片語皆即時保留於瀏覽器快顯儲存中，不會因網路離線而丟失。
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-teal-600" />
                  Q3: 貼入醫院 HIS 系統時排版會跑掉嗎？
                </h5>
                <p className="text-xs text-slate-600 mt-1 pl-5">
                  本系統複製文字採用純文字（Plain Text）格式並符合標準全形/半形換行規範，可相容於各大醫院 HIS（如台大、榮總、長庚、馬偕、國泰等系統）。
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-teal-600" />
                  Q4: 如何設定我固定的病房或科室名稱？
                </h5>
                <p className="text-xs text-slate-600 mt-1 pl-5">
                  點擊頂部導覽列的<strong>「設定」</strong>按鈕，即可輸入您服務的病房名稱（如：8B 綜合病房、MICU 加護病房）與常規班別，往後開啟系統便會自動帶入！
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            DITTO 4U v2.4 · 臨床專業護理快打系統
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            我知道了，開始使用
          </button>
        </div>
      </div>
    </div>
  );
};
