/**
 * Dev Clerk (clerk.dev.adwiiseagent.ai) and production Clerk issue different user ids for one email.
 * The dev database is a copy of production, so a dev sign-in inserts a row and leaves the production user id in place.
 */
export function isDevClerkPool(): boolean {
  const values = [
    process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
    process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
    process.env.AMPLIFY_NEXT_PUBLIC_CLERK_FRONTEND_API,
    process.env.AMPLIFY_NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AMPLIFY_NEXT_PUBLIC_APP_URL,
  ].filter((value): value is string => Boolean(value));

  return values.some(
    (value) =>
      value.includes('clerk.dev.') ||
      value.includes('://dev.adwiiseagent.ai') ||
      value.includes('://dev-satellite.adwiiseagent.ai')
  );
}

export function profileMatchesClerkUser(
  row: { userId?: string | null; clerkUserId?: string | null },
  clerkUserId: string
): boolean {
  return row.userId === clerkUserId || row.clerkUserId === clerkUserId;
}

export type ClerkProfileDecision<T> =
  | { action: 'use' }
  | { action: 'patch'; row: T }
  | { action: 'insert'; sibling?: T };

/**
 * Email rows are already limited to one tenant.
 * An exact user id uses that row. The dev pool inserts. Production patches the single email row.
 */
export function decideClerkProfileIdentity<T extends { id?: number | null; userId?: string | null; clerkUserId?: string | null }>(
  emailRows: T[],
  clerkUserId: string
): ClerkProfileDecision<T> {
  if (emailRows.some((row) => profileMatchesClerkUser(row, clerkUserId))) {
    return { action: 'use' };
  }

  const sibling = [...emailRows].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0))[0];
  if (isDevClerkPool()) {
    return { action: 'insert', sibling };
  }
  if (sibling) {
    return { action: 'patch', row: sibling };
  }
  return { action: 'insert' };
}

export function buildClerkProfileInsert(input: {
  userId: string;
  email: string;
  tenantId: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  sibling?: {
    firstName?: string | null;
    lastName?: string | null;
    userRole?: string | null;
    userStatus?: string | null;
    profileImageUrl?: string | null;
  } | null;
}): Record<string, string> {
  const now = new Date().toISOString();
  const sibling = input.sibling;
  return {
    userId: input.userId,
    clerkUserId: input.userId,
    email: input.email,
    firstName: sibling?.firstName || input.firstName || '',
    lastName: sibling?.lastName || input.lastName || '',
    profileImageUrl: input.imageUrl || sibling?.profileImageUrl || '',
    userRole: sibling?.userRole || 'MEMBER',
    userStatus: sibling?.userStatus || 'PENDING_APPROVAL',
    tenantId: input.tenantId,
    createdAt: now,
    updatedAt: now,
  };
}
