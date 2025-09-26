import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, startOfWeek, addDays, isToday, isFuture, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Course, Trainer, CourseWithTrainers } from '@/types';

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to German locale
 */
export function formatDate(date: string | Date, formatString: string = 'dd.MM.yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: de });
}

/**
 * Format time string to HH:MM
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
}

/**
 * Get array of dates for a week
 */
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Get week range as string (e.g., "13.01. - 19.01.2025")
 */
export function getWeekRangeString(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startStr = format(weekStart, 'dd.MM.');
  const endStr = format(weekEnd, 'dd.MM.yyyy');
  return `${startStr} - ${endStr}`;
}

/**
 * Convert day name to date for a specific week
 */
export function getDayDate(dayName: string, weekStart: Date): Date {
  const dayIndex = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].indexOf(dayName);
  if (dayIndex === -1) throw new Error(`Invalid day name: ${dayName}`);
  return addDays(weekStart, dayIndex);
}

/**
 * Check if a trainer is available for a course
 */
export function isTrainerAvailable(trainer: Trainer, course: Course): boolean {
  if (!trainer.isActive) return false;
  if (!trainer.availableDays.includes(course.day)) return false;
  
  // Check qualifications
  const hasRequiredQualification = course.requiredQualifications.length === 0 || 
    course.requiredQualifications.some(req => trainer.qualifications.includes(req));
  
  return hasRequiredQualification;
}

/**
 * Calculate course status based on assigned trainers
 */
export function getCourseStatus(course: CourseWithTrainers): 'full' | 'partial' | 'empty' {
  const assignedCount = course.assignedTrainers.length;
  const requiredCount = course.requiredTrainers;
  
  if (assignedCount === 0) return 'empty';
  if (assignedCount >= requiredCount) return 'full';
  return 'partial';
}

/**
 * Get status color for course
 */
export function getCourseStatusColor(status: 'full' | 'partial' | 'empty'): string {
  switch (status) {
    case 'full': return 'text-tsv-green-600 bg-tsv-green-50';
    case 'partial': return 'text-tsv-yellow-600 bg-tsv-yellow-50';
    case 'empty': return 'text-tsv-red-600 bg-tsv-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get status text for course
 */
export function getCourseStatusText(status: 'full' | 'partial' | 'empty'): string {
  switch (status) {
    case 'full': return 'Vollständig besetzt';
    case 'partial': return 'Teilweise besetzt';
    case 'empty': return 'Nicht besetzt';
    default: return 'Unbekannt';
  }
}

/**
 * Sort courses by day and time
 */
export function sortCourses(courses: Course[]): Course[] {
  const dayOrder = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  
  return courses.sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    
    // Same day, sort by time
    return a.startTime.localeCompare(b.startTime);
  });
}

/**
 * Filter trainers by search term
 */
export function filterTrainers(trainers: Trainer[], searchTerm: string): Trainer[] {
  if (!searchTerm) return trainers;
  
  const term = searchTerm.toLowerCase();
  return trainers.filter(trainer => 
    trainer.name.toLowerCase().includes(term) ||
    trainer.email?.toLowerCase().includes(term) ||
    trainer.qualifications.some(qual => qual.toLowerCase().includes(term))
  );
}

/**
 * Filter courses by search term
 */
export function filterCourses(courses: Course[], searchTerm: string): Course[] {
  if (!searchTerm) return courses;
  
  const term = searchTerm.toLowerCase();
  return courses.filter(course => 
    course.name.toLowerCase().includes(term) ||
    course.description?.toLowerCase().includes(term) ||
    course.day.toLowerCase().includes(term) ||
    course.ageGroup?.toLowerCase().includes(term) ||
    course.location?.toLowerCase().includes(term)
  );
}

/**
 * Generate a unique ID for forms
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Download file with given blob and filename
 * (Removed - not needed without Excel export)
 */
// export function downloadFile(blob: Blob, filename: string): void {
//   const url = window.URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   window.URL.revokeObjectURL(url);
// }

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (German format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+49|0)[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Parse and validate time string (HH:MM)
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Compare two time strings
 */
export function isTimeAfter(time1: string, time2: string): boolean {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return h1 * 60 + m1 > h2 * 60 + m2;
}

/**
 * Get time duration in minutes
 */
export function getTimeDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes - startMinutes;
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} Min.`;
  if (mins === 0) return `${hours} Std.`;
  return `${hours} Std. ${mins} Min.`;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Pluralize German words (simple cases)
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

/**
 * Get contrast color for background
 */
export function getContrastColor(backgroundColor: string): string {
  // Simple implementation - you might want to use a more sophisticated algorithm
  const colors = ['bg-red', 'bg-yellow', 'bg-orange'];
  return colors.some(color => backgroundColor.includes(color)) ? 'text-white' : 'text-gray-900';
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
