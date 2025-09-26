export interface Trainer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  qualifications: string[];
  isActive: boolean;
  availableDays: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  day: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  requiredTrainers: number;
  requiredQualifications: string[];
  isActive: boolean;
  location?: string;
  ageGroup?: string;
  level?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTrainers?: number;
}

export interface WeeklyAssignment {
  id: number;
  courseId: number;
  trainerId: number;
  weekDate: string;
  isSubstitute: boolean;
  notes?: string;
}

export interface Absence {
  id: number;
  trainerId: number;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved: boolean;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const DAYS_OF_WEEK = [
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 
  'Freitag', 'Samstag', 'Sonntag'
] as const;

export const QUALIFICATIONS = [
  'Übungsleiter C',
  'Trainer B', 
  'Trainer A',
  'Kinderturnen',
  'Geräteturnen', 
  'Fitness',
  'Erste Hilfe',
  'Jugendleiter'
] as const;

export const AGE_GROUPS = [
  'Bambini (3-5 Jahre)',
  'Kinder (6-10 Jahre)', 
  'Jugendliche (11-17 Jahre)',
  'Erwachsene (18-64 Jahre)',
  'Senioren (65+ Jahre)'
] as const;

export const COURSE_LEVELS = [
  'Anfänger',
  'Fortgeschritten', 
  'Leistung',
  'Mixed'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
export type Qualification = typeof QUALIFICATIONS[number];
export type AgeGroup = typeof AGE_GROUPS[number];
export type CourseLevel = typeof COURSE_LEVELS[number];
