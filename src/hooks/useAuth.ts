import {
    accountLogin,
    accountLogout,
    accountRegister,
  } from '../services/api/auth';

  //todo: why to use mutation
  import { useMutation } from '@tanstack/react-query';
  import type { LoginCredentials, RegisterCredentials } from '../types/auth.type';
  
  export function useLogin() {
    return useMutation({
      mutationFn: (data: LoginCredentials) => accountLogin(data),
    });
  }
  
  export function useRegister() {
    return useMutation({
      mutationFn: (data: RegisterCredentials) => accountRegister(data),
    });
  }
  
  export function useLogout() {
    return useMutation({
      mutationFn: () => accountLogout(),
    });
  }