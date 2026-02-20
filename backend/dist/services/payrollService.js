"use strict";
/**
 * Colombian Payroll Service
 * Calcula la nómina según la ley laboral colombiana
 *
 * NORMATIVA APLICADA:
 * - Código Sustantivo del Trabajo Colombiano
 * - Horas normales: máximo 8 por día, máximo 48 por semana
 * - Hora extra diurna: 25% recargo sobre valor hora normal
 * - Hora extra nocturna: 75% recargo sobre valor hora normal
 * - Recargo nocturno: 35% sobre valor hora normal (22:00 - 06:00)
 * - Trabajo dominical: 75% recargo
 * - Trabajo festivo: 100% recargo (se suma a otros recargos)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHourlyRate = calculateHourlyRate;
exports.breakdownDayHours = breakdownDayHours;
exports.calculatePaymentBreakdown = calculatePaymentBreakdown;
exports.calculateBenefits = calculateBenefits;
exports.calculatePayroll = calculatePayroll;
/**
 * Calcula el valor de la hora normal basado en salario mensual
 * @param monthlySalary Salario mensual del empleado
 * @returns Valor de la hora normal
 */
function calculateHourlyRate(monthlySalary) {
    // Promedio de 30 días, 8 horas por día = 240 horas mensuales
    return monthlySalary / 240;
}
/**
 * Calcula horas entre dos fechas
 * @param checkIn Hora de entrada
 * @param checkOut Hora de salida
 * @returns Horas trabajadas
 */
function calculateHoursBetween(checkIn, checkOut) {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    return diffMs / (1000 * 60 * 60);
}
/**
 * Determina si una hora está en horario nocturno (22:00 - 06:00)
 * @param hour Hora a verificar
 * @returns true si es horario nocturno
 */
function isNocturnHour(hour) {
    return hour >= 22 || hour < 6;
}
/**
 * Desglose de horas para un día de trabajo
 * FÓRMULA:
 * - Horas normales: hasta 8 horas por día
 * - Horas extras diurnas: más de 8 horas entre 06:00 - 22:00
 * - Horas extras nocturnas: más de 8 horas entre 22:00 - 06:00
 * - Recargo nocturno: 35% en horario 22:00 - 06:00
 * - Recargo dominical: 75% en domingos
 * - Recargo festivo: 100% en días festivos
 *
 * @param dayRecord Registro del día
 * @returns Desglose de horas trabajadas
 */
function breakdownDayHours(dayRecord) {
    const totalHours = calculateHoursBetween(dayRecord.checkIn, dayRecord.checkOut);
    let normalHours = 0;
    let extraDiurnHours = 0;
    let extraNocturnHours = 0;
    let nocturnSurchargeHours = 0;
    let sundayHours = 0;
    let holidayHours = 0;
    // Horas normales: máximo 8 por día
    normalHours = Math.min(totalHours, 8);
    // Horas extras
    if (totalHours > 8) {
        const extraHours = totalHours - 8;
        // Determinar cuántas horas extras son nocturnas
        const checkInHour = dayRecord.checkIn.getHours();
        const checkOutHour = dayRecord.checkOut.getHours();
        if (isNocturnHour(checkInHour) || isNocturnHour(checkOutHour)) {
            // Si hay trabajo nocturno, todas las extras son nocturnas
            extraNocturnHours = extraHours;
        }
        else {
            // Extras diurnas
            extraDiurnHours = extraHours;
        }
    }
    // Recargo nocturno: 35% valor hora normal (aplica en cualquier momento entre 22:00-06:00)
    nocturnSurchargeHours = Math.min(normalHours, 8); // Máximo para horas nocturnas
    // Recargo dominical y festivo
    if (dayRecord.isSunday) {
        sundayHours = totalHours;
    }
    if (dayRecord.isHoliday) {
        holidayHours = totalHours;
    }
    // Horas combinadas: no se cuentan doble
    let combinedExtraSundayHours = 0;
    let combinedExtraHolidayHours = 0;
    if (dayRecord.isSunday && (extraDiurnHours > 0 || extraNocturnHours > 0)) {
        combinedExtraSundayHours = Math.max(extraDiurnHours, extraNocturnHours);
    }
    if (dayRecord.isHoliday && (extraDiurnHours > 0 || extraNocturnHours > 0)) {
        combinedExtraHolidayHours = Math.max(extraDiurnHours, extraNocturnHours);
    }
    return {
        normalHours,
        extraDiurnHours: dayRecord.isSunday || dayRecord.isHoliday ? 0 : extraDiurnHours,
        extraNocturnHours: dayRecord.isSunday || dayRecord.isHoliday ? 0 : extraNocturnHours,
        nocturnSurchargeHours,
        sundayHours: dayRecord.isSunday ? Math.min(normalHours, 8) : 0,
        holidayHours: dayRecord.isHoliday ? totalHours : 0,
        combinedExtraSundayHours,
        combinedExtraHolidayHours,
    };
}
/**
 * Calcula el valor de cada tipo de hora
 * FÓRMULAS DE RECARGO:
 * - Extra diurna: valorHora × 1.25 (25% recargo)
 * - Extra nocturna: valorHora × 1.75 (75% recargo)
 * - Nocturno (recargo): valorHora × 0.35 (35% recargo)
 * - Dominical: valorHora × 1.75 (75% recargo)
 * - Festivo: valorHora × 2.0 (100% recargo)
 * - Extra + Dominical: valorHora × 2.5 (125% recargo)
 * - Extra + Festivo: valorHora × 2.75 (175% recargo)
 */
function calculatePaymentBreakdown(hourlyRate, breakdown) {
    return {
        normalHoursValue: breakdown.normalHours * hourlyRate,
        extraDiurnValue: breakdown.extraDiurnHours * hourlyRate * 1.25,
        extraNocturnValue: breakdown.extraNocturnHours * hourlyRate * 1.75,
        nocturnSurchargeValue: breakdown.nocturnSurchargeHours * hourlyRate * 0.35,
        sundayValue: breakdown.sundayHours * hourlyRate * 0.75, // Sin extra
        holidayValue: breakdown.holidayHours * hourlyRate * 1.0, // Ya es 100% total
        combinedExtraSundayValue: breakdown.combinedExtraSundayHours * hourlyRate * 1.5, // 125% total
        combinedExtraHolidayValue: breakdown.combinedExtraHolidayHours * hourlyRate * 1.75, // 175% total
        subtotalHours: breakdown.normalHours +
            breakdown.extraDiurnHours +
            breakdown.extraNocturnHours +
            breakdown.sundayHours +
            breakdown.holidayHours,
    };
}
/**
 * Calcula prestaciones sociales proporcionales
 * FÓRMULAS:
 * - Prima legal: salario mensual / 12 (por mes trabajado)
 * - Cesantía: salario mensual / 12 × meses trabajados
 * - Interés cesantía: cesantía × 12% anual
 * - Vacaciones: salario mensual / 30 × días trabajados
 * - Auxilio transporte: valor definido por ley (aprox 140,000 COP en 2024)
 */
function calculateBenefits(salary, days, monthsWorked = 1) {
    const dailySalary = salary / 30;
    const monthlySalary = salary;
    // Prima legal: 1 mes por año = 1/12 por mes
    const prima = (monthlySalary / 12) * monthsWorked;
    // Cesantía: 1 mes por año = 1/12 por mes
    const cesantia = (monthlySalary / 12) * monthsWorked;
    // Interés sobre cesantía: 12% anual
    const cesantiaInterest = cesantia * 0.12;
    // Vacaciones proporcionales: 15 días por año = 0.5 día por mes
    const vacacionesProporcionales = dailySalary * (days / 30) * 0.5;
    // Auxilio de transporte: aproximadamente 140,000 COP (2024)
    // En un período completo, se paga el valor diario × días
    const auxilioTransporte = 140000 * (days / 30);
    return {
        prima,
        cesantia,
        cesantiaInterest,
        vacacionesProporcionales,
        auxilioTransporte,
        totalBenefits: prima + cesantia + cesantiaInterest + vacacionesProporcionales + auxilioTransporte,
    };
}
/**
 * Calcula la nómina completa de un empleado basado en registros diarios
 *
 * @param employeeId ID del empleado
 * @param employeeName Nombre del empleado
 * @param salary Salario mensual en COP
 * @param dayRecords Registros diarios de entrada y salida
 * @param startDate Fecha inicio del período
 * @param endDate Fecha final del período
 * @returns Cálculo completo de nómina
 */
function calculatePayroll(employeeCedula, employeeName, salary, dayRecords, startDate, endDate) {
    const hourlyRate = calculateHourlyRate(salary);
    // Totalizar horas
    let totalBreakdown = {
        normalHours: 0,
        extraDiurnHours: 0,
        extraNocturnHours: 0,
        nocturnSurchargeHours: 0,
        sundayHours: 0,
        holidayHours: 0,
        combinedExtraSundayHours: 0,
        combinedExtraHolidayHours: 0,
    };
    let totalPayment = {
        normalHoursValue: 0,
        extraDiurnValue: 0,
        extraNocturnValue: 0,
        nocturnSurchargeValue: 0,
        sundayValue: 0,
        holidayValue: 0,
        combinedExtraSundayValue: 0,
        combinedExtraHolidayValue: 0,
        subtotalHours: 0,
    };
    // Procesar cada día
    dayRecords.forEach((day) => {
        const breakdown = breakdownDayHours(day);
        const payment = calculatePaymentBreakdown(hourlyRate, breakdown);
        totalBreakdown.normalHours += breakdown.normalHours;
        totalBreakdown.extraDiurnHours += breakdown.extraDiurnHours;
        totalBreakdown.extraNocturnHours += breakdown.extraNocturnHours;
        totalBreakdown.nocturnSurchargeHours += breakdown.nocturnSurchargeHours;
        totalBreakdown.sundayHours += breakdown.sundayHours;
        totalBreakdown.holidayHours += breakdown.holidayHours;
        totalBreakdown.combinedExtraSundayHours += breakdown.combinedExtraSundayHours;
        totalBreakdown.combinedExtraHolidayHours += breakdown.combinedExtraHolidayHours;
        totalPayment.normalHoursValue += payment.normalHoursValue;
        totalPayment.extraDiurnValue += payment.extraDiurnValue;
        totalPayment.extraNocturnValue += payment.extraNocturnValue;
        totalPayment.nocturnSurchargeValue += payment.nocturnSurchargeValue;
        totalPayment.sundayValue += payment.sundayValue;
        totalPayment.holidayValue += payment.holidayValue;
        totalPayment.combinedExtraSundayValue += payment.combinedExtraSundayValue;
        totalPayment.combinedExtraHolidayValue += payment.combinedExtraHolidayValue;
        totalPayment.subtotalHours += payment.subtotalHours;
    });
    // Beneficios
    const daysWorked = dayRecords.length;
    const monthsWorked = Math.max(1, daysWorked / 30);
    const benefits = calculateBenefits(salary, daysWorked, monthsWorked);
    return {
        employeeCedula,
        employeeName,
        salary,
        hourlyRate,
        startDate,
        endDate,
        hourBreakdown: totalBreakdown,
        normalHoursValue: totalPayment.normalHoursValue,
        extraDiurnValue: totalPayment.extraDiurnValue,
        extraNocturnValue: totalPayment.extraNocturnValue,
        nocturnSurchargeValue: totalPayment.nocturnSurchargeValue,
        sundayValue: totalPayment.sundayValue,
        holidayValue: totalPayment.holidayValue,
        combinedExtraSundayValue: totalPayment.combinedExtraSundayValue,
        combinedExtraHolidayValue: totalPayment.combinedExtraHolidayValue,
        subtotalHours: totalPayment.normalHoursValue +
            totalPayment.extraDiurnValue +
            totalPayment.extraNocturnValue +
            totalPayment.nocturnSurchargeValue +
            totalPayment.sundayValue +
            totalPayment.holidayValue +
            totalPayment.combinedExtraSundayValue +
            totalPayment.combinedExtraHolidayValue,
        prima: benefits.prima,
        cesantia: benefits.cesantia,
        cesantiaInterest: benefits.cesantiaInterest,
        vacacionesProporcionales: benefits.vacacionesProporcionales,
        auxilioTransporte: benefits.auxilioTransporte,
        totalPrestaciones: benefits.totalBenefits,
        totalPayment: totalPayment.normalHoursValue +
            totalPayment.extraDiurnValue +
            totalPayment.extraNocturnValue +
            totalPayment.nocturnSurchargeValue +
            totalPayment.sundayValue +
            totalPayment.holidayValue +
            totalPayment.combinedExtraSundayValue +
            totalPayment.combinedExtraHolidayValue +
            benefits.totalBenefits,
    };
}
