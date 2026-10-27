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

// นำเข้ารูปโลโก้ T-REX ตามชื่อไฟล์ที่คุณระบุ
import logoImg from './assets/T-REX Project YE.png';

export default function App() {
  // --- GLOBAL STATE MANAGEMENT ---
  const [lang, setLang] = useState('EN'); // 'TH' | 'EN'
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | floors | inspections | records | documents | ai | handover
  const [selectedFloor, setSelectedFloor] = useState('8');
  const [selectedRecordRoom, setSelectedRecordRoom] = useState('801');
  const [aiTab, setAiTab] = useState('photo'); // photo | voice | summary
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Form State for Inspection Submission
  const [formFloor, setFormFloor] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formInspector, setFormInspector] = useState('');
  const [formStatus, setFormStatus] = useState('Ready For Inspection');
  const [formComments, setFormComments] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [uploadedRi, setUploadedRi] = useState(null);
  const [aiValidationResult, setAiValidationResult] = useState(null);

  // AI Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // Documents Center Filters
  const [docFilterFloor, setDocFilterFloor] = useState('All');
  const [docFilterTrade, setDocFilterTrade] = useState('All');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // --- BILINGUAL DICTIONARY ---
  const dict = {
    TH: {
      platformTitle: "T-REX Platform",
      subTitle: "Tracking & Reporting",
      projectName: "Boutique Bangkok Sukhumvit 5",
      liveSync: "Live Sync | อัปเดตล่าสุด: เมื่อสักครู่",
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
      platformTitle: "T-REX Platform",
      subTitle: "Tracking & Reporting",
      projectName: "Boutique Bangkok Sukhumvit 5",
      liveSync: "Live Sync | Last updated: Just now",
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

  // --- MOCK DATA FOR 7 MODULES ---
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
    { name: 'RI-601-Pre-Ceiling-MEP.pdf', type: 'RI', floor: 'Floor 6', room: 'Room 601', date: '2024-11-05' },
    { name: 'RI-401-Suite-Architecture.pdf', type: 'RI', floor: 'Floor 4', room: 'Room 401', date: '2024-11-20' },
    { name: 'Defect-Report-306-Plumbing.pdf', type: 'Defect', floor: 'Floor 3', room: 'Room 306', date: '2024-12-18' },
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

  const handleVoiceRecordToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setVoiceText('Recording audio... (Simulated Thai/English voice recognition)');
      setTimeout(() => {
        setVoiceText('พบข้อบกพร่องงานท่อน้ำบริเวณห้อง 801 วาล์วผสมยังไม่ได้ทำการติดตั้ง (Mix Valve missing in Room 801)');
        setIsRecording(false);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const isFormComplete = formFloor && formRoom && formCategory && formDate && formInspector;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800 flex">
      
      {/* ---------------------------------------------------- */}
      {/* LEFT SIDEBAR NAVIGATION                             */}
      {/* ---------------------------------------------------- */}
      <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between flex-shrink-0 min-h-screen select-none">
        <div>
          {/* Logo & Platform Title */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center border border-slate-700 shadow-md flex-shrink-0">
              <img src={logoImg} alt="T-REX Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">T-REX Platform</h1>
              <p className="text-[10px] text-slate-400">Tracking & Reporting</p>
            </div>
          </div>

          {/* Active Project Card */}
          <div className="p-3 mx-3 my-4 bg-[#1C2541] rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Project</p>
            <p className="text-xs font-bold text-white mt-0.5 truncate">Boutique BKK Sukhumvit 5</p>
          </div>

          {/* Navigation Items */}
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

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800/80 flex items-center gap-2.5 relative">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">Tanachock C.</p>
            <p className="text-[10px] text-slate-400 truncate">Site Engineer</p>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* RIGHT MAIN CONTENT CONTAINER                         */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Boutique Bangkok Sukhumvit 5</span>
            <span>/</span>
            <span className="text-slate-900 font-bold capitalize">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'floors' && 'Floor Status'}
              {activeTab === 'inspections' && 'Room Inspections'}
              {activeTab === 'records' && 'Inspection Records'}
              {activeTab === 'documents' && 'Documents'}
              {activeTab === 'ai' && 'AI Assistant'}
              {activeTab === 'handover' && 'Handover Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Language Selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200">
              <button 
                onClick={() => setLang('TH')}
                className={`px-2.5 py-1 rounded-md transition ${lang === 'TH' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                TH
              </button>
              <button 
                onClick={() => setLang('EN')}
                className={`px-2.5 py-1 rounded-md transition ${lang === 'EN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                EN
              </button>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-600 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border p-3 z-50 text-xs space-y-2">
                  <div className="font-bold text-slate-800 border-b pb-1.5 flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-[10px] text-blue-600 cursor-pointer">Mark all read</span>
                  </div>
                  <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-800">
                    <p className="font-bold">Room 801 Inspection Failed</p>
                    <p className="text-[10px] text-rose-600 mt-0.5">Missing Mix Valve in Bathroom</p>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800">
                    <p className="font-bold">Room 803 Passed</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Approved by Surachai P.</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu Dropdown */}
            <div 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-300 transition"
            >
              SP
            </div>

            {showUserMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border p-2 z-50 text-xs space-y-1">
                <div className="p-2 border-b">
                  <p className="font-bold text-slate-800">Surachai P.</p>
                  <p className="text-[10px] text-slate-500">Project Manager</p>
                </div>
                <button className="w-full text-left p-2 hover:bg-slate-50 rounded text-slate-700 font-medium">Profile Settings</button>
                <button className="w-full text-left p-2 hover:bg-rose-50 text-rose-600 rounded font-medium">Log Out</button>
              </div>
            )}
          </div>
        </header>

        {/* ---------------------------------------------------- */}
        {/* DYNAMIC MODULE PAGE CONTENT                          */}
        {/* ---------------------------------------------------- */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* ================= PAGE 1: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h2>
                  <p className="text-xs text-slate-500 font-medium">Boutique Bangkok Sukhumvit 5 · Hotel Project</p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 w-max shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>((o)) Live Sync | Last updated: Just now</span>
                </div>
              </div>

              {/* 5 KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-slate-400 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Total Rooms</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">174</p>
                  </div>
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Passed Rooms</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">75</p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-rose-500 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Failed Rooms</p>
                    <p className="text-3xl font-black text-rose-600 mt-1">6</p>
                  </div>
                  <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600">
                    <XCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-blue-500 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Ready For Inspection</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">44</p>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-slate-400 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Not Submitted</p>
                    <p className="text-3xl font-black text-slate-700 mt-1">49</p>
                  </div>
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left: Bar Chart */}
                <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-4">Inspection Status by Floor</h3>
                    
                    <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-l border-slate-200 px-2 relative">
                      <div className="absolute left-[-24px] top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400 font-semibold">
                        <span>28</span>
                        <span>21</span>
                        <span>14</span>
                        <span>7</span>
                        <span>0</span>
                      </div>

                      {[
                        { floor: 'F1', passed: 3, ready: 2, failed: 0, gray: 2 },
                        { floor: 'F2', passed: 5, ready: 3, failed: 0, gray: 3 },
                        { floor: 'F3', passed: 12, ready: 3, failed: 1, gray: 10 },
                        { floor: 'F4', passed: 11, ready: 8, failed: 1, gray: 6 },
                        { floor: 'F5', passed: 11, ready: 10, failed: 1, gray: 4 },
                        { floor: 'F6', passed: 11, ready: 8, failed: 1, gray: 6 },
                        { floor: 'F7', passed: 12, ready: 6, failed: 1, gray: 7 },
                        { floor: 'F8', passed: 10, ready: 7, failed: 1, gray: 4 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full max-w-[36px]">
                          <div className="w-full flex flex-col-reverse rounded-t overflow-hidden shadow-xs">
                            <div style={{ height: `${item.passed * 7}px` }} className="bg-emerald-500 w-full"></div>
                            <div style={{ height: `${item.failed * 7}px` }} className="bg-rose-500 w-full"></div>
                            <div style={{ height: `${item.ready * 7}px` }} className="bg-blue-500 w-full"></div>
                            <div style={{ height: `${item.gray * 7}px` }} className="bg-slate-400 w-full"></div>
                          </div>
                          <span className="text-[11px] text-slate-500 font-bold mt-2">{item.floor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-600 mt-4 pt-2">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Failed</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-400 rounded-sm"></span> Not Submitted</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Passed</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Ready For Inspection</span>
                  </div>
                </div>

                {/* Right: Donut Chart */}
                <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-4">Inspection Result Summary</h3>
                    
                    <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path strokeDasharray="43, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4.5" />
                        <path strokeDasharray="25, 100" strokeDashoffset="-43" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="4.5" />
                        <path strokeDasharray="28, 100" strokeDashoffset="-68" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#9CA3AF" strokeWidth="4.5" />
                        <path strokeDasharray="4, 100" strokeDashoffset="-96" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="4.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Passed</span><span className="font-bold">75</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Failed</span><span className="font-bold">6</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Ready For Inspection</span><span className="font-bold">44</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span> Not Submitted</span><span className="font-bold">49</span></div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= PAGE 2: FLOOR STATUS VIEW ================= */}
          {activeTab === 'floors' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Floor Status</h2>
                <p className="text-xs text-slate-500">Boutique Bangkok Sukhumvit 5</p>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left Floor Selection Menu */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Floor
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { fl: '1', count: '7 Rooms' },
                      { fl: '2', count: '11 Rooms' },
                      { fl: '3', count: '26 Rooms' },
                      { fl: '4', count: '27 Rooms' },
                      { fl: '5', count: '27 Rooms' },
                      { fl: '6', count: '27 Rooms' },
                      { fl: '7', count: '27 Rooms' },
                      { fl: '8', count: '22 Rooms' },
                    ].map((item) => (
                      <button
                        key={item.fl}
                        onClick={() => setSelectedFloor(item.fl)}
                        className={`w-full p-3 flex justify-between items-center text-left transition ${selectedFloor === item.fl ? 'bg-blue-50/80 border-l-4 border-l-blue-600 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'}`}
                      >
                        <div>
                          <p className="text-xs font-bold">Floor {item.fl}</p>
                          <p className="text-[10px] text-slate-400">{item.count}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Floor Grid Box Details */}
                <div className="lg:col-span-9 space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">Floor {selectedFloor}</h3>
                        <p className="text-xs text-slate-500">22 rooms on this floor</p>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Passed</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> Failed</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> Ready For Inspection</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-300 rounded-sm"></span> Not Submitted</span>
                      </div>
                    </div>

                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center py-1 bg-slate-50 rounded border border-dashed border-slate-200">
                      — Guest room corridor —
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {roomsFloor8.map((room) => {
                        let bgColor = 'bg-slate-200 text-slate-700 border-slate-300';
                        if (room.status === 'Failed') bgColor = 'bg-rose-500 text-white border-rose-600';
                        if (room.status === 'Ready') bgColor = 'bg-blue-500 text-white border-blue-600';
                        if (room.status === 'Passed') bgColor = 'bg-emerald-500 text-white border-emerald-600';

                        return (
                          <div 
                            key={room.id}
                            onClick={() => { setSelectedRecordRoom(room.id); setActiveTab('records'); }}
                            className={`p-3 rounded-xl border shadow-xs cursor-pointer hover:scale-105 transition-all flex flex-col justify-between h-20 ${bgColor}`}
                          >
                            <span className="font-black text-base">{room.id}</span>
                            <span className="text-[10px] opacity-90">{room.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Floor Summary Status Pills */}
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <p className="text-xl font-black text-emerald-600">10</p>
                      <p className="text-[10px] font-bold text-emerald-800 uppercase">Passed</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <p className="text-xl font-black text-rose-600">1</p>
                      <p className="text-[10px] font-bold text-rose-800 uppercase">Failed</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xl font-black text-blue-600">6</p>
                      <p className="text-[10px] font-bold text-blue-800 uppercase">Ready</p>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3">
                      <p className="text-xl font-black text-slate-700">5</p>
                      <p className="text-[10px] font-bold text-slate-600 uppercase">Not Submitted</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= PAGE 3: ROOM INSPECTIONS (SUBMIT FORM) ================= */}
          {activeTab === 'inspections' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Submit Inspection</h2>
                <p className="text-xs text-slate-500">Boutique Bangkok Sukhumvit 5</p>
              </div>

              {/* Inspection Form Details */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Inspection Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Floor <span className="text-rose-500">*</span></label>
                    <select 
                      value={formFloor} 
                      onChange={(e) => setFormFloor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select floor...</option>
                      {[1,2,3,4,5,6,7,8].map(f => <option key={f} value={f}>Floor {f}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Room Number <span className="text-rose-500">*</span></label>
                    <select 
                      value={formRoom} 
                      onChange={(e) => setFormRoom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select room...</option>
                      {['801','802','803','804','805','806','807'].map(r => <option key={r} value={r}>Room {r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Inspection Category <span className="text-rose-500">*</span></label>
                    <select 
                      value={formCategory} 
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category...</option>
                      <option value="Architecture">Architecture (สถาปัตยกรรม)</option>
                      <option value="MEP">MEP & Plumbing (งานระบบ)</option>
                      <option value="Electrical">Electrical (งานไฟฟ้า)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Inspection Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      value={formDate} 
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Inspector <span className="text-rose-500">*</span></label>
                    <select 
                      value={formInspector} 
                      onChange={(e) => setFormInspector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select inspector...</option>
                      <option value="Tanachock C.">Tanachock C. (Site Engineer)</option>
                      <option value="Surachai P.">Surachai P. (Project Manager)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Inspection Status <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-3 gap-1">
                      {['Ready For Inspection', 'Passed', 'Failed'].map((st) => (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setFormStatus(st)}
                          className={`p-2 text-[10px] font-bold rounded-lg border transition ${formStatus === st ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Comments / Remarks</label>
                  <textarea 
                    rows="3" 
                    value={formComments} 
                    onChange={(e) => setFormComments(e.target.value)}
                    placeholder="Enter comments or remarks..." 
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>

              {/* Upload Evidence Box */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Attachments <span className="text-rose-500">*</span></h3>
                
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <label className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 p-5 rounded-xl cursor-pointer flex flex-col items-center justify-center transition">
                    <Camera className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-blue-600">Add Photos *</span>
                    <span className="text-[10px] text-blue-400 mt-0.5">File Explorer / Camera</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  <label className="border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 p-5 rounded-xl cursor-pointer flex flex-col items-center justify-center transition">
                    <FileText className="w-6 h-6 text-amber-600 mb-1" />
                    <span className="text-xs font-bold text-amber-600">Add PDF</span>
                    <span className="text-[10px] text-amber-500 mt-0.5">PDF</span>
                    <input type="file" accept=".pdf" onChange={(e) => setUploadedPdf(e.target.files[0])} className="hidden" />
                  </label>

                  <label className="border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-50 p-5 rounded-xl cursor-pointer flex flex-col items-center justify-center transition">
                    <Upload className="w-6 h-6 text-purple-600 mb-1" />
                    <span className="text-xs font-bold text-purple-600">Add RI Document</span>
                    <span className="text-[10px] text-purple-400 mt-0.5">RI PDF / DOCX</span>
                    <input type="file" accept=".pdf,.docx" onChange={(e) => setUploadedRi(e.target.files[0])} className="hidden" />
                  </label>
                </div>

                {aiValidationResult && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2 text-emerald-800 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold">{aiValidationResult.message}</span>
                      <span className="text-[10px] text-emerald-600 block">Confidence: {aiValidationResult.confidence}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => alert('Draft saved successfully!')} 
                  className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition shadow-xs"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => alert('Inspection submitted successfully!')} 
                  disabled={!isFormComplete} 
                  className={`px-6 py-2.5 rounded-lg font-bold text-xs shadow-md transition ${isFormComplete ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* ================= PAGE 4: INSPECTION RECORDS ================= */}
          {activeTab === 'records' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Inspection Records</h2>
                <p className="text-xs text-slate-500">Construction Inspection Timeline</p>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left Room List */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input type="text" placeholder="Search room..." className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto text-xs">
                    {['801','802','803','804','805','807','809','810','811','812'].map((rm) => (
                      <button
                        key={rm}
                        onClick={() => setSelectedRecordRoom(rm)}
                        className={`w-full p-3 flex items-center gap-3 text-left transition ${selectedRecordRoom === rm ? 'bg-blue-50/80 border-l-4 border-l-blue-600 font-bold' : 'hover:bg-slate-50'}`}
                      >
                        <span className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center ${rm === '801' ? 'bg-rose-500' : rm === '804' || rm === '809' || rm === '811' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                          {rm.slice(-2)}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">Room {rm}</p>
                          <p className="text-[10px] text-slate-400">Type E</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Timeline Checklist */}
                <div className="lg:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Room {selectedRecordRoom} — E</h3>
                      <p className="text-xs text-slate-500">Floor 8 · Surachai P.</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedRecordRoom === '801' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {selectedRecordRoom === '801' ? '● Failed' : '● Passed'}
                    </span>
                  </div>

                  {/* Complete 13 Tasks Timeline List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Architecture / งานสถาปัตยกรรม</h4>
                    
                    {[
                      { title: 'Wall Plastering', th: 'ฉาบผนัง', date: '2026-03-10' },
                      { title: 'Guest Room Skim Coat', th: 'สกิมผนังห้องพัก', date: '2026-03-11' },
                      { title: 'Floor Leveling Screed', th: 'เทปรับระดับ', date: '2026-03-12' },
                      { title: 'Primer Coat', th: 'ทาสีรองพื้น', date: '2026-03-13' },
                      { title: 'Finish Paint — Coat 1', th: 'ทาสีจริงเที่ยวที่ 1', date: '2026-03-14' },
                      { title: 'Finish Paint — Coat 2', th: 'ทาสีจริงเที่ยวที่ 2', date: '2026-03-15' },
                      { title: 'Bathroom Tiling', th: 'ปูกระเบื้องห้องน้ำ', date: '2026-03-16' },
                      { title: 'Ceiling Frame Installation', th: 'ติดตั้งโครงฝ้าเพดาน', date: '2026-03-17' },
                      { title: 'Ceiling Board Closing', th: 'ปิดฝ้าเพดาน', date: '2026-03-18' },
                      { title: 'Main Door & Hardware', th: 'ติดตั้งประตูบานหน้าห้องพร้อมอุปกรณ์', date: '2026-03-19' },
                      { title: 'Bathroom Door & Hardware', th: 'ติดตั้งประตูห้องน้ำพร้อมอุปกรณ์', date: '2026-03-20' },
                      { title: 'Shower Screen & Hardware', th: 'ประตูฉากกั้นอาบน้ำพร้อมอุปกรณ์', date: '2026-03-21' },
                      { title: 'Skirting & Wood Floor Trim', th: 'ติดตั้งบัวและตัวจบพื้นไม้', date: '2026-03-22' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50/60 rounded-lg border border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800">{item.title}</span>
                            <span className="text-[11px] text-slate-500 block">{item.th}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                          <button onClick={() => alert(`Opening photo evidence for ${item.title}`)} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Photos
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= PAGE 5: DOCUMENTS CENTER ================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Document Center</h2>
                <p className="text-xs text-slate-500">Boutique Bangkok Sukhumvit 5</p>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    value={docSearchQuery} 
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    placeholder="Search documents..." 
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-lg" 
                  />
                </div>

                <div className="flex gap-2">
                  <select value={docFilterFloor} onChange={(e) => setDocFilterFloor(e.target.value)} className="bg-slate-50 border rounded-lg px-2.5 py-1.5 font-medium">
                    <option value="All">All Floors</option>
                    {[1,2,3,4,5,6,7,8].map(f => <option key={f} value={`Floor ${f}`}>Floor {f}</option>)}
                  </select>

                  <select value={docFilterTrade} onChange={(e) => setDocFilterTrade(e.target.value)} className="bg-slate-50 border rounded-lg px-2.5 py-1.5 font-medium">
                    <option value="All">All Trades</option>
                    <option value="RI">RI Documents</option>
                    <option value="Report">Inspection Reports</option>
                    <option value="Defect">Defect Reports</option>
                  </select>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left Tree Navigator */}
                <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
                  <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-2">Document Tree</p>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <FolderTree className="w-4 h-4 text-blue-600" /> Boutique BKK
                  </div>
                  <div className="pl-4 space-y-1.5 text-slate-600 font-medium">
                    {[
                      { name: 'Floor 1', count: 0 },
                      { name: 'Floor 2', count: 1 },
                      { name: 'Floor 3', count: 1 },
                      { name: 'Floor 4', count: 1 },
                      { name: 'Floor 5', count: 0 },
                      { name: 'Floor 6', count: 2 },
                      { name: 'Floor 7', count: 1 },
                      { name: 'Floor 8', count: 6 },
                    ].map(fl => (
                      <div key={fl.name} className="flex justify-between items-center hover:text-blue-600 cursor-pointer py-0.5">
                        <span>📁 {fl.name}</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{fl.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Document Grid */}
                <div className="lg:col-span-9 space-y-3">
                  <p className="text-xs text-slate-500 font-medium">{documentsList.length} documents found</p>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    {documentsList.map((doc, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg flex-shrink-0 ${doc.type === 'RI' ? 'bg-purple-50 text-purple-600' : doc.type === 'Report' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-800 break-all">{doc.name}</p>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{doc.floor} · {doc.room}</span>
                            <span className="text-[10px] text-slate-400 block">{doc.date}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t text-[11px] font-bold">
                          <button onClick={() => alert(`Downloading ${doc.name}`)} className="text-slate-600 hover:text-blue-600 flex items-center gap-1">
                            <FileDown className="w-3.5 h-3.5" /> Download
                          </button>
                          <button onClick={() => setPreviewDoc(doc)} className="text-slate-600 hover:text-blue-600 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= PAGE 6: AI ASSISTANT ================= */}
          {activeTab === 'ai' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl mx-auto flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">AI Inspection Assistant</h2>
                <p className="text-xs text-slate-500">Boutique Bangkok Sukhumvit 5</p>
              </div>

              {/* AI Tabs */}
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
                <button onClick={() => setAiTab('photo')} className={`flex-1 py-2 rounded-lg transition ${aiTab === 'photo' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>
                  Photo Validation
                </button>
                <button onClick={() => setAiTab('voice')} className={`flex-1 py-2 rounded-lg transition ${aiTab === 'voice' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>
                  Voice to Text
                </button>
                <button onClick={() => setAiTab('summary')} className={`flex-1 py-2 rounded-lg transition ${aiTab === 'summary' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>
                  Inspection Summary
                </button>
              </div>

              {/* Tab 1: Photo Validation */}
              {aiTab === 'photo' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <p className="text-xs text-slate-500 text-center">Upload an inspection photo to verify if it is suitable evidence.</p>
                  
                  <label className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 p-8 rounded-xl cursor-pointer flex flex-col items-center justify-center transition">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700">Upload Photo</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG up to 20MB</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {aiValidationResult && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-1 text-emerald-800">
                      <p className="font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-600" /> {aiValidationResult.message}</p>
                      <p className="text-[11px] text-emerald-600">Confidence Score: {aiValidationResult.confidence}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Voice to Text */}
              {aiTab === 'voice' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-center">
                  <p className="text-xs text-slate-500">Record Thai or English voice note for inspection comments.</p>
                  
                  <button 
                    onClick={handleVoiceRecordToggle}
                    className={`p-6 rounded-full mx-auto transition shadow-md flex items-center justify-center ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>

                  <p className="text-xs font-bold text-slate-700">{isRecording ? 'Listening...' : 'Tap to Start Recording'}</p>

                  {voiceText && (
                    <div className="p-4 bg-slate-50 border rounded-xl text-xs text-slate-800 text-left">
                      <p className="font-bold text-slate-500 text-[10px] uppercase mb-1">Transcribed Text:</p>
                      <p className="font-medium">{voiceText}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Inspection Summary */}
              {aiTab === 'summary' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-bold text-slate-800">Automatic AI Inspection Summary</h3>
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
                    <p className="font-black text-sm">Inspection Result: FAILED</p>
                    <p><strong>Room:</strong> 801 (Floor 8)</p>
                    <p><strong>Reason:</strong> Mix Valve not installed in Bathroom sanitary fitting stage.</p>
                    <p><strong>Recommendation:</strong> Resubmit inspection after MEP contractor completes Mix Valve installation.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= PAGE 7: HANDOVER DASHBOARD ================= */}
          {activeTab === 'handover' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Handover Dashboard</h2>
                  <p className="text-xs text-slate-500">Boutique Bangkok Sukhumvit 5 · Area Handover Status</p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>((o)) Live Sync | Last updated: Just now</span>
                </div>
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Ready For Handover</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">75</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-blue-500 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Pending Inspection</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">93</p>
                  </div>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-rose-500 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Failed Rooms</p>
                    <p className="text-3xl font-black text-rose-600 mt-1">6</p>
                  </div>
                  <XCircle className="w-5 h-5 text-rose-500" />
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-slate-400 shadow-sm flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Total Rooms</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">174</p>
                  </div>
                  <Building2 className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              {/* Building Heatmap & Floor Summary Table */}
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Building Heatmap Matrix */}
                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Building Heatmap</h3>
                  
                  <div className="space-y-2 text-xs">
                    {[8,7,6,5,4,3,2,1].map((fl) => (
                      <div key={fl} className="flex items-center gap-3">
                        <span className="w-6 font-bold text-slate-500 text-right">{fl}</span>
                        <div className="flex-1 grid grid-cols-8 gap-1.5">
                          {[1,2,3,4,5,6,7,8].map((rmIdx) => {
                            const isFailed = (fl === 8 && rmIdx === 1) || (fl === 7 && rmIdx === 6) || (fl === 6 && rmIdx === 4);
                            const isPassed = rmIdx % 2 === 0;
                            return (
                              <div 
                                key={rmIdx} 
                                className={`h-6 rounded-md shadow-xs ${isFailed ? 'bg-rose-500' : isPassed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              ></div>
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-slate-400 w-12">{fl === 8 ? '22 rooms' : '27 rooms'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floor Summary Status Table */}
                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Floor Summary</h3>
                  
                  <div className="space-y-2 text-xs">
                    {floorSummaryData.map((f, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{f.floor}</p>
                          <div className="flex gap-2 text-[10px] mt-0.5 font-semibold">
                            <span className="text-emerald-700">Passed: {f.passed}</span>
                            <span className="text-rose-600">Failed: {f.failed}</span>
                            <span className="text-blue-600">Ready: {f.ready}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.status === 'Failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{previewDoc.name}</h3>
                <p className="text-xs text-slate-500">{previewDoc.floor} · {previewDoc.room}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base">✕</button>
            </div>
            
            <div className="bg-slate-100 p-8 rounded-xl text-center space-y-2">
              <FileText className="w-12 h-12 text-blue-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Digital Document Preview</p>
              <p className="text-[10px] text-slate-500">Quality Control Verified Document</p>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}