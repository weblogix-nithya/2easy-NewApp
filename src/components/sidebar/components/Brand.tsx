// Chakra imports
import {
  Box,
  Flex,
  Image,
  Link,
  // useColorModeValue
} from "@chakra-ui/react";

export function SidebarBrand() {
  return (
    <Box borderBottom="1px" borderBottomColor="gray.200">
      <Flex alignItems="center" flexDirection="column">
        <Link href="/admin/dashboard">
          <Image
            src={"/img/branding/logo-2easy.svg"}
            alt=""
            h="26px"
            w="130px"
            my="35px"
            mx="auto"
          />
        </Link>
      </Flex>
    </Box>
  );
}

export default SidebarBrand;
