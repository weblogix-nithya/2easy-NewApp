import { Box, Flex, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import React from "react";

function CustomerEditQuote() {
  return (
    <Box pt={{ base: "130px", md: "97px", xl: "97px" }} bg="white" minH="100vh">
      <SimpleGrid
        mb="70px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px" }}
      >
        <Flex align="center" justify="center" py={12}>
          <Text mr={3}>Admin Quote Edit Page is under construction</Text>
          <Spinner size="sm" />
        </Flex>
      </SimpleGrid>
    </Box>
  );
}

export default CustomerEditQuote;
