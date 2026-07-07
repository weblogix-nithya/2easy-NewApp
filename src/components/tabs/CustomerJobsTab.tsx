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
import { GET_JOBS_QUERY } from "@/graphql/job";
import debounce from "lodash.debounce";
import React, { useEffect, useMemo, useState } from "react";

// Shared shape for GET_JOBS_QUERY response
interface JobsQueryResult {
  jobs: {
    data: any[];
    paginatorInfo: {
      total: number;
      lastPage?: number;
    };
  };
}

export default function CustomerJobsTab(props: any) {
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
        header: "Delivery ID",
        accessorKey: "name" as const,
      },
      {
        id: "driver",
        header: "Category",
        accessorKey: "driver" as const,
        cell: (tableProps: any) => tableProps.row.original.driver?.name || "-",
      },
      {
        id: "job_type",
        header: "Type",
        accessorKey: "job_type" as const,
        cell: (tableProps: any) => tableProps.row.original.job_type?.name || "-",
      },
      {
        id: "job_status",
        header: "Status",
        accessorKey: "job_status" as const,
        cell: (tableProps: any) => tableProps.row.original.job_status?.name || "-",
      },
      {
        id: "start_at",
        header: "Date",
        accessorKey: "start_at" as const,
        meta: { type: "date" },
      },
      {
        id: "job_pickup_cities",
        header: "Pickup From",
        accessorKey: "job_pickup_cities" as const,
      },
      {
        id: "job_destination_cities",
        header: "Deliver To",
        accessorKey: "job_destination_cities" as const,
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
    data: customerJobs,
  } = useApolloQueryWithEffect<JobsQueryResult>(GET_JOBS_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderBy: [{ column: "id", order: "DESC" }],
      customer_id: parseInt(customer.id),
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
        <h2 className="mb-0">Deliveries</h2>
      </Flex>
      <Divider className="my-6" />
      <Box>
        <SimpleGrid columns={{ sm: 1 }} spacing={{ base: "20px", xl: "20px" }}>
          <Flex minWidth="max-content">
            <SearchBar
              background={menuBg}
              onChangeSearchQuery={onChangeSearchQuery}
            />
          </Flex>
          {!loading && customerJobs?.jobs?.data && (
            <div className="overflow-auto">
              <PaginationTable
                columns={columns}
                data={customerJobs.jobs.data}
                total={customerJobs.jobs.paginatorInfo?.total ?? 0}
                options={{
                  initialState: {
                    pageIndex: queryPageIndex,
                    pageSize: queryPageSize,
                  },
                  manualPagination: true,
                  pageCount: customerJobs.jobs.paginatorInfo?.lastPage,
                }}
                setQueryPageIndex={setQueryPageIndex}
                setQueryPageSize={setQueryPageSize}
                isServerSide
                path="/admin/jobs"
              />
            </div>
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
}