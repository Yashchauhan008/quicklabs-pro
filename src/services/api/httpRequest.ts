import axios from 'axios';
import { serverDetails } from '../../config';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { clearApiScopeCookie } from '@/utils/apiScope';
import { getApiErrorMessage } from '@/utils/apiError';

const axiosInstance = axios.create({
  baseURL: serverDetails.serverProxyURL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response.data,

  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('user', { path: '/' });
      Cookies.remove('token', { path: '/' });
      clearApiScopeCookie();
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      toast.error('You are not allowed to access this resource');
      return Promise.reject({
        code: 'forbidden',
        message: 'You are not authorized to access this resource',
      });
    }
    if (error.response?.status === 409) {
      const msg =
        getApiErrorMessage(error.response?.data) ||
        'Already done (for example, you already submitted this rating).';
      toast.error(msg);
    }
    if (error.response?.status === 500) {
      toast.error('Internal server error');
    }

    return Promise.reject(error.response?.data || error);
  },
);

export default axiosInstance;