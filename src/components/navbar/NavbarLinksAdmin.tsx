// Chakra Imports
import {
  Flex,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  // useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Custom Components
// import { ItemContent } from "components/menu/ItemContent";
// import { SearchBar } from "components/navbar/searchBar/SearchBar";
// import { SidebarResponsive } from "components/sidebar/Sidebar";
// import { ItemContent } from "../menu/ItemContent";
import { SidebarResponsive } from "../sidebar/Sidebar";
import { useRouter } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
// Icons
import { FaEthereum } from "react-icons/fa";
// Assets
// import { MdNotificationsNone } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { logoutUser } from "@/lib/store/userSlice";
import routes from "@/routes";

// Change to:
import { apolloClient } from "../../graphql/ApolloClient";

export default function HeaderLinks(props: { secondary: boolean }) {
  const { secondary } = props;
  // const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useDispatch();

  // Chakra Color Mode
  // const navbarIcon = useColorModeValue("gray.400", "white");
  let menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  // const textColorBrand = useColorModeValue("brand.700", "brand.400");
  const ethColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");
  const ethBg = useColorModeValue("secondaryGray.300", "navy.900");
  const ethBox = useColorModeValue("white", "navy.800");
  // const shadow = useColorModeValue(
  //   "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
  //   "14px 17px 40px 4px rgba(112, 144, 176, 0.06)",
  // );
  // const borderButton = useColorModeValue("secondaryGray.500", "whiteAlpha.200");
  const router = useRouter();
  const cookies = parseCookies();
  const [userName, setUserName] = useState("-");
  const userId = useSelector((state: RootState) => state.user.userId);

  useEffect(() => {
    setUserName(cookies.user_name ? cookies.user_name : "-");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.user_name]);

  // Add this function at the top level of the file, after the imports
  const clearAllCookies = () => {
    const cookieNames = [
      "access_token",
      "user_name",
      "user_email",
      "customer_id",
      "driver_id",
      "company_id",
      "is_admin",
      "is_company_admin",
      "user_id",
      "state",
      "reset_approve"
    ];

    // const paths = ["/", "/admin", "/admin/jobs", "*"];
    const paths = ["/", "/admin", "/admin/jobs"];

    cookieNames.forEach((name) => {
      paths.forEach((path) => {
        destroyCookie(null, name, { path });
      });
    });
  };

  async function onLogout() {
    // Clear all cookies using the new function
    clearAllCookies();
    // Clear Apollo Client cache
    try {
      await apolloClient?.clearStore();
    } catch (error) {
      console.error("Error clearing Apollo cache:", error);
    }
    dispatch(logoutUser());
    router.push("/auth/login");
  }

  return (
    <Flex
      className="mk-NavbarLinksAdmin !w-full justify-between align-center p-2.5"
      flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
      // w={{ sm: "100%", md: "auto" }}
      bg={menuBg}
      // borderRadius="30px"
      // boxShadow={shadow}
    >
      {/* {false && (
        <SearchBar
          className="ml-2.5"
          mb={() => {
            if (secondary) {
              return { base: "10px", md: "unset" };
            }
            return "unset";
          }}
        />
      )} */}

      <Flex
        bg={ethBg}
        display={secondary ? "flex" : "none"}
        borderRadius="30px"
        ms="auto"
        p="6px"
        align="center"
        me="6px"
      >
        <Flex
          align="center"
          justify="center"
          bg={ethBox}
          h="29px"
          w="29px"
          borderRadius="30px"
          me="7px"
        >
          <Icon color={ethColor} w="9px" h="14px" as={FaEthereum as unknown as React.ElementType} />
        </Flex>
        <Text
          w="max-content"
          color={ethColor}
          fontSize="sm"
          fontWeight="700"
          me="6px"
        >
          1,924
          <Text as="span" display={{ base: "none", md: "unset" }}>
            {" "}
            ETH
          </Text>
        </Text>
      </Flex>

      <SidebarResponsive routes={routes} />

      {/* {false && (
        <Menu>
          <MenuButton p="0px" boxShadow={null}>
            <Icon
              className="mt-1.5 w-[18px] h-[18px] me-2.5"
              as={MdNotificationsNone as unknown as React.ElementType}
              color={navbarIcon}
            />
          </MenuButton>

          <MenuList
            p="20px"
            mt="22px"
            boxShadow={shadow}
            bg={menuBg}
            me={{ base: "30px", md: "unset" }}
            minW={{ base: "unset", md: "400px", xl: "450px" }}
            maxW={{ base: "360px", md: "unset" }}
          >
            <Flex w="100%" mb="20px">
              <Text fontSize="md" fontWeight="600" color={textColor}>
                Notifications
              </Text>
              <Text
                fontSize="sm"
                fontWeight="500"
                ms="auto"
                cursor="pointer"
                color={textColorBrand}
              >
                Mark all read
              </Text>
            </Flex>

            <Flex flexDirection="column">
              <MenuItem
                _hover={{ bg: "none" }}
                _focus={{ bg: "none" }}
                px="0"
                mb="10px"
              >
                <ItemContent
                  info={process.env.NEXT_PUBLIC_APP_NAME + " UI Dashboard PRO"}
                />
              </MenuItem>
              <MenuItem
                _hover={{ bg: "none" }}
                _focus={{ bg: "none" }}
                px="0"
                mb="10px"
              >
                <ItemContent
                  info={
                    process.env.NEXT_PUBLIC_APP_NAME + " Design System Free"
                  }
                />
              </MenuItem>
            </Flex>
          </MenuList>
        </Menu>
      )} */}

      {/* {process.env.NEXT_PUBLIC_APP_ENV !== "production" && (
        <Button
          variant="no-hover"
          bg="transparent"
          p="0px"
          minW="unset"
          minH="unset"
          h="18px"
          w="max-content"
          onClick={toggleColorMode}
        >
          <Icon
            me="10px"
            h="18px"
            w="18px"
            color={navbarIcon}
            as={colorMode === "light" ? IoMdMoon : IoMdSunny}
          />
        </Button>
      )} */}

      <Menu>
        {/* Dropdown Menu */}
        <MenuButton className="ml-auto p-0" color="primary.400">
          <strong>{userName}</strong>

          <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
          {/* <Avatar
            _hover={{ cursor: "pointer" }}
            color="white"
            name={userName}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          /> */}
        </MenuButton>

        <MenuList
          //  boxShadow={shadow}
          mt="10px"
          bg={menuBg}
        >
          <Flex w="100%" mb="0px">
            <Text
              className="pt-1.5 pb-2.5 px-3.5 w-full !font-bold text-sm"
              borderBottom="1px solid"
              borderColor={borderColor}
              color={textColor}
            >
              {userName}
            </Text>
          </Flex>

          <Flex flexDirection="column">
            <MenuItem
            // px="14px"
            // _hover={{ bg: "none" }}
            // _focus={{ bg: "none" }}
            >
              <Link href={`/admin/users/${userId}`}>
                <Text fontSize="sm">Profile Settings</Text>
              </Link>
            </MenuItem>

            <MenuItem
              onClick={onLogout}
              color="red.400"
              // px="14px"
              // _hover={{ bg: "none" }}
              // _focus={{ bg: "none" }}
            >
              <Text fontSize="sm">Log out</Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
