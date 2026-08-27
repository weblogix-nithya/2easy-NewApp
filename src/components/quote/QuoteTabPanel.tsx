import { useQuery } from "@apollo/client/react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import PaginationTable from "@/components/table/PaginationTable";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import { GET_QUOTES_QUERY } from "@/graphql/quote";
import { GET_QUOTE_STATUSES_QUERY } from "@/graphql/quoteStatus";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

type QuoteStatusesResponse = {
  quoteStatuses: {
    id: string | number;
    name: string;
  }[];
};

type QuotesResponse = {
  quotes: {
    data: any[]; // replace `any` with a proper Quote type if you have one
    paginatorInfo: {
      lastPage: number;
      // add other paginatorInfo fields here if you use them (total, currentPage, etc.)
    };
  };
};

export default function QuoteTabPanel(props: {
  categoryId: Number;
  searchQuery: String;
  queryPageIndex: number;
}) {
  const { categoryId, searchQuery, queryPageIndex } = props;
  const [queryPageIndexChild, setQueryPageIndexChild] =
    useState(queryPageIndex);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const { companyId, isAdmin } = useSelector(
    (state: RootState) => state.user,
  );

  const [tabs, setTabs] = useState([]);
  const [tabId, setActiveTab] = useState(1);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Quote Number",
        accessorKey: "name" as const,
      },
      {
        id: "company.name",
        header: "Company Name",
        accessorKey: "company.name" as const,
      },
      {
        id: "customer_name",
        header: "Customer Name",
        accessorKey: "customer_name" as const,
      },
      {
        id: "customer_reference",
        header: "Customer Reference",
        accessorKey: "customer_reference" as const,
      },
      {
        id: "quote_service.name",
        header: "Service Type",
        // accessorKey: "quote_service.name" as const,
        accessorFn: (row:any) => row.quote_service?.name ?? "—",

      },
      {
        id: "quote_type.name",
        header: "Urgency",
        accessorKey: "quote_type.name" as const,
        accessorFn: (row:any) => row.quote_type?.name ?? "—",
      },
      {
        id: "date_required",
        header: "Date Required",
        accessorKey: "date_required" as const,
        type: "date",
      },
      {
        id: "created_at",
        header: "Quote Submission Time / Date",
        accessorKey: "created_at" as const,
        type: "date",
      },
      {
        id: "id",
        header: "Actions",
        accessorKey: "id" as const,
        meta: {
          Header: "Actions",
          isEdit: true,
        },
      },
    ],
    [],
  );

  const { data: quoteStatusesData } = useQuery<QuoteStatusesResponse>(
    GET_QUOTE_STATUSES_QUERY,
  );

  useEffect(() => {
    if (!quoteStatusesData?.quoteStatuses) return;

    const newTabs = quoteStatusesData.quoteStatuses.map((status: any) => ({
      id: status?.id,
      name: status?.name,
      tabName: status?.name,
      hash: status?.name?.replace(/\s+/g, "_").toLowerCase(),
    }));

    setTabs(newTabs);
  }, [quoteStatusesData]);

  const {
    loading,
    // error,
    data: quotes,
    refetch: getQuotes,
  } = useQuery<QuotesResponse>(GET_QUOTES_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndexChild + 1,
      first: queryPageSize,
      orderByColumn: "id",
      orderByOrder: "DESC",
      quote_category_id: categoryId,
      quote_status_id: tabId,
      company_id: isAdmin ? undefined : Number(companyId),
      // customer_id: isAdmin ? customerId : undefined,
    },
  });

  useEffect(() => {
    getQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, tabId, searchQuery]);

  return (
    <>
      {/* STATUS TABS */}
      <TabsComponent tabs={tabs} onChange={(tabId) => setActiveTab(tabId)} />
      {/* END TABS */}

      <Box pt="0px">
        <SimpleGrid
          mt="20px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          {!loading && quotes?.quotes.data.length >= 0 && (
            <PaginationTable
              columns={columns}
              data={quotes?.quotes.data}
              options={{
                initialState: {
                  pageIndex: queryPageIndex,
                  pageSize: queryPageSize,
                },
                manualPagination: true,
                pageCount: quotes?.quotes.paginatorInfo.lastPage,
              }}
              setQueryPageIndex={setQueryPageIndexChild}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              path= "/admin/quotes"
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}
