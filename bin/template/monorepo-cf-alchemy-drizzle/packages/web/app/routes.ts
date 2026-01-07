import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
  // Public pages
  index('routes/home.tsx'),
  route('table', 'routes/table.tsx'),
  route('form', 'routes/form.tsx'),

  // Auth pages
  route('signin', 'routes/signin.tsx'),
  route('signup', 'routes/signup.tsx'),

  // Protected pages (require auth)
  route('protected', 'routes/protected.tsx'),

  // Admin routes
  ...prefix('admin', [
    layout('routes/admin/_layout.tsx', [
      index('routes/admin/index.tsx'),
      route('users', 'routes/admin/users.tsx'),
      route('reviews', 'routes/admin/reviews.tsx'),
      route('configs', 'routes/admin/configs.tsx')
    ])
  ]),

  // API routes
  ...prefix('api/v1', [
    route('auth/login', 'routes/api/v1/auth.login.tsx'),
    route('auth/signup', 'routes/api/v1/auth.signup.tsx'),
    route('auth/logout', 'routes/api/v1/auth.logout.tsx'),
    route('auth/session', 'routes/api/v1/auth.session.tsx'),
    route('users', 'routes/api/v1/users.tsx')
  ]),

  // Catch-all 404
  route('*', 'routes/not-found.tsx')
] satisfies RouteConfig;
