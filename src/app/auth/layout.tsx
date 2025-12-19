// "use client"
// // Chakra imports
// import FixedPlugin from "@/components/fixedPlugin/FixedPlugin";
// import {
//   Box,
//   Flex,
//   // Icon,
//   Image,
//   // Text,
//   useColorModeValue,
// } from "@chakra-ui/react";
// // import Footer from "components/footer/FooterAuth";
// // import Link from "next/link";
// import { ReactNode, Suspense } from "react";
// // Assets
// // import { FaChevronLeft } from "react-icons/fa";

// function AuthIllustration(props: {
//   children: ReactNode;
//   // illustrationBackground: string;
// }) {
//   const authBg = useColorModeValue("white", "navy.900");
//   const { children } = props;
//   // Chakra color mode
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <Flex
//         // minW="100vh"
//         bg={authBg}
//         position="relative"
//         h="max-content"
//       >
//         <Flex
//           h={{
//             sm: "initial",
//             md: "unset",
//             lg: "100vh",
//             xl: "100vh",
//           }}
//           w="100%"
//           // maxW={{ md: "66%", lg: "1313px" }}
//           // mx="auto"
//           pt={{ sm: "50px", md: "0px" }}
//         // px={{ lg: "30px", xl: "0px" }}
//         // ps={{ xl: "70px" }}
//         // justifyContent="start"
//         // direction="column"
//         >
//           {/* <Link
//           href="/"
//           style={{
//             width: "fit-content",
//             marginTop: "40px",
//           }}
//         >
//           <Flex
//             align="center"
//             ps={{ base: "25px", lg: "0px" }}
//             pt={{ lg: "0px", xl: "0px" }}
//             w="fit-content"
//           >
//             <Icon
//               as={FaChevronLeft}
//               me="12px"
//               h="13px"
//               w="8px"
//               color="secondaryGray.600"
//             />
//             <Text ms="0px" fontSize="sm" color="secondaryGray.600">
//               Back to {process.env.NEXT_PUBLIC_APP_NAME}
//             </Text>
//           </Flex>
//         </Link> */}

//           {/* <Box
//           display="flex"
//           h="100%"
//           minH="100vh"
//           w="50%"
//           bg="primary.400"
//           // position="absolute"
//           // right="0px"
//         >
//           <Flex
//             // style={{ backgroundImage: `url(${illustrationBackground})` }}
//             justify="center"
//             // align="end"
//             // w="100%"
//             h="100%"

//             // bgSize="cover"
//             // bgPosition="50%"
//             // position="absolute"
//             // borderBottomLeftRadius={{ lg: "120px", xl: "200px" }}
//           />
//         </Box> */}

//           <Box
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//             h="100%"
//             minH="100vh"
//             w="50%"
//             bg="primary.400"
//           >
//             <Image src={"/img/auth/login-hero.svg"} alt="" maxW="435px" />
//           </Box>

//           {children}

//           {/* <Footer mb={{ xl: "3vh" }} /> */}
//         </Flex>

//         {false && <FixedPlugin />}
//       </Flex>
//     </Suspense>
//   );
// }

// export default AuthIllustration;


import Providers from "../provider";
import { ReactNode, Suspense } from "react";
import DefaultAuthLayout from "@/layouts/auth/Default";

export default function Layout(props: {
  children: ReactNode;
  // illustrationBackground: string;
}) {
  const { children } = props;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Providers>
        <DefaultAuthLayout>
          {children}
        </DefaultAuthLayout>
      </Providers>
    </Suspense>
  )
}