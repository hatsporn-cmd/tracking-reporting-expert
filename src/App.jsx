import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, LayoutDashboard, Grid, ClipboardCheck, History, FolderKanban, 
  Bot, CheckCircle2, AlertTriangle, Clock, Search, 
  Upload, Mic, FileText, Download, Eye, Languages, 
  Bell, Sparkles, X, FileSpreadsheet,
  Camera, FileDown as FilePdf
} from 'lucide-react';

// --- DICTIONARY FOR BILINGUAL SUPPORT ---
const i18n = {
  th: {
    appName: "T-REX Platform",
    subTitle: "Tracking & Reporting Expert System",
    projectTitle: "Boutique Bangkok Sukhumvit 5",
    siteEngineer: "นายธนโชค ซี. (Site Engineer)",
    nav: {
      dashboard: "แดชบอร์ดสรุปผล",
      floorStatus: "สถานะรายชั้น",
      newInspection: "บันทึกการตรวจงาน",
      inspectionRecords: "ประวัติการตรวจ 13 งาน",
      documentCenter: "ศูนย์เอกสารโครงการ",
      aiAssistant: "AI ผู้ช่วยวิเคราะห์",
      handover: "สถานะการส่งมอบห้องพัก"
    },
    metrics: {
      totalRooms: "ห้องพักทั้งหมด",
      passedRooms: "ผ่านมาตรฐานแล้ว",
      defectsFound: "พบข้อบกพร่อง (Defects)",
      pendingInspection: "รอการตรวจเช็ค"
    },
    dashboard: {
      title: "Dashboard",
      projectSubtitle: "Boutique Bangkok Sukhumvit 5 · Hotel Project",
      liveSync: "ซิงก์ข้อมูลสด | อัปเดตล่าสุด: ตอนนี้",
      totalRooms: "ห้องพักทั้งหมด",
      passed: "ผ่านการตรวจ",
      failed: "ไม่ผ่าน",
      readyForInspection: "รอตรวจ",
      notSubmitted: "ยังไม่ส่งตรวจ",
      floorStatus: "สถานะการตรวจแยกตามชั้น",
      resultSummary: "สรุปผลการตรวจ",
      criticalRooms: "ห้องที่ต้องแก้ไขเร่งด่วน",
      room: "ห้อง",
      legend: { passed: "ผ่าน", failed: "ไม่ผ่าน", ready: "รอตรวจ", pending: "ยังไม่ส่งตรวจ" },
      defects: ["วาล์วน้ำหาย", "ปัญหาระบบประปา", "ฝ้าเพดานชำรุด", "ระบบไฟฟ้าขัดข้อง", "ฝ้าแตกร้าว", "ขอบฉากกั้นอาบน้ำมีช่องว่าง"]
    },
    form: {
      room: "เลือกห้องพัก", task: "รายการตรวจ (13 งาน)", result: "ผลการตรวจ", inspector: "ชื่อผู้ตรวจงาน",
      passed: "ผ่าน", defect: "พบข้อบกพร่อง", inProgress: "รอตรวจ/กำลังแก้ไข",
      roomOption: (room, floor) => `ห้อง ${room} (ชั้น ${floor})`,
      inspectionTitle: "ฟอร์มบันทึกการตรวจงาน", photo: "แนบภาพถ่ายหน้างาน", remarks: "หมายเหตุ / รายละเอียดการตรวจ",
      voice: "บันทึกเสียง", recording: "กำลังบันทึกเสียง...", submit: "บันทึกผลการตรวจ"
    },
    status: {
      ready: "พร้อมส่งมอบ",
      inProgress: "กำลังดำเนินการ",
      defect: "มีข้อบกพร่อง",
      pending: "รอดำเนินการ",
      passed: "ผ่านการตรวจ",
      rejected: "ไม่ผ่าน"
    },
    common: {
      search: "ค้นหาห้องพัก หรือ เอกสาร...",
      floor: "ชั้น",
      room: "ห้อง",
      actions: "การจัดการ",
      details: "ดูรายละเอียด",
      edit: "แก้ไขข้อมูล",
      close: "ปิดหน้าต่าง",
      save: "บันทึกข้อมูล",
      export: "ส่งออกรายงาน",
      filterAll: "ทั้งหมด",
      selectFloor: "เลือกชั้น",
      trade: "หมวดหมู่ช่าง",
      date: "วันที่",
      inspector: "ผู้ตรวจงาน",
      confirm: "ยืนยัน"
    }
  },
  en: {
    appName: "T-REX Platform",
    subTitle: "Tracking & Reporting Expert System",
    projectTitle: "Boutique Bangkok Sukhumvit 5",
    siteEngineer: "Tanachock C. (Site Engineer)",
    nav: {
      dashboard: "Executive Dashboard",
      floorStatus: "Floor Grid Status",
      newInspection: "Room Inspection Form",
      inspectionRecords: "13-Task Timeline",
      documentCenter: "Document Hub",
      aiAssistant: "AI Workbench",
      handover: "Handover Heatmap"
    },
    metrics: {
      totalRooms: "Total Rooms",
      passedRooms: "Passed & Ready",
      defectsFound: "Active Defects",
      pendingInspection: "Pending Inspections"
    },
    dashboard: {
      title: "Dashboard",
      projectSubtitle: "Boutique Bangkok Sukhumvit 5 · Hotel Project",
      liveSync: "Live Sync | Last updated: Just now",
      totalRooms: "Total Rooms",
      passed: "Passed Rooms",
      failed: "Failed Rooms",
      readyForInspection: "Ready for Inspection",
      notSubmitted: "Not Submitted",
      floorStatus: "Inspection Status by Floor",
      resultSummary: "Inspection Result Summary",
      criticalRooms: "Critical Rooms",
      room: "Room",
      legend: { passed: "Passed", failed: "Failed", ready: "Ready for Inspection", pending: "Not Submitted" },
      defects: ["Missing Mix Valve", "Plumbing Issue", "Ceiling Defect", "Electrical Fault", "Ceiling Board Crack", "Shower Screen Gap"]
    },
    form: {
      room: "Select Room", task: "Inspection Item (13 Tasks)", result: "Inspection Result", inspector: "Inspector Name",
      passed: "Passed", defect: "Defect Found", inProgress: "Ready / In Progress",
      roomOption: (room, floor) => `Room ${room} (Floor ${floor})`,
      inspectionTitle: "Room Inspection Form", photo: "Attach Site Photo", remarks: "Remarks / Inspection Details",
      voice: "Voice Note", recording: "Recording...", submit: "Submit Inspection Result"
    },
    status: {
      ready: "Ready for Handover",
      inProgress: "In Progress",
      defect: "Defect Found",
      pending: "Pending",
      passed: "Passed",
      rejected: "Needs Rework"
    },
    common: {
      search: "Search rooms or documents...",
      floor: "Floor",
      room: "Room",
      actions: "Actions",
      details: "View Details",
      edit: "Edit",
      close: "Close",
      save: "Save Changes",
      export: "Export Report",
      filterAll: "All",
      selectFloor: "Select Floor",
      trade: "Trade",
      date: "Date",
      inspector: "Inspector",
      confirm: "Confirm"
    }
  }
};

// 13 Standard Construction Tasks
const TASKS_13 = [
  "Wall Plastering", "Skim Coat", "Screed", "Primer Paint", 
  "Finish Paint 1", "Finish Paint 2", "Bathroom Tiling", "Ceiling Frame", 
  "Ceiling Board", "Main Door", "Bathroom Door", "Shower Screen", "Skirting"
];
const TASKS_13_TH = [
  "ฉาบปูนผนัง", "ฉาบสกิมโค้ต", "ปรับระดับพื้น", "ทาสีรองพื้น", "ทาสีจริงครั้งที่ 1", "ทาสีจริงครั้งที่ 2",
  "ปูกระเบื้องห้องน้ำ", "โครงฝ้าเพดาน", "แผ่นฝ้าเพดาน", "ประตูหลัก", "ประตูห้องน้ำ", "ฉากกั้นอาบน้ำ", "บัวเชิงผนัง"
];

function downloadFile(content, filename, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Generate Initial Sample Data for 8 Floors x 27 Rooms = 216 Rooms
const generateRoomsData = () => {
  const rooms = [];
  const roomTypes = ['Deluxe King', 'Executive Suite', 'Standard Twin', 'Corner Suite'];
  
  for (let floor = 1; floor <= 8; floor++) {
    for (let r = 1; r <= 27; r++) {
      const roomNo = `${floor}${r < 10 ? '0' + r : r}`;
      const type = roomTypes[(floor + r) % roomTypes.length];
      
      // Seed a believable construction sequence: lower floors are further along.
      const completedTasks = Math.max(0, Math.min(13, Math.round(1 + floor * 1.35 + ((r * 7 + floor * 3) % 7) - 3)));
      const notSubmitted = (r + floor * 2) % 6 === 0;
      const tasksStatus = {};
      TASKS_13.forEach((task, idx) => {
        if (notSubmitted) {
          tasksStatus[task] = 'pending';
        } else if (idx < completedTasks) {
          tasksStatus[task] = 'passed';
        } else if (idx === completedTasks) {
          tasksStatus[task] = (floor + r) % 3 === 0 ? 'defect' : 'inProgress';
        } else {
          tasksStatus[task] = 'pending';
        }
      });

      let overallStatus = notSubmitted ? 'pending' : 'inProgress';
      if (!notSubmitted && completedTasks === 13) overallStatus = 'ready';
      else if (Object.values(tasksStatus).includes('defect')) overallStatus = 'defect';

      rooms.push({
        id: roomNo,
        roomNumber: roomNo,
        floor: floor,
        type: type,
        status: overallStatus,
        progress: notSubmitted ? 0 : Math.round((completedTasks / 13) * 100),
        tasks: tasksStatus,
        lastInspector: "นายธนโชค ซี.",
        lastUpdate: "2026-10-25 14:30",
        defectsCount: Object.values(tasksStatus).filter(s => s === 'defect').length
      });
    }
  }
  return rooms;
};

export default function App() {
  const [lang, setLang] = useState('th');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rooms, setRooms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trex-rooms')) || generateRoomsData(); }
    catch { return generateRoomsData(); }
  });
  const [inspectionRecords, setInspectionRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trex-inspections')) || []; }
    catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  
  // Modal States
  const [modalRoom, setModalRoom] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  const t = i18n[lang];

  useEffect(() => { localStorage.setItem('trex-rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('trex-inspections', JSON.stringify(inspectionRecords)); }, [inspectionRecords]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Computations
  const stats = useMemo(() => {
    const total = rooms.length;
    const ready = rooms.filter(r => r.status === 'ready').length;
    const defect = rooms.filter(r => r.status === 'defect').length;
    const inProgress = rooms.filter(r => r.status === 'inProgress').length;
    const pending = rooms.filter(r => r.status === 'pending').length;
    return { total, ready, defect, inProgress, pending };
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = room.roomNumber.toLowerCase().includes(query) || room.type.toLowerCase().includes(query);
      const matchFloor = selectedFloorFilter === 'all' || room.floor.toString() === selectedFloorFilter;
      const matchStatus = selectedStatusFilter === 'all' || room.status === selectedStatusFilter;
      return matchSearch && matchFloor && matchStatus;
    });
  }, [rooms, searchQuery, selectedFloorFilter, selectedStatusFilter]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-2xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#0B132B] flex flex-col border-r border-slate-800 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400 rounded-xl flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-inner">
            🦖
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white">{t.appName}</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.subTitle}</p>
          </div>
        </div>

        {/* Project Context Box */}
        <div className="mx-4 my-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Building2 className="w-4 h-4" />
            <span>{t.projectTitle}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>8 Floors • 216 Rooms</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
            { id: 'floorStatus', icon: Grid, label: t.nav.floorStatus },
            { id: 'newInspection', icon: ClipboardCheck, label: t.nav.newInspection },
            { id: 'inspectionRecords', icon: History, label: t.nav.inspectionRecords },
            { id: 'documentCenter', icon: FolderKanban, label: t.nav.documentCenter },
            { id: 'aiAssistant', icon: Bot, label: t.nav.aiAssistant, badge: 'AI' },
            { id: 'handover', icon: CheckCircle2, label: t.nav.handover }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-400/20 text-emerald-300 font-bold rounded border border-emerald-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 font-bold text-xs">
              TC
            </div>
            <div className="text-left truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{t.siteEngineer}</p>
              <p className="text-[10px] text-emerald-400">Online • Site Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/30 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher Button */}
            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'th' ? 'TH | THAI' : 'EN | ENGLISH'}</span>
            </button>

            {/* Quick Action Notification Button */}
            <button 
              onClick={() => showToast(lang === 'th' ? "การแจ้งเตือนล่าสุด: ตรวจสอบห้อง 412 เรียบร้อย" : "Notification: Room 412 inspected")}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1"></span>
            </button>
          </div>
        </header>

        {/* View Content Renderer */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <DashboardView 
              t={t} 
              stats={stats} 
              rooms={rooms}
              visibleRooms={filteredRooms}
              onInspectRoom={(r) => setModalRoom(r)} 
              setSelectedStatusFilter={setSelectedStatusFilter}
            />
          )}

          {activeTab === 'floorStatus' && (
            <FloorStatusView 
              t={t} 
              rooms={filteredRooms} 
              selectedFloor={selectedFloorFilter} 
              setSelectedFloor={setSelectedFloorFilter}
              onInspectRoom={(r) => setModalRoom(r)} 
            />
          )}

          {activeTab === 'newInspection' && (
            <RoomInspectionFormView t={t} lang={lang} showToast={showToast} rooms={rooms} onSubmitInspection={(record) => {
              const nextRecords = [record, ...inspectionRecords];
              setInspectionRecords(nextRecords);
              setRooms(current => current.map(room => {
                if (room.roomNumber !== record.roomNumber) return room;
                const tasks = { ...room.tasks, [record.task]: record.status };
                const passed = Object.values(tasks).filter(value => value === 'passed').length;
                const defects = Object.values(tasks).filter(value => value === 'defect').length;
                return { ...room, tasks, progress: Math.round(passed / TASKS_13.length * 100), defectsCount: defects,
                  status: defects ? 'defect' : passed === TASKS_13.length ? 'ready' : 'inProgress', lastUpdate: record.date, lastInspector: record.inspector };
              }));
              showToast(`บันทึกผลตรวจห้อง ${record.roomNumber} - ${record.task} สำเร็จ`);
            }} />
          )}

          {activeTab === 'inspectionRecords' && (
            <InspectionRecordsView t={t} rooms={rooms} records={inspectionRecords} onInspectRoom={(r) => setModalRoom(r)} showToast={showToast} />
          )}

          {activeTab === 'documentCenter' && (
            <DocumentCenterView t={t} showToast={showToast} />
          )}

          {activeTab === 'aiAssistant' && (
            <AIAssistantView t={t} showToast={showToast} />
          )}

          {activeTab === 'handover' && (
            <HandoverDashboardView t={t} rooms={rooms} onInspectRoom={(r) => setModalRoom(r)} showToast={showToast} />
          )}
        </main>
      </div>

      {/* --- GLOBAL ROOM INSPECTION MODAL --- */}
      {modalRoom && (
        <RoomDetailModal 
          room={modalRoom} 
          t={t} 
          onClose={() => setModalRoom(null)}
          onSave={(updated) => {
            setRooms(current => current.map(r => r.id === updated.id ? {
              ...updated,
              progress: Math.round(Object.values(updated.tasks).filter(value => value === 'passed').length / TASKS_13.length * 100),
              defectsCount: Object.values(updated.tasks).filter(value => value === 'defect').length,
              lastUpdate: new Date().toLocaleString('th-TH'),
            } : r));
            showToast(lang === 'th' ? `อัปเดตข้อมูลห้อง ${updated.roomNumber} สำเร็จ` : `Room ${updated.roomNumber} updated successfully`);
            setModalRoom(null);
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// MODULE 1: DASHBOARD VIEW
// ==========================================
function DashboardView({ t, stats, rooms, visibleRooms, onInspectRoom, setSelectedStatusFilter }) {
  const [chartMode, setChartMode] = useState('floor');
  const floors = [1, 2, 3, 4, 5, 6, 7, 8];
  const statusCounts = [
    { key: 'defect', label: t.dashboard.legend.failed, value: stats.defect, color: '#ef3340' },
    { key: 'pending', label: t.dashboard.legend.pending, value: stats.pending, color: '#9aa3af' },
    { key: 'ready', label: t.dashboard.legend.passed, value: stats.ready, color: '#32bd83' },
    { key: 'inProgress', label: t.dashboard.legend.ready, value: stats.inProgress, color: '#3f7df5' },
  ];
  const donutTotal = Math.max(1, rooms.length);
  let currentStop = 0;
  const donutGradient = statusCounts.map(item => {
    const start = currentStop;
    currentStop += (item.value / donutTotal) * 100;
    return `${item.color} ${start}% ${currentStop}%`;
  }).join(', ');
  const criticalRooms = rooms.filter(room => room.status === 'defect').slice(0, 6);
  const onStatusSelect = (key) => setSelectedStatusFilter(key === 'ready' ? 'ready' : key);

  return (
    <div className="-m-6 min-h-full space-y-4 bg-[#f3f4f6] p-4 text-slate-800 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="m-0 text-xl font-bold tracking-normal text-slate-800">{t.dashboard.title}</h1><p className="mt-1 text-xs text-slate-500">{t.dashboard.projectSubtitle}</p></div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">● {t.dashboard.liveSync}</span>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: t.dashboard.totalRooms, value: stats.total, filter: 'all', color: '#64748b', icon: Building2 },
          { label: t.dashboard.passed, value: stats.ready, filter: 'ready', color: '#32bd83', icon: CheckCircle2 },
          { label: t.dashboard.failed, value: stats.defect, filter: 'defect', color: '#ef3340', icon: AlertTriangle },
          { label: t.dashboard.readyForInspection, value: stats.inProgress, filter: 'inProgress', color: '#3f7df5', icon: Clock },
          { label: t.dashboard.notSubmitted, value: stats.pending, filter: 'pending', color: '#9aa3af', icon: ClipboardCheck },
        ].map(card => {
          const Icon = card.icon;
          return <button key={card.label} onClick={() => setSelectedStatusFilter(card.filter)} className="flex min-h-20 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderLeft: `3px solid ${card.color}` }}>
            <div><div className="text-[11px] font-medium text-slate-500">{card.label}</div><div className="mt-1 text-2xl font-bold leading-none" style={{ color: card.color }}>{card.value}</div></div><Icon className="h-5 w-5" style={{ color: card.color }} />
          </button>;
        })}
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{t.dashboard.floorStatus}</h2>
          {chartMode === 'floor' ? <>
            <div className="w-full overflow-x-auto"><svg viewBox="0 0 760 190" role="img" aria-label={t.dashboard.floorStatus} className="h-48 min-w-[620px] w-full">
              {[0, 7, 14, 21, 28].map(tick => { const y = 155 - tick * 4.7; return <g key={tick}><line x1="48" x2="748" y1={y} y2={y} stroke="#e6e9ee" strokeDasharray="2 3"/><text x="39" y={y + 4} textAnchor="end" fill="#8791a0" fontSize="10">{tick}</text></g>; })}
              {floors.map((floor, index) => {
                const floorRooms = rooms.filter(room => room.floor === floor);
                const groups = [
                  { status: 'ready', color: '#32bd83' }, { status: 'defect', color: '#ef3340' },
                  { status: 'inProgress', color: '#3f7df5' }, { status: 'pending', color: '#9aa3af' },
                ];
                let yBottom = 155;
                const x = 84 + index * 82;
                return <g key={floor}>
                  {groups.map(group => { const count = floorRooms.filter(room => room.status === group.status).length; const height = count * 4.7; yBottom -= height; return count ? <rect key={group.status} x={x} y={yBottom} width="22" height={height} rx="1" fill={group.color}><title>{`Floor ${floor}: ${count} ${group.status}`}</title></rect> : null; })}
                  <text x={x + 11} y="174" textAnchor="middle" fill="#687386" fontSize="10">F{floor}</text>
                </g>;
              })}
              <line x1="48" x2="748" y1="155" y2="155" stroke="#9aa3af"/>
            </svg></div>
            <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px]">{statusCounts.map(item => <span key={item.key} className="inline-flex items-center gap-1.5 text-slate-500"><i className="h-2 w-2 rounded-sm" style={{ background: item.color }} />{item.label}</span>)}</div>
          </> : <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">{TASKS_13.slice(0, 4).map(task => { const count = rooms.reduce((sum, room) => sum + (room.tasks?.[task] === 'defect' ? 1 : 0), 0); return <div key={task} className="rounded-md border border-slate-200 bg-slate-50 p-3"><div className="text-xs text-slate-500">{task}</div><div className="mt-2 text-lg font-bold text-rose-600">{count} {t.dashboard.failed}</div></div>; })}</div>}
          <div className="mt-3 flex justify-end gap-1"><button onClick={() => setChartMode('floor')} className={`rounded px-3 py-1.5 text-[10px] ${chartMode === 'floor' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Floor Status</button><button onClick={() => setChartMode('trade')} className={`rounded px-3 py-1.5 text-[10px] ${chartMode === 'trade' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Trade Defects</button></div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">{t.dashboard.resultSummary}</h2>
          <div className="my-3 flex justify-center"><div className="grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(${donutGradient})` }}><div className="grid h-16 w-16 place-items-center rounded-full bg-white text-xs font-bold text-slate-600">{stats.total}</div></div></div>
          <div className="space-y-1.5">{statusCounts.map(item => <button key={item.key} onClick={() => onStatusSelect(item.key)} className="flex w-full items-center justify-between gap-2 text-left text-[10px] text-slate-600 hover:text-slate-900"><span className="flex min-w-0 items-center gap-1.5"><i className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} /><span className="truncate">{item.label}</span></span><b className="text-slate-800">{item.value}</b></button>)}</div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><AlertTriangle className="h-4 w-4 text-rose-500" />{t.dashboard.criticalRooms}</h2>
        {criticalRooms.length ? <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">{criticalRooms.map((room, index) => {
          const task = TASKS_13.find(name => room.tasks?.[name] === 'defect');
          return <button key={room.id} onClick={() => onInspectRoom(room)} className="flex items-center gap-2 rounded-md border border-rose-100 bg-rose-50 p-2 text-left transition hover:border-rose-300"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-rose-600 text-[10px] font-bold text-white">{room.roomNumber}</span><span className="min-w-0"><b className="block text-[10px] text-slate-700">{t.dashboard.room} {room.roomNumber}</b><small className="block truncate text-[9px] text-rose-600">{t.dashboard.defects[index % t.dashboard.defects.length]}{task ? ` · ${task}` : ''}</small></span></button>;
        })}</div> : <p className="text-xs text-slate-500">{t.dashboard.failed}: 0</p>}
      </section>

      {/* Preserve the existing quick inspection list below the reference dashboard panels. */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-700">รายชื่อห้องพัก (Room Inspection List)</h3>
          <span className="text-xs text-slate-500">แสดงผล {visibleRooms.length} ห้อง</span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="p-3 pl-4">ห้องพัก</th>
                <th className="p-3">ประเภทห้อง</th>
                <th className="p-3">ชั้น</th>
                <th className="p-3">ความคืบหน้า (13 งาน)</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-right pr-4">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {visibleRooms.slice(0, 15).map(room => (
                <tr key={room.id} className="transition-colors hover:bg-slate-50">
                  <td className="p-3 pl-4 font-bold text-emerald-700">{room.roomNumber}</td>
                  <td className="p-3">{room.type}</td>
                  <td className="p-3">ชั้น {room.floor}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 rounded-full bg-slate-100 h-2">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${room.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-400">{room.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={room.status} t={t} />
                  </td>
                  <td className="p-3 text-right pr-4">
                    <button 
                      onClick={() => onInspectRoom(room)}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>{t.common.details}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 2: FLOOR STATUS VIEW
// ==========================================
function FloorStatusView({ t, rooms, selectedFloor, setSelectedFloor, onInspectRoom }) {
  const floors = [1, 2, 3, 4, 5, 6, 7, 8];

  const currentFloorRooms = useMemo(() => {
    if (selectedFloor === 'all') return rooms;
    return rooms.filter(r => r.floor.toString() === selectedFloor);
  }, [rooms, selectedFloor]);

  return (
    <div className="space-y-6">
      {/* Floor Filter Controls */}
      <div className="flex items-center justify-between bg-slate-800/70 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="font-bold text-base text-slate-100">ผังแสดงสถานะห้องพักรายชั้น (Floor Grid Selector)</h2>
          <p className="text-xs text-slate-400">คลิกที่ห้องพักเพื่อตรวจเช็คสถานะละเอียด</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedFloor('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedFloor === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {t.common.filterAll}
          </button>
          {floors.map(f => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedFloor === f.toString() ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              ชั้น {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {currentFloorRooms.map(room => (
          <div
            key={room.id}
            onClick={() => onInspectRoom(room)}
            className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-105 flex flex-col justify-between h-24 relative overflow-hidden ${
              room.status === 'ready' 
                ? 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400' 
                : room.status === 'defect'
                ? 'bg-red-950/40 border-red-500/50 hover:border-red-400'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-100">{room.roomNumber}</span>
              {room.status === 'ready' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {room.status === 'defect' && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {room.status === 'inProgress' && <Clock className="w-4 h-4 text-amber-400" />}
            </div>

            <div className="text-[10px] text-slate-400 truncate">{room.type}</div>

            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Progress</span>
                <span className="font-bold text-slate-200">{room.progress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full ${
                    room.status === 'ready' ? 'bg-emerald-500' : room.status === 'defect' ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${room.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// MODULE 3: NEW INSPECTION FORM
// ==========================================
function RoomInspectionFormView({ lang, showToast, rooms, onSubmitInspection }) {
  const labels = i18n[lang].form;
  const taskOptions = lang === 'th' ? TASKS_13_TH : TASKS_13;
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.roomNumber || '101');
  const [taskName, setTaskName] = useState(TASKS_13[0]);
  const [status, setStatus] = useState('passed');
  const [inspectorName, setInspectorName] = useState(rooms[0]?.lastInspector || '');
  const [remarks, setRemarks] = useState('');
  
  // AI Simulation States
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aiScore, setAiScore] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      // Simulate AI analysis
      setTimeout(() => {
        setAiScore({
          quality: "96% High Resolution",
          clarity: "Passed (No blur)",
          defectDetected: false
        });
      }, 600);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRemarks("การทาสี Finish Paint 1 พื้นผิวเรียบเนียน ไม่พบรอยด่างหรือรอยแปรง ตรวจสอบผ่าน");
      showToast("แปลงเสียงเป็นข้อความสำเร็จ (Voice transcribed)");
    }, 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitInspection({ id: crypto.randomUUID(), roomNumber: selectedRoom, task: taskName, status, remarks, date: new Date().toLocaleString(lang === 'th' ? 'th-TH' : 'en-US'), inspector: inspectorName.trim(), photo: photoPreview });
    setRemarks('');
    setPhotoPreview(null);
    setAiScore(null);
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100">{labels.inspectionTitle} (Room Inspection Form)</h2>
        <p className="text-xs text-slate-400">บันทึกผลการตรวจสอบ 13 งาน พร้อมระบบ AI ช่วยวิเคราะห์รูปภาพและบันทึกเสียง</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{labels.room}</label>
            <select 
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.roomNumber}>{labels.roomOption(r.roomNumber, r.floor)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{labels.task}</label>
            <select 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {TASKS_13.map((task, index) => (
                <option key={task} value={task}>{taskOptions[index]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{labels.result}</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="passed">{labels.passed} (Passed)</option>
              <option value="defect">{labels.defect} (Defect)</option>
              <option value="inProgress">{labels.inProgress} (In Progress)</option>
            </select>
          </div>
          <div>
            <label htmlFor="inspector-name" className="mb-1 block text-xs font-medium text-slate-300">{labels.inspector}</label>
            <input id="inspector-name" name="inspectorName" type="text" required value={inspectorName} onChange={event => setInspectorName(event.target.value)} placeholder={labels.inspector} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>

        {/* Photo Upload with AI Scanner */}
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 bg-slate-900/40 text-center">
          <input type="file" accept="image/*" onChange={handlePhotoUpload} id="photo-upload" className="hidden" />
          <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <Camera className="w-8 h-8 text-emerald-400 mb-2" />
            <span className="text-xs font-medium text-slate-200">{labels.photo} (Photo Upload)</span>
            <span className="text-[10px] text-slate-400">รองรับ PNG, JPG พร้อม AI ประเมินคุณภาพภาพ</span>
          </label>

          {photoPreview && (
            <div className="mt-4 flex flex-col md:flex-row items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
              <img src={photoPreview} alt="Preview" className="w-32 h-24 object-cover rounded-md border border-slate-600" />
              {aiScore && (
                <div className="text-left text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Image Quality Score: {aiScore.quality}</span>
                  </div>
                  <p className="text-slate-300">ความคมชัด: {aiScore.clarity}</p>
                  <p className="text-emerald-300">สถานะ: ภาพมีความชัดเจน เหมาะสำหรับแนบในรายงาน</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Note & Remarks */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-300">{labels.remarks}</label>
            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                isRecording ? 'bg-red-600 animate-pulse text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? labels.recording : `${labels.voice} (AI Speech-to-Text)`}</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="กรอกรายละเอียด หรือใช้ปุ่มบันทึกเสียงด้านบน..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
        >
          {labels.submit} (Submit Inspection)
        </button>
      </form>
    </div>
  );
}

// ==========================================
// MODULE 4: 13-TASK INSPECTION RECORDS
// ==========================================
function InspectionRecordsView({ t, rooms, records, onInspectRoom, showToast }) {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '101');
  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="font-bold text-base text-slate-100">ลำดับขั้นตอนการตรวจ 13 งาน (13-Task Inspection Timeline)</h2>
          <p className="text-xs text-slate-400">ตรวจสอบความสมบูรณ์ในแต่ละขั้นตอนของห้องพัก</p>
        </div>

        {/* Room Switcher Dropdown */}
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 px-4 py-2 rounded-lg"
        >
          {rooms.map(r => (
            <option key={r.id} value={r.id}>ห้อง {r.roomNumber} (ชั้น {r.floor})</option>
          ))}
        </select>
      </div>

      {records.length > 0 && <section className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
        <h3 className="mb-3 text-sm font-bold text-emerald-400">บันทึกการตรวจล่าสุด ({records.length})</h3>
        <div className="space-y-2">{records.slice(0, 8).map(record => <div key={record.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/70 p-3 text-xs">
          <span>ห้อง {record.roomNumber} · {record.task} · {record.status}</span><span className="text-slate-400">{record.date}</span>
        </div>)}</div>
      </section>}
      {/* Task Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TASKS_13.map((task, idx) => {
          const status = activeRoom.tasks[task] || 'pending';
          return (
            <div key={task} className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center border border-slate-700">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-xs text-slate-200">{task}</span>
                </div>
                <StatusBadge status={status} t={t} />
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/40 p-2.5 rounded-lg">
                <p>ผู้ตรวจล่าสุด: {activeRoom.lastInspector}</p>
                <p>วันที่: {activeRoom.lastUpdate}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                <button 
                  onClick={() => activeRoom.tasks[task] === 'pending' ? showToast('งานนี้ยังไม่มีหลักฐานภาพ') : onInspectRoom(activeRoom)}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>หลักฐานภาพถ่าย</span>
                </button>
                <button 
                  onClick={() => onInspectRoom(activeRoom)}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px]"
                >
                  เปลี่ยนสถานะ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// MODULE 5: DOCUMENT CENTER
// ==========================================
function DocumentCenterView({ t, showToast }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docs, setDocs] = useState([
    { id: 1, name: "Inspection_Report_Floor_4_Q3.pdf", category: "Inspection Reports", size: "3.4 MB", date: "2026-10-20" },
    { id: 2, name: "Defect_Summary_Boutique_Sukhumvit5.xlsx", category: "Defect Reports", size: "1.2 MB", date: "2026-10-22" },
    { id: 3, name: "RI_Architectural_Specs_V2.pdf", category: "RI Documents", size: "8.9 MB", date: "2026-09-15" },
    { id: 4, name: "Handover_Certificate_Floor_1-2.pdf", category: "Inspection Reports", size: "4.1 MB", date: "2026-10-24" }
  ]);
  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocs(current => [{ id: crypto.randomUUID(), name: file.name, category: 'Uploaded documents', size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, date: new Date().toISOString().slice(0, 10), file }, ...current]);
    showToast(`เพิ่มเอกสาร ${file.name} แล้ว`);
    event.target.value = '';
  };
  const handleDownload = async (doc) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = doc.name; anchor.click(); URL.revokeObjectURL(url);
    } else {
      downloadFile(`${doc.name}\nหมวดหมู่: ${doc.category}\nวันที่: ${doc.date}\n\nไฟล์ตัวอย่างสำหรับสาธิต`, `${doc.name}.txt`);
    }
    showToast(`ดาวน์โหลด ${doc.name} แล้ว`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="font-bold text-base text-slate-100">ศูนย์เอกสารโครงการ (Document Hub)</h2>
          <p className="text-xs text-slate-400">จัดเก็บเอกสารการตรวจรับ งานสถาปัตยกรรม และแบบแปลน</p>
        </div>
        <input id="document-upload" type="file" className="hidden" onChange={handleUpload} />
        <button 
          onClick={() => document.getElementById('document-upload')?.click()}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>อัปโหลดเอกสาร</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {docs.map(doc => (
          <div key={doc.id} className="bg-slate-800/70 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <FileText className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-xs text-slate-200 line-clamp-2">{doc.name}</h4>
                <span className="text-[10px] text-slate-400">{doc.category}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>{doc.size}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedDoc(doc)}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDownload(doc)}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="font-bold text-sm text-slate-100">{selectedDoc.name}</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-48 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 text-slate-500 text-xs">
              [ PDF / Excel Preview Viewer Placeholder ]
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                {t.common.close}
              </button>
              <button 
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
              >
                {t.common.export}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODULE 6: AI WORKBENCH ASSISTANT
// ==========================================
function AIAssistantView({ showToast }) {
  const [aiReport, setAiReport] = useState(null);

  const generateReport = () => {
    showToast("AI กำลังประมวลผลสรุปรายงานโครงการ...");
    setTimeout(() => {
      setAiReport({
        summary: "จากการวิเคราะห์ข้อมูล 216 ห้อง พบว่าความก้าวหน้าโดยรวมอยู่ที่ 74% โดยงาน Finishing Paint และ Tiling บนชั้น 4-5 อยู่ในเกณฑ์สมบูรณ์สูง แนะนำให้เพิ่มอัตรากำลังช่างประตูกระจกเพื่อเร่งรัดการส่งมอบชั้น 7-8",
        topDefect: "งานทาสี Finish Paint 1 (พบรอยด่าง 18 จุด)",
        handoverForecast: "คาดว่าจะพร้อมส่งมอบทั้งโครงการภายในวันที่ 15 พฤศจิกายน 2026"
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-800 p-6 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-400/40">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-100">AI Executive Workbench</h2>
            <p className="text-xs text-slate-400">เครื่องมือวิเคราะห์อัจฉริยะ ตรวจจับ Defect อัตโนมัติและสรุปรายงานบริหาร</p>
          </div>
        </div>
        <button 
          onClick={generateReport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          <span>สร้างรายงานสรุป AI (Generate Insights)</span>
        </button>
      </div>

      {aiReport && (
        <div className="bg-slate-800/90 border border-emerald-500/50 rounded-xl p-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>ผลการวิเคราะห์ภาพรวมบริหาร (AI Summary Output)</span>
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-700">
            {aiReport.summary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
              <span className="text-red-400 font-bold block mb-1">จุดต้องแก้ไขด่วน (Top Defect Trade):</span>
              <span className="text-slate-200">{aiReport.topDefect}</span>
            </div>
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
              <span className="text-emerald-400 font-bold block mb-1">ประมาณการวันส่งมอบ (Forecast):</span>
              <span className="text-slate-200">{aiReport.handoverForecast}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODULE 7: HANDOVER HEATMAP DASHBOARD
// ==========================================
function HandoverDashboardView({ rooms, onInspectRoom, showToast }) {
  const exportCsv = () => {
    const rows = [['Room', 'Floor', 'Type', 'Status', 'Progress', 'Defects'], ...rooms.map(room => [room.roomNumber, room.floor, room.type, room.status, `${room.progress}%`, room.defectsCount])];
    downloadFile(`\uFEFF${rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')}`, 'trex-handover-report.csv', 'text/csv;charset=utf-8');
    showToast('ดาวน์โหลดรายงาน Excel (CSV) แล้ว');
  };
  const printReport = () => { window.print(); };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="font-bold text-base text-slate-100">แผนผังสถานะการส่งมอบ (Building Handover Heatmap)</h2>
          <p className="text-xs text-slate-400">ภาพรวม 8 ชั้น x 27 ห้องพัก (สีเขียว = พร้อมส่งมอบ / สีแดง = พบ Defect)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={printReport}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <FilePdf className="w-4 h-4 text-red-400" />
            <span>PDF Export</span>
          </button>
          <button 
            onClick={exportCsv}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-slate-800/70 border border-slate-700 p-6 rounded-xl space-y-4">
        {[8, 7, 6, 5, 4, 3, 2, 1].map(floor => (
          <div key={floor} className="flex items-center gap-3">
            <span className="w-14 text-xs font-bold text-slate-300">ชั้น {floor}</span>
            <div className="flex-1 grid grid-cols-[repeat(27,minmax(0,1fr))] gap-1">
              {rooms.filter(r => r.floor === floor).map(room => (
                <div
                  key={room.id}
                  onClick={() => onInspectRoom(room)}
                  title={`ห้อง ${room.roomNumber}: ${room.status}`}
                  className={`h-7 rounded cursor-pointer transition-all hover:scale-125 flex items-center justify-center text-[9px] font-bold ${
                    room.status === 'ready' 
                      ? 'bg-emerald-500 text-slate-950' 
                      : room.status === 'defect' 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
              {room.roomNumber.slice(-2)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// STATUS BADGE UTILITY COMPONENT
// ==========================================
function StatusBadge({ status, t }) {
  if (status === 'ready' || status === 'passed') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        {t.status.ready}
      </span>
    );
  }
  if (status === 'defect') {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
        {t.status.defect}
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
      {t.status.inProgress}
    </span>
  );
}

// ==========================================
// ROOM DETAIL INSPECTION MODAL
// ==========================================
function RoomDetailModal({ room, t, onClose, onSave }) {
  const [currentStatus, setCurrentStatus] = useState(room.status);
  const [tasks, setTasks] = useState({ ...room.tasks });

  const toggleTask = (task) => {
    const nextStatus = tasks[task] === 'passed' ? 'defect' : 'passed';
    setTasks({ ...tasks, [task]: nextStatus });
  };

  const handleSave = () => {
    onSave({
      ...room,
      status: currentStatus,
      tasks: tasks
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>รายละเอียดห้องพัก {room.roomNumber}</span>
              <span className="text-xs font-normal text-slate-400">({room.type})</span>
            </h3>
            <p className="text-xs text-slate-400">ชั้น {room.floor} • ผู้ตรวจล่าสุด: {room.lastInspector}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-700/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Overall Status */}
        <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-700">
          <span className="text-xs font-medium text-slate-300">สถานะหลักของห้อง (Overall Room Status):</span>
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none"
          >
            <option value="ready">พร้อมส่งมอบ (Ready)</option>
            <option value="inProgress">กำลังดำเนินการ (In Progress)</option>
            <option value="defect">พบข้อบกพร่อง (Defect)</option>
          </select>
        </div>

        {/* 13 Tasks Checklist Toggles */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 mb-2">สถานะงาน 13 รายการ (13-Task Inspection Checklist)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TASKS_13.map(tName => {
              const isPassed = tasks[tName] === 'passed';
              return (
                <div 
                  key={tName}
                  onClick={() => toggleTask(tName)}
                  className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    isPassed 
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  <span className="font-medium">{tName}</span>
                  <span className="font-bold">{isPassed ? "PASSED" : "DEFECT"}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold"
          >
            {t.common.close}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
          >
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
