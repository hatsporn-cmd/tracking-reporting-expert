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

  // --- MOCK DATA ---
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
      setVoiceText('Recording audio...');
      setTimeout(() => {
        setVoiceText('พบข้อบกพร่องงานท่อน้ำบริเวณห้อง 801 วาล์วผสมยังไม่ได้ทำการติดตั้ง');
        setIsRecording(false);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const isFormComplete = formFloor && formRoom && formCategory && formDate && formInspector;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800 flex">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between flex-shrink-0 min-h-screen select-none">
        <div>
          <div className="p-4 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center border border-slate-700 shadow-md flex-shrink-0">
              <img src={logoImg} alt="T-TEX Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-wide">T-TEX Platform</h1>
              <p className="text-[10px] text-slate-400">Tracking & Reporting</p>
            </div>
          </div>

          <div className="p-3 mx-3 my-4 bg-[#1C2541] rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Project</p>
            <p className="text-xs font-bold text-white mt-0.5 truncate">Boutique BKK Sukhumvit 5</p>
          </div>

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
                  {isActive && !tab.isMain && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

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

      {/* ---------------- MAIN CONTAINER ---------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
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
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm">SP</div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Dashboard</h2>
                  <p className="text-xs text-slate-500">Boutique Bangkok Sukhumvit 5 · Tracking & Reporting Expert System</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Sync | Last updated: Just now</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-slate-400 shadow-sm"><p className="text-xs text-slate-500">Total Rooms</p><p className="text-3xl font-black text-slate-800 mt-1">174</p></div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm"><p className="text-xs text-slate-500">Passed Rooms</p><p className="text-3xl font-black text-emerald-600 mt-1">75</p></div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-rose-500 shadow-sm"><p className="text-xs text-slate-500">Failed Rooms</p><p className="text-3xl font-black text-rose-600 mt-1">6</p></div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-blue-500 shadow-sm"><p className="text-xs text-slate-500">Ready For Inspection</p><p className="text-3xl font-black text-blue-600 mt-1">44</p></div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-slate-400 shadow-sm"><p className="text-xs text-slate-500">Not Submitted</p><p className="text-3xl font-black text-slate-700 mt-1">49</p></div>
              </div>
            </div>
          )}

          {/* 2. FLOOR STATUS */}
          {activeTab === 'floors' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900">Floor Status</h2>
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 bg-white rounded-xl border p-3 space-y-1">
                  <div className="p-2 text-xs font-bold text-slate-400 uppercase">Select Floor</div>
                  {['1','2','3','4','5','6','7','8'].map(f => (
                    <button key={f} onClick={() => setSelectedFloor(f)} className={`w-full p-2.5 text-left rounded text-xs font-bold ${selectedFloor === f ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'}`}>Floor {f}</button>
                  ))}
                </div>
                <div className="lg:col-span-9 bg-white p-5 rounded-xl border shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800">Floor {selectedFloor} (22 rooms)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {roomsFloor8.map(r => {
                      let bg = 'bg-slate-200 text-slate-700';
                      if (r.status === 'Failed') bg = 'bg-rose-500 text-white';
                      if (r.status === 'Ready') bg = 'bg-blue-500 text-white';
                      if (r.status === 'Passed') bg = 'bg-emerald-500 text-white';
                      return (
                        <div key={r.id} onClick={() => { setSelectedRecordRoom(r.id); setActiveTab('records'); }} className={`p-3 rounded-xl border shadow-xs cursor-pointer hover:scale-105 transition ${bg}`}>
                          <span className="font-black text-base">{r.id}</span>
                          <span className="text-[10px] block opacity-90">{r.type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. ROOM INSPECTIONS (SUBMIT) */}
          {activeTab === 'inspections' && (
            <div className="space-y-6 max-w-3xl mx-auto bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Submit Inspection</h2>
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div><label className="font-bold">Floor *</label><select value={formFloor} onChange={e => setFormFloor(e.target.value)} className="w-full border rounded p-2.5 mt-1 bg-slate-50"><option value="">Select...</option>{[1,2,3,4,5,6,7,8].map(f=><option key={f} value={f}>Floor {f}</option>)}</select></div>
                <div><label className="font-bold">Room Number *</label><select value={formRoom} onChange={e => setFormRoom(e.target.value)} className="w-full border rounded p-2.5 mt-1 bg-slate-50"><option value="">Select...</option>{['801','802','803'].map(r=><option key={r} value={r}>Room {r}</option>)}</select></div>
                <div><label className="font-bold">Inspection Category *</label><select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full border rounded p-2.5 mt-1 bg-slate-50"><option value="">Select...</option><option value="Architecture">Architecture</option></select></div>
                <div><label className="font-bold">Inspection Date *</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full border rounded p-2.5 mt-1 bg-slate-50" /></div>
              </div>
              <label className="border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 rounded-xl block text-center cursor-pointer hover:bg-blue-50">
                <Camera className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <span className="text-xs font-bold text-blue-600">Add Photos *</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {aiValidationResult && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded font-bold">{aiValidationResult.message}</div>}
              <button disabled={!isFormComplete} className={`w-full py-2.5 rounded text-xs font-bold text-white ${isFormComplete ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}>Submit Inspection</button>
            </div>
          )}

          {/* 4. INSPECTION RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900">Inspection Records</h2>
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold text-lg mb-2">Room {selectedRecordRoom} — Timeline</h3>
                <div className="space-y-2 text-xs">
                  {['Wall Plastering', 'Primer Coat', 'Finish Paint — Coat 1', 'Bathroom Tiling'].map((task, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded border flex justify-between items-center">
                      <span className="font-bold text-slate-800">{task}</span>
                      <span className="text-emerald-600 font-bold">Passed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900">Document Center</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {documentsList.map((doc, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border shadow-xs flex justify-between items-center text-xs">
                    <div><p className="font-bold text-slate-800">{doc.name}</p><p className="text-[10px] text-slate-400">{doc.floor} · {doc.room}</p></div>
                    <button onClick={() => setPreviewDoc(doc)} className="text-blue-600 font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Preview</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. AI ASSISTANT */}
          {activeTab === 'ai' && (
            <div className="space-y-6 max-w-3xl mx-auto bg-white p-6 rounded-xl border shadow-sm text-center">
              <Bot className="w-10 h-10 text-blue-600 mx-auto" />
              <h2 className="text-xl font-bold">AI Inspection Assistant</h2>
              <p className="text-xs text-slate-500">Upload photos or use voice notes for automated checks.</p>
            </div>
          )}

          {/* 7. HANDOVER DASHBOARD */}
          {activeTab === 'handover' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900">Handover Dashboard</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-l-4 border-l-emerald-500 shadow-sm"><p className="text-xs text-slate-500">Ready</p><p className="text-2xl font-black text-emerald-600">75</p></div>
                <div className="bg-white p-4 rounded-xl border border-l-4 border-l-blue-500 shadow-sm"><p className="text-xs text-slate-500">Pending</p><p className="text-2xl font-black text-blue-600">93</p></div>
                <div className="bg-white p-4 rounded-xl border border-l-4 border-l-rose-500 shadow-sm"><p className="text-xs text-slate-500">Failed</p><p className="text-2xl font-black text-rose-600">6</p></div>
                <div className="bg-white p-4 rounded-xl border border-l-4 border-l-slate-400 shadow-sm"><p className="text-xs text-slate-500">Total</p><p className="text-2xl font-black text-slate-800">174</p></div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}