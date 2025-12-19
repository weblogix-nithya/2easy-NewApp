"use client"
import { useMutation } from "@apollo/client/react";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { MUTATION_FORGOT_PASSWORD } from "@/graphql/auth";
// import DefaultAuthLayout from "@/layouts/auth/Default";
// Assets
import Link from "next/link";
// import { useRouter } from "next/router";
// import { parseCookies } from "nookies";
import React, { useState } from "react";

export default function ForgotPassword() {
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
   const textColorSecondary = "black.500";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  // const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  // const googleText = useColorModeValue("navy.700", "white");
  // const googleHover = useColorModeValue(
  //   { bg: "gray.200" },
  //   { bg: "whiteAlpha.300" },
  // );
  // const googleActive = useColorModeValue(
  //   { bg: "secondaryGray.300" },
  //   { bg: "whiteAlpha.200" },
  // );
  // const [show, setShow] = React.useState(false);
  // const handleClick = () => setShow(!show);
  // const router = useRouter();
  const toast = useToast();
  // const cookies = parseCookies();
  const [email, setEmail] = useState("");

  const [handleForgotPassword, {  }] = useMutation(
    MUTATION_FORGOT_PASSWORD,
    {
      variables: {
        input: {
          email: email,
        },
      },
      onCompleted: () => {
        toast({
          title: "Password reset link sent to your email",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  return (
    // <DefaultAuthLayout illustrationBackground={"/img/auth/auth.png"}>
      <Box className="flex justify-center items-center w-1/2 min-w-1/2 bg-white">
        <Flex className="h-full w-full flex-col justify-center items-center">
          <Box maxW="340px">
            <Image
              src={"/img/branding/logo-2easy.svg"}
              alt=""
              mb="16"
              maxW="435px"
            />
            <Heading color={textColor} fontSize="36px" mb="45px">
              Forgot Password?
            </Heading>
            <Text
              className="mb-11 !font-medium text-sm"
              color={textColorSecondary}
            >
              Enter your email address you signed up with, and we&apos;ll send
              you a link to reset your password
            </Text>
            <Flex
              className="flex-col mr-auto max-w-full bg-transparent"
              zIndex="2"
              w={{ base: "100%", md: "420px" }}
              mx={{ base: "auto", lg: "unset" }}
              mb={{ base: "20px", md: "auto" }}
            >
              <FormControl>
                <FormLabel
                  className="!flex ml-1 mb-2 !text-sm !font-medium"
                  color={textColor}
                >
                  Email<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  type="email"
                  name="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`mail@${process.env.NEXT_PUBLIC_APP_NAME}.com.au`}
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                />
                <Button
                  className="!py-2.5 mb-6 w-full !h-[39px] rounded-lg"
                  variant="brand"
                  onClick={() => handleForgotPassword()}
                >
                  Send Reset Link
                </Button>
              </FormControl>

              <Text
                className="flex text-sm !font-normal"
                color={textColorDetails}
              >
                Go back?
                <Link href="/auth/login">
                  <Text
                    className="ml-[5px] !font-bold"
                    color={textColorBrand}
                    as="span"
                  >
                    Back to Login
                  </Text>
                </Link>
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>
    // </DefaultAuthLayout>
  );
}
