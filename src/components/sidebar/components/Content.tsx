// chakra imports
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
//   Custom components
// import Links from "components/sidebar/components/Links";
// import { IRoute } from "types/navigation";
import { IRoute } from "@/lib/types/navigation";
import Links from "./Links";

// FUNCTIONS

interface SidebarContentProps {
  routes: IRoute[];
}

function SidebarContent(props: SidebarContentProps) {
  const { routes } = props;
  return (
    // SIDEBAR nav
    <Flex className="mk-content flex-col mt-0 pt-[96px]">
      {/* <Brand /> */}

      {/* This is the nav sidebar */}
      <Box className="mk-leftside-nav" backgroundColor="secondary.400">
        <Stack direction="column" mt="8px" mb="auto">
          <Box>
            <Text
              fontSize="12px"
              className="mt-4 ml-4 mb-2 text-[#fff] tracking-[1px]"
            >
              <strong>OPERATIONS</strong>
            </Text>
            <Links routes={routes} />
          </Box>
        </Stack>
      </Box>
    </Flex>
  );
}

export default SidebarContent;
