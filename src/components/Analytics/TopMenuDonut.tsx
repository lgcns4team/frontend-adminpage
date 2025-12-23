// src/components/Analytics/TopMenuDonut.tsx
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Item = { name: string; value: number };

export default function TopMenuDonut({ data }: { data: Item[] }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="text-base font-semibold">인기메뉴 TOP5</h3>
      <p className="mt-1 text-sm text-gray-500">기간 내 판매 비중</p>

      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
            />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
