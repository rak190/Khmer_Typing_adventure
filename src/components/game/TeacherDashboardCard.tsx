import type { ReactNode } from 'react';

type TeacherDashboardCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
};

export default function TeacherDashboardCard({ title, value, subtitle, icon }: TeacherDashboardCardProps) {
  return (
    <div className="game-card rounded-2xl p-4 text-center">
      <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-sky text-adventure">{icon}</div>
      <div className="text-sm font-black text-adventure">{title}</div>
      <div className="mt-1 text-3xl font-black text-slateGame">{value}</div>
      {subtitle && <div className="text-xs font-bold text-primary">{subtitle}</div>}
    </div>
  );
}
