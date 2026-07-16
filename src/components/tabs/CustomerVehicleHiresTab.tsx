"use client";
import {
  Box,
  Divider,
  Flex,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { GET_VEHICLE_HIRES_QUERY } from "@/graphql/vehicleHire";
import debounce from "lodash.debounce";
import React, { useEffect, useMemo, useState } from "react";

// Shared shape for GET_VEHICLE_HIRES_QUERY response
interface VehicleHiresQueryResult {
  vehicleHires: {
    data: any[];
    paginatorInfo: {
      total: number;
      lastPage?: number;
    };
  };
}

export default function CustomerVehicleHiresTab(props: any) {
  const { customer } = props;
  let menuBg = useColorModeValue("white", "navy.800");
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearchQuery = useMemo(() => {
    return debounce((e) => {
      setSearchQuery(e);
      setQueryPageIndex(0);
    }, 300);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Hire ID",
        accessorKey: "name" as const,
      },
      {
        id: "vehicle_type",
        header: "Vehicle Type",
        accessorKey: "vehicle_type" as const,
        cell: (tableProps: any) => tableProps.row.original.vehicle_type?.name || "-",
      },
      {
        id: "vehicle_hire_status",
        header: "Status",
        accessorKey: "vehicle_hire_status" as const,
        cell: (tableProps: any) => tableProps.row.original.vehicle_hire_status?.name || "-",
      },
      {
        id: "hire_from_at",
        header: "Date",
        accessorKey: "hire_from_at" as const,
        meta: { type: "date" },
      },
      {
        id: "address_city",
        header: "Pickup From",
        accessorKey: "address_city" as const,
      },
      {
        id: "hire_to_at",
        header: "Time",
        accessorKey: "hire_to_at" as const, // TODO:: Fix this later
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        meta: { isEdit: true },
      },
    ],
    [],
  );

  const {
    loading,
    data: customerVehicleHires,
  } = useApolloQueryWithEffect<VehicleHiresQueryResult>(GET_VEHICLE_HIRES_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderByColumn: "id",
      orderByOrder: "DESC",
      customer_id: customer.id,
    },
    skip: !customer?.id,
  });

  useEffect(() => {
    return () => onChangeSearchQuery.cancel();
  }, [onChangeSearchQuery]);

  return (
    <Box
      h={{
        base: "calc(100vh - 130px)",
        md: "calc(100vh - 97px)",
        xl: "calc(100vh - 97px)",
      }}
      backgroundColor="white"
      sx={{ overflow: "scroll" }}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        className="mt-8"
        width="100%"
      >
        <h2 className="mb-0">Vehicle Hire</h2>
      </Flex>
      <Divider className="my-6" />
      <Box>
        <SimpleGrid
          mb="20px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          <Flex minWidth="max-content">
            <SearchBar
              background={menuBg}
              onChangeSearchQuery={onChangeSearchQuery}
              me="10px"
              borderRadius="30px"
            />
          </Flex>
          {!loading && customerVehicleHires?.vehicleHires?.data && (
            <PaginationTable
              columns={columns}
              data={customerVehicleHires.vehicleHires.data}
              total={customerVehicleHires.vehicleHires.paginatorInfo?.total ?? 0}
              options={{
                initialState: {
                  pageIndex: queryPageIndex,
                  pageSize: queryPageSize,
                },
                manualPagination: true,
                pageCount:
                  customerVehicleHires.vehicleHires.paginatorInfo?.lastPage,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              path="/admin/vehicle-hires"
            />
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
}