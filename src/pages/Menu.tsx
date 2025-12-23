import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import MenuGrid from "../components/Menu/MenuGrid";

export default function Menu() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">메뉴 관리</h1>
        <p className="text-sm text-gray-500">
          메뉴 등록/수정/삭제, 품절/활성 상태를 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>메뉴 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuGrid />
        </CardContent>
      </Card>
    </div>
  );
}
