import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type DonutDatum = { name: string; value: number };

type Props = {
  data: DonutDatum[];
  colors: readonly string[];
};

export default function TopMenuDonutNoLabel({ data, colors }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-[220px] h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            cornerRadius={6}
            isAnimationActive={false}
            labelLine={false}
            label={false} // ✅ TOP5는 라벨 완전 제거
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
