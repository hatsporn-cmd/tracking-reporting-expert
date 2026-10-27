import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ClipboardCheck, 
  FileText, 
  FolderTree, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Mic, 
  Building2, 
  FileCheck, 
  Bell,
  ChevronRight,
  Search,
  User,
  FileDown,
  Eye,
  Camera,
  Sparkles
} from 'lucide-react';

// นำเข้ารูปโลโก้ T-TEX (ปรับ path ตามที่ท่านเก็บไฟล์จริง เช่น './assets/logo.png')
import logoImg from './assets/T-REX Project YE.png';

export default function App() {
  const [lang, setLang] = useState('EN');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFloor, setSelectedFloor] = useState('8');
  const [selectedRecordRoom, setSelectedRecordRoom] = useState('801');
  const [aiTab, setAiTab] = useState('photo');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Form & AI States
  const [formFloor, setFormFloor] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formInspector, setFormInspector] = useState('');
  const [formStatus, setFormStatus] = useState('Ready For Inspection');
  const [formComments, setFormComments] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [aiValidationResult, setAiValidationResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const dict = {
    TH: {
      platformTitle: "T-TEX Platform",
      subTitle: "Tracking & Reporting",
      projectName: "Boutique Bangkok Sukhumvit 5",
      menu: {
        dashboard: "Dashboard",
        floors: "Floor Status",
        inspections: "Room Inspections",
        records: "Inspection Records",
        documents: "Documents",
        ai: "AI Assistant",
        handover: "Handover Dashboard"
      }
    },
    EN: {
      platformTitle: "T-TEX Platform",
      subTitle: "Tracking & Reporting",
      projectName: "Boutique Bangkok Sukhumvit 5",
      menu: {
        dashboard: "Dashboard",
        floors: "Floor Status",
        inspections: "Room Inspections",
        records: "Inspection Records",
        documents: "Documents",
        ai: "AI Assistant",
        handover: "Handover Dashboard"
      }
    }
  };

  const floorSummaryData = [
    { floor: 'Floor 1', passed: 3, failed: 0, ready: 2, gray: 2, total: 7, status: 'Pending' },
    { floor: 'Floor 2', passed: 5, failed: 0, ready: 3, gray: 3, total: 11, status: 'Pending' },
    { floor: 'Floor 3', passed: 12, failed: 1, ready: 5, gray: 8, total: 26, status: 'Failed' },
    { floor: 'Floor 4', passed: 11, failed: 1, ready: 7, gray: 8, total: 27, status: 'Failed' },
    { floor: 'Floor 5', passed: 11, failed: 1, ready: 9, gray: 6, total: 27, status: 'Failed' },
    { floor: 'Floor 6', passed: 11, failed: 1, ready: 7, gray: 8, total: 27, status: 'Failed' },
    { floor: 'Floor 7', passed: 12, failed: 1, ready: 5, gray: 9, total: 27, status: 'Failed' },
    { floor: 'Floor 8', passed: 10, failed: 1, ready: 6, gray: 5, total: 22, status: 'Failed' },
  ];

  const roomsFloor8 = [
    { id: '801', type: 'Type E', status: 'Failed' },
    { id: '802', type: 'Type E', status: 'Ready' },
    { id: '803', type: 'Type E', status: 'Passed' },
    { id: '804', type: 'Type E', status: 'Ready' },
    { id: '805', type: 'Type E', status: 'Passed' },
    { id: '806', type: 'Type E', status: 'Not Submitted' },
    { id: '807', type: 'Type E', status: 'Passed' },
    { id: '808', type: 'Type E', status: 'Not Submitted' },
    { id: '809', type: 'Type E', status: 'Ready' },
    { id: '810', type: 'Type E', status: 'Passed' },
    { id: '811', type: 'Type E', status: 'Ready' },
    { id: '812', type: 'Type E', status: 'Passed' },
    { id: '818', type: 'Type A', status: 'Passed' },
    { id: '819', type: 'Type S2', status: 'Not Submitted' },
    { id: '821', type: 'Type D', status: 'Ready' },
    { id: '822', type: 'Type S1', status: 'Passed' },
    { id: '824', type: 'Type C', status: 'Passed' },
    { id: '825', type: 'Type H', status: 'Ready' },
    { id: '826', type: 'Type A', status: 'Passed' },
    { id: '827', type: 'Type A', status: 'Not Submitted' },
    { id: '828', type: 'Type A', status: 'Passed' },
    { id: '829', type: 'Type A', status: 'Not Submitted' },
  ];

  const documentsList = [
    { name: 'RI-801-Plumbing-Pre-Ceiling.pdf', type: 'RI', floor: 'Floor 8', room: 'Room 801', date: '2024-10-20' },
    { name: 'RI-801-Electrical-Pre-Ceiling.pdf', type: 'RI', floor: 'Floor 8', room: 'Room 801', date: '2024-10-22' },
    { name: 'RI-802-Plumbing.pdf', type: 'RI', floor: 'Floor 8', room: 'Room 802', date: '2024-10-21' },
    { name: 'Final-Inspection-Report-801.pdf', type: 'Report', floor: 'Floor 8', room: 'Room 801', date: '2024-12-18' },
    { name: 'Final-Inspection-Report-803.pdf', type: 'Report', floor: 'Floor 8', room: 'Room 803', date: '2024-12-18' },
  ];

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedPhotos(prev => [...prev, ...files]);
      setAiValidationResult({
        status: 'success',
        message: 'AI Validated: Evidence is clear & high quality',
        confidence: '96.8%'
      });
    }
  };

  const isFormComplete = formFloor && formRoom && formCategory && formDate && formInspector;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800 flex">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between flex-shrink-0 min-h-screen select-none">
        <div>
          {/* Logo & Title (Updated to T-TEX with custom Logo) */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center border border-slate-700 shadow-md">
              <img src={logoImg} alt="T-TEX Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">T-TEX Platform</h1>
              <p className="text-[10px] text-slate-400">Tracking & Reporting</p>
            </div>
          </div>

          {/* Active Project Box */}
          <div className="p-3 mx-3 my-4 bg-[#1C2541] rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Project</p>
            <p className="text-xs font-bold text-white mt-0.5 truncate">Boutique BKK Sukhumvit 5</p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 text-xs font-medium">
            {[
              { id: 'dashboard', label: dict[lang].menu.dashboard, icon: LayoutDashboard },
              { id: 'floors', label: dict[lang].menu.floors, icon: Layers },
              { id: 'inspections', label: dict[lang].menu.inspections, icon: ClipboardCheck, isMain: true },
              { id: 'records', label: dict[lang].menu.records, icon: FileCheck },
              { id: 'documents', label: dict[lang].menu.documents, icon: FolderTree },
              { id: 'ai', label: dict[lang].menu.ai, icon: Bot },
              { id: 'handover', label: dict[lang].menu.handover, icon: CheckCircle2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    tab.isMain && !isActive
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60'
                      : isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.isMain && (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1">Main</span>
                  )}
                  {isActive && !tab.isMain && (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">Tanachock C.</p>
            <p className="text-[10px] text-slate-400 truncate">Site Engineer</p>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Boutique Bangkok Sukhumvit 5</span>
            <span>/</span>
            <span className="text-slate-900 font-bold capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200">
              <button onClick={() => setLang('TH')} className={`px-2.5 py-1 rounded-md transition ${lang === 'TH' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>TH</button>
              <button onClick={() => setLang('EN')} className={`px-2.5 py-1 rounded-md transition ${lang === 'EN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}>EN</button>
            </div>

            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm">
              SP
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Dashboard (T-TEX)</h2>
                  <p className="text-xs text-slate-500">Boutique Bangkok Sukhumvit 5 · Tracking & Reporting Expert System</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Sync | Last updated: Just now</span>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-slate-400 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Total Rooms</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">174</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Passed Rooms</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">75</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-rose-500 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Failed Rooms</p>
                  <p className="text-3xl font-black text-rose-600 mt-1">6</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Ready For Inspection</p>
                  <p className="text-3xl font-black text-blue-600 mt-1">44</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-slate-400 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Not Submitted</p>
                  <p className="text-3xl font-black text-slate-700 mt-1">49</p>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs fallback view */}
          {activeTab !== 'dashboard' && (
            <div className="bg-white p-8 rounded-xl border text-center space-y-3 max-w-2xl mx-auto my-12">
              <Sparkles className="w-10 h-10 text-blue-600 mx-auto" />
              <h3 className="font-bold text-lg capitalize">{activeTab} Module Active (T-TEX)</h3>
              <p className="text-xs text-slate-500">Tracking Reporting Expert System backend connected.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}