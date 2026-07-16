"use client";
import {
  Box,
  Button,
  Divider,
  Flex,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { Select } from "chakra-react-select";
import PrivateAccessModal from "@/components/modal/PrivateAccessModal";
import StatementGenerateModal from "@/components/modal/StatementGenerateModal";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import { GET_COMPANYS_QUERY, CompaniesQueryResult } from "@/graphql/company";
import { GET_CUSTOMERS_QUERY, CustomersQueryResult } from "@/graphql/customer";
import {
  GET_INVOICE_TOTALS_QUERY,
  GET_INVOICES_QUERY,
  InvoicesResponse,
  InvoiceTotalsResponse,
} from "@/graphql/invoice";
import { GET_INVOICE_STATUSES_QUERY, InvoiceStatusesResponse } from "@/graphql/invoiceStatus";
import { GET_JOB_CATEGORIES_QUERY } from "@/graphql/jobCategories";
import { formatCurrency } from "@/lib/helpers/helper";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import debounce from "lodash.debounce";
import moment from "moment";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

// Local type for job categories lookup (adjust if you export a real type from graphql/jobCategories)
type JobCategoriesResponse = {
  jobCategorys: {
    data: { id: string | number; name: string }[];
  };
};

export default function InvoiceIndex() {
  let menuBg = useColorModeValue("white", "navy.800");
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [_invoiceStatuses, setInvoiceStatuses] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [jobCategoryFilter, setJobCategoryFilter] = useState(null);
  const [stateFilter, setStateFilter] = useState(null);
  const [companyFilter, setCompanyFilter] = useState(null);
  const [tabs, setTabs] = useState([]);
  const { companyId, isAdmin, isCompanyAdmin, isCustomer } = useSelector(
    (state: RootState) => state.user,
  );
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [debouncedCompanySearch, setDebouncedCompanySearch] = useState("");
  const [customerOptions, setCustomerOptions] = useState([]);
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState([]);

  const onChangeSearchCompany = useMemo(() => {
    return debounce((e) => {
      setDebouncedCompanySearch(e);
    }, 300);
  }, []);

  const onChangeSearchCustomer = useMemo(() => {
    return debounce((e) => {
      setDebouncedCustomerSearch(e);
    }, 300);
  }, []);

  const [rangeDate, setRangeDate] = useState([null, null]);
  const [tabId, setActiveTab] = useState(isAdmin == true ? 1 : 2);

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

  const {
    isOpen: isStatementModalOpen,
    onOpen: onOpenStatementModal,
    onClose: onCloseStatementModal,
  } = useDisclosure();

  const stateOptions = [
    { value: "QLD", label: "Queensland" },
    { value: "VIC", label: "Victoria" },
    { value: "New South Wales", label: "New South Wales" },
    { value: "Western Australia", label: "Western Australia" },
    { value: "South Australia", label: "South Australia" },
    { value: "Tasmania", label: "Tasmania" },
  ];

  const effectiveCompanyFilter = isAdmin ? companyFilter : companyId;

  const effectiveCustomerFilter: number[] = useMemo(() => {
    if (customerFilter && customerFilter.length > 0) {
      return customerFilter.map((id) => Number(id));
    }
    return [];
  }, [customerFilter]);

  useEffect(() => {
    if (!isAdmin && (isCompanyAdmin || isCustomer)) {
      if (companyId) {
        setCompanyFilter(companyId);
      }
    }
  }, [isAdmin, isCompanyAdmin, isCustomer, companyId]);

  // ---- Lookup queries (auto-run, use useApolloQueryWithEffect) ----

  useApolloQueryWithEffect<JobCategoriesResponse>(GET_JOB_CATEGORIES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      setJobCategories(
        (data?.jobCategorys?.data || []).map((driverStatus: any) => ({
          value: parseInt(driverStatus.id as any),
          label: driverStatus.name,
        })),
      );
    },
  });

  useApolloQueryWithEffect<CompaniesQueryResult>(GET_COMPANYS_QUERY, {
    variables: {
      query: debouncedCompanySearch,
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      setCompaniesOptions(
        (data?.companys?.data || []).map((_entity: any) => ({
          value: parseInt(_entity.id),
          label: _entity.name,
        })),
      );
    },
  });

  useApolloQueryWithEffect<CustomersQueryResult>(GET_CUSTOMERS_QUERY, {
    variables: {
      query: debouncedCustomerSearch,
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
      company_id: effectiveCompanyFilter,
    },
    skip: !effectiveCompanyFilter,
    onCompleted: (data) => {
      setCustomerOptions(
        (data?.customers?.data || []).map((customer: any) => ({
          value: parseInt(customer.id),
          label: customer.full_name,
        })),
      );
    },
  });

  useApolloQueryWithEffect<InvoiceStatusesResponse>(GET_INVOICE_STATUSES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 20,
      orderByColumn: "id",
      orderByOrder: "DESC",
    },
    onCompleted: (data) => {
      const list = data?.invoiceStatuses?.data || [];
      const filtered = list.filter(
        (invoiceStatus: any) =>
          isAdmin || !(invoiceStatus.id == 1 || invoiceStatus.id == 5),
      );
      setInvoiceStatuses(
        filtered.map((invoiceStatus: any) => ({
          value: invoiceStatus.id,
          label: invoiceStatus.name,
        })),
      );
      setTabs(
        filtered.map((invoiceStatus: any) => ({
          id: invoiceStatus?.id,
          name: invoiceStatus?.name,
          tabName: invoiceStatus?.name,
          hash: invoiceStatus?.name?.replace(/\s+/g, "_").toLowerCase(),
        })),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "id",
        accessorKey: "name" as const,
      },
      {
        id: "job",
        header: "job",
        accessorFn: (row: any) => row?.job?.name,   // 👈
      },
      {
        id: "service_type",
        header: () => <Text px={4}>service type</Text>,
        accessorFn: (row: any) => row?.job?.job_category?.name,  // 👈 
        cell: (info: any) => <Text px={4}>{info.getValue()}</Text>,
      },
      {
        id: "customer",
        header: "customer",
        accessorFn: (row: any) => row?.customer?.full_name,  // 👈 
        meta: { showCompany: true },
      },
      {
        id: "due_date",
        header: "due date",
        accessorKey: "due_at" as const,
        meta: { type: "date" },
      },
      {
        id: "date",
        header: "date",
        accessorKey: "issued_at" as const,
        meta: { type: "date" },
      },
      {
        id: "status",
        header: "status",
        accessorFn: (row: any) => row?.invoice_status?.name,  // 👈 
      },
      {
        id: "amount",
        header: "amount",
        accessorKey: "total" as const,
        meta: { type: "money" },
      },
      {
        id: "actions",
        header: "actions",
        accessorKey: "id" as const,
      },
    ],
    [],
  );

  const tableColumnWidthStyles = {
    "th, td": {
      width: "100px",
      minWidth: "100px",
    },
  };

  // ---- Manually-triggered queries (use useApolloLazyQueryWithEffect) ----

  const [getInvoices, { loading, data: invoices }] =
    useApolloLazyQueryWithEffect<InvoicesResponse>(GET_INVOICES_QUERY, {
      onError: (error) => console.error(error),
    });

  const [getInvoiceTotals, { data: invoiceTotals }] =
    useApolloLazyQueryWithEffect<InvoiceTotalsResponse>(GET_INVOICE_TOTALS_QUERY, {
      onError: (error) => console.error(error),
    });

  const [getCompanyInvoices, { loading: companyInvoiceLoading, data: companyInvoices }] =
    useApolloLazyQueryWithEffect<InvoicesResponse>(GET_INVOICES_QUERY, {
      onError: (error) => console.error(error),
    });

  useEffect(() => {
    onChangeSearchQuery.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // Single consolidated trigger — replaces the old skip + imperative refetch pattern.
  // Lazy queries don't auto re-run on variable change, so every filter/pagination
  // dependency that used to matter is listed here.
  useEffect(() => {
    const between_at =
      rangeDate && rangeDate[0]
        ? {
          from_at: moment(rangeDate[0]).format("YYYY-MM-DD HH:mm:ss"),
          to_at: rangeDate[1]
            ? moment(rangeDate[1]).format("YYYY-MM-DD HH:mm:ss")
            : undefined,
        }
        : undefined;

    if (isAdmin) {
      const commonVariables = {
        query: searchQuery,
        is_rcti: true,
        orderByColumn: "id",
        orderByOrder: "DESC",
        invoice_status_id: tabId,
        job_category_id: jobCategoryFilter,
        state: stateFilter,
        company_filter_id: companyFilter,
        customer_filter_ids: customerFilter,
        between_at,
      };

      getInvoices({
        variables: {
          ...commonVariables,
          page: queryPageIndex + 1,
          first: queryPageSize,
        },
      });

      getInvoiceTotals({
        variables: {
          ...commonVariables,
          page: 1,
          first: 10000,
        },
      });
    } else if (isCustomer || isCompanyAdmin) {
      getCompanyInvoices({
        variables: {
          query: searchQuery,
          page: queryPageIndex + 1,
          first: queryPageSize,
          is_rcti: true,
          orderByColumn: "id",
          orderByOrder: "DESC",
          invoice_status_id: !isAdmin && tabId == 1 ? 2 : tabId,
          company_id: effectiveCompanyFilter,
          customer_filter_ids:
            effectiveCustomerFilter.length > 0
              ? effectiveCustomerFilter
              : undefined,
          job_category_id: jobCategoryFilter,
          state: stateFilter,
          between_at,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAdmin,
    isCustomer,
    isCompanyAdmin,
    searchQuery,
    queryPageIndex,
    queryPageSize,
    tabId,
    jobCategoryFilter,
    stateFilter,
    companyFilter,
    customerFilter,
    effectiveCompanyFilter,
    effectiveCustomerFilter,
    rangeDate,
  ]);

  return (
    <>
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <SimpleGrid
          mb="20px"
          pt="32px"
          px="24px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          <Flex minWidth="max-content" justifyContent="flex-start">
            <h1 className="mb-0">Customer Invoices</h1>
          </Flex>
          <Flex justifyContent="flex-end" alignItems="center">
            {isAdmin && (
              <Link href="/admin/invoices/create">
                <Button
                  className="!h-[39px]"
                  fontSize="sm"
                  lineHeight="19px"
                  variant="brand"
                  fontWeight="500"
                >
                  Create Invoice
                </Button>
              </Link>
            )}
            <Button
              fontSize="sm"
              lineHeight="19px"
              variant="brand"
              fontWeight="500"
              w="20%"
              h="50"
              mb="0"
              ms="10px"
              className="!h-[39px]"
              onClick={() => {
                onOpenStatementModal();
              }}
            >
              Generate Statement PDF
            </Button>
          </Flex>
        </SimpleGrid>
      </Box>

      <SimpleGrid className="text-sm text-center font-bold border-b border-[var(--chakra-colors-gray-200)]">
        <Flex className="pl-5">
          <TabsComponent
            tabs={tabs}
            onChange={(tabId) => setActiveTab(tabId)}
          />
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
            <Box
              alignItems="center"
              flexDirection="column"
              w="30%"
              maxW="max-content"
              p="10px 10px"
              h="max-content"
            >
              {/* @ts-ignore */}
              <DateRangePicker value={rangeDate} onChange={setRangeDate} />
            </Box>
            <Box className="!max-w-md" p="10px 10px" h="max-content" w="20%">
              {isAdmin ? (
                <Select
                  placeholder="Company"
                  options={companiesOptions}
                  size="lg"
                  className="select mb-0"
                  classNamePrefix="two-easy-select"
                  onInputChange={(e) => {
                    onChangeSearchCompany(e);
                  }}
                  onChange={(e) => setCompanyFilter(e?.value || null)}
                  isClearable={true}
                ></Select>
              ) : (
                <Select
                  placeholder="Company"
                  options={companiesOptions}
                  onInputChange={(e) => onChangeSearchCompany(e)}
                  onChange={(e) => setCompanyFilter(e?.value || null)}
                  isClearable={isAdmin}
                  isDisabled={!isAdmin}
                  value={
                    companiesOptions.find(
                      (c) => Number(c.value) === Number(effectiveCompanyFilter),
                    ) || null
                  }
                />
              )}
            </Box>
            <Box className="!max-w-md" p="10px 10px" h="max-content" w="20%">
              {isAdmin ? (
                <Select
                  placeholder="User"
                  isMulti
                  options={customerOptions}
                  size="lg"
                  className="select mb-0"
                  classNamePrefix="two-easy-select"
                  onInputChange={(e) => {
                    onChangeSearchCustomer(e);
                  }}
                  onChange={(e) =>
                    setCustomerFilter(e ? e.map((item) => item.value) : null)
                  }
                  isClearable={true}
                ></Select>
              ) : (
                <Select
                  placeholder="User"
                  isMulti
                  options={customerOptions}
                  onInputChange={(e) => onChangeSearchCustomer(e)}
                  onChange={(e) =>
                    setCustomerFilter(e ? e.map((item) => item.value) : null)
                  }
                  isDisabled={!effectiveCompanyFilter}
                />
              )}
            </Box>
            <Box className="!max-w-md" p="10px 10px" h="max-content" w="15%">
              <Select
                placeholder="State"
                options={stateOptions}
                size="lg"
                className="select mb-0"
                classNamePrefix="two-easy-select"
                onChange={(e) => setStateFilter(e?.value || null)}
                isClearable={true}
              ></Select>
            </Box>
            <Box className="!max-w-md" p="10px 10px" h="max-content" w="15%">
              <Select
                placeholder="Job Category"
                options={jobCategories}
                size="lg"
                className="select mb-0"
                classNamePrefix="two-easy-select"
                onChange={(e) => setJobCategoryFilter(e?.value || null)}
                isClearable={true}
              ></Select>
            </Box>
            <Box
              alignItems="center"
              flexDirection="column"
              w="100%"
              maxW="max-content"
              p="10px 10px"
              h="max-content"
            >
              Invoice Total:{" "}
              {invoiceTotals?.invoices?.data &&
                invoiceTotals?.invoices?.data.length > 0
                ? formatCurrency(
                  invoiceTotals?.invoices?.data.reduce(
                    (a: any, b: any) => a + b.total,
                    0,
                  ),
                )
                : "-"}
            </Box>

            <SearchBar
              background={menuBg}
              onChangeSearchQuery={onChangeSearchQuery}
            />
          </Flex>
          <Divider className="!my-0 !py-0" />

          {isAdmin && !loading && invoices?.invoices?.data && (
            <Box sx={tableColumnWidthStyles}>
              <PaginationTable
                columns={columns}
                data={invoices.invoices.data}
                total={invoices.invoices.paginatorInfo?.total ?? 0}
                options={{
                  initialState: {
                    pageIndex: queryPageIndex,
                    pageSize: queryPageSize,
                  },
                  manualPagination: true,
                  pageCount: invoices.invoices.paginatorInfo?.lastPage,
                }}
                path="/admin/invoices"
                setQueryPageIndex={setQueryPageIndex}
                setQueryPageSize={setQueryPageSize}
                isServerSide
              />
            </Box>
          )}

          {(isCompanyAdmin || isCustomer) &&
            !companyInvoiceLoading &&
            companyInvoices?.invoices?.data && (
              <Box sx={tableColumnWidthStyles}>
                <PaginationTable
                  columns={columns}
                  data={companyInvoices.invoices.data}
                  total={companyInvoices.invoices.paginatorInfo?.total ?? 0}
                  options={{
                    initialState: {
                      pageIndex: queryPageIndex,
                      pageSize: queryPageSize,
                    },
                    manualPagination: true,
                    pageCount: companyInvoices.invoices.paginatorInfo?.lastPage,
                  }}
                  path="/admin/invoices"
                  setQueryPageIndex={setQueryPageIndex}
                  setQueryPageSize={setQueryPageSize}
                  isServerSide
                />
              </Box>
            )}
        </SimpleGrid>
      </Box>
      <PrivateAccessModal isOpen={isOpen} onClose={onClose} />

      <StatementGenerateModal
        isOpen={isStatementModalOpen}
        onClose={onCloseStatementModal}
      />
    </>
  );
}