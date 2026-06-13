"use client";
// import { useMutation } from "@apollo/client/react";
import {
  Box,
  // Flex,
  SimpleGrid,
  Spinner,
  // Tag,
  // TagCloseButton,
  // TagLabel,
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
  // CREATE_DRIVER_FREE_TEXT,
  // UPDATE_DRIVER_FREE_TEXT,
} from "@/graphql/job";
// import { getLocalYMD } from "@/lib/helpers/helper";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { destroyCookie, setCookie } from "nookies";
import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsFilterTicked,
  setJobFilters,
  setJobMainFilters,
} from "@/lib/store/jobFilterSlice";
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

export default function JobIndex({ }: {}) {
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const today = new Date();
  const [rangeDate, setRangeDate] = useState<[Date, Date]>([today, today]);
  const [_isTableLoading, _setIsTableLoading] = useState(false);

  const {
    isAdmin,
    isCustomer,
    userId,
  } = useSelector((state: RootState) => state.user);

  const { filters, displayName, jobMainFilters, is_filter_ticked } =
    useSelector((state: RootState) => state.jobFilter);

  const dispatch = useDispatch();
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
  // const [freeTextValue, setFreeTextValue] = React.useState("");
  // const [editingDriverId, setEditingDriverId] = React.useState<number | null>(null);
  // const [savingDriverId, setSavingDriverId] = React.useState<number | null>(null);
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

  // ✅ Preload lazy components on mount — 1st click delay 
  useEffect(() => {
    import("./FilterJobsModal");
    import("./PreAllocateModal");
    import("./AssignJobsModal");
    import("./JobContextMenu");
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

  useSubscriptionService({
    jobUpdated: {
      channel: "jobs",
      event: ".job.updated",
      callback: () => refetchGroupedJobs,
    },
  });

  const adminColumns = useMemo(() => {
    return getColumnsPre(isAdmin, withMedia, refetchGroupedJobs, dynamicTableUsers);
  }, [isAdmin, withMedia, refetchGroupedJobs, dynamicTableUsers]);

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

  const bulkAssignColumns = getBulkAssignColumns(isAdmin, isCustomer, dynamicTableUsers);

  useEffect(() => {
    const hasPreAllocationJobs = groupedJobs?.preAllocationJobs?.data?.length > 0;
    if (isAdmin && hasPreAllocationJobs) {
      getAvailableDrivers();
      getDynamicTableUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedJobs?.preAllocationJobs?.data?.length]);

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
      setCookie(
        null,
        `jobFilters_${key}`,
        JSON.stringify(updatedValues[key as keyof SelectedFilter]),
        { maxAge: 30 * 24 * 60 * 60, path: "*" },
      );
      dispatch(setJobFilters({ key: key, value: updatedValues[key as keyof SelectedFilter] }));
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
    const jobs = groupedJobs?.preAllocationJobs?.data || [];
    const driverJobs = jobs
      .filter((item: any) => {
        const preallocId = Number(item?.job?.preallocation_driver_id);
        const driverId = Number(driver?.id);
        return preallocId === driverId && !item?.job?.driver;
      })
      .map((item: any) => ({
        id: item.job.id,
        original: { job: item.job },
      }));
    setSelectedJobs(driverJobs);
    setIsAssignOpen(true);
  };

  // const handleUpdateDriverFreeText = async (driver: any, value: string) => {
  //   try {
  //     if (driver?.today_free_text?.id) {
  //       await updateDriverFreeText({
  //         variables: {
  //           input: {
  //             id: Number(driver?.today_free_text?.id),
  //             text: value,
  //           },
  //         },
  //       });
  //     } else {
  //       await createDriverFreeText({
  //         variables: {
  //           input: {
  //             driver_id: Number(driver.id),
  //             date: getLocalYMD(),
  //             text: value,
  //           },
  //         },
  //       });
  //     }
  //     await refetchGroupedJobs();
  //   } catch (err) {
  //     console.error("Failed to save driver note", err);
  //   }
  // };

  // const [createDriverFreeText] = useMutation(CREATE_DRIVER_FREE_TEXT);
  // const [updateDriverFreeText] = useMutation(UPDATE_DRIVER_FREE_TEXT);

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
            // editingDriverId={editingDriverId}
            // setEditingDriverId={setEditingDriverId}
            onAssignClick={openAssignModal}
            restyleTable
            refetchJobs={refetchGroupedJobs}
            onContextMenu={handleContextMenu}
          />
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
              setCookie(null, "displayName", JSON.stringify(filterDisplayName), {
                maxAge: 30 * 24 * 60 * 60,
                path: "*",
              });
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
            selectedJobs={selectedJobs}
            setSelectedJobs={setSelectedJobs}
            setIsChecked={setIsChecked}
          />
        </Suspense>
      )}
    </Box>
  );
}