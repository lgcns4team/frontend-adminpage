import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const devices = [
  { id: 1, name: "키오스크 #1", status: "online" },
  { id: 2, name: "키오스크 #2", status: "offline" },
];

export default function Devices() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">기기 관리</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{device.name}</span>
                <span
                  className={`text-sm ${
                    device.status === "online"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {device.status === "online" ? "온라인" : "오프라인"}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex gap-2">
              <Button size="sm">재시작</Button>
              <Button size="sm" variant="outline">
                화면 잠금
              </Button>
              <Button size="sm" variant="outline">
                설정
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
