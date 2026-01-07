import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import OrderDetailModal from "./OrderDetailModal";
import { getOrders, getOrderDetail } from "../../api/orders";

// 타입 정의 (orders.ts와 동일하게 유지)
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

const statusMeta: Record<OrderStatus, { label: string; badgeClass: string }> = {
  completed: { label: "완료", badgeClass: "bg-emerald-500" },
  canceled: { label: "취소", badgeClass: "bg-rose-500" },
};

export default function OrdersTable() {
  // 상태 관리
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 컴포넌트 마운트 시 주문 목록 조회
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('주문 목록 조회 시작...');
        const data = await getOrders();
        console.log('주문 목록 조회 성공:', data.length, '건');
        
        setOrders(data);
      } catch (err) {
        console.error('주문 목록 조회 실패:', err);
        setError('주문 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 주문 상세 조회
  const handleSelectOrder = async (order: Order) => {
    try {
      setDetailLoading(true);
      
      console.log('주문 상세 조회 시작:', order.id);
      const detail = await getOrderDetail(order.id);
      console.log('주문 상세 조회 성공:', detail);
      
      setSelected(detail);
    } catch (err) {
      console.error('주문 상세 조회 실패:', err);
      alert('주문 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  // 로딩 중 UI
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-2 text-sm text-gray-500">로딩 중...</div>
            <div className="text-xs text-gray-400">주문 데이터를 불러오고 있습니다</div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생 UI
  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-2 text-sm text-red-500">{error}</div>
            <div className="text-xs text-gray-400">
              서버가 실행 중인지 확인해주세요
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-4 py-3">
          <div className="text-xs text-slate-500">
            완료/취소 상태만 표시합니다. (총 {orders.length}건)
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
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => handleSelectOrder(o)}
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
                        handleSelectOrder(o);
                      }}
                      disabled={detailLoading}
                    >
                      {detailLoading ? '로딩...' : '상세'}
                    </Button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-slate-500"
                    colSpan={6}
                  >
                    <div>표시할 주문이 없습니다.</div>
                    <div className="mt-1 text-xs text-slate-400">
                      백엔드 DB에 주문 데이터가 있는지 확인해주세요
                    </div>
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