"use client"
import {
  Box,
  Center, Spinner, SimpleGrid,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import React, { useEffect } from "react";

//In Next.js App Router, a client component cannot be async. That is exactly the error:
// export default async function Page() {
export default function Page() {
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
  },[router]);

  return (
    // <div>
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
    // </div>
  )
}

