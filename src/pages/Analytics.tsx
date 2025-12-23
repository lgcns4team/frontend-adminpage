import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";

import SalesTrendChart from "../components/Analytics/SalesTrendChart";
import DayOfWeekChart from "../components/Analytics/DayOfWeekChart";

import {
  MOCK_SALES,
  inRange,
  sumKpi,
  groupByWeekday,
} from "../components/Analytics/MockSales";

type Period = "today" | "yesterday" | "custom";

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

export default function Analytics() {
  const [period, setPeriod] = useState<Period>("today");

  // 기간설정 입력값(화면에서 바꾸는 값)
  const [start, setStart] = useState("2025-12-10");
  const [end, setEnd] = useState("2025-12-16");

  // 실제 적용된 기간 (오늘/어제 클릭 or 적용 버튼)
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
    // custom은 "적용" 누를 때만 반영
  };

  const applyCustomRange = () => {
    if (!start || !end) return alert("시작일/종료일을 선택해줘!");
    if (start > end) return alert("시작일이 종료일보다 늦어!");
    setApplied({ start, end });
  };

  // 적용된 기간으로 데이터 필터링
  const filtered = useMemo(() => {
    return MOCK_SALES.filter((p) =>
      inRange(p.date, applied.start, applied.end)
    );
  }, [applied.start, applied.end]);

  // KPI 계산
  const kpi = useMemo(() => sumKpi(filtered), [filtered]);

  // 차트용 데이터
  const trendData = useMemo(
    () => filtered.map((p) => ({ date: p.date, sales: p.sales })),
    [filtered]
  );
  const weekdayData = useMemo(() => groupByWeekday(filtered), [filtered]);

  return (
    <div className="space-y-6">
      {/* 상단 타이틀 */}
      <div>
        <h1 className="text-2xl font-bold">매출 분석</h1>
        <p className="text-sm text-gray-500">
          매장의 매출 현황과 트렌드를 확인합니다
        </p>
      </div>

      {/* 기간 선택 */}
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

      {/* KPI 2개 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              총 매출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₩{kpi.totalSales.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">
              주문 {kpi.totalOrders.toLocaleString()}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              평균 주문 금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₩{kpi.avgOrder.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">총 매출 / 주문 건수</p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 2개 */}
      <SalesTrendChart data={trendData} />
      <DayOfWeekChart data={weekdayData} />

      {filtered.length === 0 && (
        <p className="text-sm text-gray-500">
          선택한 기간에 표시할 데이터가 없습니다.
        </p>
      )}
    </div>
  );
}
