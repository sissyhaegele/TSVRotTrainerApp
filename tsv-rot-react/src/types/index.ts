// Core Data Types
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
}

export interface Assignment {
  id: number;
  courseId: number;
  trainerId: number;
  weekDate: string; // YYYY-MM-DD format
  isSubstitute: boolean;
  notes?: string;
  createdAt: string;
}

export interface Absence {
  id: number;
  trainerId: number;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved: boolean;
  notes?: string;
  createdAt: string;
}

// Computed Types
export interface CourseWithTrainers extends Course {
  assignedTrainers: Trainer[];
  missingTrainers: number;
  status: 'full' | 'partial' | 'empty';
}

export interface WeekPlan {
  weekStart: string;
  courses: CourseWithTrainers[];
}

export interface TrainerWithStats extends Trainer {
  totalAssignments: number;
  upcomingAbsences: Absence[];
  coursesAssigned: Course[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface TrainerFormData {
  name: string;
  email?: string;
  phone?: string;
  qualifications: string[];
  isActive: boolean;
  availableDays: string[];
  notes?: string;
}

export interface CourseFormData {
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
}

export interface AbsenceFormData {
  trainerId: number;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
}

// UI Types
export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  component: React.ComponentType;
}

export interface ActionButtonProps {
  label: string;
  icon: React.ComponentType;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// Constants
export const DAYS_OF_WEEK = [
  'Montag',
  'Dienstag', 
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag'
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
