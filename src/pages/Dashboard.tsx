// src/pages/Dashboard.tsx
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import TopMenuDonut from "../components/Analytics/TopMenuDonut";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Period = "today" | "yesterday" | "custom";

/** ----- 원본 로그 타입(기간 필터의 기준) ----- */
type VisitLog = {
  ts: Date; // 방문 타임스탬프
  sales: number; // 해당 방문/주문이 만든 매출(목데이터)
  gender: "male" | "female";
  ageGroup: "10" | "20" | "30" | "40" | "50p";
  menu: "아메리카노" | "라떼" | "바닐라라떼" | "카푸치노" | "디카페인";
};

/** ----- 유틸: yyyy-mm-dd ----- */
function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function todayStr() {
  return toYmd(new Date());
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toYmd(d);
}

/** ----- 날짜 범위 포함 체크 (날짜 단위) ----- */
function inRangeDay(ts: Date, startYmd: string, endYmd: string) {
  const ymd = toYmd(ts);
  return ymd >= startYmd && ymd <= endYmd;
}

/** ----- 날짜 포맷 (MM/DD) ----- */
function toMd(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

/** ✅ Date -> YYYY-MM-DD string(로컬) 기반으로 파싱 안정화 */
function ymdToDate(ymd: string) {
  // "2025-12-16" -> 로컬 자정 Date
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

/** ----- 목데이터 생성: 7일치(오늘 포함) + 시간대(09~16) 방문/매출 ----- */
function buildMockLogs(): VisitLog[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  const menus: VisitLog["menu"][] = [
    "아메리카노",
    "라떼",
    "바닐라라떼",
    "카푸치노",
    "디카페인",
  ];

  const logs: VisitLog[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = new Date(base);
    day.setDate(base.getDate() - dayOffset);

    for (let hour = 9; hour <= 16; hour++) {
      const baseVisits =
        hour === 12
          ? 18
          : hour === 11
          ? 16
          : hour === 10
          ? 12
          : hour === 15
          ? 9
          : 8;

      const dayFactor = 1 + (dayOffset % 3) * 0.08;
      const visits = Math.max(4, Math.round(baseVisits * dayFactor));

      for (let i = 0; i < visits; i++) {
        const ts = new Date(day);
        ts.setHours(hour, Math.floor((i * 60) / visits), 0, 0);

        const gender: VisitLog["gender"] = i % 2 === 0 ? "female" : "male";

        const ageGroup: VisitLog["ageGroup"] =
          i % 10 < 2
            ? "10"
            : i % 10 < 6
            ? "20"
            : i % 10 < 8
            ? "30"
            : i % 10 < 9
            ? "40"
            : "50p";

        const menu = menus[(i + hour) % menus.length];

        const price =
          menu === "아메리카노"
            ? 4500
            : menu === "라떼"
            ? 5500
            : menu === "바닐라라떼"
            ? 6000
            : menu === "카푸치노"
            ? 5800
            : 5000;

        const sales = Math.round(
          price * (1 + (hour - 9) * 0.02) * (1 + (dayOffset % 4) * 0.03)
        );

        logs.push({ ts, sales, gender, ageGroup, menu });
      }
    }
  }

  return logs;
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("today");

  // 기간설정 입력값
  const [start, setStart] = useState("2025-12-10");
  const [end, setEnd] = useState("2025-12-16");

  // 실제 적용값
  const [applied, setApplied] = useState<{ start: string; end: string }>({
    start: todayStr(),
    end: todayStr(),
  });

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    if (p === "today") setApplied({ start: todayStr(), end: todayStr() });
    if (p === "yesterday") {
      const y = yesterdayStr();
      setApplied({ start: y, end: y });
    }
    // custom은 적용 버튼에서만 반영
  };

  const applyCustomRange = () => {
    if (!start || !end) return alert("시작일/종료일을 선택해줘!");
    if (start > end) return alert("시작일이 종료일보다 늦어!");
    setApplied({ start, end });
  };

  /** ----- 원본 로그 ----- */
  const logs = useMemo(() => buildMockLogs(), []);

  /** ----- 적용 기간으로 필터 ----- */
  const filtered = useMemo(() => {
    return logs.filter((l) => inRangeDay(l.ts, applied.start, applied.end));
  }, [logs, applied.start, applied.end]);

  /** ✅ 전체 데이터 존재 여부 (기간 필터 결과 기준) */
  const hasData = filtered.length > 0;

  /** ----- KPI (총매출/주문건수) ----- */
  const kpi = useMemo(() => {
    const totalSales = filtered.reduce((sum, l) => sum + l.sales, 0);
    const totalOrders = filtered.length;
    return { totalSales, totalOrders };
  }, [filtered]);

  /**
   * ✅ 일간 매출(BarChart) — "항상 최근 7일(오늘 기준)" 고정
   * - applied/period 상관없이 최근 7일만 표시
   * - 데이터 집계는 logs(전체 원본) 기준
   */
  const dailyChartData = useMemo(() => {
    const endD = new Date();
    endD.setHours(0, 0, 0, 0);

    const startD = new Date(endD);
    startD.setDate(endD.getDate() - 6);

    // 7일 키를 먼저 만들어 0도 표시
    const map = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(startD);
      d.setDate(startD.getDate() + i);
      map.set(toYmd(d), 0);
    }

    // logs에서 해당 7일 범위만 합산
    logs.forEach((l) => {
      const d = new Date(l.ts);
      d.setHours(0, 0, 0, 0);
      if (d >= startD && d <= endD) {
        const key = toYmd(d);
        map.set(key, (map.get(key) ?? 0) + l.sales);
      }
    });

    // 날짜 순으로 rows 생성
    const rows: { day: string; sales: number }[] = [];
    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      const key = toYmd(d);
      rows.push({ day: toMd(d), sales: map.get(key) ?? 0 });
    }
    return rows;
  }, [logs]);

  /** ✅ 일간 매출이 실제로 0이 아닌 값이 있는지 (최근7일 기준) */
  const hasDailyData = dailyChartData.some((d) => d.sales > 0);

  /** ----- 시간대별 매출(LineChart) ----- */
  const hourlyChartData = useMemo(() => {
    const hourMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourMap.set(h, 0);

    filtered.forEach((l) => {
      const h = l.ts.getHours();
      hourMap.set(h, (hourMap.get(h) ?? 0) + l.sales);
    });

    const rows: { label: string; sales: number }[] = [];
    for (let h = 9; h <= 16; h++) {
      rows.push({
        label: `${String(h).padStart(2, "0")}시`,
        sales: hourMap.get(h) ?? 0,
      });
    }
    return rows;
  }, [filtered]);

  /** ----- 성별 도넛 ----- */
  const genderData = useMemo(() => {
    const male = filtered.filter((l) => l.gender === "male").length;
    const female = filtered.filter((l) => l.gender === "female").length;
    return [
      { name: "남성", value: male },
      { name: "여성", value: female },
    ];
  }, [filtered]);

  /** ----- 연령 도넛 ----- */
  const ageData = useMemo(() => {
    const total = { a10: 0, a20: 0, a30: 0, a40: 0, a50p: 0 };
    filtered.forEach((l) => {
      if (l.ageGroup === "10") total.a10 += 1;
      if (l.ageGroup === "20") total.a20 += 1;
      if (l.ageGroup === "30") total.a30 += 1;
      if (l.ageGroup === "40") total.a40 += 1;
      if (l.ageGroup === "50p") total.a50p += 1;
    });
    return [
      { name: "10대", value: total.a10 },
      { name: "20대", value: total.a20 },
      { name: "30대", value: total.a30 },
      { name: "40대", value: total.a40 },
      { name: "50대+", value: total.a50p },
    ];
  }, [filtered]);

  /** ----- TOP5 메뉴(기간 따라 변함) ----- */
  const topMenuData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((l) => {
      map.set(l.menu, (map.get(l.menu) ?? 0) + 1);
    });

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 space-y-6">
        {/* 기간 버튼 + 커스텀 입력 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={period === "today" ? "default" : "outline"}
                onClick={() => handlePeriod("today")}
              >
                오늘
              </Button>
              <Button
                size="sm"
                variant={period === "yesterday" ? "default" : "outline"}
                onClick={() => handlePeriod("yesterday")}
              >
                어제
              </Button>
              <Button
                size="sm"
                variant={period === "custom" ? "default" : "outline"}
                onClick={() => handlePeriod("custom")}
              >
                기간 설정
              </Button>

              <span className="ml-auto text-xs text-gray-500">
                적용기간: {applied.start} ~ {applied.end}
              </span>
            </div>

            {period === "custom" && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                />
                <span className="text-sm text-gray-500">~</span>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                />
                <Button size="sm" onClick={applyCustomRange}>
                  적용
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 타이틀 */}
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-gray-500">
            선택한 기간 기준으로 주요 지표를 확인하세요.
          </p>
        </div>

        {/* KPI + 도넛 */}
        <div className="grid gap-4 lg:grid-cols-4">
          <KpiCard
            title="총 매출"
            value={hasData ? `₩${kpi.totalSales.toLocaleString()}` : "—"}
            sub={
              hasData
                ? `주문 ${kpi.totalOrders.toLocaleString()}건`
                : "데이터 없음"
            }
          />
          <KpiCard
            title="평균 주문 금액"
            value={
              hasData
                ? `₩${Math.round(
                    kpi.totalSales / Math.max(kpi.totalOrders, 1)
                  ).toLocaleString()}`
                : "—"
            }
            sub={hasData ? "총 매출 / 주문 건수" : "데이터 없음"}
          />

          <Card>
            <CardHeader>
              <CardTitle>방문 성별 비율</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {hasData ? <TopMenuDonut data={genderData} /> : <EmptyState />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>방문 연령대 비율</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {hasData ? <TopMenuDonut data={ageData} /> : <EmptyState />}
            </CardContent>
          </Card>
        </div>

        {/* 차트 2열 */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 시간대별 매출 */}
          <Card>
            <CardHeader>
              <CardTitle>시간대별 매출</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={hourlyChartData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="label"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) =>
                          `₩${Math.round((v as number) / 10000)}만`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `₩${(value as number).toLocaleString()}`,
                          "매출",
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#111827"
                        strokeWidth={1}
                        dot={{ r: 3, fill: "#111827" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
                )}
              </div>
            </CardContent>
          </Card>

          {/* ✅ 일간 매출: 항상 최근 7일 */}
          <Card>
            <CardHeader>
              <CardTitle>일간 매출 (최근 7일)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                {hasDailyData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyChartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      barCategoryGap={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickFormatter={(v) =>
                          `₩${Math.round((v as number) / 10000)}만`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `₩${(value as number).toLocaleString()}`,
                          "매출",
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar
                        dataKey="sales"
                        fill="#111827"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 인기메뉴 TOP5 */}
        <Card>
          <CardHeader>
            <CardTitle>인기메뉴 TOP5</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {hasData && topMenuData.length > 0 ? (
              <TopMenuDonut data={topMenuData} />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** ---------- 작은 컴포넌트들 ---------- */
function KpiCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-gray-500">{sub}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="h-[240px] w-full flex items-center justify-center text-sm text-gray-500">
      선택한 기간에 표시할 데이터가 없습니다.
    </div>
  );
}
