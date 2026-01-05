// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
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
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardSummary } from "../api/dashboard";
import type { DashboardSummary } from "../api/dashboard";

type Period = "today" | "yesterday" | "custom";

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

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("today");

  // 기간설정 입력값
  const [start, setStart] = useState("2025-12-23");
  const [end, setEnd] = useState("2025-12-31");

  // 실제 적용값
  const [applied, setApplied] = useState<{ start: string; end: string }>({
    start: todayStr(),
    end: todayStr(),
  });

  // API 데이터 (KPI용 / 차트용 분리)
  const [kpiData, setKpiData] = useState<DashboardSummary | null>(null);
  const [chartData, setChartData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    if (p === "today") setApplied({ start: todayStr(), end: todayStr() });
    if (p === "yesterday") {
      const y = yesterdayStr();
      setApplied({ start: y, end: y });
    }
  };

  const applyCustomRange = () => {
    if (!start || !end) return alert("시작일/종료일을 선택해줘!");
    if (start > end) return alert("시작일이 종료일보다 늦어!");
    setApplied({ start, end });
  };

  // API 호출 - KPI와 차트 데이터 분리
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("대시보드 데이터 조회:", applied.start, "~", applied.end);

        // 1. KPI용 데이터 (선택한 기간 그대로)
        const kpiResponse = await getDashboardSummary({
          startDate: applied.start,
          endDate: applied.end,
        });
        setKpiData(kpiResponse);

        // 2. 차트용 데이터 (단일 날짜면 7일로 확장)
        let chartStartDate = applied.start;
        let chartEndDate = applied.end;

        if (applied.start === applied.end) {
          const endDate = new Date(applied.end);
          const startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 6); // 7일 (오늘 포함)
          chartStartDate = toYmd(startDate);
        }

        const chartResponse = await getDashboardSummary({
          startDate: chartStartDate,
          endDate: chartEndDate,
        });
        setChartData(chartResponse);

        console.log("대시보드 데이터 조회 성공");
      } catch (err) {
        console.error("대시보드 데이터 조회 실패:", err);
        setError("대시보드 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [applied.start, applied.end]);

  // 데이터 존재 여부
  const hasData = kpiData !== null && kpiData.totalOrders > 0;

  // KPI (선택한 기간 데이터)
  const kpi = useMemo(() => {
    if (!kpiData) return { totalSales: 0, totalOrders: 0, avgOrderAmount: 0 };
    return {
      totalSales: kpiData.totalSales,
      totalOrders: kpiData.totalOrders,
      avgOrderAmount: kpiData.avgOrderAmount,
    };
  }, [kpiData]);

  // 시간대별 매출 차트 데이터 (KPI 기간)
  const hourlyChartData = useMemo(() => {
    if (!kpiData || !kpiData.hourlySales) return [];
    return kpiData.hourlySales.map((h) => ({
      label: h.timeLabel,
      sales: h.amount,
    }));
  }, [kpiData]);

  // 일간 매출 차트 데이터 (7일 확장 데이터)
  const dailyChartData = useMemo(() => {
    if (!chartData || !chartData.dailySales) return [];

    // 단일 날짜 선택 시에만 강조 (오늘/어제)
    const shouldHighlight = applied.start === applied.end;
    const selectedDate = applied.end;

    return chartData.dailySales.map((d) => ({
      day: d.dateLabel,
      sales: d.amount,
      isSelected: shouldHighlight && d.date === selectedDate,
    }));
  }, [chartData, applied.start, applied.end]);

  const hasDailyData = dailyChartData.some((d) => d.sales > 0);

  // 성별 도넛 데이터 (KPI 기간)
  const genderData = useMemo(() => {
    if (!kpiData || !kpiData.genderRatio) return [];
    const { genderRatio } = kpiData;
    return [
      { name: "남성", value: genderRatio.maleCount },
      { name: "여성", value: genderRatio.femaleCount },
    ];
  }, [kpiData]);

  // 연령대 도넛 데이터 (KPI 기간)
  const ageData = useMemo(() => {
    if (!kpiData || !kpiData.ageGroupRatios) return [];
    return kpiData.ageGroupRatios.map((a) => ({
      name: a.ageGroup,
      value: a.count,
    }));
  }, [kpiData]);

  // 인기메뉴 도넛 + 리스트 데이터 (KPI 기간)
  const topMenuData = useMemo(() => {
    if (!kpiData || !kpiData.popularMenus) return [];
    return kpiData.popularMenus.map((m) => ({
      name: m.menuName,
      value: m.orderCount,
    }));
  }, [kpiData]);

  // 로딩 중
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-2 text-lg font-semibold">로딩 중...</div>
              <div className="text-sm text-gray-400">
                대시보드 데이터를 불러오고 있습니다
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-2 text-lg font-semibold text-red-500">
                {error}
              </div>
              <div className="text-sm text-gray-400 mb-4">
                백엔드 서버가 실행 중인지 확인해주세요 (localhost:8080)
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                새로고침
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                ? `₩${Math.round(kpi.avgOrderAmount).toLocaleString()}`
                : "—"
            }
            sub={hasData ? "총 매출 / 주문 건수" : "데이터 없음"}
          />

          <Card>
            <CardHeader>
              <CardTitle>방문 성별 비율</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {hasData && genderData.length > 0 ? (
                <TopMenuDonut data={genderData} />
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>방문 연령대 비율</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {hasData && ageData.length > 0 ? (
                <TopMenuDonut data={ageData} />
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 차트 2열 */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 시간대별 매출 (10시~16시) */}
          <Card>
            <CardHeader>
              <CardTitle>시간대별 매출</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                {hasData && hourlyChartData.length > 0 ? (
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

          {/* 일간 매출 */}
          <Card>
            <CardHeader>
              <CardTitle>
                {applied.start === applied.end
                  ? "일간 매출 (최근 7일)"
                  : `일간 매출 (${applied.start} ~ ${applied.end})`}
              </CardTitle>
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
                      <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                        {dailyChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isSelected ? "#f06f6fff" : "#111827"}
                          />
                        ))}
                      </Bar>
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

          <CardContent>
            {hasData && topMenuData.length > 0 ? (
              <div className="flex items-center justify-center gap-10">
                {/* 도넛 */}
                <TopMenuDonut data={topMenuData} />

                {/* 리스트 */}
                <div className="min-w-[220px]">
                  <ul className="space-y-3 text-lg font-semibold text-gray-800">
                    {topMenuData.map((m, idx) => (
                      <li
                        key={m.name}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-7 text-gray-400 font-bold">
                            {idx + 1}.
                          </span>
                          <span> {m.name}</span>
                        </span>

                        <span className="text-gray-500 text-base font-bold">
                          {m.value}건
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
