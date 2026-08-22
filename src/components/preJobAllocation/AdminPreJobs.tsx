"use client";
import {
  Box,
  SimpleGrid,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import ActionBar from "./ActionBar";
import {
  defaultSelectedFilter,
  filterDisplayNames,
  preDefaultJobFilter,
  SelectedFilter,
} from "./Filters";
import {
  getBulkAssignColumns,
  getColumnsPre,
} from "./JobTableColumns";
import JobPaginationTable from "../table/PreJobPaginationTable";
import { GET_AVAILABLE_DRIVERS_QUERY } from "../../graphql/driver";
import {
  DynamicTableUser,
  GET_DYNAMIC_TABLE_USERS_QUERY,
} from "../../graphql/dynamicTableUser";
import {
  PRE_ALLOCATION_JOBS_QUERY,
  PreAllocationPaginatedJobsData,
  GroupedPaginatedJobsVars,
} from "@/graphql/job";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import {
  cleanupLegacyFilterCookies,
  clearPersistedFilterState,
  readPersistedFilterState,
  writeDisplayName,
  writeIsTicked,
  writeMainFilter,
  writeSelectedValues,
} from "./jobFilterCookies";
import { RemoveDriverProvider } from "./RemoveDriverContext";
import { useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsPreFilterTicked,
  setPreJobFilters,
  setPreJobMainFilters,
} from "@/lib/store/preJobFilterSlice";
import { RootState } from "@/lib/store/store";
import JobHeader from "@/components/preJobAllocation/JobHeader";
import { useSubscriptionService } from "@/hooks/useSubscriptionService";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import JobTableSettingsModal from "./JobTableSettingsModal";
import JobFiltersTagRow from "./JobFiltersTagRow";

const JobStatusDateFilter = dynamic(
  () => import("./JobStatusDateFilter"),
  { ssr: false },
);

const JobContextMenu = React.lazy(() => import("./JobContextMenu"));
const FilterJobsModal = React.lazy(() => import("./FilterJobsModal"));
const PreAllocateModal = React.lazy(() => import("./PreAllocateModal"));
const AssignJobsModal = React.lazy(() => import("./AssignJobsModal"));


function formatDate(date: Date, isStart: boolean): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const time = isStart ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day} ${time}`;
}

const PRE_ALLOCATION_PRESETS: Record<string, {
  states?: string[];
  has_job_category_ids?: string[];
}> = {
  vic: { states: ["Victoria"] },
  qld: { states: ["Queensland"] },
  "qld-nsw": { states: ["Queensland", "New South Wales"] },
  nsw: { states: ["New South Wales"] },
  road: { has_job_category_ids: ["4"] },
  fcl: { has_job_category_ids: ["5"] },
  all: {},
};

const STATE_LABELS: Record<string, string> = {
  "Victoria": "VIC",
  "Queensland": "QLD",
  "New South Wales": "NSW",
  "Western Australia": "WA",
  "South Australia": "SA",
  "Tasmania": "TAS",
};

export default function JobIndex({ }: {}) {
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const today = new Date();
  const [rangeDate, setRangeDate] = useState<[Date, Date]>([today, today]);
  const [_isTableLoading, _setIsTableLoading] = useState(false);

  const {
    isAdmin,
    userId,
  } = useSelector((state: RootState) => state.user);

  const { is_filter_ticked } = useSelector((state: RootState) => state.preJobFilter);

  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [withMedia, setWithMedia] = useState(false);
  const [isMediaBusy, setIsMediaBusy] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverOptions, setDriverOptions] = useState([]);
  const [dynamicTableUsers, setDynamicTableUsers] = useState<DynamicTableUser[]>([]);
  const [isShowSelectedOnly, setIsShowSelectedOnly] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [jobFilter, setJobFilter] = useState(preDefaultJobFilter);
  const [mainJobFilter, setMainJobFilter] = useState(null);
  const [mainFilters, setMainFilters] = useState<any>(defaultSelectedFilter);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilter>(defaultSelectedFilter);
  const [mainFilterDisplayNames, setMainFilterDisplayNames] =
    useState<typeof filterDisplayNames>(filterDisplayNames);
  const [sorting, setSorting] = useState<any>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignDriver, setAssignDriver] = useState(null);

  const [contextMenu, setContextMenu] = React.useState<{
    visible: boolean;
    x: number;
    y: number;
    job: any;
  }>({
    visible: false,
    x: 0,
    y: 0,
    job: null,
  });

  useEffect(() => {
    import("./FilterJobsModal");
    import("./PreAllocateModal");
    import("./AssignJobsModal");
    import("./JobContextMenu");
  }, []);

  useEffect(() => {
    cleanupLegacyFilterCookies();
  }, []);

  const handleToggleWithMedia = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsMediaBusy(true);
      setWithMedia(checked);
    },
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { refetch: getDynamicTableUsers, data: _dynamicTableData } =
    useApolloQueryWithEffect(GET_DYNAMIC_TABLE_USERS_QUERY, {
      variables: {
        query: "",
        page: 1,
        first: 100,
        orderByColumn: "sort_id",
        orderByOrder: "ASC",
        user_id: userId,
        table_name: "pre-allocation-jobs",
      },
      skip: !userId,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        const d = data as any;
        const activeJobsOnly = d.dynamicTableUsers.data
          .filter((item: DynamicTableUser) => item.is_active === true)
          .sort((a: DynamicTableUser, b: DynamicTableUser) => a.sort_id - b.sort_id);
        setDynamicTableUsers(activeJobsOnly);
      },
    });

  const groupedVars = useMemo(() => {
    const base = {
      page: queryPageIndex + 1,
      per_page: queryPageSize,
      query: searchQuery || "",
      between_at: rangeDate?.[0]
        ? {
          from_at: formatDate(rangeDate[0], true),
          to_at: formatDate(rangeDate[1], false),
        }
        : undefined,
      sort_by: sorting?.field || null,
      sort_order: sorting?.order || null,
    };

    return is_filter_ticked === "1"
      ? { ...base, ...(mainJobFilter ?? {}) }
      : base;
  }, [
    queryPageIndex,
    queryPageSize,
    searchQuery,
    mainJobFilter,
    rangeDate,
    sorting,
    is_filter_ticked,
  ]);

  const {
    data: groupedJobs,
    loading: loadingGroupedJobs,
    refetch: refetchGroupedJobs,
  } = useApolloQueryWithEffect<PreAllocationPaginatedJobsData, GroupedPaginatedJobsVars>(
    PRE_ALLOCATION_JOBS_QUERY,
    {
      variables: groupedVars,
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        console.log("groupedjob oncompleted res", data);
      },
    },
  );

  const debouncedRefetch = useMemo(
    () => debounce(() => refetchGroupedJobs(), 3000 + Math.random() * 2000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchGroupedJobs],
  );
  useEffect(() => () => debouncedRefetch.cancel(), [debouncedRefetch]);

  useSubscriptionService({
    jobUpdated: {
      channel: "jobs",
      event: ".job.updated",
      callback: () => debouncedRefetch(),
    },
  });

  const refetchGroupedJobsRef = useRef(refetchGroupedJobs);
  useEffect(() => {
    refetchGroupedJobsRef.current = refetchGroupedJobs;
  });
  const stableRefetchGroupedJobs = React.useCallback(
    (...args: any[]) => refetchGroupedJobsRef.current(...args),
    [],
  );

  const adminColumns = useMemo(() => {
    return getColumnsPre(withMedia, stableRefetchGroupedJobs, dynamicTableUsers);
  }, [withMedia, stableRefetchGroupedJobs, dynamicTableUsers]);

  useEffect(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setIsMediaBusy(false);
      hideTimerRef.current = null;
    }, 2000);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [adminColumns]);

  const bulkAssignColumns = useMemo(
    () => getBulkAssignColumns(dynamicTableUsers),
    [dynamicTableUsers],
  );

  useEffect(() => {
    const hasPreAllocationJobs = groupedJobs?.preAllocationJobs?.data?.length > 0;
    if (isAdmin && hasPreAllocationJobs) {
      getAvailableDrivers();
      getDynamicTableUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedJobs?.preAllocationJobs?.data?.length]);

  useEffect(() => {
    const persisted = readPersistedFilterState(preDefaultJobFilter);
    if (persisted.is_filter_ticked !== "1") return;

    const hasPersistedFilterValue =
      persisted.jobMainFilters &&
      Object.values(persisted.jobMainFilters).some((v) =>
        Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "",
      );
    if (!hasPersistedFilterValue) return;

    const updatedValues: any = {};
    for (const key in defaultSelectedFilter) {
      if (
        persisted.filters[key as keyof SelectedFilter] !== undefined &&
        persisted.filters[key as keyof SelectedFilter] !== "undefined" &&
        persisted.filters[key as keyof SelectedFilter] !== ""
      ) {
        updatedValues[key] = persisted.filters[key as keyof SelectedFilter];
      }
    }
    setJobFilter(persisted.jobMainFilters);
    if (persisted.displayName) setMainFilterDisplayNames(persisted.displayName);
    dispatch(setIsPreFilterTicked("1"));
    updateTags(updatedValues, persisted.jobMainFilters, persisted.displayName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetAll = () => {
    updateTags({ ...defaultSelectedFilter }, preDefaultJobFilter);
  };

  const updateTags = (
    updatedValues: SelectedFilter,
    jobFilter: any,
    displayNames?: any,
  ) => {
    const updatedJobFilter = { ...jobFilter };
    for (const key in defaultSelectedFilter) {
      if (
        updatedValues[key as keyof SelectedFilter] == undefined ||
        updatedValues[key as keyof SelectedFilter] == null ||
        updatedValues[key as keyof SelectedFilter].length == 0
      ) {
        delete updatedJobFilter[key as keyof SelectedFilter];
      }
      dispatch(setPreJobFilters({ key: key, value: updatedValues[key as keyof SelectedFilter] }));
    }
    writeSelectedValues(updatedValues);
    writeMainFilter(updatedJobFilter);
    dispatch(setPreJobMainFilters(updatedJobFilter));
    setJobFilter(updatedJobFilter);
    setMainJobFilter(updatedJobFilter);
    setSelectedFilters(updatedValues);
    setMainFilters(updatedValues);
    if (displayNames) {
      setMainFilterDisplayNames(displayNames);
    }
  };

  const {
    isOpen: isOpenFilter,
    onOpen: onOpenFilter,
    onClose: onCloseFilter,
  } = useDisclosure();

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const preset = PRE_ALLOCATION_PRESETS[id];
    if (!preset) return;

    if (!preset.states && !preset.has_job_category_ids) {
      handleResetAll();
      writeIsTicked(false);
      dispatch(setIsPreFilterTicked("0"));
      return;
    }

    const updatedValues: any = { ...defaultSelectedFilter };
    const jobFilterUpdate: any = { ...preDefaultJobFilter };

    if (preset.states) {
      updatedValues.states = preset.states.map((s) => ({ value: s, label: STATE_LABELS[s] ?? s }));
      jobFilterUpdate.states = preset.states;
    }
    if (preset.has_job_category_ids) {
      updatedValues.has_job_category_ids = preset.has_job_category_ids.map((c) => ({
        value: c,
        label: c,
      }));
      jobFilterUpdate.has_job_category_ids = preset.has_job_category_ids;
    }

    updateTags(updatedValues, jobFilterUpdate);
    writeIsTicked(true);
    dispatch(setIsPreFilterTicked("1"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    getAvailableDrivers();
  }, []);

  const {
    isOpen: isOpenSetting,
    onOpen: onOpenSetting,
    onClose: onCloseSetting,
  } = useDisclosure();

  const {
    isOpen: isOpenBulkAssign,
    onOpen: onOpenBulkAssign,
    onClose: onCloseBulkAssign,
  } = useDisclosure();

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { refetch: getAvailableDrivers } = useApolloQueryWithEffect(
    GET_AVAILABLE_DRIVERS_QUERY,
    {
      variables: {
        query: "",
        page: 1,
        first: 500,
        orderByColumn: "id",
        orderByOrder: "ASC",
        available: true,
      },
      notifyOnNetworkStatusChange: true,
      onCompleted: (data: any) => {
        setDriverOptions([]);
        const drivers = data.drivers.data;
        setDriverOptions(
          drivers.map((driver: any) => ({
            value: parseInt(driver.id),
            label: driver.full_name,
            data: driver,
          })),
        );
      },
    },
  );

  const handleSortingChange = (sortBy: string | any[]) => {
    if (sortBy.length === 0) {
      setSorting(null);
    } else {
      const [sort] = sortBy;
      let field = sort.id;
      if (sort.id === "name") {
        field = "delivery_id";
      } else if (sort.id === "suburb_area,area_color") {
        field = "suburb_area";
      }
      setSorting({ field: field, order: sort.desc ? "DESC" : "ASC" });
    }
  };

  const handleDriverChange = (selectedOption: any) => {
    setSelectedDriver(selectedOption);
  };

  const openAssignModal = (driver: any) => {
    if (!driver) return;
    setAssignDriver(driver);
    setIsAssignOpen(true);
  };



  const handleContextMenu = (e: React.MouseEvent, job: any) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, job: job });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, job: null });
  };

  return (
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
          onOpenSetting={onOpenSetting}
          onOpenFilter={onOpenFilter}
          isFilterTicked={is_filter_ticked}
          debouncedSearch={debouncedSearch}
          onToggleFilterCheckbox={(checked) => {
            if (!checked) {
              clearPersistedFilterState();
              setMainJobFilter(null);
              setJobFilter(preDefaultJobFilter);
              setMainFilters({ ...defaultSelectedFilter });
              setSelectedFilters({ ...defaultSelectedFilter });
              setMainFilterDisplayNames(filterDisplayNames);
            }
            writeIsTicked(checked);
            dispatch(setIsPreFilterTicked(checked ? "1" : "0"));
          }}
        />

        {/* <Flex alignItems="left" flexWrap={"wrap"}>
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
                    {mainFilterDisplayNames[filterKey as keyof SelectedFilter].label +
                      ":" +
                      mainFilterDisplayNames[filterKey as keyof SelectedFilter].value}
                  </TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      const newSelectedFilters = { ...mainFilters };
                      delete newSelectedFilters[filterKey as keyof SelectedFilter];
                      updateTags(newSelectedFilters, jobFilter);
                    }}
                  />
                </Tag>
              );
            }
          })}
        </Flex> */}

        <JobFiltersTagRow
          mainFilters={mainFilters}
          mainFilterDisplayNames={mainFilterDisplayNames}
          onClearAll={handleResetAll}
          onRemoveFilter={(key) => {
            const newSelectedFilters = { ...mainFilters };
            delete newSelectedFilters[key];
            updateTags(newSelectedFilters, jobFilter);
          }}
        />

        <JobStatusDateFilter
          columns={bulkAssignColumns}
          driverOptions={driverOptions}
          onDriverChange={handleDriverChange}
          selectedDriver={selectedDriver}
          selectedJobs={selectedJobs}
          rangeDate={rangeDate}
          setRangeDate={setRangeDate}
          withMedia={withMedia}
          handleToggleWithMedia={handleToggleWithMedia}
          isMediaBusy={isMediaBusy}
        />

        {loadingGroupedJobs ? (
          <Box textAlign="center" py={4} px={10}>
            Loading <Spinner size="sm" ml={2} />
          </Box>
        ) : groupedJobs?.preAllocationJobs?.data?.length > 0 ? (
          <RemoveDriverProvider refetch={refetchGroupedJobs}>
            <JobPaginationTable
              columns={adminColumns}
              data={groupedJobs?.preAllocationJobs?.data}
              total={groupedJobs?.preAllocationJobs?.total}
              options={{
                manualSortBy: true,
                initialState: {
                  pageIndex: queryPageIndex,
                  pageSize: queryPageSize,
                  sortBy: [{ id: sorting?.id, desc: sorting?.direction === "DESC" }],
                },
                manualPagination: true,
                pageCount: groupedJobs?.preAllocationJobs?.last_page ?? 0,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              showPageSizeSelect
              showRowSelection
              setSelectedRow={setSelectedJobs}
              isFilterRowSelected={isShowSelectedOnly}
              isChecked={isChecked}
              showManualPages
              onSortingChange={handleSortingChange}
              onAssignClick={openAssignModal}
              restyleTable
              refetchJobs={refetchGroupedJobs}
              onContextMenu={handleContextMenu}
            />
          </RemoveDriverProvider>
        ) : (
          <Box textAlign="center" py={4} px={10} color="gray.600">
            No records found.
          </Box>
        )}

        {/* ✅ Suspense only for React.lazy components */}
        {contextMenu.visible && contextMenu.job && (
          <Suspense fallback={null}>
            <JobContextMenu
              job={contextMenu.job}
              position={{ x: contextMenu.x, y: contextMenu.y }}
              onClose={closeContextMenu}
              drivers={driverOptions}
            />
          </Suspense>
        )}
      </SimpleGrid>

      {/* ✅ ActionBar - normal import, NO Suspense needed */}
      {isAdmin && !loadingGroupedJobs && (
        <ActionBar
          {...({
            selectedDriver: selectedDriver,
            selectedJobs: selectedJobs,
            onSwitch: setIsShowSelectedOnly,
            onSaveChanges: onOpenBulkAssign,
          } as any)}
        />
      )}

      {/* ✅ JobTableSettingsModal - normal import, NO Suspense needed */}
      <JobTableSettingsModal
        isOpen={isOpenSetting}
        onClose={() => {
          onCloseSetting();
          getDynamicTableUsers();
          refetchGroupedJobs();
        }}
      />

      {/* ✅ Suspense only for React.lazy components */}
      {isOpenFilter && (
        <Suspense fallback={null}>
          <FilterJobsModal
            isOpen={isOpenFilter}
            onClose={onCloseFilter}
            onFilterApply={(selectedFilters, filterDisplayName) => {
              updateTags(selectedFilters, jobFilter);
              setMainFilterDisplayNames(filterDisplayName);
              writeDisplayName(filterDisplayName);
              writeIsTicked(true);
              dispatch(setIsPreFilterTicked("1"));
            }}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            jobFilter={jobFilter}
            setJobFilter={setJobFilter}
            filterDisplayNames={mainFilterDisplayNames}
          />
        </Suspense>
      )}

      {isOpenBulkAssign && (
        <Suspense fallback={null}>
          <PreAllocateModal
            isOpen={isOpenBulkAssign}
            onClose={() => onCloseBulkAssign()}
            selectedDriver={selectedDriver}
            selectedJobs={selectedJobs}
            columns={bulkAssignColumns}
            setIsChecked={setIsChecked}
            setSelectedJobs={setSelectedJobs}
            refreshPage={() => {
              setSelectedJobs([]);
              setSelectedDriver(null);
              setIsChecked(false);
              setTimeout(() => setIsChecked(true), 0);
            }}
          />
        </Suspense>
      )}

      {isAssignOpen && (
        <Suspense fallback={null}>
          <AssignJobsModal
            isOpen={isAssignOpen}
            onClose={() => {
              setAssignDriver(null);
              setIsAssignOpen(false);
              setIsChecked(false);
              setSelectedJobs([]);
            }}
            driver={assignDriver}
            columns={bulkAssignColumns}
            rangeDate={rangeDate}
            setSelectedJobs={setSelectedJobs}
            setIsChecked={setIsChecked}
          />
        </Suspense>
      )}
    </Box>
  );
}