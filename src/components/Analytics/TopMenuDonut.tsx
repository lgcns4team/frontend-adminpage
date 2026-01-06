// src/components/Analytics/TopMenuDonut.tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DEFAULT_COLORS, GENDER_COLORS } from "../../constants/colors";

type DonutDatum = { name: string; value: number };

type Props = {
  data: DonutDatum[];
  variant?: "gender" | "default";
  /** 조각 안(도넛 링 안쪽)에 이름+% 표시 (기본 true) */
  showValueLabel?: boolean;
};

function getColors(variant?: Props["variant"]) {
  return variant === "gender" ? GENDER_COLORS : DEFAULT_COLORS;
}

// ✅ 조각 "안"에 (이름 + 퍼센트) 찍는 커스텀 라벨
function renderInnerNamePercentLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, value } =
    props;

  if (typeof percent !== "number") return null;

  const pct = Math.round(percent * 100);
  if (pct <= 0) return null;

  // 도넛 링 "가운데" 위치
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55; // 0.5~0.6 사이 취향
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);

  // 텍스트: "여성 47%" / "50대 19%"
  const labelText =
    typeof name === "string" && name.length > 0 ? `${name} ${pct}%` : `${pct}%`;

  // 이름이 길면 줄바꿈(연령대는 짧아서 거의 필요없긴 함)
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
    <div className="w-[220px] h-[220px] min-w-[220px] min-h-[220px]">
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
            //  여기! 조각 안에 % 찍기
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
      </ResponsiveContainer>
    </div>
  );
}
