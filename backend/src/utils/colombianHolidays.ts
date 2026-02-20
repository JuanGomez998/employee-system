/**
 * Colombian Holidays Calculator
 * Calcula los días festivos según la ley laboral colombiana
 */

export interface Holiday {
  date: Date;
  name: string;
  isFixed: boolean; // true si es fijo, false si es variable (ej: Pascua)
}

/**
 * Obtiene los días festivos para un año específico
 * @param year Año para calcular festivos
 * @returns Array de festivos
 */
export function getColombianHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // Festivos fijos (no cambian de año a año)
  holidays.push(
    { date: new Date(year, 0, 1), name: "Año Nuevo", isFixed: true },
    { date: new Date(year, 0, 8), name: "Epifanía", isFixed: true },
    { date: new Date(year, 2, 29), name: "San José", isFixed: true },
    { date: new Date(year, 4, 1), name: "Día del Trabajo", isFixed: true },
    { date: new Date(year, 5, 3), name: "Sagrado Corazón", isFixed: true },
    { date: new Date(year, 6, 4), name: "San Pedro y San Pablo", isFixed: true },
    { date: new Date(year, 7, 7), name: "Independencia Nacional", isFixed: true },
    { date: new Date(year, 7, 15), name: "Asunción de María", isFixed: true },
    { date: new Date(year, 8, 8), name: "Coronación de María", isFixed: true },
    { date: new Date(year, 10, 1), name: "Todos los Santos", isFixed: true },
    { date: new Date(year, 10, 11), name: "Independencia de Cartagena", isFixed: true },
    { date: new Date(year, 11, 8), name: "Inmaculada Concepción", isFixed: true },
    { date: new Date(year, 11, 25), name: "Navidad", isFixed: true }
  );

  // Festivos variables (Viernes Santo, Pascua, etc)
  const easterDate = calculateEaster(year);
  
  holidays.push(
    {
      date: new Date(easterDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      name: "Viernes Santo",
      isFixed: false,
    },
    {
      date: new Date(easterDate.getTime() + 39 * 24 * 60 * 60 * 1000),
      name: "Ascensión del Señor",
      isFixed: false,
    },
    {
      date: new Date(easterDate.getTime() + 60 * 24 * 60 * 60 * 1000),
      name: "Corpus Christi",
      isFixed: false,
    },
    {
      date: new Date(easterDate.getTime() + 68 * 24 * 60 * 60 * 1000),
      name: "Sagrado Corazón",
      isFixed: false,
    }
  );

  return holidays;
}

/**
 * Calcula la fecha de Pascua (Easter) usando el algoritmo computacional
 * @param year Año para calcular Pascua
 * @returns Fecha de Pascua
 */
function calculateEaster(year: number): Date {
  let a = year % 19;
  let b = Math.floor(year / 100);
  let c = year % 100;
  let d = Math.floor(b / 4);
  let e = b % 4;
  let f = Math.floor((b + 8) / 25);
  let g = Math.floor((b - f + 1) / 3);
  let h = (19 * a + b - d - g + 15) % 30;
  let i = Math.floor(c / 4);
  let k = c % 4;
  let l = (32 + 2 * e + 2 * i - h - k) % 7;
  let m = Math.floor((a + 11 * h + 22 * l) / 451);
  let month = Math.floor((h + l - 7 * m + 114) / 31);
  let day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Verifica si una fecha es festivo en Colombia
 * @param date Fecha a verificar
 * @returns true si es festivo
 */
export function isColombianHoliday(date: Date): boolean {
  const holidays = getColombianHolidays(date.getFullYear());
  return holidays.some(
    (holiday) =>
      holiday.date.getDate() === date.getDate() &&
      holiday.date.getMonth() === date.getMonth() &&
      holiday.date.getFullYear() === date.getFullYear()
  );
}

/**
 * Obtiene el nombre del festivo si existe
 * @param date Fecha a consultar
 * @returns Nombre del festivo o null
 */
export function getHolidayName(date: Date): string | null {
  const holidays = getColombianHolidays(date.getFullYear());
  const holiday = holidays.find(
    (h) =>
      h.date.getDate() === date.getDate() &&
      h.date.getMonth() === date.getMonth() &&
      h.date.getFullYear() === date.getFullYear()
  );
  return holiday ? holiday.name : null;
}

/**
 * Obtiene todos los festivos en un rango de fechas
 * @param startDate Fecha inicio
 * @param endDate Fecha fin
 * @returns Array de festivos en el período
 */
export function getHolidaysInRange(startDate: Date, endDate: Date): Holiday[] {
  const years = new Set<number>();
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    years.add(date.getFullYear());
  }

  const allHolidays: Holiday[] = [];
  years.forEach((year) => {
    allHolidays.push(...getColombianHolidays(year));
  });

  return allHolidays.filter(
    (holiday) => holiday.date >= startDate && holiday.date <= endDate
  );
}
