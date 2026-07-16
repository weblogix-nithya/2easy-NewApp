"use client";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { Select } from "chakra-react-select";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import { GET_CUSTOMERS_QUERY, CustomersQueryResult } from "@/graphql/customer";
import {
  GET_INVOICE_TOTALS_QUERY,
  GET_INVOICES_QUERY,
  InvoicesResponse,
  InvoiceTotalsResponse,
} from "@/graphql/invoice";
import { GET_INVOICE_STATUSES_QUERY, InvoiceStatusesResponse } from "@/graphql/invoiceStatus";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import {
  Box,
  Divider,
  Flex,
  SimpleGrid,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import debounce from "lodash.debounce";
import moment from "moment";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

// ---------- Component ----------
export default function InvoiceTab(props: any) {
  const { company_id } = props;
  const menuBg = useColorModeValue("white", "navy.800");
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [_invoiceStatuses, setInvoiceStatuses] = useState([]);
  const [jobCategoryFilter, _setJobCategoryFilter] = useState(null);
  const [stateFilter, _setStateFilter] = useState(null);
  const [tabs, setTabs] = useState([]);
  const { companyId, customerId, isAdmin, isCompanyAdmin, isCustomer } =
    useSelector((state: RootState) => state.user);
  const [customerOptions, setCustomerOptions] = useState<{ value: number; label: string }[]>([]);
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState([]);
  const [rangeDate, setRangeDate] = useState<[Date | null, Date | null]>([null, null]);
  const [tabId, setActiveTab] = useState(isAdmin == true ? 1 : 2);

  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isPrivateRoute =
    useSelector((state: RootState) => state.routes.routes).find(
      (route) => route.layout + route.path == pathname,
    )?.isPrivate || false;

  useEffect(() => {
    if (isPrivateRoute && isAdmin) onOpen();
  }, [isPrivateRoute, isAdmin, onOpen]);

  const onChangeSearchCustomer = useMemo(() => {
    return debounce((e: string) => {
      setDebouncedCustomerSearch(e);
    }, 300);
  }, []);

  const onChangeSearchQuery = useMemo(() => {
    return debounce((e: string) => {
      setSearchQuery(e);
      setQueryPageIndex(0);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      onChangeSearchQuery.cancel();
      onChangeSearchCustomer.cancel();
    };
  }, [onChangeSearchQuery, onChangeSearchCustomer]);

  const {
    isOpen: isStatementModalOpen,
    onOpen: _onOpenStatementModal,
    onClose: onCloseStatementModal,
  } = useDisclosure();

  // ---------- Customers ----------
  const [getCustomers, { data: customersData }] =
    useApolloLazyQueryWithEffect<CustomersQueryResult>(GET_CUSTOMERS_QUERY, {
      onError: (error) => console.error("Failed to load customers", error),
    });

  useEffect(() => {
    getCustomers({
      variables: {
        query: debouncedCustomerSearch,
        page: 1,
        first: 100,
        orderByColumn: "id",
        orderByOrder: "ASC",
        company_id: company_id,
      },
    });
  }, [getCustomers, debouncedCustomerSearch, company_id]);

  useEffect(() => {
    if (customersData?.customers?.data) {
      setCustomerOptions(
        customersData.customers.data.map((customer) => ({
          value: parseInt(customer.id),
          label: customer.full_name,
        })),
      );
    }
  }, [customersData]);

  // ---------- Invoice Statuses ----------
  const [getInvoiceStatuses, { data: invoiceStatusesData }] =
    useApolloLazyQueryWithEffect<InvoiceStatusesResponse>(GET_INVOICE_STATUSES_QUERY, {
      onError: (error) => console.error("Failed to load invoice statuses", error),
    });

  useEffect(() => {
    getInvoiceStatuses({
      variables: {
        query: "",
        page: 1,
        first: 20,
        orderByColumn: "id",
        orderByOrder: "DESC",
      },
    });
  }, [getInvoiceStatuses]);

  useEffect(() => {
    if (invoiceStatusesData?.invoiceStatuses?.data) {
      const statuses: any[] = [];
      const tabList: any[] = [];
      invoiceStatusesData.invoiceStatuses.data.forEach((invoiceStatus) => {
        if (!isAdmin && invoiceStatus.id == 1) return;
        statuses.push({ value: invoiceStatus.id, label: invoiceStatus.name });
        tabList.push({
          id: invoiceStatus.id,
          name: invoiceStatus.name,
          tabName: invoiceStatus.name,
          hash: String(invoiceStatus.name ?? "").replace(/\s+/g, "_").toLowerCase(),
        });
      });
      setInvoiceStatuses(statuses);
      setTabs(tabList);
    }
  }, [invoiceStatusesData, isAdmin]);

  const columns = useMemo(
    () => [
      {
        header: "id",
        accessor: "name" as const,
      },
      {
        header: "job",
        accessor: "job.name" as const,
      },
      {
        header: "customer",
        accessor: "customer.full_name" as const,
        showCompany: true,
      },
      {
        header: "date",
        accessor: "issued_at" as const,
        type: "date",
      },
      {
        header: "status",
        accessor: "invoice_status.name" as const,
      },
      {
        header: "amount",
        accessor: "total" as const,
        type: "money",
      },
      {
        header: "actions",
        accessor: "id" as const,
      },
    ],
    [],
  );

  const betweenAt = useMemo(() => {
    if (!rangeDate || !rangeDate[0]) return undefined;
    return {
      from_at: rangeDate[0] ? moment(rangeDate[0]).format("YYYY-MM-DD HH:mm:ss") : undefined,
      to_at: rangeDate[1] ? moment(rangeDate[1]).format("YYYY-MM-DD HH:mm:ss") : undefined,
    };
  }, [rangeDate]);

  // ---------- Admin Invoices ----------
  const [getInvoicesQuery, { loading, data: invoices }] =
    useApolloLazyQueryWithEffect<InvoicesResponse>(GET_INVOICES_QUERY, {
      onError: (error) => console.error("Failed to load invoices", error),
    });

  const getInvoices = useCallback(() => {
    if (!isAdmin) return;
    getInvoicesQuery({
      variables: {
        query: searchQuery,
        page: queryPageIndex + 1,
        first: queryPageSize,
        is_rcti: true,
        orderByColumn: "id",
        orderByOrder: "DESC",
        invoice_status_id: tabId,
        job_category_id: jobCategoryFilter,
        state: stateFilter,
        company_filter_id: company_id,
        customer_filter_ids: customerFilter,
        between_at: betweenAt,
      },
    });
  }, [
    isAdmin, getInvoicesQuery, searchQuery, queryPageIndex, queryPageSize,
    tabId, jobCategoryFilter, stateFilter, company_id, customerFilter, betweenAt,
  ]);

  useEffect(() => {
    getInvoices();
  }, [getInvoices]);

  // ---------- Invoice Totals ----------
  const [getInvoiceTotalsQuery, { data: invoiceTotals }] =
    useApolloLazyQueryWithEffect<InvoiceTotalsResponse>(GET_INVOICE_TOTALS_QUERY, {
      onError: (error) => console.error("Failed to load invoice totals", error),
    });

  const getInvoiceTotals = useCallback(() => {
    if (!isAdmin) return;
    getInvoiceTotalsQuery({
      variables: {
        query: searchQuery,
        page: 1,
        first: 10000,
        is_rcti: true,
        orderByColumn: "id",
        orderByOrder: "DESC",
        invoice_status_id: tabId,
        job_category_id: jobCategoryFilter,
        state: stateFilter,
        company_filter_id: company_id,
        customer_filter_ids: customerFilter,
        between_at: betweenAt,
      },
    });
  }, [
    isAdmin, getInvoiceTotalsQuery, searchQuery, tabId,
    jobCategoryFilter, stateFilter, company_id, customerFilter, betweenAt,
  ]);

  useEffect(() => {
    getInvoiceTotals();
  }, [getInvoiceTotals]);

  // ---------- Company Admin Invoices ----------
  const [getCompanyInvoicesQuery, { loading: companyInvoiceLoading, data: companyInvoices }] =
    useApolloLazyQueryWithEffect<InvoicesResponse>(GET_INVOICES_QUERY, {
      onError: (error) => console.error("Failed to load company invoices", error),
    });

  const getCompanyInvoices = useCallback(() => {
    if (!isCompanyAdmin) return;
    getCompanyInvoicesQuery({
      variables: {
        query: searchQuery,
        page: queryPageIndex + 1,
        first: queryPageSize,
        is_rcti: true,
        orderByColumn: "id",
        orderByOrder: "DESC",
        invoice_status_id: !isAdmin && tabId == 1 ? 2 : tabId,
        company_id: companyId,
        job_category_id: jobCategoryFilter,
        state: stateFilter,
        between_at: betweenAt,
      },
    });
  }, [
    isCompanyAdmin, getCompanyInvoicesQuery, searchQuery, queryPageIndex, queryPageSize,
    isAdmin, tabId, companyId, jobCategoryFilter, stateFilter, betweenAt,
  ]);

  useEffect(() => {
    getCompanyInvoices();
  }, [getCompanyInvoices]);

  // ---------- Customer Invoices ----------
  const [getCustomerInvoicesQuery, { loading: customerInvoiceLoading, data: customerInvoices }] =
    useApolloLazyQueryWithEffect<InvoicesResponse>(GET_INVOICES_QUERY, {
      onError: (error) => console.error("Failed to load customer invoices", error),
    });

  const getCustomerInvoices = useCallback(() => {
    if (!isCustomer || isCompanyAdmin) return;
    getCustomerInvoicesQuery({
      variables: {
        query: searchQuery,
        page: queryPageIndex + 1,
        first: queryPageSize,
        is_rcti: true,
        orderByColumn: "id",
        orderByOrder: "DESC",
        invoice_status_id: !isAdmin && tabId == 1 ? 2 : tabId,
        customer_id: customerId,
        job_category_id: jobCategoryFilter,
        state: stateFilter,
        company_filter_id: company_id,
        customer_filter_ids: customerFilter,
        between_at: betweenAt,
      },
    });
  }, [
    isCustomer, isCompanyAdmin, getCustomerInvoicesQuery, searchQuery, queryPageIndex,
    queryPageSize, isAdmin, tabId, customerId, jobCategoryFilter, stateFilter,
    company_id, customerFilter, betweenAt,
  ]);

  useEffect(() => {
    getCustomerInvoices();
  }, [getCustomerInvoices]);

  return (
    <>
      <Box>
        <SimpleGrid
          mb="20px"
          pt="32px"
          px="24px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          <Flex minWidth="max-content" justifyContent="space-between">
            <h1 className="mb-0">Invoices</h1>
          </Flex>
        </SimpleGrid>
      </Box>

      <SimpleGrid className="text-sm text-center font-bold border-b border-[var(--chakra-colors-gray-200)]">
        <Flex className="pl-5">
          <TabsComponent tabs={tabs} onChange={(tabId) => setActiveTab(tabId)} />
        </Flex>
      </SimpleGrid>

      <Box pt="0px">
        <SimpleGrid
          mb="20px"
          pt="16px"
          px="24px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Box alignItems="center" flexDirection="column" w="30%" maxW="max-content" p="10px" h="max-content">
              {/* @ts-ignore */}
              <DateRangePicker value={rangeDate} onChange={setRangeDate} />
            </Box>

            <Box className="!max-w-md" ml="10px" p="10px" h="max-content" w="20%">
              <Select
                placeholder="User"
                isMulti
                options={customerOptions}
                size="lg"
                className="select mb-0"
                classNamePrefix="two-easy-select"
                onInputChange={(e) => onChangeSearchCustomer(e)}
                onChange={(e) => setCustomerFilter(e ? e.map((item) => item.value) : null)}
                isClearable={true}
              />
            </Box>

            <SearchBar background={menuBg} onChangeSearchQuery={onChangeSearchQuery} />
          </Flex>

          <Divider className="!my-0 !py-0" />

          {isAdmin && !loading && invoices?.invoices?.data && (
            <PaginationTable
              columns={columns}
              data={invoices.invoices.data}
              total={invoices.invoices.paginatorInfo?.total ?? 0}
              options={{
                initialState: { pageIndex: queryPageIndex, pageSize: queryPageSize },
                manualPagination: true,
                pageCount: invoices.invoices.paginatorInfo?.lastPage,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              path="/admin/invoices"
            />
          )}

          {isCompanyAdmin && !companyInvoiceLoading && companyInvoices?.invoices?.data && (
            <PaginationTable
              columns={columns}
              data={companyInvoices.invoices.data}
              total={companyInvoices.invoices.paginatorInfo?.total ?? 0}
              options={{
                initialState: { pageIndex: queryPageIndex, pageSize: queryPageSize },
                manualPagination: true,
                pageCount: companyInvoices.invoices.paginatorInfo?.lastPage,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              path="/admin/invoices"
            />
          )}

          {isCustomer && !customerInvoiceLoading && customerInvoices?.invoices?.data && (
            <PaginationTable
              columns={columns}
              data={customerInvoices.invoices.data}
              total={customerInvoices.invoices.paginatorInfo?.total ?? 0}
              options={{
                initialState: { pageIndex: queryPageIndex, pageSize: queryPageSize },
                manualPagination: true,
                pageCount: customerInvoices.invoices.paginatorInfo?.lastPage,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              path="/admin/invoices"
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}