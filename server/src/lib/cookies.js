const isProd = () => process.env.NODE_ENV === 'production';

export function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie('token', { path: '/' });
}
