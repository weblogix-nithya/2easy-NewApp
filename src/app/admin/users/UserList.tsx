import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import {
  Box,
  Button,
  // Divider,
  Flex,
  Grid,
  Link,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import { GET_USERS_QUERY } from "@/graphql/user";
import debounce from "lodash.debounce";
import { parseCookies } from "nookies";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import UsersTab from "@/components/users/UsersTab";

import ApprovalRequiredTab from "@/components/users/approvalRequiredTab";
import ResetPasswordTab from "@/components/users/resetPasswordTab";
// import './components/approvalRequiredTab'
import RestoreUserTab from "@/components/users/restoreUserTab";
// import PaginationTable from "components/table/PaginationTable"

export default function UserIndex() {
  let menuBg = useColorModeValue("white", "navy.800");
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin, resetApprove } = useSelector(
    (state: RootState) => state.user,
  );
  const cookies = parseCookies();

  const canAccessReset =
    resetApprove === false || cookies.reset_approve === "true";
  const [tabId, setActiveTab] = useState(1);

  const onChangeSearchQuery = useMemo(() => {
    return debounce((e) => {
      setSearchQuery(e);
      setQueryPageIndex(0);
    }, 300);
  }, []);

  const tabs = [
    {
      id: 1,
      tabName: "Users",
      hash: "usersList",
      isVisible: true,
    },
    {
      id: 2,
      tabName: "Restore Users",
      hash: "restoreUsers",
      isVisible: true,
    },
    {
      id: 3,
      tabName: "Approve Users",
      hash: "approveUsers",
      isVisible: true,
    },
    {
      id: 4,
      tabName: "Reset Password",
      hash: "resetPassword",
      isVisible: canAccessReset,
      // isVisible: true,
    },
  ];

  const resetColumns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name" as const,
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
      },
      {
        id: "roles",
        header: "Role",
        accessorKey: "roles",
        cell: ({ getValue }) => {
          const roles = getValue() as { name: string }[];

          return roles?.length ? roles.map((r) => r.name).join(", ") : "-";
        },
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        isReset: isAdmin,
        isEdit: false,
        meta: {
          isReset: isAdmin,
          isEdit: false,
        },
      },
    ],
    [isAdmin],
  );

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name" as const,
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
      },
      {
        id: "roles",
        header: "Role",
        accessorKey: "roles",
        cell: ({ getValue }) => {
          const roles = getValue() as { name: string }[];

          return roles?.length ? roles.map((r) => r.name).join(", ") : "-";
        },
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
      },
    ],
    [],
  );

  const restoreColumns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name" as const,
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        isRestore: isAdmin,
        meta: {
          isRestore: isAdmin,
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {
    loading,
    error,
    data: users,
    // refetch: getUsers,
  } = useApolloQueryWithEffect(GET_USERS_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data: any) => {
      console.log(data?.users.data, "data");
    },
  });

  useEffect(() => {
    onChangeSearchQuery.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const handleTabChange = useCallback(
    async (nextTabId: number) => {
      if (nextTabId === tabId) return;

      setActiveTab(nextTabId);

      const needsRefresh = nextTabId === 4;
      if (!needsRefresh) return;
    },
    [tabId],
  );

  return (
    <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
      <SimpleGrid
        mb="70px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px" }}
      >
        <Flex
          minWidth="max-content"
          alignItems="center"
          justifyContent="space-between"
          className="mb-4"
        >
          <h1 className="mb-0">Users</h1>

          <Link href="/admin/users/create">
            <Button variant="primary">Create New</Button>
          </Link>
        </Flex>

        <Flex minWidth="max-content" className="!flex-start">
          <SearchBar
            ms="0"
            placeholder="Search users"
            onChangeSearchQuery={onChangeSearchQuery}
            background={menuBg}
            borderRadius="8px"
          />
        </Flex>

        <Grid backgroundColor="white">
          <TabsComponent tabs={tabs} onChange={handleTabChange} />
          {tabId == 1 && (
            <UsersTab
              loading={loading}
              users={users}
              error={error}
              columns={columns}
              queryPageIndex={queryPageIndex}
              queryPageSize={queryPageSize}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
            />
          )}
          {tabId == 2 && (
            <RestoreUserTab
              searchQuery={searchQuery}
              restoreColumns={restoreColumns}
              queryPageIndex={queryPageIndex}
              queryPageSize={queryPageSize}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
            />
          )}
          {tabId == 3 && (
            <ApprovalRequiredTab
              // loading={loading}
              // users={users}
              // error={error}
              // approveColumns={approveColumns}
              searchQuery={searchQuery}
              queryPageIndex={queryPageIndex}
              queryPageSize={queryPageSize}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
            />
          )}
          {tabId == 4 && (
            <ResetPasswordTab
              searchQuery={searchQuery}
              // setSearchQuery={setSearchQuery}
              resetColumns={resetColumns}
              queryPageIndex={queryPageIndex}
              queryPageSize={queryPageSize}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
            />
          )}{" "}
        </Grid>
      </SimpleGrid>
    </Box>
  );
}
