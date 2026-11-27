import React, { useEffect, useRef, useState } from 'react';
import { Box, CircleHelp, RotateCcw } from 'lucide-react';
import { loadThree } from './threeLoader.js';

const progressColor = value => value >= 100 ? 0x22c55e : value >= 50 ? 0x38bdf8 : value > 0 ? 0xf59e0b : 0x64748b;

export default function BuildingModelViewer({ floors, selectedFloor, onSelectFloor, language = 'TH' }) {
  const canvasHost = useRef(null); const modelRef = useRef(null);
  const floorsRef = useRef(floors); const onSelectFloorRef = useRef(onSelectFloor);
  const languageRef = useRef(language);
  useEffect(() => { floorsRef.current = floors; onSelectFloorRef.current = onSelectFloor; languageRef.current = language; }, [floors, onSelectFloor, language]);
  const [modelState, setModelState] = useState('loading'); const [tooltip, setTooltip] = useState(null);
  const text = language === 'TH';

  useEffect(() => {
    let disposed = false; let frame = 0; let resizeObserver; let renderer; let controls; let scene; let camera;
    const cleanups = [];
    loadThree().then(({ THREE, OrbitControls }) => {
      if (disposed || !canvasHost.current) return;
      const host = canvasHost.current;
      scene = new THREE.Scene(); scene.background = new THREE.Color('#0b1220');
      camera = new THREE.PerspectiveCamera(42, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 500);
      camera.position.set(37, 26, 38);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.setSize(host.clientWidth, host.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 5.2, 0); controls.minDistance = 9; controls.maxDistance = 85;
      scene.add(new THREE.HemisphereLight(0xe2e8f0, 0x172033, 2.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(18, 34, 22); scene.add(key);
      const fill = new THREE.DirectionalLight(0x7dd3fc, 1.1); fill.position.set(-24, 16, -18); scene.add(fill);
      const grid = new THREE.GridHelper(65, 26, 0x334155, 0x1e293b); grid.position.y = -0.08; scene.add(grid);
      const floorGroups = [];
      const lShape = () => { const shape = new THREE.Shape(); shape.moveTo(-9, 4); shape.lineTo(-9, -8); shape.lineTo(-3.5, -8); shape.lineTo(-3.5, -2); shape.lineTo(9, -2); shape.lineTo(9, 4); shape.closePath(); return shape; };
      const rows = [...floorsRef.current].sort((a, b) => a.floor - b.floor);
      const drawFloorBadge = (canvas, row) => { const ctx = canvas.getContext('2d'); if (!ctx) return; canvas.width = 320; canvas.height = 112; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = 'rgba(2, 6, 23, .92)'; ctx.fillRect(3, 3, 314, 106); ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 4; ctx.strokeRect(3, 3, 314, 106); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e2e8f0'; ctx.font = '600 31px sans-serif'; ctx.fillText(row.common ? (languageRef.current === 'TH' ? 'ส่วนกลาง · 1F' : 'COMMON · 1F') : (languageRef.current === 'TH' ? `ชั้น ${row.floor}` : `${row.floor}F`), 160, 36); ctx.fillStyle = '#a3e635'; ctx.font = '700 43px sans-serif'; ctx.fillText(`${row.percent}%`, 160, 80); };
      rows.forEach((row, index) => {
        const height = 1.18; const baseY = index * height;
        const group = new THREE.Group(); group.position.y = baseY; group.userData.baseY = baseY; group.userData.index = index; group.userData.floor = row.floor;
        const color = progressColor(row.percent); const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.52, metalness: 0.12, emissive: 0x000000, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
        const geo = new THREE.ExtrudeGeometry(lShape(), { depth: 0.34, bevelEnabled: false, curveSegments: 1 }); geo.rotateX(-Math.PI / 2);
        const shell = new THREE.Mesh(geo, mat); shell.position.y = 0.13; shell.userData.floor = row.floor; group.add(shell);
        const badgeCanvas = document.createElement('canvas'); drawFloorBadge(badgeCanvas, row); const badgeTexture = new THREE.CanvasTexture(badgeCanvas); badgeTexture.colorSpace = THREE.SRGBColorSpace;
        const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTexture, transparent: true, depthTest: false, sizeAttenuation: true })); badge.scale.set(4.4, 1.55, 1); badge.position.set(10.5, 0.55, 0); badge.userData.floor = row.floor; badge.renderOrder = 5; group.add(badge);
        const slabGeo = new THREE.ExtrudeGeometry(lShape(), { depth: 0.12, bevelEnabled: false }); slabGeo.rotateX(-Math.PI / 2);
        const slab = new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.72, metalness: 0.04, transparent: true, opacity: 0.66, side: THREE.DoubleSide })); slab.position.y = -0.02; slab.userData.floor = row.floor; group.add(slab);
        if (row.floor === 1) {
          const lobby = new THREE.Mesh(new THREE.BoxGeometry(8, 0.48, 6), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.66 })); lobby.position.set(-4.6, 0.42, 4.1); lobby.userData.floor = row.floor; group.add(lobby);
          for (const [x, z] of [[-8, 3.4], [-5.2, 3.4], [-2.4, 3.4], [-8, 5.6], [-5.2, 5.6], [-2.4, 5.6]]) { const column = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.4, 0.28), new THREE.MeshStandardMaterial({ color: 0xcbd5e1 })); column.position.set(x, 0.72, z); column.userData.floor = row.floor; group.add(column); }
        }
        group.traverse(object => { if (object.isMesh) { const edges = new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry), new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.52 })); edges.name = 'edgeLine'; object.add(edges); } });
        scene.add(group); floorGroups.push({ group, mat, badge, badgeCanvas, row });
      });
      const roofY = rows.length * 1.18;
      const roofGeo = new THREE.ExtrudeGeometry(lShape(), { depth: 0.35, bevelEnabled: false }); roofGeo.rotateX(-Math.PI / 2);
      const roofGroup = new THREE.Group(); roofGroup.position.y = roofY; roofGroup.userData.baseY = roofY; roofGroup.userData.index = rows.length;
      const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7, side: THREE.DoubleSide })); roof.userData.floor = rows.at(-1)?.floor || 1; roofGroup.add(roof);
      for (const [x, z, w, d, h] of [[-5.3, 0.5, 3.6, 3.2, 1.6], [2.4, 0.2, 2.5, 2.6, 1.1]]) { const machine = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.25 })); machine.position.set(x, h / 2 + 0.2, z); machine.userData.floor = rows.at(-1)?.floor || 1; roofGroup.add(machine); }
      roofGroup.traverse(object => { if (object.isMesh) { const edge = new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry), new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.6 })); edge.name = 'edgeLine'; object.add(edge); } }); scene.add(roofGroup);
      const interactiveGroups = [...floorGroups.map(item => item.group), roofGroup];
      const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let pointerDown = null;
      const setPointer = event => { const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(interactiveGroups, true).find(hit => Number.isFinite(hit.object.userData.floor)); };
      const down = event => { pointerDown = [event.clientX, event.clientY]; };
      const up = event => { if (!pointerDown || Math.hypot(event.clientX - pointerDown[0], event.clientY - pointerDown[1]) > 5) return; const hit = setPointer(event); if (hit) { const floor = hit.object.userData.floor; onSelectFloorRef.current(floor); setTooltip(null); } };
      const move = event => { const hit = setPointer(event); if (!hit) { setTooltip(null); renderer.domElement.style.cursor = 'grab'; return; } const row = floorsRef.current.find(item => item.floor === hit.object.userData.floor); if (row) setTooltip({ x: event.clientX - renderer.domElement.getBoundingClientRect().left, y: event.clientY - renderer.domElement.getBoundingClientRect().top, floor: row.floor, percent: row.percent }); renderer.domElement.style.cursor = 'pointer'; };
      renderer.domElement.addEventListener('pointerdown', down); renderer.domElement.addEventListener('pointerup', up); renderer.domElement.addEventListener('pointermove', move);
      cleanups.push(() => { renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('pointermove', move); });
      const resize = () => { if (!host.clientWidth || !host.clientHeight) return; camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); };
      resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
      modelRef.current = { camera, controls, scene, floorGroups, roofGroup, renderer, defaultPosition: new THREE.Vector3(37, 26, 38), defaultTarget: new THREE.Vector3(0, 5.2, 0), drawFloorBadge };
      setModelState('ready');
      const animate = () => { if (disposed) return; frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
    }).catch(() => { if (!disposed) setModelState('fallback'); });
    return () => { disposed = true; cancelAnimationFrame(frame); resizeObserver?.disconnect(); cleanups.forEach(cleanup => cleanup()); controls?.dispose(); if (scene) scene.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose()); }); renderer?.dispose(); renderer?.domElement.remove(); modelRef.current = null; };
  }, [floors.length]);

  useEffect(() => { const model = modelRef.current; if (!model) return; model.floorGroups.forEach((item, index) => { const row = floors[index] || item.row; item.row = row; item.mat.color.setHex(progressColor(row.percent)); item.mat.emissive.setHex(row.floor === selectedFloor ? 0x334155 : 0x000000); item.mat.emissiveIntensity = row.floor === selectedFloor ? 0.4 : 0; model.drawFloorBadge(item.badgeCanvas, row); item.badge.material.map.needsUpdate = true; item.badge.material.color.set(row.floor === selectedFloor ? 0xc8f169 : 0xffffff); }); }, [floors, selectedFloor, modelState, language]);

  const resetView = () => { const model = modelRef.current; if (!model) return; model.camera.position.copy(model.defaultPosition); model.controls.target.copy(model.defaultTarget); model.controls.update(); };
  return <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] text-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-3 py-2"><div className="flex items-center gap-2 text-sm font-semibold"><Box size={16} className="text-sky-300"/>{text ? 'โมเดลอาคาร 3 มิติ' : '3D Building Model'}</div><button type="button" onClick={resetView} className="rounded-lg border border-slate-600 px-3 py-2 text-xs hover:bg-slate-700"><RotateCcw size={13} className="mr-1 inline"/>{text ? 'รีเซ็ตมุมมอง' : 'Reset View'}</button></div>
    <div className="relative h-[470px] sm:h-[560px] xl:h-[620px]" ref={canvasHost}>{modelState === 'loading' && <div className="absolute inset-0 z-10 grid place-items-center bg-[#0b1220] text-sm text-slate-300">{text ? 'กำลังโหลดโมเดล 3D…' : 'Loading 3D model…'}</div>}{modelState === 'fallback' && <div className="absolute inset-0 z-10 grid place-items-center bg-[#0b1220] p-4 text-center text-sm text-slate-300">{text ? 'โหลดโมเดล 3D ไม่สำเร็จ กำลังแสดงตัวเลือกชั้นแทน' : 'The 3D library could not be loaded. Select floors from the controls.'}</div>}{tooltip && modelState === 'ready' && <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-lg border border-slate-600 bg-slate-900/95 px-3 py-2 text-xs shadow-xl"><b>{tooltip.floor === 1 && text ? 'ชั้น 1 · ส่วนกลาง' : text ? `ชั้น ${tooltip.floor}` : tooltip.floor === 1 ? '1F · Common Area' : `Floor ${tooltip.floor}`}</b><div className="mt-0.5 text-lime-300">{tooltip.percent}%</div></div>}{floors.length > 0 && <div className="absolute bottom-3 left-3 z-20 flex max-h-[calc(100%-24px)] flex-col gap-1 overflow-y-auto rounded-xl border border-slate-600/70 bg-slate-950/85 p-1.5 shadow-xl backdrop-blur-sm">{floors.slice().reverse().map(row => <button key={row.floor} type="button" aria-label={`${text ? 'ชั้น' : 'Floor'} ${row.floor}: ${row.percent}%`} onClick={() => onSelectFloor(row.floor)} className={`flex min-w-28 items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-semibold tabular-nums ${selectedFloor === row.floor ? 'bg-emerald-700 text-white ring-1 ring-lime-300' : 'text-slate-200 hover:bg-slate-700'}`}><span>{row.floor === 1 ? (text ? 'ชั้น 1 · ส่วนกลาง' : '1F · Common') : text ? `ชั้น ${row.floor}` : `${row.floor}F`}</span><span className="text-lime-300">{row.percent}%</span></button>)}</div>}</div>
    <div className="flex items-start gap-2 border-t border-slate-700 px-3 py-2 text-[10px] text-slate-400"><CircleHelp size={13} className="mt-0.5 shrink-0"/>{text ? 'ลากเพื่อหมุน · คลิกชั้นเพื่อเปิดผังห้อง · ซูมด้วยล้อเมาส์' : 'Drag to orbit · click a floor to sync the floor plan · scroll to zoom'}</div>
  </div>;
}
