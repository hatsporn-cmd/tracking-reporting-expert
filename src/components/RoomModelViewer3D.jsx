import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { INSPECTION_TASKS, taskStatusColor } from '../data/inspectionTasks.js';
import { loadThree } from './threeLoader.js';

const materialColors = { 'room-line': '#64748b', 'wall-plaster': '#cbd5e1', 'wall-skim': '#e2e8f0', 'floor-level': '#94a3b8', 'paint-primer': '#dbeafe', 'paint-finish': '#f8fafc', 'bath-tile': '#94a3b8', 'ceiling-frame': '#475569', 'ceiling-board': '#f1f5f9', 'entry-door': '#8b5e3c', 'bath-door': '#a16207', 'shower-screen': '#7dd3fc', 'wood-skirting': '#a16207', 'bath-fixtures': '#f8fafc', 'floor-check': '#f59e0b', 'wood-floor': '#b77946' };

export default function RoomModelViewer3D({ room, taskStates = {}, language = 'TH', compact = false }) {
  const canvasHost = useRef(null); const modelRef = useRef(null);
  const languageRef = useRef(language);
  const [selectedPartState, setSelectedPartState] = useState({ room: null, partId: null }); const selectedPart = selectedPartState.room === room ? selectedPartState.partId : null; const setSelectedPart = React.useCallback(partId => setSelectedPartState({ room, partId }), [room]); const [mode, setMode] = useState('status'); const [viewerState, setViewerState] = useState('loading'); const [tooltip, setTooltip] = useState(null);
  useEffect(() => { languageRef.current = language; }, [language]);
  const text = language === 'TH';
  useEffect(() => {
    let disposed = false; let frame = 0; let renderer; let controls; let scene; let camera; let resizeObserver;
    const cleanups = [];
    loadThree().then(({ THREE, OrbitControls }) => {
      if (disposed || !canvasHost.current) return;
      const host = canvasHost.current; scene = new THREE.Scene(); scene.background = new THREE.Color('#e7edf3');
      camera = new THREE.PerspectiveCamera(43, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 100);
      camera.position.set(9, 7.2, 9.5);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.setSize(host.clientWidth, host.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.domElement.style.touchAction = 'none'; host.appendChild(renderer.domElement);
      controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 1, 0); controls.minDistance = 4.5; controls.maxDistance = 24; controls.screenSpacePanning = true;
      scene.add(new THREE.HemisphereLight(0xffffff, 0x9ca3af, 2.0)); const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(8, 14, 10); scene.add(key); const fill = new THREE.DirectionalLight(0x93c5fd, 1.25); fill.position.set(-8, 7, -9); scene.add(fill);
      const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.18, 6.4), new THREE.MeshStandardMaterial({ color: 0xd8ccb8, roughness: 0.84 })); floor.position.y = -0.08; scene.add(floor);
      const groups = new Map(); const clickable = [];
      const definitions = {
        'room-line': [[0, 0, 0, 8.08, 0.035, 6.48]],
        'wall-plaster': [[-3.94, 1.35, 0, 0.12, 2.7, 6.15]],
        'wall-skim': [[0, 1.35, -3.12, 7.9, 2.7, 0.12]],
        'floor-level': [[0, 0.035, 0.55, 4.9, 0.035, 4.5]],
        'paint-primer': [[-3.86, 1.52, -1.55, 0.045, 1.7, 2.8]],
        'paint-finish': [[-3.83, 1.52, 1.1, 0.045, 1.7, 2.5]],
        'bath-tile': [[2.45, 0.035, -1.95, 2.5, 0.045, 2.05]],
        'ceiling-frame': [[-1.7, 2.63, -2.5, 4.4, 0.08, 0.08], [-1.7, 2.63, -1.2, 4.4, 0.08, 0.08], [-1.7, 2.63, 0.1, 4.4, 0.08, 0.08], [-1.7, 2.63, 1.4, 4.4, 0.08, 0.08]],
        'ceiling-board': [[-1.65, 2.78, -1.45, 4.45, 0.08, 3.2]],
        'entry-door': [[1.45, 1.04, 3.12, 1.05, 2.05, 0.09]],
        'bath-door': [[1.05, 1.0, -0.6, 0.09, 2.0, 0.85]],
        'shower-screen': [[3.48, 1.03, -2.05, 0.055, 2.02, 1.7]],
        'wood-skirting': [[0, 0.12, 3.04, 7.7, 0.16, 0.08], [-3.88, 0.12, 0, 0.08, 0.16, 6.0]],
        'bath-fixtures': [[2.55, 0.4, -2.45, 0.65, 0.7, 0.6], [3.2, 0.68, -0.95, 0.6, 0.15, 0.48]],
        'floor-check': [[-1.05, 0.065, 0.65, 1.3, 0.025, 1.45]],
        'wood-floor': [[-0.55, 0.045, 1.55, 5.75, 0.055, 2.8]],
      };
      INSPECTION_TASKS.forEach(task => {
        const group = new THREE.Group(); group.userData.partId = task.partId; groups.set(task.partId, group); scene.add(group);
        for (const [x, y, z, width, height, depth] of definitions[task.partId] || []) {
          const glass = task.partId === 'shower-screen';
          const geometry = new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshStandardMaterial({ color: materialColors[task.partId], roughness: glass ? 0.18 : 0.62, metalness: glass ? 0.08 : 0.02, transparent: glass || task.partId.includes('paint-'), opacity: glass ? 0.42 : task.partId.includes('paint-') ? 0.82 : 1, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.userData.partId = task.partId; group.add(mesh); clickable.push(mesh);
          const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.35 })); edge.name = 'edgeLine'; mesh.add(edge);
        }
      });
      const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let downPoint;
      const rayHit = event => { const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(clickable, false)[0]; };
      const down = event => { downPoint = [event.clientX, event.clientY]; };
      const up = event => { if (!downPoint || Math.hypot(event.clientX - downPoint[0], event.clientY - downPoint[1]) > 5) return; const hit = rayHit(event); setSelectedPart(hit?.object.userData.partId || null); };
      const move = event => { const hit = rayHit(event); if (!hit) { setTooltip(null); return; } const rect = renderer.domElement.getBoundingClientRect(); const task = INSPECTION_TASKS.find(item => item.partId === hit.object.userData.partId); setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, label: languageRef.current === 'TH' ? task?.th : task?.en }); };
      renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointerup', up); renderer.domElement.addEventListener('pointermove', move); cleanups.push(() => { renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('pointermove', move); });
      const resize = () => { if (!host.clientWidth || !host.clientHeight) return; camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); }; resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
      modelRef.current = { camera, controls, scene, groups, renderer, defaultPosition: new THREE.Vector3(9, 7.2, 9.5), defaultTarget: new THREE.Vector3(0, 1, 0) }; setViewerState('ready');
      const animate = () => { if (disposed) return; frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
    }).catch(() => { if (!disposed) setViewerState('fallback'); });
    return () => { disposed = true; cancelAnimationFrame(frame); resizeObserver?.disconnect(); cleanups.forEach(cleanup => cleanup()); controls?.dispose(); if (scene) scene.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose()); }); renderer?.dispose(); renderer?.domElement.remove(); modelRef.current = null; };
  }, [room, setSelectedPart]);

  useEffect(() => { const model = modelRef.current; if (!model) return; INSPECTION_TASKS.forEach(task => { const group = model.groups.get(task.partId); if (!group) return; const color = taskStatusColor(taskStates[task.th] || taskStates[task.en] || ''); group.traverse(object => { if (!object.isMesh) return; if (mode === 'realistic') { object.material.color.set(materialColors[task.partId]); object.material.emissive.setHex(selectedPart === task.partId ? 0x1d4ed8 : 0x000000); object.material.emissiveIntensity = selectedPart === task.partId ? 0.26 : 0; } else { object.material.color.set(color); object.material.emissive.set(color); object.material.emissiveIntensity = selectedPart === task.partId ? 0.36 : 0.06; } }); }); model.scene.traverse(object => { if (object.name === 'edgeLine') object.visible = mode === 'status'; }); }, [taskStates, mode, selectedPart, viewerState]);

  const resetView = () => { const model = modelRef.current; if (!model) return; model.camera.position.copy(model.defaultPosition); model.controls.target.copy(model.defaultTarget); model.controls.update(); setSelectedPart(null); };
  const selectedTask = INSPECTION_TASKS.find(task => task.partId === selectedPart);
  return <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${compact ? '' : 'shadow-sm'}`}><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2"><div className="min-w-0"><b className="block text-xs text-slate-800">{text ? 'แบบจำลองห้อง 3 มิติ' : '3D Cutaway Room'}</b><span className="text-[10px] text-slate-500">Room {room} · {text ? 'แตะส่วนอาคารเพื่อเลือก' : 'Select a mapped part'}</span></div><div className="flex flex-wrap gap-1"><button type="button" aria-pressed={mode === 'status'} onClick={() => setMode('status')} className={`rounded-lg border px-2 py-1.5 text-[10px] ${mode === 'status' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-500'}`}>{text ? 'สีตามสถานะ' : 'Status colors'}</button><button type="button" aria-pressed={mode === 'realistic'} onClick={() => setMode('realistic')} className={`rounded-lg border px-2 py-1.5 text-[10px] ${mode === 'realistic' ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-500'}`}>{text ? 'วัสดุจริง' : 'Materials'}</button><button type="button" onClick={resetView} title={text ? 'รีเซ็ตมุมมอง' : 'Reset camera'} className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-600"><RotateCcw size={14}/></button></div></div>
    <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(250px,.9fr)]"><div ref={canvasHost} className="relative h-[280px] touch-none bg-slate-100 sm:h-[360px]">{viewerState === 'loading' && <div className="absolute inset-0 z-10 grid place-items-center text-xs text-slate-500">{text ? 'กำลังโหลดโมเดล…' : 'Loading model…'}</div>}{viewerState === 'fallback' && <div className="absolute inset-0 z-10 grid place-items-center bg-gradient-to-br from-slate-100 to-slate-300 p-5"><div className="relative h-44 w-56 -skew-y-6 rounded-lg border-2 border-slate-500 bg-white/80 shadow-2xl"><div className="absolute inset-x-4 top-4 h-14 border border-slate-400 bg-sky-100"/><div className="absolute bottom-4 left-4 h-14 w-20 border border-slate-400 bg-amber-100"/><div className="absolute bottom-4 right-4 h-14 w-16 border border-slate-400 bg-cyan-100"/><span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-600">{text ? 'อินเทอร์เน็ตไม่พร้อม · ใช้รายการงานได้' : '3D library unavailable · use task list'}</span></div></div>}{tooltip && viewerState === 'ready' && <span className="pointer-events-none absolute z-10 rounded-lg bg-slate-900 px-2 py-1 text-[10px] text-white" style={{ left: Math.min(tooltip.x + 10, 170), top: Math.max(tooltip.y - 4, 4) }}>{tooltip.label}</span>}{selectedTask && <div className="absolute bottom-2 left-2 z-10 flex max-w-[95%] items-center gap-2 rounded-xl bg-slate-900/95 px-3 py-2 text-[10px] text-white shadow-lg"><span className="truncate">{text ? selectedTask.th : selectedTask.en}</span><b className="shrink-0 rounded-full px-2 py-0.5" style={{ backgroundColor: taskStatusColor(taskStates[selectedTask.th] || taskStates[selectedTask.en] || '') }}>{taskStates[selectedTask.th] || taskStates[selectedTask.en] || (text ? 'ยังไม่เริ่ม' : 'Not started')}</b></div>}</div>
      <div className="max-h-[360px] overflow-y-auto border-t border-slate-100 p-2 md:border-l md:border-t-0"><div className="mb-2 flex items-center justify-between px-1"><b className="text-[10px] uppercase tracking-wide text-slate-500">{text ? 'รายการตรวจ 16 รายการ' : '16 inspection tasks'}</b><span className="text-[9px] text-slate-400">{selectedTask ? (text ? selectedTask.th : selectedTask.en) : ''}</span></div><div className="space-y-1">{INSPECTION_TASKS.map((task, index) => { const status = taskStates[task.th] || taskStates[task.en] || ''; const color = taskStatusColor(status); return <button type="button" key={task.partId} onClick={() => setSelectedPart(selectedPart === task.partId ? null : task.partId)} className={`flex w-full items-start gap-2 rounded-lg border p-2 text-left transition ${selectedPart === task.partId ? 'border-sky-400 bg-sky-50' : 'border-transparent hover:bg-slate-50'}`}><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[9px] font-bold text-white" style={{ backgroundColor: color }}>{status === 'Pass' || status === 'Completed' || status === 'ตรวจแล้ว' ? <CheckCircle2 size={12}/> : <span>{index + 1}</span>}</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-medium leading-4 text-slate-700">{text ? task.th : task.en}</span><span className="block text-[9px]" style={{ color }}>{status || (text ? 'ยังไม่เริ่ม' : 'Not started')}</span></span></button>; })}</div></div></div>
    <div className="flex flex-wrap gap-3 border-t border-slate-100 px-3 py-2 text-[9px] text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500"/>{text ? 'ตรวจแล้ว' : 'Inspected'}</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-500"/>{text ? 'กำลังดำเนินการ' : 'In progress'}</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-400"/>{text ? 'ยังไม่เริ่ม' : 'Not started'}</span></div>
  </div>;
}
