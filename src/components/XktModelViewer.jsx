import React, { useEffect, useId, useState } from 'react';
import { FileUp, RotateCcw, TriangleAlert } from 'lucide-react';

const XEOKIT_URL = 'https://cdn.jsdelivr.net/npm/@xeokit/xeokit-sdk@2.6.114/dist/xeokit-sdk.min.es.js';

export default function XktModelViewer({ projectCode, canEdit, language = 'TH' }) {
  const canvasId = `xkt-canvas-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [file, setFile] = useState(null); const loadKey = `${projectCode}:${file?.name || 'default'}:${file?.lastModified || ''}`; const [loadState, setLoadState] = useState({ key: '', status: 'loading', error: '' }); const status = loadState.key === loadKey ? loadState.status : 'loading'; const error = loadState.key === loadKey ? loadState.error : '';
  const th = language === 'TH';
  useEffect(() => {
    let disposed = false; let viewer; let model; let objectUrl = '';
    const report = (nextStatus, nextError = '') => { if (!disposed) setLoadState({ key: loadKey, status: nextStatus, error: nextError }); };
    const setup = async () => {
      try {
        const sdk = await import(/* @vite-ignore */ XEOKIT_URL);
        if (disposed) return;
        viewer = new sdk.Viewer({ canvasId, transparent: true, dtxEnabled: true });
        const loader = new sdk.XKTLoaderPlugin(viewer);
        const src = file ? (objectUrl = URL.createObjectURL(file)) : `/models/${encodeURIComponent(projectCode)}.xkt`;
        model = loader.load({ id: `trex-${projectCode}`, src, edges: true, saoEnabled: true });
        model.on('loaded', () => report('ready'));
        model.on('error', event => report('error', event?.error || (file ? 'Could not read this XKT model.' : `No default model found at /models/${projectCode}.xkt.`)));
      } catch (loadError) { report('error', loadError?.message || 'The xeokit viewer could not be loaded.'); }
    };
    setup();
    return () => { disposed = true; try { model?.destroy?.(); viewer?.destroy?.(); } catch { /* Viewer may already be disposed by the SDK. */ } if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [canvasId, projectCode, file, loadKey]);

  return <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0b1220] text-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-3 py-2"><div><b className="text-xs">XKT / BIM Model</b><p className="text-[10px] text-slate-400">{file?.name || `/models/${projectCode}.xkt`}</p></div><div className="flex gap-2">{canEdit ? <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-3 text-[10px] font-semibold hover:bg-sky-500"><FileUp size={13}/>{th ? 'เลือกไฟล์ XKT' : 'Upload XKT'}<input type="file" accept=".xkt,application/octet-stream" className="hidden" onChange={event => { const next = event.target.files?.[0]; if (next) setFile(next); event.target.value = ''; }}/></label> : <span className="self-center text-[10px] text-slate-400">{th ? 'Guest ดูโมเดลได้เท่านั้น' : 'Guest model view only'}</span>}<button type="button" onClick={() => setFile(null)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-600 px-2.5 text-[10px] hover:bg-slate-800"><RotateCcw size={12}/>{th ? 'โมเดลโครงการ' : 'Project model'}</button></div></div><div className="relative h-[390px] bg-gradient-to-b from-sky-950 to-slate-950"><canvas id={canvasId} className="absolute inset-0 h-full w-full"/>{status === 'loading' && <div className="absolute inset-0 grid place-items-center text-xs text-slate-300">{th ? 'กำลังโหลดโมเดล BIM…' : 'Loading BIM model…'}</div>}{status === 'error' && <div className="absolute inset-0 grid place-items-center p-6 text-center"><div className="max-w-md rounded-xl border border-amber-400/30 bg-slate-900/90 p-4"><TriangleAlert className="mx-auto text-amber-300" size={24}/><p className="mt-2 text-xs font-semibold">{th ? 'ไม่สามารถเปิดไฟล์ XKT ได้' : 'Could not load XKT model'}</p><p className="mt-1 break-words text-[10px] text-slate-300">{error}</p><p className="mt-2 text-[10px] text-slate-400">{th ? 'สำหรับโมเดลเริ่มต้น ให้วางไฟล์ไว้ที่ public/models/' : 'Place a default model file in public/models/.'}</p></div></div>}</div><div className="border-t border-slate-700 px-3 py-2 text-[10px] text-slate-400">{th ? 'ลากเพื่อหมุน · คลิกขวาเพื่อเลื่อน · scroll เพื่อซูม' : 'Drag to orbit · right-drag to pan · scroll to zoom'} · {status === 'ready' ? (th ? 'พร้อมใช้งาน' : 'Ready') : status === 'loading' ? (th ? 'กำลังโหลด' : 'Loading') : (th ? 'โหลดไม่สำเร็จ' : 'Unavailable')}</div></div>;
}
