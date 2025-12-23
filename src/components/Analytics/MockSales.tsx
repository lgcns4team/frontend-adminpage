export type SalePoint = {
  date: string; // "YYYY-MM-DD"
  sales: number;
  orders: number;
};

// ✅ 샘플 데이터 (원하는 만큼 늘려도 됨)
export const MOCK_SALES: SalePoint[] = [
  { date: "2025-12-10", sales: 4200000, orders: 120 },
  { date: "2025-12-11", sales: 3800000, orders: 110 },
  { date: "2025-12-12", sales: 5100000, orders: 150 },
  { date: "2025-12-13", sales: 4600000, orders: 135 },
  { date: "2025-12-14", sales: 7200000, orders: 210 },
  { date: "2025-12-15", sales: 8900000, orders: 240 },
  { date: "2025-12-16", sales: 6800000, orders: 190 },
];

export function inRange(date: string, start: string, end: string) {
  // YYYY-MM-DD는 문자열 비교로 range 체크 가능
  return date >= start && date <= end;
}

export function sumKpi(points: SalePoint[]) {
  const totalSales = points.reduce((acc, p) => acc + p.sales, 0);
  const totalOrders = points.reduce((acc, p) => acc + p.orders, 0);
  const avgOrder = totalOrders === 0 ? 0 : Math.round(totalSales / totalOrders);
  return { totalSales, totalOrders, avgOrder };
}

export function groupByWeekday(points: SalePoint[]) {
  const map = new Map<string, number>();
  for (const p of points) {
    const d = new Date(p.date + "T00:00:00");
    const label = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ][d.getDay()];
    map.set(label, (map.get(label) ?? 0) + p.sales);
  }
  const order = [
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
    "일요일",
  ];
  return order.map((day) => ({ day, sales: map.get(day) ?? 0 }));
}
