import WeeklyPlanPage from './weekly-plan/WeeklyPlanPage';

interface DashboardProps {
  isAdmin: boolean;
  onTabChange: (tab: string) => void;
}

function Dashboard({ isAdmin }: DashboardProps) {
  return (
    <div>
      {/* Dashboard zeigt einfach den Wochenplan für aktuelle Woche */}
      <WeeklyPlanPage isAdmin={isAdmin} isDashboard={true} />
    </div>
  );
}

export default Dashboard;
