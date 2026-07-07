"use client";
import PrivateAccessModal from "@/components/modal/PrivateAccessModal";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import {
  Box,
  Button,
  Flex,
  Link,
  SimpleGrid,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { GET_COMPANYS_QUERY } from "@/graphql/company";
import debounce from "lodash.debounce";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

type Company = {
  id: string;
  name: string;
};

type CompanysResponse = {
  companys: {
    data: Company[];
    paginatorInfo: {
      total: number;
      lastPage?: number;
    };
  };
};

export default function CompanyIndex() {
  const menuBg = useColorModeValue("white", "navy.800");
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Remove router.pathname usage
  const pathname = usePathname();

  const isPrivateRoute =
    useSelector((state: RootState) => state.routes.routes).find(
      (route) => route.layout + route.path == pathname,
    )?.isPrivate || false;

  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isPrivateRoute && isAdmin) onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrivateRoute]);

  const onChangeSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setQueryPageIndex(0);
      }, 300),
    [],
  );

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name" as const,
        cell: (tableProps: any) => tableProps.row.original.name || "-",
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        cell: (tableProps: any) => {
          const id = tableProps.row.original.id;
          return id ? (
            <Link href={`/admin/companies/${id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" isDisabled>
              View
            </Button>
          );
        },
      },
    ],
    [],
  );

  const [getCompanys, { loading, data: companys }] =
    useApolloLazyQueryWithEffect<CompanysResponse>(GET_COMPANYS_QUERY, {
      fetchPolicy: "network-only",
      onError: (error) => console.error("Failed to load companies", error),
    });

  useEffect(() => {
    if (!isAdmin) return;
    getCompanys({
      variables: {
        query: searchQuery,
        page: queryPageIndex + 1,
        first: queryPageSize,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    });
  }, [getCompanys, isAdmin, searchQuery, queryPageIndex, queryPageSize]);

  useEffect(() => {
    return () => onChangeSearchQuery.cancel();
  }, [onChangeSearchQuery]);

  return (
    <>
      <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
        <SimpleGrid
          mb="20px"
          pt="32px"
          px="24px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          <Flex minWidth="max-content">
            <h1 className="mb-0">Companies</h1>
            <SearchBar
              onChangeSearchQuery={onChangeSearchQuery}
              placeholder="Search companies"
              me="10px"
              background={menuBg}
            />
            <Link href="/admin/companies/create">
              <Button variant="primary">Create New</Button>
            </Link>
          </Flex>

          {companys?.companys ? (
            <PaginationTable
              columns={columns}
              data={companys.companys.data ?? []}
              total={companys.companys.paginatorInfo?.total ?? 0}
              path="/admin/companies"
              options={{
                initialState: {
                  pageIndex: queryPageIndex,
                  pageSize: queryPageSize,
                },
                manualPagination: true,
                pageCount: companys.companys.paginatorInfo?.lastPage,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
            />
          ) : loading ? (
            <Box>Loading companies...</Box>
          ) : (
            <Box>No companies found.</Box>
          )}
        </SimpleGrid>
      </Box>
      <PrivateAccessModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}