import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import roomPlanImage from './assets/room-plan-reference.jpg';
import { 
  Building2, LayoutDashboard, Grid, ClipboardCheck, History, FolderKanban, 
  Bot, CheckCircle2, AlertTriangle, Clock, Search, 
  Upload, Mic, FileText, Download, Eye, Languages, 
  Bell, Sparkles, X, FileSpreadsheet, Menu, LogOut, RefreshCw,
  Camera, FileDown as FilePdf
} from 'lucide-react';

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxtowV3aBpyIaZb7j6MbVtD-d-7TC0gKCrfz6Le1GSAkP9WRQOEH-0x1UrK_1Ii2Zu1VQ/exec';
const HISTORY_LOG_CACHE_KEY = 'trex_history_log_cache';
const HISTORY_LOG_PENDING_KEY = 'trex_history_log_pending';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const HISTORY_LOG_FIELDS = ['id', 'building', 'floor', 'room', 'trade', 'doc_no', 'doc_type', 'appointment_date', 'status', 'reason', 'file_name', 'file_url', 'folder_path', 'updated_at'];
const BUILDING_A = 'อาคาร A';
const BUILDING_B = 'อาคาร B';
const BUILDING_VALUES = [BUILDING_A, BUILDING_B];
const PROJECT_BUILDING_NAME = BUILDING_A;

function canonicalBuilding(value, floor = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === BUILDING_B.toLowerCase() || normalized === 'building b' || normalized === 'annex' || normalized === 'annex building' || normalized === 'อาคารส่วนต่อขยาย') return BUILDING_B;
  if (normalized === BUILDING_A.toLowerCase() || normalized === 'building a' || normalized === 'main' || normalized === 'main building' || normalized === 'อาคารหลัก' || normalized === 'boutique bangkok sukhumvit 5') return BUILDING_A;
  if (value) return BUILDING_A;
  return Number(floor) >= 5 ? BUILDING_B : BUILDING_A;
}

function canonicalizeRooms(rooms) {
  return rooms.map(room => ({ ...room, building: canonicalBuilding(room.building, room.floor) }));
}

// --- DICTIONARY FOR BILINGUAL SUPPORT ---
const i18n = {
  th: {
    appName: "T-REX Platform",
    subTitle: "Tracking & Reporting Expert System",
    projectTitle: "Boutique Bangkok Sukhumvit 5",
    siteEngineer: "นายธนโชค ซี. (Site Engineer)",
    auth: {
      title: "เข้าสู่ระบบ T-REX", subtitle: "ระบบติดตามและจัดการงานก่อสร้าง", name: "ชื่อผู้ใช้งาน", namePlaceholder: "กรอกชื่อของคุณ",
      role: "เลือกบทบาท", engineer: "วิศวกรประจำไซต์", viewer: "ผู้ชม / บุคคลทั่วไป", login: "เข้าสู่ระบบ", language: "ภาษา",
      engineerAccess: "จัดการการตรวจ เอกสาร สถานะ และรายงานได้", viewerAccess: "ดูแดชบอร์ด ผังชั้น ประวัติ และเอกสารได้เท่านั้น"
    },
    role: { engineer: "วิศวกรประจำไซต์", viewer: "ผู้ชม / บุคคลทั่วไป", logout: "ออกจากระบบ", activeUser: "ผู้ใช้งานปัจจุบัน" },
    sync: { synced: "ซิงก์แล้ว", syncing: "กำลังซิงก์...", offline: "ออฟไลน์ / ใช้ข้อมูลในเครื่อง", refresh: "รีเฟรช / ซิงก์", fileTooLarge: "ไฟล์ต้องมีขนาดไม่เกิน 5 MB", uploadFailed: "ซิงก์ไม่สำเร็จ บันทึกข้อมูลไว้ในเครื่องแล้ว", syncFailed: "เชื่อมต่อ GAS ไม่สำเร็จ กำลังใช้ข้อมูลในเครื่อง", uploadSuccess: "บันทึกข้อมูลลง Google Drive และ HistoryLog แล้ว", lastSync: "ซิงก์ล่าสุด", uploading: "กำลังอัปโหลดและบันทึก...", uploadSuccessLink: "อัปโหลดสำเร็จ เปิดไฟล์ใน Google Drive" },
    documents: {
      title: "ศูนย์เอกสารโครงการ", subtitle: "เลือกตามอาคาร ชั้น ห้อง และหมวดงานเพื่อดูเอกสาร",
      upload: "อัปโหลดเอกสาร", type: "ประเภทเอกสาร", typeGeneral: "เอกสารทั่วไป", typeRI: "Request for Inspection (RI)", typeInspection: "รายงานการตรวจ", typeDefect: "รายงานข้อบกพร่อง",
      scheduledDate: "วันที่นัดตรวจ", reference: "เลขที่เอกสาร", building: "อาคาร", floor: "ชั้น", room: "ห้อง", category: "หมวดงาน", file: "เลือกไฟล์",
      cancel: "ยกเลิก", save: "บันทึกเอกสาร", required: "กรุณากรอกข้อมูลที่จำเป็น", empty: "ไม่พบเอกสารในตำแหน่งนี้",
      chooseBuilding: "เลือกอาคาร", chooseFloor: "เลือกชั้น", chooseRoom: "เลือกห้อง", chooseCategory: "เลือกหมวดงาน",
      architecture: "สถาปัตยกรรม", mep: "ระบบประกอบอาคาร (MEP)", structure: "โครงสร้าง", referenceNumber: "เลขที่อ้างอิง", date: "วันที่เอกสาร", statusLabel: "สถานะ",
      statusPending: "รอตรวจ", statusCompleted: "ตรวจแล้ว", statusExpired: "หมดอายุ", statusArchived: "จัดเก็บแล้ว", markComplete: "ทำเครื่องหมายว่าตรวจแล้ว",
      morningWarning: "แจ้งเตือนรอบเช้า: มีเอกสาร RI ถึงกำหนดและยังไม่ได้ตรวจ", dueToday: "ถึงกำหนดวันนี้", reminderDay: "วันที่ {day} หลังวันนัด",
      expiredTitle: "รายงานเหตุผลที่ไม่ได้เข้าตรวจ", expiredDescription: "เอกสาร RI หมดอายุ กรุณาระบุเหตุผลก่อนจัดเก็บเอกสาร",
      reasonLabel: "เหตุผลที่ไม่ได้เข้าตรวจ", reasonPlaceholder: "อธิบายเหตุผลที่ไม่ได้เข้าตรวจ...", archive: "บันทึกเหตุผลและจัดเก็บ",
      archivedReason: "เหตุผลที่จัดเก็บ", documentPreview: "ตัวอย่างเอกสาร", uploaded: "อัปโหลดเอกสารแล้ว", allLevels: "ทั้งหมด",
      buildingName: "อาคาร A", buildingA: "อาคาร A", buildingB: "อาคาร B", workCategories: ["สถาปัตยกรรม", "ระบบประกอบอาคาร (MEP)", "โครงสร้าง"], openFile: "เปิดไฟล์ใน Google Drive", folderPath: "ตำแหน่งโฟลเดอร์"
    },
    records: {
      title: "ประวัติการตรวจแยกตามหมวดงาน", subtitle: "จัดกลุ่มตามงานตรวจ แล้วแยกตามอาคาร ชั้น และห้อง",
      allCategories: "ทุกหมวดงาน", noRecords: "ยังไม่มีประวัติการตรวจในหมวดงานนี้", building: "อาคาร", floor: "ชั้น", room: "ห้อง",
      inspectionDate: "วันที่ตรวจ", inspector: "ผู้ตรวจ", result: "ผลตรวจ", openRoom: "ดูรายละเอียดห้อง", roomCount: "{count} ห้อง", recordCount: "{count} รายการ", fileLink: "เปิดไฟล์ใน Google Drive", folderPath: "ตำแหน่งโฟลเดอร์"
    },
    nav: {
      dashboard: "แดชบอร์ดสรุปผล",
      floorStatus: "สถานะรายชั้นและการส่งมอบ",
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
      roomOption: (room, floor, building) => `${building} · ห้อง ${room} (ชั้น ${floor})`,
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
    auth: {
      title: "Sign in to T-REX", subtitle: "Construction tracking and management platform", name: "Your name", namePlaceholder: "Enter your name",
      role: "Choose a role", engineer: "Site Engineer", viewer: "Viewer / Guest", login: "Sign in", language: "Language",
      engineerAccess: "Manage inspections, documents, statuses, and reports", viewerAccess: "View dashboard, floor map, records, and documents only"
    },
    role: { engineer: "Site Engineer", viewer: "Viewer / Guest", logout: "Log out", activeUser: "Signed in as" },
    sync: { synced: "Synced", syncing: "Syncing...", offline: "Offline / Local Cache", refresh: "Refresh / Sync", fileTooLarge: "File size must be 5 MB or smaller", uploadFailed: "Sync failed; the record is saved in the local cache.", syncFailed: "Could not connect to GAS. Showing the local cache.", uploadSuccess: "Saved to Google Drive and HistoryLog.", lastSync: "Last synced", uploading: "Uploading and saving...", uploadSuccessLink: "Upload complete. Open in Google Drive" },
    documents: {
      title: "Project Document Hub", subtitle: "Drill down by building, floor, room, and work category",
      upload: "Upload Document", type: "Document Type", typeGeneral: "General Document", typeRI: "Request for Inspection (RI)", typeInspection: "Inspection Report", typeDefect: "Defect Report",
      scheduledDate: "Scheduled Inspection Date", reference: "Document Reference", building: "Building", floor: "Floor", room: "Room", category: "Work Category", file: "Choose File",
      cancel: "Cancel", save: "Save Document", required: "Please complete the required fields", empty: "No documents at this location",
      chooseBuilding: "Choose Building", chooseFloor: "Choose Floor", chooseRoom: "Choose Room", chooseCategory: "Choose Work Category",
      architecture: "Architecture", mep: "MEP", structure: "Structure", referenceNumber: "Reference Number", date: "Document Date", statusLabel: "Status",
      statusPending: "Pending Inspection", statusCompleted: "Completed", statusExpired: "Expired", statusArchived: "Archived", markComplete: "Mark inspected",
      morningWarning: "Morning reminder: RI documents are due and have not been inspected", dueToday: "Due today", reminderDay: "Day {day} after scheduled date",
      expiredTitle: "Non-Inspection Reason Report", expiredDescription: "This RI document has expired. Enter the reason before archiving it.",
      reasonLabel: "Reason for missed inspection", reasonPlaceholder: "Explain why the inspection was missed...", archive: "Save reason and archive",
      archivedReason: "Archive reason", documentPreview: "Document Preview", uploaded: "Document uploaded", allLevels: "All",
      buildingName: "Building A", buildingA: "Building A", buildingB: "Building B", workCategories: ["Architecture", "MEP", "Structure"], openFile: "Open file in Google Drive", folderPath: "Drive folder"
    },
    records: {
      title: "Inspection History by Work Category", subtitle: "Grouped by inspection task, then by building, floor, and room",
      allCategories: "All Categories", noRecords: "No inspection history for this category", building: "Building", floor: "Floor", room: "Room",
      inspectionDate: "Inspection Date", inspector: "Inspector", result: "Result", openRoom: "View Room Details", roomCount: "{count} rooms", recordCount: "{count} records", fileLink: "Open file in Google Drive", folderPath: "Drive folder"
    },
    nav: {
      dashboard: "Executive Dashboard",
      floorStatus: "Floor & Handover Status",
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
      roomOption: (room, floor, building) => `${building} · Room ${room} (Floor ${floor})`,
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

// Localize text nodes and common accessibility/placeholder labels throughout every view.
const bilingualPairs = [
  ["8 Floors • 216 Rooms", "8 ชั้น • 216 ห้อง"], ["Online • Site Active", "ออนไลน์ • กำลังปฏิบัติงาน"],
  ["Room Inspection List", "รายการตรวจห้องพัก"], ["รายชื่อห้องพัก", "Room Inspection List"],
  ["ประเภทห้อง", "Room Type"], ["ความคืบหน้า (13 งาน)", "Progress (13 Tasks)"], ["การจัดการ", "Actions"],
  ["แสดงผล ", "Showing "], [" ห้อง", " rooms"], ["ชั้น ", "Floor "], ["ผังแสดงสถานะห้องพักรายชั้น", "Floor and Handover Status"],
  ["คลิกที่ห้องพักเพื่อตรวจเช็คสถานะละเอียด", "Select a room to inspect its status and details"],
  ["ทั้งหมด", "All"], ["ห้อง ", "Room "], ["ชั้น", "Floor"], ["Progress", "ความคืบหน้า"],
  ["ฟอร์มบันทึกการตรวจงาน", "Room Inspection Form"], ["บันทึกผลการตรวจสอบ 13 งาน พร้อมระบบ AI ช่วยวิเคราะห์รูปภาพและบันทึกเสียง", "Record results for the 13 inspection tasks, with simulated image analysis and voice notes"],
  ["เลือกห้องพัก", "Select Room"], ["รายการตรวจ (13 งาน)", "Inspection Item (13 Tasks)"], ["ผลการตรวจ", "Inspection Result"],
  ["ชื่อผู้ตรวจงาน", "Inspector Name"], ["แนบภาพถ่ายหน้างาน", "Attach Site Photo"], ["รองรับ PNG, JPG พร้อม AI ประเมินคุณภาพภาพ", "PNG and JPG supported. Image quality check is simulated."],
  ["ความคมชัด:", "Clarity:"], ["สถานะ:", "Status:"], ["ภาพมีความชัดเจน เหมาะสำหรับแนบในรายงาน", "Image is clear and suitable for the report"],
  ["หมายเหตุ / รายละเอียดการตรวจ", "Remarks / Inspection Details"], ["บันทึกด้วยเสียง", "Voice Note"], ["กำลังบันทึกเสียง...", "Recording..."],
  ["กรอกรายละเอียด หรือใช้ปุ่มบันทึกเสียงด้านบน...", "Enter details or use the voice note button above..."], ["บันทึกผลการตรวจเช็ค", "Submit Inspection Result"],
  ["ลำดับขั้นตอนการตรวจ 13 งาน", "13-Task Inspection Timeline"], ["ตรวจสอบความสมบูรณ์ในแต่ละขั้นตอนของห้องพัก", "Review completion of each inspection task"],
  ["บันทึกการตรวจล่าสุด", "Recent Inspection Records"], ["ผู้ตรวจล่าสุด:", "Last Inspector:"], ["วันที่:", "Date:"],
  ["งานนี้ยังไม่มีหลักฐานภาพ", "No photo evidence is available for this task"], ["หลักฐานภาพถ่าย", "Photo Evidence"], ["เปลี่ยนสถานะ", "Change Status"],
  ["ศูนย์เอกสารโครงการ", "Project Document Center"], ["จัดเก็บเอกสารการตรวจรับ งานสถาปัตยกรรม และแบบแปลน", "Store inspection, architectural, and plan documents"],
  ["อัปโหลดเอกสาร", "Upload Document"], ["Uploaded documents", "เอกสารที่อัปโหลด"], ["หมวดหมู่:", "Category:"], ["ไฟล์ตัวอย่างสำหรับสาธิต", "Sample file for demonstration"],
  ["เพิ่มเอกสาร ", "Added document "], [" แล้ว", " added"], ["ดาวน์โหลด ", "Downloaded "],
  ["AI กำลังประมวลผลสรุปรายงานโครงการ...", "AI is preparing the project summary..."],
  ["จากการวิเคราะห์ข้อมูล 216 ห้อง พบว่าความก้าวหน้าโดยรวมอยู่ที่ 74% โดยงาน Finishing Paint และ Tiling บนชั้น 4-5 อยู่ในเกณฑ์สมบูรณ์สูง แนะนำให้เพิ่มอัตรากำลังช่างประตูกระจกเพื่อเร่งรัดการส่งมอบชั้น 7-8", "Analysis of 216 rooms indicates 74% overall progress. Finishing paint and tiling on floors 4–5 are progressing well. Consider adding glass-door crews to accelerate handover on floors 7–8."],
  ["งานทาสี Finish Paint 1 (พบรอยด่าง 18 จุด)", "Finish Paint 1 (18 blemishes found)"],
  ["คาดว่าจะพร้อมส่งมอบทั้งโครงการภายในวันที่ 15 พฤศจิกายน 2026", "The project is forecast to be ready for handover by November 15, 2026"],
  ["เครื่องมือวิเคราะห์อัจฉริยะ ตรวจจับ Defect อัตโนมัติและสรุปรายงานบริหาร", "Analysis tools for defect detection and executive project reports"],
  ["สร้างรายงานสรุป AI", "Generate AI Summary"], ["ผลการวิเคราะห์ภาพรวมบริหาร", "Executive Analysis Summary"],
  ["จุดต้องแก้ไขด่วน", "Top Defect Trade"], ["ประมาณการวันส่งมอบ", "Handover Forecast"],
  ["แผนผังสถานะการส่งมอบ", "Building Handover Heatmap"], ["ภาพรวม 8 ชั้น x 27 ห้องพัก (สีเขียว = พร้อมส่งมอบ / สีแดง = พบ Defect)", "8 floors × 27 rooms (green = ready for handover / red = defect found)"],
  ["ดาวน์โหลดรายงาน Excel (CSV) แล้ว", "Excel report (CSV) downloaded"], ["PDF Export", "ส่งออก PDF"], ["Excel Export", "ส่งออก Excel"],
  ["พร้อมส่งมอบ", "Ready for Handover"], ["กำลังดำเนินการ", "In Progress"], ["มีข้อบกพร่อง", "Defect Found"],
  ["รอดำเนินการ", "Pending"], ["ผ่านการตรวจ", "Passed"], ["ไม่ผ่าน", "Failed"],
  ["ฉาบปูนผนัง", "Wall Plastering"], ["ฉาบสกิมโค้ต", "Skim Coat"], ["ปรับระดับพื้น", "Screed"], ["ทาสีรองพื้น", "Primer Paint"],
  ["ทาสีจริงครั้งที่ 1", "Finish Paint 1"], ["ทาสีจริงครั้งที่ 2", "Finish Paint 2"], ["ปูกระเบื้องห้องน้ำ", "Bathroom Tiling"],
  ["โครงฝ้าเพดาน", "Ceiling Frame"], ["แผ่นฝ้าเพดาน", "Ceiling Board"], ["ประตูหลัก", "Main Door"], ["ประตูห้องน้ำ", "Bathroom Door"],
  ["ฉากกั้นอาบน้ำ", "Shower Screen"], ["บัวเชิงผนัง", "Skirting"],
  ["Deluxe King", "ห้องดีลักซ์เตียงคิงไซส์"], ["Executive Suite", "ห้องเอ็กเซ็กคิวทีฟสวีท"], ["Standard Twin", "ห้องมาตรฐานเตียงคู่"], ["Corner Suite", "ห้องคอร์เนอร์สวีท"],
  ["นายธนโชค ซี.", "Tanachock C."], ["passed", "ผ่าน"], ["defect", "พบข้อบกพร่อง"], ["inProgress", "กำลังดำเนินการ"], ["pending", "รอดำเนินการ"],
  ["RI (Request for Inspection) Document", "เอกสาร RI (Request for Inspection)"],
  ["Simulated AI verification checks file format and metadata only; it cannot confirm issuer authenticity.", "การตรวจจำลองด้วย AI ตรวจเฉพาะรูปแบบและข้อมูลไฟล์ ไม่สามารถยืนยันผู้ออกเอกสารได้"],
  ["Checking…", "กำลังตรวจสอบ…"], ["Simulated AI: likely genuine RI · demo only", "AI จำลอง: เอกสาร RI มีแนวโน้มถูกต้อง · ใช้สาธิตเท่านั้น"],
  ["Review required · filename does not identify an RI · simulation", "ต้องตรวจทาน · ชื่อไฟล์ไม่ระบุว่าเป็น RI · ผลจำลอง"], ["Verification failed · unsupported file · simulation", "ตรวจสอบไม่ผ่าน · ไฟล์ไม่รองรับ · ผลจำลอง"],
  ["Room Plan Task Map", "แผนผังห้องพร้อมจุดงานตรวจ"], ["Attached floor plan · numbered markers show task locations", "แปลนที่แนบ · หมายเลขแสดงตำแหน่งงานตรวจ"],
  ["Living", "ห้องนั่งเล่น"], ["Bedroom", "ห้องนอน"], ["Bathroom", "ห้องน้ำ"], ["Kitchen", "ครัว"], ["Entry", "ทางเข้า"],
  ["Read-only room status", "สถานะห้อง (อ่านอย่างเดียว)"], ["Read-only checklist", "รายการตรวจ (อ่านอย่างเดียว)"],
  ["Floor Progress", "ความคืบหน้ารายชั้น"], ["Floor Status", "สถานะรายชั้น"], ["Trade Defects", "ข้อบกพร่องแยกตามงาน"],
  ["Missing Mix Valve", "วาล์วผสมน้ำหาย"], ["Plumbing Issue", "ปัญหาระบบประปา"], ["Ceiling Defect", "ฝ้าเพดานชำรุด"], ["Electrical Fault", "ระบบไฟฟ้าขัดข้อง"], ["Ceiling Board Crack", "ฝ้าเพดานแตกร้าว"], ["Shower Screen Gap", "ช่องว่างฉากกั้นอาบน้ำ"],
  ["Checking status…", "กำลังตรวจสอบสถานะ…"], ["Verified (Simulated)", "ผ่านการตรวจจำลอง"], ["Review Required (Simulated)", "ต้องตรวจทาน (ผลจำลอง)"],
  ["AI Executive Workbench", "พื้นที่วิเคราะห์สำหรับผู้บริหารด้วย AI"], ["AI Image Quality Score:", "คะแนนคุณภาพภาพจาก AI:"],
  ["Quality:", "คุณภาพ:"], ["High Resolution", "ความละเอียดสูง"], ["Passed (No blur)", "ผ่าน (ภาพไม่เบลอ)"],
  ["Defect Points", "จุดบกพร่อง"], ["Export Report", "ส่งออกรายงาน"], ["Date", "วันที่"], ["Floor", "ชั้น"],
  ["Passed & Ready", "ผ่านและพร้อมส่งมอบ"], ["Active Defects", "ข้อบกพร่องที่ต้องแก้"], ["Pending Inspections", "รอการตรวจ"], ["ready", "พร้อมส่งมอบ"],
  ["View Details", "ดูรายละเอียด"], ["Edit", "แก้ไข"], ["Close", "ปิด"], ["Save Changes", "บันทึกการเปลี่ยนแปลง"],
  ["All", "ทั้งหมด"], ["Select Floor", "เลือกชั้น"], ["Trade", "หมวดหมู่งาน"], ["Inspector", "ผู้ตรวจงาน"],
  ["Floor Grid Selector", "ตัวเลือกผังรายชั้น"], ["13-Task Inspection Checklist", "รายการตรวจ 13 งาน"], ["PASSED", "ผ่าน"], ["DEFECT", "พบข้อบกพร่อง"],
  ["View Photos", "ดูรูปภาพ"], ["View RI Document", "ดูเอกสาร RI"], ["No photo evidence", "ไม่มีหลักฐานรูปภาพ"], ["No RI document", "ไม่มีเอกสาร RI"],
  ["Evidence Preview", "ตัวอย่างหลักฐาน"], ["Evidence file is unavailable", "ไม่พบไฟล์หลักฐาน"], ["Open or download file", "เปิดหรือดาวน์โหลดไฟล์"], ["Close preview", "ปิดตัวอย่าง"],
  ["Room Status", "สถานะห้อง"], ["Handover", "การส่งมอบ"], ["Floor", "ชั้น"], ["Floor ", "ชั้น "],
  ["Missing Valve", "วาล์วน้ำหาย"], ["Handover Forecast", "คาดการณ์ส่งมอบ"], ["Top Defect Trade", "งานที่มีข้อบกพร่องสูงสุด"],
  ["Generate Insights", "สร้างข้อมูลเชิงลึก"], ["PDF / Excel Preview Viewer Placeholder", "พื้นที่ตัวอย่างแสดง PDF / Excel"],
  ["PDF Export", "ส่งออก PDF"], ["Excel Export", "ส่งออก Excel"],
  ["การแจ้งเตือนล่าสุด: ตรวจสอบห้อง 412 เรียบร้อย", "Latest notification: Room 412 was inspected"],
  ["บันทึกผลตรวจห้อง ", "Saved inspection for Room "], [" สำเร็จ", " completed"],
  ["อัปเดตข้อมูลห้อง ", "Updated Room "], ["แปลงเสียงเป็นข้อความสำเร็จ", "Voice transcription completed"],
  ["สถานะหลักของห้อง", "Overall Room Status"], ["รายละเอียดห้องพัก", "Room Details"], ["ผู้ตรวจล่าสุด", "Last Inspector"],
  ["บันทึกการตรวจล่าสุด", "Recent Inspection Records"], ["ลำดับขั้นตอนการตรวจ 13 งาน", "13-Task Inspection Timeline"],
  ["ชั้น ", "Floor "], ["ห้องพัก", "Room"], ["ความคืบหน้า", "Progress"], ["รอการตรวจเช็ค", "Pending Inspection"],
  ["สถานะการตรวจแยกตามชั้น", "Inspection Status by Floor"], ["สรุปผลการตรวจ", "Inspection Result Summary"], ["ห้องที่ต้องแก้ไขเร่งด่วน", "Critical Rooms"],
  ["ยังไม่ส่งตรวจ", "Not Submitted"], ["รอตรวจ", "Ready for Inspection"], ["วาล์วน้ำหาย", "Missing Mix Valve"],
  ["หมวดหมู่ช่าง", "Trade"], ["ศูนย์เอกสารโครงการ", "Project Document Center"], ["สถานะการส่งมอบห้องพัก", "Handover Status"],
  ["Inspection Reports", "รายงานการตรวจ"], ["Defect Reports", "รายงานข้อบกพร่อง"], ["RI Documents", "เอกสาร RI"],
  ["Upload Document", "อัปโหลดเอกสาร"], ["Room Plan with inspection task markers", "แผนผังห้องพร้อมจุดระบุตำแหน่งงานตรวจ"],
  ["Room Details", "รายละเอียดห้อง"], ["Task", "รายการตรวจ"], ["AI Summary Output", "ผลสรุปจาก AI"], ["Executive Analysis Summary", "สรุปผลวิเคราะห์สำหรับผู้บริหาร"],
  ["Recording...", "กำลังบันทึกเสียง..."], ["Voice Note", "บันทึกเสียง"], ["Room Status", "สถานะห้อง"],
  ["สถานะ", "Status"], ["ดูรายละเอียดห้อง", "View Room Details"], ["สร้างรายงานสรุป AI (Generate Insights)", "Generate AI Summary"],
  ["Tracking & Reporting Expert System", "ระบบติดตามและรายงานผลอัจฉริยะ"], ["Site Engineer", "วิศวกรประจำไซต์"],
];

const translateString = (value, lang) => {
  const normalizedPairs = bilingualPairs.map(([first, second]) => /[\u0E00-\u0E7F]/.test(first) ? [first, second] : [second, first]);
  const pairs = lang === 'en' ? normalizedPairs : normalizedPairs.map(([th, en]) => [en, th]);
  return [...pairs].sort((a, b) => b[0].length - a[0].length).reduce((text, [source, target]) => text.replaceAll(source, target), value);
};

function LocalizedUI({ lang, children }) {
  const localize = (node) => {
    if (typeof node === 'string') return translateString(node, lang);
    if (Array.isArray(node)) return node.map(localize);
    if (!React.isValidElement(node)) return node;
    const props = { ...node.props };
    for (const key of ['placeholder', 'title', 'alt', 'aria-label']) {
      if (typeof props[key] === 'string') props[key] = translateString(props[key], lang);
    }
    if (props.children !== undefined) props.children = localize(props.children);
    return React.cloneElement(node, props);
  };
  return <>{localize(children)}</>;
}

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

const getLocalDateString = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dayDifference = (fromDate, toDate = getLocalDateString()) => Math.floor((new Date(`${toDate}T00:00:00`).getTime() - new Date(`${fromDate}T00:00:00`).getTime()) / 86400000);
const expireDueRiDocuments = (documents, today = getLocalDateString()) => documents.map(doc => doc.documentType === 'ri' && doc.status === 'pending' && doc.scheduledDate && dayDifference(doc.scheduledDate, today) >= 2 ? { ...doc, status: 'expired' } : doc);

function normalizeHistoryLogRow(value = {}) {
  const row = {};
  HISTORY_LOG_FIELDS.forEach(field => {
    const camel = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    row[field] = value[field] ?? value[camel] ?? '';
  });
  row.id = String(row.id || row.doc_no || crypto.randomUUID());
  row.building = canonicalBuilding(row.building, row.floor);
  row.floor = String(row.floor ?? '');
  row.room = String(row.room ?? '');
  return row;
}

function extractHistoryRows(payload) {
  const candidate = Array.isArray(payload) ? payload : payload?.data ?? payload?.records ?? payload?.rows ?? payload?.historyLog ?? payload?.history_log ?? [];
  if (!Array.isArray(candidate)) return [];
  if (candidate.length && Array.isArray(candidate[0])) {
    const headers = candidate[0].map(String);
    return candidate.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
  }
  return candidate.filter(row => row && typeof row === 'object').map(normalizeHistoryLogRow);
}

function mergeHistoryRows(primaryRows, cachedRows) {
  const rowsById = new Map();
  [...cachedRows, ...primaryRows].forEach(value => {
    const row = normalizeHistoryLogRow(value);
    rowsById.set(row.id, { ...(rowsById.get(row.id) || {}), ...row });
  });
  return [...rowsById.values()];
}

function readLocalHistoryRows() {
  try {
    const cached = JSON.parse(localStorage.getItem(HISTORY_LOG_CACHE_KEY) || '[]');
    return Array.isArray(cached) ? cached.map(normalizeHistoryLogRow) : [];
  } catch { return []; }
}

function historyRowToInspection(row, inspector = '') {
  return {
    id: row.id, evidence_id: String(row.doc_type).toLowerCase() === 'ri' && String(row.id).endsWith('-ri') ? String(row.id).slice(0, -3) : row.id,
    building: canonicalBuilding(row.building, row.floor), floor: String(row.floor || ''), roomNumber: String(row.room), task: row.trade, status: row.status,
    remarks: row.reason, date: row.updated_at, inspector,
    photo: row.doc_type === 'inspection' && (row.file_url || row.file_name) ? { name: row.file_name, type: '', file_url: row.file_url } : null,
    riDocument: row.doc_type === 'ri' && (row.file_url || row.file_name) ? { name: row.file_name, type: '', file_url: row.file_url } : null,
    file_url: row.file_url, folder_path: row.folder_path,
  };
}

function toHistoryLogRow({ id, building, floor, room, trade, docNo, docType, appointmentDate = '', status = '', reason = '', fileName = '', fileUrl = '', folderPath = '', updatedAt = new Date().toISOString() }) {
  return normalizeHistoryLogRow({ id, building, floor, room, trade, doc_no: docNo, doc_type: docType, appointment_date: appointmentDate, status, reason, file_name: fileName, file_url: fileUrl, folder_path: folderPath, updated_at: updatedAt });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const separator = result.indexOf(',');
      resolve(separator >= 0 ? result.slice(separator + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}

function buildDriveFileName(building, floor, room, docNo, originalFileName) {
  const cleanPart = value => String(value || '').trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_');
  return [building, floor, room, docNo, originalFileName].map(cleanPart).filter(Boolean).join('_');
}

async function readGasResponse(response) {
  const body = await response.text();
  if (!response.ok) throw new Error(`GAS request failed (${response.status})`);
  if (!body) return {};
  try {
    const parsed = JSON.parse(body);
    if (parsed?.success === false || parsed?.ok === false || parsed?.error) throw new Error(parsed.message || parsed.error || 'GAS returned an error');
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) return { message: body };
    throw error;
  }
}

async function fetchHistoryLogFromGas() {
  const response = await fetch(GAS_WEB_APP_URL, { method: 'GET', cache: 'no-store' });
  const payload = await readGasResponse(response);
  if (payload?.success === false || payload?.ok === false || payload?.error) throw new Error(payload.message || payload.error || 'GAS returned an error');
  return extractHistoryRows(payload);
}

async function postHistoryLogToGas(payload) {
  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const result = await readGasResponse(response);
  const returned = result?.record ?? result?.data?.record ?? (result?.data && !Array.isArray(result.data) ? result.data : result);
  return normalizeHistoryLogRow({ ...payload, ...(returned && typeof returned === 'object' ? returned : {}) });
}

function legacyInspectionsToHistory(records, rooms) {
  return records.map(record => {
    const room = rooms.find(item => String(item.roomNumber) === String(record.roomNumber));
    return toHistoryLogRow({
      id: record.id || crypto.randomUUID(), building: canonicalBuilding(room?.building || PROJECT_BUILDING_NAME, room?.floor), floor: room?.floor || '', room: record.roomNumber,
      trade: record.task, docNo: record.id || `INS-${record.roomNumber}-${record.task}`, docType: 'inspection',
      status: record.status, reason: record.remarks || '', fileName: record.photo?.name || '', fileUrl: '',
      folderPath: '', updatedAt: record.date || new Date().toISOString(),
    });
  });
}

function historyRowsToInspections(rows, fallbackInspector = '') {
  return rows.filter(row => ['inspection', 'inspection_record'].includes(String(row.doc_type).toLowerCase()))
    .map(row => historyRowToInspection(row, fallbackInspector));
}

function historyRowToDocument(row) {
  const rawType = String(row.doc_type || 'general').toLowerCase();
  const documentType = rawType.includes('ri') || rawType.includes('request') ? 'ri' : rawType.includes('defect') ? 'defect' : rawType.includes('inspection') ? 'inspection' : 'general';
  const building = canonicalBuilding(row.building, row.floor);
  return {
    id: row.id, name: row.file_name || row.doc_no || `Document ${row.id}`, reference: row.doc_no,
    documentType, building, floor: String(row.floor || ''), roomNumber: String(row.room || ''),
    category: ['Architecture', 'MEP', 'Structure'].includes(row.trade) ? row.trade : 'Architecture',
    date: String(row.updated_at || '').slice(0, 10), scheduledDate: row.appointment_date || '',
    status: String(row.status || 'pending').toLowerCase(), reasonReport: row.reason || '',
    file_url: row.file_url || '', folder_path: row.folder_path || '', file_name: row.file_name || '',
  };
}

function applyHistoryRowsToRooms(currentRooms, rows) {
  const byRoom = new Map();
  rows.filter(row => ['inspection', 'inspection_record'].includes(String(row.doc_type).toLowerCase()) && TASKS_13.includes(row.trade))
    .forEach(row => {
      const key = `${canonicalBuilding(row.building, row.floor)}|${row.room}`;
      if (!byRoom.has(key)) byRoom.set(key, []);
      byRoom.get(key).push(row);
    });
  return currentRooms.map(room => {
    const roomRows = byRoom.get(`${canonicalBuilding(room.building, room.floor)}|${room.roomNumber}`);
    if (!roomRows?.length) return room;
    const tasks = { ...room.tasks };
    roomRows.sort((a, b) => String(a.updated_at).localeCompare(String(b.updated_at))).forEach(row => { tasks[row.trade] = row.status || 'pending'; });
    const passed = Object.values(tasks).filter(value => value === 'passed').length;
    const defects = Object.values(tasks).filter(value => value === 'defect').length;
    return { ...room, tasks, progress: Math.round(passed / TASKS_13.length * 100), defectsCount: defects, status: defects ? 'defect' : passed === TASKS_13.length ? 'ready' : 'inProgress', lastUpdate: roomRows[roomRows.length - 1].updated_at || room.lastUpdate };
  });
}

const EVIDENCE_DB_NAME = 'trex-inspection-evidence';
const EVIDENCE_STORE_NAME = 'records';
function openEvidenceDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IndexedDB is unavailable'));
    const request = window.indexedDB.open(EVIDENCE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(EVIDENCE_STORE_NAME)) request.result.createObjectStore(EVIDENCE_STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open evidence storage'));
  });
}

async function storeInspectionEvidence(recordId, evidence) {
  if (!evidence?.photo && !evidence?.ri) return;
  const db = await openEvidenceDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EVIDENCE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(EVIDENCE_STORE_NAME);
    const request = store.get(recordId);
    request.onsuccess = () => store.put({ ...(request.result || {}), id: recordId, photo: evidence.photo || request.result?.photo || null, ri: evidence.ri || request.result?.ri || null });
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { const error = transaction.error; db.close(); reject(error || new Error('Could not save evidence')); };
    transaction.onabort = () => { const error = transaction.error; db.close(); reject(error || new Error('Evidence save was cancelled')); };
  });
}

async function savePendingHistoryPayload(recordId, payload) {
  const db = await openEvidenceDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EVIDENCE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(EVIDENCE_STORE_NAME);
    const request = store.get(recordId);
    request.onsuccess = () => store.put({ ...(request.result || {}), id: recordId, pendingGasPayload: payload });
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { const error = transaction.error; db.close(); reject(error || new Error('Could not queue offline record')); };
  });
}

async function readPendingHistoryPayload(recordId) {
  const db = await openEvidenceDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EVIDENCE_STORE_NAME, 'readonly');
    const request = transaction.objectStore(EVIDENCE_STORE_NAME).get(recordId);
    request.onsuccess = () => { const payload = request.result?.pendingGasPayload || null; db.close(); resolve(payload); };
    request.onerror = () => { const error = request.error; db.close(); reject(error || new Error('Could not read queued record')); };
  });
}

async function clearPendingHistoryPayload(recordId) {
  const db = await openEvidenceDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EVIDENCE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(EVIDENCE_STORE_NAME);
    const request = store.get(recordId);
    request.onsuccess = () => {
      if (!request.result) return;
      const value = { ...request.result };
      delete value.pendingGasPayload;
      if (value.photo || value.ri) store.put(value); else store.delete(recordId);
    };
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { const error = transaction.error; db.close(); reject(error || new Error('Could not clear queued record')); };
  });
}

function readPendingHistoryIds() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_LOG_PENDING_KEY) || '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch { return []; }
}

function writePendingHistoryIds(ids) {
  try { localStorage.setItem(HISTORY_LOG_PENDING_KEY, JSON.stringify([...new Set(ids.map(String))])); }
  catch (error) { console.warn('Could not update pending HistoryLog index:', error); }
}

async function loadInspectionEvidence(recordId, kind) {
  const db = await openEvidenceDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EVIDENCE_STORE_NAME, 'readonly');
    const request = transaction.objectStore(EVIDENCE_STORE_NAME).get(recordId);
    request.onsuccess = () => { const value = request.result?.[kind] || null; db.close(); resolve(value); };
    request.onerror = () => { const error = request.error; db.close(); reject(error || new Error('Could not load evidence')); };
  });
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
        building: floor <= 4 ? BUILDING_A : BUILDING_B,
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
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trex-session')) || null; }
    catch { return null; }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rooms, setRooms] = useState(() => {
    try { return canonicalizeRooms(JSON.parse(localStorage.getItem('trex-rooms')) || generateRoomsData()); }
    catch { return generateRoomsData(); }
  });
  const [historyRows, setHistoryRows] = useState(() => {
    const cached = readLocalHistoryRows();
    if (cached.length) return cached;
    try {
      const legacy = JSON.parse(localStorage.getItem('trex-inspections') || '[]');
      return Array.isArray(legacy) ? legacyInspectionsToHistory(legacy, rooms) : [];
    } catch { return []; }
  });
  const [inspectionRecords, setInspectionRecords] = useState(() => {
    const cached = readLocalHistoryRows();
    if (cached.length) return historyRowsToInspections(cached);
    try { return JSON.parse(localStorage.getItem('trex-inspections')) || []; }
    catch { return []; }
  });
  const [syncStatus, setSyncStatus] = useState('syncing');
  const [syncError, setSyncError] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  
  // Modal States
  const [modalRoom, setModalRoom] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  const t = i18n[lang];

  useEffect(() => { localStorage.setItem('trex-rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('trex-inspections', JSON.stringify(inspectionRecords)); }, [inspectionRecords]);
  useEffect(() => {
    try { localStorage.setItem(HISTORY_LOG_CACHE_KEY, JSON.stringify(historyRows.map(normalizeHistoryLogRow))); }
    catch (error) { console.warn('Could not update HistoryLog cache:', error); }
  }, [historyRows]);

  const showToast = (msg, link = '') => {
    setToastMessage({ message: msg, link });
    setTimeout(() => setToastMessage(null), link ? 9000 : 4500);
  };

  const handleLogin = (user) => {
    setSession(user);
    localStorage.setItem('trex-session', JSON.stringify(user));
    setActiveTab('dashboard');
  };
  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('trex-session');
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };

  const refreshHistory = useCallback(async (allowPendingWrites = session?.role === 'engineer') => {
    setSyncStatus('syncing');
    setSyncError(false);
    try {
      let remoteRows = await fetchHistoryLogFromGas();
      let pendingIds = readPendingHistoryIds();
      if (allowPendingWrites && session?.role === 'engineer' && pendingIds.length) {
        const remaining = [];
        for (const id of pendingIds) {
          try {
            const payload = await readPendingHistoryPayload(id);
            if (!payload) { await clearPendingHistoryPayload(id); continue; }
            let retryPayload = payload;
            if (payload.pendingFile) {
              const { pendingFile, ...metadata } = payload;
              retryPayload = payload.fileData ? metadata : { ...metadata, fileData: await fileToBase64(pendingFile), fileName: metadata.fileName || metadata.file_name, mimeType: pendingFile.type || 'application/octet-stream' };
            }
            const saved = await postHistoryLogToGas(retryPayload);
            remoteRows = mergeHistoryRows([saved], remoteRows);
            await clearPendingHistoryPayload(id);
          } catch (retryError) {
            console.warn('Queued HistoryLog write is still pending:', retryError);
            remaining.push(id);
          }
        }
        pendingIds = remaining;
        writePendingHistoryIds(remaining);
      }
      const merged = mergeHistoryRows(remoteRows, readLocalHistoryRows());
      setHistoryRows(merged);
      setInspectionRecords(historyRowsToInspections(merged, session?.name || ''));
      setRooms(current => applyHistoryRowsToRooms(current, merged));
      setSyncStatus(pendingIds.length ? 'offline' : 'synced');
      setSyncError(pendingIds.length > 0);
      setLastSyncedAt(new Date().toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
      return merged;
    } catch (error) {
      console.warn('GAS HistoryLog sync failed; retaining local cache:', error);
      setSyncStatus('offline');
      setSyncError(true);
      return null;
    }
  }, [session, lang]);

  useEffect(() => {
    if (session) refreshHistory(session.role === 'engineer');
  }, [session, refreshHistory]);

  const persistHistoryRecord = useCallback(async (inputRow, file = null) => {
    if (session?.role !== 'engineer') return null;
    if (file && file.size > MAX_UPLOAD_BYTES) {
      showToast(i18n[lang].sync.fileTooLarge);
      return null;
    }
    let row = normalizeHistoryLogRow(inputRow);
    if (file) {
      const fileName = buildDriveFileName(row.building, row.floor, row.room, row.doc_no, file.name);
      row = normalizeHistoryLogRow({ ...row, file_name: fileName });
    }
    let payload = { ...row };
    const cached = mergeHistoryRows([row], readLocalHistoryRows());
    setHistoryRows(cached);
    try { localStorage.setItem(HISTORY_LOG_CACHE_KEY, JSON.stringify(cached)); }
    catch (error) { console.warn('Could not persist HistoryLog cache:', error); }
    try {
      if (file) {
        payload = { ...row, fileData: await fileToBase64(file), fileName: row.file_name, mimeType: file.type || 'application/octet-stream' };
      }
      setSyncStatus('syncing');
      setSyncError(false);
      const savedRow = await postHistoryLogToGas(payload);
      let latestRows = [savedRow];
      try {
        const responseRows = await fetchHistoryLogFromGas();
        if (responseRows.length) latestRows = responseRows;
      } catch (refreshError) {
        console.warn('POST succeeded but the follow-up GET could not refresh:', refreshError);
      }
      const updatedRows = mergeHistoryRows(latestRows, cached);
      setHistoryRows(updatedRows);
      if (String(row.doc_type).toLowerCase().startsWith('inspection')) {
        setInspectionRecords(historyRowsToInspections(updatedRows, session.name));
        setRooms(current => applyHistoryRowsToRooms(current, updatedRows));
      }
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
      return { ...savedRow, _savedToBackend: true };
    } catch (error) {
      console.warn('GAS write failed; retaining the local HistoryLog row:', error);
      try {
        await savePendingHistoryPayload(row.id, file && !payload.fileData ? { ...payload, pendingFile: file } : payload);
        writePendingHistoryIds([...readPendingHistoryIds(), row.id]);
      } catch (queueError) {
        console.warn('Could not queue the record for a later sync:', queueError);
      }
      setSyncStatus('offline');
      setSyncError(true);
      return { ...row, _savedToBackend: false };
    }
  }, [session, lang]);

  const submitInspection = useCallback(async (record, evidence) => {
    if (session?.role !== 'engineer') return;
    try { await storeInspectionEvidence(record.id, evidence); }
    catch (error) {
      console.error('Unable to persist inspection evidence locally:', error);
      showToast(i18n[lang].sync.uploadFailed);
    }
    const room = rooms.find(item => String(item.roomNumber) === String(record.roomNumber));
    const building = canonicalBuilding(room?.building || PROJECT_BUILDING_NAME, room?.floor);
    const base = {
      building, floor: room?.floor || '', room: record.roomNumber, trade: record.task,
      docNo: `INS-${record.id}`, docType: 'inspection', status: record.status,
      reason: record.remarks || '', updatedAt: new Date().toISOString(),
    };
    const primaryRow = toHistoryLogRow({ ...base, id: record.id, fileName: evidence?.photo?.name || '', fileUrl: record.photo?.url || '' });
    const localRecord = { ...record };
    setInspectionRecords(current => [localRecord, ...current]);
    setRooms(current => current.map(currentRoom => {
      if (String(currentRoom.roomNumber) !== String(record.roomNumber)) return currentRoom;
      const tasks = { ...currentRoom.tasks, [record.task]: record.status };
      const passed = Object.values(tasks).filter(value => value === 'passed').length;
      const defects = Object.values(tasks).filter(value => value === 'defect').length;
      return { ...currentRoom, tasks, progress: Math.round(passed / TASKS_13.length * 100), defectsCount: defects, status: defects ? 'defect' : passed === TASKS_13.length ? 'ready' : 'inProgress', lastUpdate: record.date, lastInspector: record.inspector };
    }));
    const savedPhoto = await persistHistoryRecord(primaryRow, evidence?.photo || null);
    let savedRi = null;
    if (evidence?.ri) {
      const riRow = toHistoryLogRow({ ...base, id: `${record.id}-ri`, docNo: `RI-${record.id}`, docType: 'ri', fileName: evidence.ri.name });
      savedRi = await persistHistoryRecord(riRow, evidence.ri);
    }
    const success = savedPhoto?._savedToBackend && (!evidence?.ri || savedRi?._savedToBackend);
    if (success) showToast(lang === 'th' ? `บันทึกผลตรวจห้อง ${record.roomNumber} สำเร็จ` : `Saved inspection for Room ${record.roomNumber}`, savedPhoto?.file_url || savedRi?.file_url || '');
    else showToast(i18n[lang].sync.uploadFailed);
  }, [session, rooms, persistHistoryRecord, lang]);

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

  if (!session) return <LocalizedUI lang={lang}><LoginScreen lang={lang} t={t} setLang={setLang} onLogin={handleLogin} /></LocalizedUI>;

  const isEngineer = session.role === 'engineer';
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { id: 'floorStatus', icon: Grid, label: t.nav.floorStatus },
    { id: 'newInspection', icon: ClipboardCheck, label: t.nav.newInspection, restricted: true },
    { id: 'inspectionRecords', icon: History, label: t.nav.inspectionRecords },
    { id: 'documentCenter', icon: FolderKanban, label: t.nav.documentCenter },
    { id: 'aiAssistant', icon: Bot, label: t.nav.aiAssistant, badge: 'AI', restricted: true },
  ].filter(item => isEngineer || !item.restricted);

  return (
    <LocalizedUI lang={lang}>
    <div className="flex h-screen overflow-hidden bg-slate-900 font-sans text-slate-100">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div role="status" className="fixed left-3 right-3 top-5 z-50 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-400 bg-emerald-700 px-4 py-3 text-white shadow-2xl sm:left-auto sm:right-5 sm:max-w-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1 text-sm font-medium">{toastMessage.message}</span>
          {toastMessage.link && <a href={toastMessage.link} target="_blank" rel="noreferrer" className="text-xs font-bold underline underline-offset-2">{t.documents.openFile}</a>}
        </div>
      )}

      {/* --- SIDEBAR --- */}
      {mobileMenuOpen && <button type="button" aria-label={lang === 'th' ? 'ปิดเมนู' : 'Close menu'} className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-slate-800 bg-[#0B132B] transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0`}>
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
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
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
              <p className="text-xs font-semibold text-slate-200 truncate">{session.name}</p>
              <p className="text-[10px] text-emerald-400">{session.role === 'engineer' ? t.role.engineer : t.role.viewer}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        
        {/* Top Header Bar */}
        <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/30 px-3 py-2 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-md">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 md:hidden" aria-label={lang === 'th' ? 'เปิดเมนู' : 'Open menu'}><Menu className="h-4 w-4" /></button>
            <div className="relative hidden w-full sm:block">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="max-w-36 text-right sm:max-w-52"><p className="hidden truncate text-[10px] text-slate-400 md:block">{session.name}</p><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">{session.role === 'engineer' ? t.role.engineer : t.role.viewer}</span></div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1.5" title={syncError ? t.sync.syncFailed : syncStatus === 'synced' && lastSyncedAt ? `${t.sync.lastSync}: ${lastSyncedAt}` : undefined}>
              <span className={`h-2 w-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : syncStatus === 'syncing' ? 'animate-pulse bg-amber-300' : 'bg-red-400'}`} />
              <span className="hidden text-[9px] font-medium text-slate-300 lg:inline">{syncStatus === 'synced' ? t.sync.synced : syncStatus === 'syncing' ? t.sync.syncing : t.sync.offline}</span>
            </div>
            <button type="button" disabled={syncStatus === 'syncing'} onClick={() => refreshHistory(isEngineer)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-[10px] font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 sm:px-3" title={t.sync.refresh} aria-label={t.sync.refresh}><RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /><span className="hidden xl:inline">{t.sync.refresh}</span></button>
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
              onClick={() => { setActiveTab('inspectionRecords'); showToast(t.records.title); }}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1"></span>
            </button>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-[10px] font-semibold text-slate-300 hover:bg-slate-700 sm:px-3" title={t.role.logout}><LogOut className="h-4 w-4" /><span className="hidden sm:inline">{t.role.logout}</span></button>
          </div>
          <div className="relative order-last w-full sm:hidden"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input type="text" placeholder={t.common.search} value={searchQuery} onChange={event => setSearchQuery(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800/70 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"/></div>
        </header>

        {/* View Content Renderer */}
        <main className="flex-1 overflow-y-auto bg-[#0B132B] p-3 sm:p-6">
          {syncError && <div role="alert" className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">{t.sync.syncFailed}</div>}
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
              selectedStatusFilter={selectedStatusFilter}
              setSelectedStatusFilter={setSelectedStatusFilter}
              onInspectRoom={(r) => setModalRoom(r)} 
              handoverHeatmap={<HandoverDashboardView t={t} lang={lang} rooms={rooms} selectedFloor={selectedFloorFilter} selectedStatusFilter={selectedStatusFilter} onInspectRoom={(r) => setModalRoom(r)} showToast={showToast} />}
            />
          )}

          {activeTab === 'newInspection' && (
            <RoomInspectionFormView t={t} lang={lang} showToast={showToast} rooms={rooms} onSubmitInspection={submitInspection} />
          )}

          {activeTab === 'inspectionRecords' && (
            <InspectionRecordsView t={t} rooms={rooms} records={inspectionRecords} historyRows={historyRows} onInspectRoom={(r) => setModalRoom(r)} showToast={showToast} />
          )}

          {activeTab === 'documentCenter' && (
            <DocumentCenterView t={t} lang={lang} showToast={showToast} rooms={rooms} canEdit={isEngineer} userName={session.name} historyRows={historyRows} onRecordSaved={persistHistoryRecord} />
          )}

          {activeTab === 'aiAssistant' && (
            <AIAssistantView t={t} showToast={showToast} />
          )}

        </main>
      </div>

      {/* --- GLOBAL ROOM INSPECTION MODAL --- */}
      {modalRoom && <RoomDetailModal room={modalRoom} t={t} lang={lang} records={inspectionRecords} showToast={showToast} onClose={() => setModalRoom(null)} />}
    </div>
    </LocalizedUI>
  );
}

// ==========================================
// SIGN-IN SCREEN
// ==========================================
function LoginScreen({ lang, t, setLang, onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('engineer');
  const submit = event => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    onLogin({ name: cleanName, role });
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#0B132B] p-4 text-slate-100 sm:p-6">
    <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/90 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-700 p-5 sm:p-6">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-400 bg-emerald-500/20 text-2xl">🦖</div><div><h1 className="text-lg font-bold text-white">{t.appName}</h1><p className="text-xs text-slate-400">{t.auth.subtitle}</p></div></div>
        <button type="button" onClick={() => setLang(lang === 'th' ? 'en' : 'th')} className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200">{lang === 'th' ? 'TH | EN' : 'EN | TH'}</button>
      </div>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
        <div><h2 className="text-xl font-bold">{t.auth.title}</h2><p className="mt-1 text-xs text-slate-400">{t.subTitle}</p></div>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-300">{t.auth.name}</span><input autoComplete="name" required value={name} onChange={event => setName(event.target.value)} placeholder={t.auth.namePlaceholder} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none" /></label>
        <fieldset className="space-y-2"><legend className="mb-2 text-xs font-semibold text-slate-300">{t.auth.role}</legend>
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${role === 'engineer' ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-700 bg-slate-900/60'}`}><input type="radio" name="role" value="engineer" checked={role === 'engineer'} onChange={() => setRole('engineer')} className="mt-1 accent-emerald-500" /><span><b className="block text-sm text-slate-100">{t.auth.engineer}</b><small className="mt-1 block text-xs leading-relaxed text-slate-400">{t.auth.engineerAccess}</small></span></label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${role === 'viewer' ? 'border-sky-500 bg-sky-950/30' : 'border-slate-700 bg-slate-900/60'}`}><input type="radio" name="role" value="viewer" checked={role === 'viewer'} onChange={() => setRole('viewer')} className="mt-1 accent-sky-500" /><span><b className="block text-sm text-slate-100">{t.auth.viewer}</b><small className="mt-1 block text-xs leading-relaxed text-slate-400">{t.auth.viewerAccess}</small></span></label>
        </fieldset>
        <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">{t.auth.login}</button>
      </form>
    </section>
  </main>;
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
    <div className="-m-3 min-h-full space-y-4 bg-[#0B132B] p-3 text-slate-100 sm:-m-6 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="m-0 text-xl font-bold tracking-normal text-slate-100">{t.dashboard.title}</h1><p className="mt-1 text-xs text-slate-400">{t.dashboard.projectSubtitle}</p></div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300">● {t.dashboard.liveSync}</span>
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
          return <button key={card.label} onClick={() => setSelectedStatusFilter(card.filter)} className="flex min-h-20 items-center justify-between rounded-lg border border-slate-700 bg-[#1C2541] px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-500 hover:shadow-md" style={{ borderLeft: `3px solid ${card.color}` }}>
            <div><div className="text-[11px] font-medium text-slate-300">{card.label}</div><div className="mt-1 text-2xl font-bold leading-none" style={{ color: card.color }}>{card.value}</div></div><Icon className="h-5 w-5" style={{ color: card.color }} />
          </button>;
        })}
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-slate-700 bg-[#1C2541] p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-100">{t.dashboard.floorStatus}</h2>
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
            <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px]">{statusCounts.map(item => <span key={item.key} className="inline-flex items-center gap-1.5 text-slate-300"><i className="h-2 w-2 rounded-sm" style={{ background: item.color }} />{item.label}</span>)}</div>
          </> : <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">{TASKS_13.slice(0, 4).map(task => { const count = rooms.reduce((sum, room) => sum + (room.tasks?.[task] === 'defect' ? 1 : 0), 0); return <div key={task} className="rounded-md border border-slate-700 bg-[#111b34] p-3"><div className="text-xs text-slate-300">{task}</div><div className="mt-2 text-lg font-bold text-rose-400">{count} {t.dashboard.failed}</div></div>; })}</div>}
          <div className="mt-3 flex justify-end gap-1"><button onClick={() => setChartMode('floor')} className={`rounded px-3 py-1.5 text-[10px] ${chartMode === 'floor' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Floor Status</button><button onClick={() => setChartMode('trade')} className={`rounded px-3 py-1.5 text-[10px] ${chartMode === 'trade' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Trade Defects</button></div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-[#1C2541] p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-100">{t.dashboard.resultSummary}</h2>
          <div className="my-3 flex justify-center"><div className="grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(${donutGradient})` }}><div className="grid h-16 w-16 place-items-center rounded-full bg-[#0B132B] text-xs font-bold text-slate-200">{stats.total}</div></div></div>
          <div className="space-y-1.5">{statusCounts.map(item => <button key={item.key} onClick={() => onStatusSelect(item.key)} className="flex w-full items-center justify-between gap-2 text-left text-[10px] text-slate-300 hover:text-white"><span className="flex min-w-0 items-center gap-1.5"><i className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} /><span className="truncate">{item.label}</span></span><b className="text-slate-100">{item.value}</b></button>)}</div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-700 bg-[#1C2541] p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100"><AlertTriangle className="h-4 w-4 text-rose-400" />{t.dashboard.criticalRooms}</h2>
        {criticalRooms.length ? <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">{criticalRooms.map((room, index) => {
          const task = TASKS_13.find(name => room.tasks?.[name] === 'defect');
          return <button key={room.id} onClick={() => onInspectRoom(room)} className="flex items-center gap-2 rounded-md border border-rose-900/70 bg-rose-950/30 p-2 text-left transition hover:border-rose-700"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-rose-600 text-[10px] font-bold text-white">{room.roomNumber}</span><span className="min-w-0"><b className="block text-[10px] text-slate-100">{t.dashboard.room} {room.roomNumber}</b><small className="block truncate text-[9px] text-rose-300">{t.dashboard.defects[index % t.dashboard.defects.length]}{task ? ` · ${task}` : ''}</small></span></button>;
        })}</div> : <p className="text-xs text-slate-500">{t.dashboard.failed}: 0</p>}
      </section>

      {/* Preserve the existing quick inspection list below the reference dashboard panels. */}
      <div className="overflow-hidden rounded-lg border border-slate-700 bg-[#1C2541] shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-700/80 p-4">
          <h3 className="text-sm font-semibold text-slate-100">รายชื่อห้องพัก (Room Inspection List)</h3>
          <span className="text-xs text-slate-400">แสดงผล {visibleRooms.length} ห้อง</span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#101a33] text-[11px] uppercase text-slate-300">
              <tr>
                <th className="p-3 pl-4">ห้องพัก</th>
                <th className="p-3">ประเภทห้อง</th>
                <th className="p-3">ชั้น</th>
                <th className="p-3">ความคืบหน้า (13 งาน)</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-right pr-4">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70 text-xs text-slate-300">
              {visibleRooms.slice(0, 15).map(room => (
                <tr key={room.id} className="transition-colors hover:bg-slate-700/50">
                  <td className="p-3 pl-4 font-bold text-emerald-300">{room.roomNumber}</td>
                  <td className="p-3">{room.type}</td>
                  <td className="p-3">ชั้น {room.floor}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-slate-900">
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
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
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
function FloorStatusView({ t, rooms, selectedFloor, setSelectedFloor, selectedStatusFilter, setSelectedStatusFilter, onInspectRoom, handoverHeatmap }) {
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

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 p-3">
        <span className="mr-1 text-xs font-semibold text-slate-300">{t.dashboard.resultSummary}:</span>
        {[['all', t.common.filterAll], ['ready', t.dashboard.legend.passed], ['defect', t.dashboard.legend.failed], ['inProgress', t.dashboard.legend.ready], ['pending', t.dashboard.legend.pending]].map(([key, label]) => (
          <button key={key} onClick={() => setSelectedStatusFilter(key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${selectedStatusFilter === key ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-700'}`}>{label}</button>
        ))}
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
              {room.status === 'pending' && <ClipboardCheck className="w-4 h-4 text-slate-400" />}
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
                    room.status === 'ready' ? 'bg-emerald-500' : room.status === 'defect' ? 'bg-red-500' : room.status === 'pending' ? 'bg-slate-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${room.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {handoverHeatmap}
    </div>
  );
}

// ==========================================
// MODULE 3: NEW INSPECTION FORM
// ==========================================
function RoomInspectionFormView({ t, lang, showToast, rooms, onSubmitInspection }) {
  const labels = i18n[lang].form;
  const taskOptions = lang === 'th' ? TASKS_13_TH : TASKS_13;
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.roomNumber || '101');
  const [taskName, setTaskName] = useState(TASKS_13[0]);
  const [status, setStatus] = useState('passed');
  const [inspectorName, setInspectorName] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // AI Simulation States
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [aiScore, setAiScore] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [riFile, setRiFile] = useState(null);
  const [riVerification, setRiVerification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_UPLOAD_BYTES) {
      showToast(t.sync.fileTooLarge);
      e.target.value = '';
      return;
    }
    if (file) {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(file);
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

  const handleRiUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast(t.sync.fileTooLarge);
      event.target.value = '';
      return;
    }
    setRiFile(file);
    setRiVerification('checking');
    window.setTimeout(() => {
      const supported = file.size > 0 && /application\/pdf|image\/(png|jpeg)/.test(file.type);
      const filenameIdentifiesRi = /\bri\b|request.?for.?inspection/i.test(file.name);
      setRiVerification(!supported ? 'simulated-fail' : filenameIdentifiesRi ? 'simulated-pass' : 'simulated-review');
    }, 900);
    event.target.value = '';
  };

  const handleVoiceRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRemarks(lang === 'th' ? "การทาสี Finish Paint 1 พื้นผิวเรียบเนียน ไม่พบรอยด่างหรือรอยแปรง ตรวจสอบผ่าน" : "Finish Paint 1 is smooth, with no blemishes or brush marks. Inspection passed.");
      showToast(lang === 'th' ? "แปลงเสียงเป็นข้อความสำเร็จ (Voice transcribed)" : "Voice transcription completed.");
    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const id = crypto.randomUUID();
    setIsSubmitting(true);
    try {
      await onSubmitInspection({ id, roomNumber: selectedRoom, task: taskName, status, remarks, date: new Date().toLocaleString(lang === 'th' ? 'th-TH' : 'en-US'), inspector: inspectorName.trim(), photo: photoFile ? { name: photoFile.name, type: photoFile.type } : null, riDocument: riFile ? { name: riFile.name, type: riFile.type, size: riFile.size, verification: riVerification } : null }, { photo: photoFile, ri: riFile });
    setRemarks('');
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoFile(null);
    setAiScore(null);
    setRiFile(null);
    setRiVerification('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100">{labels.inspectionTitle}</h2>
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
                <option key={r.id} value={r.roomNumber}>{labels.roomOption(r.roomNumber, r.floor, lang === 'th' ? (r.building === BUILDING_B ? t.documents.buildingB : t.documents.buildingA) : (r.building === BUILDING_B ? t.documents.buildingB : t.documents.buildingA))}</option>
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
              <option value="passed">{labels.passed}</option>
              <option value="defect">{labels.defect}</option>
              <option value="inProgress">{labels.inProgress}</option>
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
            <span className="text-xs font-medium text-slate-200">{labels.photo}</span>
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

        <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900/40 p-4">
          <label htmlFor="ri-document" className="mb-2 block text-xs font-semibold text-slate-200">RI (Request for Inspection) Document</label>
          <input id="ri-document" type="file" accept="application/pdf,image/png,image/jpeg" onChange={handleRiUpload} className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
          <p className="mt-2 text-[10px] text-amber-300">Simulated AI verification checks file format and metadata only; it cannot confirm issuer authenticity.</p>
          {riFile && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-300">{riFile.name}</span>
            {riVerification === 'checking' && <span className="rounded-full bg-blue-500/20 px-2.5 py-1 font-semibold text-blue-300">Checking…</span>}
            {riVerification === 'simulated-pass' && <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-300">Simulated AI: likely genuine RI · demo only</span>}
            {riVerification === 'simulated-review' && <span className="rounded-full bg-amber-500/20 px-2.5 py-1 font-semibold text-amber-300">Review required · filename does not identify an RI · simulation</span>}
            {riVerification === 'simulated-fail' && <span className="rounded-full bg-red-500/20 px-2.5 py-1 font-semibold text-red-300">Verification failed · unsupported file · simulation</span>}
          </div>}
        </div>

        {/* Voice Note & Remarks */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-300">{labels.remarks}</label>
            <button
              type="button"
              onClick={handleVoiceRecord}
              disabled={isSubmitting || isRecording}
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
          placeholder={lang === 'th' ? "กรอกรายละเอียด หรือใช้ปุ่มบันทึกเสียงด้านบน..." : "Enter remarks or use the voice recording button above..."}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
        >
          {isSubmitting ? i18n[lang].sync.uploading : labels.submit}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// MODULE 4: 13-TASK INSPECTION RECORDS
// ==========================================
function InspectionRecordsView({ t, rooms, records, onInspectRoom }) {
  const labels = t.records;
  const displayBuilding = value => canonicalBuilding(value) === BUILDING_B ? t.documents.buildingB : t.documents.buildingA;
  const categories = [...new Set([...TASKS_13, ...records.map(record => record.task).filter(Boolean)])];
  const byLocation = entries => {
    const buildings = new Map();
    entries.forEach(entry => {
      const building = canonicalBuilding(entry.building, entry.floor);
      if (!buildings.has(building)) buildings.set(building, new Map());
      const floors = buildings.get(building);
      const floor = String(entry.floor ?? rooms.find(room => String(room.roomNumber) === String(entry.roomNumber))?.floor ?? '—');
      if (!floors.has(floor)) floors.set(floor, new Map());
      const floorRooms = floors.get(floor);
      const roomNumber = String(entry.roomNumber || '—');
      if (!floorRooms.has(roomNumber)) floorRooms.set(roomNumber, []);
      floorRooms.get(roomNumber).push(entry);
    });
    return buildings;
  };

  return <div className="space-y-4 sm:space-y-6">
    <header className="rounded-xl border border-slate-700 bg-slate-800/80 p-4"><h2 className="text-base font-bold text-slate-100">{labels.title}</h2><p className="mt-1 text-xs text-slate-400">{labels.subtitle}</p><p className="mt-3 text-[11px] text-emerald-300">{labels.recordCount.replace('{count}', records.length)}</p></header>
    <div className="space-y-3">
      {categories.map((task, index) => {
        const taskRecords = records.filter(record => record.task === task).sort((a, b) => String(b.date).localeCompare(String(a.date)));
        const grouped = byLocation(taskRecords);
        return <details key={task} open={index === 0 && records.length > 0} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/70">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-700/30"><span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 bg-slate-900 text-xs font-bold text-emerald-400">{index + 1}</span><b className="text-sm text-slate-100">{task}</b></span><span className="text-[10px] text-slate-400">{labels.recordCount.replace('{count}', taskRecords.length)}</span></summary>
          <div className="space-y-3 border-t border-slate-700 p-3 sm:p-4">
            {grouped.size === 0 ? <p className="rounded-lg bg-slate-900/60 p-4 text-xs text-slate-400">{labels.noRecords}</p> : [...grouped.entries()].map(([building, floors]) => <section key={building} className="rounded-lg border border-slate-700/70 bg-slate-900/40 p-3"><h3 className="mb-3 text-xs font-bold text-emerald-300">{labels.building}: {displayBuilding(building)}</h3>
              <div className="space-y-3">{[...floors.entries()].sort((a, b) => Number(a[0]) - Number(b[0])).map(([floor, floorRooms]) => <div key={floor}><h4 className="mb-2 text-[11px] font-semibold text-slate-300">{labels.floor} {floor}</h4><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{[...floorRooms.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })).map(([roomNumber, roomRecords]) => {
                const room = rooms.find(item => String(item.roomNumber) === roomNumber);
                return <article key={roomNumber} className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"><div className="mb-2 flex items-center justify-between gap-2"><b className="text-xs text-slate-100">{labels.room} {roomNumber}</b>{room && <StatusBadge status={room.tasks?.[task] || 'pending'} t={t} />}</div><div className="space-y-2">{roomRecords.map((record, recordIndex) => <div key={record.id || `${roomNumber}-${recordIndex}`} className="rounded-md bg-slate-900/70 p-2 text-[10px] text-slate-300"><p>{labels.result}: <StatusBadge status={record.status} t={t} /></p><p className="mt-1">{labels.inspector}: {record.inspector || '—'}</p><p className="mt-1 text-slate-400">{labels.inspectionDate}: {record.date || '—'}</p>{record.file_url && <a href={record.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-sky-300 underline">{labels.fileLink}</a>}{record.folder_path && <p className="mt-1 break-all text-slate-500">{labels.folderPath}: {record.folder_path}</p>}</div>)}</div>{room && <button type="button" onClick={() => onInspectRoom(room)} className="mt-2 rounded-md bg-slate-700 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-600">{labels.openRoom}</button>}</article>;
              })}</div></div>)}</div>
            </section>)}
          </div>
        </details>;
      })}
    </div>
  </div>;
}

// ==========================================
// MODULE 5: DOCUMENT CENTER
// ==========================================
function DocumentCenterView({ t, lang, showToast, rooms, canEdit, userName, historyRows = [], onRecordSaved }) {
  const labels = t.documents;
  const sampleDocs = () => [
    { id: 'seed-1', name: 'Inspection_Report_Floor_4_Q3.pdf', reference: 'INS-2026-004', documentType: 'inspection', building: BUILDING_A, floor: '4', roomNumber: '401', category: 'Architecture', date: getLocalDateString(), status: 'completed', size: '3.4 MB' },
    { id: 'seed-2', name: 'Defect_Summary_Boutique_Sukhumvit5.xlsx', reference: 'DEF-2026-002', documentType: 'defect', building: BUILDING_B, floor: '5', roomNumber: '502', category: 'MEP', date: getLocalDateString(), status: 'completed', size: '1.2 MB' },
    { id: 'seed-3', name: 'RI_Architectural_Specs_V2.pdf', reference: 'RI-2026-003', documentType: 'ri', building: BUILDING_B, floor: '6', roomNumber: '603', category: 'Architecture', date: getLocalDateString(), scheduledDate: getLocalDateString(), status: 'pending', size: '4.9 MB' },
    { id: 'seed-4', name: 'Handover_Certificate_Floor_1-2.pdf', reference: 'STR-2026-001', documentType: 'general', building: BUILDING_A, floor: '1', roomNumber: '101', category: 'Structure', date: getLocalDateString(), status: 'completed', size: '4.1 MB' }
  ];
  const [docs, setDocs] = useState(() => {
    try { const stored = JSON.parse(localStorage.getItem('trex-documents')); return Array.isArray(stored) && stored.length ? expireDueRiDocuments(stored.map(doc => ({ ...doc, building: canonicalBuilding(doc.building, doc.floor) }))) : sampleDocs(); }
    catch { return sampleDocs(); }
  });
  const [path, setPath] = useState({ building: null, floor: null, room: null, category: null });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reasonDoc, setReasonDoc] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formError, setFormError] = useState('');
  const [today, setToday] = useState(() => getLocalDateString());
  const lastCheckedDate = useRef(today);
  const [form, setForm] = useState({ documentType: 'general', building: BUILDING_A, floor: '1', roomNumber: '', category: 'Architecture', reference: '', scheduledDate: '', file: null });
  const [savingUpload, setSavingUpload] = useState(false);

  const docToHistoryRow = (doc, overrides = {}) => toHistoryLogRow({
    id: doc.id, building: canonicalBuilding(doc.building, doc.floor),
    floor: doc.floor, room: doc.roomNumber, trade: doc.category,
    docNo: doc.reference, docType: doc.documentType, appointmentDate: doc.scheduledDate || '',
    status: overrides.status || doc.status, reason: overrides.reason ?? doc.reasonReport ?? '',
    fileName: doc.file_name || doc.name, fileUrl: doc.file_url || '', folderPath: doc.folder_path || '',
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    const remoteDocs = historyRows.filter(row => !['inspection', 'inspection_record'].includes(String(row.doc_type).toLowerCase()) || row.file_url).map(historyRowToDocument);
    if (!remoteDocs.length) return;
    setDocs(current => {
      const byId = new Map(current.map(doc => [String(doc.id), doc]));
      remoteDocs.forEach(doc => byId.set(String(doc.id), { ...(byId.get(String(doc.id)) || {}), ...doc, file: byId.get(String(doc.id))?.file || null }));
      return [...byId.values()];
    });
  }, [historyRows]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextDate = getLocalDateString();
      if (lastCheckedDate.current !== nextDate) {
        lastCheckedDate.current = nextDate;
        setToday(nextDate);
        const nextDocs = expireDueRiDocuments(docs, nextDate);
        const newlyExpired = nextDocs.filter(doc => doc.status === 'expired' && docs.some(previous => previous.id === doc.id && previous.status !== 'expired'));
        setDocs(nextDocs);
        if (canEdit) newlyExpired.forEach(doc => { void onRecordSaved(docToHistoryRow(doc, { status: 'expired' })); });
      }
    }, 60000);
    return () => window.clearInterval(timer);
  }, [docs, today, canEdit, onRecordSaved]);
  useEffect(() => {
    try { localStorage.setItem('trex-documents', JSON.stringify(docs.map(doc => { const metadata = { ...doc }; delete metadata.file; return metadata; }))); }
    catch (error) { console.warn('Could not save document metadata:', error); }
  }, [docs]);
  useEffect(() => () => { if (selectedDoc?.previewUrl) URL.revokeObjectURL(selectedDoc.previewUrl); }, [selectedDoc]);

  const buildingKeys = BUILDING_VALUES;
  const floorsForBuilding = building => [...new Set([
    ...rooms.filter(room => canonicalBuilding(room.building, room.floor) === building).map(room => String(room.floor)),
    ...docs.filter(doc => canonicalBuilding(doc.building, doc.floor) === building).map(doc => String(doc.floor)),
  ])].sort((a, b) => Number(a) - Number(b));
  const floors = floorsForBuilding(form.building);
  const roomOptions = rooms.filter(room => canonicalBuilding(room.building, room.floor) === form.building && String(room.floor) === String(form.floor));
  const displayBuilding = key => canonicalBuilding(key) === BUILDING_B ? labels.buildingB : labels.buildingA;
  const displayCategory = key => key === 'Architecture' ? labels.architecture : key === 'MEP' ? labels.mep : labels.structure;
  const displayType = key => ({ ri: labels.typeRI, inspection: labels.typeInspection, defect: labels.typeDefect, general: labels.typeGeneral })[key] || labels.typeGeneral;
  const displayStatus = key => ({ pending: labels.statusPending, completed: labels.statusCompleted, expired: labels.statusExpired, archived: labels.statusArchived })[key] || labels.statusPending;
  const lifecycle = doc => {
    if (doc.documentType !== 'ri' || doc.status === 'completed' || doc.status === 'archived') return doc.status;
    const elapsed = dayDifference(doc.scheduledDate || doc.date, today);
    if (elapsed >= 2) return 'expired';
    return 'pending';
  };
  const reminders = docs.filter(doc => doc.documentType === 'ri' && lifecycle(doc) === 'pending' && dayDifference(doc.scheduledDate || doc.date, today) >= 0);

  const resetPathTo = level => setPath(previous => ({ building: previous.building, floor: level === 'floor' || level === 'room' || level === 'category' ? previous.floor : null, room: level === 'room' || level === 'category' ? previous.room : null, category: level === 'category' ? previous.category : null }));
  const chooseBuilding = value => setPath({ building: value, floor: null, room: null, category: null });
  const chooseFloor = value => setPath(current => ({ ...current, floor: value, room: null, category: null }));
  const chooseRoom = value => setPath(current => ({ ...current, room: value, category: null }));
  const chooseCategory = value => setPath(current => ({ ...current, category: value }));
  const docsAtPath = docs.filter(doc => doc.building === path.building && String(doc.floor) === String(path.floor) && String(doc.roomNumber) === String(path.room) && doc.category === path.category)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.reference || '').localeCompare(String(b.reference || ''), undefined, { numeric: true }));

  const openUpload = () => {
    const nextReference = `DOC-${today.slice(0, 4)}-${String(docs.length + 1).padStart(4, '0')}`;
    const initialBuilding = BUILDING_A;
    const initialFloor = floorsForBuilding(initialBuilding)[0] || '1';
    const initialRoom = rooms.find(room => canonicalBuilding(room.building, room.floor) === initialBuilding && String(room.floor) === initialFloor)?.roomNumber || '';
    setForm({ documentType: 'general', building: initialBuilding, floor: initialFloor, roomNumber: initialRoom, category: 'Architecture', reference: nextReference, scheduledDate: '', file: null });
    setFormError('');
    setUploadOpen(true);
  };
  const submitUpload = async event => {
    event.preventDefault();
    if (savingUpload) return;
    if (!form.file || !form.floor || !form.roomNumber || !form.category || (form.documentType === 'ri' && (!form.scheduledDate || form.scheduledDate < today))) { setFormError(labels.required); return; }
    if (form.file.size > MAX_UPLOAD_BYTES) { setFormError(t.sync.fileTooLarge); return; }
    const documentRecord = { id: crypto.randomUUID(), name: form.file.name, reference: form.reference.trim() || `DOC-${today.replaceAll('-', '')}`, documentType: form.documentType, building: form.building, floor: String(form.floor), roomNumber: String(form.roomNumber), category: form.category, date: today, scheduledDate: form.documentType === 'ri' ? form.scheduledDate : null, status: 'pending', size: `${(form.file.size / 1024 / 1024).toFixed(2)} MB`, file: form.file };
    setDocs(current => [documentRecord, ...current]);
    setPath({ building: documentRecord.building, floor: documentRecord.floor, room: documentRecord.roomNumber, category: documentRecord.category });
    setSavingUpload(true);
    try {
      const saved = await onRecordSaved(docToHistoryRow(documentRecord), form.file);
      if (saved) setDocs(current => current.map(doc => doc.id === documentRecord.id ? { ...doc, file_url: saved.file_url || doc.file_url, folder_path: saved.folder_path || doc.folder_path, file_name: saved.file_name || doc.file_name } : doc));
      if (saved?._savedToBackend && saved.file_url) showToast(t.sync.uploadSuccessLink, saved.file_url);
      else if (saved?._savedToBackend) showToast(t.sync.uploadSuccess);
      else showToast(t.sync.uploadFailed);
      setUploadOpen(false);
    } catch (error) {
      console.error('Document upload failed:', error);
      setFormError(t.sync.uploadFailed);
    } finally {
      setSavingUpload(false);
    }
  };
  const handleDownload = doc => {
    if (doc.file) { const url = URL.createObjectURL(doc.file); const anchor = document.createElement('a'); anchor.href = url; anchor.download = doc.name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
    else if (doc.file_url) window.open(doc.file_url, '_blank', 'noopener,noreferrer');
    else downloadFile(`${doc.name}\n${labels.referenceNumber}: ${doc.reference}\n${labels.category}: ${displayCategory(doc.category)}\n${labels.date}: ${doc.date}`, `${doc.name}.txt`);
  };
  const handlePreview = doc => setSelectedDoc({ ...doc, previewUrl: doc.file ? URL.createObjectURL(doc.file) : null });
  const markComplete = doc => {
    const updated = { ...doc, status: 'completed', completedAt: today };
    setDocs(current => current.map(item => item.id === doc.id ? updated : item));
    if (canEdit) void onRecordSaved(docToHistoryRow(updated, { status: 'completed' }));
  };
  const submitReason = event => {
    event.preventDefault();
    if (!reasonText.trim()) return;
    const updated = { ...reasonDoc, status: 'archived', reasonReport: reasonText.trim(), archivedAt: today, archivedBy: userName };
    setDocs(current => current.map(item => item.id === reasonDoc.id ? updated : item));
    if (canEdit) void onRecordSaved(docToHistoryRow(updated, { status: 'archived', reason: reasonText.trim() }));
    setReasonDoc(null); setReasonText('');
  };

  const floorsAtPath = path.building ? floorsForBuilding(path.building) : [];
  const roomNumbersAtPath = path.building && path.floor ? [...new Set([
    ...rooms.filter(room => canonicalBuilding(room.building, room.floor) === path.building && String(room.floor) === String(path.floor)).map(room => String(room.roomNumber)),
    ...docs.filter(doc => canonicalBuilding(doc.building, doc.floor) === path.building && String(doc.floor) === String(path.floor)).map(doc => String(doc.roomNumber)),
  ])].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
  const drillItems = !path.building
    ? buildingKeys.map(value => ({ value, label: displayBuilding(value), count: docs.filter(doc => doc.building === value).length }))
    : !path.floor
      ? floorsAtPath.map(value => ({ value, label: `${labels.floor} ${value}`, count: docs.filter(doc => doc.building === path.building && String(doc.floor) === value).length }))
      : !path.room
        ? roomNumbersAtPath.map(value => ({ value, label: `${labels.room} ${value}`, count: docs.filter(doc => doc.building === path.building && String(doc.floor) === String(path.floor) && String(doc.roomNumber) === value).length }))
        : !path.category
          ? ['Architecture', 'MEP', 'Structure'].map(value => ({ value, label: displayCategory(value), count: docs.filter(doc => doc.building === path.building && String(doc.floor) === String(path.floor) && String(doc.roomNumber) === String(path.room) && doc.category === value).length }))
          : [];
  const selectDrillItem = value => !path.building ? chooseBuilding(value) : !path.floor ? chooseFloor(value) : !path.room ? chooseRoom(value) : chooseCategory(value);

  return <div className="space-y-4 sm:space-y-6">
    {reminders.length > 0 && <aside role="status" className="rounded-xl border border-amber-400/50 bg-amber-950/50 p-4 text-amber-100 shadow-lg"><div className="flex items-start gap-3"><Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"/><div><h2 className="text-sm font-bold">{labels.morningWarning}</h2><ul className="mt-2 space-y-1 text-xs">{reminders.map(doc => { const elapsed = dayDifference(doc.scheduledDate || doc.date, today); return <li key={doc.id}>{doc.reference} · {doc.name} · {elapsed === 0 ? labels.dueToday : labels.reminderDay.replace('{day}', String(elapsed))}</li>; })}</ul></div></div></aside>}
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4"><div><h2 className="text-base font-bold text-slate-100">{labels.title}</h2><p className="mt-1 text-xs text-slate-400">{labels.subtitle}</p></div>{canEdit && <button type="button" onClick={openUpload} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"><Upload className="h-4 w-4"/>{labels.upload}</button>}</header>

    <nav aria-label={lang === 'th' ? 'ลำดับตำแหน่งเอกสาร' : 'Document location hierarchy'} className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-xs">
      {[['building', labels.building, path.building], ['floor', labels.floor, path.floor], ['room', labels.room, path.room], ['category', labels.category, path.category]].map(([level, label, value], index) => <React.Fragment key={level}>{index > 0 && <span className="px-1 text-slate-500">›</span>}<button type="button" disabled={!path[level]} onClick={() => resetPathTo(level)} className={`rounded-md px-2 py-1.5 ${path[level] ? 'text-emerald-300 hover:bg-slate-700' : 'text-slate-500'}`}>{value ? (level === 'building' ? displayBuilding(value) : level === 'category' ? displayCategory(value) : `${label} ${value}`) : label}</button></React.Fragment>)}
    </nav>

    {!path.category ? <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{drillItems.map(item => <button type="button" key={item.value} onClick={() => selectDrillItem(item.value)} className="flex min-h-20 items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-left hover:border-emerald-500/60 hover:bg-slate-800"><span className="flex min-w-0 items-center gap-3"><FolderKanban className="h-5 w-5 shrink-0 text-emerald-400"/><b className="truncate text-sm text-slate-100">{item.label}</b></span><span className="shrink-0 rounded-full bg-slate-900 px-2 py-1 text-[10px] text-slate-400">{item.count}</span></button>)}</section>
      : <section className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/70">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 p-4"><h3 className="text-sm font-bold text-slate-100">{displayBuilding(path.building)} · {labels.floor} {path.floor} · {labels.room} {path.room} · {displayCategory(path.category)}</h3><span className="text-[10px] text-slate-400">{labels.referenceNumber} / {labels.date}</span></div>
        {!docsAtPath.length ? <p className="p-6 text-center text-xs text-slate-400">{labels.empty}</p> : <div className="divide-y divide-slate-700/70">{docsAtPath.map(doc => {
          const status = lifecycle(doc);
          return <article key={doc.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="flex min-w-0 items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"/><div className="min-w-0"><h4 className="break-words text-xs font-semibold text-slate-100">{doc.name}</h4><p className="mt-1 break-words text-[10px] text-slate-400">{labels.referenceNumber}: {doc.reference} · {labels.date}: {doc.date} · {displayType(doc.documentType)}</p>{doc.documentType === 'ri' && <p className="mt-1 text-[10px] text-slate-400">{labels.scheduledDate}: {doc.scheduledDate} · {labels.statusLabel}: {displayStatus(status)}</p>}{doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[10px] font-semibold text-sky-300 underline">{labels.openFile}</a>}{doc.folder_path && <p className="mt-1 break-all text-[10px] text-slate-500">{labels.folderPath}: {doc.folder_path}</p>}{doc.reasonReport && <p className="mt-2 rounded-md border border-slate-700 bg-slate-900 p-2 text-[10px] text-slate-300">{labels.archivedReason}: {doc.reasonReport}</p>}</div></div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'expired' ? 'bg-red-500/15 text-red-300' : status === 'completed' ? 'bg-emerald-500/15 text-emerald-300' : status === 'archived' ? 'bg-slate-600/30 text-slate-300' : 'bg-amber-500/15 text-amber-300'}`}>{displayStatus(status)}</span><button type="button" onClick={() => handlePreview(doc)} className="rounded-md bg-slate-700 p-2 text-slate-200 hover:bg-slate-600" aria-label={labels.documentPreview} title={labels.documentPreview}><Eye className="h-4 w-4"/></button><button type="button" onClick={() => handleDownload(doc)} className="rounded-md bg-slate-700 p-2 text-slate-200 hover:bg-slate-600" aria-label={t.common.export} title={t.common.export}><Download className="h-4 w-4"/></button>{canEdit && status === 'pending' && doc.documentType === 'ri' && <button type="button" onClick={() => markComplete(doc)} className="rounded-md bg-emerald-700 px-2.5 py-2 text-[10px] font-semibold text-white hover:bg-emerald-600">{labels.markComplete}</button>}{canEdit && status === 'expired' && <button type="button" onClick={() => { setReasonDoc(doc); setReasonText(doc.reasonReport || ''); }} className="rounded-md bg-red-700 px-2.5 py-2 text-[10px] font-semibold text-white hover:bg-red-600">{labels.archive}</button>}</div>
          </article>;
        })}</div>}
      </section>}

    {uploadOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-5"><form onSubmit={submitUpload} className="my-auto max-h-[95vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl sm:p-6"><div className="flex items-center justify-between gap-3"><h3 className="text-base font-bold text-slate-100">{labels.upload}</h3><button type="button" onClick={() => setUploadOpen(false)} className="rounded-lg bg-slate-700 p-2 text-slate-300" aria-label={t.common.close}><X className="h-4 w-4"/></button></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs text-slate-300"><span>{labels.type}</span><select value={form.documentType} onChange={event => setForm(current => ({ ...current, documentType: event.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100"><option value="general">{labels.typeGeneral}</option><option value="ri">{labels.typeRI}</option><option value="inspection">{labels.typeInspection}</option><option value="defect">{labels.typeDefect}</option></select></label>
      <label className="space-y-1 text-xs text-slate-300"><span>{labels.reference}</span><input required value={form.reference} onChange={event => setForm(current => ({ ...current, reference: event.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100"/></label>
      <label className="space-y-1 text-xs text-slate-300"><span>{labels.building}</span><select value={form.building} onChange={event => { const building = event.target.value; const floor = floorsForBuilding(building)[0] || ''; const roomNumber = rooms.find(room => canonicalBuilding(room.building, room.floor) === building && String(room.floor) === floor)?.roomNumber || ''; setForm(current => ({ ...current, building, floor, roomNumber: String(roomNumber) })); }} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100">{buildingKeys.map(building => <option key={building} value={building}>{displayBuilding(building)}</option>)}</select></label>
      <label className="space-y-1 text-xs text-slate-300"><span>{labels.floor}</span><select value={form.floor} onChange={event => { const floor = event.target.value; setForm(current => ({ ...current, floor, roomNumber: String(rooms.find(room => canonicalBuilding(room.building, room.floor) === current.building && String(room.floor) === floor)?.roomNumber || '') })); }} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100">{floors.map(floor => <option key={floor} value={floor}>{labels.floor} {floor}</option>)}</select></label>
      <label className="space-y-1 text-xs text-slate-300"><span>{labels.room}</span><select required value={form.roomNumber} onChange={event => setForm(current => ({ ...current, roomNumber: event.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100">{roomOptions.map(room => <option key={room.id} value={room.roomNumber}>{labels.room} {room.roomNumber}</option>)}</select></label>
      <label className="space-y-1 text-xs text-slate-300"><span>{labels.category}</span><select value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100"><option value="Architecture">{labels.architecture}</option><option value="MEP">{labels.mep}</option><option value="Structure">{labels.structure}</option></select></label>
      {form.documentType === 'ri' && <label className="space-y-1 text-xs text-slate-300 sm:col-span-2"><span>{labels.scheduledDate} *</span><input type="date" required min={today} value={form.scheduledDate} onChange={event => setForm(current => ({ ...current, scheduledDate: event.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100"/></label>}
      <label className="space-y-1 text-xs text-slate-300 sm:col-span-2"><span>{labels.file}</span><input type="file" accept="application/pdf,image/*" required disabled={savingUpload} onChange={event => { const file = event.target.files?.[0] || null; if (file && file.size > MAX_UPLOAD_BYTES) { setForm(current => ({ ...current, file: null })); setFormError(t.sync.fileTooLarge); event.target.value = ''; return; } setFormError(''); setForm(current => ({ ...current, file })); }} className="block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:text-xs file:text-white disabled:opacity-50"/></label></div>
      {savingUpload && <div role="status" className="rounded-lg border border-sky-500/30 bg-sky-950/30 px-3 py-2 text-xs text-sky-200"><span className="mb-2 block">{t.sync.uploading}</span><div className="h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-2/3 animate-pulse rounded-full bg-sky-400" /></div></div>}{formError && <p role="alert" className="text-xs font-semibold text-red-300">{formError}</p>}<div className="flex flex-col-reverse gap-2 border-t border-slate-700 pt-3 sm:flex-row sm:justify-end"><button type="button" disabled={savingUpload} onClick={() => setUploadOpen(false)} className="rounded-lg bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 disabled:opacity-50">{labels.cancel}</button><button type="submit" disabled={savingUpload} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">{savingUpload ? t.sync.uploading : labels.save}</button></div>
    </form></div>}

    {reasonDoc && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-3 sm:p-5"><form onSubmit={submitReason} className="w-full max-w-lg space-y-4 rounded-2xl border border-red-900 bg-slate-800 p-5 shadow-2xl sm:p-6"><div><h3 className="text-base font-bold text-red-200">{labels.expiredTitle}</h3><p className="mt-1 text-xs text-slate-400">{labels.expiredDescription}</p><p className="mt-2 text-xs text-slate-300">{reasonDoc.reference} · {reasonDoc.name}</p></div><label className="block space-y-1.5 text-xs font-semibold text-slate-200"><span>{labels.reasonLabel} *</span><textarea autoFocus required minLength={5} value={reasonText} onChange={event => setReasonText(event.target.value)} placeholder={labels.reasonPlaceholder} rows={5} className="w-full resize-y rounded-lg border border-slate-600 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-red-400 focus:outline-none"/></label><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setReasonDoc(null)} className="rounded-lg bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200">{labels.cancel}</button><button type="submit" disabled={reasonText.trim().length < 5} className="rounded-lg bg-red-700 px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{labels.archive}</button></div></form></div>}

    {selectedDoc && <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/75 p-3 sm:p-5"><section role="dialog" aria-modal="true" aria-label={labels.documentPreview} className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-800"><header className="flex items-center justify-between gap-3 border-b border-slate-700 p-4"><div className="min-w-0"><h3 className="truncate text-sm font-bold text-slate-100">{labels.documentPreview}</h3><p className="truncate text-[10px] text-slate-400">{selectedDoc.reference} · {selectedDoc.name}</p></div><button type="button" onClick={() => setSelectedDoc(null)} className="rounded-lg bg-slate-700 p-2 text-slate-200"><X className="h-4 w-4"/></button></header><div className="grid min-h-56 place-items-center bg-slate-950 p-3 text-center text-xs text-slate-400 sm:min-h-80">{selectedDoc.previewUrl && selectedDoc.file?.type.startsWith('image/') ? <img src={selectedDoc.previewUrl} alt={selectedDoc.name} className="max-h-[65vh] max-w-full object-contain"/> : selectedDoc.previewUrl && selectedDoc.file?.type === 'application/pdf' ? <iframe title={selectedDoc.name} src={selectedDoc.previewUrl} className="h-[65vh] w-full rounded bg-white"/> : <div><FileText className="mx-auto mb-2 h-9 w-9 text-emerald-400"/><p>{selectedDoc.name}</p><p className="mt-1">{displayType(selectedDoc.documentType)} · {displayStatus(lifecycle(selectedDoc))}</p></div>}</div><footer className="flex flex-col-reverse gap-2 border-t border-slate-700 p-3 sm:flex-row sm:justify-end"><button onClick={() => setSelectedDoc(null)} className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200">{t.common.close}</button><button onClick={() => { handleDownload(selectedDoc); setSelectedDoc(null); }} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">{t.common.export}</button></footer></section></div>}
  </div>;
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
function HandoverDashboardView({ rooms, selectedFloor = 'all', selectedStatusFilter = 'all', onInspectRoom, showToast }) {
  const displayedRooms = rooms.filter(room => (selectedFloor === 'all' || room.floor.toString() === selectedFloor) && (selectedStatusFilter === 'all' || room.status === selectedStatusFilter));
  const displayedFloors = selectedFloor === 'all' ? [8, 7, 6, 5, 4, 3, 2, 1] : [Number(selectedFloor)];
  const exportCsv = () => {
    const rows = [['Room', 'Floor', 'Type', 'Status', 'Progress', 'Defects'], ...displayedRooms.map(room => [room.roomNumber, room.floor, room.type, room.status, `${room.progress}%`, room.defectsCount])];
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
        {displayedFloors.map(floor => (
          <div key={floor} className="flex items-center gap-3">
            <span className="w-14 text-xs font-bold text-slate-300">ชั้น {floor}</span>
            <div className="flex-1 grid grid-cols-[repeat(27,minmax(0,1fr))] gap-1">
              {displayedRooms.filter(r => r.floor === floor).map(room => (
                <div
                  key={room.id}
                  onClick={() => onInspectRoom(room)}
                  title={`ห้อง ${room.roomNumber}: ${room.status}`}
                  className={`h-7 rounded cursor-pointer transition-all hover:scale-125 flex items-center justify-center text-[9px] font-bold ${
                    room.status === 'ready' 
                      ? 'bg-emerald-500 text-slate-950' 
                      : room.status === 'defect' 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : room.status === 'pending' ? 'bg-slate-500 text-white' : 'bg-blue-500 text-white'
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
  if (status === 'pending') {
    return <span className="rounded border border-slate-500/30 bg-slate-500/20 px-2 py-0.5 text-[10px] font-bold text-slate-300">{t.status.pending}</span>;
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
const TASK_PLAN_POSITIONS = [
  [15, 50], [85, 48], [72, 43], [80, 37], [84, 53], [65, 32], [30, 43],
  [51, 38], [52, 53], [50, 11], [42, 40], [33, 35], [72, 86],
];

function RoomPlan({ room, t }) {
  const markerColor = (status) => status === 'passed' ? '#10b981' : status === 'defect' ? '#ef4444' : status === 'inProgress' ? '#f59e0b' : '#64748b';
  return <section className="space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-4">
    <div><h4 className="text-sm font-bold text-slate-100">Room Plan Task Map</h4><p className="text-[10px] text-slate-400">Attached floor plan · numbered markers show task locations</p></div>
    <div className="mx-auto max-h-[560px] max-w-[500px] overflow-hidden rounded-lg bg-slate-900">
      <div className="relative aspect-[408/454] w-full">
        <img src={roomPlanImage} alt="Room plan with inspection task markers" className="absolute inset-0 h-full w-full object-contain" />
        {TASKS_13.map((task, index) => {
        const [x, y] = TASK_PLAN_POSITIONS[index];
        const status = room.tasks?.[task] || 'pending';
        return <span key={task} title={`${index + 1}. ${task}: ${status}`} className="absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[10px] font-extrabold text-white shadow-md" style={{ left: `${x}%`, top: `${y}%`, backgroundColor: markerColor(status) }}>{index + 1}</span>;
      })}
      </div>
    </div>
    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">{[['passed', '#10b981'], ['defect', '#ef4444'], ['inProgress', '#f59e0b'], ['pending', '#64748b']].map(([key, color]) => <span key={key} className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{t.status[key]}</span>)}</div>
  </section>;
}

function RoomDetailModal({ room, t, lang, records = [], showToast, onClose }) {
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [loadingEvidence, setLoadingEvidence] = useState('');
  useEffect(() => () => {
    if (evidencePreview?.ownedUrl) URL.revokeObjectURL(evidencePreview.url);
  }, [evidencePreview]);

  const openEvidence = async (record, kind) => {
    const key = `${record.id}:${kind}`;
    setLoadingEvidence(key);
    try {
      let blob = null;
      try { blob = await loadInspectionEvidence(record.evidence_id || record.id, kind); }
      catch (storageError) {
        if (!(record.file_url || record.photo?.file_url || record.riDocument?.file_url)) throw storageError;
      }
      const remoteUrl = record.file_url || record.photo?.file_url || record.riDocument?.file_url || '';
      const metadata = kind === 'photo' ? record.photo : record.riDocument;
      if (!blob && remoteUrl) {
        setEvidencePreview({ url: remoteUrl, type: 'remote', name: metadata?.name || (kind === 'photo' ? 'inspection-photo' : 'RI-document'), kind, ownedUrl: false, remote: true });
        return;
      }
      if (!blob) {
        showToast?.(lang === 'th' ? 'ไม่พบไฟล์หลักฐาน' : 'Evidence file is unavailable');
        return;
      }
      const url = URL.createObjectURL(blob);
      setEvidencePreview({ url, type: blob.type || metadata?.type || '', name: metadata?.name || (kind === 'photo' ? 'inspection-photo' : 'RI-document'), kind, ownedUrl: true });
    } catch (error) {
      console.error('Unable to open inspection evidence:', error);
      showToast?.(lang === 'th' ? 'ไม่สามารถเปิดไฟล์หลักฐานได้' : 'Could not open the evidence file');
    } finally {
      setLoadingEvidence('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-5xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
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

        {/* Room data is read-only in this view. */}
        <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-700">
          <span className="text-xs font-medium text-slate-300">สถานะหลักของห้อง (Overall Room Status)</span>
          <StatusBadge status={room.status} t={t} />
        </div>

        <RoomPlan room={room} t={t} />

        {/* 13 Tasks Checklist Toggles */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 mb-2">สถานะงาน 13 รายการ (13-Task Inspection Checklist)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TASKS_13.map((tName, index) => {
              const taskStatus = room.tasks?.[tName] || 'pending';
              const isPassed = taskStatus === 'passed';
              const taskRecords = records.filter(record => String(record.roomNumber) === String(room.roomNumber) && record.task === tName);
              const photoRecord = taskRecords.find(record => record.photo);
              const riRecord = taskRecords.find(record => record.riDocument);
              return (
                <div
                  key={tName}
                  className={`p-2.5 rounded-lg border text-xs ${
                    isPassed 
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                      : taskStatus === 'defect' ? 'bg-red-950/30 border-red-500/40 text-red-300' : taskStatus === 'pending' ? 'bg-slate-900/40 border-slate-700 text-slate-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium"><span className="mr-1 font-bold">{index + 1}.</span>{tName}</span>
                    <StatusBadge status={taskStatus} t={t} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" disabled={!photoRecord || loadingEvidence === `${photoRecord?.id}:photo`} onClick={() => photoRecord && openEvidence(photoRecord, 'photo')} className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-300 enabled:hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40" title={photoRecord ? 'View Photos' : 'No photo evidence'}><Eye className="h-3 w-3" />View Photos</button>
                    <button type="button" disabled={!riRecord || loadingEvidence === `${riRecord?.id}:ri`} onClick={() => riRecord && openEvidence(riRecord, 'ri')} className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-300 enabled:hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40" title={riRecord ? 'View RI Document' : 'No RI document'}><FileText className="h-3 w-3" />View RI Document</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-700 pt-3"><button onClick={onClose} className="rounded-xl bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-600">{t.common.close}</button></div>
      </div>
      {evidencePreview && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4" onClick={() => setEvidencePreview(null)}>
        <section role="dialog" aria-modal="true" aria-label="Evidence Preview" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-900 shadow-2xl" onClick={event => event.stopPropagation()}>
          <header className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3"><div className="min-w-0"><h3 className="text-sm font-bold text-slate-100">Evidence Preview</h3><p className="truncate text-xs text-slate-400">{evidencePreview.name}</p></div><button type="button" onClick={() => setEvidencePreview(null)} className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700" aria-label="Close preview"><X className="h-4 w-4" /></button></header>
          <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-3">
            {evidencePreview.remote ? <iframe title={evidencePreview.name} src={evidencePreview.url} className="h-[75vh] w-full rounded-lg bg-white" /> : evidencePreview.type.startsWith('image/') ? <img src={evidencePreview.url} alt={evidencePreview.name} className="mx-auto max-h-[75vh] max-w-full object-contain" /> : evidencePreview.type === 'application/pdf' || evidencePreview.name.toLowerCase().endsWith('.pdf') ? <iframe title={evidencePreview.name} src={evidencePreview.url} className="h-[75vh] w-full rounded-lg bg-white" /> : <div className="grid h-48 place-items-center text-center"><div><FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" /><a href={evidencePreview.url} download={evidencePreview.name} className="text-sm font-semibold text-sky-300 underline">Open or download file</a></div></div>}
          </div>
          <footer className="flex justify-end border-t border-slate-700 px-4 py-3"><a href={evidencePreview.url} download={evidencePreview.name} target="_blank" rel="noreferrer" className="mr-auto self-center text-xs text-sky-300 underline">Open or download file</a><button onClick={() => setEvidencePreview(null)} className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-600">{t.common.close}</button></footer>
        </section>
      </div>}
    </div>
  );
}
