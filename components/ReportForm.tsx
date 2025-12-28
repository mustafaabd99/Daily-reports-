
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArrowLeft, CheckCircle2, Plus, Trash2, Calendar, User, Building2, Copy, AlertCircle, FileText, Briefcase, ShieldAlert, Printer, Thermometer, Wind, HardHat, Camera, X, Sparkles, Wand2 } from 'lucide-react';
import { saveReport, updateReport, getLastReport } from '../services/storage';
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
  const [isAILoading, setIsAILoading] = useState(false);
  const activityEndRef = useRef<HTMLDivElement>(null);
  const tomorrowEndRef = useRef<HTMLDivElement>(null);

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
    weatherCondition: 'Clear',
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
    const lastReport = getLastReport();
    if (lastReport) {
        if(confirm(`Copy data from: ${lastReport.projectName} (${lastReport.reportDate})?`)) {
            setBasicInfo(prev => ({
                ...prev,
                projectName: lastReport.projectName,
                reportedByName: lastReport.reportedByName,
                reportedByDept: lastReport.reportedByDept,
                reportingToDept: lastReport.reportingToDept,
                reportingToManager: lastReport.reportingToManager,
            }));
            setManpower(lastReport.manpower.map(row => ({...row})));
            alert("Basic info and manpower copied successfully!");
        }
    } else {
        alert("No previous reports found to copy.");
    }
  };

  const handleAIImprove = async () => {
    if(!basicInfo.generalNote || basicInfo.generalNote.length < 5) {
        alert("Please enter a note first.");
        return;
    }
    setIsAILoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `As a professional engineering editor, rewrite the following field observation to be more professional, technically accurate, and concise in English. Input: "${basicInfo.generalNote}"`,
        });
        if (response.text) {
            setBasicInfo(prev => ({...prev, generalNote: response.text}));
        }
    } catch (e) {
        alert("AI Assistant error. Check your connection.");
    } finally {
        setIsAILoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, activityId: string) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 800;
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                updateActivity(activityId, 'imageUrl', canvas.toDataURL('image/jpeg', 0.7));
            }
            img.src = event.target?.result as string;
        }
        reader.readAsDataURL(file);
    }
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
      equipNo: '', location: '', status: '', workers: '', startTime: '', endTime: '', remarks: '', imageUrl: ''
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
      alert("Please fill in required fields.");
      setActiveTab(1);
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
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return (
    <div className="flex flex-col items-center justify-center h-full bg-green-50">
      <CheckCircle2 size={64} className="text-green-600 mb-4" />
      <h2 className="text-2xl font-bold text-green-800">Saved Successfully!</h2>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-30">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-primary rounded-full">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-base font-bold text-slate-800">
            {initialData ? (isAdmin ? 'Review Report' : 'Edit Report') : 'New Report'}
        </h2>
        <div className="flex gap-2">
            {initialData && onPrint && (
                <button onClick={onPrint} className="text-slate-600 bg-slate-100 p-2 rounded-full">
                    <Printer size={18} />
                </button>
            )}
            {!initialData && (
                <button onClick={copyLastReport} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Copy size={14} />
                    <span>Copy Prev</span>
                </button>
            )}
        </div>
      </div>

      <div className="flex bg-white p-1 shadow-sm sticky top-[60px] z-20 overflow-x-auto no-scrollbar">
        {[
          { id: 1, label: 'Basic Info', icon: FileText },
          { id: 5, label: 'HSE', icon: HardHat },
          { id: 2, label: 'Manpower', icon: User },
          { id: 3, label: 'Activities', icon: Briefcase },
          { id: 4, label: 'Tomorrow', icon: Calendar },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab.id ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {activeTab === 1 && (
          <div className="space-y-4 animate-in slide-in-from-left-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <Input label="Project Name *" value={basicInfo.projectName} onChange={v => setBasicInfo({...basicInfo, projectName: v})} placeholder="e.g. CPF Pump Service" />
              <div className="grid grid-cols-2 gap-3">
                 <Input label="Date" type="date" value={basicInfo.reportDate} onChange={v => setBasicInfo({...basicInfo, reportDate: v})} />
                 <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1">Dept</label>
                   <select value={basicInfo.reportedByDept} onChange={e => setBasicInfo({...basicInfo, reportedByDept: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none">
                     <option value="">Select Dept</option>
                     {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                 </div>
              </div>
              <Input label="Reported By *" value={basicInfo.reportedByName} onChange={v => setBasicInfo({...basicInfo, reportedByName: v})} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="To (Dept)" value={basicInfo.reportingToDept} onChange={v => setBasicInfo({...basicInfo, reportingToDept: v})} />
                <Input label="To (Manager)" value={basicInfo.reportingToManager} onChange={v => setBasicInfo({...basicInfo, reportingToManager: v})} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-600">General Remarks</label>
                    <button onClick={handleAIImprove} disabled={isAILoading}
                        className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                        {isAILoading ? <Wand2 size={10} className="animate-spin"/> : <Sparkles size={10} />}
                        AI Polish
                    </button>
                </div>
                <textarea value={basicInfo.generalNote} onChange={e => setBasicInfo({...basicInfo, generalNote: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm h-32 resize-none" 
                    placeholder="Engineering observations..." />
              </div>
            </div>
          </div>
        )}

        {activeTab === 5 && (
            <div className="space-y-4 animate-in slide-in-from-left-4">
                 <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 space-y-4">
                     <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                        <HardHat size={18} /> HSE & Weather Data
                     </h3>
                     <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-orange-100">
                        <input type="checkbox" checked={hseInfo.toolboxTalk} onChange={e => setHseInfo({...hseInfo, toolboxTalk: e.target.checked})}
                            className="w-5 h-5 rounded text-orange-600" />
                        <span className="text-sm font-bold text-slate-700">Toolbox Talk (TBT) Conducted</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <Input label="Temp (°C)" type="number" value={hseInfo.temperature} onChange={v => setHseInfo({...hseInfo, temperature: v})} />
                        <Input label="Wind (km/h)" type="number" value={hseInfo.windSpeed} onChange={v => setHseInfo({...hseInfo, windSpeed: v})} />
                     </div>
                     <Select label="Weather Condition" value={hseInfo.weatherCondition} onChange={v => setHseInfo({...hseInfo, weatherCondition: v})} 
                        options={['Clear', 'Cloudy', 'Rainy', 'Windy', 'Dusty']} />
                     <textarea value={hseInfo.remarks} onChange={e => setHseInfo({...hseInfo, remarks: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm h-20 resize-none" placeholder="HSE Remarks..." />
                 </div>
            </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4 animate-in slide-in-from-left-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center font-bold text-blue-800">
               <span>Total Manpower:</span>
               <span className="text-lg">{manpower.reduce((sum, row) => sum + row.total, 0)}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3 text-left min-w-[120px]">Title</th>
                      {LOCATION_OPTIONS.map(loc => <th key={loc} className="p-1 text-center">{loc}</th>)}
                      <th className="p-1 text-center bg-slate-100">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {manpower.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-700">{row.jobTitle}</td>
                        {['gps', 'ops', 'wps', 'pp', 'fsf', 'ws1', 'ws2'].map((key) => (
                          <td key={key} className="p-1">
                            <input type="number" min="0" className="w-8 text-center bg-slate-50 rounded-md py-1"
                              value={(row as any)[key] || ''} onChange={(e) => handleManpowerChange(idx, key as any, e.target.value)} />
                          </td>
                        ))}
                        <td className="p-2 text-center font-bold bg-slate-50">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-4 animate-in slide-in-from-left-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <span className="bg-blue-100 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{index + 1}</span>
                     Activity
                   </h4>
                   <button onClick={() => setActivities(activities.filter(a => a.id !== activity.id))} className="text-red-400"><Trash2 size={16} /></button>
                </div>
                <textarea placeholder="Description of work..." className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm h-20"
                   value={activity.description} onChange={e => updateActivity(activity.id, 'description', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                   <Input label="Permit No" value={activity.permitNo} onChange={v => updateActivity(activity.id, 'permitNo', v)} />
                   <Input label="Equip No" value={activity.equipNo} onChange={v => updateActivity(activity.id, 'equipNo', v)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                   <Select label="Type" value={activity.type} options={['PM', 'CM']} onChange={v => updateActivity(activity.id, 'type', v)} />
                   <Select label="Status" value={activity.status} options={['Completed', 'In Progress', 'Stopped']} onChange={v => updateActivity(activity.id, 'status', v)} />
                   <Select label="Loc" value={activity.location} options={LOCATION_OPTIONS} onChange={v => updateActivity(activity.id, 'location', v)} />
                </div>
                <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-slate-50 border px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2">
                        <Camera size={14} /> {activity.imageUrl ? 'Change Photo' : 'Add Photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, activity.id)} />
                    </label>
                    {activity.imageUrl && (
                        <div className="w-10 h-10 rounded overflow-hidden border">
                            <img src={activity.imageUrl} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
              </div>
            ))}
            <button onClick={addActivity} className="w-full py-3 bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg">
              <Plus size={18} /> Add Activity
            </button>
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-4 animate-in slide-in-from-left-4">
             {tomorrowPlan.map((item, index) => (
               <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                 <div className="flex justify-between items-center border-b pb-2">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <span className="bg-purple-100 text-purple-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{index + 1}</span>
                     Planned
                   </h4>
                   <button onClick={() => setTomorrowPlan(tomorrowPlan.filter(i => i.id !== item.id))} className="text-slate-300"><Trash2 size={16}/></button>
                 </div>
                 <textarea placeholder="Description of planned work..." className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm h-20"
                   value={item.description} onChange={e => updateTomorrowActivity(item.id, 'description', e.target.value)} />
                 <div className="grid grid-cols-3 gap-2">
                   <Select label="Priority" value={item.priority} options={['High', 'Medium', 'Low']} onChange={v => updateTomorrowActivity(item.id, 'priority', v)} />
                   <Select label="Loc" value={item.location} options={LOCATION_OPTIONS} onChange={v => updateTomorrowActivity(item.id, 'location', v)} />
                   <Input label="Time" type="time" value={item.startTime} onChange={v => updateTomorrowActivity(item.id, 'startTime', v)} />
                 </div>
               </div>
             ))}
             <button onClick={addTomorrowActivity} className="w-full py-3 border-2 border-dashed text-slate-500 rounded-xl flex items-center justify-center gap-2">
               <Plus size={18} /> Add Planned Task
             </button>
             {isAdmin && (
               <div className="mt-8">
                  <label className="block text-sm font-bold text-red-800 mb-2">Management Notes</label>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                    className="w-full bg-red-50 border border-red-100 rounded-xl p-3 text-sm h-24" placeholder="Confidential..." />
               </div>
             )}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-30 shadow-lg">
        <button onClick={handleSubmit} disabled={isSubmitting}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg shadow-xl disabled:opacity-70">
          {isSubmitting ? 'Saving...' : 'Save Report'}
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
  <div>
    {label && <label className="block text-[10px] font-bold text-slate-600 mb-0.5">{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder }: any) => (
  <div>
    {label && <label className="block text-[10px] font-bold text-slate-600 mb-0.5">{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none appearance-none">
      <option value="">{placeholder || 'Select'}</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
