import apiClient from './client';

// ========== 타입 정의 ==========

/**
 * 메뉴 아이템 타입 (프론트엔드 형식)
 */
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  isActive: boolean;
  isSoldOut: boolean;
  categoryName?: string;
};

// ========== 백엔드 응답 타입 ==========

type MenuListResponse = {
  menus: {
    menuId: number;
    menuName: string;
    categoryName: string;
    price: number;
    isActive: boolean;
    imageUrl: string;
  }[];
  totalCount: number;
};

// ========== API 함수 ==========

/**
 * 메뉴 목록 조회
 * GET /api/manager/menus
 */
export const getMenus = async (): Promise<MenuItem[]> => {
  const response = await apiClient.get<MenuListResponse>('/manager/menus');
  
  // 백엔드 데이터 → 프론트 형식으로 변환
  return response.data.menus.map(menu => ({
    id: String(menu.menuId),
    name: menu.menuName,
    price: menu.price,
    image: menu.imageUrl || '', // 이미지 없으면 빈 문자열
    isActive: menu.isActive,
    isSoldOut: false, // 백엔드에 품절 정보 없으면 기본값 false
    categoryName: menu.categoryName,
  }));
};