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
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { MUTATION_UPDATE_PASSWORD } from "@/graphql/auth";
// import DefaultAuthLayout from "@/layouts/auth/Default";
// Assets
import Link from "next/link";
// import { parseCookies } from "nookies";
import React, { useState } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useRouter, useSearchParams } from "next/navigation";

export default function PasswordReset() {
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
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const router = useRouter();
  const toast = useToast();
  // const cookies = parseCookies();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [handleForgotPassword, {  }] = useMutation(
    MUTATION_UPDATE_PASSWORD,
    {
      variables: {
        input: {
          token: token,
          email: email,
          password: password,
          password_confirmation: passwordConfirmation,
        },
      },
      onCompleted: () => {
        toast({ title: "Password reset successful", status: "success" });
        router.push("/auth/login");
      },
      onError: (error:any) => {
        const tokenError =
          (error?.graphQLErrors?.[0]?.extensions)?.errors?.token ||
          error?.message?.toLowerCase().includes("token");

        if (tokenError) {
          toast({
            title: "Reset link expired or invalid",
            description: "Please request a new password reset link.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });

          setTimeout(() => {
            router.push("/auth/forgot-password");
          }, 3000);
        } else {
          showGraphQLErrorToast(error);
        }
      },
      // onError: (error) => {
      //   showGraphQLErrorToast(error);
      // },
    },
  );

  return (
    // <DefaultAuthLayout illustrationBackground={"/img/auth/auth.png"}>
      <Box className="flex justify-center items-center w-1/2 min-w-1/2 bg-white">
        <Flex className="h-full w-full flex-col justify-center items-center">
          <Box>
            <Image
              src={"/img/branding/logo-2easy.svg"}
              alt=""
              mb="16"
              maxW="435px"
            />
            <Heading color={textColor} fontSize="36px" mb="45px">
              Reset Password
            </Heading>

            <Text
              className="mb-11 !font-medium text-sm"
              color={textColorSecondary}
            >
              Enter your new password
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
                  Password<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    isRequired={true}
                    fontSize="sm"
                    placeholder="Min. 8 characters"
                    mb="24px"
                    size="lg"
                    type={show ? "text" : "password"}
                    variant="auth"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement
                    display="flex"
                    alignItems="center"
                    mt="4px"
                  >
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: "pointer" }}
                      as={show ? RiEyeCloseLine as unknown as React.ElementType: MdOutlineRemoveRedEye as unknown as React.ElementType}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>

                <InputGroup size="md">
                  <Input
                    isRequired={true}
                    placeholder="Min. 8 characters"
                    type={show ? "text" : "password"}
                    variant="auth"
                    name="password_confirmation"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    fontSize="sm"
                    mb="24px"
                    size="lg"
                  />
                  <InputRightElement
                    display="flex"
                    alignItems="center"
                    mt="4px"
                  >
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: "pointer" }}
                      as={show ? RiEyeCloseLine as unknown as React.ElementType: MdOutlineRemoveRedEye as unknown as React.ElementType}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>

                <Button
                  className="!py-2.5 mb-6 w-full !h-[39px] rounded-lg"
                  variant="brand"
                  onClick={() => handleForgotPassword()}
                >
                  Reset Password
                </Button>
              </FormControl>

              <Text
                className="flex text-sm !font-normal"
                color={textColorDetails}
              >
                Go back?
                <Link href="/auth/login">
                  <Text className="ml-[5px] !font-bold" color={textColorBrand}>
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
