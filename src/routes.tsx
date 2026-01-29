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
import { IRoute, IRouteNew } from "./lib/types/navigation";


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


export const NAV_CONFIG:IRouteNew[] = [
  {
    name: "Overview",
    key: "overview",
    isAdmin: true,
    isCompany: true,
    children: [
      {
        name: "Contacts",
        key: "contacts",
        layout: "/admin",
        path: "/contacts",
        isAdmin: true,
        isCompany: true,
        isPrivate: false,
      },
      {
        name: "Dashboard",
        key: "dashboard",
        layout: "/admin",
        path: "/dashboard",
        isAdmin: true,
        isCompany: true,
        isPrivate: false,
      },
      {
        name: "Track a booking",
        key: "trackabooking",
        layout: "/admin",
        path: "/trackabooking",
        isAdmin: true,
        isCompany: true,
        isPrivate: false,
      },
    ],
  },
  {
    name: "OPERATIONS",
    key: "operations",
    isAdmin: true,
    isCompany: true,
    children: [
      {
        name: "Bulk Allocation",
        key: "bulkallocation",
        layout: "/admin",
        path: "/jobs",
        isAdmin: true,
        isCompany: true,
        isPrivate: false,
        children: [
          { name: "VIC", href: "/admin/jobs?id=vic" },
          { name: "QLD", href: "/admin/jobs?id=qld" },
          { name: "QLD / NSW", href: "/admin/jobs?id=qld-nsw" },
          { name: "NSW", href: "/admin/jobs?id=nsw" },
          { name: "Road Freight", href: "/admin/jobs?id=road" },
          { name: "FCL", href: "/admin/jobs?id=fcl" },
          { name: "ALL", href: "/admin/jobs?id=all" },
        ],
      },
      {
        name: "Pre Allocation",
        key: "preallocation",
        layout: "/admin",
        path: "/pre-allocation",
        isAdmin: true,
        isCompany: false,
        isPrivate: false,
        children: [
          { name: "VIC", href: "/admin/pre-allocation?id=vic" },
          { name: "QLD", href: "/admin/pre-allocation?id=qld" },
          { name: "QLD / NSW", href: "/admin/pre-allocation?id=qld-nsw" },
          { name: "NSW", href: "/admin/pre-allocation?id=nsw" },
          { name: "Road Freight", href: "/admin/pre-allocation?id=road" },
          { name: "FCL", href: "/admin/pre-allocation?id=fcl" },
          { name: "ALL", href: "/admin/pre-allocation?id=all" },
        ],
      },
      {
        name: "Tracking",
        key: "tracking",
        layout: "/admin",
        path: "/job-allocations",
        isAdmin: true,
        isCompany: false,
        isPrivate: false,
        children: [
          { name: "VIC", href: "/admin/job-allocations?id=vic" },
          { name: "QLD", href: "/admin/job-allocations?id=qld" },
          { name: "ALL", href: "/admin/job-allocations?id=all" },
        ],
      },
      {
        name: "Chep Exchange",
        key: "chepexchange",
        layout: "/admin",
        path: "/chep-exchange",
        isAdmin: true,
        isCompany: false,
        isPrivate: false,
      },
    ],
  },
  {
    name: "ADMIN",
    key: "admin",
    isAdmin: true,
    isCompany: true,
    children: [
      {
        name: "Bulk Email",
        key: "bulkemail",
        layout: "/admin",
        path: "/bulk-email",
        isAdmin: true,
        isCompany: false,
        isPrivate: true,
      },
      {
        name: "Companies",
        key: "companies",
        layout: "/admin",
        path: "/companies",
        isAdmin: true,
        isCompany: false,
        isPrivate: true,
      },
      {
        name: "Customers",
        key: "customers",
        layout: "/admin",
        path: "/customers",
        isAdmin: true,
        isCompany: true,
        isPrivate: true,
      },
      {
        name: "Users",
        key: "users",
        layout: "/admin",
        path: "/users",
        isAdmin: true,
        isCompany: false,
        isPrivate: false,
      },

    ]
  },
  {
    name: "Accounts",
    key: "accounts",
    isAdmin: true,
    isCompany: true,
    children: [
      {
        name: "Invoices",
        key: "invoices",
        layout: "/admin",
        path: "/invoices",
        isAdmin: true,
        isCompany: true,
        isPrivate: true,
        children: [
          { name: "Draft Invoices", href: "/admin/invoices#draft" },
          { name: "Outstanding Invoices", href: "/admin/invoices#outstanding" },
          { name: "Paid Invoices", href: "/invoices/jobs#customer_paid" },
          { name: "Approved Invoices", href: "/admin/invoices#approved" },
          { name: "Create Invoice - No booking ", href: "/admin/invoices/create" }
        ],
      },
    ]
  },
  {
    name: "Booking",
    key: "booking",
    isAdmin: true,
    isCompany: true,
    children: [
      {
        name: "Create a booking",
        key: "createbooking",
        layout: "/admin",
        path: "/create-job",
        isAdmin: true,
        isCompany: true,
        isPrivate: false,
        children: [
          { name: "QLD Import LCL", href: "/admin/create-job?id=qld_import_lcl" },
          { name: "QLD Export LCL", href: "/admin/create-job?id=qld_export_lcl" },
          { name: "QLD Airfreight Import", href: "/admin/create-job?id=qld_airfreight_import" },
          { name: "QLD Airfreight Export", href: "/admin/create-job?id=qld_airfreight_export" },
          { name: "QLD B2B", href: "/admin/create-job?id=qld_b2b" },
          { name: "VIC Import LCL", href: "/admin/create-job?id=vic_import_lcl" },
          { name: "VIC Export LCL", href: "/admin/create-job?id=vic_export_lcl" },
          { name: "VIC Airfreight Import", href: "/admin/create-job?id=vic_airfreight_import" },
          { name: "VIC Airfreight Export", href: "/admin/create-job?id=vic_airfreight_export" },
          { name: "VIC B2B", href: "/admin/create-job?id=vic_b2b" },
          { name: "Road Freight", href: "/admin/create-job?id=roadfreight" },
          { name: "FCL", href: "/admin/create-job?id=fcl" },
          { name: "Warehouse", href: "/admin/create-job?id=warehouse" },
        ],
      },
    ]
  },
  {
    name: "Quotes",
    key: "quotes",
    isAdmin: true,
    isCompany: true,
    children: [
      {
        name: "Existing quote",
        key: "existingquote",
        layout: "/admin",
        path: "/quotes",
        isAdmin: true,
        isCompany: true,
        isPrivate: false,
        children: [
          { name: "QLD", href: "/admin/quotes?id=qld" },
          { name: "VIC", href: "/admin/quotes?id=vic" },
          { name: "Road freight (Regional/Interstate)", href: "/admin/quotes?id=roadfreight" },
          { name: "FCL", href: "/admin/quotes?id=fcl" }
        ]
      },
      {
        name: "Create new quote",
        key: "createquote",
        layout: "/admin",
        path: "/create-quote",
        isAdmin: true,
        isCompany: true,
        isPrivate: false,
        children: [
          { name: "QLD", href: "/admin/create-quote?id=qld" },
          { name: "VIC", href: "/admin/create-quote?id=vic" },
          { name: "Road freight (Regional/Interstate)", href: "/admin/create-quote?id=roadfreight" },
          { name: "FCL", href: "/admin/create-quote?id=fcl" }
        ]
      }
    ]
  },
  {
    name: "Drivers",
    key: "drivers",
    isAdmin: true,
    isCompany: false,
    children: [
      {
        name: "Driver accounts",
        key: "driveraccounts",
        layout: "/admin",
        path: "/drivers",
        isAdmin: true,
        isCompany: false,
        isPrivate: false,
        children: [
          { name: "Pending drivers", href: "/admin/drivers#pending" },
          { name: "Active drivers", href: "/admin/drivers#active" },
          { name: "Inactive drivers", href: "/admin/drivers#inactive" }
        ]
      },
      {
        name: "Driver RCTIs",
        key: "driverrctis",
        layout: "/admin",
        path: "/rctis",
        isAdmin: true,
        isCompany: false,
        isPrivate: true,
        children: [
          { name: "Pending RCTI", href: "/admin/rctis#pending" },
          { name: "Approved RCTI", href: "/admin/rctis#processed" },
        ]
      },
    ]
  },
];


export default routes;
