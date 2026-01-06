import { PieChart, Pie, Cell } from "recharts";

type DonutDatum = { name: string; value: number };

type Props = {
  data: DonutDatum[];
  colors: readonly string[];
};

const SIZE = 220;

export default function TopMenuDonutNoLabel({ data, colors }: Props) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="flex-none min-w-0" style={{ width: SIZE, height: SIZE }}>
      <PieChart width={SIZE} height={SIZE}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx={SIZE / 2}
          cy={SIZE / 2}
          innerRadius={Math.round(SIZE * 0.31)} // 62% 느낌
          outerRadius={Math.round(SIZE * 0.44)} // 88% 느낌
          paddingAngle={2}
          cornerRadius={6}
          isAnimationActive={false}
          labelLine={false}
          label={false}
        >
          {data.map((_, idx) => (
            <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
}
