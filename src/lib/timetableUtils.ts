export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface Timetable {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  notes?: {
    en?: string;
    es?: string;
  };
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const getCurrentDay = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

export const isOpenNow = (timetable: Timetable | null): boolean => {
  if (!timetable) return false;
  
  const currentDay = getCurrentDay();
  const daySchedule = timetable[currentDay as keyof Omit<Timetable, 'notes'>];
  
  if (!daySchedule || daySchedule.closed) return false;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

export const getTodayHours = (timetable: Timetable | null): DaySchedule | null => {
  if (!timetable) return null;
  
  const currentDay = getCurrentDay();
  return timetable[currentDay as keyof Omit<Timetable, 'notes'>] || null;
};

export const formatTime = (time: string): string => {
  // Convert 24h to 12h format or keep as is depending on locale
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

export const getDaysInOrder = (): typeof DAYS_ORDER[number][] => {
  return [...DAYS_ORDER];
};
