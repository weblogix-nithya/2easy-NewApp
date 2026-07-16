"use client";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import {
    Box,
    Button,
    Flex,
    Link,
    SimpleGrid,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import PrivateAccessModal from "@/components/modal/PrivateAccessModal";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { CustomersQueryResult, GET_CUSTOMERS_QUERY } from "@/graphql/customer";
import debounce from "lodash.debounce";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export default function CustomerIndex() {
    let menuBg = useColorModeValue("white", "navy.800");
    const [queryPageIndex, setQueryPageIndex] = useState(0);
    const [queryPageSize, setQueryPageSize] = useState(50);
    const [searchQuery, setSearchQuery] = useState("");
    const { companyId, isCompany, isAdmin } = useSelector(
        (state: RootState) => state.user,
    );

    const pathname = usePathname();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isPrivateRoute =
        useSelector((state: RootState) => state.routes.routes).find(
            (route) => route.layout + route.path == pathname,
        )?.isPrivate || false;
    useEffect(() => {
        if (isPrivateRoute && isAdmin) onOpen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPrivateRoute]);

    const onChangeSearchQuery = useMemo(() => {
        return debounce((e) => {
            setSearchQuery(e);
            setQueryPageIndex(0);
        }, 300);
    }, []);

    const columns = useMemo(
        () => [
            {
                id: "first_name",
                header: "First Name",
                accessorKey: "first_name" as const,
            },
            {
                id: "last_name",
                header: "Last Name",
                accessorKey: "last_name" as const,
            },
            {
                id: "company_name",
                header: "Company Name",
                accessorKey: "company_name" as const,
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
        data: customers,
        // refetch: getCustomers,
    } = useApolloQueryWithEffect<CustomersQueryResult>(GET_CUSTOMERS_QUERY, {
        variables: {
            query: searchQuery,
            page: queryPageIndex + 1,
            first: queryPageSize,
            orderByColumn: "id",
            orderByOrder: "ASC",
        },
        skip: !isAdmin,
    });

    const {
        loading: companyCustomerLoading,
        data: companyCustomers,
        // refetch: getCompanyCustomers,
    } = useApolloQueryWithEffect<CustomersQueryResult>(GET_CUSTOMERS_QUERY, {
        variables: {
            query: searchQuery,
            page: queryPageIndex + 1,
            first: queryPageSize,
            orderByColumn: "id",
            orderByOrder: "ASC",
            company_id: companyId,
        },
        skip: !isCompany,
    });

    useEffect(() => {
        return () => onChangeSearchQuery.cancel();
    }, [onChangeSearchQuery]);

    return (
        <>
            <Box
                pt={{ base: "130px", md: "97px", xl: "97px" }}
                className="mk-admin-customers"
            >
                <SimpleGrid
                    mb="20px"
                    pt="32px"
                    px="24px"
                    columns={{ sm: 1 }}
                    spacing={{ base: "20px", xl: "20px" }}
                >
                    <Flex minWidth="max-content">
                        <h1 className="mb-0">{isAdmin ? "Customers" : "My Users"}</h1>
                        <SearchBar
                            onChangeSearchQuery={onChangeSearchQuery}
                            placeholder="Search customers"
                            me="10px"
                            background={menuBg}
                        />

                        <Link href="/admin/customers/create">
                            <Button variant="primary">Create New</Button>
                        </Link>
                    </Flex>

                    {isAdmin &&
                        !loading &&
                        customers?.customers?.data && (
                            <PaginationTable
                                columns={columns}
                                data={customers.customers.data}
                                total={customers.customers.paginatorInfo?.total ?? 0}
                                options={{
                                    initialState: {
                                        pageIndex: queryPageIndex,
                                        pageSize: queryPageSize,
                                    },
                                    manualPagination: true,
                                    pageCount: customers.customers.paginatorInfo?.lastPage,
                                }}
                                setQueryPageIndex={setQueryPageIndex}
                                setQueryPageSize={setQueryPageSize}
                                isServerSide
                                path="/admin/customers"
                            />
                        )}

                    {isCompany &&
                        !companyCustomerLoading &&
                        companyCustomers?.customers?.data && (
                            <PaginationTable
                                columns={columns}
                                data={companyCustomers.customers.data}
                                total={companyCustomers.customers.paginatorInfo?.total ?? 0}
                                options={{
                                    initialState: {
                                        pageIndex: queryPageIndex,
                                        pageSize: queryPageSize,
                                    },
                                    manualPagination: true,
                                    pageCount: companyCustomers.customers.paginatorInfo?.lastPage,
                                }}
                                setQueryPageIndex={setQueryPageIndex}
                                setQueryPageSize={setQueryPageSize}
                                isServerSide
                                path="/admin/customers"
                            />
                        )}
                </SimpleGrid>
            </Box>
            <PrivateAccessModal isOpen={isOpen} onClose={onClose} />
        </>
    );
}