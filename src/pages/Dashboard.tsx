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

type Period = "today" | "yesterday" | "custom";

type HourRow = {
  label: string; // "09-10"
  sales: number; // 매출
  gender: { male: number; female: number };
  age: { a10: number; a20: number; a30: number; a40: number; a50p: number };
};

type DailyRow = {
  day: string; // "12/11"
  sales: number;
};

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("today");
  const [appliedRange, setAppliedRange] = useState<null | {
    start: Date;
    end: Date;
  }>(null);

  // 여기 나중에 period에 맞춰 API로 교체하면 됨
  const data = useMemo(() => {
    // ----- KPI -----
    const kpi =
      period === "custom" && appliedRange
        ? { todaySales: 34210000, todayOrders: 512 } // (기간합 예시)
        : period === "yesterday"
        ? { todaySales: 10420000, todayOrders: 162 }
        : { todaySales: 12543000, todayOrders: 187 };

    //  인기메뉴 TOP5 (도넛용)
    const topMenuData = [
      { name: "아메리카노", value: 320 },
      { name: "라떼", value: 260 },
      { name: "바닐라라떼", value: 180 },
      { name: "카푸치노", value: 140 },
      { name: "디카페인", value: 90 },
    ];

    // ----- 시간대별 매출 + 성별/연령대(시간대별) -----
    const hourly: HourRow[] = [
      {
        label: "09-10",
        sales: 420000,
        gender: { male: 6, female: 9 },
        age: { a10: 1, a20: 5, a30: 6, a40: 2, a50p: 1 },
      },
      {
        label: "10-11",
        sales: 780000,
        gender: { male: 10, female: 14 },
        age: { a10: 1, a20: 8, a30: 10, a40: 3, a50p: 2 },
      },
      {
        label: "11-12",
        sales: 1540000,
        gender: { male: 18, female: 22 },
        age: { a10: 2, a20: 14, a30: 16, a40: 6, a50p: 2 },
      },
      {
        label: "12-13",
        sales: 2100000,
        gender: { male: 22, female: 26 },
        age: { a10: 2, a20: 18, a30: 20, a40: 6, a50p: 2 },
      },
      {
        label: "13-14",
        sales: 1320000,
        gender: { male: 14, female: 20 },
        age: { a10: 1, a20: 10, a30: 15, a40: 6, a50p: 2 },
      },
      {
        label: "14-15",
        sales: 980000,
        gender: { male: 12, female: 16 },
        age: { a10: 1, a20: 8, a30: 12, a40: 5, a50p: 2 },
      },
      {
        label: "15-16",
        sales: 760000,
        gender: { male: 10, female: 12 },
        age: { a10: 1, a20: 6, a30: 9, a40: 4, a50p: 2 },
      },
      {
        label: "16-17",
        sales: 880000,
        gender: { male: 11, female: 13 },
        age: { a10: 1, a20: 7, a30: 10, a40: 4, a50p: 2 },
      },
    ];

    // ----- 일간 매출 -----
    const daily: DailyRow[] = [
      { day: "12/11", sales: 3800000 },
      { day: "12/12", sales: 5100000 },
      { day: "12/13", sales: 4600000 },
      { day: "12/14", sales: 7200000 },
      { day: "12/15", sales: 8900000 },
      { day: "12/16", sales: 6800000 },
    ];

    return { kpi, hourly, daily, topMenuData };
  }, [period, appliedRange]);

  const maxHourlySales = useMemo(() => {
    return Math.max(...data.hourly.map((h) => h.sales));
  }, [data.hourly]);

  const maxDailySales = useMemo(() => {
    return Math.max(...data.daily.map((d) => d.sales));
  }, [data.daily]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 space-y-6">
        {/* 기간 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={period === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("today")}
          >
            오늘
          </Button>
          <Button
            variant={period === "yesterday" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("yesterday")}
          >
            어제
          </Button>
          <Button
            variant={period === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("custom")}
          >
            기간 설정
          </Button>

          {period === "custom" && (
            <span className="text-xs text-gray-500 ml-2">
              (다음 단계: DatePicker 붙이기)
            </span>
          )}
        </div>

        {/* 타이틀 */}
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-gray-500">
            오늘 매장 운영 요약과 주요 지표를 확인하세요.
          </p>
        </div>

        {/* ✅ KPI + 도넛: 3열 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <KpiCard
            title="오늘 매출"
            value={`₩${data.kpi.todaySales.toLocaleString()}`}
            sub={period === "yesterday" ? "전일 기준" : "금일 기준"}
          />
          <KpiCard
            title="오늘 주문건수"
            value={`${data.kpi.todayOrders.toLocaleString()}건`}
            sub={period === "yesterday" ? "전일 기준" : "금일 기준"}
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                인기메뉴 TOP5
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="w-full max-w-[280px]">
                <TopMenuDonut data={data.topMenuData} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ 아래: 2열(시간대/일간) + 표는 전체폭 */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 시간대별 매출 */}
          <Card>
            <CardHeader>
              <CardTitle>시간대별 매출</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.hourly.map((row) => {
                  const pct =
                    maxHourlySales === 0
                      ? 0
                      : (row.sales / maxHourlySales) * 100;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="w-14 text-xs text-gray-500">
                        {row.label}
                      </div>
                      <div className="h-2 flex-1 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-gray-900"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-28 text-right text-xs text-gray-500">
                        ₩{row.sales.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 일간 매출 */}
          <Card>
            <CardHeader>
              <CardTitle>일간 매출</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.daily.map((row) => {
                  const pct =
                    maxDailySales === 0 ? 0 : (row.sales / maxDailySales) * 100;
                  return (
                    <div key={row.day} className="flex items-center gap-3">
                      <div className="w-14 text-xs text-gray-500">
                        {row.day}
                      </div>
                      <div className="h-2 flex-1 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-gray-900"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-28 text-right text-xs text-gray-500">
                        ₩{row.sales.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 시간대별 방문 성별/연령대 (전체 폭) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>시간대별 방문 성별/연령대</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-3">시간대</th>
                      <th className="py-2 pr-3">남</th>
                      <th className="py-2 pr-3">여</th>
                      <th className="py-2 pr-3">10대</th>
                      <th className="py-2 pr-3">20대</th>
                      <th className="py-2 pr-3">30대</th>
                      <th className="py-2 pr-3">40대</th>
                      <th className="py-2 pr-3">50대+</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hourly.map((row) => (
                      <tr key={row.label} className="border-t">
                        <td className="py-2 pr-3 font-medium">{row.label}</td>
                        <td className="py-2 pr-3">{row.gender.male}</td>
                        <td className="py-2 pr-3">{row.gender.female}</td>
                        <td className="py-2 pr-3">{row.age.a10}</td>
                        <td className="py-2 pr-3">{row.age.a20}</td>
                        <td className="py-2 pr-3">{row.age.a30}</td>
                        <td className="py-2 pr-3">{row.age.a40}</td>
                        <td className="py-2 pr-3">{row.age.a50p}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-3 text-xs text-gray-500">
                  * 현재는 목데이터. 다음 단계에서 주문/방문 로그 기반으로 집계
                  API 연결
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
