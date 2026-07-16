"use client";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import {
  Box,
  Button,
  Divider,
  Flex,
  Link,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import { GET_INVOICES_QUERY } from "@/graphql/invoice";
import debounce from "lodash.debounce";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

type Invoice = {
  id: string;
  name: string;
  issued_at: string;
  total: number;
  invoice_status?: { name?: string };
};

type InvoicesResponse = {
  invoices: {
    data: Invoice[];
    paginatorInfo: {
      total: number;
      lastPage?: number;
    };
  };
};

const ALL_TABS = [
  { id: 1, tabName: "Pending", hash: "pending" },
  { id: 6, tabName: "Processed", hash: "processed" },
];

export default function RCTIIndex() {
  const menuBg = useColorModeValue("white", "navy.800");
  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  const isSubAdmin = useSelector((state: RootState) => state.user.isSubAdmin);

  const TABS = isSubAdmin ? ALL_TABS.filter((t) => t.id !== 1) : ALL_TABS;

  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabId, setTabId] = useState(TABS[0].id);
  const [rangeDate, setRangeDate] = useState<[Date | null, Date | null]>([null, null]);

  const onChangeSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setQueryPageIndex(0);
      }, 300),
    [],
  );

  const changeTab = useCallback((id: number) => {
    setTabId(id);
    setQueryPageIndex(0);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "ID",
        accessorKey: "name" as const,
        cell: (tableProps: any) => tableProps.row.original.name || "-",
      },
      {
        id: "issued_at",
        header: "Date",
        accessorKey: "issued_at" as const,
        cell: (tableProps: any) => {
          const date = tableProps.row.original.issued_at;
          return date ? moment(date).format("DD MMM YYYY") : "-";
        },
      },
      {
        id: "approval_status",
        header: "Approval Status",
        accessorKey: "invoice_status.name" as const,
        cell: (tableProps: any) =>
          tableProps.row.original.invoice_status?.name || "-",
      },
      {
        id: "total",
        header: "Amount",
        accessorKey: "total" as const,
        cell: (tableProps: any) => {
          const total = tableProps.row.original.total;
          return total != null
            ? `$${Number(total).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`
            : "-";
        },
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        cell: (tableProps: any) => {
          const id = tableProps.row.original.id;
          return id ? (
            <Link href={`/admin/invoices/${id}`}>
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

  const [getInvoices, { loading, data: invoices }] =
    useApolloLazyQueryWithEffect<InvoicesResponse>(GET_INVOICES_QUERY, {
      fetchPolicy: "network-only",
      onError: (error) => console.error("Failed to load invoices", error),
    });

  useEffect(() => {
    if (!isAdmin) return;
    getInvoices({
      variables: {
        query: searchQuery,
        page: queryPageIndex + 1,
        first: queryPageSize,
        is_rcti: false,
        orderByColumn: "id",
        orderByOrder: "DESC",
        invoice_status_id: tabId,
        between_at:
          rangeDate[0]
            ? {
              from_at: moment(rangeDate[0]).format("YYYY-MM-DD HH:mm:ss"),
              to_at: rangeDate[1]
                ? moment(rangeDate[1]).format("YYYY-MM-DD HH:mm:ss")
                : undefined,
            }
            : undefined,
      },
    });
  }, [getInvoices, isAdmin, searchQuery, queryPageIndex, queryPageSize, tabId, rangeDate]);

  useEffect(() => {
    return () => onChangeSearchQuery.cancel();
  }, [onChangeSearchQuery]);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb="20px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <Flex minWidth="max-content">
          <h1 className="mb-0">Driver RCTIs</h1>
        </Flex>

        <TabsComponent tabs={TABS} onChange={changeTab} />

        <Flex justifyContent="space-between" alignItems="center">
          <Box maxW="max-content" p="10px">
            {/* @ts-ignore */}
            <DateRangePicker value={rangeDate} onChange={setRangeDate} />
          </Box>
          <SearchBar background={menuBg} onChangeSearchQuery={onChangeSearchQuery} />
        </Flex>

        <Divider className="!my-0 !py-0" />

        {invoices?.invoices ? (
          <PaginationTable
            columns={columns}
            data={invoices.invoices.data ?? []}
            total={invoices.invoices.paginatorInfo?.total ?? 0}
            options={{
              initialState: {
                pageIndex: queryPageIndex,
                pageSize: queryPageSize,
              },
              manualPagination: true,
              pageCount: invoices.invoices.paginatorInfo?.lastPage,
            }}
            setQueryPageIndex={setQueryPageIndex}
            setQueryPageSize={setQueryPageSize}
            isServerSide
            path="/admin/rctis"
          />
        ) : loading ? (
          <Box>Loading invoices...</Box>
        ) : (
          <Box>No invoices found.</Box>
        )}
      </SimpleGrid>
    </Box>
  );
}