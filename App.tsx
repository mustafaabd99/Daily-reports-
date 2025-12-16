
import React, { useState } from 'react';
import { Home } from './components/Hero';
import { ReportForm } from './components/ReportForm';
import { AdminDashboard } from './components/StoryCard';
import { PrintLayout } from './components/PrintLayout';
import { ViewState, Report } from './types';
import { ShieldCheck, Phone, ArrowRight } from 'lucide-react';

const AboutPage: React.FC<{onBack: () => void}> = ({onBack}) => (
  <div className="flex flex-col h-full p-6 bg-white animate-in slide-in-from-bottom-10">
    <button onClick={onBack} className="self-end text-slate-400 mb-8 p-2 rounded-full hover:bg-slate-50">
       <ArrowRight size={24} />
    </button>
    
    <div className="flex-1 flex flex-col items-center text-center space-y-6">
       <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-[30px] flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-200">
          <ShieldCheck size={48} />
       </div>
       <h1 className="text-2xl font-black text-slate-800">نظام التقارير اليومية</h1>
       
       <div className="w-full bg-slate-50 p-6 rounded-3xl space-y-4 text-right border border-slate-100">
          <div className="border-b border-slate-100 pb-2">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">الشركة</span>
            <span className="text-sm font-bold text-slate-700">شركة المشاريع الهندسية</span>
          </div>
          <div className="border-b border-slate-100 pb-2">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">القسم</span>
            <span className="text-sm font-bold text-slate-700">قسم الصيانة والتشغيل</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">الإصدار</span>
            <span className="text-sm font-bold text-slate-700">v2.1.0 (Refactored)</span>
          </div>
       </div>

       <a href="tel:123456" className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-green-500 text-white px-6 py-4 rounded-2xl font-bold text-sm mt-8 shadow-lg shadow-green-500/20 active:scale-95 transition-all">
          <Phone size={20} />
          <span>اتصل بالدعم الفني</span>
       </a>
    </div>
    
    <p className="text-center text-[10px] text-slate-300 mt-8 font-mono">Build 2024.10.05</p>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined);

  const handleNavigate = (newView: ViewState) => {
    if (newView !== 'FORM' && newView !== 'PRINT') {
      setSelectedReport(undefined); // Reset selection when leaving form context
    }
    setView(newView);
  };

  const handleReviewReport = (report: Report) => {
    setSelectedReport(report);
    setView('FORM');
  };

  const handlePrintReport = (report: Report) => {
    setSelectedReport(report);
    setView('PRINT');
  };

  return (
    <>
      {view === 'PRINT' && selectedReport ? (
         <PrintLayout report={selectedReport} onBack={() => setView('ADMIN')} />
      ) : (
        <div className="h-screen w-full max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative border-x border-slate-200">
          {view === 'HOME' && <Home onNavigate={handleNavigate} />}
          {view === 'FORM' && (
            <ReportForm 
              onBack={() => handleNavigate('HOME')} 
              initialData={selectedReport}
              isAdmin={!!selectedReport}
              onPrint={() => setView('PRINT')}
            />
          )}
          {view === 'ADMIN' && (
            <AdminDashboard 
              onBack={() => handleNavigate('HOME')} 
              onReview={handleReviewReport}
              onPrint={handlePrintReport}
            />
          )}
          {view === 'ABOUT' && <AboutPage onBack={() => handleNavigate('HOME')} />}
        </div>
      )}
    </>
  );
};

export default App;
