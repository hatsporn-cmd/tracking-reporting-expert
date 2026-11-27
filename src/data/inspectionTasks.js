export const INSPECTION_TASKS = [
  { th: 'ไลน์ห้องพัก', en: 'Room layout line', partId: 'room-line' },
  { th: 'ฉาบผนัง', en: 'Wall plastering', partId: 'wall-plaster' },
  { th: 'สกิมผนังห้องพัก', en: 'Room wall skim coat', partId: 'wall-skim' },
  { th: 'เทปรับระดับ', en: 'Floor leveling screed', partId: 'floor-level' },
  { th: 'ทาสีรองพื้น', en: 'Primer painting', partId: 'paint-primer' },
  { th: 'ทาสีจริง', en: 'Finish painting', partId: 'paint-finish' },
  { th: 'ปูกระเบื้องห้องน้ำ', en: 'Bathroom tiling', partId: 'bath-tile' },
  { th: 'ติดตั้งโครงฝ้าเพดาน', en: 'Ceiling frame installation', partId: 'ceiling-frame' },
  { th: 'ปิดฝ้าเพดาน', en: 'Ceiling board installation', partId: 'ceiling-board' },
  { th: 'ติดตั้งประตูบานหน้าห้องพร้อมอุปกรณ์', en: 'Install room entry door and hardware', partId: 'entry-door' },
  { th: 'ติดตั้งประตูห้องน้ำพร้อมอุปกรณ์', en: 'Install bathroom door and hardware', partId: 'bath-door' },
  { th: 'ประตูฉากกั้นอาบน้ำพร้อมอุปกรณ์', en: 'Install shower screen and hardware', partId: 'shower-screen' },
  { th: 'ติดตั้งบัวและตัวจบพื้นไม้', en: 'Install wood skirting and floor trim', partId: 'wood-skirting' },
  { th: 'ติดตั้งสุขภัณฑ์ อุปกรณ์เสริมในห้องน้ำ', en: 'Install bathroom fixtures and accessories', partId: 'bath-fixtures' },
  { th: 'ตรวจสอบระดับพื้นก่อนปูไม้', en: 'Check floor level before wood flooring', partId: 'floor-check' },
  { th: 'ปูพื้นไม้', en: 'Install wood flooring', partId: 'wood-floor' },
];

export const CHECKLIST = INSPECTION_TASKS.map(task => task.th);

export function taskStatusColor(status) {
  if (['Pass', 'Completed', 'ตรวจแล้ว', 'เสร็จแล้ว'].includes(status)) return '#22c55e';
  if (['In Progress', 'กำลังดำเนินการ'].includes(status)) return '#eab308';
  if (['Fail', 'Defect', 'ไม่ผ่าน'].includes(status)) return '#ef4444';
  return '#64748b';
}
