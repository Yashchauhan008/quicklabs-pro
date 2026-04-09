import {
  accountLogin,
  accountLogout,
} from '../services/api/auth';

  //todo: why to use mutation
import { useMutation } from '@tanstack/react-query';
import type { LoginCredentials } from '../types/auth.type';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginCredentials) => accountLogin(data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => accountLogout(),
  });
}