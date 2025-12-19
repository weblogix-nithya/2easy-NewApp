import { ReactComponentElement } from "react";

export interface IRoute {
  title?: string;
  name: string;
  layout: string;
  // component: ReactComponentElement;
  icon: ReactComponentElement | string;
  secondary?: boolean;
  isAdmin?: boolean;
  isCompany?: boolean;
  path: string;
  sidebar?: boolean;
  isPrivate?: boolean;
}
