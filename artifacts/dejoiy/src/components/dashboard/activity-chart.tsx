import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = Array.from({ length: 14 }).map((_, i) => {
  const base = 60 + Math.sin(i / 2) * 12 + Math.random() * 8;
  return {
    day: `D${i + 1}`,
    Productivity: Math.round(base),
    Focus: Math.round(base * (0.7 + Math.random() * 0.2)),
  };
});

export function ActivityChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-prod" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-focus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} className="text-gray-400" />
          <YAxis tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} className="text-gray-400" />
          <Tooltip
            contentStyle={{
              background: "rgba(255,255,255,0.96)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 12,
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
              fontSize: 12,
            }}
            wrapperClassName="dark:!bg-zinc-900/95 dark:!border-white/10"
          />
          <Area type="monotone" dataKey="Productivity" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#grad-prod)" />
          <Area type="monotone" dataKey="Focus" stroke="#22d3ee" strokeWidth={2.5} fill="url(#grad-focus)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
