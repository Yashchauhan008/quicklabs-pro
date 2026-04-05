import axios from './httpRequest';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../../types/auth.type';
import { setApiScopeCookie } from '@/utils/apiScope';

// ===================== Account  =====================

//todo: commented auto code why we use promiss here and also id i do same like data : any that it give error

export const accountLogin = (data: LoginCredentials): Promise<AuthResponse> => {
  const url = `/api/auth/login`;
  return axios({ method: 'POST', url, data });
};

// export const accountLogin = (data: LoginCredentials) => {
//   const url = `/auth/login`;
//   return axios({ method: 'POST', url, data });
// }

// export const accountRegister = (
//   data: RegisterCredentials,
// ): Promise<AuthResponse> => {
//   const url = `/api/auth/register`;
//   return axios({ method: 'POST', url, data });
// };

export const accountRegister = ( data: RegisterCredentials,) => {
  const url = `/api/auth/register`;
  return axios({ method: 'POST', url, data });
};

// export const accountLogout = (): Promise<void> => {
//   const url = `/api/auth/logout`;
//   return axios({ method: 'DELETE', url });
// };

export const accountLogout = () => {
  const url = `/api/auth/logout`;
  return axios({ method: 'DELETE', url });
};

// export const getAuthMeta = (): Promise<AuthMeta> => {
//   const url = `/api/auth/profile`;
//   return axios({ method: 'GET', url });
// };
export const getAuthMeta = async () => {
  const body = await axios({ method: 'GET', url: `/api/auth/profile` });
  const data = body && typeof body === 'object' && 'data' in body
    ? (body as { data?: { role?: string } }).data
    : undefined;
  if (data?.role) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    setApiScopeCookie(data.role, expiresAt);
  }
  return body;
};