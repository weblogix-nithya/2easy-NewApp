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


export interface IRouteNew {
  name: string;
  key: string;
  isAdmin?: boolean;
  isCompany?: boolean;
  isSubAdmin?: boolean;
  // isPrivate?: boolean;
  children?: INavItem[];
}

export interface INavItem {
  name: string;
  key?: string;
  path?: string; 
  layout?: string;
  href?: string;   
  isAdmin?: boolean;
  isCompany?: boolean;
  isSubAdmin?: boolean;
  isPrivate?: boolean;
  children?: INavItem[];
}


