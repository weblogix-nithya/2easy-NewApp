// chakra imports
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import Content from "./components/Content";
import { IRoute } from "@/lib/types/navigation";
import { isWindowAvailable } from "@/utils/navigation";

interface SidebarResponsiveProps {
  routes: IRoute[];
}

interface SidebarProps extends SidebarResponsiveProps {
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const { routes } = props;

  let variantChange = "0.2s linear";
  let shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
    "unset",
  );
  // Chakra Color Mode
  let sidebarBg = useColorModeValue("secondary.400", "secondary.400");
  let sidebarMargins = "0px";

  // SIDEBAR
  return (
    <Box
      //  display={{ sm: "none", xl: "block" }}
      position="fixed"
      minH="100%"
    >
      <Box
        bg={sidebarBg}
        transition={variantChange}
        // w="300px"
        w="200px"
        h="100vh"
        m={sidebarMargins}
        minH="100%"
        overflowX="hidden"
        boxShadow={shadow}
      >
        <Content routes={routes} />
      </Box>
    </Box>
  );
}

// FUNCTIONS
export function SidebarResponsive(props: SidebarResponsiveProps) {
  let sidebarBackgroundColor = useColorModeValue("white", "navy.800");
  // let menuColor = useColorModeValue("gray.400", "white");

  // // SIDEBAR
  const { isOpen, onClose } = useDisclosure();
  const btnRef = React.useRef(null);

  const { routes } = props;
  // let isWindows = navigator.platform.startsWith("Win");
  //  BRAND

  return (
    <Flex
      className="mk-popout-sidebar items-center flex"
      // display={{ sm: "flex", xl: "none" }}
    >
      {/* <Flex ref={btnRef} w="max-content" h="max-content" onClick={onOpen}>
        <FontAwesomeIcon
          icon={faBars}
          className="my-auto w-5 h-5 me-2.5 !text-[var(--chakra-colors-black-400)]"
          size="lg"
        />
      </Flex> */}

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={
          isWindowAvailable() && window.document.documentElement.dir === "rtl"
            ? "right"
            : "left"
        }
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />

        <DrawerContent w="285px" maxW="285px" bg={sidebarBackgroundColor}>
          <DrawerCloseButton
            zIndex="3"
            onClick={onClose}
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />

          <DrawerBody maxW="285px" px="0rem" pb="0">
            <Content routes={routes} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
// PROPS

export default Sidebar;
