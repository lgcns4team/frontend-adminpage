import apiClient from './client';

// ========== 타입 정의 ==========

/**
 * 대시보드 전체 요약 데이터
 */
export type DashboardSummary = {
  startDate: string;
  endDate: string;
  totalSales: number;
  avgOrderAmount: number;
  totalOrders: number;
  totalCustomers: number;
  genderRatio: GenderRatio;
  ageGroupRatios: AgeGroupRatio[];
  hourlySales: HourlyData[];
  dailySales: DailyData[];
  popularMenus: PopularMenu[];
};

export type GenderRatio = {
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
  totalCount: number;
};

export type AgeGroupRatio = {
  ageGroup: string;
  count: number;
  percentage: number;
  color?: string;
};

export type HourlyData = {
  hour: number;
  timeLabel: string;
  amount: number;
  orderCount: number;
};

export type DailyData = {
  date: string;
  dateLabel: string;
  dayOfWeek: string;
  amount: number;
  orderCount: number;
  isToday: boolean;
};

export type PopularMenu = {
  menuId: number;
  menuName: string;
  categoryName: string;
  orderCount: number;
  totalQuantity: number;
  totalSales: number;
  imageUrl?: string;
  rank: number;
};

// ========== API 파라미터 타입 ==========

type DashboardParams = {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  storeId?: number;
};

// ========== API 함수 ==========

/**
 * 대시보드 전체 요약 조회
 * GET /api/manager/dashboard/summary
 */
export const getDashboardSummary = async (params?: DashboardParams): Promise<DashboardSummary> => {
  const response = await apiClient.get<DashboardSummary>('/manager/dashboard/summary', { params });
  return response.data;
};

/**
 * 시간대별 매출 조회
 * GET /api/manager/dashboard/hourly-sales
 */
export const getHourlySales = async (params?: DashboardParams) => {
  const response = await apiClient.get<{
    startDate: string;
    endDate: string;
    hourlyData: HourlyData[];
    totalAmount: number;
    totalOrders: number;
  }>('/manager/dashboard/hourly-sales', { params });
  return response.data;
};

/**
 * 일간 매출 조회
 * GET /api/manager/dashboard/daily-sales
 */
export const getDailySales = async (params?: DashboardParams) => {
  const response = await apiClient.get<{
    startDate: string;
    endDate: string;
    dailyData: DailyData[];
    totalAmount: number;
    totalOrders: number;
    totalDays: number;
  }>('/manager/dashboard/daily-sales', { params });
  return response.data;
};

/**
 * 인기메뉴 TOP5 조회
 * GET /api/manager/dashboard/popular-menus
 */
export const getPopularMenus = async (params?: DashboardParams & { limit?: number }) => {
  const response = await apiClient.get<{
    startDate: string;
    endDate: string;
    menus: PopularMenu[];
    totalMenuCount: number;
  }>('/manager/dashboard/popular-menus', { params });
  return response.data;
};

/**
 * 고객 성별/연령대 분석
 * GET /api/manager/dashboard/customer-demographics
 */
export const getCustomerDemographics = async (params?: DashboardParams) => {
  const response = await apiClient.get<{
    startDate: string;
    endDate: string;
    genderRatio: GenderRatio;
    ageGroupRatios: AgeGroupRatio[];
    totalCustomers: number;
    seniorModeUsers: number;
  }>('/manager/dashboard/customer-demographics', { params });
  return response.data;
};