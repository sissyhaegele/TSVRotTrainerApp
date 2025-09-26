import axios from 'axios';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Trainer, 
  Course, 
  Assignment, 
  Absence,
  TrainerFormData,
  CourseFormData,
  AbsenceFormData,
  WeekPlan 
} from '@/types';

// Configure axios
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://trainer.tsvrot.de/api' 
    : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tsvrot-auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('tsvrot-auth-token');
      window.location.href = '/login';
    }
    throw error;
  }
);

// Auth API
export const authApi = {
  login: async (password: string): Promise<ApiResponse<{ token: string; isAdmin: boolean }>> => {
    return api.post('/auth/login', { password });
  },
  
  verifyToken: async (): Promise<ApiResponse<{ isAdmin: boolean }>> => {
    return api.get('/auth/verify');
  },
};

// Trainers API
export const trainersApi = {
  getAll: async (): Promise<ApiResponse<Trainer[]>> => {
    return api.get('/trainers');
  },
  
  getById: async (id: number): Promise<ApiResponse<Trainer>> => {
    return api.get(`/trainers/${id}`);
  },
  
  create: async (data: TrainerFormData): Promise<ApiResponse<Trainer>> => {
    return api.post('/trainers', data);
  },
  
  update: async (id: number, data: Partial<TrainerFormData>): Promise<ApiResponse<Trainer>> => {
    return api.put(`/trainers/${id}`, data);
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/trainers/${id}`);
  },
  
  getStats: async (id: number): Promise<ApiResponse<{
    totalAssignments: number;
    upcomingAbsences: Absence[];
    coursesAssigned: Course[];
  }>> => {
    return api.get(`/trainers/${id}/stats`);
  },
};

// Courses API
export const coursesApi = {
  getAll: async (): Promise<ApiResponse<Course[]>> => {
    return api.get('/courses');
  },
  
  getById: async (id: number): Promise<ApiResponse<Course>> => {
    return api.get(`/courses/${id}`);
  },
  
  create: async (data: CourseFormData): Promise<ApiResponse<Course>> => {
    return api.post('/courses', data);
  },
  
  update: async (id: number, data: Partial<CourseFormData>): Promise<ApiResponse<Course>> => {
    return api.put(`/courses/${id}`, data);
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/courses/${id}`);
  },
  
  getWeekPlan: async (weekDate: string): Promise<ApiResponse<WeekPlan>> => {
    return api.get(`/courses/week-plan?date=${weekDate}`);
  },
};

// Assignments API
export const assignmentsApi = {
  create: async (courseId: number, trainerId: number, weekDate: string, isSubstitute = false): Promise<ApiResponse<Assignment>> => {
    return api.post('/assignments', {
      courseId,
      trainerId, 
      weekDate,
      isSubstitute
    });
  },
  
  update: async (id: number, data: Partial<Assignment>): Promise<ApiResponse<Assignment>> => {
    return api.put(`/assignments/${id}`, data);
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/assignments/${id}`);
  },
  
  getByWeek: async (weekDate: string): Promise<ApiResponse<Assignment[]>> => {
    return api.get(`/assignments/week?date=${weekDate}`);
  },
};

// Absences API
export const absencesApi = {
  getAll: async (): Promise<ApiResponse<Absence[]>> => {
    return api.get('/absences');
  },
  
  create: async (data: AbsenceFormData): Promise<ApiResponse<Absence>> => {
    return api.post('/absences', data);
  },
  
  update: async (id: number, data: Partial<AbsenceFormData>): Promise<ApiResponse<Absence>> => {
    return api.put(`/absences/${id}`, data);
  },
  
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/absences/${id}`);
  },
  
  getByTrainer: async (trainerId: number): Promise<ApiResponse<Absence[]>> => {
    return api.get(`/absences/trainer/${trainerId}`);
  },
  
  approve: async (id: number): Promise<ApiResponse<Absence>> => {
    return api.patch(`/absences/${id}/approve`);
  },
};

// Statistics API
export const statsApi = {
  getDashboard: async (): Promise<ApiResponse<{
    totalTrainers: number;
    activeTrainers: number;
    totalCourses: number;
    activeCourses: number;
    weeklyAssignments: number;
    pendingAbsences: number;
  }>> => {
    return api.get('/stats/dashboard');
  },
  
  getTrainerUtilization: async (): Promise<ApiResponse<Array<{
    trainerId: number;
    trainerName: string;
    assignmentsThisWeek: number;
    assignmentsThisMonth: number;
    utilizationPercentage: number;
  }>>> => {
    return api.get('/stats/trainer-utilization');
  },
};

// Note: Export/Import functionality removed as per requirements
// All data management is done through the web interface

export default api;
