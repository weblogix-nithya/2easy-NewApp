import { useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Switch,
  Text,
  UseDisclosureProps,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { DndContext, UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { showGraphQLErrorToast } from "components/toast/ToastError";
import {
  BULK_UPDATE_DYNAMIC_TABLE_USERS_MUTATION,
  DynamicTableUser,
  GET_DYNAMIC_TABLE_USERS_QUERY,
} from "graphql/dynamicTableUser";
import { reorderArray } from "helpers/helper";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

import SortableJobTableSetting from "./SortableJobTableSetting";

export default function JobTableSettingsModal(props: UseDisclosureProps) {
  const { isOpen, onClose } = props;
  const userId = useSelector((state: RootState) => state.user.userId);
  const toast = useToast();
  const [dynamicTableUsers, setDynamicTableUsers] = useState<
    DynamicTableUser[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const getIndex = (id: UniqueIdentifier) =>
    dynamicTableUsers?.findIndex(
      (dynamicTableUser: DynamicTableUser) => dynamicTableUser.id == id,
    );
  // const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  const activeIndex = activeId ? getIndex(activeId) : -1;

  useEffect(() => {
    if (isOpen == true) {
      getDynamicTableUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { refetch: getDynamicTableUsers } = useQuery(
    GET_DYNAMIC_TABLE_USERS_QUERY,
    {
      variables: {
        query: "",
        page: 1,
        first: 100,
        orderByColumn: "sort_id",
        orderByOrder: "ASC",
        user_id: userId,
      },
      skip: !userId && !isOpen,
      notifyOnNetworkStatusChange: true,
      fetchPolicy:  "network-only",
      onCompleted: (data) => {
        setDynamicTableUsers(
          data.dynamicTableUsers.data.map((item: DynamicTableUser) => item));
        setIsLoading(false);
      },
    },
  );
  
    // // Prefetch data when component mounts
    // useEffect(() => {
    //   getDynamicTableUsers();
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);
  
    // // Refresh data when modal opens if needed
    // useEffect(() => {
    //   if (isOpen) {
    //     setIsLoading(true);
    //     getDynamicTableUsers();
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [isOpen]);

  const sortedDynamicTableUsers = dynamicTableUsers.map((item, index) => {
    return {
      id: item.id,
      is_active: item.is_active,
      sort_id: index + 1,
    };
  });

  const [handleBulkUpdateDynamicTableUsers, {}] = useMutation(
    BULK_UPDATE_DYNAMIC_TABLE_USERS_MUTATION,
    {
      variables: {
        input: sortedDynamicTableUsers,
      },
      onCompleted: (_data) => {
        toast({
          title: "User table settings updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        onClose();
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  return (
    <Modal
      id="job-table-setting-modal"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      motionPreset="none"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(1px)" />
      <ModalContent>
        <ModalHeader>Table Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack w="full" align="start" spacing={3}>
          {isLoading ? (
              <Spinner size="xl" />
            ) : (
              <>
            <Divider mb="2" />
            <DndContext
              onDragStart={({ active }) => {
                if (!active) {
                  return;
                }
                setActiveId(active.id);
              }}
              onDragEnd={({ over }) => {
                setActiveId(null);
                if (over) {
                  const overIndex = getIndex(over.id);
                  if (activeIndex !== overIndex) {
                    let newArray = reorderArray(
                      dynamicTableUsers,
                      activeIndex,
                      overIndex,
                    );
                    setDynamicTableUsers(newArray);
                  }
                }
              }}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext
                items={dynamicTableUsers.filter((item: DynamicTableUser) => {
                  return item.is_active;
                })}
              >
                {dynamicTableUsers
                  .filter((item: DynamicTableUser) => {
                    return item.is_active;
                  })
                  .map((item: DynamicTableUser) => (
                    <SortableJobTableSetting
                      key={item.id}
                      dynamicTableUser={item}
                      onActiveToggle={() => {
                        setDynamicTableUsers(
                          [...dynamicTableUsers].map((dynamicTableUser) => {
                            if (dynamicTableUser.id === item.id) {
                              return {
                                ...dynamicTableUser,
                                is_active: !dynamicTableUser.is_active,
                              };
                            } else return dynamicTableUser;
                          }),
                        );
                      }}
                    />
                  ))}
              </SortableContext>
            </DndContext>

            {dynamicTableUsers
              .filter((item: DynamicTableUser) => {
                return !item.is_active;
              })
              .map((item: DynamicTableUser) => (
                <Box key={"disabled-" + item.id} w={"full"}>
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <p>{item.name}</p>
                      <Text
                        className="text-sm text-slate-600"
                        variant="black.500"
                      >
                        {item.dynamic_table?.column_description}
                      </Text>
                    </div>
                    <Switch
                      mt="auto"
                      mb="auto"
                      isChecked={item.is_active}
                      onChange={(e) => {
                        setDynamicTableUsers(
                          [...dynamicTableUsers].map((dynamicTableUser) => {
                            if (dynamicTableUser.id === item.id) {
                              return {
                                ...dynamicTableUser,
                                is_active: e.target.checked,
                              };
                            } else return dynamicTableUser;
                          }),
                        );
                      }}
                    />
                  </div>
                  <Divider mt="1" />
                </Box>
                ))
              }
               </>
              )} 
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Box w={"full"}>
            <Flex justifyContent={"space-between"}>
              <Button
                variant="outline"
                onClick={() => onClose()}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleBulkUpdateDynamicTableUsers()}
                className="ml-2"
              >
                Save
              </Button>
            </Flex>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
