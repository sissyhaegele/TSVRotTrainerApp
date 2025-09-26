import WeeklyPlanPage from './weekly-plan/WeeklyPlanPage';

interface DashboardProps {
  isAdmin: boolean;
  onTabChange: (tab: string) => void;
}

function Dashboard({ isAdmin }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Direkt zur WeeklyPlanPage ohne extra Header */}
      <WeeklyPlanPage isAdmin={isAdmin} isDashboard={true} />
    </div>
  );
}

export default Dashboard;
