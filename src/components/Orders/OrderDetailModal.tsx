import { Button } from "../ui/Button";

type OrderStatus = "completed" | "canceled";

type Order = {
  id: string;
  number: string;
  time: string;
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

const statusMeta: Record<OrderStatus, { label: string; badgeClass: string }> = {
  completed: { label: "완료", badgeClass: "bg-emerald-500" },
  canceled: { label: "취소", badgeClass: "bg-rose-500" },
};

export default function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold">
                주문 상세 · {order.number}
              </div>
              <div className="text-sm text-slate-500">
                주문 정보를 확인합니다.
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-4 rounded-xl border bg-slate-50 p-4">
            <Info label="주문시간" value={order.time} />
            <Info label="결제수단" value={order.paymentMethod} />
            <div>
              <div className="text-xs text-slate-500">상태</div>
              <span
                className={[
                  "mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold text-white",
                  statusMeta[order.status].badgeClass,
                ].join(" ")}
              >
                {statusMeta[order.status].label}
              </span>
            </div>
            <Info
              label="총액"
              value={`₩${order.total.toLocaleString()}`}
              strong
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">주문 메뉴</div>
            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {it.quantity}× {it.name}
                      </div>
                      {it.options.length > 0 && (
                        <div className="mt-1 text-xs text-slate-500">
                          {it.options.join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 font-medium">
                      ₩{it.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Button variant="outline" className="w-full" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={strong ? "mt-1 text-lg font-bold" : "mt-1 font-medium"}>
        {value}
      </div>
    </div>
  );
}
