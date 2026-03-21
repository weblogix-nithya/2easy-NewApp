// "use client"
// // Chakra imports
// import { Box, Flex, Image, Portal, useDisclosure } from "@chakra-ui/react";
// import { faBars } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Status, Wrapper } from "@googlemaps/react-wrapper";
// import { defaultSelectedFilter } from "@/components/jobs/Filters";
// // import { defaultSelectedFilter } from "components/jobs/Filters";
// // Layout components
// import Navbar from "@/components/navbar/NavbarAdmin";
// // import Sidebar from "@/components/sidebar/Sidebar";
// import Sidebar from "@/components/sidebar/Sidebar";
// import { SidebarContext } from "@/lib/contexts/SidebarContext";
// // import { useRouter } from "next/router";
// import { usePathname, useRouter } from "next/navigation";
// import { parseCookies } from "nookies";
// import { PropsWithChildren, ReactElement, useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// // import routes from "routes";s
// import routes from "@/routes";
// import {
//   setDisplayName,
//   setIsFilterTicked,
//   setJobFilters,
//   setJobMainFilters,
// } from "@/lib/store/jobFilterSlice";
// import { setRoutes } from "@/lib/store/routesSlice";
// // import { RootState } from "@/lib/store/store";
// import {
//   setCompanyId,
//   setCustomerId,
//   setDriverId,
//   setIsAdmin,
//   setIsCompanyAdmin,
//   setState,
//   setUserId,
//   setUserName,
// } from "@/lib/store/userSlice";
// import {
//   getActiveNavbar,
//   getActiveNavbarText,
//   getActivePath,
//   getActiveRoute,
// } from "@/utils/navigation";
// import { enforceCompanyAccess } from "@/utils/routeGuard";


// const render = (status: Status): ReactElement => {
//   if (status === Status.LOADING) {
//     return;
//   }
//   if (status === Status.FAILURE) {
//     return;
//   }
//   return null;
// };

// interface DashboardLayoutProps extends PropsWithChildren {
//   [x: string]: any;
// }

// // Custom Chakra theme
// export default function AdminLayout(props: DashboardLayoutProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { children, ...rest } = props;
//   // states and functions
//   const [fixed] = useState(false);
//   const [isAuth, setIsAuth] = useState(false);
//   const [toggleSidebar, setToggleSidebar] = useState(false);
//   const [toggleFullSidebar, setToggleFullSidebar] = useState(true);
//   // functions for changing the states from components
//   const [isClient, setIsClient] = useState(false);
//   useEffect(() => {
//     setIsClient(true);
//   }, []);
//   // const _isShowRightSideBar = useSelector(
//   //   (state: RootState) => state.rightSideBar.isShow,
//   // );
//   useEffect(() => {
//     if (isAuth) enforceCompanyAccess(router, routes, cookies);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pathname]);

//   const dispatch = useDispatch();

//   const cookies = parseCookies();

//   const handleMenuToggle = () => {
//     setToggleFullSidebar(!toggleFullSidebar);
//   };

//   useEffect(() => {
//     window.document.documentElement.dir = "ltr";
//     if (
//       cookies.access_token === "undefined" ||
//       cookies.access_token === "" ||
//       cookies.access_token === undefined
//     ) {
//       router.push("/auth/login");
//     } else {
//       setIsAuth(true);
//       dispatch(
//         setRoutes(
//           routes.map(
//             ({ title, name, layout, path, isAdmin, isCompany, isPrivate }) => ({
//               title,
//               name,
//               layout,
//               path,
//               isAdmin,
//               isCompany,
//               isPrivate,
//             }),
//           ),
//         ),
//       );
//       if (  
//         cookies.is_admin !== undefined &&
//         cookies.is_admin !== "undefined" &&
//         cookies.is_admin !== ""
//       ) {
//         dispatch(setIsAdmin(cookies.is_admin === "true" ? true : false));
//       }
//       if (
//         cookies.is_company_admin !== undefined &&
//         cookies.is_company_admin !== "undefined" &&
//         cookies.is_company_admin !== ""
//       ) {
//         dispatch(
//           setIsCompanyAdmin(cookies.is_company_admin === "true" ? true : false),
//         );
//       }
//       if (
//         cookies.company_id !== undefined &&
//         cookies.company_id !== "undefined" &&
//         cookies.company_id !== ""
//       ) {
//         dispatch(setCompanyId(cookies.company_id));
//         // Company/Customer middleware. badly done.
//         if (
//           cookies.is_admin !== "true" && // <-- THIS is the key fix
//           typeof window !== "undefined" &&
//           !window.location.hash
//         ) {
//           const activeRoute = routes.find((r) =>
//             pathname.includes(r.path),
//           );
//           if (
//             activeRoute &&
//             !activeRoute.isCompany &&
//             pathname !== "/admin/dashboard"
//           ) {
//             console.warn("🔁 Redirecting restricted route →", pathname);
//             router.push("/admin/dashboard");
//           }
//         }
//       }
//       if (
//         cookies.customer_id !== undefined &&
//         cookies.customer_id !== "undefined" &&
//         cookies.customer_id !== ""
//       ) {
//         dispatch(setCustomerId(cookies.customer_id));
//       } else if (
//         cookies.driver_id !== undefined &&
//         cookies.driver_id !== "undefined" &&
//         cookies.driver_id !== ""
//       ) {
//         dispatch(setDriverId(cookies.driver_id));
//       }
//       if (cookies.state !== "undefined" && cookies.state !== "") {
//         dispatch(setState(cookies.state || "Victoria"));
//       }
//       if (
//         cookies.user_id !== undefined &&
//         cookies.user_id !== "undefined" &&
//         cookies.user_id !== ""
//       ) {
//         dispatch(setUserId(cookies.user_id));
//         dispatch(setUserName(cookies.user_name));
//       }
//       if (
//         cookies["jobMainFilters"] !== undefined &&
//         cookies["jobMainFilters"] !== "undefined" &&
//         cookies["jobMainFilters"] !== ""
//       ) {
//         dispatch(setJobMainFilters(JSON.parse(cookies["jobMainFilters"])));
//       }
//       if (
//         cookies["displayName"] !== undefined &&
//         cookies["displayName"] !== "undefined" &&
//         cookies["displayName"] !== ""
//       ) {
//         dispatch(setDisplayName(JSON.parse(cookies["displayName"])));
//       }
//       if (
//         cookies["is_filter_ticked"] !== undefined &&
//         cookies["is_filter_ticked"] !== "undefined" &&
//         cookies["is_filter_ticked"] !== ""
//       ) {
//         dispatch(setIsFilterTicked(cookies["is_filter_ticked"]));
//       }
//     }
//     for (const key in defaultSelectedFilter) {
//       let cookies_key = `jobFilters_${key}`;
//       if (
//         cookies[cookies_key] !== undefined &&
//         cookies[cookies_key] !== "undefined" &&
//         cookies[cookies_key] !== ""
//       ) {
//         dispatch(
//           setJobFilters({
//             key: key,
//             value: JSON.parse(cookies[cookies_key]),
//           }),
//         );
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAuth, cookies.access_token, router]);

//   const { onOpen } = useDisclosure();

//   if (!isClient) return null;

//   return (
//     <Wrapper
//       apiKey={process.env.NEXT_PUBLIC_MAPS_KEY}
//       render={render}
//   libraries={["places", "marker"]}
//     >
//       {isAuth && (
//         <Box className="mk-admin-index">
//           <SidebarContext.Provider
//             value={{
//               toggleSidebar,
//               setToggleSidebar,
//             }}
//           >
//             <Sidebar routes={routes} display="none" {...rest} />

//             {/* TODO: change the width based on if the user has toggled width */}
//             <Flex
//               onClick={handleMenuToggle}
//               className="z-10 fixed top-0 pl-[15px] pb-[1px] w-[190px] cursor-pointer border-b bg-white"
//             >
//               <FontAwesomeIcon
//                 icon={faBars}
//                 className="my-auto w-5 h-5 me-2.5 !text-[var(--chakra-colors-black-400)]"
//                 size="lg"
//               />
//               <Image
//                 src={"/img/branding/logo-2easy.svg"}
//                 alt=""
//                 h="26px"
//                 w="130px"
//                 my="35px"
//                 mx="auto"
//               />
//             </Flex>

//             <Box
//               className={
//                 "mk-admin-index relative h-full max-h-full overflow-auto bg-white " +
//                 (toggleFullSidebar ? "w-[calc(100%_-_190px)]" : "w-full")
//               }
//               // w={{ base: "100%", xl: "calc( 100% - 190px )" }}
//               // maxWidth={{ base: "100%", xl: "calc( 100% - 190px )" }}
//               float="right"
//               // minHeight="100vh"

//               transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
//               transitionDuration=".2s, .2s, .35s"
//               transitionProperty="top, bottom, width"
//               transitionTimingFunction="linear, linear, ease"
//             >
//               <Portal>
//                 <Box bgColor="white">
//                   <Navbar
//                     onOpen={onOpen}
//                     logoText={
//                       process.env.NEXT_PUBLIC_APP_NAME + " UI Dashboard PRO"
//                     }
//                     brandText={getActiveRoute(routes)}
//                     brandPath={getActivePath(routes)}
//                     secondary={getActiveNavbar(routes)}
//                     message={getActiveNavbarText(routes)}
//                     fixed={fixed}
//                     {...rest}
//                   />
//                 </Box>
//               </Portal>

//               <Box
//                 className="mk-adminLayout"
//                 mx="auto"
//                 p={0}
//                 minH="100vh"
//                 bg="white"
//               >
                
  
//                 {children}
                

//               </Box>
//             </Box>
//           </SidebarContext.Provider>
//           {/* <Box>
//             <Footer />
//           </Box> */}
//         </Box>
//       )}
//     </Wrapper>
//   );
// }

import Providers from "../provider";
interface DashboardLayoutProps extends PropsWithChildren {
  [x: string]: any;
}

import AdminLayout from "@/layouts/admin";
import { PropsWithChildren, Suspense } from "react";
// import { Center, Spinner } from "@chakra-ui/react";


// export function FullscreenLoader() {
//   return (
//     <Center pos="fixed"
//       top={0}
//       left={0}
//       w="100vw"
//       h="100vh"
//       bg="white"
//       zIndex={9999}>
//       <Spinner boxSize="100px" thickness="6px" />
//     </Center>
//   );
// }

export default function Layout(props: DashboardLayoutProps) {
  const { children } = props;
  return(
    <Providers>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminLayout>
          {children}
        </AdminLayout>
      </Suspense>
    </Providers>
  )
}