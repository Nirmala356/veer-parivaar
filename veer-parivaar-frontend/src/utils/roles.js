export const SUPPORTED_ROLES = ['ADMIN', 'VOLUNTEER', 'FAMILY_MEMBER']

export function getRoleDashboardPath(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'VOLUNTEER':
      return '/volunteer'
    case 'FAMILY_MEMBER':
      return '/family'
    default:
      return '/login'
  }
}
