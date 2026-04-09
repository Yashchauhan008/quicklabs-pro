import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config';

export const Register = () => {
  return <Navigate to={ROUTES.LOGIN} replace />;
};