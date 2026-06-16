import {
  Box,
  Flex,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SearchBar } from "../navbar/searchBar/SearchBar";
import debounce from "lodash.debounce";
import { GET_JOBS_QUERY } from "@/graphql/job";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import JobStatusDateFilter from "./JobStatusDateFilter";
import { getCompanyColumns } from "@/components/jobs/JobTableColumnsCustomer";
import PaginationTableCustomer from "@/components/table/PaginationTableCustomer";
import { JoinOnClause } from "@/graphql/types/types";
import { jobformatDate } from "@/lib/helpers/helper";
import { GET_JOB_STATUSES_QUERY } from "@/graphql/jobStatus";

const companyStatusOptions = [
  {
    value: "all",
    label: "Show All",
    statusIds: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    value: "Open",
    label: "Open",
    statusIds: [1, 2, 3],
  },
  {
    value: "Completed",
    label: "Completed",
    statusIds: [6, 7],
  },
];

function CustomerJobs() {
  const today = new Date();
  const [searchQuery, setSearchQuery] = useState("");
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(100);
  const [_jobStatuses, setJobStatuses] = useState([]);
  const [companyColumns, setCompanyColumns] = useState([]); // State for company columns
  const [rangeDate, setRangeDate] = useState<[Date, Date]>([today, today]);

  const { isAdmin, companyId, customerId } = useSelector(
    (state: RootState) => state.user,
  );
  const menuBg = useColorModeValue("white", "navy.800");
  const [withMedia, setWithMedia] = useState(false);
  const [isMediaBusy, setIsMediaBusy] = useState(false);
  const [isChecked, _setIsChecked] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    (typeof companyStatusOptions)[number] | null
  >(companyStatusOptions[0]);
  const [statusFilter, setStatusFilter] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7,
  ]);
  // const [sorting, setSorting] = useState<any>({ id: "name", direction: "ASC" });

  useEffect(() => {
    const columns = getCompanyColumns(withMedia);
    setCompanyColumns(columns);
  }, [withMedia]);
  // Hide timer to clear the media-busy spinner shortly after columns update
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setIsMediaBusy(false);
      hideTimerRef.current = null;
    }, 2000); // keep spinner visible ~2000ms
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [companyColumns]);
  
  const handleToggleWithMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMediaBusy(true);
    setWithMedia(e.target.checked);
  };

  const orderByRelationship = useMemo(() => {
    let join = undefined as JoinOnClause;
    let column =  "id";
    let order = "DESC";
    let table_name = "jobs";
    // let scope = undefined;
    if (column.includes("driver")) {
      join = {
        name: "drivers",
        table_name: "drivers",
        key: "id",
        other_key: "driver_id",
        other_table_name: "jobs",
      };
      table_name = "drivers";
      column = "full_name";
    }
    return [
      {
        join: join ? [join] : undefined,
        column,
        order,
        table_name,
        // scope,
      },
    ];
  }, []);

  // const handleSortingChange = useCallback((sortBy: any[]) => {
  //   if (sortBy.length === 0) {
  //     setSorting((currentSorting: any) =>
  //       currentSorting.id === "name" && currentSorting.direction === "ASC"
  //         ? currentSorting
  //         : {
  //             id: "name",
  //             direction: "ASC",
  //           },
  //     );
  //   } else {
  //     const [sort] = sortBy;
  //     const nextSorting = {
  //       id: sort.id,
  //       direction: sort.desc ? "DESC" : "ASC",
  //     };
  //     setSorting((currentSorting: any) =>
  //       currentSorting.id === nextSorting.id &&
  //       currentSorting.direction === nextSorting.direction
  //         ? currentSorting
  //         : nextSorting,
  //     );
  //   }
  // }, []);

  const {
    loading: companyJobsLoading,
    error: _companyJobsError,
    data: companyJobs,
    // refetch: getJobs,
  } = useApolloQueryWithEffect<any>(GET_JOBS_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderByRelationship: orderByRelationship,
      company_id: companyId,
      // isCompany || isCompanyAdmin ? parseInt(companyId) : undefined,
      customer_id: customerId,
      // isCustomer && !isCompanyAdmin ? parseInt(customerId) : undefined,
      job_status_ids: statusFilter,
      between_at: rangeDate?.[0]
        ? {
            from_at: jobformatDate(rangeDate[0], true),
            to_at: jobformatDate(rangeDate[1], false),
          }
        : undefined,
    },
    skip: isAdmin,
  });

  useEffect(() => {
    const hasCompanyJobs = companyJobs?.jobs?.data?.length > 0;
    if (!isAdmin && hasCompanyJobs) {
      getJobStatuses();
      // getJobCategories();
      // getAvailableDrivers();
      // getDynamicTableUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyJobs?.jobs?.data?.length]);

  const handleStatusChange = (selectedOption: any) => {
    setSelectedStatus(selectedOption);
    setQueryPageIndex(0);

    const option = companyStatusOptions.find(
      (opt) => opt.value === selectedOption.value,
    );

    setStatusFilter(option?.statusIds || [1, 2, 3, 4, 5, 6, 7]);
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);
        setQueryPageIndex(0);
      }, 300),
    [],
  );

  useEffect(
    () => debouncedSearch.cancel(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { refetch: getJobStatuses } = useApolloQueryWithEffect(
    GET_JOB_STATUSES_QUERY,
    {
      variables: {
        query: "",
        page: 1,
        first: 100,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
      onCompleted: (data: any) => {
        setJobStatuses(
          data.jobStatuses.data.map((jobStatus: any) => ({
            value: parseInt(jobStatus.id),
            label: jobStatus.name,
          })),
        );
      },
    },
  );

  return (
    <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
      <SimpleGrid
        mb="70px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px" }}
      >
        <Text fontSize="xl" fontWeight="bold" mb="5px">
          Customer Jobs
        </Text>
        <Flex justifyContent="space-between">
          <Flex>
            <JobStatusDateFilter
              statusOptions={companyStatusOptions}
              onStatusChange={handleStatusChange}
              selectedStatus={selectedStatus}
              rangeDate={rangeDate}
              setRangeDate={setRangeDate}
              withMedia={withMedia}
              handleToggleWithMedia={handleToggleWithMedia}
              isMediaBusy={isMediaBusy}
            />
          </Flex>
          <Flex alignItems="center">
            <SearchBar
              onChangeSearchQuery={debouncedSearch}
              placeholder="Search delivery jobs"
              background={menuBg}
              me="10px"
            />
          </Flex>
        </Flex>
        <Flex mt={4} flexDirection="column">
          {companyJobsLoading ? (
            // 🔄 Loading State
            <Box textAlign="center" py={4} px={10}>
              Loading <Spinner size="sm" ml={2} />
            </Box>
          ) : companyJobs?.jobs?.data?.length > 0 ? (
            // 📊 Data Exists
            <PaginationTableCustomer
              columns={companyColumns}
              data={companyJobs?.jobs?.data}
              total={companyJobs?.jobs?.total}
              options={{
                manualSortBy: true,
                initialState: {
                  pageIndex: queryPageIndex,
                  pageSize: queryPageSize,
                  sortBy: [
                    { id: "id", desc: true },
                  ],
                },
                manualPagination: true,
                pageCount: companyJobs?.jobs?.paginatorInfo?.lastPage ?? 0,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              showPageSizeSelect
              isChecked={isChecked}
              // onSortingChange={handleSortingChange}
              restyleTable
              hideEditForStatuses={[1, 2, 3, 4, 5]}
            />
          ) : (
            // 📭 No Data
            <Box textAlign="center" py={4} px={10} color="gray.600">
              No records found.
            </Box>
          )}
        </Flex>
      </SimpleGrid>
    </Box>
  );
}

export default CustomerJobs;
