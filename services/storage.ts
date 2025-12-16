
import { Report, JOB_TITLES } from '../types';

const STORAGE_KEY = 'oil_co_daily_reports_v2';

// --- SEED DATA FOR TESTING ---
const generateSeedData = (): Report[] => {
  const manpowerTemplate = JOB_TITLES.map(title => ({
    jobTitle: title, gps: 0, ops: 0, wps: 0, pp: 0, fsf: 0, ws1: 0, ws2: 0, ogm: 0, others: 0, total: 0
  }));

  // Helper to set manpower
  const setManpower = (rows: any[], titleIndex: number, location: string, count: number) => {
    const newRows = JSON.parse(JSON.stringify(rows));
    if (newRows[titleIndex]) {
      newRows[titleIndex][location.toLowerCase()] = count;
      newRows[titleIndex].total = count;
    }
    return newRows;
  };

  const report1Manpower = setManpower(manpowerTemplate, 3, 'ops', 4); // 4 Mechanical Techs at OPS
  
  return [
    {
      id: "RPT-TEST-001",
      timestamp: Date.now(),
      projectName: "CPF Pump Maintenance / صيانة مضخات المحطة المركزية",
      reportDate: new Date().toISOString().split('T')[0],
      reportedByName: "Ahmed Hassan",
      reportedByDept: "الصيانة",
      reportingToDept: "Operations",
      reportingToManager: "Mr. Liu",
      generalNote: "Safe execution of all tasks. Waiting for gasket spare parts for P-102.",
      hseInfo: {
        weatherCondition: "Clear / مشمس",
        temperature: "35",
        windSpeed: "12",
        toolboxTalk: true,
        remarks: "Reminder about hydration"
      },
      manpower: report1Manpower,
      activities: [
        {
          id: "act-1", description: "Preventive Maintenance for Crude Oil Pump P-101 A", type: "PM", permitNo: "PTW-2024-889", 
          discipline: "ميكانيك (Mechanical)", equipNo: "P-101-A", location: "OPS", status: "مكتمل", 
          workers: "4", startTime: "08:00", endTime: "14:00", remarks: "Oil changed"
        },
        {
          id: "act-2", description: "Alignment check for Water Injection Pump", type: "CM", permitNo: "PTW-2024-890", 
          discipline: "ميكانيك (Mechanical)", equipNo: "WIP-205", location: "OPS", status: "قيد التنفيذ", 
          workers: "2", startTime: "14:00", endTime: "16:00", remarks: "High vibration detected"
        }
      ],
      tomorrowPlan: [
        {
          id: "plan-1", description: "Continue alignment for WIP-205", type: "CM", permitNo: "PTW-2024-890",
          discipline: "ميكانيك (Mechanical)", equipNo: "WIP-205", location: "OPS", priority: "عالية",
          workers: "2", startTime: "07:00", endTime: "12:00", remarks: ""
        }
      ],
      adminNotes: "Good progress. Please expedite the vibration analysis report."
    },
    {
      id: "RPT-TEST-002",
      timestamp: Date.now() - 86400000,
      projectName: "Well Pad 5 Electrical Inspection / فحص كهرباء الآبار",
      reportDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      reportedByName: "Ali Bassem",
      reportedByDept: "الكهرباء",
      reportingToDept: "Engineering",
      reportingToManager: "Eng. Sarah",
      generalNote: "Weather conditions (High Wind) delayed lifting operations in the morning.",
      hseInfo: {
        weatherCondition: "Windy / عاصف",
        temperature: "28",
        windSpeed: "45",
        toolboxTalk: true,
        remarks: "Lifting stopped due to wind > 30km/h"
      },
      manpower: setManpower(manpowerTemplate, 4, 'wps', 2), // 2 Electrical Techs at WPS
      activities: [
        {
          id: "act-3", description: "Cable tray repair and grounding check", type: "PM", permitNo: "PTW-2024-750", 
          discipline: "كهرباء (Electrical)", equipNo: "JB-501", location: "WPS", status: "مكتمل", 
          workers: "2", startTime: "09:00", endTime: "15:00", remarks: "Replaced corroded bolts"
        }
      ],
      tomorrowPlan: [
         {
          id: "plan-2", description: "Terminate cables for new lighting pole", type: "CM", permitNo: "NEW",
          discipline: "كهرباء (Electrical)", equipNo: "LP-09", location: "WPS", priority: "متوسطة",
          workers: "2", startTime: "08:00", endTime: "16:00", remarks: ""
        }
      ]
    }
  ];
};

export const saveReport = (report: Omit<Report, 'id' | 'timestamp'>): boolean => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const reports: Report[] = existingData ? JSON.parse(existingData) : [];
    
    const newReport: Report = {
      ...report,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    reports.unshift(newReport); // Add to top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return true;
  } catch (e) {
    console.error("Storage failed", e);
    return false;
  }
};

export const updateReport = (report: Report): boolean => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const reports: Report[] = existingData ? JSON.parse(existingData) : [];
    
    const index = reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      reports[index] = report;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      return true;
    }
    return false;
  } catch (e) {
    console.error("Update failed", e);
    return false;
  }
};

export const getReports = (): Report[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    
    // If no data exists, load seed data
    console.log("No reports found. Loading seed data for testing...");
    const seedData = generateSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;

  } catch {
    return [];
  }
};

// Define ExcelJS interface since we load it via CDN
declare global {
  interface Window {
    ExcelJS: any;
  }
}

/**
 * Helper function to render a single report into a worksheet at a specific starting row.
 * Returns the number of the next available row.
 */
const renderReportToSheet = (sheet: any, report: Report, startRow: number): number => {
    const borderStyle = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    const titleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }; // Blue
    const sectionFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }; // Light Blue
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
    const subHeaderFont = { bold: true, color: { argb: 'FF1E40AF' }, size: 11 };

    let currentRow = startRow;

    // 1. TITLE BLOCK
    sheet.mergeCells(`A${currentRow}:K${currentRow+1}`);
    const titleCell = sheet.getCell(`A${currentRow}`);
    titleCell.value = "DAILY PROGRESS REPORT / التقرير اليومي";
    titleCell.fill = titleFill;
    titleCell.font = headerFont;
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow += 3;

    // 2. HEADER INFO
    sheet.mergeCells(`A${currentRow}:E${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = `Project: ${report.projectName}`;
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    
    sheet.mergeCells(`G${currentRow}:K${currentRow}`);
    sheet.getCell(`G${currentRow}`).value = `Date: ${report.reportDate}`;
    sheet.getCell(`G${currentRow}`).alignment = { horizontal: 'right' };
    currentRow++;

    sheet.mergeCells(`A${currentRow}:E${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = `Reported By: ${report.reportedByName} (${report.reportedByDept})`;
    
    sheet.mergeCells(`G${currentRow}:K${currentRow}`);
    sheet.getCell(`G${currentRow}`).value = `Ref: ${report.id.substring(0,8)}`;
    sheet.getCell(`G${currentRow}`).alignment = { horizontal: 'right' };
    currentRow += 2;

    // 3. HSE STRIP
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const hseHeader = sheet.getCell(`A${currentRow}`);
    hseHeader.value = "HSE & WEATHER / السلامة والطقس";
    hseHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF64748B' } }; // Slate 500
    hseHeader.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    hseHeader.alignment = { horizontal: 'center' };
    currentRow++;

    const hseRow = sheet.getRow(currentRow);
    hseRow.values = [
        'Weather:', report.hseInfo?.weatherCondition || '-', '',
        'Temp:', `${report.hseInfo?.temperature || '-'} C`, '',
        'Wind:', `${report.hseInfo?.windSpeed || '-'} km/h`, '',
        'TBT:', report.hseInfo?.toolboxTalk ? 'Yes' : 'No'
    ];
    // Merge for spacing
    sheet.mergeCells(`B${currentRow}:C${currentRow}`);
    sheet.mergeCells(`E${currentRow}:F${currentRow}`);
    sheet.mergeCells(`H${currentRow}:I${currentRow}`);
    sheet.mergeCells(`K${currentRow}:K${currentRow}`); // TBT value
    
    // Style HSE Row
    for(let c=1; c<=11; c++) {
        const cell = sheet.getCell(currentRow, c);
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center' };
        if([1,4,7,10].includes(c)) cell.font = { bold: true, color: { argb: 'FF64748B' } };
    }
    currentRow += 2;

    // 4. MANPOWER TABLE
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const mpHeader = sheet.getCell(`A${currentRow}`);
    mpHeader.value = "01. MANPOWER SUMMARY / القوى العاملة";
    mpHeader.font = subHeaderFont;
    mpHeader.border = { bottom: {style:'thick', color: {argb: 'FF1E40AF'}} };
    currentRow++;

    const mpCols = ['Job Title', 'GPS', 'OPS', 'WPS', 'PP', 'FSF', 'WS1', 'WS2', 'OGM', 'Others', 'Total'];
    const mpHeadRow = sheet.getRow(currentRow);
    mpHeadRow.values = mpCols;
    mpHeadRow.eachCell((cell: any) => {
        cell.fill = sectionFill;
        cell.font = { bold: true, size: 9 };
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center' };
    });
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
    currentRow++;

    report.manpower.forEach(row => {
        if (row.total > 0) {
            const r = sheet.getRow(currentRow);
            r.values = [row.jobTitle, row.gps, row.ops, row.wps, row.pp, row.fsf, row.ws1, row.ws2, row.ogm, row.others, row.total];
            r.eachCell((cell: any, colNum: number) => {
                cell.border = borderStyle;
                cell.alignment = { horizontal: 'center' };
                if(colNum === 1) cell.alignment = { horizontal: 'left' };
                if(colNum === 11) cell.font = { bold: true };
            });
            currentRow++;
        }
    });
    // Total Row
    const totalMP = report.manpower.reduce((acc, r) => acc + r.total, 0);
    sheet.mergeCells(`A${currentRow}:J${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = "TOTAL MANPOWER";
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    sheet.getCell(`K${currentRow}`).value = totalMP;
    sheet.getCell(`K${currentRow}`).font = { bold: true, size: 11 };
    sheet.getCell(`K${currentRow}`).fill = sectionFill;
    sheet.getCell(`K${currentRow}`).border = borderStyle;
    currentRow += 2;

    // 5. ACTIVITIES TABLE
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const actHeader = sheet.getCell(`A${currentRow}`);
    actHeader.value = "02. ACTIVITIES LOG / سجل الأنشطة";
    actHeader.font = subHeaderFont;
    actHeader.border = { bottom: {style:'thick', color: {argb: 'FF1E40AF'}} };
    currentRow++;

    const actHeadRow = sheet.getRow(currentRow);
    actHeadRow.values = ['#', 'Description', '', '', '', '', 'Permit', 'Equip', 'Loc', 'Time', 'Status'];
    sheet.mergeCells(`B${currentRow}:F${currentRow}`);
    
    actHeadRow.eachCell((cell: any) => {
        cell.fill = sectionFill;
        cell.font = { bold: true, size: 9 };
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center' };
    });
    currentRow++;

    report.activities.forEach((act, idx) => {
        const r = sheet.getRow(currentRow);
        r.values = [idx+1, act.description, '', '', '', '', act.permitNo, act.equipNo, act.location, `${act.startTime}-${act.endTime}`, act.status];
        sheet.mergeCells(`B${currentRow}:F${currentRow}`);
        r.eachCell((cell: any) => {
            cell.border = borderStyle;
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        sheet.getCell(`B${currentRow}`).alignment = { horizontal: 'left', wrapText: true };
        currentRow++;
    });
    if(report.activities.length === 0) currentRow++;
    currentRow += 2;

    // 6. TOMORROW PLAN
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const planHeader = sheet.getCell(`A${currentRow}`);
    planHeader.value = "03. TOMORROW'S PLAN / خطة الغد";
    planHeader.font = subHeaderFont;
    planHeader.border = { bottom: {style:'thick', color: {argb: 'FF1E40AF'}} };
    currentRow++;

    const planHeadRow = sheet.getRow(currentRow);
    planHeadRow.values = ['#', 'Description', '', '', '', '', 'Priority', 'Equip', 'Loc', 'Time', ''];
    sheet.mergeCells(`B${currentRow}:F${currentRow}`);
    sheet.mergeCells(`J${currentRow}:K${currentRow}`);
    
    planHeadRow.eachCell((cell: any) => {
        cell.fill = sectionFill;
        cell.font = { bold: true, size: 9 };
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center' };
    });
    currentRow++;

    report.tomorrowPlan.forEach((plan, idx) => {
        const r = sheet.getRow(currentRow);
        r.values = [idx+1, plan.description, '', '', '', '', plan.priority, plan.equipNo, plan.location, `${plan.startTime}-${plan.endTime}`, ''];
        sheet.mergeCells(`B${currentRow}:F${currentRow}`);
        sheet.mergeCells(`J${currentRow}:K${currentRow}`);
        r.eachCell((cell: any) => {
            cell.border = borderStyle;
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        sheet.getCell(`B${currentRow}`).alignment = { horizontal: 'left', wrapText: true };
        currentRow++;
    });
    currentRow += 2;

    // 7. NOTES
    if(report.generalNote) {
        sheet.mergeCells(`A${currentRow}:K${currentRow}`);
        sheet.getCell(`A${currentRow}`).value = "04. GENERAL NOTES / ملاحظات عامة";
        sheet.getCell(`A${currentRow}`).font = subHeaderFont;
        currentRow++;
        
        sheet.mergeCells(`A${currentRow}:K${currentRow+2}`);
        const noteCell = sheet.getCell(`A${currentRow}`);
        noteCell.value = report.generalNote;
        noteCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        noteCell.border = borderStyle;
        currentRow += 4;
    }

    // 8. SIGNATURES
    currentRow++;
    const sigRow = currentRow;
    sheet.mergeCells(`A${sigRow}:C${sigRow}`);
    sheet.getCell(`A${sigRow}`).value = "Reported By";
    sheet.getCell(`A${sigRow}`).font = { bold: true, size: 10 };
    sheet.getCell(`A${sigRow}`).alignment = { horizontal: 'center' };

    sheet.mergeCells(`E${sigRow}:G${sigRow}`);
    sheet.getCell(`E${sigRow}`).value = "Verified By";
    sheet.getCell(`E${sigRow}`).font = { bold: true, size: 10 };
    sheet.getCell(`E${sigRow}`).alignment = { horizontal: 'center' };

    sheet.mergeCells(`I${sigRow}:K${sigRow}`);
    sheet.getCell(`I${sigRow}`).value = "Approved By";
    sheet.getCell(`I${sigRow}`).font = { bold: true, size: 10 };
    sheet.getCell(`I${sigRow}`).alignment = { horizontal: 'center' };
    
    currentRow++;
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = report.reportedByName;
    sheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
    
    currentRow += 3;
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    sheet.getCell(`A${currentRow}`).border = { bottom: {style:'thin'} };
    sheet.mergeCells(`E${currentRow}:G${currentRow}`);
    sheet.getCell(`E${currentRow}`).border = { bottom: {style:'thin'} };
    sheet.mergeCells(`I${currentRow}:K${currentRow}`);
    sheet.getCell(`I${currentRow}`).border = { bottom: {style:'thin'} };

    // Add Separator Line for next report on same sheet
    currentRow += 2;
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    sheet.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } }; // Slate 300
    
    return currentRow + 2; // Return next start position
};

export const exportToExcel = async (reports: Report[]) => {
  if (!window.ExcelJS) {
    alert("ExcelJS library not loaded");
    return;
  }

  const Workbook = window.ExcelJS.Workbook;
  const workbook = new Workbook();
  workbook.creator = 'Maintenance System';
  workbook.created = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  // --- SHEET 1: MASTER SUMMARY ---
  const summarySheet = workbook.addWorksheet('Summary List', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }]
  });
  
  summarySheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Ref ID', key: 'id', width: 15 },
    { header: 'Project', key: 'project', width: 30 },
    { header: 'Reported By', key: 'name', width: 20 },
    { header: 'Dept', key: 'dept', width: 15 },
    { header: 'Manpower', key: 'manpower', width: 10 },
    { header: 'Activities', key: 'actCount', width: 10 },
  ];
  
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };

  // 1. Group Reports By Date
  const reportsByDate: Record<string, Report[]> = {};
  reports.forEach(r => {
    if (!reportsByDate[r.reportDate]) {
        reportsByDate[r.reportDate] = [];
    }
    reportsByDate[r.reportDate].push(r);

    // Populate Summary
    const totalManpower = r.manpower.reduce((sum, row) => sum + row.total, 0);
    summarySheet.addRow({
        date: r.reportDate,
        id: r.id.substring(0,8),
        project: r.projectName,
        name: r.reportedByName,
        dept: r.reportedByDept,
        manpower: totalManpower,
        actCount: r.activities.length,
    });
  });

  // 2. Create Sheets Per Date
  // Sort dates descending (newest first)
  const sortedDates = Object.keys(reportsByDate).sort().reverse();

  for (const dateKey of sortedDates) {
      const dailyReports = reportsByDate[dateKey];
      // Create Sheet named by Date (e.g., 2023-10-25)
      const sheet = workbook.addWorksheet(dateKey, {
          views: [{ rightToLeft: true, showGridLines: false }]
      });

      // Global Column Setup for this sheet
      // A: Job (25), B-J: Locs (6), K: Total (8)
      sheet.columns = [
          { key: 'A', width: 25 }, 
          { key: 'B', width: 8 },  
          { key: 'C', width: 8 },
          { key: 'D', width: 8 },
          { key: 'E', width: 8 },
          { key: 'F', width: 8 },
          { key: 'G', width: 8 },
          { key: 'H', width: 8 },
          { key: 'I', width: 8 },
          { key: 'J', width: 8 },
          { key: 'K', width: 10 }, 
      ];

      let currentSheetRow = 1;

      // Render each report for this day into the same sheet
      for (const report of dailyReports) {
          currentSheetRow = renderReportToSheet(sheet, report, currentSheetRow);
      }
  }

  // --- SAVE ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Daily_Reports_Export_${new Date().toISOString().slice(0,10)}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
