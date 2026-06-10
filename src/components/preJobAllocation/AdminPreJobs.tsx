"use client";
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  // Text,
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
  // tableColumn,
} from "./JobTableColumns";
import JobPaginationTable from "../table/PreJobPaginationTable";
// import PaginationTableCustomer from "components/table/PaginationTableCustomer";
import { GET_AVAILABLE_DRIVERS_QUERY } from "../../graphql/driver";
import {
  DynamicTableUser,
  GET_DYNAMIC_TABLE_USERS_QUERY,
} from "../../graphql/dynamicTableUser";
// import { GET_JOBS_QUERY, Job } from "graphql/job";
import {
  // GET_JOBS_QUERY,
  PRE_ALLOCATION_JOBS_QUERY,
  PreAllocationPaginatedJobsData,
  GroupedPaginatedJobsVars,
  CREATE_DRIVER_FREE_TEXT,
  UPDATE_DRIVER_FREE_TEXT,

} from "@/graphql/job";
import {
  getLocalYMD,
  // outputDynamicTableBody,
  // outputDynamicTableHeader,
} from "@/lib/helpers/helper";
// import AdminLayout from "layouts/admin";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { destroyCookie, setCookie } from "nookies";
import React, {
  // Suspense,
  // useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { downloadExcel } from "react-export-table-to-excel";
// import { FaFileExcel } from "react-icons/fa";
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
// "./job-components/JobHeader";

const JobStatusDateFilter = dynamic(
  () => import("./JobStatusDateFilter"),
  {
    ssr: false,
  },
);
const JobContextMenu = React.lazy(
  () => import("./JobContextMenu"),
);
const FilterJobsModal = React.lazy(
  () => import("./FilterJobsModal"),
);
const PreAllocateModal = React.lazy(
  () => import("./PreAllocateModal"),
);
const AssignJobsModal = React.lazy(
  () => import("./AssignJobsModal"),
);

import JobTableSettingsModal from "./JobTableSettingsModal";



function formatDate(date: Date, isStart: boolean): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const time = isStart ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day} ${time}`;
}

// export default function JobIndex() {
export default function JobIndex({ }: // initialLoadOnly = false,
  {
    // initialLoadOnly?: boolean;
  }) {
  // const [hasInitialLoadDone, setHasInitialLoadDone] = useState(!initialLoadOnly);
  // const [initialJobsData, setInitialJobsData] = useState<any[]>([]);
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(100);

  const [searchQuery, setSearchQuery] = useState("");
  // const [sorting, setSorting] = useState<any>({ id: "id", direction: true });
  // const [_statusFilter, setStatusFilter] = useState("all");
  const today = new Date();
  const [rangeDate, setRangeDate] = useState<[Date, Date]>([today, today]);
  const [_isTableLoading, _setIsTableLoading] = useState(false);
  const {
    isAdmin,
    // companyId,
    // customerId,
    // isCompany,
    // isCompanyAdmin,
    isCustomer,
    userId,
  } = useSelector((state: RootState) => state.user);


  const { filters, displayName, jobMainFilters, is_filter_ticked } =
    useSelector((state: RootState) => state.jobFilter);
  // const _cookies = parseCookies();
  const dispatch = useDispatch();
  const [withMedia, setWithMedia] = useState(false);
  const [isMediaBusy, setIsMediaBusy] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  // const [drivers, setDrivers] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  const [dynamicTableUsers, setDynamicTableUsers] = useState<
    DynamicTableUser[]
  >([]);
  const [isShowSelectedOnly, setIsShowSelectedOnly] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [jobFilter, setJobFilter] = useState(preDefaultJobFilter);
  const [mainJobFilter, setMainJobFilter] = useState(null);
  const [mainFilters, setMainFilters] = useState<any>(defaultSelectedFilter);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilter>(
    defaultSelectedFilter,
  );
  const [mainFilterDisplayNames, setMainFilterDisplayNames] =
    useState<typeof filterDisplayNames>(filterDisplayNames);
  // const [companyColumns, setCompanyColumns] = useState([]); // State for company columns

  const [freeTextValue, setFreeTextValue] = React.useState("");
  const [editingDriverId, setEditingDriverId] = React.useState<number | null>(
    null,
  );
  const [savingDriverId, setSavingDriverId] = React.useState<number | null>(
    null,
  );

  const [sorting, setSorting] = useState<any>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignDriver, setAssignDriver] = useState(null);
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
          .filter(
            (item: DynamicTableUser) =>
              item.is_active === true
            // &&
            // item.dynamic_table?.table_name === "pre-allocation-jobs",
          )
          .sort(
            (a: DynamicTableUser, b: DynamicTableUser) =>
              a.sort_id - b.sort_id,
          );

        setDynamicTableUsers(activeJobsOnly);
      },
    });

  const groupedVars = useMemo(() => {
    const base = {
      page: queryPageIndex + 1,
      per_page: queryPageSize,
      query: searchQuery || "",
      // job_status_ids: mainJobFilter?.job_status_ids || [
      //   1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      // ],
      // company_id: isCompany ? parseInt(companyId) : undefined,
      // customer_id:
      //   isCustomer && !isCompanyAdmin ? parseInt(customerId) : undefined,
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
  } = useApolloQueryWithEffect<
    PreAllocationPaginatedJobsData,
    GroupedPaginatedJobsVars
  >(
    PRE_ALLOCATION_JOBS_QUERY,
    {
      variables: groupedVars,

      // skip: !userId || isCompanyAdmin || isCustomer || isCompany,
      fetchPolicy: "network-only",

      onCompleted: (data) => {
        console.log("groupedjob oncompleted res", data);
      },
    },
  );

  // const refetchJobsRef = useRef(refetchGroupedJobs);
  // useEffect(() => {
  //   console.log("called refetch");
  //   refetchJobsRef.current = refetchGroupedJobs;
  // }, [refetchGroupedJobs]);

  // const stableRefetch = useCallback(
  //   (...args: any[]) => refetchJobsRef.current(...args),
  //   [],
  // );

  useSubscriptionService({
    jobUpdated: {
      channel: "jobs",
      event: ".job.updated",
      callback: () => refetchGroupedJobs,
    },
  });

  // Then use stableRefetch in adminColumns useMemo
  const adminColumns = useMemo(() => {
    return getColumnsPre(
      isAdmin,
      withMedia,
      refetchGroupedJobs,
      dynamicTableUsers,
    );
  }, [isAdmin, withMedia, refetchGroupedJobs, dynamicTableUsers]);

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

  useEffect(() => {
    const hasPreAllocationJobs = groupedJobs?.preAllocationJobs?.data?.length > 0;

    if (isAdmin && hasPreAllocationJobs) {
      getAvailableDrivers();
      getDynamicTableUsers();
    }
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [groupedJobs?.preAllocationJobs?.data?.length])

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
    displayNames?: any
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

        // setDrivers(drivers);

        //console.log(drivers, "k");

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

      // Map column id to backend field name
      let field = sort.id;
      if (sort.id === "name") {
        field = "delivery_id";
      } else if (sort.id === "suburb_area,area_color") {
        field = "suburb_area";
      }

      setSorting({
        field: field,
        order: sort.desc ? "DESC" : "ASC",
      });
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

        return (
          preallocId === driverId &&
          !item?.job?.driver
        );
      })
      .map((item: any) => ({
        id: item.job.id,
        original: {
          job: item.job,
        },
      }));

    console.log("Filtered driverJobs:", driverJobs);

    setSelectedJobs(driverJobs);
    setIsAssignOpen(true);
  };


  const handleUpdateDriverFreeText = async (driver: any, value: string) => {
    // if (!driver?.id) {
    //   console.error("Driver ID missing!", driver);
    //   return;
    // }

    try {
      if (driver?.today_free_text?.id) {
        // 🔹 UPDATE existing freetext
        await updateDriverFreeText({
          variables: {
            input: {
              id: Number(driver?.today_free_text?.id),
              text: value,
            },
          },
        });
      } else {
        // 🔹 CREATE new freetext
        await createDriverFreeText({
          variables: {
            input: {
              driver_id: Number(driver.id),
              date: getLocalYMD(), // only if your API still requires date
              text: value,
            },
          },
        });
      }

      await refetchGroupedJobs();
    } catch (err) {
      console.error("Failed to save driver note", err);
    }
  };

  // const [updateDriverFreeTextMutation] = useMutation(UPDATE_DRIVER_FREE_TEXT);
  const [createDriverFreeText] = useMutation(CREATE_DRIVER_FREE_TEXT);
  const [updateDriverFreeText] = useMutation(UPDATE_DRIVER_FREE_TEXT);

  // ✅ ADD: Context menu state
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

  // ✅ ADD: Handle right click
  // ✅ Handle context menu open
  const handleContextMenu = (e: React.MouseEvent, job: any) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      job: job,
    });
  };

  // ✅ ADD: Close context menu
  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      job: null,
    });
  };

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
          // isCompany={isCompany}
          onOpenSetting={onOpenSetting}
          onOpenFilter={onOpenFilter}
          isFilterTicked={is_filter_ticked}
          // handleExport={handleExport}
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
          // 🔄 Loading State
          <Box textAlign="center" py={4} px={10}>
            Loading <Spinner size="sm" ml={2} />
          </Box>
        ) : groupedJobs?.preAllocationJobs?.data?.length > 0 ? (
          // 📊 Data Exists
          <JobPaginationTable
            columns={adminColumns}
            data={groupedJobs?.preAllocationJobs?.data}
            total={groupedJobs?.preAllocationJobs?.total}
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
            editingDriverId={editingDriverId}
            setEditingDriverId={setEditingDriverId}
            onAssignClick={openAssignModal}
            restyleTable
            refetchJobs={refetchGroupedJobs}
            onContextMenu={handleContextMenu}
          // freeTextValue={freeTextValue}
          // setFreeTextValue={setFreeTextValue}
          // savingDriverId={savingDriverId}
          // setSavingDriverId={setSavingDriverId}
          // onUpdateDriverFreeText={(driver, value) => {
          //   console.log(driver, "driver", value, "value");
          //   return handleUpdateDriverFreeText(driver, value);
          // }}
          />
        ) : (
          // 📭 No Data
          <Box textAlign="center" py={4} px={10} color="gray.600">
            No records found.
          </Box>
        )}

        {contextMenu.visible && contextMenu.job && (
          <JobContextMenu
            job={contextMenu.job}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            onClose={closeContextMenu}
            // onSave={handleSaveTagsLabels}
            drivers={driverOptions}
          />
        )}

      </SimpleGrid>



      {/* Floating Action Bar */}
      {isAdmin && !loadingGroupedJobs && (
        <ActionBar
          {...({
            selectedDriver: selectedDriver,
            selectedJobs: selectedJobs,
            onSwitch: setIsShowSelectedOnly,
            // hasChanges: hasChanges, // enable Save button
            onSaveChanges: onOpenBulkAssign,
            // onClickBulkSort: onOpenBulkSort,
          } as any)}
        />
      )}
      {/* <Suspense fallback={null}> */}
      {isOpenFilter && (
        <FilterJobsModal
          isOpen={isOpenFilter}
          onClose={onCloseFilter}
          // jobStatuses={jobStatuses}
          // jobCategories={jobCategories}
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
      {/* </Suspense> */}
      {/* <Suspense fallback={null}> */}
      {/* {isOpenSetting && ( */}
      <JobTableSettingsModal
        isOpen={isOpenSetting}
        onClose={() => {
          onCloseSetting();
          // setSettingOpen(false);
          getDynamicTableUsers();
          refetchGroupedJobs(); // Optional: Refresh job data
        }}
      />
      {/* )} */}
      {/* </Suspense> */}
      {/* <Suspense fallback={null}> */}
      {isOpenBulkAssign && (
        <PreAllocateModal
          isOpen={isOpenBulkAssign}
          onClose={() => {
            onCloseBulkAssign();
          }}
          selectedDriver={selectedDriver}
          selectedJobs={selectedJobs}
          columns={bulkAssignColumns}
          setIsChecked={setIsChecked}
          setSelectedJobs={setSelectedJobs}
          refreshPage={() => {
            // refetchJobs();
            setSelectedJobs([]);
            setSelectedDriver(null);
            setIsChecked(false);
            setTimeout(() => setIsChecked(true), 0);
          }}
        />
      )}
      {/* </Suspense> */}
      {isAssignOpen && (
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
        // refreshPage={refetchJobs}
        />
      )}
      {/* <Suspense fallback={null}>
      </Suspense> */}
    </Box>
    // </AdminLayout>
  );
}
