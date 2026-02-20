"use strict";
/**
 * Excel Payroll Generator
 * Genera reportes de nómina en Excel con formato profesional según ley colombiana
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePayrollExcel = generatePayrollExcel;
const ExcelJS = __importStar(require("exceljs"));
const COLORS = {
    headerBg: { argb: "FF1F3A93" }, // Azul oscuro
    headerText: { argb: "FFFFFFFF" }, // Blanco
    subtitleBg: { argb: "FFE8EEF7" }, // Azul claro
    accentBg: { argb: "FFF4B084" }, // Naranja claro
    successBg: { argb: "FFE2EFDA" }, // Verde claro
    warningBg: { argb: "FFFCE4D6" }, // Naranja más claro
    borderColor: { argb: "FFD3D3D3" }, // Gris
    textDark: { argb: "FF1F1F1F" }, // Negro
};
const BORDER_STYLE = {
    top: { style: "thin", color: COLORS.borderColor },
    bottom: { style: "thin", color: COLORS.borderColor },
    left: { style: "thin", color: COLORS.borderColor },
    right: { style: "thin", color: COLORS.borderColor },
};
/**
 * Crea un reporte de nómina en Excel
 * @param payrolls Array de cálculos de nómina
 * @param companyName Nombre de la empresa
 * @returns Buffer del archivo Excel
 */
async function generatePayrollExcel(payrolls, companyName = "Employee System") {
    const workbook = new ExcelJS.Workbook();
    // Hoja 1: Resumen
    createSummarySheet(workbook, payrolls, companyName);
    // Hoja 2: Detalle por empleado
    createDetailSheet(workbook, payrolls);
    // Hoja 3: Gráficos y análisis
    createAnalysisSheet(workbook, payrolls);
    // Buffer para descargar
    const output = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(output) ? output : Buffer.from(output);
}
/**
 * Crea la hoja de resumen
 */
function createSummarySheet(workbook, payrolls, companyName) {
    const sheet = workbook.addWorksheet("Summary", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
    });
    // Ancho de columnas
    sheet.columns = [
        { width: 20 },
        { width: 15 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 18 },
        { width: 18 },
    ];
    // Encabezado
    let row = 1;
    const titleCell = sheet.getCell(`A${row}`);
    titleCell.value = `PAYROLL REPORT - ${companyName}`;
    titleCell.font = { size: 16, bold: true, color: COLORS.headerText };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.mergeCells(`A${row}:H${row}`);
    sheet.getRow(row).height = 30;
    row++;
    const dateRange = sheet.getCell(`A${row}`);
    const startDate = payrolls[0]?.startDate
        ? new Date(payrolls[0].startDate).toLocaleDateString("es-CO")
        : "";
    const endDate = payrolls[0]?.endDate
        ? new Date(payrolls[0].endDate).toLocaleDateString("es-CO")
        : "";
    dateRange.value = `Period: ${startDate} to ${endDate}`;
    dateRange.font = { italic: true, color: { argb: "FF666666" } };
    sheet.mergeCells(`A${row}:H${row}`);
    row += 2;
    // Encabezados de tabla
    const headers = [
        "Employee",
        "Base Salary",
        "Hours",
        "Overtime Hours",
        "Surcharges",
        "Benefits",
        "Subtotal",
        "Final Total",
    ];
    headers.forEach((header, index) => {
        const cell = sheet.getCell(row, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: COLORS.headerText, size: 11 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
        cell.border = BORDER_STYLE;
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });
    sheet.getRow(row).height = 25;
    row++;
    // Datos de empleados
    let totalSalary = 0;
    let totalPayment = 0;
    let totalBenefits = 0;
    payrolls.forEach((payroll) => {
        const cells = [
            sheet.getCell(row, 1),
            sheet.getCell(row, 2),
            sheet.getCell(row, 3),
            sheet.getCell(row, 4),
            sheet.getCell(row, 5),
            sheet.getCell(row, 6),
            sheet.getCell(row, 7),
            sheet.getCell(row, 8),
        ];
        cells[0].value = payroll.employeeName;
        cells[1].value = payroll.salary;
        cells[2].value = payroll.hourBreakdown.normalHours.toFixed(2);
        cells[3].value = (payroll.hourBreakdown.extraDiurnHours +
            payroll.hourBreakdown.extraNocturnHours).toFixed(2);
        cells[4].value = (payroll.nocturnSurchargeValue +
            payroll.sundayValue +
            payroll.holidayValue +
            payroll.combinedExtraSundayValue +
            payroll.combinedExtraHolidayValue).toFixed(2);
        cells[5].value = payroll.totalPrestaciones;
        cells[6].value = payroll.subtotalHours;
        cells[7].value = payroll.totalPayment;
        // Formato de números
        cells.forEach((cell, index) => {
            cell.border = BORDER_STYLE;
            cell.alignment = { horizontal: index === 0 ? "left" : "right" };
            if (index > 0) {
                cell.numFmt = "#,##0.00";
                cell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.subtitleBg };
            }
        });
        totalSalary += payroll.salary;
        totalPayment += payroll.subtotalHours;
        totalBenefits += payroll.totalPrestaciones;
        row++;
    });
    // Fila de totales
    const totals = [
        sheet.getCell(row, 1),
        sheet.getCell(row, 2),
        sheet.getCell(row, 3),
        sheet.getCell(row, 4),
        sheet.getCell(row, 5),
        sheet.getCell(row, 6),
        sheet.getCell(row, 7),
        sheet.getCell(row, 8),
    ];
    totals[0].value = "TOTAL";
    totals[1].value = totalSalary;
    totals[2].value = "";
    totals[3].value = "";
    totals[4].value = "";
    totals[5].value = totalBenefits;
    totals[6].value = totalPayment;
    totals[7].value = totalPayment + totalBenefits;
    totals.forEach((cell, index) => {
        cell.font = { bold: true, color: COLORS.headerText };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
        cell.border = BORDER_STYLE;
        cell.alignment = {
            horizontal: index === 0 ? "left" : "right",
            vertical: "middle",
        };
        if (index > 0) {
            cell.numFmt = "#,##0.00";
        }
    });
    sheet.getRow(row).height = 25;
}
/**
 * Crea la hoja detallada por empleado
 */
function createDetailSheet(workbook, payrolls) {
    const sheet = workbook.addWorksheet("Employee Details", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
    });
    sheet.columns = [
        { width: 20 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
    ];
    let row = 1;
    payrolls.forEach((payroll, index) => {
        // Encabezado del empleado
        const titleCell = sheet.getCell(row, 1);
        titleCell.value = `${payroll.employeeName} - ${payroll.employeeCedula}`;
        titleCell.font = { size: 13, bold: true };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.accentBg };
        sheet.mergeCells(`A${row}:J${row}`);
        row++;
        // Información general
        const infoRow = [
            ["Monthly Salary:", payroll.salary],
            ["Standard Hour Value:", payroll.hourlyRate.toFixed(2)],
            ["Period:", `${new Date(payroll.startDate).toLocaleDateString()} to ${new Date(payroll.endDate).toLocaleDateString()}`],
        ];
        infoRow.forEach((info) => {
            sheet.getCell(row, 1).value = info[0];
            sheet.getCell(row, 2).value = info[1];
            row++;
        });
        row++;
        // Desglose de horas
        const breakdownHeaders = [
            "Hour Type",
            "Quantity",
            "Unit Value",
            "Total Value",
        ];
        breakdownHeaders.forEach((header, index) => {
            const cell = sheet.getCell(row, index + 1);
            cell.value = header;
            cell.font = { bold: true, color: COLORS.headerText };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
            cell.border = BORDER_STYLE;
        });
        row++;
        const breakdown = [
            [
                "Standard Hours",
                payroll.hourBreakdown.normalHours.toFixed(2),
                payroll.hourlyRate.toFixed(2),
                payroll.normalHoursValue.toFixed(2),
            ],
            [
                "Overtime Day Hours",
                payroll.hourBreakdown.extraDiurnHours.toFixed(2),
                (payroll.hourlyRate * 1.25).toFixed(2),
                payroll.extraDiurnValue.toFixed(2),
            ],
            [
                "Overtime Night Hours",
                payroll.hourBreakdown.extraNocturnHours.toFixed(2),
                (payroll.hourlyRate * 1.75).toFixed(2),
                payroll.extraNocturnValue.toFixed(2),
            ],
            [
                "Night Surcharge (35%)",
                payroll.hourBreakdown.nocturnSurchargeHours.toFixed(2),
                (payroll.hourlyRate * 0.35).toFixed(2),
                payroll.nocturnSurchargeValue.toFixed(2),
            ],
            [
                "Sunday Work",
                payroll.hourBreakdown.sundayHours.toFixed(2),
                (payroll.hourlyRate * 0.75).toFixed(2),
                payroll.sundayValue.toFixed(2),
            ],
            [
                "Holiday Work",
                payroll.hourBreakdown.holidayHours.toFixed(2),
                payroll.hourlyRate.toFixed(2),
                payroll.holidayValue.toFixed(2),
            ],
            [
                "Overtime + Sunday",
                payroll.hourBreakdown.combinedExtraSundayHours.toFixed(2),
                (payroll.hourlyRate * 1.5).toFixed(2),
                payroll.combinedExtraSundayValue.toFixed(2),
            ],
            [
                "Overtime + Holiday",
                payroll.hourBreakdown.combinedExtraHolidayHours.toFixed(2),
                (payroll.hourlyRate * 1.75).toFixed(2),
                payroll.combinedExtraHolidayValue.toFixed(2),
            ],
        ];
        breakdown.forEach((item) => {
            sheet.getCell(row, 1).value = item[0];
            sheet.getCell(row, 2).value = parseFloat(item[1]);
            sheet.getCell(row, 3).value = parseFloat(item[2]);
            sheet.getCell(row, 4).value = parseFloat(item[3]);
            for (let col = 1; col <= 4; col++) {
                const cell = sheet.getCell(row, col);
                cell.border = BORDER_STYLE;
                if (col > 1) {
                    cell.numFmt = "#,##0.00";
                    cell.alignment = { horizontal: "right" };
                }
            }
            row++;
        });
        // Subtotal horas
        const subtotalRow = sheet.getCell(row, 1);
        subtotalRow.value = "HOURS SUBTOTAL";
        subtotalRow.font = { bold: true };
        subtotalRow.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.successBg };
        sheet.getCell(row, 4).value = payroll.subtotalHours.toFixed(2);
        sheet.getCell(row, 4).fill = { type: "pattern", pattern: "solid", fgColor: COLORS.successBg };
        sheet.getCell(row, 4).numFmt = "#,##0.00";
        row += 2;
        // Prestaciones
        sheet.getCell(row, 1).value = "SOCIAL BENEFITS";
        sheet.getCell(row, 1).font = { bold: true, size: 11 };
        sheet.mergeCells(`A${row}:D${row}`);
        row++;
        const benefits = [
            ["Legal Bonus (1/12 salary)", payroll.prima],
            ["Severance (1/12 salary)", payroll.cesantia],
            ["Severance Interest (12%)", payroll.cesantiaInterest],
            ["Proportional Vacation", payroll.vacacionesProporcionales],
            ["Transport Allowance", payroll.auxilioTransporte],
        ];
        benefits.forEach((benefit) => {
            sheet.getCell(row, 1).value = benefit[0];
            sheet.getCell(row, 2).value = benefit[1];
            sheet.getCell(row, 2).numFmt = "#,##0.00";
            sheet.getCell(row, 2).alignment = { horizontal: "right" };
            row++;
        });
        row++;
        const totalBenefits = sheet.getCell(row, 1);
        totalBenefits.value = "TOTAL BENEFITS";
        totalBenefits.font = { bold: true };
        totalBenefits.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.warningBg };
        sheet.getCell(row, 2).value = payroll.totalPrestaciones;
        sheet.getCell(row, 2).numFmt = "#,##0.00";
        sheet.getCell(row, 2).fill = { type: "pattern", pattern: "solid", fgColor: COLORS.warningBg };
        row += 2;
        const totalPayment = sheet.getCell(row, 1);
        totalPayment.value = "TOTAL PAYMENT";
        totalPayment.font = { bold: true, size: 12, color: COLORS.headerText };
        totalPayment.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
        sheet.getCell(row, 2).value = payroll.totalPayment;
        sheet.getCell(row, 2).font = { bold: true, size: 12, color: COLORS.headerText };
        sheet.getCell(row, 2).numFmt = "#,##0.00";
        sheet.getCell(row, 2).fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
        row += 3;
    });
}
/**
 * Crea la hoja de análisis
 */
function createAnalysisSheet(workbook, payrolls) {
    const sheet = workbook.addWorksheet("Analysis", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
    });
    sheet.columns = [{ width: 30 }, { width: 15 }, { width: 15 }];
    let row = 1;
    // Título
    const titleCell = sheet.getCell(row, 1);
    titleCell.value = "PAYROLL ANALYSIS";
    titleCell.font = { size: 14, bold: true, color: COLORS.headerText };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
    sheet.mergeCells(`A${row}:C${row}`);
    row += 2;
    // Resumen general
    sheet.getCell(row, 1).value = "GENERAL SUMMARY";
    sheet.getCell(row, 1).font = { bold: true, size: 11 };
    row++;
    const headers = ["Concept", "Quantity", "Total Value"];
    headers.forEach((header, index) => {
        const cell = sheet.getCell(row, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: COLORS.headerText };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: COLORS.headerBg };
    });
    row++;
    // Cálculos agregados
    let totalNormalHours = 0;
    let totalExtraHours = 0;
    let totalRecargos = 0;
    let totalPayment = 0;
    let totalBenefits = 0;
    payrolls.forEach((payroll) => {
        totalNormalHours += payroll.hourBreakdown.normalHours;
        totalExtraHours +=
            payroll.hourBreakdown.extraDiurnHours +
                payroll.hourBreakdown.extraNocturnHours;
        totalRecargos +=
            payroll.nocturnSurchargeValue +
                payroll.sundayValue +
                payroll.holidayValue;
        totalPayment += payroll.subtotalHours;
        totalBenefits += payroll.totalPrestaciones;
    });
    const summaryData = [
        ["Total Standard Hours", totalNormalHours.toFixed(2), totalNormalHours * (payrolls[0]?.hourlyRate || 0)],
        ["Total Overtime Hours", totalExtraHours.toFixed(2), totalExtraHours * (payrolls[0]?.hourlyRate || 0)],
        ["Total Surcharges", "-", totalRecargos.toFixed(2)],
        ["Total Hour Payments", "-", totalPayment.toFixed(2)],
        ["Total Benefits", "-", totalBenefits.toFixed(2)],
    ];
    summaryData.forEach((item) => {
        sheet.getCell(row, 1).value = item[0];
        sheet.getCell(row, 2).value = item[1];
        sheet.getCell(row, 3).value = parseFloat(item[2]);
        sheet.getCell(row, 3).numFmt = "#,##0.00";
        row++;
    });
}
