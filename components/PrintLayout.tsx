
import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, QrCode, CalendarClock, Wind, Thermometer, CheckCircle, Printer, FileDown, Loader2, Camera } from 'lucide-react';
import { Report } from '../types';

interface PrintLayoutProps {
  report: Report;
  onBack: () => void;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ report, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    setTimeout(() => { window.print(); }, 100);
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    const element = document.getElementById('report-content');
    const opt = {
      margin: 0,
      filename: `Report_${report.reportDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => setIsDownloading(false));
  };

  const totalManpower = report.manpower.reduce((sum, row) => sum + row.total, 0);
  const completedCount = report.activities.filter(a => a.status === 'Completed').length;
  const progressPercent = report.activities.length > 0 ? Math.round((completedCount / report.activities.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="w-full bg-slate-900 text-white p-4 shadow-md flex justify-between items-center print:hidden sticky top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={18} /> Back</button>
        <div className="flex gap-2">
            <button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-green-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs">
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Download PDF
            </button>
            <button onClick={handlePrint} className="bg-blue-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs"><Printer size={16} /> Print</button>
        </div>
      </div>

      <div className="flex-1 w-full flex justify-center p-4 print:p-0">
          <div id="report-content" className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl print:shadow-none relative">
            
            <header className="border-b-2 border-blue-900 pb-4 mb-6 flex justify-between items-start">
                <div className="w-1/3">
                    <h1 className="text-2xl font-black text-slate-900 mb-1">Anton Oil</h1>
                    <p className="text-xs font-bold text-slate-600">Field Services Division</p>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <ShieldCheck size={32} className="text-blue-900 mb-1" />
                    <span className="text-lg font-black uppercase tracking-widest text-slate-800">Daily Progress Report</span>
                </div>
                <div className="w-1/3 text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Report Date</p>
                    <p className="text-sm font-mono font-bold">{report.reportDate}</p>
                    <p className="text-[8px] text-slate-400 mt-2 font-mono">REF: {report.id.substring(0,8).toUpperCase()}</p>
                </div>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-3 bg-slate-50 border rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase block">Project Name</span>
                            <h2 className="text-xs font-black text-slate-800 leading-tight">{report.projectName}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                            <div><span className="text-slate-400 font-bold block">Reported By</span><span className="font-bold">{report.reportedByName}</span></div>
                            <div><span className="text-slate-400 font-bold block">Dept</span><span className="font-bold">{report.reportedByDept}</span></div>
                        </div>
                    </div>
                </div>
                <div className="col-span-1 grid grid-rows-2 gap-2">
                    <div className="bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white p-1">
                        <span className="text-lg font-black leading-none">{totalManpower}</span>
                        <span className="text-[8px] font-bold uppercase">Manpower</span>
                    </div>
                    <div className="bg-slate-800 rounded-lg flex flex-col items-center justify-center text-white p-1">
                        <span className="text-lg font-black leading-none">{progressPercent}%</span>
                        <span className="text-[8px] font-bold uppercase">Progress</span>
                    </div>
                </div>
            </div>

            <div className="flex border rounded-lg mb-6 overflow-hidden bg-slate-50 text-[10px]">
                <div className="flex-1 p-2 border-r flex items-center justify-center gap-1 font-bold"><Wind size={10} className="text-slate-400"/> {report.hseInfo?.windSpeed || '-'} km/h</div>
                <div className="flex-1 p-2 border-r flex items-center justify-center gap-1 font-bold"><Thermometer size={10} className="text-slate-400"/> {report.hseInfo?.temperature || '-'} °C</div>
                <div className={`flex-1 p-2 flex items-center justify-center gap-1 font-bold ${report.hseInfo?.toolboxTalk ? 'text-green-700' : 'text-red-700'}`}><CheckCircle size={10}/> TBT: {report.hseInfo?.toolboxTalk ? 'Done' : 'N/A'}</div>
            </div>

            <div className="space-y-8">
                <section>
                    <h3 className="text-xs font-black text-blue-900 border-b pb-1 mb-2">01. Manpower Allocation</h3>
                    <table className="w-full text-[10px] border-collapse border">
                        <thead>
                            <tr className="bg-blue-900 text-white"><th className="p-1.5 text-left border">Job Title</th><th className="p-1 border text-center">GPS</th><th className="p-1 border text-center">OPS</th><th className="p-1 border text-center">WPS</th><th className="p-1 border text-center">Total</th></tr>
                        </thead>
                        <tbody>
                            {report.manpower.filter(r => r.total > 0).map((row, idx) => (
                                <tr key={idx} className="even:bg-slate-50"><td className="p-1.5 border font-bold text-slate-700">{row.jobTitle}</td><td className="p-1 border text-center">{row.gps || '-'}</td><td className="p-1 border text-center">{row.ops || '-'}</td><td className="p-1 border text-center">{row.wps || '-'}</td><td className="p-1 border text-center font-bold bg-slate-100">{row.total}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h3 className="text-xs font-black text-blue-900 border-b pb-1 mb-2">02. Activities Performed</h3>
                    <table className="w-full text-[10px] border-collapse border">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700"><th className="p-1.5 border text-center w-8">#</th><th className="p-1.5 border text-left">Description</th><th className="p-1.5 border text-center">Loc</th><th className="p-1.5 border text-center">Equip</th><th className="p-1.5 border text-center">Status</th></tr>
                        </thead>
                        <tbody>
                            {report.activities.map((act, idx) => (
                                <tr key={idx} className="border-b"><td className="p-1.5 border text-center text-slate-400">{idx+1}</td><td className="p-1.5 border font-medium">{act.description}</td><td className="p-1.5 border text-center">{act.location}</td><td className="p-1.5 border text-center font-mono">{act.equipNo}</td><td className="p-1.5 border text-center font-bold">{act.status}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {report.generalNote && (
                    <section>
                        <h3 className="text-xs font-black text-blue-900 mb-1">General Observations</h3>
                        <div className="border rounded p-3 text-[10px] leading-relaxed text-slate-700">{report.generalNote}</div>
                    </section>
                )}

                <div className="mt-12 pt-8 border-t grid grid-cols-3 gap-10">
                    <div className="text-center"><div className="border-b border-slate-900 mb-2 h-8"></div><p className="text-[10px] font-bold text-slate-800">Reported By</p><p className="text-[8px] text-slate-400">{report.reportedByName}</p></div>
                    <div className="text-center"><div className="border-b border-slate-300 mb-2 h-8"></div><p className="text-[10px] font-bold text-slate-400">Verified By</p></div>
                    <div className="text-center"><div className="border-b border-slate-300 mb-2 h-8"></div><p className="text-[10px] font-bold text-slate-400">Approved By</p></div>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};
