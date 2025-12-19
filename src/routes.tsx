// External Imports
import {
  faBriefcase,
  faClock,
  faFileInvoiceDollar,
  faGaugeSimpleHigh,
  faTruckRampBox,
  faUser,
  faUserLock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import dynamic from 'next/dynamic';
// import Profile from "pages/admin/profile";
// import BulkEmail from "pages/admin/bulk-email/index";
// Admin Page Imports
// import Clients from "pages/admin/clients/index";
// import Companies from "pages/admin/companies/index";
// import Customers from "pages/admin/customers/index";
// import MainDashboard from "pages/admin/dashboard";
// import Drivers from "pages/admin/drivers/index";
// import Invoices from "pages/admin/invoices/index";
// import JobAllocationIndex from "pages/admin/job-allocations/index";
// import Jobs from "pages/admin/jobs/index";
// import PreAllocation from "pages/admin/pre-allocation/index";
// import Quote from "pages/admin/quotes/quotes";
// import Rctis from "pages/admin/rctis/index";
// import Users from "pages/admin/users/index";
// import VehicleHire from "pages/admin/vehicle-hires";
// import Vendors from "pages/admin/vendors/index";
// const Profile = dynamic(() => import('pages/admin/profile'), {
//   ssr: false,
// });
// const MainDashboard = dynamic(() => import('pages/admin/dashboard'), {
//   ssr: false,
// });
// Types
// import { IRoute } from "types/navigation";
import { IRoute } from "./lib/types/navigation";


const routes: IRoute[] = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: <FontAwesomeIcon icon={faGaugeSimpleHigh} className="mr-1" />,
    // icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    // component: MainDashboard,
    sidebar: true,
    isAdmin: true,
    isCompany: true,
    isPrivate: false,
  },
  {
    name: "Tracking",
    title: "Tracking",
    layout: "/admin",
    path: "/job-allocations",
    icon: <FontAwesomeIcon icon={faTruckRampBox} className="mr-1" />,
    // component: JobAllocationIndex,
    sidebar: true,
    isAdmin: true,
    isCompany: false,
    isPrivate: false,
  },
  {
    name: "Pre-Allocation",
    title: "Pre-Allocation",
    layout: "/admin",
    path: "/pre-allocation",
    icon: <FontAwesomeIcon icon={faTruckRampBox} className="mr-1" />,
    // component: PreAllocation,
    sidebar: true,
    isAdmin: true,
    isCompany: true,
    isPrivate: false,
  },
  {
    name: "Delivery Jobs",
    title: "Delivery Jobs",
    layout: "/admin",
    path: "/jobs",
    icon: <FontAwesomeIcon icon={faTruckRampBox} className="mr-1" />,
    // component: Jobs,
    sidebar: true,
    isAdmin: true,
    isCompany: true,
    isPrivate: false,
  },

  {
    name: "Hourly Hire",
    title: "Hourly Hire",
    layout: "/admin",
    path: "/vehicle-hires",
    icon: <FontAwesomeIcon icon={faClock} className="mr-1" />,
    // component: VehicleHire,
    sidebar: true,
    isAdmin: true,
    isCompany: true,
    isPrivate: false,
  },
  {
    name: "Quotes",
    title: "Quotes",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faBriefcase} className="mr-1" />,
    path: "/quotes",
    // component: Quote,
    sidebar: true,
    isAdmin: true,
    isCompany: true,
  },
  {
    name: "Clients",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faBriefcase} className="mr-1" />,
    // icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/clients",
    // component: Clients,
    sidebar: false,
    isAdmin: true,
    isCompany: true,
    isPrivate: false,
  },
  {
    name: "Companies",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faBriefcase} className="mr-1" />,
    // icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/companies",
    // component: Companies,
    sidebar: true,
    isAdmin: true,
    isCompany: false,
    isPrivate: true,
  },
  {
    name: "Customers",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faBriefcase} className="mr-1" />,
    path: "/customers",
    // component: Customers,
    sidebar: true,
    isAdmin: true,
    isCompany: true,
    isPrivate: true,
  },
  {
    name: "Invoices",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-1" />,
    path: "/invoices",
    // component: Invoices,
    sidebar: true,
    isAdmin: true,
    isCompany: true,
    isPrivate: true,
  },
  {
    name: "Driver RCTIs",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-1" />,
    path: "/rctis",
    // component: Rctis,
    sidebar: true,
    isAdmin: true,
    isCompany: false,
    isPrivate: true,
  },
  {
    name: "Drivers",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faUser} className="mr-1" />,
    path: "/drivers",
    // component: Drivers,
    sidebar: true,
    isAdmin: true,
    isCompany: false,
    isPrivate: false,
  },
  {
    name: "Users",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faUserLock} className="mr-1" />,
    path: "/users",
    // component: Users,
    sidebar: true,
    isAdmin: true,
    isCompany: false,
    isPrivate: false,
  },
  {
    name: "Bulk Email",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-1" />,
    path: "/bulk-email",
    // component: BulkEmail,
    sidebar: true,
    isAdmin: true,
    isCompany: false,
    isPrivate: true,
  },
  // {
  //   name: "Vendors",
  //   layout: "/admin",
  //   icon: <FontAwesomeIcon icon={faBriefcase} className="mr-1" />,
  //   // icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
  //   path: "/vendors",
  //   component: Vendors,
  //   sidebar: true,
  //   isAdmin: true,
  //   isCompany: false,
  //   isPrivate: true,
  // },
  {
    name: "Profile",
    layout: "/admin",
    icon: <FontAwesomeIcon icon={faUserLock} className="mr-1" />,
    path: "/profile",
    // component: Profile,
    sidebar: false,
    isAdmin: true,
    isCompany: false,
    isPrivate: false,
  },
];

export default routes;
