import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { useWeekPlan } from '@/hooks';
import { getWeekStart, getWeekDates, formatDate, addDays } from '@/utils';
import { Card, LoadingSpinner, EmptyState } from '@/components/ui';

function WeekPlan() {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());
  const { data: weekPlan, isLoading, error } = useWeekPlan(currentWeek);

  const weekDates = getWeekDates(currentWeek);
  
  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };
  
  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };
  
  const goToCurrentWeek = () => {
    setCurrentWeek(getWeekStart());
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-tsv-red-600">
          Fehler beim Laden des Wochenplans: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wochenplan</h1>
          <p className="text-gray-600">
            Übersicht der Kurse und Trainer-Zuweisungen
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={goToPreviousWeek}
            className="btn btn-secondary p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToCurrentWeek}
            className="btn btn-primary"
          >
            Heute
          </button>
          
          <button
            onClick={goToNextWeek}
            className="btn btn-secondary p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Range Display */}
      <Card>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {formatDate(weekDates[0], 'dd.MM.')} - {formatDate(weekDates[6], 'dd.MM.yyyy')}
          </h2>
          <p className="text-sm text-gray-600">
            KW {Math.ceil(weekDates[0].getDate() / 7)}
          </p>
        </div>
      </Card>

      {/* Week Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDates.map((date, index) => (
          <DayColumn 
            key={index} 
            date={date} 
            courses={weekPlan?.courses || []} 
          />
        ))}
      </div>

      {(!weekPlan || weekPlan.courses.length === 0) && (
        <EmptyState
          icon={Calendar}
          title="Keine Kurse geplant"
          description="Für diese Woche sind noch keine Kurse eingeplant."
        />
      )}
    </div>
  );
}

// Day Column Component
interface DayColumnProps {
  date: Date;
  courses: any[]; // Replace with proper course type
}

function DayColumn({ date, courses }: DayColumnProps) {
  const dayName = formatDate(date, 'EEEE');
  const dayNumber = formatDate(date, 'dd');
  const isToday = formatDate(date, 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd');

  // Filter courses for this day
  const dayCourses = courses.filter(course => course.day === dayName);

  return (
    <div className="space-y-2">
      {/* Day Header */}
      <div className={`card ${isToday ? 'bg-tsv-blue-50 border-tsv-blue-200' : ''}`}>
        <div className="text-center">
          <h3 className={`font-semibold ${isToday ? 'text-tsv-blue-900' : 'text-gray-900'}`}>
            {dayName}
          </h3>
          <p className={`text-sm ${isToday ? 'text-tsv-blue-700' : 'text-gray-600'}`}>
            {dayNumber}
          </p>
        </div>
      </div>

      {/* Day Courses */}
      <div className="space-y-2">
        {dayCourses.length === 0 ? (
          <div className="card bg-gray-50">
            <p className="text-xs text-gray-500 text-center">Keine Kurse</p>
          </div>
        ) : (
          dayCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </div>
  );
}

// Course Card Component
interface CourseCardProps {
  course: any; // Replace with proper course type
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="card bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <div>
        <h4 className="font-medium text-gray-900 text-sm mb-1">
          {course.name}
        </h4>
        
        <div className="flex items-center text-xs text-gray-600 mb-2">
          <Clock className="w-3 h-3 mr-1" />
          {course.startTime} - {course.endTime}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-600">
            <Users className="w-3 h-3 mr-1" />
            {course.assignedTrainers?.length || 0}/{course.requiredTrainers}
          </div>
          
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${course.status === 'full' 
              ? 'bg-tsv-green-100 text-tsv-green-800'
              : course.status === 'partial'
              ? 'bg-tsv-yellow-100 text-tsv-yellow-800'
              : 'bg-tsv-red-100 text-tsv-red-800'
            }
          `}>
            {course.status === 'full' ? 'Besetzt' : 
             course.status === 'partial' ? 'Teilweise' : 'Offen'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeekPlan;
