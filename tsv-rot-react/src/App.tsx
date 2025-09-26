/**
 * TSV Rot Trainer Management System
 * Copyright (c) 2025 Sissy Hägele
 * All rights reserved
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from '@/components/Layout';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/components/Dashboard';
import WeekPlan from '@/components/WeekPlan';
import TrainersPage from '@/components/trainers/TrainersPage';
import CoursesPage from '@/components/courses/CoursesPage';
import AbsencesPage from '@/components/absences/AbsencesPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Hooks
import { useAuth } from '@/hooks';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Auth Wrapper Component
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Login Route */}
            <Route
              path="/login"
              element={
                <AuthWrapper>
                  <LoginPage />
                </AuthWrapper>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Dashboard - Default Route */}
                      <Route index element={<Dashboard />} />
                      
                      {/* Week Plan */}
                      <Route path="wochenplan" element={<WeekPlan />} />
                      
                      {/* Trainers - Admin only for full management */}
                      <Route 
                        path="trainer" 
                        element={<TrainersPage />} 
                      />
                      
                      {/* Courses - Admin only for full management */}
                      <Route 
                        path="kurse" 
                        element={<CoursesPage />} 
                      />
                      
                      {/* Absences */}
                      <Route path="ausfaelle" element={<AbsencesPage />} />

                      {/* Admin-only routes */}
                      <Route
                        path="trainer/neu"
                        element={
                          <AdminRoute>
                            <TrainersPage />
                          </AdminRoute>
                        }
                      />
                      
                      <Route
                        path="trainer/:id/bearbeiten"
                        element={
                          <AdminRoute>
                            <TrainersPage />
                          </AdminRoute>
                        }
                      />
                      
                      <Route
                        path="kurse/neu"
                        element={
                          <AdminRoute>
                            <CoursesPage />
                          </AdminRoute>
                        }
                      />
                      
                      <Route
                        path="kurse/:id/bearbeiten"
                        element={
                          <AdminRoute>
                            <CoursesPage />
                          </AdminRoute>
                        }
                      />

                      {/* 404 Redirect */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#059669',
                },
              },
              error: {
                style: {
                  background: '#DC2626',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
