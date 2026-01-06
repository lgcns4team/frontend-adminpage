import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

type Props = {
  data: {
    date: string;
    sales: number;
    dayOfWeek?: string;
    isSelected?: boolean;
  }[];
};

export default function SalesTrendChart({ data }: Props) {
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
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                p.isSelected
                  ? "bg-gray-200 border-gray-400"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`text-sm ${
                  p.isSelected ? "font-bold text-blue-600" : "text-gray-600"
                }`}
              >
                {p.date} {p.dayOfWeek && `(${p.dayOfWeek})`}
              </div>

              <div
                className={`text-sm ${
                  p.isSelected ? "font-bold text-blue-600" : "font-semibold"
                }`}
              >
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
