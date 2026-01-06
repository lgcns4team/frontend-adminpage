<<<<<<< HEAD
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
=======
import { PieChart, Pie, Cell } from "recharts";
import { DEFAULT_COLORS, GENDER_COLORS } from "../../constants/colors";
>>>>>>> admintest

type DonutDatum = { name: string; value: number };

type Props = {
  data: DonutDatum[];
<<<<<<< HEAD
  /**
   * 색상 프리셋
   * - "gender": 남성(파랑) / 여성(회색)
   * - "default": 기본 팔레트(Top5, 연령대 등)
   */
  variant?: "gender" | "default";
  /**
   * 도넛 안에 숫자 표시 여부 (기본 true)
   */
  showValueLabel?: boolean;
};

const GENDER_COLORS = ["#2563eb", "#9ca3af"]; // 파랑 / 회색

// Top5/연령대용 기본 팔레트 (원하면 여기 더 추가)
const DEFAULT_COLORS = [
  "#111827", // 거의 검정
  "#374151", // 진회색
  "#6b7280", // 회색
  "#9ca3af", // 연회색
  "#2563eb", // 파랑 (포인트)
];

function getColors(variant: Props["variant"]) {
  return variant === "gender" ? GENDER_COLORS : DEFAULT_COLORS;
}

// 가운데 숫자(합계) 만들고 싶으면 여기서 확장 가능
function sumValues(data: DonutDatum[]) {
  return data.reduce((acc, cur) => acc + (cur.value ?? 0), 0);
=======
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
>>>>>>> admintest
}

export default function TopMenuDonut({
  data,
  variant = "default",
  showValueLabel = true,
}: Props) {
<<<<<<< HEAD
  const colors = getColors(variant);

  // 데이터 없으면 렌더링 최소화
  if (!data || data.length === 0) return null;

  const total = sumValues(data);

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
            label={
              showValueLabel
                ? ({ value }) => (typeof value === "number" ? `${value}` : "")
                : undefined
            }
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>

          {/* 가운데 합계 텍스트: 원하면 켜라 (지금은 주석)
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 14, fontWeight: 700, fill: "#111827" }}
          >
            {total}
          </text>
          */}
        </PieChart>
      </ResponsiveContainer>
=======
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
>>>>>>> admintest
    </div>
  );
}
