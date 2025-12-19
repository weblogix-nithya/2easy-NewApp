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
// Custom components
// import { HSeparator } from "@/components/separator/Separator";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
// import { setAuthToken } from "graphql/ApolloClient";
import { MUTATION_LOGIN } from "@/graphql/auth";
import { MUTATION_CUSTOMER_REGISTER } from "@/graphql/customer";
// import DefaultAuthLayout from "@/layouts/auth/Default";
// Assets
import Link from "next/link";
import { setCookie } from "nookies";
import React, { useState } from "react";
// import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

export default function SignUp() {
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [handleSignUp] = useMutation(MUTATION_CUSTOMER_REGISTER, {
    variables: {
      input: {
        first_name: firstName,
        last_name: lastName,
        email: username,
        password: password,
        password_confirmation: passwordConfirmation,
      },
    },
    onCompleted: (_data) => {
      // console.log("MUTATION_CUSTOMER_REGISTER", data);
      handleLogin();
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [handleLogin, {}] = useMutation(MUTATION_LOGIN, {
    variables: {
      input: {
        username: username,
        password: password,
      },
    },
    onCompleted: (data) => {
      // console.log("MUTATION_LOGIN", data);
      const d = data as any;
      setCookie(null, "access_token", d.login.access_token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "user_name", d.login.user.name, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "user_email", d.login.user.email, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "customer_id", d.login.user.customer?.id, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "company_id", d.login.user.customer?.company_id, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "driver_id", d.login.user.driver?.id, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "user_id", d.login.user.id, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "is_admin", d.login.user.is_admin, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "is_company_admin", d.login.user.is_company_admin, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setCookie(null, "state", d.login.user.state, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      // setAuthToken();

      router.push("/admin/dashboard");
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Login failed",
        description: "Please check credentials",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return (
    // <DefaultAuthLayout illustrationBackground={"/img/auth/auth.png"}>
      <Box className="flex justify-center items-center w-1/2 min-w-1/2 bg-white h-full max-h-screen overflow-y-auto">
        <Flex className="h-full w-full flex-col justify-center items-center">
          <Box className="h-full p-10">
            <Image
              src={"/img/branding/logo-2easy.svg"}
              alt=""
              mb="16"
              maxW="435px"
            />
            <Heading color={textColor} fontSize="36px" mb="10px">
              Sign Up
            </Heading>
            <Text
              className="mb-11 !font-medium text-sm"
              color={textColorSecondary}
            >
              Enter your name, email and password to sign up!
            </Text>

            <Flex
              zIndex="2"
              flexDirection="column"
              w={{ base: "100%", md: "420px" }}
              maxW="100%"
              background="transparent"
              mx={{ base: "auto", lg: "unset" }}
              me="auto"
              mb={{ base: "20px", md: "auto" }}
            >
              {/* <Button
                className="mr-0 mb-6 py-4 h-[50px] !font-medium !text-sm rounded-lg"
                bgColor={googleBg}
                color={googleText}
                _hover={googleHover}
                _active={googleActive}
                _focus={googleActive}
                onClick={() => {
                  toast({
                    title: "Feature in development",
                    description: "TBC",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                <Icon as={FcGoogle as unknown as React.ElementType} w="20px" h="20px" me="10px" />
                Sign in with Google
              </Button>
              <Flex align="center" mb="25px">
                <HSeparator />
                <Text color="black.500" mx="14px">
                  or
                </Text>
                <HSeparator />
              </Flex> */}
              <FormControl>
                <FormLabel
                  className="!flex ml-1 mb-2 !text-sm !font-medium"
                  color={textColor}
                >
                  First Name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  type="email"
                  name="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                />
                <FormLabel
                  className="!flex ml-1 mb-2 !text-sm !font-medium"
                  color={textColor}
                >
                  Last Name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  type="email"
                  name="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                />
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`mail@${process.env.NEXT_PUBLIC_APP_NAME}.com.au`}
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                />
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
                    size="lg"
                    type={show ? "text" : "password"}
                    variant="auth"
                    name="password_confirmation"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    fontSize="sm"
                    mb="24px"
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
                  onClick={() => handleSignUp()}
                >
                  Sign Up
                </Button>
              </FormControl>

              <Text
                className="flex text-sm !font-normal pb-10"
                color={textColorDetails}
              >
                Already registered?
                <Link href="/auth/login">
                  <Text
                    className="ml-[5px] !font-bold"
                    color={textColorBrand}
                    as="span"
                  >
                    Login
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
