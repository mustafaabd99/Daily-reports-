
export interface ManpowerRow {
  jobTitle: string;
  gps: number;
  ops: number;
  wps: number;
  pp: number;
  fsf: number;
  ws1: number;
  ws2: number;
  ogm: number;
  others: number;
  total: number;
}

export interface Activity {
  id: string;
  description: string;
  type: 'PM' | 'CM' | '';
  permitNo: string;
  discipline: string;
  equipNo: string;
  location: string;
  status: 'مكتمل' | 'قيد التنفيذ' | 'متوقف' | '';
  workers: string;
  startTime: string;
  endTime: string;
  remarks: string;
}

export interface TomorrowActivity {
  id: string;
  description: string;
  type: 'PM' | 'CM' | '';
  permitNo: string;
  discipline: string;
  equipNo: string;
  location: string;
  priority: 'عالية' | 'متوسطة' | 'منخفضة' | '';
  workers: string;
  startTime: string;
  endTime: string;
  remarks: string;
}

export interface HSEInfo {
  weatherCondition: string;
  temperature: string;
  windSpeed: string;
  toolboxTalk: boolean;
  remarks: string;
}

export interface Report {
  id: string;
  timestamp: number;
  projectName: string;
  reportDate: string;
  reportedByName: string;
  reportedByDept: string;
  reportingToDept: string;
  reportingToManager: string;
  generalNote: string;
  hseInfo?: HSEInfo;
  manpower: ManpowerRow[];
  activities: Activity[];
  tomorrowPlan: TomorrowActivity[];
  adminNotes?: string;
}

export type ViewState = 'HOME' | 'FORM' | 'ADMIN' | 'ABOUT' | 'PRINT';

export const JOB_TITLES = [
  "Maintenance Supervisor",
  "Senior Engineer",
  "Maintenance Engineer",
  "Mechanical Technician",
  "Electrical Technician",
  "Instrument Technician",
  "HSE Officer",
  "Operations Supervisor",
  "Field Operator",
  "Control Room Operator"
];

export const DEPARTMENTS = [
  "الهندسة",
  "الصيانة",
  "التشغيل",
  "الأمان",
  "الجودة"
];

export const DISCIPLINES = [
  "كهرباء (Electrical)",
  "ميكانيك (Mechanical)",
  "آلات دقيقة (Instrument)",
  "أخرى (Other)"
];
