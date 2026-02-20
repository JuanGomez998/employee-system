/**
 * Calculates worked hours between check-in and check-out times
 * @param checkInTime ISO string or Date object for check-in
 * @param checkOutTime ISO string or Date object for check-out
 * @returns Hours worked as decimal (e.g., 8.5)
 */
export const calculateHoursWorked = (
  checkInTime: string | Date,
  checkOutTime: string | Date
): number => {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal
};

/**
 * Formats hours as readable string (e.g., "8.5h" or "08:30")
 * @param hours Decimal hours
 * @param format 'decimal' for "8.5h" or 'time' for "08:30"
 * @returns Formatted string
 */
export const formatHours = (
  hours: number,
  format: "decimal" | "time" = "decimal"
): string => {
  if (format === "decimal") {
    return `${hours}h`;
  }
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

/**
 * Calculates average hours across multiple entries
 * @param hoursArray Array of hours worked
 * @returns Average as decimal
 */
export const calculateAverageHours = (hoursArray: number[]): number => {
  if (hoursArray.length === 0) return 0;
  const sum = hoursArray.reduce((acc, hours) => acc + hours, 0);
  return Math.round((sum / hoursArray.length) * 10) / 10;
};

/**
 * Calculates total hours across multiple entries
 * @param hoursArray Array of hours worked
 * @returns Total as decimal
 */
export const calculateTotalHours = (hoursArray: number[]): number => {
  const total = hoursArray.reduce((acc, hours) => acc + hours, 0);
  return Math.round(total * 10) / 10;
};
