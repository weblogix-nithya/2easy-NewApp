"use client";
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Link,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import CustomInputField from "@/components/fields/CustomInputField";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import {
  defaultUser,
  GET_USER_QUERY,
  RESET_USER_PASSWORD_MUTATION,
} from "@/graphql/user";
import AdminLayout from "@/layouts/admin";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

const ResetPasswordForm = () => {
  const toast = useToast();
  const [user, setUser] = useState(defaultUser);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useParams();
  const id = (params?.id ?? "") as string;
  const {
    // loading: userLoading,
    // data: userData,
    // refetch: getUser,
  } = useApolloQueryWithEffect(GET_USER_QUERY, {
    variables: {
      id: id,
    },
    onCompleted: (data) => {
      if (data?.user == null) {
        router.push("/admin/users");
      }
      setUser({ ...user, ...data?.user });
      setEmail(data?.user?.email);
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [resetUserPassword] = useMutation(RESET_USER_PASSWORD_MUTATION, {
    onCompleted: (data: any) => {
      toast({
        title: "Password reset successful",
        description: `New password for ${data.resetUserPassword.email} has been set.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewPassword("");
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
      setNewPassword("");
    },
  });

  return (
    <AdminLayout>
      <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
        <SimpleGrid mb="20px" pt="32px" px="24px" columns={{ sm: 1 }}>
          <h1 className="mb-5">Reset Password User</h1>
          <Flex
            minWidth="max-content"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormControl>
              {/* User Email */}
              <CustomInputField
                label="User Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isDisabled
                placeholder="Enter user email"
              />

              {/* New Password */}
              <CustomInputField
                label="New Password"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />

              {/* Reset Password Button */}
              <Flex mt={6}>
                <Button
                  colorScheme="blue"
                  onClick={async () => {
                    await resetUserPassword({
                      variables: {
                        id: user.id,
                        new_password: newPassword,
                      },
                    });
                  }}
                  isDisabled={!email || !newPassword}
                >
                  Reset Password
                </Button>
                <Link href={`/admin/users`} fontWeight="700">
                  <Button
                    bg={"blackalpha.300"}
                    color={"blue.300"}
                    ml={4}
                    // bg="white"
                    fontSize="sm"
                    // fontWeight="500"
                    className="!text-[#3B68DB]"
                    // color={textColorSecondary}
                    // borderRadius="7px"
                  >
                    Back to Users
                  </Button>
                </Link>
              </Flex>
            </FormControl>
          </Flex>
        </SimpleGrid>
      </Box>
    </AdminLayout>
  );
};

export default ResetPasswordForm;
