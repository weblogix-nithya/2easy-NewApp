"use client"
import {
  Box,
  Center, Spinner, SimpleGrid,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import React, { useEffect } from "react";


export default async function Page() {

  const cookies = parseCookies();
  const token = cookies.access_token ? cookies.access_token : null;
  console.log("tokentoken",token,cookies)
  const router = useRouter();

  useEffect(() => {
    if (token !== null) {
      router.push("/admin/dashboard");
    } else {
      router.push("/auth/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <div>
      <Center h="100vh">
        <SimpleGrid columns={1}>
          <Box>
            { <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            /> }
            {/* <Spinner size="xl" /> */}
          </Box>
        </SimpleGrid>
      </Center>
    </div>
  )
}

