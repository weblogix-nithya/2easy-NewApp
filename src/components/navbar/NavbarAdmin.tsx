// Chakra Imports
import {
  Box,
  // Breadcrumb,
  // BreadcrumbItem,
  // BreadcrumbLink,
  Flex,
  // useColorModeValue,
  // Link,
  // useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { isWindowAvailable } from "@/utils/navigation";
import AdminNavbarLinks from "./NavbarLinksAdmin";
export default function AdminNavbar(props: {
  secondary: boolean;
  message: string | boolean;
  brandText: string;
  brandTitle?: string;
  brandPath: string;
  logoText: string;
  fixed: boolean;
  onOpen: (...args: any[]) => any;
}) {
  const [_scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isWindowAvailable()) {
      // You now have access to `window`
      window.addEventListener("scroll", changeNavbar);

      return () => {
        window.removeEventListener("scroll", changeNavbar);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const { secondary} = props;

  // Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
  let navbarPosition = "fixed" as const;
  let navbarFilter = "none";
  let navbarBackdrop = "blur(20px)";
  let navbarShadow = "none";
  // let mainText = useColorModeValue("navy.700", "white");
  // let secondaryText = useColorModeValue("gray.700", "white");
  // let navbarBg = useColorModeValue(
  //   "rgba(244, 247, 254, 0.2)",
  //   "rgba(11,20,55,0.5)",
  // );
  // let navbarBorder = "transparent";
  let secondaryMargin = "0px";
  let paddingX = "15px";
  let gap = "0px";

  const changeNavbar = () => {
    if (isWindowAvailable() && window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  return (
    // Top navigation bar
    <Box
      className="mk-navbarAdmin bg-white min-h-[98px] mx-auto py-2 w-full"
      borderBottom="1px"
      borderBottomColor="gray.200"
      position={navbarPosition}
      boxShadow={navbarShadow}
      filter={navbarFilter}
      backdropFilter={navbarBackdrop}
      backgroundPosition="center"
      backgroundSize="cover"
      transitionDelay="0s, 0s, 0s, 0s"
      transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
      transition-property="box-shadow, background-color, filter, border"
      transitionTimingFunction="linear, linear, linear, linear"
      alignItems={{ xl: "center" }}
      display={secondary ? "block" : "flex"}
      justifyContent={{ xl: "center" }}
      // lineHeight="25.6px"
      top="0px"
      right="0px"
      mt={secondaryMargin}
      px={{
        sm: paddingX,
        md: "10px",
      }}
      ps={{
        xl: "12px",
      }}
      w={{
        base: "calc(100vw)",
        xl: "calc(100vw - 189px)",
        "2xl": "calc(100vw - 189px)",
      }}
    >
      <Flex
        w="100%"
        flexDirection={{
          sm: "column",
          md: "row",
        }}
        alignItems={{ xl: "center" }}
        mb={gap}
      >
        <Box mb={{ sm: "8px", md: "0px" }}>
          {/* <Breadcrumb>
            <BreadcrumbItem color={secondaryText} fontSize="sm" mb="5px">
              <BreadcrumbLink href="/admin/dashboard" color={secondaryText}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem color={secondaryText} fontSize="sm" mb="5px">
              <BreadcrumbLink href={brandPath} color={secondaryText}>
                {brandText}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb> */}

          {/* Here we create navbar brand, based on route name */}
          {/* <Link
            color={mainText}
            href="#"
            bg="inherit"
            borderRadius="inherit"
            fontWeight="bold"
            fontSize="34px"
            _hover={{ color: { mainText } }}
            _active={{
              bg: "inherit",
              transform: "none",
              borderColor: "transparent",
            }}
            _focus={{
              boxShadow: "none",
            }}
          >
            {brandTitle || brandText}
          </Link> */}
        </Box>

        <Box
          w={{ sm: "100%", md: "unset" }}
          className="flex items-center ml-auto !w-full"
        >
          <AdminNavbarLinks
            // onOpen={props.onOpen}
            secondary={props.secondary}
            // fixed={props.fixed}
          />
        </Box>
      </Flex>
    </Box>
  );
}
