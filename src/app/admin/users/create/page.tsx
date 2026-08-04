"use client";
// Chakra imports
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  SimpleGrid,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { CREATE_USER_MUTATION } from "@/graphql/user";
import { australianStates, roleOptions } from "@/lib/helpers/helper";
import AdminLayout from "@/layouts/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

import CustomInputField from "@/components/fields/CustomInputField";

export default function UserEdit() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  //  const textColorSecondary = "gray.400";
  const [user, setUser] = useState({
    name: "",
    email: "",
    media_url: "",
    state: "Queensland",
    roles: [],
    password: "",
  });
  const router = useRouter();
  const [userRoles, _setUserRoles] = useState([]);
  const [roleIds, setRoleIds] = useState([]);

  const [handleCreateUser, {}] = useMutation(CREATE_USER_MUTATION, {
    variables: {
      input: {
        name: user.name,
        email: user.email,
        state: user.state,
        roles: roleIds,
        password: user.password,
      },
    },
    onCompleted: (data: any) => {
      toast({
        title: "User created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push(`/admin/users/${data.createUser.id}`);
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  return (
    <AdminLayout>
      <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
        <SimpleGrid mb="20px" pt="32px" px="24px" columns={{ sm: 1 }}>
          {/* Main Fields */}
          <Grid>
            <FormControl>
              <Flex justifyContent="space-between" alignItems="center">
                <h1 className="mb-0">New User</h1>
                <Button variant="primary" onClick={() => handleCreateUser()}>
                  Create
                </Button>
              </Flex>

              <Divider className="my-6" />

              <CustomInputField
                label="Name"
                name="name"
                value={user.name}
                onChange={(e) =>
                  setUser({ ...user, [e.target.name]: e.target.value })
                }
              />

              <CustomInputField
                label="Email"
                name="email"
                value={user.email}
                onChange={(e) =>
                  setUser({ ...user, [e.target.name]: e.target.value })
                }
                placeholder={`mail@${process.env.NEXT_PUBLIC_APP_NAME}.com.au`}
              />

              <CustomInputField
                label="Password"
                name="password"
                value={user.password}
                onChange={(e) =>
                  setUser({ ...user, [e.target.name]: e.target.value })
                }
                placeholder="Password"
              />

              <Flex alignItems="center" mb={"16px"}>
                <FormLabel
                  display="flex"
                  mb="0"
                  width="200px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  _hover={{ cursor: "pointer" }}
                >
                  Role
                </FormLabel>

                <Box width="100%">
                  <Box maxWidth={"50%"}>
                    <Select
                      id="user-roles-select"
                      instanceId="user-roles-select"
                      isMulti={true}
                      placeholder="Select Role"
                      defaultValue={userRoles}
                      options={roleOptions}
                      onChange={(data: any) => {
                        setRoleIds([]);
                        data.forEach((role: any) => {
                          setRoleIds((roleIds) => [...roleIds, role.name]);
                        });
                      }}
                      classNamePrefix="chakra-react-select"
                    ></Select>
                  </Box>
                </Box>
              </Flex>

              <Flex alignItems="center" mb={"16px"}>
                <FormLabel
                  display="flex"
                  mb="0"
                  width="200px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  _hover={{ cursor: "pointer" }}
                >
                  State
                </FormLabel>

                <Box width="100%">
                  <Box maxWidth={"50%"}>
                    <Select
                      id="user-state-select"
                      instanceId="user-state-select"
                      placeholder="Select State"
                      options={australianStates}
                      onChange={(e) => setUser({ ...user, ["state"]: e.value })}
                      classNamePrefix="chakra-react-select"
                    />
                  </Box>
                </Box>
              </Flex>
            </FormControl>
          </Grid>
        </SimpleGrid>
      </Box>
    </AdminLayout>
  );
}
