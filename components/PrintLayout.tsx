
import React, { useEffect } from 'react';
import { ShieldCheck, ArrowLeft, QrCode, CalendarClock, Wind, Thermometer, CheckCircle } from 'lucide-react';
import { Report } from '../types';

interface PrintLayoutProps {
  report: Report;
  onBack: () => void;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ report, onBack }) => {
  
  useEffect(() => {
    // Auto-trigger print when mounted
    setTimeout(() => {
        window.print();
    }, 800); // Increased delay slightly to ensure rendering
  }, []);

  const totalManpower = report.manpower.reduce((sum, row) => sum + row.total, 0);
  const completedActivities = report.activities.filter(a => a.status === 'مكتمل').length;
  const progressPercent = report.activities.length > 0 
    ? Math.round((completedActivities / report.activities.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-500 p-8 flex justify-center print:bg-white print:p-0 print:block font-sans">
      {/* Back Button (Hidden in Print) */}
      <button onClick={onBack} className="fixed top-4 left-4 bg-white text-slate-800 px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 print:hidden z-50 hover:bg-slate-100 border border-slate-200">
        <ArrowLeft size={20} />
        رجوع
      </button>

      {/* A4 Paper Container */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl print:shadow-none print:w-full mx-auto relative overflow-hidden text-black">
        
        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
             <ShieldCheck size={400} />
        </div>

        {/* --- HEADER --- */}
        <div className="relative z-10 border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
            <div className="text-right w-1/3">
                <h1 className="text-xl font-black text-slate-900">شركة أنتـون أويل</h1>
                <p className="text-sm font-bold text-slate-600">Anton Oilfield Services</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">قسم الصيانة والتشغيل</p>
            </div>
            
            <div className="flex flex-col items-center justify-center w-1/3">
                <div className="mb-1">
                    <img 
                        src="https://logo.clearbit.com/antonoil.com" 
                        alt="Anton Oil" 
                        className="h-16 w-auto object-contain grayscale"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }} 
                    />
                </div>
                <span className="text-[10px] font-mono tracking-[0.2em] font-bold uppercase mt-1">Daily Report</span>
            </div>

            <div className="text-left w-1/3 flex flex-col items-end">
                <div className="flex items-center gap-2 mb-2">
                    <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Report Date</span>
                        <span className="block text-sm font-mono font-bold text-slate-900">{report.reportDate}</span>
                    </div>
                    <QrCode size={36} className="text-slate-800" />
                </div>
                <div className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-right">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Reference No.</span>
                    <span className="block text-[10px] font-mono font-bold text-slate-900">{report.id.substring(0, 8).toUpperCase()}</span>
                </div>
            </div>
        </div>

        {/* --- WEATHER & HSE STRIP (NEW) --- */}
        <div className="relative z-10 flex border border-slate-300 rounded mb-4 overflow-hidden">
             <div className="w-1/4 bg-slate-50 p-2 border-r border-slate-300 flex flex-col items-center justify-center">
                 <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Weather</span>
                 <span className="text-xs font-bold text-slate-800">{report.hseInfo?.weatherCondition || 'N/A'}</span>
             </div>
             <div className="w-1/4 bg-slate-50 p-2 border-r border-slate-300 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-1 mb-1">
                     <Wind size={12} className="text-slate-500"/>
                     <span className="text-[9px] text-slate-500 font-bold uppercase">Wind Speed</span>
                 </div>
                 <span className="text-xs font-bold text-slate-800">{report.hseInfo?.windSpeed || '-'} km/h</span>
             </div>
             <div className="w-1/4 bg-slate-50 p-2 border-r border-slate-300 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-1 mb-1">
                     <Thermometer size={12} className="text-slate-500"/>
                     <span className="text-[9px] text-slate-500 font-bold uppercase">Temp</span>
                 </div>
                 <span className="text-xs font-bold text-slate-800">{report.hseInfo?.temperature || '-'} °C</span>
             </div>
             <div className={`w-1/4 p-2 flex flex-col items-center justify-center ${report.hseInfo?.toolboxTalk ? 'bg-green-50' : 'bg-red-50'}`}>
                 <div className="flex items-center gap-1 mb-1">
                     <CheckCircle size={12} className={report.hseInfo?.toolboxTalk ? 'text-green-600' : 'text-red-400'}/>
                     <span className="text-[9px] font-bold uppercase text-slate-500">Toolbox Talk</span>
                 </div>
                 <span className={`text-xs font-bold ${report.hseInfo?.toolboxTalk ? 'text-green-700' : 'text-red-700'}`}>
                    {report.hseInfo?.toolboxTalk ? 'Conducted' : 'Not Conducted'}
                 </span>
             </div>
        </div>

        {/* --- INFO BOX & KPI --- */}
        <div className="relative z-10 flex gap-4 mb-6">
            {/* Main Info */}
            <div className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">المشروع</span>
                        <h2 className="text-base font-black text-slate-800 leading-tight">{report.projectName}</h2>
                    </div>
                    <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">بواسطة</span>
                        <p className="text-xs font-bold text-slate-800">{report.reportedByName}</p>
                    </div>
                </div>
                <div className="flex gap-4 text-[10px] text-slate-600 border-t border-slate-200 pt-2">
                    <span><strong>القسم:</strong> {report.reportedByDept}</span>
                    <span><strong>موجه إلى:</strong> {report.reportingToDept}</span>
                </div>
            </div>

            {/* Mini KPI */}
            <div className="w-1/3 flex gap-1">
                 <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg flex flex-col items-center justify-center p-2">
                    <span className="text-xl font-black text-blue-700">{totalManpower}</span>
                    <span className="text-[9px] text-blue-600 font-bold uppercase">Manpower</span>
                 </div>
                 <div className="flex-1 bg-green-50 border border-green-100 rounded-lg flex flex-col items-center justify-center p-2">
                    <span className="text-xl font-black text-green-700">{progressPercent}%</span>
                    <span className="text-[9px] text-green-600 font-bold uppercase">Completion</span>
                 </div>
            </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="space-y-6 relative z-10">
            
            {/* 1. Manpower Summary */}
            <section className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-slate-800 pb-1">
                    <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">01</span>
                    <h3 className="font-bold text-slate-800 text-sm">ملخص القوى العاملة (Manpower)</h3>
                </div>
                <table className="w-full text-[10px] border-collapse border border-slate-300">
                    <thead className="bg-slate-100 print:bg-slate-100">
                        <tr>
                            <th className="border border-slate-300 p-1.5 text-right w-1/3">الوظيفة</th>
                            <th className="border border-slate-300 p-1 text-center">GPS</th>
                            <th className="border border-slate-300 p-1 text-center">OPS</th>
                            <th className="border border-slate-300 p-1 text-center">WPS</th>
                            <th className="border border-slate-300 p-1 text-center">PP</th>
                            <th className="border border-slate-300 p-1 text-center font-black">المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.manpower.filter(r => r.total > 0).map((row, idx) => (
                            <tr key={idx} className="even:bg-slate-50">
                                <td className="border border-slate-300 p-1.5 font-bold">{row.jobTitle}</td>
                                <td className="border border-slate-300 p-1 text-center">{row.gps || '-'}</td>
                                <td className="border border-slate-300 p-1 text-center">{row.ops || '-'}</td>
                                <td className="border border-slate-300 p-1 text-center">{row.wps || '-'}</td>
                                <td className="border border-slate-300 p-1 text-center">{row.pp || '-'}</td>
                                <td className="border border-slate-300 p-1 text-center font-bold bg-slate-100">{row.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* 2. Activities */}
            <section className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-slate-800 pb-1">
                    <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">02</span>
                    <h3 className="font-bold text-slate-800 text-sm">سجل الأنشطة والأعمال (Activities Log)</h3>
                </div>
                <table className="w-full text-[10px] border-collapse border border-slate-300">
                    <thead className="bg-slate-100 print:bg-slate-100">
                        <tr>
                            <th className="border border-slate-300 p-1.5 text-center w-8">#</th>
                            <th className="border border-slate-300 p-1.5 text-right">وصف النشاط</th>
                            <th className="border border-slate-300 p-1.5 text-center w-16">الموقع</th>
                            <th className="border border-slate-300 p-1.5 text-center w-20">رقم التصريح</th>
                            <th className="border border-slate-300 p-1.5 text-center w-24">الوقت</th>
                            <th className="border border-slate-300 p-1.5 text-center w-20">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.activities.map((act, idx) => (
                            <tr key={idx} className="even:bg-slate-50">
                                <td className="border border-slate-300 p-1.5 text-center text-slate-500">{idx + 1}</td>
                                <td className="border border-slate-300 p-1.5 font-medium">
                                    {act.description}
                                    {act.equipNo && <span className="block text-[9px] text-slate-500 mt-0.5">معدة #: {act.equipNo}</span>}
                                </td>
                                <td className="border border-slate-300 p-1.5 text-center">{act.location}</td>
                                <td className="border border-slate-300 p-1.5 text-center font-mono">{act.permitNo || '-'}</td>
                                <td className="border border-slate-300 p-1.5 text-center font-mono">{act.startTime} - {act.endTime}</td>
                                <td className="border border-slate-300 p-1.5 text-center">
                                    <span className={`block px-1 py-0.5 rounded-[2px] text-[9px] font-bold border ${
                                        act.status === 'مكتمل' ? 'border-green-300 bg-green-50 text-green-700' :
                                        act.status === 'قيد التنفيذ' ? 'border-blue-300 bg-blue-50 text-blue-700' : 
                                        'border-red-300 bg-red-50 text-red-700'
                                    }`}>
                                        {act.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {report.activities.length === 0 && (
                            <tr><td colSpan={6} className="text-center p-3 text-slate-400 italic">لا يوجد أنشطة مسجلة</td></tr>
                        )}
                    </tbody>
                </table>
            </section>

             {/* 3. Tomorrow's Plan (NEW SECTION) */}
             <section className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-slate-800 pb-1">
                    <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">03</span>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                         خطة العمل للغد (Tomorrow's Plan)
                         <CalendarClock size={14} className="text-slate-500" />
                    </h3>
                </div>
                <table className="w-full text-[10px] border-collapse border border-slate-300">
                    <thead className="bg-slate-100 print:bg-slate-100">
                        <tr>
                            <th className="border border-slate-300 p-1.5 text-center w-8">#</th>
                            <th className="border border-slate-300 p-1.5 text-right">وصف النشاط المخطط</th>
                            <th className="border border-slate-300 p-1.5 text-center w-20">الأولوية</th>
                            <th className="border border-slate-300 p-1.5 text-center w-20">الموقع</th>
                            <th className="border border-slate-300 p-1.5 text-center w-24">الوقت المتوقع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.tomorrowPlan.map((item, idx) => (
                            <tr key={idx} className="even:bg-slate-50">
                                <td className="border border-slate-300 p-1.5 text-center text-slate-500">{idx + 1}</td>
                                <td className="border border-slate-300 p-1.5 font-medium">
                                    {item.description}
                                    {item.equipNo && <span className="block text-[9px] text-slate-500 mt-0.5">معدة #: {item.equipNo}</span>}
                                </td>
                                <td className="border border-slate-300 p-1.5 text-center">
                                     <span className={`font-bold ${
                                        item.priority === 'عالية' ? 'text-red-600' : 'text-slate-700'
                                     }`}>{item.priority}</span>
                                </td>
                                <td className="border border-slate-300 p-1.5 text-center">{item.location}</td>
                                <td className="border border-slate-300 p-1.5 text-center font-mono">{item.startTime} - {item.endTime}</td>
                            </tr>
                        ))}
                         {report.tomorrowPlan.length === 0 && (
                            <tr><td colSpan={5} className="text-center p-3 text-slate-400 italic">لا يوجد خطط مسجلة للغد</td></tr>
                        )}
                    </tbody>
                </table>
            </section>

             {/* 4. General Notes */}
             {report.generalNote && (
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-2 border-b-2 border-slate-800 pb-1">
                        <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">04</span>
                        <h3 className="font-bold text-slate-800 text-sm">ملاحظات عامة (General Notes)</h3>
                    </div>
                    <div className="border border-slate-300 rounded p-3 text-[10px] text-slate-700 min-h-[50px] bg-slate-50 italic">
                        {report.generalNote}
                    </div>
                </section>
             )}
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-8 pt-4 border-t-2 border-slate-800 grid grid-cols-3 gap-8 break-inside-avoid">
            <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 mb-8 uppercase">Reported By</p>
                <div className="h-px bg-slate-300 w-24 mx-auto mb-1"></div>
                <p className="text-[10px] font-bold text-slate-900">{report.reportedByName}</p>
                <p className="text-[9px] text-slate-500">{report.reportedByDept}</p>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 mb-8 uppercase">Verified By</p>
                <div className="h-px bg-slate-300 w-24 mx-auto mb-1"></div>
                <p className="text-[9px] text-slate-400">Signature</p>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 mb-8 uppercase">Approved By</p>
                <div className="h-px bg-slate-300 w-24 mx-auto mb-1"></div>
                <p className="text-[9px] text-slate-400">Manager Signature</p>
            </div>
        </div>

        {/* Print Meta */}
        <div className="absolute bottom-3 left-4 text-[8px] text-slate-400 font-mono flex items-center gap-2">
             <span>Generated by Daily Report System v2.1</span>
             <span>|</span>
             <span>ID: {report.id}</span>
             <span>|</span>
             <span>{new Date().toLocaleString('en-US')}</span>
        </div>
      </div>
    </div>
  );
};
