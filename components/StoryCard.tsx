
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Download, Search, FileText, User, Filter, Eye, Printer, PieChart, LayoutList, BarChart3, TrendingUp, Users, CheckCircle2, Upload, Save } from 'lucide-react';
import { Report } from '../types';
import { getReports, exportToExcel, getBackupData, restoreBackupData } from '../services/storage';

interface AdminDashboardProps {
  onBack: () => void;
  onReview: (report: Report) => void;
  onPrint?: (report: Report) => void;
}

type SortOption = 'date' | 'name';
type ViewMode = 'LIST' | 'STATS';

const SimplePieChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  if (total === 0) return <div className="text-center text-slate-400 text-[10px] py-8">No data</div>;

  return (
    <div className="flex items-center justify-center gap-6">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
            const pathData = total === item.value ? "M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0" : `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
            const el = <path key={index} d={pathData} fill={colors[index % colors.length]} stroke="white" strokeWidth="1" />;
            currentAngle += angle;
            return el;
          })}
          <circle cx="50" cy="50" r="30" fill="white" />
        </svg>
      </div>
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-[10px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
            <span className="text-slate-600 font-bold">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onReview, onPrint }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setReports(getReports()); }, []);

  const handleBackup = () => {
    const data = getBackupData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleRestoreClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (restoreBackupData(event.target?.result as string)) {
                alert("Restored successfully!");
                setReports(getReports());
            } else { alert("Failed to restore."); }
        };
        reader.readAsText(file);
    }
  };

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const totalActivities = reports.reduce((acc, r) => acc + r.activities.length, 0);
    const completed = reports.reduce((acc, r) => acc + r.activities.filter(a => a.status === 'Completed').length, 0);
    const completionRate = totalActivities > 0 ? Math.round((completed / totalActivities) * 100) : 0;
    const manpower = reports.reduce((acc, r) => acc + r.manpower.reduce((m, row) => m + row.total, 0), 0);
    return { totalReports, totalActivities, completionRate, manpower };
  }, [reports]);

  const sortedReports = [...reports]
    .filter(r => r.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortOption === 'date' ? new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime() : a.projectName.localeCompare(b.projectName));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 py-4 shadow-sm border-b sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <button onClick={onBack} className="p-2 -ml-2 text-slate-400"><ArrowLeft size={24} /></button>
                <h2 className="text-lg font-bold text-slate-800">Admin Dashboard</h2>
            </div>
            <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                <button onClick={handleRestoreClick} className="p-2 bg-slate-50 border rounded-lg text-slate-600"><Upload size={18} /></button>
                <button onClick={handleBackup} className="p-2 bg-slate-50 border rounded-lg text-slate-600"><Save size={18} /></button>
                <button onClick={() => exportToExcel(sortedReports)} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border font-bold text-xs">Excel</button>
            </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('LIST')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'LIST' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>List View</button>
            <button onClick={() => setViewMode('STATS')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'STATS' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Analytics</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {viewMode === 'STATS' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl border flex flex-col justify-center">
                        <span className="text-2xl font-black text-slate-800">{stats.totalReports}</span>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Reports</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border flex flex-col justify-center">
                        <span className="text-2xl font-black text-slate-800">{stats.completionRate}%</span>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Completion</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Total Activities Logged</h3>
                    <div className="flex items-center gap-4">
                        <TrendingUp className="text-blue-500" size={32} />
                        <span className="text-4xl font-black text-slate-800">{stats.totalActivities}</span>
                    </div>
                </div>
            </div>
        )}

        {viewMode === 'LIST' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="bg-white border rounded-xl flex items-center px-3 py-2 shadow-sm">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input type="text" placeholder="Search projects..." className="bg-transparent w-full outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="space-y-3">
                    {sortedReports.map(report => (
                        <div key={report.id} className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{report.projectName}</h3>
                                    <span className="text-[10px] text-slate-400 font-medium">{report.reportDate}</span>
                                </div>
                                <span className="text-[10px] font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-400">{report.id.substring(0, 6)}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onReview(report)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">View</button>
                                <button onClick={() => onPrint?.(report)} className="bg-slate-50 text-slate-600 px-3 py-2 rounded-lg"><Printer size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
