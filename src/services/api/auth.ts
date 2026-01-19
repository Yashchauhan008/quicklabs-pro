import axios from './httpRequest';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  // AuthMeta,
} from '../../types/auth.type';

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
export const getAuthMeta = () => {
  const url = `/api/auth/profile`;
  return axios({ method: 'GET', url });
};