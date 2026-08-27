"use client";
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
import AreYouSureAlert from "@/components/alert/AreYouSureAlert";
import FileInput from "@/components/fileInput/FileInput";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import {
  defaultUser,
  DELETE_USER_MUTATION,
  GET_USER_QUERY,
  UPDATE_USER_MUTATION,
} from "@/graphql/user";
import { australianStates, roleOptions } from "@/lib/helpers/helper";
import AdminLayout from "@/layouts/admin";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setState } from "@/lib/store/userSlice";

import CustomInputField from "@/components/fields/CustomInputField";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

export default function UserEdit() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  // const brandColor = useColorModeValue("brand.500", "white");
  //  const textColorSecondary = "gray.400";
  const [user, setUser] = useState(defaultUser);
  const [userRoles, setUserRoles] = useState([]);
  const [australianState, setAustralianState] = useState(null);
  const [roleIds, setRoleIds] = useState([]);
  const userId = useSelector((state: RootState) => state.user.userId);

  const dispatch = useDispatch();

  const router = useRouter();
  const params = useParams();
  const id = (params?.id ?? "") as string;
  const {
    loading: userLoading,
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
      australianStates.map((state) => {
        if (state.value === data?.user?.state) {
          setAustralianState(state);
        }
      });
      data.user.roles.forEach((role: any) => {
        const index = roleOptions.findIndex((item) => item.id == role.id);
        setUserRoles((userRoles) => [...userRoles, roleOptions[index]]);
        setRoleIds((roleIds) => [...roleIds, role.name]);
      });
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [handleUpdateUser, {}] = useMutation(UPDATE_USER_MUTATION, {
    variables: {
      input: {
        id: user.id,
        name: user.name,
        // email: user.email,
        state: user.state,
        roles: roleIds,
      },
    },
    onCompleted: (data: any) => {
      if (data?.updateUser?.id === userId) {
        dispatch(setState(data?.updateUser?.state));
      }

      toast({
        title: "User updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [handleDeleteUser, {}] = useMutation(DELETE_USER_MUTATION, {
    variables: {
      id: id,
    },
    onCompleted: () => {
      toast({
        title: "User deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/admin/users");
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  return (
    <AdminLayout>
      <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
        <SimpleGrid mb="20px" pt="32px" px="24px" columns={{ sm: 1 }}>
          <Flex
            minWidth="max-content"
            alignItems="center"
            justifyContent="space-between"
          >
            <h1 className="mb-0">Update User</h1>

            <div>
              <AreYouSureAlert onDelete={handleDeleteUser}></AreYouSureAlert>
              <Button
                variant="primary"
                onClick={() => handleUpdateUser()}
                className="ml-2"
              >
                Update
              </Button>
            </div>
          </Flex>

          <Divider className="my-6" />

          {/* Main Fields */}
          <Grid>
            {!userLoading && (
              <FormControl>
                {/* TODO: Double check these customInputField settings */}
                <CustomInputField
                  label="Name"
                  name="name"
                  value={user.name}
                  onChange={(e) =>
                    setUser({ ...user, [e.target.name]: e.target.value })
                  }
                />

                <CustomInputField
                  isDisabled={true}
                  label="Email"
                  name="email"
                  value={user.email}
                  onChange={(e) =>
                    setUser({ ...user, [e.target.name]: e.target.value })
                  }
                  placeholder={`mail@${process.env.NEXT_PUBLIC_APP_NAME}.com.au`}
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
                        isMulti={true}
                        placeholder="Select Role"
                        // defaultValue={userRoles}
                        options={roleOptions}
                        onChange={(data: any) => {
                          setRoleIds([]);
                          setUserRoles([]);
                          data.forEach((role: any) => {
                            setRoleIds((roleIds) => [...roleIds, role.name]);
                            setUserRoles((userRoles) => [...userRoles, role]);
                          });
                        }}
                        value={userRoles}
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
                        placeholder="Select State"
                        value={australianState}
                        options={australianStates}
                        onChange={(e) =>
                          setUser({ ...user, ["state"]: e.value })
                        }
                        classNamePrefix="chakra-react-select"
                      />
                    </Box>
                  </Box>
                </Flex>

                {/* Hidden */}
                {/* {user.media_url && (
                  <>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Image
                    </FormLabel>

                    <FileInput
                      entity="User"
                      entityId={user.id}
                      onUpload={(url: string) =>
                        setUser({ ...user, media_url: url })
                      }
                      media_url={user.media_url}
                    ></FileInput>
                  </>
                )} */}
              </FormControl>
            )}
          </Grid>
        </SimpleGrid>
      </Box>
    </AdminLayout>
  );
}
