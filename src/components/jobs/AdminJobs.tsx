"use client";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
// import ActionBar from "@/components/jobs/ActionBar";
import ActionBar from "./ActionBar";
import {
  defaultJobFilter,
  defaultSelectedFilter,
  filterDisplayNames,
  SelectedFilter,
} from "./Filters";
import {
  getBulkAssignColumns,
  getColumns,
  tableColumn,
} from "./JobTableColumns";
// import { getCompanyColumns } from "@/components/jobs/JobTableColumnsCustomer";
// import { SearchBar } from "components/navbar/searchBar/SearchBar";
import JobPaginationTable from "../table/JobPaginationTable";
// import PaginationTableCustomer from "components/table/PaginationTableCustomer";
import { GET_AVAILABLE_DRIVERS_QUERY } from "../../graphql/driver";
import {
  DynamicTableUser,
  GET_DYNAMIC_TABLE_USERS_QUERY,
} from "../../graphql/dynamicTableUser";
// import { GET_JOBS_QUERY, Job } from "graphql/job";
import {
  GET_JOBS_QUERY,
  GROUPED_PAGINATED_JOBS_QUERY,
  GroupedPaginatedJobsData,
  GroupedPaginatedJobsVars,
} from "@/graphql/job";
import { GET_JOB_CATEGORIES_QUERY } from "@/graphql/jobCategories";
import { GET_JOB_STATUSES_QUERY } from "@/graphql/jobStatus";
import { JoinOnClause } from "@/graphql/types/types";
import {
  outputDynamicTableBody,
  outputDynamicTableHeader,
} from "@/lib/helpers/helper";
// import AdminLayout from "layouts/admin";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { downloadExcel } from "react-export-table-to-excel";
// import { FaFileExcel } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsFilterTicked,
  setJobFilters,
  setJobMainFilters,
} from "@/lib/store/jobFilterSlice";
import { RootState } from "@/lib/store/store";

import JobHeader from "@/components/jobs/JobHeader";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
// "./job-components/JobHeader";

const JobStatusDateFilter = dynamic(
  () => import("@/components/jobs/JobStatusDateFilter"),
  {
    ssr: false,
  },
);
const FilterJobsModal = React.lazy(
  () => import("@/components/jobs/FilterJobsModal"),
);
// const JobBulkAssignModal = React.lazy(
//   () => import("@/components/jobs/JobBulkAssignModal"),
// );
// const JobBulkSortModal = React.lazy(
//   () => import("@/components/jobs/JobBulkSortModal"),
// );
// const JobTableSettingsModal = React.lazy(
//   () => import("@/components/jobs/JobTableSettingsModal"),
// );
// Inside Job Index
const JobTableSettingsModal = dynamic(
  () => import("@/components/jobs/JobTableSettingsModal"),
  {
    loading: () => <Text>Loading settings...</Text>,
    ssr: false,
  },
);

const adminStatusOptions = [
  {
    value: "all",
    label: "Show All",
    statusIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    value: "current",
    label: "Current (Unassigned/Scheduled/En Route)",
    statusIds: [1, 2, 4],
  },
  {
    value: "in_transit",
    label: "In Transit (Assigned/In Transit)",
    statusIds: [3, 5],
  },
  {
    value: "completed",
    label: "Completed (Completed/Delivered)",
    statusIds: [6, 7],
  },
  {
    value: "Cancelled",
    label: "Cancelled (Cancelled/Declined)",
    statusIds: [8, 9],
  },
  {
    value: "Futile",
    label: "Futile",
    statusIds: [10],
  },
];

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

function formatDate(date: Date, isStart: boolean): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const time = isStart ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day} ${time}`;
}

interface GetDynamicTableUsersData {
  dynamicTableUsers?: {
    data: DynamicTableUser[];
  };
}

interface GetDynamicTableUsersVars {
  query: string;
  page: number;
  first: number;
  orderByColumn: string;
  orderByOrder: "ASC" | "DESC";
  user_id: string;
}

// export default function JobIndex() {
export default function JobIndex({}: // initialLoadOnly = false,
{
  // initialLoadOnly?: boolean;
}) {
  // const [hasInitialLoadDone, setHasInitialLoadDone] = useState(!initialLoadOnly);
  // const [initialJobsData, setInitialJobsData] = useState<any[]>([]);
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(100);

  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<any>({ id: "id", direction: true });
  const [_statusFilter, setStatusFilter] = useState("all");
  const today = new Date();
  const [rangeDate, setRangeDate] = useState<[Date, Date]>([today, today]);
  const [_isTableLoading, setIsTableLoading] = useState(false);
  const {
    isAdmin,
    companyId,
    customerId,
    isCompany,
    isCompanyAdmin,
    isCustomer,
    userId,
  } = useSelector((state: RootState) => state.user);

  // Adjusted logic for choosing correct options
  const statusOptions = useMemo(() => {
    if (isAdmin && isCompanyAdmin) return companyStatusOptions;
    return isCompany ? companyStatusOptions : adminStatusOptions;
  }, [isAdmin, isCompany, isCompanyAdmin]);

  const [selectedStatus, setSelectedStatus] = useState<
    (typeof statusOptions)[number] | null
  >(statusOptions[0]);

  const { filters, displayName, jobMainFilters, is_filter_ticked } =
    useSelector((state: RootState) => state.jobFilter);
  const _cookies = parseCookies();
  const dispatch = useDispatch();
  const [withMedia, setWithMedia] = useState(false);
  const [isMediaBusy, setIsMediaBusy] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const [_jobStatuses, setJobStatuses] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  // console.log(selectedJobs,'selectedJobs')
  const [drivers, setDrivers] = useState([]);
  // const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverOptions, setDriverOptions] = useState([]);
  const [dynamicTableUsers, setDynamicTableUsers] = useState<
    DynamicTableUser[]
  >([]);
  const [isShowSelectedOnly, setIsShowSelectedOnly] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [jobFilter, setJobFilter] = useState(defaultJobFilter);
  const [mainJobFilter, setMainJobFilter] = useState(null);
  const [mainFilters, setMainFilters] = useState<any>(defaultSelectedFilter);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilter>(
    defaultSelectedFilter,
  );
  const [mainFilterDisplayNames, setMainFilterDisplayNames] =
    useState<typeof filterDisplayNames>(filterDisplayNames);
  // const [companyColumns, setCompanyColumns] = useState([]); // State for company columns

  const handleToggleWithMedia = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsMediaBusy(true);
      setWithMedia(checked);
    },
    [],
  );

  const { refetch: getDynamicTableUsers, data: dynamicTableData } =
    useApolloQueryWithEffect<
      GetDynamicTableUsersData,
      GetDynamicTableUsersVars
    >(
      GET_DYNAMIC_TABLE_USERS_QUERY,
      {
        variables: {
          query: "",
          page: 1,
          first: 100,
          orderByColumn: "sort_id",
          orderByOrder: "ASC",
          user_id: userId,
        },
        skip: !userId,
        notifyOnNetworkStatusChange: true,
      },
      (data) => {
        console.log("data-dynamic", data);
        setDynamicTableUsers(
          data.dynamicTableUsers.data.filter(
            (item: DynamicTableUser) => item.is_active === true,
          ),
        );
      },
    );

  const groupedVars = useMemo(() => {
    const base = {
      page: queryPageIndex + 1,
      per_page: queryPageSize,
      query: searchQuery || "",
      job_status_ids: mainJobFilter?.job_status_ids || [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ],
      company_id: isCompany ? parseInt(companyId) : undefined,
      customer_id:
        isCustomer && !isCompanyAdmin ? parseInt(customerId) : undefined,
      between_at: rangeDate?.[0]
        ? {
            from_at: formatDate(rangeDate[0], true),
            to_at: formatDate(rangeDate[1], false),
          }
        : undefined,
    };

    return is_filter_ticked === "1"
      ? { ...base, ...(mainJobFilter ?? {}) }
      : base;
  }, [
    queryPageIndex,
    queryPageSize,
    searchQuery,
    mainJobFilter,
    isCompany,
    companyId,
    isCustomer,
    isCompanyAdmin,
    customerId,
    rangeDate,
    is_filter_ticked,
  ]);
  // const baseGroupedVars = React.useCallback(
  //   () => ({
  //     page: queryPageIndex + 1,
  //     per_page: queryPageSize,
  //     query: searchQuery || "",
  //     job_status_ids: mainJobFilter?.job_status_ids || [
  //       1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  //     ],
  //     company_id: isCompany ? parseInt(companyId) : undefined,
  //     customer_id:
  //       isCustomer && !isCompanyAdmin ? parseInt(customerId) : undefined,
  //     between_at: rangeDate?.[0]
  //       ? {
  //           from_at: formatDate(rangeDate[0], true),
  //           to_at: formatDate(rangeDate[1], false),
  //         }
  //       : undefined,
  //   }), // eslint-disable-line react-hooks/exhaustive-deps
  //   [
  //     queryPageIndex,
  //     queryPageSize,
  //     searchQuery,
  //     isCompany,
  //     companyId,
  //     isCustomer,
  //     isCompanyAdmin,
  //     customerId,
  //     rangeDate,
  //     mainJobFilter?.job_status_ids,
  //   ],
  // );

  // const groupedVars = React.useMemo(
  //   () =>
  //     is_filter_ticked === "1"
  //       ? { ...baseGroupedVars(), ...(mainJobFilter ?? {}) }
  //       : baseGroupedVars(),
  //   [is_filter_ticked, mainJobFilter, baseGroupedVars],
  // );
  const {
    data: groupedJobs,
    loading: loadingGroupedJobs,
    refetch: refetchGroupedJobs,
  } = useApolloQueryWithEffect<
    GroupedPaginatedJobsData,
    GroupedPaginatedJobsVars
  >(
    GROUPED_PAGINATED_JOBS_QUERY,
    {
      variables: groupedVars,

      skip: !userId || isCompanyAdmin || isCustomer || isCompany,
      fetchPolicy: "network-only",
    },
    (data) => {
      console.log("groupedjob", data);
      
    },
  );

  const adminColumns = useMemo(() => {
    return getColumns(
      isAdmin,
      isCustomer,
      withMedia,
      refetchGroupedJobs,
      (dynamicTableData?.dynamicTableUsers?.data || []) as DynamicTableUser[],
    );
  }, [dynamicTableData, isAdmin, isCustomer, withMedia]);

  useEffect(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setIsMediaBusy(false);
      hideTimerRef.current = null;
    }, 2000); // keep spinner visible ~300ms
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [adminColumns]);

  // useEffect(() => {
  //   const columns = getCompanyColumns(isAdmin, isCustomer, withMedia);
  //   setCompanyColumns(columns);
  // }, [withMedia, isAdmin, isCustomer]);

  const bulkAssignColumns = getBulkAssignColumns(
    isAdmin,
    isCustomer,
    dynamicTableUsers,
  );

  const orderByRelationship = useMemo(() => {
    let join = undefined as JoinOnClause;
    let column = sorting?.id ?? "id";
    let order = sorting?.direction ? "DESC" : "ASC";
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
  }, [sorting]);

  // const {
  //   loading: companyJobsLoading,
  //   error: _companyJobsError,
  //   data: companyJobs,
  //   refetch: getCompanyJobs,
  // } = useQuery(GET_JOBS_QUERY, {
  //   variables: {
  //     query: searchQuery,
  //     page: queryPageIndex + 1,
  //     first: queryPageSize,
  //     orderByRelationship: orderByRelationship,
  //     company_id: isCompany || isCompanyAdmin ? parseInt(companyId) : undefined,

  //     customer_id:
  //       isCustomer && !isCompanyAdmin ? parseInt(customerId) : undefined,
  //     job_status_ids: mainJobFilter?.job_status_ids || [
  //       1, 2, 3, 4, 5, 6, 7, 10,
  //     ],
  //     between_at: rangeDate?.[0]
  //       ? {
  //           from_at: formatDate(rangeDate[0], true),
  //           to_at: formatDate(rangeDate[1], false),
  //         }
  //       : undefined,
  //     ...mainJobFilter,
  //   },
  //   skip: isAdmin && !isCompanyAdmin,
  // });

  // useEffect(() => {
  //   const hasGroupedJobs = groupedJobs?.groupedPaginatedJobs?.data?.length > 0;
  //   const hasCompanyJobs = companyJobs?.jobs?.data?.length > 0;

  //   if ((isAdmin && hasGroupedJobs) || (!isAdmin && hasCompanyJobs)) {
  //     getJobStatuses();
  //     getJobCategories();
  //     getAvailableDrivers();
  //     getDynamicTableUsers();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   isAdmin,
  //   groupedJobs?.groupedPaginatedJobs?.data?.length,
  //   companyJobs?.jobs?.data?.length,
  // ]);

  useEffect(() => {
    if (is_filter_ticked == "1") {
      let _jobFilter = jobFilter;
      const updatedValues: any = {};
      for (const key in defaultSelectedFilter) {
        if (
          filters[key as keyof SelectedFilter] !== undefined &&
          filters[key as keyof SelectedFilter] !== "undefined" &&
          filters[key as keyof SelectedFilter] !== ""
        ) {
          updatedValues[key] = filters[key as keyof SelectedFilter];
        }
      }

      setJobFilter(jobMainFilters);
      _jobFilter = jobMainFilters;
      if (displayName) setMainFilterDisplayNames(displayName);
      updateTags(updatedValues, _jobFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [is_filter_ticked]);

  const handleResetAll = () => {
    updateTags({ ...defaultSelectedFilter }, defaultJobFilter);
  };

  const updateTags = (updatedValues: SelectedFilter, jobFilter: any) => {
    const updatedJobFilter = { ...jobFilter };
    for (const key in defaultSelectedFilter) {
      if (
        updatedValues[key as keyof SelectedFilter] == undefined ||
        updatedValues[key as keyof SelectedFilter] == null ||
        updatedValues[key as keyof SelectedFilter].length == 0
      ) {
        delete updatedJobFilter[key as keyof SelectedFilter];
      }
      setCookie(
        null,
        `jobFilters_${key}`,
        JSON.stringify(updatedValues[key as keyof SelectedFilter]),
        {
          maxAge: 30 * 24 * 60 * 60,
          path: "*",
        },
      );
      dispatch(
        setJobFilters({
          key: key,
          value: updatedValues[key as keyof SelectedFilter],
        }),
      );
    }
    setCookie(null, `jobMainFilters`, JSON.stringify(updatedJobFilter), {
      maxAge: 24 * 60 * 60,
      path: "*",
    });
    dispatch(setJobMainFilters(updatedJobFilter));

    setJobFilter(updatedJobFilter);
    setMainJobFilter(updatedJobFilter);
    setSelectedFilters(updatedValues);
    setMainFilters(updatedValues);
  };
  const {
    isOpen: isOpenFilter,
    onOpen: onOpenFilter,
    onClose: onCloseFilter,
  } = useDisclosure();

  useEffect(() => {
    getJobStatuses();
    getJobCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isOpen: isOpenSetting,
    onOpen: onOpenSetting,
    onClose: onCloseSetting,
  } = useDisclosure();
  const {
    isOpen: isOpenBulkSort,
    onOpen: onOpenBulkSort,
    onClose: onCloseBulkSort,
  } = useDisclosure();

  const {
    isOpen: isOpenBulkAssign,
    onOpen: onOpenBulkAssign,
    onClose: onCloseBulkAssign,
  } = useDisclosure();

  // const changeTab = useMemo(() => {
  //   return debounce((tab) => {
  //     // setIsPending(tab == 1);
  //     // setIsCompleted(tab == 2 ? true : false);
  //     setQueryPageIndex(0);
  //   }, 300);
  // }, []);

  // useEffect(() => {
  //   if (isAdmin) {
  //     refetchJobs(); // GROUPED_PAGINATED_JOBS_QUERY
  //   } else if (isCompany || isCustomer) {
  //     getCompanyJobs(); // GET_JOBS_QUERY
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   queryPageIndex,
  //   queryPageSize,
  //   searchQuery,
  //   mainFilters,
  //   rangeDate,
  //   withMedia,
  //   isAdmin,
  //   isCompany,
  //   isCustomer,
  // ]);

  // useEffect(() => {
  //   if (isAdmin) {
  //     refetchGroupedJobs(groupedVars); // <— pass latest vars
  //   }
  //   // else if (isCompany || isCustomer) {
  //   //   getCompanyJobs(); // (you can do the same pattern with a companyVars memo if needed)
  //   // }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   groupedVars, // <— single source captures page, size, search, dates, AND is_filter_ticked/mainJobFilter
  //   isAdmin,
  //   // isCompany,
  //   // isCustomer,
  // ]);

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
      skip: true,
      variables: {
        query: "",
        page: 1,
        first: 100,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    },
    (data: any) => {
      setJobStatuses(
        data.jobStatuses.data.map((jobStatus: any) => ({
          value: parseInt(jobStatus.id),
          label: jobStatus.name,
        })),
      );
    },
  );

  // const { refetch: getJobCategories } = useQuery(GET_JOB_CATEGORIES_QUERY, {
  //   skip: true,
  //   variables: {
  //     query: "",
  //     page: 1,
  //     first: 100,
  //     orderByColumn: "id",
  //     orderByOrder: "ASC",
  //   },
  //   onCompleted: (data) => {
  //     setJobCategories([]);
  //     data.jobCategorys.data.map((category: any) => {
  //       setJobCategories((jobCategories) => [
  //         ...jobCategories,
  //         {
  //           value: parseInt(category.id),
  //           label: category.name,
  //         },
  //       ]);
  //     });
  //   },
  // });
  const { refetch: getJobCategories } = useApolloQueryWithEffect(
    GET_JOB_CATEGORIES_QUERY,
    {
      skip: true,
      variables: {
        query: "",
        page: 1,
        first: 100,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    },
    (data: any) => {
      setJobCategories(
        data.jobCategorys.data.map((category) => ({
          value: parseInt(category.id),
          label: category.name,
        })),
      );
    },
  );

  const { refetch: getAvailableDrivers } = useApolloQueryWithEffect(
    GET_AVAILABLE_DRIVERS_QUERY,
    {
      skip: true,
      variables: {
        query: "",
        page: 1,
        first: 500,
        orderByColumn: "id",
        orderByOrder: "ASC",
        available: true,
      },
      notifyOnNetworkStatusChange: true,
    },
    (data: any) => {
      const drivers = data.drivers.data;

      setDrivers(drivers);

      setDriverOptions(
        drivers.map((driver) => ({
          value: parseInt(driver.id),
          label: driver.full_name,
          data: driver,
        })),
      );
    },
  );

  const handleExport = () => {
    const header = outputDynamicTableHeader(dynamicTableUsers);
    const body = outputDynamicTableBody(
      dynamicTableUsers,
      tableColumn,
      selectedJobs,
    );
    downloadExcel({
      fileName: "react-export-table-to-excel.xls",
      sheet: "Delivery Jobs",
      tablePayload: {
        header,
        body: body,
      },
    });
  };
  const handleSortingChange = (sortBy: string | any[]) => {
    // console.log("handleSorting", sortBy);
    if (sortBy.length === 0) {
      setSorting({
        id: "id",
        direction: true,
      });
    } else {
      const [sort] = sortBy;
      const _newDirection = sort.desc ? "DESC" : "ASC";
      const newSorting = {
        id: sort.id,
        direction: sort.desc,
      };
      setSorting(newSorting);
    }
  };

  const handleStatusChange = (selectedOption: any) => {
    setSelectedStatus(selectedOption);
    setStatusFilter(selectedOption.value);
    setQueryPageIndex(0);

    // Update job status IDs filter based on selection
    let statusIds: number[] = [];
    if (selectedOption.value !== "all") {
      const option = statusOptions.find(
        (opt) => opt.value === selectedOption.value,
      );
      statusIds = option?.statusIds || [];
    }

    // Store the status IDs in state or update the existing filter
    const updatedJobFilter = {
      ...mainJobFilter,
      job_status_ids:
        statusIds.length > 0 ? statusIds : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    setMainJobFilter(updatedJobFilter);
  };

  // useEffect(() => {
  //   setIsTableLoading(loading);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [loading]);

  // useEffect(() => {
  //   if (isAdmin && !isCompanyAdmin) {
  //     refetchGroupedJobs(groupedVars);
  //   }
  //   // else if (isCompany || isCustomer || (isAdmin && isCompanyAdmin)) {
  //   //   getCompanyJobs();
  //   // }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [groupedVars, isAdmin, isCompany, isCustomer, isCompanyAdmin]);

  return (
    // <AdminLayout>
    <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
      <SimpleGrid
        mb="70px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <JobHeader
          isAdmin={isAdmin}
          isCompany={isCompany}
          onOpenSetting={onOpenSetting}
          onOpenFilter={onOpenFilter}
          isFilterTicked={is_filter_ticked}
          handleExport={handleExport}
          debouncedSearch={debouncedSearch}
          onToggleFilterCheckbox={(checked) => {
            if (!checked) {
              destroyCookie(null, "jobMainFilters", { path: "*" });
              destroyCookie(null, "displayName", { path: "*" });
              handleResetAll();
            }
            setCookie(null, "is_filter_ticked", checked ? "1" : "0", {
              maxAge: 30 * 24 * 60 * 60,
              path: "*",
            });
            dispatch(setIsFilterTicked(checked ? "1" : "0"));
          }}
        />

        <Flex alignItems="left" flexWrap={"wrap"}>
          {Object.keys(mainFilters).map((filterKey) => {
            if (mainFilters[filterKey]) {
              return (
                <Tag
                  key={filterKey}
                  size={"md"}
                  borderRadius="full"
                  variant="solid"
                  bg={"black.100"}
                  color={"black"}
                >
                  <TagLabel>
                    {mainFilterDisplayNames[filterKey as keyof SelectedFilter]
                      .label +
                      ":" +
                      mainFilterDisplayNames[filterKey as keyof SelectedFilter]
                        .value}
                  </TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      // Remove the filter when the tag is closed
                      const newSelectedFilters = { ...mainFilters };
                      delete newSelectedFilters[
                        filterKey as keyof SelectedFilter
                      ];
                      updateTags(newSelectedFilters, jobFilter);
                    }}
                  />
                </Tag>
              );
            }
            <Button
              // onClick={clearJobFilters}
              className="!h-[30px] ml-2"
              variant="smallGreySquare"
              bg={"none"}
              onClick={() => handleResetAll()}
            >
              Clear all
            </Button>;
          })}
        </Flex>
        {/* <JobFiltersTagRow
            mainFilters={mainFilters}
            mainFilterDisplayNames={mainFilterDisplayNames}
            onClearAll={handleResetAll}
            onRemoveFilter={(key) => {
              const newSelectedFilters = { ...mainFilters };
              delete newSelectedFilters[key];
              updateTags(newSelectedFilters, jobFilter);
            }}
          /> */}

        <JobStatusDateFilter
          statusOptions={statusOptions}
          onStatusChange={handleStatusChange}
          selectedStatus={selectedStatus}
          rangeDate={rangeDate}
          setRangeDate={setRangeDate}
          withMedia={withMedia}
          handleToggleWithMedia={handleToggleWithMedia}
          isMediaBusy={isMediaBusy}
        />

        {loadingGroupedJobs ? (
          // 🔄 Loading State
          <Box textAlign="center" py={4} px={10}>
            Loading <Spinner size="sm" ml={2} />
          </Box>
        ) : groupedJobs?.groupedPaginatedJobs?.data?.length > 0 ? (
          // 📊 Data Exists
          <JobPaginationTable
            columns={adminColumns}
            data={groupedJobs?.groupedPaginatedJobs?.data}
            total={groupedJobs?.groupedPaginatedJobs?.total}
            options={{
              manualSortBy: true,
              initialState: {
                pageIndex: queryPageIndex,
                pageSize: queryPageSize,
                sortBy: [
                  { id: sorting?.id, desc: sorting?.direction === "DESC" },
                ],
              },
              manualPagination: true,
              pageCount: groupedJobs?.groupedPaginatedJobs?.last_page ?? 0,
            }}
            setQueryPageIndex={setQueryPageIndex}
            setQueryPageSize={setQueryPageSize}
            isServerSide
            showPageSizeSelect
            showRowSelection
            setSelectedRow={setSelectedJobs}
            isFilterRowSelected={isShowSelectedOnly}
            isChecked={isChecked}
            onSortingChange={handleSortingChange}
            restyleTable
          />
        ) : (
          // 📭 No Data
          <Box textAlign="center" py={4} px={10} color="gray.600">
            No records found.
          </Box>
        )}
      </SimpleGrid>

      {/* Floating Action Bar */}
      {isAdmin && !loadingGroupedJobs && (
        <ActionBar
          selectedJobs={selectedJobs}
          onSwitch={setIsShowSelectedOnly}
          onClickBulkAssign={onOpenBulkAssign}
          onClickBulkSort={onOpenBulkSort}
        />
      )}
      <Suspense fallback={null}>
        {isOpenFilter && (
          <FilterJobsModal
            isOpen={isOpenFilter}
            onClose={onCloseFilter}
            // jobStatuses={jobStatuses}
            jobCategories={jobCategories}
            onFilterApply={(selectedFilters, filterDisplayName) => {
              // Update the tags
              updateTags(selectedFilters, jobFilter);
              console.log(selectedFilters, "selectedFilters");
              setMainFilterDisplayNames(filterDisplayName);
              setCookie(
                null,
                "displayName",
                JSON.stringify(filterDisplayName),
                {
                  maxAge: 30 * 24 * 60 * 60,
                  path: "*",
                },
              );
            }}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            jobFilter={jobFilter}
            setJobFilter={setJobFilter}
            filterDisplayNames={mainFilterDisplayNames}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {isOpenSetting && (
          <JobTableSettingsModal
            isOpen={isOpenSetting}
            onClose={() => {
              onCloseSetting();
              // setSettingOpen(false);
              getDynamicTableUsers();
              refetchGroupedJobs(); // Optional: Refresh job data
            }}
          />
        )}
      </Suspense>
      {/* <Suspense fallback={null}>
        {isOpenBulkAssign && (
          <JobBulkAssignModal
            isOpen={isOpenBulkAssign}
            onClose={onCloseBulkAssign}
            driverOptions={driverOptions}
            drivers={drivers}
            selectedJobs={selectedJobs}
            columns={bulkAssignColumns}
            setIsChecked={setIsChecked}
            setSelectedJobs={setSelectedJobs}
            refreshPage={() => refetchJobs()}
          />
        )}
      </Suspense> */}
      {/* <Suspense fallback={null}>
        {isOpenBulkSort && (
          <JobBulkSortModal
            isOpen={isOpenBulkSort}
            onClose={onCloseBulkSort}
            selectedJobs={selectedJobs}
            columns={bulkAssignColumns}
            setIsChecked={setIsChecked}
            setSelectedJobs={setSelectedJobs}
            refreshPage={() => refetchJobs()}
          />
        )}
      </Suspense> */}
    </Box>
    // </AdminLayout>
  );
}
