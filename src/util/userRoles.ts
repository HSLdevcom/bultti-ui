import { User, UserRole } from '../schema-types'
import { useStateValue } from '../state/useAppState'

export function useHasAdminAccessRights(): boolean {
  const [user] = useStateValue('user')
  return hasAdminAccessRights(user)
}

export function useHasHSLUserAccessRights(): boolean {
  const [user] = useStateValue('user')
  return hasHSLUserAccessRights(user)
}

export function useHasOperatorUserAccessRights(operatorId: number): boolean {
  const [user] = useStateValue('user')
  return hasOperatorUserAccessRights(user, operatorId)
}

export function useHasAccessRights({
  allowedRoles,
  operatorId,
}: {
  allowedRoles: 'all' | UserRole[]
  operatorId?: number
}): boolean {
  const [user] = useStateValue('user')
  return hasAccessRights({ user, allowedRoles, operatorId })
}

export function hasAccessRights({
  user,
  allowedRoles,
  operatorId,
}: {
  user?: User
  allowedRoles: 'all' | UserRole[]
  operatorId?: number
}): boolean {
  if (!user) {
    return false
  }

  if (
    // If all roles are allowed, check that the user is not blocked. If the user is an operator user,
    // ensure that it has access to the operatorId.
    allowedRoles === 'all' &&
    user.role !== UserRole.Blocked &&
    // Either the user is not an operator user...
    (user.role !== UserRole.Operator ||
      // Or there is an operator ID provided AND the user belongs to the operator ID.
      (operatorId && (user.operatorIds || []).includes(operatorId)))
  ) {
    return true
  }

  if (allowedRoles.length === 0) {
    throw new Error('Guard roles not working, given allowedRoles list is empty.')
  }

  if (allowedRoles.includes(UserRole.Admin) && hasAdminAccessRights(user)) {
    return true
  }

  if (allowedRoles.includes(UserRole.Hsl) && hasHSLUserAccessRights(user)) {
    return true
  }

  if (allowedRoles.includes(UserRole.Operator) && operatorId) {
    return hasOperatorUserAccessRights(user, operatorId)
  }

  return false
}

export function hasAdminAccessRights(user?: User): boolean {
  return !!user && user.role === UserRole.Admin
}

export function hasHSLUserAccessRights(user?: User): boolean {
  return !!user && user.role === UserRole.Hsl
}

export function hasOperatorUserAccessRights(
  user: User | undefined,
  operatorId: number
): boolean {
  if (!operatorId) {
    return false
  }

  return (
    !!user && user.role === UserRole.Operator && (user.operatorIds || []).includes(operatorId)
  )
}

export function useIsTestUser() {
  const [user] = useStateValue('user')
  return isTestUser(user)
}

export function isTestUser(user?: User) {
  return !!user && user.hslIdGroups?.includes('HSL-testing')
}
