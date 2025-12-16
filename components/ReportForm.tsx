
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Plus, Trash2, Calendar, User, Building2, Copy, AlertCircle, FileText, Briefcase, ShieldAlert, Printer, Thermometer, Wind, HardHat } from 'lucide-react';
import { saveReport, updateReport } from '../services/storage';
import { JOB_TITLES, DEPARTMENTS, ManpowerRow, Activity, TomorrowActivity, Report, HSEInfo } from '../types';

interface ReportFormProps {
  onBack: () => void;
  initialData?: Report;
  isAdmin?: boolean;
  onPrint?: () => void;
}

const LOCATION_OPTIONS = ['OPS', 'WPS', 'PP', 'GPS', 'FSF', 'WS1', 'WS2'];

export const ReportForm: React.FC<ReportFormProps> = ({ onBack, initialData, isAdmin, onPrint }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const activityEndRef = useRef<HTMLDivElement>(null);
  const tomorrowEndRef = useRef<HTMLDivElement>(null);

  // State
  const [basicInfo, setBasicInfo] = useState({
    projectName: '',
    reportDate: new Date().toISOString().split('T')[0],
    reportedByName: '',
    reportedByDept: '',
    reportingToDept: '',
    reportingToManager: '',
    generalNote: ''
  });

  const [hseInfo, setHseInfo] = useState<HSEInfo>({
    weatherCondition: 'Clear / مشمس',
    temperature: '',
    windSpeed: '',
    toolboxTalk: false,
    remarks: ''
  });

  const [manpower, setManpower] = useState<ManpowerRow[]>(
    JOB_TITLES.map(title => ({
      jobTitle: title, gps: 0, ops: 0, wps: 0, pp: 0, fsf: 0, ws1: 0, ws2: 0, ogm: 0, others: 0, total: 0
    }))
  );

  const [activities, setActivities] = useState<Activity[]>([]);
  const [tomorrowPlan, setTomorrowPlan] = useState<TomorrowActivity[]>([]);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setBasicInfo({
        projectName: initialData.projectName,
        reportDate: initialData.reportDate,
        reportedByName: initialData.reportedByName,
        reportedByDept: initialData.reportedByDept,
        reportingToDept: initialData.reportingToDept,
        reportingToManager: initialData.reportingToManager,
        generalNote: initialData.generalNote,
      });
      if (initialData.hseInfo) setHseInfo(initialData.hseInfo);
      setManpower(initialData.manpower);
      setActivities(initialData.activities);
      setTomorrowPlan(initialData.tomorrowPlan);
      setAdminNotes(initialData.adminNotes || '');
    }
  }, [initialData]);

  const copyLastReport = () => {
    alert("ميزة النسخ: سيتم تنفيذها في الإصدار القادم");
  };

  const handleManpowerChange = (index: number, field: keyof ManpowerRow, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const newManpower = [...manpower];
    (newManpower[index] as any)[field] = numValue;
    const row = newManpower[index];
    row.total = row.gps + row.ops + row.wps + row.pp + row.fsf + row.ws1 + row.ws2 + row.ogm + row.others;
    setManpower(newManpower);
  };

  const addActivity = () => {
    setActivities([...activities, {
      id: crypto.randomUUID(), description: '', type: '', permitNo: '', discipline: '',
      equipNo: '', location: '', status: '', workers: '', startTime: '', endTime: '', remarks: ''
    }]);
    setTimeout(() => activityEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    setActivities(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addTomorrowActivity = () => {
    setTomorrowPlan([...tomorrowPlan, {
      id: crypto.randomUUID(), description: '', type: '', permitNo: '', discipline: '',
      equipNo: '', location: '', priority: '', workers: '', startTime: '', endTime: '', remarks: ''
    }]);
    setTimeout(() => tomorrowEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const updateTomorrowActivity = (id: string, field: keyof TomorrowActivity, value: string) => {
    setTomorrowPlan(tomorrowPlan.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSubmit = async () => {
    if (!basicInfo.projectName || !basicInfo.reportedByName) {
      alert("يرجى تعبئة الحقول الأساسية");
      setActiveTab(1);
      return;
    }

    const invalidActivities = activities.filter(a => a.permitNo && !/^[a-zA-Z0-9-]+$/.test(a.permitNo));
    if (invalidActivities.length > 0) {
        alert("تنسيق رقم التصريح غير صحيح (أحرف وأرقام وشرطات فقط)");
        setActiveTab(3);
        return;
    }

    setIsSubmitting(true);
    const reportData: Report = {
      id: initialData ? initialData.id : '',
      timestamp: initialData ? initialData.timestamp : 0,
      ...basicInfo,
      hseInfo,
      manpower,
      activities,
      tomorrowPlan,
      adminNotes: isAdmin ? adminNotes : undefined
    };

    await new Promise(resolve => setTimeout(resolve, 800));
    const success = initialData && isAdmin ? updateReport(reportData) : saveReport(reportData);

    if (success) {
      setIsSuccess(true);
      setTimeout(onBack, 1500);
    } else {
      alert("خطأ في الحفظ");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return (
    <div className="flex flex-col items-center justify-center h-full bg-green-50 animate-in fade-in zoom-in">
      <CheckCircle2 size={64} className="text-green-600 mb-4" />
      <h2 className="text-2xl font-bold text-green-800">تم الحفظ بنجاح!</h2>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-30">
        <button onClick={onBack} className="p-2 -mr-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-50">
          <ArrowRight size={22} />
        </button>
        <h2 className="text-base font-bold text-slate-800">
            {initialData ? (isAdmin ? 'مراجعة التقرير' : 'تعديل') : 'تقرير جديد'}
        </h2>
        <div className="flex gap-2">
            {initialData && onPrint && (
                <button onClick={onPrint} className="text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200">
                    <Printer size={18} />
                </button>
            )}
            {!initialData && (
                <button onClick={copyLastReport} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100">
                    نسخ سابق
                </button>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 shadow-sm sticky top-[60px] z-20 overflow-x-auto no-scrollbar">
        {[
          { id: 1, label: 'الأساسية', icon: FileText },
          { id: 5, label: 'السلامة والطقس', icon: HardHat }, // New Tab
          { id: 2, label: 'القوى', icon: User },
          { id: 3, label: 'الأنشطة', icon: Briefcase },
          { id: 4, label: 'غداً', icon: Calendar },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-w-[80px] ${
              activeTab === tab.id ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Tab 1: Basic Info */}
        {activeTab === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <Input label="اسم المشروع *" value={basicInfo.projectName} onChange={v => setBasicInfo({...basicInfo, projectName: v})} placeholder="اسم المشروع" />
              <div className="grid grid-cols-2 gap-3">
                 <Input label="التاريخ" type="date" value={basicInfo.reportDate} onChange={v => setBasicInfo({...basicInfo, reportDate: v})} />
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1">القسم</label>
                   <select value={basicInfo.reportedByDept} onChange={e => setBasicInfo({...basicInfo, reportedByDept: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                     <option value="">اختر القسم</option>
                     {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                 </div>
              </div>
              <Input label="اسم المبلغ *" value={basicInfo.reportedByName} onChange={v => setBasicInfo({...basicInfo, reportedByName: v})} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="موجه إلى (القسم)" value={basicInfo.reportingToDept} onChange={v => setBasicInfo({...basicInfo, reportingToDept: v})} />
                <Input label="موجه إلى (المدير)" value={basicInfo.reportingToManager} onChange={v => setBasicInfo({...basicInfo, reportingToManager: v})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظة عامة</label>
                <textarea value={basicInfo.generalNote} onChange={e => setBasicInfo({...basicInfo, generalNote: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: HSE & Weather */}
        {activeTab === 5 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
                 <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 space-y-4">
                     <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                        <HardHat size={18} />
                        بيانات السلامة والبيئة (HSE)
                     </h3>
                     
                     <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-orange-100">
                        <input 
                            type="checkbox" 
                            checked={hseInfo.toolboxTalk} 
                            onChange={e => setHseInfo({...hseInfo, toolboxTalk: e.target.checked})}
                            className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500" 
                        />
                        <span className="text-sm font-bold text-slate-700">تم عقد اجتماع السلامة (Toolbox Talk)</span>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                                <Thermometer size={14}/> الحرارة (C)
                             </label>
                             <input type="number" value={hseInfo.temperature} onChange={e => setHseInfo({...hseInfo, temperature: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="Ex: 35" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                                <Wind size={14}/> الرياح (km/h)
                             </label>
                             <input type="number" value={hseInfo.windSpeed} onChange={e => setHseInfo({...hseInfo, windSpeed: e.target.value})}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="Ex: 15" />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600">حالة الطقس العامة</label>
                        <Select 
                            value={hseInfo.weatherCondition} 
                            onChange={v => setHseInfo({...hseInfo, weatherCondition: v})} 
                            options={['Clear / مشمس', 'Cloudy / غائم', 'Rainy / ممطر', 'Windy / عاصف', 'Dusty / مغبر']} 
                            placeholder="اختر الحالة" 
                        />
                     </div>
                     
                     <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات السلامة (اختياري)</label>
                        <textarea value={hseInfo.remarks} onChange={e => setHseInfo({...hseInfo, remarks: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-200 outline-none h-20 resize-none" 
                          placeholder="ملاحظات إضافية حول السلامة..." />
                    </div>
                 </div>
            </div>
        )}

        {/* Tab 2: Manpower */}
        {activeTab === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
               <span className="text-xs font-bold text-blue-700">إجمالي القوى العاملة:</span>
               <span className="text-lg font-black text-blue-800">{manpower.reduce((sum, row) => sum + row.total, 0)}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-right font-bold text-slate-600 min-w-[120px]">الوظيفة</th>
                      {LOCATION_OPTIONS.map(loc => <th key={loc} className="p-2 text-center text-slate-500 w-12">{loc}</th>)}
                      <th className="p-2 text-center text-slate-500 w-12">OGM</th>
                      <th className="p-2 text-center text-slate-500 w-12">أخرى</th>
                      <th className="p-2 text-center font-bold text-slate-700 w-12 bg-slate-100">مجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {manpower.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-700">{row.jobTitle}</td>
                        {['ops', 'wps', 'pp', 'gps', 'fsf', 'ws1', 'ws2', 'ogm', 'others'].map((key) => (
                          <td key={key} className="p-1">
                            <input type="number" min="0" className="w-full text-center bg-slate-50 rounded-md py-1 border border-transparent focus:border-blue-300 focus:bg-white outline-none"
                              value={(row as any)[key] || ''} onChange={(e) => handleManpowerChange(idx, key as any, e.target.value)} />
                          </td>
                        ))}
                        <td className="p-2 text-center font-bold text-slate-800 bg-slate-50">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Activities */}
        {activeTab === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group">
                <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <span className="bg-blue-100 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{index + 1}</span>
                     نشاط
                   </h4>
                   <button onClick={() => setActivities(activities.filter(a => a.id !== activity.id))} className="text-red-400 hover:text-red-600 p-1">
                     <Trash2 size={16} />
                   </button>
                </div>
                <div className="space-y-3">
                   <textarea placeholder="وصف النشاط..." className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none h-20"
                     value={activity.description} onChange={e => updateActivity(activity.id, 'description', e.target.value)} />
                   
                   <div className="grid grid-cols-2 gap-3">
                      <Input label="رقم التصريح" value={activity.permitNo} onChange={v => updateActivity(activity.id, 'permitNo', v)} />
                      <Input label="رقم المعدة" value={activity.equipNo} onChange={v => updateActivity(activity.id, 'equipNo', v)} />
                   </div>

                   <div className="grid grid-cols-3 gap-2">
                     <Select value={activity.type} onChange={v => updateActivity(activity.id, 'type', v)} options={['PM', 'CM']} placeholder="النوع" />
                     <Select value={activity.status} onChange={v => updateActivity(activity.id, 'status', v)} options={['مكتمل', 'قيد التنفيذ', 'متوقف']} placeholder="الحالة" />
                     <Select value={activity.location} onChange={v => updateActivity(activity.id, 'location', v)} options={LOCATION_OPTIONS} placeholder="الموقع" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <Input type="time" label="من" value={activity.startTime} onChange={v => updateActivity(activity.id, 'startTime', v)} />
                      <Input type="time" label="إلى" value={activity.endTime} onChange={v => updateActivity(activity.id, 'endTime', v)} />
                   </div>
                </div>
              </div>
            ))}
            <div ref={activityEndRef} />
            <button onClick={addActivity} className="w-full py-3 bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-700 active:scale-95 transition-all">
              <Plus size={18} /> إضافة نشاط
            </button>
          </div>
        )}

        {/* Tab 4: Tomorrow Plan */}
        {activeTab === 4 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
             {tomorrowPlan.map((item, index) => (
               <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group">
                 <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <span className="bg-purple-100 text-purple-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{index + 1}</span>
                     مخطط
                   </h4>
                   <button onClick={() => setTomorrowPlan(tomorrowPlan.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 p-1">
                     <Trash2 size={16}/>
                   </button>
                 </div>

                 <div className="space-y-3">
                   <textarea placeholder="وصف النشاط المخطط..." className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-100 outline-none resize-none h-20"
                     value={item.description} onChange={e => updateTomorrowActivity(item.id, 'description', e.target.value)} />
                   
                   <div className="grid grid-cols-2 gap-3">
                      <Input label="رقم التصريح" value={item.permitNo || ''} onChange={v => updateTomorrowActivity(item.id, 'permitNo', v)} />
                      <Input label="رقم المعدة" value={item.equipNo || ''} onChange={v => updateTomorrowActivity(item.id, 'equipNo', v)} />
                   </div>

                   <div className="grid grid-cols-3 gap-2">
                     <Select value={item.type || ''} onChange={v => updateTomorrowActivity(item.id, 'type', v)} options={['PM', 'CM']} placeholder="النوع" />
                     <Select value={item.priority || ''} onChange={v => updateTomorrowActivity(item.id, 'priority', v)} options={['عالية', 'متوسطة', 'منخفضة']} placeholder="الأولوية" />
                     <Select value={item.location || ''} onChange={v => updateTomorrowActivity(item.id, 'location', v)} options={LOCATION_OPTIONS} placeholder="الموقع" />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <Input type="time" label="متوقع من" value={item.startTime || ''} onChange={v => updateTomorrowActivity(item.id, 'startTime', v)} />
                      <Input type="time" label="إلى" value={item.endTime || ''} onChange={v => updateTomorrowActivity(item.id, 'endTime', v)} />
                   </div>
                 </div>
               </div>
             ))}
             <div ref={tomorrowEndRef} />
             <button onClick={addTomorrowActivity} className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400">
               <Plus size={18} /> إضافة خطة للغد
             </button>
             
             {isAdmin && (
               <div className="mt-8 pt-6 border-t border-slate-200">
                  <label className="block text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                    <ShieldAlert size={16}/> ملاحظات المسؤول (للمراجعة فقط)
                  </label>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                    className="w-full bg-red-50 border border-red-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 outline-none h-24" 
                    placeholder="ملاحظات سرية للإدارة..." />
               </div>
             )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-30">
        <button onClick={handleSubmit} disabled={isSubmitting}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التقرير'}
        </button>
      </div>
    </div>
  );
};

// Helper Components to reduce code size
const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
  <div>
    {label && <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
  </div>
);

const Select = ({ value, onChange, options, placeholder }: any) => (
  <div>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
      <option value="">{placeholder}</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
