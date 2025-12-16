import React from 'react';
import { PlusCircle, ClipboardList, Info, ShieldCheck, FileText } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-600 p-8 pt-12 pb-16 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-white blur-2xl"></div>
        </div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-xl">
             <ShieldCheck size={40} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 drop-shadow-md">نظام التقارير</h1>
          <p className="text-blue-100 font-medium">قسم الصيانة والتشغيل</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 -mt-8 relative z-20 space-y-4">
        
        {/* Primary Action */}
        <button
          onClick={() => onNavigate('FORM')}
          className="w-full bg-white rounded-2xl p-6 shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                 <PlusCircle size={28} />
              </div>
              <div className="text-right">
                 <h3 className="text-lg font-bold text-slate-800">تقرير جديد</h3>
                 <p className="text-sm text-slate-500">إدخال تقرير العمل اليومي</p>
              </div>
           </div>
           <div className="text-slate-300 group-hover:text-blue-600 transition-colors">➜</div>
        </button>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
           <button
             onClick={() => onNavigate('ADMIN')}
             className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-all hover:border-blue-200"
           >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                 <ClipboardList size={20} />
              </div>
              <span className="font-bold text-slate-700 text-sm">سجل التقارير</span>
           </button>

           <button
             onClick={() => onNavigate('ABOUT')}
             className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-all hover:border-blue-200"
           >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                 <Info size={20} />
              </div>
              <span className="font-bold text-slate-700 text-sm">حول النظام</span>
           </button>
        </div>

        {/* Quick Stats Widget (Mockup) */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
           <div className="relative z-10 flex justify-between items-end">
              <div>
                 <p className="text-slate-400 text-xs font-bold uppercase mb-1">ملخص اليوم</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">--</span>
                    <span className="text-sm text-slate-400">تقرير</span>
                 </div>
              </div>
              <FileText size={40} className="text-white/10" />
           </div>
        </div>
      </div>

      <div className="p-6 text-center">
         <p className="text-xs text-slate-400 font-medium">Engineering Projects Co. © 2024</p>
      </div>
    </div>
  );
};