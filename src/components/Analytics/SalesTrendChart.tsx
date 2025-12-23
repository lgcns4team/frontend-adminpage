import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

type Props = {
  data: { date: string; sales: number }[];
};

export default function SalesTrendChart({ data }: Props) {
  // 지금은 “차트 자리”만. (원하면 다음에 recharts LineChart로 바꿔주면 됨)
  return (
    <Card>
      <CardHeader>
        <CardTitle>일별 매출 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((p) => (
            <div
              key={p.date}
              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
            >
              <div className="text-sm text-gray-600">{p.date}</div>
              <div className="text-sm font-semibold">
                ₩{p.sales.toLocaleString()}
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-sm text-gray-500">데이터 없음</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
