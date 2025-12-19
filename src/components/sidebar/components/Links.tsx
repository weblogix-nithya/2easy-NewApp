// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";
import { useSelector } from "react-redux";
// import { RootState } from "store/store";
// import { IRoute } from "types/navigation";
import { RootState } from "@/lib/store/store";
import { IRoute } from "@/lib/types/navigation";
import { usePathname } from "next/navigation";

interface SidebarLinksProps {
  routes: IRoute[];
}

export function SidebarLinks(props: SidebarLinksProps) {
  const { routes } = props;

  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  const isCustomer = useSelector((state: RootState) => state.user.isCustomer);
  const isCompany = useSelector((state: RootState) => state.user.isCompany);

  //   Chakra color mode
  // const router = useRouter();
  const pathname = usePathname();


  // let activeColor = useColorModeValue("gray.700", "white");
  let activeColor = useColorModeValue("white", "white");
  let inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600",
  );
  // let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("white", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return pathname.includes(routeName);
  };

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, index: number) => {
      if (
        (route.layout === "/admin" || route.layout === "/auth") &&
        route.sidebar &&
        (isAdmin || (isCustomer && route.isCompany == true))
      ) {
        return (
          <Link
            className="mk-links"
            key={index}
            href={route.layout + route.path}
          >
            {route.icon ? (
              <Box
                bg={
                  activeRoute(route.path.toLowerCase())
                    ? brandColor
                    : "transparent"
                }
              >
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py="15px"
                  ps="16px"
                >
                  <Flex w="100%" alignItems="center" justifyContent="center">
                    <Box
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? textColor
                          : textColor
                      }
                      me="4px"
                    >
                      {route.icon}
                    </Box>
                    <Text
                      me="auto"
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase())
                          ? "bold"
                          : "normal"
                      }
                    >
                     {isAdmin ? (route.path === "/jobs" ? "Bulk Allocation" : route.name) : (isCompany ? (route.path === "/jobs" ? "My Bookings" : route.name) : route.name)}
                    </Text>
                  </Flex>

                  <Box
                    h="36px"
                    w="4px"
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor
                        : "transparent"
                    }
                    borderRadius="5px"
                  />
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py="5px"
                  ps="10px"
                >
                  <Text
                    me="auto"
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
                    }
                  >
                    {route.name}
                  </Text>
                  <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                </HStack>
              </Box>
            )}
          </Link>
        );
      }
    });
  };
  //  BRAND
  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;
