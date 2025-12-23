import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

type Props = {
  data: { day: string; sales: number }[];
};

export default function DayOfWeekChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>요일별 매출 비교</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((row) => (
            <div
              key={row.day}
              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
            >
              <div className="text-sm text-gray-600">{row.day}</div>
              <div className="text-sm font-semibold">
                ₩{row.sales.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
