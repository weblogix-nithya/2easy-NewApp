import React from "react";

function CustomerEditJob() {
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
          <Text mr={3}>Admin Edit Job Page is under construction</Text>
          <Spinner size="sm" />
        </Flex>
      </SimpleGrid>
    </Box>
  );
}

export default CustomerEditJob;
