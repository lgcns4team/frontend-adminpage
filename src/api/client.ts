import axios from 'axios';

/**
 * API 클라이언트 인스턴스
 * 백엔드 서버와 통신하기 위한 Axios 설정
 */
const apiClient = axios.create({
  // baseURL: 'http://localhost:8080/nok-nok/api',
  baseURL: 'https://api.bfree-kiosk.com/nok-nok/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * 모든 요청 전에 실행됨 (예: 토큰 추가)
 */
apiClient.interceptors.request.use(
  (config) => {
    // 나중에 인증 토큰 추가 가능
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log('API 요청:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('요청 에러:', error);
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * 모든 응답 후에 실행됨 (예: 에러 처리)
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버가 응답한 에러 (4xx, 5xx)
      console.error('서버 에러:', error.response.status, error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없음 (네트워크 에러)
      console.error('네트워크 에러:', error.request);
    } else {
      // 요청 설정 중 에러
      console.error('에러:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;