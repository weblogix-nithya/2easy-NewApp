// utils/routeGuard.ts
export const enforceCompanyAccess = (router, routes, cookies) => {
  if (cookies.company_id) {
    const activeRoute = routes.find((r) => router.pathname.includes(r.path));
    if (activeRoute && !activeRoute.isCompany && router.pathname !== "/admin/dashboard") {
      router.push("/admin/dashboard");
    }
  }
};
