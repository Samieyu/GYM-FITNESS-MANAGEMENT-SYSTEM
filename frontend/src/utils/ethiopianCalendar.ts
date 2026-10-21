/**
 * Ethiopian Calendar (E.C. / ዓመተ ምሕረት) Utilities
 * Accurately converts Gregorian dates to Ethiopian Calendar dates and formats them.
 * Supports both English transliteration (e.g. "11 Tikimt 2019 E.C.") and Amharic script (e.g. "ጥቅምት 11 ቀን 2019 ዓ.ም").
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameEn: string;
  monthNameAm: string;
  formatted: string;
  formattedAm: string;
}

export const ETHIOPIAN_MONTHS_EN = [
  '',
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yakatit',
  'Megabit',
  'Miyazya',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
];

export const ETHIOPIAN_MONTHS_AM = [
  '',
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜ',
];

/**
 * Converts a Gregorian Date or ISO string into an Ethiopian Date object
 */
export function toEthiopianDate(dateInput?: string | number | Date | null): EthiopianDate | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  if (year < 1900 || year > 2100) return null;

  const gMonthDays = [
    0,
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    33,
    30,
    31,
    30,
    31,
  ];

  let dayOfYear = day;
  for (let i = 1; i < month; i++) {
    dayOfYear += gMonthDays[i];
  }

  const prevYearIsLeap =
    (year - 1) % 4 === 0 && ((year - 1) % 100 !== 0 || (year - 1) % 400 === 0);
  const newYearDay = prevYearIsLeap ? 255 : 254; // Sept 12 or 11

  let ethYear: number;
  let ethMonth: number;
  let ethDay: number;

  if (dayOfYear >= newYearDay) {
    ethYear = year - 7;
    const daysSinceNewYear = dayOfYear - newYearDay;
    ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    ethDay = (daysSinceNewYear % 30) + 1;
  } else {
    ethYear = year - 8;
    const prevYearLeapDays =
      year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
    const prevNewYearDay =
      (year - 2) % 4 === 0 && ((year - 2) % 100 !== 0 || (year - 2) % 400 === 0)
        ? 255
        : 254;
    const daysFromSept = prevYearLeapDays - prevNewYearDay + dayOfYear;
    ethMonth = Math.floor(daysFromSept / 30) + 1;
    ethDay = (daysFromSept % 30) + 1;
  }

  const monthNameEn = ETHIOPIAN_MONTHS_EN[ethMonth] || '';
  const monthNameAm = ETHIOPIAN_MONTHS_AM[ethMonth] || '';

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthNameEn,
    monthNameAm,
    formatted: `${ethDay} ${monthNameEn} ${ethYear} E.C.`,
    formattedAm: `${monthNameAm} ${ethDay} ቀን ${ethYear} ዓ.ም`,
  };
}

/**
 * Returns a formatted Ethiopian date string (e.g. "11 Tikimt 2019 E.C." or "ጥቅምት 11 ቀን 2019 ዓ.ም")
 */
export function formatEthiopianDate(
  dateInput?: string | number | Date | null,
  showAmharic: boolean = false
): string {
  const eth = toEthiopianDate(dateInput);
  if (!eth) return 'N/A';
  return showAmharic ? eth.formattedAm : eth.formatted;
}

/**
 * Returns a formatted Ethiopian date and time string (e.g. "11 Tikimt 2019 E.C., 08:30 AM")
 */
export function formatEthiopianDateTime(
  dateInput?: string | number | Date | null,
  showAmharic: boolean = false
): string {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';

  const ethStr = formatEthiopianDate(date, showAmharic);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${ethStr}, ${timeStr}`;
}

/**
 * Format local time
 */
export function formatEthiopianTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
