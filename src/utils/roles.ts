export function isStudentRole(role?: string | null): boolean {
  if (!role) return false;
  return role.toLowerCase() === 'student';
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  return role.toLowerCase() === 'admin';
}
