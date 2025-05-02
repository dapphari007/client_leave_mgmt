import {
  format,
  parseISO,
  differenceInCalendarDays,
  isWeekend,
} from "date-fns";

export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), "MMM dd, yyyy");
};

export const formatDateTime = (dateString: string): string => {
  return format(parseISO(dateString), "MMM dd, yyyy HH:mm");
};

export const calculateBusinessDays = (
  startDate: string,
  endDate: string,
  holidays: string[] = []
): number => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  let count = 0;
  const holidayDates = holidays.map((h) => parseISO(h));

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const isHoliday = holidayDates.some(
      (holiday) =>
        holiday.getDate() === currentDate.getDate() &&
        holiday.getMonth() === currentDate.getMonth() &&
        holiday.getFullYear() === currentDate.getFullYear()
    );

    if (!isWeekend(currentDate) && !isHoliday) {
      count++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

export const calculateLeaveDuration = (
  startDate: string,
  endDate: string
): number => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  return differenceInCalendarDays(end, start) + 1;
};
