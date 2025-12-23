import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import OrderDetailModal from "./OrderDetailModal";

type OrderStatus = "completed" | "canceled";

type Order = {
  id: string;
  number: string;
  time: string;
  channel: string;
  total: number;
  status: OrderStatus;
  items: {
    name: string;
    quantity: number;
    price: number;
    options: string[];
  }[];
  paymentMethod: string;
};

const mockOrders: Order[] = [
  {
    id: "3",
    number: "#1245",
    time: "오후 2:38",
    channel: "키오스크",
    total: 32000,
    status: "completed",
    items: [
      {
        name: "추천 세트",
        quantity: 1,
        price: 32000,
        options: ["커피 4잔", "미니 케이크 2개", "음료 4개"],
      },
    ],
    paymentMethod: "신용카드",
  },
  {
    id: "4",
    number: "#1244",
    time: "오후 2:35",
    channel: "키오스크",
    total: 15500,
    status: "completed",
    items: [
      {
        name: "카페라떼",
        quantity: 1,
        price: 5500,
        options: ["따뜻하게"],
      },
      { name: "아이스티", quantity: 1, price: 3500, options: ["라지"] },
    ],
    paymentMethod: "간편결제",
  },
  {
    id: "5",
    number: "#1243",
    time: "오후 2:30",
    channel: "키오스크",
    total: 28000,
    status: "canceled",
    items: [
      { name: "레몬티", quantity: 3, price: 13000, options: ["차갑게"] },
      { name: "초코케이크", quantity: 2, price: 17000, options: [] },
    ],
    paymentMethod: "신용카드",
  },
];

const statusMeta: Record<OrderStatus, { label: string; badgeClass: string }> = {
  completed: { label: "완료", badgeClass: "bg-emerald-500" },
  canceled: { label: "취소", badgeClass: "bg-rose-500" },
};

export default function OrdersTable() {
  const [selected, setSelected] = useState<Order | null>(null);

  // 완료, 취소된 건 목록
  const rows = useMemo(() => mockOrders, []);

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-4 py-3">
          <div className="text-sm font-semibold">주문 목록</div>
          <div className="text-xs text-slate-500">
            완료/취소 상태만 표시합니다.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3">주문번호</th>
                <th className="px-4 py-3">주문시간</th>
                <th className="px-4 py-3">채널</th>
                <th className="px-4 py-3">총액</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">작업</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {rows.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelected(o)}
                >
                  <td className="px-4 py-3 font-medium">{o.number}</td>
                  <td className="px-4 py-3">{o.time}</td>
                  <td className="px-4 py-3">{o.channel}</td>
                  <td className="px-4 py-3">₩{o.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold text-white",
                        statusMeta[o.status].badgeClass,
                      ].join(" ")}
                    >
                      {statusMeta[o.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(o);
                      }}
                    >
                      상세
                    </Button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-slate-500"
                    colSpan={6}
                  >
                    표시할 주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </>
  );
}
