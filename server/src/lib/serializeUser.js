export function serializeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}
