import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Bell, Building2, CalendarDays,
  Camera, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  ClipboardCheck, Clock3, Download, Eye, File, FileCheck2, FilePlus2, FileText,
  Filter, FolderOpen, Grid2X2, History, Home, Layers3, LogOut, MapPin, Menu,
  MoreHorizontal, Pencil, Plus, Printer, Search, Send, ShieldCheck, Trash2,
  Upload, UserRound, Users, X,
} from 'lucide-react';

const STORE = 'trex-site-prototype-v1';
const PROJECTS = [
  { id: 'PJ00888', name: 'T-REX HOUSE', location: 'กรุงเทพมหานคร · Bangkok', rooms: 144, floors: 8, featured: true },
  { id: 'PJ00440', name: 'Chapter Charoenkrung - Riverside', location: 'เจริญกรุง · Bangkok', rooms: 216, floors: 12 },
  { id: 'PJ00442', name: 'Siam Pan Pacific Hotel', location: 'สาทร · Bangkok', rooms: 186, floors: 10 },
  { id: 'PJ00446', name: 'Plum Condo Ladprao', location: 'ลาดพร้าว · Bangkok', rooms: 320, floors: 8 },
];
const WORK_TYPES = ['งานก่ออิฐ-ฉาบ', 'งานกันซึม', 'งานปูกระเบื้อง', 'งานฝ้าเพดาน', 'งานทาสี', 'งานประตู-หน้าต่าง', 'งานสุขภัณฑ์', 'งานเก็บรายละเอียด'];
const CHECKLIST = ['แนวผนังและระดับ', 'ผิวฉาบและมุม', 'รอยแตกร้าว', 'ความเรียบร้อยของพื้นที่'];
const ROOM_IDS = Array.from({ length: 18 }, (_, i) => `${Math.floor(i / 9) + 1}${String((i % 9) + 1).padStart(2, '0')}`);
const STATUS = {
  Pass: { label: 'Pass', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Fail: { label: 'Fail', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  Scheduled: { label: 'Scheduled', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  'Partially Inspected': { label: 'Partially Inspected', color: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  Completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};
const todayIso = () => new Date().toISOString().slice(0, 10);
const shiftDate = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const uid = () => globalThis.crypto?.randomUUID?.() || `trex-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const readStore = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; } };
const seedRequests = () => [
  { id: 'rq-4401', projectId: 'PJ00888', requestNo: 'RI-00888-041', rootId: 'ROOT-041', stage: WORK_TYPES[0], title: 'ตรวจผนังห้องพักก่อนปิดผิว', appointment: shiftDate(0), time: '09:00', coordinator: 'Phattarawadee Sroiphap', rooms: ['101', '102', '103'], status: 'Partially Inspected', attachmentNames: ['Floor-01-Architectural.pdf'], createdAt: new Date().toISOString() },
  { id: 'rq-4402', projectId: 'PJ00888', requestNo: 'RI-00888-042', rootId: 'ROOT-042', stage: WORK_TYPES[1], title: 'ตรวจทดสอบกันซึมห้องน้ำ', appointment: shiftDate(1), time: '10:30', coordinator: 'Phattarawadee Sroiphap', rooms: ['104', '105'], status: 'Scheduled', attachmentNames: ['Waterproofing-Method.pdf'], createdAt: new Date().toISOString() },
  { id: 'rq-4403', projectId: 'PJ00888', requestNo: 'RI-00888-039', rootId: 'ROOT-039', stage: WORK_TYPES[2], title: 'ตรวจงานปูกระเบื้องตัวอย่าง', appointment: shiftDate(-2), time: '13:00', coordinator: 'Site Engineer', rooms: ['106', '107', '108', '109'], status: 'Completed', attachmentNames: [], createdAt: new Date().toISOString() },
  { id: 'rq-00440-1', projectId: 'PJ00440', requestNo: 'RI-00440-018', rootId: 'ROOT-018', stage: WORK_TYPES[3], title: 'ตรวจโครงคร่าวฝ้าเพดาน', appointment: shiftDate(2), time: '09:30', coordinator: 'Site Engineer', rooms: ['201', '202'], status: 'Scheduled', attachmentNames: [], createdAt: new Date().toISOString() },
  { id: 'rq-00442-1', projectId: 'PJ00442', requestNo: 'RI-00442-022', rootId: 'ROOT-022', stage: WORK_TYPES[4], title: 'ตรวจสีรองพื้นและผิวงาน', appointment: shiftDate(1), time: '14:00', coordinator: 'Site Engineer', rooms: ['301', '302', '303'], status: 'Scheduled', attachmentNames: [], createdAt: new Date().toISOString() },
  { id: 'rq-00446-1', projectId: 'PJ00446', requestNo: 'RI-00446-009', rootId: 'ROOT-009', stage: WORK_TYPES[5], title: 'ตรวจวงกบประตูและหน้าต่าง', appointment: shiftDate(3), time: '10:00', coordinator: 'Site Engineer', rooms: ['401', '402'], status: 'Scheduled', attachmentNames: [], createdAt: new Date().toISOString() },
];
const seedEvents = () => [
  { id: 'ev-01', projectId: 'PJ00888', requestId: 'rq-4401', requestNo: 'RI-00888-041', room: '101', stage: WORK_TYPES[0], date: shiftDate(0), recorder: 'Phattarawadee Sroiphap', result: 'Pass', checklist: Object.fromEntries(CHECKLIST.map(x => [x, 'Pass'])), defect: '', location: '', note: 'ผิวงานเรียบร้อย ตรวจระดับซ้ำแล้ว', evidence: [], cmConfirmed: true },
  { id: 'ev-02', projectId: 'PJ00888', requestId: 'rq-4401', requestNo: 'RI-00888-041', room: '102', stage: WORK_TYPES[0], date: shiftDate(0), recorder: 'Phattarawadee Sroiphap', result: 'Fail', checklist: { [CHECKLIST[0]]: 'Pass', [CHECKLIST[1]]: 'Fail', [CHECKLIST[2]]: 'Fail', [CHECKLIST[3]]: 'Pass' }, defect: 'ผิวฉาบบริเวณมุมผนังเป็นคลื่น', location: 'มุมผนังด้านหน้าห้อง', note: 'แก้ไขก่อนนัดตรวจซ้ำ', evidence: [], cmConfirmed: false },
  { id: 'ev-03', projectId: 'PJ00888', requestId: 'rq-4403', requestNo: 'RI-00888-039', room: '106', stage: WORK_TYPES[2], date: shiftDate(-2), recorder: 'Site Engineer', result: 'Pass', checklist: Object.fromEntries(CHECKLIST.map(x => [x, 'Pass'])), defect: '', location: '', note: '', evidence: [], cmConfirmed: true },
  { id: 'ev-04', projectId: 'PJ00888', requestId: 'rq-4403', requestNo: 'RI-00888-039', room: '107', stage: WORK_TYPES[2], date: shiftDate(-2), recorder: 'Site Engineer', result: 'Pass', checklist: Object.fromEntries(CHECKLIST.map(x => [x, 'Pass'])), defect: '', location: '', note: '', evidence: [], cmConfirmed: true },
];
const seedDocs = () => [
  { id: 'doc-01', projectId: 'PJ00888', name: 'Architectural_Floor_01.pdf', type: 'Drawing', requestNo: 'RI-00888-041', building: 'Building A', floor: '1', room: '101', round: 'Round 1', date: shiftDate(0), size: '2.4 MB', uploadedBy: 'Phattarawadee Sroiphap' },
  { id: 'doc-02', projectId: 'PJ00888', name: 'Waterproofing_Method.pdf', type: 'Request / RI', requestNo: 'RI-00888-042', building: 'Building A', floor: '1', room: '104', round: 'Round 1', date: shiftDate(1), size: '1.8 MB', uploadedBy: 'Site Engineer' },
  { id: 'doc-03', projectId: 'PJ00888', name: 'Room_102_Inspection_Note.pdf', type: 'Inspection Report', requestNo: 'RI-00888-041', building: 'Building A', floor: '1', room: '102', round: 'Round 1', date: shiftDate(0), size: '640 KB', uploadedBy: 'Phattarawadee Sroiphap' },
  { id: 'doc-04', projectId: 'PJ00440', name: 'Ceiling_Shop_Drawing.pdf', type: 'Drawing', requestNo: 'RI-00440-018', building: 'Building A', floor: '2', room: '201', round: 'Round 1', date: shiftDate(2), size: '3.1 MB', uploadedBy: 'Site Engineer' },
  { id: 'doc-05', projectId: 'PJ00442', name: 'Paint_Inspection_Checklist.xlsx', type: 'Checklist', requestNo: 'RI-00442-022', building: 'Building B', floor: '3', room: '301', round: 'Round 2', date: shiftDate(1), size: '520 KB', uploadedBy: 'Site Engineer' },
];
const initialData = () => {
  const saved = readStore();
  return {
    user: saved.user || null,
    currentProject: saved.currentProject || 'PJ00888',
    requests: saved.requests || seedRequests(), events: saved.events || seedEvents(),
    docs: saved.docs || seedDocs(), packs: saved.packs || [], drafts: saved.drafts || [],
    notifications: saved.notifications || [
      { id: 'n1', title: 'นัดตรวจ RI-00888-041 วันนี้ 09:00', detail: 'งานก่ออิฐ-ฉาบ · 3 ห้อง', read: false },
      { id: 'n2', title: 'Room 102 พบ Defect', detail: 'ผิวฉาบบริเวณมุมผนังเป็นคลื่น', read: false },
    ],
  };
};

function saveDownload(filename, content, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvEscape(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
function Badge({ children, color = 'slate' }) {
  const colors = { slate: 'bg-slate-100 text-slate-600', green: 'bg-lime-100 text-lime-800', sky: 'bg-sky-100 text-sky-700', rose: 'bg-rose-100 text-rose-700', amber: 'bg-amber-100 text-amber-700' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors[color] || colors.slate}`}>{children}</span>;
}
function ResultBadge({ status }) { const item = STATUS[status] || STATUS.Pending; return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.color}`}><i className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />{item.label}</span>; }
function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = { primary: 'bg-lime-500 text-emerald-950 hover:bg-lime-400 shadow-sm', secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50', ghost: 'text-slate-600 hover:bg-slate-100', danger: 'bg-rose-600 text-white hover:bg-rose-500', dark: 'bg-emerald-950 text-white hover:bg-emerald-900' };
  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}
function Field({ label, children, className = '' }) { return <label className={`block space-y-1.5 ${className}`}><span className="text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-100';
function Modal({ title, onClose, children, size = 'max-w-2xl' }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-emerald-950/40 p-3 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}><section role="dialog" aria-modal="true" className={`max-h-[94vh] w-full ${size} overflow-hidden rounded-2xl bg-white shadow-2xl`}><header className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="min-w-0"><h2 className="truncate text-base font-bold text-slate-900">{title}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={18}/></button></header><div className="max-h-[calc(94vh-64px)] overflow-y-auto p-5">{children}</div></section></div>; }
function Empty({ text }) { return <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center text-sm text-slate-400">{text}</div>; }

export default function App() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(() => readStore().user ? 'overview' : 'login');
  const [activeNav, setActiveNav] = useState('overview');
  const [loginName, setLoginName] = useState(''); const [loginPassword, setLoginPassword] = useState('');
  const [projectChoice, setProjectChoice] = useState(() => readStore().currentProject || 'PJ00888');
  const [openMenu, setOpenMenu] = useState(''); const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(''); const [modal, setModal] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1); const [selectedRoom, setSelectedRoom] = useState('101');
  const [requestFilter, setRequestFilter] = useState('All Status'); const [requestSearch, setRequestSearch] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [inspectionView, setInspectionView] = useState('My Inspection');
  const [summarySearch, setSummarySearch] = useState(''); const [docSearch, setDocSearch] = useState('');
  const [docFilters, setDocFilters] = useState({ building: 'All', floor: 'All', room: 'All', round: 'All' });
  const [cameraState, setCameraState] = useState('');
  const videoRef = useRef(null); const streamRef = useRef(null); const toastTimer = useRef(null);
  const project = PROJECTS.find(p => p.id === data.currentProject) || PROJECTS[0];
  const canEdit = data.user?.role === 'Site Engineer';
  const projectRequests = useMemo(() => data.requests.filter(r => r.projectId === project.id), [data.requests, project.id]);
  const projectEvents = useMemo(() => data.events.filter(e => e.projectId === project.id), [data.events, project.id]);
  const projectDocs = useMemo(() => data.docs.filter(d => d.projectId === project.id), [data.docs, project.id]);

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { showToast('Storage is full. Remove some large attachments.'); } }, [data]);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop()); }, []);
  const showToast = message => { setToast(message); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3000); };
  const requireEdit = () => { if (canEdit) return true; showToast('VV / Viewer is read-only. Editing is unavailable.'); return false; };
  const updateData = updater => setData(current => typeof updater === 'function' ? updater(current) : { ...current, ...updater });
  const changeProject = id => { updateData(current => ({ ...current, currentProject: id })); setProjectChoice(id); setSelectedFloor(1); setSelectedRoom('101'); setOpenMenu(''); };
  const login = e => {
    e.preventDefault(); if (!loginName.trim() || !loginPassword.trim()) { showToast('Enter your username and password to continue.'); return; }
    const key = loginName.trim().toLowerCase();
    const user = key === 'vv test' ? { name: 'VV Test', role: 'VV / Viewer', email: 'vv.test@trex.example' }
      : key === 'se test' ? { name: 'SE Test', role: 'Site Engineer', email: 'se.test@trex.example' }
        : { name: loginName.trim() || 'Phattarawadee Sroiphap', role: 'Site Engineer', email: loginName.includes('@') ? loginName.trim() : 'phattarawadee@trex.example' };
    updateData(current => ({ ...current, user })); setPage('sites');
  };
  const logout = () => { updateData(current => ({ ...current, user: null })); setLoginPassword(''); setPage('login'); setActiveNav('overview'); setOpenMenu(''); };
  const go = nav => { setActiveNav(nav); setPage(nav); setSidebarOpen(false); setOpenMenu(''); };
  const navItems = [
    { id: 'overview', label: 'Project Overview', thai: 'ภาพรวมโครงการ', icon: Home },
    { id: 'requests', label: 'Request & Schedule', thai: 'คำขอและตารางนัดตรวจ', icon: CalendarDays },
    { id: 'inspections', label: 'Inspections', thai: 'การตรวจงาน', icon: ClipboardCheck },
    { id: 'documents', label: 'Document', thai: 'เอกสาร', icon: FolderOpen },
  ];
  const floors = Array.from({ length: Math.min(project.floors, 12) }, (_, i) => i + 1);
  const eventsForRoom = room => projectEvents.filter(e => String(e.room) === String(room));
  const roomStatus = room => { const records = eventsForRoom(room); if (records.some(e => e.result === 'Fail')) return 'Fail'; if (records.some(e => e.result === 'Pass')) return 'Pass'; if (projectRequests.some(r => r.rooms.includes(String(room)))) return 'Scheduled'; return 'Pending'; };
  const overviewStats = useMemo(() => {
    const passed = projectEvents.filter(e => e.result === 'Pass').length;
    const failed = projectEvents.filter(e => e.result === 'Fail').length;
    return { total: project.rooms, passed: Math.min(project.rooms, Math.round(project.rooms * 0.41) + passed), defects: Math.max(6, failed + 5), scheduled: projectRequests.filter(r => r.status === 'Scheduled' || r.status === 'Partially Inspected').reduce((sum, r) => sum + r.rooms.length, 0) };
  }, [project.rooms, projectEvents, projectRequests]);

  if (page === 'login') return <LoginScreen name={loginName} setName={setLoginName} password={loginPassword} setPassword={setLoginPassword} onSubmit={login} toast={toast}/>;
  if (page === 'sites') return <SitesScreen user={data.user} choice={projectChoice} setChoice={setProjectChoice} onNext={() => { changeProject(projectChoice); setPage('overview'); setActiveNav('overview'); }} onLogout={logout}/>;

  return <div className="min-h-screen bg-[#F7F8F7] text-slate-800">
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] -translate-x-full flex-col bg-[#0B1A12] px-4 py-5 text-white transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="flex items-center gap-3 px-2"><div className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400 text-emerald-950"><Building2 size={22}/></div><div><b className="block text-[15px] tracking-wide">T-REX</b><span className="text-[10px] text-emerald-100/65">TRACKING & REPORT EXPERT</span></div><button className="ml-auto rounded-md p-1 lg:hidden" onClick={() => setSidebarOpen(false)}><X size={19}/></button></div>
        <div className="mt-8 px-2 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-100/45">Project workspace</div>
        <nav className="mt-3 space-y-1">{navItems.map(item => { const Icon = item.icon; const active = page === item.id; return <button key={item.id} onClick={() => go(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? 'bg-lime-400 text-emerald-950 shadow-md shadow-lime-950/20' : 'text-emerald-50/75 hover:bg-white/8 hover:text-white'}`}><Icon size={18}/><span>{item.label}<span className={`mt-0.5 block text-[10px] font-medium ${active ? 'text-emerald-900/75' : 'text-emerald-100/45'}`}>{item.thai}</span></span></button>; })}</nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.04] p-3"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-lime-300"/><span className="text-xs font-semibold">{canEdit ? 'Full access' : 'Read only'}</span></div><p className="mt-1 text-[10px] leading-4 text-emerald-100/60">{canEdit ? 'Site Engineer permissions enabled' : 'Viewer can view and download only'}</p></div>
      </aside>
      {sidebarOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)}/>}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button>
          <div className="relative"><button onClick={() => setOpenMenu(openMenu === 'project' ? '' : 'project')} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-slate-50"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Building2 size={18}/></span><span className="hidden sm:block"><b className="block max-w-[260px] truncate text-sm">{project.name}</b><span className="text-[10px] font-medium text-slate-400">{project.id} · Active Project</span></span><ChevronDown size={16} className="text-slate-400"/></button>{openMenu === 'project' && <div className="absolute left-0 top-12 z-30 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">{PROJECTS.map(p => <button key={p.id} onClick={() => changeProject(p.id)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"><span><b className="block text-xs">{p.name}</b><small className="text-[10px] text-slate-400">{p.id}</small></span>{project.id === p.id && <Check size={15} className="text-emerald-600"/>}</button>)}</div>}</div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4"><div className="relative"><button onClick={() => { setOpenMenu(openMenu === 'notifications' ? '' : 'notifications'); updateData(c => ({ ...c, notifications: c.notifications.map(n => ({ ...n, read: true })) })); }} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"><Bell size={19}/>{data.notifications.some(n => !n.read) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"/>}</button>{openMenu === 'notifications' && <div className="absolute right-0 top-12 z-30 w-[min(340px,90vw)] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl"><b className="px-2 text-xs">Notifications</b>{data.notifications.map(n => <div key={n.id} className="mt-2 rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold">{n.title}</p><p className="mt-1 text-[10px] text-slate-500">{n.detail}</p></div>)}</div>}</div>
            <div className="relative"><button onClick={() => setOpenMenu(openMenu === 'profile' ? '' : 'profile')} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-50"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-950 text-xs font-bold text-lime-300">{data.user?.name?.split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'PS'}</span><span className="hidden text-left md:block"><b className="block max-w-[155px] truncate text-xs">{data.user?.name}</b><small className="text-[10px] text-slate-400">{data.user?.role}</small></span><ChevronDown size={14} className="hidden text-slate-400 sm:block"/></button>{openMenu === 'profile' && <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl"><b className="block text-sm">{data.user?.name}</b><p className="mt-1 text-xs text-slate-500">{data.user?.role}</p><p className="mt-1 break-all text-[10px] text-slate-400">{data.user?.email}</p><hr className="my-3 border-slate-100"/><Button variant="secondary" className="w-full" onClick={logout}><LogOut size={15}/>Log Out</Button></div>}</div>
          </div>
        </header>
        <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {page === 'overview' && <Overview project={project} floors={floors} selectedFloor={selectedFloor} setSelectedFloor={setSelectedFloor} selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} events={projectEvents} requests={projectRequests} roomStatus={roomStatus} eventsForRoom={eventsForRoom} stats={overviewStats}/>}
          {page === 'requests' && <RequestSchedule project={project} requests={projectRequests} filter={requestFilter} setFilter={setRequestFilter} search={requestSearch} setSearch={setRequestSearch} month={calendarMonth} setMonth={setCalendarMonth} canEdit={canEdit} onCreate={() => { if (requireEdit()) setModal({ type: 'request' }); }} onOpen={r => setModal({ type: 'request-detail', request: r })} onReschedule={r => { if (requireEdit()) setModal({ type: 'request', request: r }); }} onToast={showToast}/>}
          {page === 'inspections' && <InspectionsPage project={project} requests={projectRequests} events={projectEvents} view={inspectionView} setView={setInspectionView} canEdit={canEdit} drafts={data.drafts.filter(d => d.projectId === project.id)} onInspect={(request, event) => { if (!requireEdit()) return; setModal({ type: 'inspection', request, event }); }} onView={event => setModal({ type: 'event-detail', event })} onDeleteDraft={id => updateData(c => ({ ...c, drafts: c.drafts.filter(d => d.id !== id) }))}/>}
          {page === 'documents' && <DocumentsPage project={project} events={projectEvents} requests={projectRequests} docs={projectDocs} packs={data.packs.filter(p => p.projectId === project.id)} canEdit={canEdit} search={docSearch} setSearch={setDocSearch} filters={docFilters} setFilters={setDocFilters} onUpload={() => { if (requireEdit()) setModal({ type: 'document' }); }} onEdit={doc => { if (requireEdit()) setModal({ type: 'document', doc }); }} onDelete={doc => { if (requireEdit()) setModal({ type: 'delete-doc', doc }); }} onView={doc => setModal({ type: 'document-detail', doc })} onPacks={packs => updateData(c => ({ ...c, packs: [...packs, ...c.packs.filter(p => p.projectId !== project.id)] }))} summarySearch={summarySearch} setSummarySearch={setSummarySearch} onToast={showToast}/>}
        </div>
      </main>
    </div>
    {modal && <AppModal modal={modal} project={project} floors={floors} requests={projectRequests} events={projectEvents} docs={projectDocs} canEdit={canEdit} user={data.user} updateData={updateData} onClose={() => { setModal(null); stopCamera(); }} onToast={showToast} onCamera={startCamera} onStopCamera={stopCamera} onCapture={capturePhoto} videoRef={videoRef} cameraState={cameraState} setCameraState={setCameraState}/>}
    {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-xl bg-emerald-950 px-4 py-3 text-xs font-semibold text-white shadow-xl">{toast}</div>}
  </div>;

  async function startCamera() {
    if (!requireEdit()) return;
    setCameraState('requesting');
    if (!navigator.mediaDevices?.getUserMedia) { setCameraState('unavailable'); showToast('Camera unavailable. Choose image files instead.'); return; }
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); streamRef.current = stream; setCameraState('active'); setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 40); }
    catch { setCameraState('unavailable'); showToast('Camera permission unavailable. Choose image files instead.'); }
  }
  function stopCamera() { if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; setCameraState(''); }
  function capturePhoto() { const video = videoRef.current; if (!video || !video.videoWidth) { showToast('Camera is not ready.'); return; } const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d')?.drawImage(video, 0, 0); const photo = { id: uid(), name: `site-photo-${Date.now()}.jpg`, type: 'image/jpeg', dataUrl: canvas.toDataURL('image/jpeg', .85) }; window.dispatchEvent(new CustomEvent('trex-add-photo', { detail: photo })); showToast('Photo attached to inspection.'); }
}

function LoginScreen({ name, setName, password, setPassword, onSubmit, toast }) {
  return <div className="grid min-h-screen bg-[#f3f6f3] lg:grid-cols-[1.1fr_.9fr]">
    <section className="relative hidden overflow-hidden bg-[#0B1A12] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 -top-20 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl"/><div className="relative flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-400 text-emerald-950"><Building2/></span><div><b className="text-xl tracking-wide">T-REX</b><p className="text-xs text-emerald-100/60">TRACKING & REPORT EXPERT SYSTEM</p></div></div><div className="relative max-w-xl"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-lime-300">Construction quality, clearly tracked</p><h1 className="text-5xl font-semibold leading-tight">Every room.<br/>Every inspection.<br/><span className="text-lime-300">One clear record.</span></h1><p className="mt-6 max-w-md text-sm leading-6 text-emerald-50/65">ติดตามคำขอตรวจ งานตรวจ และเอกสารคุณภาพก่อสร้างจากทุกไซต์ในพื้นที่ทำงานเดียว</p></div><div className="relative flex items-center justify-between text-xs text-emerald-50/40"><span>© 2026 T-REX Platform</span><span>Inspection tracking for your team</span></div></section>
    <section className="flex items-center justify-center p-5 sm:p-10"><form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-9"><div className="mb-8 lg:hidden"><span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-lime-400 text-emerald-950"><Building2/></span><b className="text-lg">T-REX</b></div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Welcome back</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Sign in to your workspace</h2><p className="mt-2 text-sm text-slate-500">เข้าสู่ระบบเพื่อติดตามงานตรวจของโครงการ</p><Field label="Email / Username" className="mt-7"><input autoComplete="username" className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="SE Test or VV Test"/></Field><Field label="Password" className="mt-4"><input type="password" autoComplete="current-password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter any password for prototype"/></Field><Button type="submit" className="mt-6 w-full">Sign in <ArrowRight size={16}/></Button><div className="mt-5 rounded-xl bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-900"><b>Prototype accounts</b><br/>SE Test · full permissions &nbsp; | &nbsp; VV Test · view / download only</div>{toast && <p role="status" className="mt-4 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{toast}</p>}</form></section>
  </div>;
}

function SitesScreen({ user, choice, setChoice, onNext, onLogout }) {
  return <div className="min-h-screen bg-[#F7F8F7]"><header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-10"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-950 text-lime-300"><Building2/></span><div><b>T-REX</b><small className="ml-2 hidden text-slate-400 sm:inline">Select a project</small></div></div><button onClick={onLogout} className="text-xs font-semibold text-slate-500 hover:text-rose-600">Log out</button></header><main className="mx-auto max-w-5xl px-4 py-10 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Workspace access</p><h1 className="mt-2 text-3xl font-bold text-slate-900">ไซต์ของคุณ <span className="text-lg font-medium text-slate-400">/ Your Sites</span></h1><p className="mt-2 text-sm text-slate-500">Choose a project to open its inspection workspace.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{PROJECTS.map((project, i) => <button key={project.id} onClick={() => setChoice(project.id)} className={`rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${choice === project.id ? 'border-lime-500 ring-2 ring-lime-100' : 'border-slate-200'}`}><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${i === 0 ? 'bg-lime-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}><Building2 size={20}/></span>{choice === project.id && <span className="rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">SELECTED</span>}</div><p className="mt-5 text-xs font-bold tracking-widest text-emerald-700">{project.id}</p><h2 className="mt-1 text-base font-bold text-slate-900">{project.name}</h2><p className="mt-2 text-xs text-slate-500">{project.location}</p><p className="mt-4 text-[11px] text-slate-400">{project.rooms} rooms · {project.floors} floors {project.featured && '· Featured'}</p></button>)}</div><div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-950 p-5 text-white"><div><b className="text-sm">Signed in as {user?.name}</b><p className="mt-1 text-xs text-emerald-100/60">{user?.role} · {user?.email}</p></div><Button onClick={onNext}>NEXT <ArrowRight size={16}/></Button></div></main></div>;
}
