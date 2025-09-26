import WeeklyPlanPage from './weekly-plan/WeeklyPlanPage';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

function Dashboard({ }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Direkt zur WeeklyPlanPage ohne extra Header */}
      <WeeklyPlanPage isDashboard={true} />
    </div>
  );
}

export default Dashboard;


