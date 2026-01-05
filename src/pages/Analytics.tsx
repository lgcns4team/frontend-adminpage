import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import SalesTrendChart from "../components/Analytics/SalesTrendChart";
import DayOfWeekChart from "../components/Analytics/DayOfWeekChart";
import { getDashboardSummary } from "../api/dashboard";
import type { DashboardSummary } from "../api/dashboard";

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
  const [start, setStart] = useState("2025-12-23");
  const [end, setEnd] = useState("2025-12-31");
  const [applied, setApplied] = useState<{ start: string; end: string }>({
    start: todayStr(),
    end: todayStr(),
  });

  // API 데이터
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
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

  // API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('매출분석 데이터 조회:', applied.start, '~', applied.end);
        const data = await getDashboardSummary({
          startDate: applied.start,
          endDate: applied.end,
        });
        console.log('매출분석 데이터 조회 성공:', data);
        
        setDashboardData(data);
      } catch (err) {
        console.error('매출분석 데이터 조회 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applied.start, applied.end]);

  // KPI 계산
  const kpi = useMemo(() => {
    if (!dashboardData) return { totalSales: 0, totalOrders: 0, avgOrder: 0 };
    return {
      totalSales: dashboardData.totalSales,
      totalOrders: dashboardData.totalOrders,
      avgOrder: Math.round(dashboardData.avgOrderAmount),
    };
  }, [dashboardData]);

  // 일별 매출 추이 데이터
  const trendData = useMemo(() => {
    if (!dashboardData || !dashboardData.dailySales) return [];
    return dashboardData.dailySales.map(d => ({
      date: d.dateLabel,
      sales: d.amount,
    }));
  }, [dashboardData]);

  // 요일별 매출 데이터
  const weekdayData = useMemo(() => {
    if (!dashboardData || !dashboardData.dailySales) return [];
    
    // 요일별로 그룹화
    const weekdayMap = new Map<string, number>();
    dashboardData.dailySales.forEach(d => {
      const current = weekdayMap.get(d.dayOfWeek) || 0;
      weekdayMap.set(d.dayOfWeek, current + d.amount);
    });

    // 월~일 순서로 정렬
    const order = ["월", "화", "수", "목", "금", "토", "일"];
    return order.map(day => ({
      day: day + "요일",
      sales: weekdayMap.get(day) || 0,
    }));
  }, [dashboardData]);

  // 로딩 중
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-2 text-lg font-semibold">로딩 중...</div>
            <div className="text-sm text-gray-400">매출 데이터를 불러오고 있습니다</div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-2 text-lg font-semibold text-red-500">{error}</div>
            <div className="text-sm text-gray-400 mb-4">
              백엔드 서버가 실행 중인지 확인해주세요
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              새로고침
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

      {kpi.totalOrders === 0 && (
        <p className="text-sm text-gray-500">
          선택한 기간에 표시할 데이터가 없습니다.
        </p>
      )}
    </div>
  );
};