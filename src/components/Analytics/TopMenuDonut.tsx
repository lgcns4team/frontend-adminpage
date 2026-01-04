// src/components/Analytics/TopMenuDonut.tsx
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

type Item = { name: string; value: number };

export default function TopMenuDonut({ data }: { data: Item[] }) {
  return (
    <div className="h-[240px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
          />
          <Tooltip
            formatter={(value, name) => [
              (value ?? 0).toLocaleString(),
              name ?? "",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
