// utils/routeGuard.ts
export const enforceCompanyAccess = (router, routes, cookies, pathname) => {
  if (cookies.is_sub_admin === true && cookies.is_admin !== "true" ) {
    const activeRoute = routes.find((r) => pathname.includes(r.path));
    if (activeRoute && !activeRoute.isSubAdmin && pathname !== "/admin/dashboard") {
      console.warn("Redirecting restricted route guard", pathname, cookies.company_id);
      router.push("/admin/dashboard");
    }
  }
  if (cookies.company_id !== undefined && cookies.company_id !== "undefined" && cookies.company_id !== "" && cookies.is_admin !== "true" ) {
    const activeRoute = routes.find((r) => pathname.includes(r.path));
    if (activeRoute && !activeRoute.isCompany && pathname !== "/admin/dashboard") {
      console.warn("Redirecting restricted route guard", pathname, cookies.company_id);
      router.push("/admin/dashboard");
    }
  }
};
