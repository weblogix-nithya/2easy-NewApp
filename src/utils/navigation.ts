import { IRoute } from "@/lib/types/navigation";

// NextJS Requirement
export const isWindowAvailable = () => typeof window !== "undefined";

export const findCurrentRoute = (routes: IRoute[]): IRoute => {
  const foundRoute: IRoute = routes.find(
    (route) =>
      isWindowAvailable() &&
      window.location.href.indexOf(route.layout + route.path) !== -1 &&
      route
  );

  return foundRoute;
};

export const getActiveName = (routes: IRoute[]): string => {
  const route = findCurrentRoute(routes);
  return route?.title || route?.name;
};

export const getActiveRoute = (routes: IRoute[]): string => {
  const route = findCurrentRoute(routes);
  return route?.name || "";
};

export const getActivePath = (routes: IRoute[]): string => {
  const route = findCurrentRoute(routes);
  return route?.layout + route?.path || "/admin/dashboard";
};

export const getActiveNavbar = (routes: IRoute[]): boolean => {
  const route = findCurrentRoute(routes);
  return route?.secondary;
};

export const getActiveNavbarText = (routes: IRoute[]): string | boolean => {
  return getActiveRoute(routes) || false;
};
