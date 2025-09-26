import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  trainersApi, 
  coursesApi, 
  assignmentsApi, 
  absencesApi, 
  statsApi, 
  authApi 
} from '@/services/api';
import type { 
  Trainer, 
  Course, 
  Assignment, 
  Absence, 
  TrainerFormData,
  CourseFormData, 
  AbsenceFormData,
  WeekPlan 
} from '@/types';
import { getWeekStart, formatDate } from '@/utils';

// Auth Hook
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tsvrot-auth-token');
    if (token) {
      authApi.verifyToken()
        .then((response) => {
          if (response.success && response.data) {
            setIsAuthenticated(true);
            setIsAdmin(response.data.isAdmin);
          } else {
            localStorage.removeItem('tsvrot-auth-token');
          }
        })
        .catch(() => {
          localStorage.removeItem('tsvrot-auth-token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (password: string) => {
    try {
      const response = await authApi.login(password);
      if (response.success && response.data) {
        localStorage.setItem('tsvrot-auth-token', response.data.token);
        setIsAuthenticated(true);
        setIsAdmin(response.data.isAdmin);
        toast.success('Erfolgreich angemeldet!');
        return true;
      } else {
        toast.error('Ungültiges Passwort');
        return false;
      }
    } catch (error) {
      toast.error('Anmeldung fehlgeschlagen');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tsvrot-auth-token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    toast.success('Erfolgreich abgemeldet');
  }, []);

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
  };
}

// Trainers Hooks
export function useTrainers() {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const response = await trainersApi.getAll();
      if (response.success) return response.data || [];
      throw new Error(response.error || 'Failed to fetch trainers');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrainer(id: number) {
  return useQuery({
    queryKey: ['trainers', id],
    queryFn: async () => {
      const response = await trainersApi.getById(id);
      if (response.success) return response.data;
      throw new Error(response.error || 'Failed to fetch trainer');
    },
    enabled: !!id,
  });
}

export function useCreateTrainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TrainerFormData) => trainersApi.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trainers'] });
        toast.success('Trainer erfolgreich erstellt!');
      } else {
        toast.error(response.error || 'Fehler beim Erstellen');
      }
    },
    onError: () => {
      toast.error('Fehler beim Erstellen des Trainers');
    },
  });
}

export function useUpdateTrainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TrainerFormData> }) => 
      trainersApi.update(id, data),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trainers'] });
        queryClient.invalidateQueries({ queryKey: ['trainers', id] });
        toast.success('Trainer erfolgreich aktualisiert!');
      } else {
        toast.error(response.error || 'Fehler beim Aktualisieren');
      }
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Trainers');
    },
  });
}

export function useDeleteTrainer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => trainersApi.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['trainers'] });
        toast.success('Trainer erfolgreich gelöscht!');
      } else {
        toast.error(response.error || 'Fehler beim Löschen');
      }
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Trainers');
    },
  });
}

// Courses Hooks
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await coursesApi.getAll();
      if (response.success) return response.data || [];
      throw new Error(response.error || 'Failed to fetch courses');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: async () => {
      const response = await coursesApi.getById(id);
      if (response.success) return response.data;
      throw new Error(response.error || 'Failed to fetch course');
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CourseFormData) => coursesApi.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['week-plan'] });
        toast.success('Kurs erfolgreich erstellt!');
      } else {
        toast.error(response.error || 'Fehler beim Erstellen');
      }
    },
    onError: () => {
      toast.error('Fehler beim Erstellen des Kurses');
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CourseFormData> }) => 
      coursesApi.update(id, data),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['courses', id] });
        queryClient.invalidateQueries({ queryKey: ['week-plan'] });
        toast.success('Kurs erfolgreich aktualisiert!');
      } else {
        toast.error(response.error || 'Fehler beim Aktualisieren');
      }
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Kurses');
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['week-plan'] });
        toast.success('Kurs erfolgreich gelöscht!');
      } else {
        toast.error(response.error || 'Fehler beim Löschen');
      }
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Kurses');
    },
  });
}

// Week Plan Hook
export function useWeekPlan(weekStart: Date = getWeekStart()) {
  const weekDateString = formatDate(weekStart, 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['week-plan', weekDateString],
    queryFn: async () => {
      const response = await coursesApi.getWeekPlan(weekDateString);
      if (response.success) return response.data;
      throw new Error(response.error || 'Failed to fetch week plan');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Assignments Hooks
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      courseId, 
      trainerId, 
      weekDate, 
      isSubstitute = false 
    }: {
      courseId: number;
      trainerId: number;
      weekDate: string;
      isSubstitute?: boolean;
    }) => assignmentsApi.create(courseId, trainerId, weekDate, isSubstitute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['week-plan'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Trainer erfolgreich zugewiesen!');
    },
    onError: () => {
      toast.error('Fehler beim Zuweisen des Trainers');
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => assignmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['week-plan'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Zuweisung erfolgreich entfernt!');
    },
    onError: () => {
      toast.error('Fehler beim Entfernen der Zuweisung');
    },
  });
}

// Absences Hooks
export function useAbsences() {
  return useQuery({
    queryKey: ['absences'],
    queryFn: async () => {
      const response = await absencesApi.getAll();
      if (response.success) return response.data || [];
      throw new Error(response.error || 'Failed to fetch absences');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateAbsence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AbsenceFormData) => absencesApi.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['absences'] });
        queryClient.invalidateQueries({ queryKey: ['week-plan'] });
        toast.success('Ausfall erfolgreich gemeldet!');
      } else {
        toast.error(response.error || 'Fehler beim Melden');
      }
    },
    onError: () => {
      toast.error('Fehler beim Melden des Ausfalls');
    },
  });
}

export function useDeleteAbsence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => absencesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      queryClient.invalidateQueries({ queryKey: ['week-plan'] });
      toast.success('Ausfall erfolgreich gelöscht!');
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Ausfalls');
    },
  });
}

// Dashboard Stats Hook
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await statsApi.getDashboard();
      if (response.success) return response.data;
      throw new Error(response.error || 'Failed to fetch stats');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Local State Hooks
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Search and Filter Hook
export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  initialQuery = ''
) {
  const [query, setQuery] = useState(initialQuery);
  
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery);
        }
        if (Array.isArray(value)) {
          return value.some((v) => 
            typeof v === 'string' && v.toLowerCase().includes(lowerQuery)
          );
        }
        return false;
      })
    );
  }, [items, query, searchFields]);

  return {
    query,
    setQuery,
    filteredItems,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
  };
}

// Pagination Hook
export function usePagination<T>(items: T[], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);
  
  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);
  
  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, items.length),
    totalItems: items.length,
  };
}
