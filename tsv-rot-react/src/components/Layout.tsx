import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar,
  Users, 
  BookOpen,
  UserX,
  BarChart3,
  Menu,
  X,
  LogOut,
  Settings,
  Home
} from 'lucide-react';

import { useAuth } from '@/hooks';
import { cn } from '@/utils';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Wochenplan',
    href: '/wochenplan',
    icon: Calendar,
  },
  {
    name: 'Trainer',
    href: '/trainer',
    icon: Users,
  },
  {
    name: 'Kurse',
    href: '/kurse',
    icon: BookOpen,
  },
  {
    name: 'Ausfälle',
    href: '/ausfaelle',
    icon: UserX,
  },
];

function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, logout } = useAuth();
  const location = useLocation();

  const isCurrentPage = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || isAdmin
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-tsv-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TSV</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  Trainer-App
                </h1>
                <p className="text-xs text-gray-500">TSV 1905 Rot e.V.</p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPage(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                    current
                      ? 'bg-tsv-blue-100 text-tsv-blue-700 border-r-2 border-tsv-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      current
                        ? 'text-tsv-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Admin Badge */}
          {isAdmin && (
            <div className="px-4 py-2">
              <div className="bg-tsv-blue-50 border border-tsv-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Settings className="w-4 h-4 text-tsv-blue-600 mr-2" />
                  <span className="text-xs font-medium text-tsv-blue-700">
                    Admin-Modus
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
            >
              <LogOut className="mr-3 h-4 w-4 text-gray-400" />
              Abmelden
            </button>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                © 2025 Sissy Hägele
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">
              TSV Rot Trainer-App
            </h1>
            
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
