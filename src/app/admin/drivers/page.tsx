"use client";
// import { useQuery } from "@apollo/client/react";
import {
  Box,
  Button,
  Flex,
  Image,
  Link,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import { GET_DRIVERS_QUERY } from "@/graphql/driver";
// import AdminLayout from "layouts/admin";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";

type Driver = {
  id: string;
  full_name: string;
  media_url?: string;
  vehicle_type?: { name?: string };
  vehicle_class?: { name?: string };
};

type PaginatorInfo = {
  total: number;
  currentPage?: number;
  lastPage?: number;
};

type DriversResponse = {
  drivers: {
    data: Driver[];
    paginatorInfo: PaginatorInfo;
  };
};

export default function DriverIndex() {
  let menuBg = useColorModeValue("white", "navy.800");
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [driverStatusId, setDriverStatusId] = useState(1); // 1 = pending, 2 = active, 4 = inactive

  const onChangeSearchQuery = useMemo(() => {
    return debounce((value: string) => {
      setSearchQuery(value);
      setQueryPageIndex(0);
    }, 300);
  }, []);

  const tabs = [
    {
      id: 1,
      tabName: "Pending",
      hash: "pending",
    },
    {
      id: 2,
      tabName: "Active",
      hash: "active",
    },
    {
      id: 4,
      tabName: "Inactive",
      hash: "inactive",
    },
  ];

  const changeTab = useCallback((tab: number) => {
    setDriverStatusId(tab);
    setQueryPageIndex(0);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "photo",
        header: "Photo",
        accessorKey: "media_url" as const,
        cell: (tableProps: any) => {
          const url = tableProps.row.original.media_url;
          return (
            <Image
              src={url || "/img/avatars/driverIcon.png"}
              fallbackSrc="/img/avatars/driverIcon.png"
              alt={tableProps.row.original.full_name || "driver image"}
              fit="cover"
              style={{ borderRadius: "50%" }}
              width="48px"
              height="48px"
            />
          );
        },
      },
      {
        id: "name",
        header: "Name",
        accessorKey: "full_name" as const,
        cell: (tableProps: any) =>
          tableProps.row.original.full_name ||
          `${tableProps.row.original.first_name || ""} ${tableProps.row.original.last_name || ""}`.trim() ||
          "-",
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
        cell: (tableProps: any) =>
          tableProps.row.original.email || "-",
      },
      {
        id: "vehicleType",
        header: "Vehicle Type",
        accessorKey: "vehicle_type.name" as const,
        cell: (tableProps: any) => tableProps.row.original.vehicle_type?.name || "-",
      },
      {
        id: "vehicleDetails",
        header: "Vehicle Details",
        accessorKey: "vehicle_class.name" as const,
        cell: (tableProps: any) => tableProps.row.original.vehicle_class?.name || "-",
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        cell: (tableProps: any) => {
          const id = tableProps.row.original.id;
          const href = id ? `/admin/drivers/${id}` : undefined;
          return href ? (
            <Link href={href}>
              <Button variant="outline" size="sm">
                Edit test
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Edit esttest
            </Button>
          );
        },
      },
    ],
    [],
  );

  const [
    getDrivers,
    {
      loading,
      data: drivers,
    },
  ] = useApolloLazyQueryWithEffect<DriversResponse>(
    GET_DRIVERS_QUERY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        console.log("Drivers loaded", data);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  useEffect(() => {
    getDrivers({
      variables: {
        query: searchQuery,
        driverStatusId,
        page: queryPageIndex + 1,
        first: queryPageSize,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    });
  }, [
    getDrivers,
    queryPageIndex,
    queryPageSize,
    searchQuery,
    driverStatusId,
  ]);

  useEffect(() => {
    return () => {
      onChangeSearchQuery.cancel();
    };
  }, [onChangeSearchQuery]);

  return (
    // <AdminLayout>
    <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
      <SimpleGrid
        mb="20px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <Flex minWidth="max-content">
          <h1 className="mb-0">Drivers</h1>
          <SearchBar
            searchQuery={searchQuery}
            onChangeSearchQuery={onChangeSearchQuery}
            placeholder="Search drivers"
            me="10px"
            background={menuBg}
          />

          <Link href="/admin/drivers/create">
            <Button variant="primary">Create New</Button>
          </Link>
        </Flex>

        <TabsComponent tabs={tabs} onChange={changeTab} />

        {drivers?.drivers ? (
          <PaginationTable
            columns={columns}
            data={drivers.drivers.data ?? []}
            total={drivers.drivers.paginatorInfo?.total ?? 0}
            path="/admin/drivers"
            options={{
              initialState: {
                pageIndex: queryPageIndex,
                pageSize: queryPageSize,
              },
              manualPagination: true,
              pageCount: drivers.drivers.paginatorInfo?.lastPage,
            }}
            setQueryPageIndex={setQueryPageIndex}
            setQueryPageSize={setQueryPageSize}
            isServerSide
          />
        ) : loading ? (
          <Box>Loading drivers...</Box>
        ) : (
          <Box>No drivers found.</Box>
        )}
      </SimpleGrid>
    </Box>
    // </AdminLayout>
  );
}
