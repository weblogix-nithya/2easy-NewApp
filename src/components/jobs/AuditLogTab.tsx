import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { Box, SimpleGrid } from "@chakra-ui/react";
import PaginationTable from "../table/PaginationTable";
import { GET_INVOICE_STATUSES_QUERY } from "@/graphql/invoiceStatus";
import { GET_JOB_LOGS_QUERY } from "@/graphql/job";
import { GET_JOB_STATUSES_QUERY } from "@/graphql/jobStatus";
import moment from "moment";
// import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import { JsonTreeViewer } from "./JobTableColumns";
export default function AuditLogTab(props: {
  jobObjectId: any;
  activeTab: any;
}) {
  const { jobObjectId, activeTab } = props;
  // console.log(jobObjectId, activeTab, "jobObjectId,t");
  // const router = useRouter();
  const [_queryPageIndex, setQueryPageIndex] = useState(0);
  const [_queryPageSize, setQueryPageSize] = useState(100);
  const [jobStatuses, setJobStatuses] = useState<Record<number, string>>({});
  const [invoiceStatuses, setInvoiceStatuses] = useState<
    Record<number, string>
  >({});

  const columns = useMemo(
    () => [
      { header: "User", accessor: "user.name" },
      { header: "User Role", accessor: "user.roles[0].name" },
      { header: "Action", accessor: "action" },
      { header: "Field", accessor: "field" },

      {
        header: "Old Value",
        accessor: "old_value",
        cell: ({ row }: any) =>
          formatValue(row.original.field, row.original.old_value),
      },
      {
        header: "New Value",
        accessor: "new_value",
        cell: ({ row }: any) =>
          row.original.field?.includes("status_id") ? (
            formatValue(row.original.field, row.original.new_value)
          ) : (
            <JsonTreeViewer value={row.original.new_value} />
          ),
      },

      {
        header: "Mail Sent",
        accessor: "mail_sent",
        type: "boolean",
        trueLabel: "Yes",
        falseLabel: "No",
      },

      {
        header: "Date",
        accessor: "created_at",
        cell: ({ value }: any) => {
          if (!value) return "-";

          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

          return `${moment
            .utc(value, "YYYY-MM-DD HH:mm:ss")
            .local()
            .format("DD MMM YYYY, hh:mm A")} (${tz})`;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobStatuses],
  );

  const formatValue = (field: string, value: any) => {
    if (value === null || value === undefined) return "-";

    if (field?.includes("job_status_id")) {
      return jobStatuses[Number(value)] || `Unknown (${value})`;
    }

    if (field?.includes("invoice_status_id")) {
      return invoiceStatuses[Number(value)] || `Unknown (${value})`;
    }
    return value;
  };

  useApolloQueryWithEffect(GET_INVOICE_STATUSES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data: any) => {
      const map = data?.invoiceStatuses?.data?.reduce(
        (acc: Record<number, string>, item: any) => {
          acc[Number(item.id)] = item.name;
          return acc;
        },
        {},
      );

      setInvoiceStatuses(map);
    },
  });

  useApolloQueryWithEffect(GET_JOB_STATUSES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      const map = data?.jobStatuses?.data?.reduce(
        (acc: Record<number, string>, item: any) => {
          acc[Number(item.id)] = item.name;
          return acc;
        },
        {},
      );

      setJobStatuses(map);
    },
  });

  const { loading: jobLogsLoading, data: jobLogsData } = useApolloQueryWithEffect<any>(
    GET_JOB_LOGS_QUERY,
    {
      variables: {
        job_id: Number(jobObjectId),
        first: Number(50),
      },
      // skip: !router.isReady || !jobObjectId || activeTab !== "audit", // Commented in new app Router
      skip: !jobObjectId || activeTab !== "audit", // ✅ ONLY runs for Invoice tab
      fetchPolicy: "network-only",
    },
  );

  // const logs = jobLogsData?.jobLogs?.data || [];
  return (
    <Box mt={5}>
      <SimpleGrid
        mb="20px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        {!jobLogsLoading && jobLogsData?.jobLogs?.data.length >= 0 && (
          <PaginationTable
            columns={columns}
            // showDelete={true} // Removed in Current ver of table
            data={jobLogsData?.jobLogs?.data}
            setQueryPageIndex={setQueryPageIndex}
            setQueryPageSize={setQueryPageSize}
            isServerSide
            path="/admin/jobs"
          />
        )}
      </SimpleGrid>
    </Box>
  );
}
