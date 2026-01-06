import { PieChart, Pie, Cell } from "recharts";
import { DEFAULT_COLORS, GENDER_COLORS } from "../../constants/colors";

type DonutDatum = { name: string; value: number };

type Props = {
  data: DonutDatum[];
  variant?: "gender" | "default";
  showValueLabel?: boolean;
};

function getColors(variant?: Props["variant"]) {
  return variant === "gender" ? GENDER_COLORS : DEFAULT_COLORS;
}

const SIZE = 220;

// ✅ 조각 "안"에 (이름 + 퍼센트)
function renderInnerNamePercentLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  if (typeof percent !== "number") return null;

  const pct = Math.round(percent * 100);
  if (pct <= 0) return null;

  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);

  const labelText =
    typeof name === "string" && name.length > 0 ? `${name} ${pct}%` : `${pct}%`;
  const [first, second] = labelText.split(" ");
  const isTwoLine = Boolean(second);

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#ffffff"
      stroke="rgba(0,0,0,0.28)"
      strokeWidth={1}
      paintOrder="stroke"
      fontWeight={800}
    >
      {isTwoLine ? (
        <>
          <tspan x={x} dy="-0.2em" fontSize={11}>
            {first}
          </tspan>
          <tspan x={x} dy="1.2em" fontSize={12}>
            {second}
          </tspan>
        </>
      ) : (
        <tspan fontSize={12}>{labelText}</tspan>
      )}
    </text>
  );
}

export default function TopMenuDonut({
  data,
  variant = "default",
  showValueLabel = true,
}: Props) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const colors = getColors(variant);
  const safeColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS;

  return (
    <div className="flex-none min-w-0" style={{ width: SIZE, height: SIZE }}>
      <PieChart width={SIZE} height={SIZE}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx={SIZE / 2}
          cy={SIZE / 2}
          innerRadius={Math.round(SIZE * 0.31)}
          outerRadius={Math.round(SIZE * 0.44)}
          paddingAngle={2}
          cornerRadius={6}
          isAnimationActive={false}
          labelLine={false}
          label={showValueLabel ? renderInnerNamePercentLabel : false}
        >
          {data.map((_, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={safeColors[idx % safeColors.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
}
