// src/constants/colors.ts
export const DEFAULT_COLORS = [
  "#111827", // 거의 검정
  "#374151", // 진회색
  "#6b7280", // 회색
  "#9ca3af", // 연회색
  "#578dff", // 포인트 블루
] as const;

//  성별 전용 (회색 / 연회색)
export const GENDER_COLORS = [
  DEFAULT_COLORS[2], // #6b7280
  DEFAULT_COLORS[3], // #9ca3af
] as const;
