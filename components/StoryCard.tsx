import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Download, Search, FileText, User, Filter, Eye, Printer, PieChart, LayoutList, BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { Report } from '../types';
import { getReports, exportToExcel } from '../services/storage';

interface AdminDashboardProps {
  onBack: () => void;
  onReview: (report: Report) => void;
  onPrint?: (report: Report) => void;
}

type SortOption = 'date' | 'name' | 'dept';
type ViewMode = 'LIST' | 'STATS';

// Custom Simple Pie Chart Component using SVG
const SimplePieChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  if (total === 0) return <div className="text-center text-slate-400 text-xs py-8">لا توجد بيانات</div>;

  return (
    <div className="flex items-center justify-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const largeArc = angle > 180 ? 1 : 0;
            const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
            
            // If only one item, draw full circle
            const pathData = total === item.value 
                ? "M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0" 
                : `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

            const el = <path key={index} d={pathData} fill={colors[index % colors.length]} stroke="white" strokeWidth="1" />;
            currentAngle += angle;
            return el;
          })}
          <circle cx="50" cy="50" r="30" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-600">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
            <span className="text-slate-600 font-bold">{item.label}</span>
            <span className="text-slate-400">({Math.round((item.value/total)*100)}%)</span>
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

  useEffect(() => {
    setReports(getReports());
  }, []);

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const totalActivities = reports.reduce((acc, r) => acc + r.activities.length, 0);
    const completedActivities = reports.reduce((acc, r) => acc + r.activities.filter(a => a.status === 'مكتمل').length, 0);
    const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
    const totalManpower = reports.reduce((acc, r) => acc + r.manpower.reduce((mAcc, row) => mAcc + row.total, 0), 0);

    // Status Data for Pie Chart
    const statusCounts = reports.reduce((acc, r) => {
        r.activities.forEach(a => {
            const s = a.status || 'غير محدد';
            acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const pieData = [
        { label: 'مكتمل', value: statusCounts['مكتمل'] || 0 },
        { label: 'قيد التنفيذ', value: statusCounts['قيد التنفيذ'] || 0 },
        { label: 'متوقف', value: statusCounts['متوقف'] || 0 },
    ].filter(d => d.value > 0);

    // Dept Data for Bar Chart
    const deptCounts = reports.reduce((acc, r) => {
        const d = r.reportedByDept || 'غير محدد';
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(deptCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number)) // Sort by count desc
        .slice(0, 5); // Top 5

    return { totalReports, totalActivities, completionRate, totalManpower, pieData, barData };
  }, [reports]);

  // --- LIST FILTERING ---
  const filteredReports = reports.filter(r => 
    r.reportedByName.includes(searchTerm) || 
    r.projectName.includes(searchTerm)
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortOption === 'date') return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
    if (sortOption === 'name') return a.projectName.localeCompare(b.projectName, 'ar');
    if (sortOption === 'dept') return (a.reportedByDept || '').localeCompare(b.reportedByDept || '', 'ar');
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm border-b border-slate-100 sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
            <div className="flex items-center">
            <button onClick={onBack} className="p-2 -mr-2 text-slate-400 hover:text-primary">
                <ArrowRight size={24} />
            </button>
            <h2 className="mr-2 text-lg font-bold text-slate-800">لوحة التحكم</h2>
            </div>
            <button 
            onClick={() => exportToExcel(sortedReports)}
            className="flex items-center text-xs font-bold bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200 hover:bg-green-100"
            >
            <Download size={16} className="ml-1" />
            Excel
            </button>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
                onClick={() => setViewMode('LIST')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
                <LayoutList size={16} /> القائمة
            </button>
            <button 
                onClick={() => setViewMode('STATS')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'STATS' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
                <PieChart size={16} /> التحليلات
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* --- STATS VIEW --- */}
        {viewMode === 'STATS' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                             <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={18} /></div>
                             <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">الكل</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-800">{stats.totalReports}</span>
                            <p className="text-xs text-slate-500">تقرير مسجل</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                             <div className="bg-green-50 p-2 rounded-lg text-green-600"><CheckCircle2 size={18} /></div>
                             <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">إنجاز</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-800">{stats.completionRate}%</span>
                            <p className="text-xs text-slate-500">نسبة اكتمال المهام</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                             <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Users size={18} /></div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-800">{stats.totalManpower}</span>
                            <p className="text-xs text-slate-500">إجمالي القوى العاملة</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                             <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><TrendingUp size={18} /></div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-800">{stats.totalActivities}</span>
                            <p className="text-xs text-slate-500">نشاط تم رصده</p>
                        </div>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <PieChart size={16} className="text-slate-400"/>
                        حالة الأنشطة
                    </h3>
                    <SimplePieChart 
                        data={stats.pieData} 
                        colors={['#10b981', '#3b82f6', '#ef4444']} 
                    />
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 size={16} className="text-slate-400"/>
                        التقارير حسب القسم
                    </h3>
                    <div className="space-y-3">
                        {stats.barData.length === 0 ? <p className="text-center text-xs text-slate-400">لا توجد بيانات</p> : 
                        stats.barData.map(([dept, count], idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold text-slate-700">{dept}</span>
                                    <span className="text-slate-500">{count}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 rounded-full" 
                                        style={{ width: `${(count / stats.totalReports) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- LIST VIEW --- */}
        {viewMode === 'LIST' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
                {/* Search & Filter */}
                <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center px-3 py-2 shadow-sm">
                        <Search size={18} className="text-slate-400 ml-2" />
                        <input
                        type="text"
                        placeholder="بحث بالاسم أو المشروع..."
                        className="bg-transparent w-full outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setSortOption(prev => prev === 'date' ? 'name' : 'date')}
                        className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-500 shadow-sm"
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* List Items */}
                {sortedReports.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>لا توجد تقارير مطابقة</p>
                    </div>
                ) : (
                    sortedReports.map((report) => (
                    <div key={report.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{report.projectName}</h3>
                                <span className="text-xs text-slate-500 block mt-1">{report.reportDate}</span>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                                {report.id.substring(0, 6)}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
                            <div className="flex items-center gap-1">
                                <User size={12} className="text-slate-400" />
                                <span>{report.reportedByName}</span>
                            </div>
                            <div className="w-px h-3 bg-slate-300"></div>
                            <div className="flex items-center gap-1">
                                <FileText size={12} className="text-slate-400" />
                                <span>{report.activities.length} أنشطة</span>
                            </div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-50 pt-3">
                            <button 
                                onClick={() => onReview(report)}
                                className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"
                            >
                                <Eye size={14} /> عرض
                            </button>
                            {onPrint && (
                                <button 
                                    onClick={() => onPrint(report)}
                                    className="w-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    <Printer size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                    ))
                )}
            </div>
        )}

      </div>
    </div>
  );
};