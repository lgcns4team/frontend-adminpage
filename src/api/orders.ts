import apiClient from './client';

// ========== 타입 정의 ==========

export type OrderStatus = 'completed' | 'canceled';

/**
 * 주문 데이터 타입 (프론트엔드 형식)
 */
export type Order = {
  id: string;
  number: string;
  time: string;
  channel: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  paymentMethod: string;
  orderTime?: string; // 정렬용 원본 ISO 시간
};

/**
 * 주문 아이템 타입
 */
export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  options: string[];
};

// ========== 백엔드 응답 타입 ==========

type OrderListResponse = {
  orders: {
    orderId: number;
    orderNo: number;
    orderTime: string; // ISO 8601 형식
    channel: string;
    totalAmount: number;
    status: string; // "완료" | "취소"
  }[];
};

type OrderDetailResponse = {
  orderId: number;
  orderNo: number;
  orderTime: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  items: {
    menuName: string;
    quantity: number;
    totalPrice: number;
    options: string;
  }[];
};

// ========== API 함수 ==========

/**
 * 주문 목록 조회
 * GET /api/manager/orders
 */
export const getOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<OrderListResponse>('/manager/orders');
  
  // 백엔드 데이터 → 프론트 형식으로 변환
  const orders = response.data.orders.map(order => ({
    id: String(order.orderId),
    number: `#${order.orderNo}`,
    time: formatTime(order.orderTime),
    channel: order.channel,
    total: order.totalAmount,
    status: (order.status === '완료' ? 'completed' : 'canceled') as OrderStatus,
    items: [], // 목록에서는 아이템 정보 없음
    paymentMethod: '', // 목록에서는 결제수단 없음
    orderTime: order.orderTime, // 정렬용 원본 시간
  }));
  
  // 최신순 정렬 (orderTime 기준 내림차순)
  return orders.sort((a, b) => {
    return new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime();
  });
};

/**
 * 주문 상세 조회
 * GET /api/manager/orders/{orderId}
 */
export const getOrderDetail = async (orderId: string): Promise<Order> => {
  const response = await apiClient.get<OrderDetailResponse>(`/manager/orders/${orderId}`);
  const data = response.data;
  
  return {
    id: String(data.orderId),
    number: `#${data.orderNo}`,
    time: formatTime(data.orderTime),
    channel: '키오스크',
    total: data.totalAmount,
    status: data.status === '완료' ? 'completed' : 'canceled',
    paymentMethod: data.paymentMethod,
    items: data.items.map(item => ({
      name: item.menuName,
      quantity: item.quantity,
      price: item.totalPrice,
      options: item.options === '옵션 없음' ? [] : item.options.split(', '),
    })),
  };
};

// ========== 유틸리티 함수 ==========

/**
 * ISO 8601 시간 → "12/31 오후 2:38" 형식 변환
 * @param isoString - "2025-12-31T14:38:00"
 * @returns "12/31 오후 2:38"
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  
  // 날짜 부분
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 시간 부분
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const period = hours >= 12 ? '오후' : '오전';
  const hour12 = hours % 12 || 12;
  const minuteStr = String(minutes).padStart(2, '0');
  
  return `${month}/${day} ${period} ${hour12}:${minuteStr}`;
}