import { jwtDecode } from 'jwt-decode';

export const getDecodedToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};
