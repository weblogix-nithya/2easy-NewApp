"use client";
import {
  Box,
  Button,
  Flex,
  Image,
  Link,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { TabsComponent } from "@/components/tabs/TabsComponet";
import {
  GET_LIST_DRIVERS_QUERY,
  VehicleClassesResponse,
} from "@/graphql/driver";
import { GET_VEHICLE_CLASSES_QUERY } from "@/graphql/vehicleClass";
import { GET_VEHICLE_TYPES_QUERY } from "@/graphql/vehicleType";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

type Driver = {
  id: string;
  full_name: string;
  media_url?: string;
  license_state?: string;
  vehicle_type?: { name?: string };
  vehicle_class?: { name?: string };
};

type PaginatorInfo = {
  total: number;
  currentPage?: number;
  lastPage?: number;
};

type DriversResponse = {
  listOfDrivers: {
    data: Driver[];
    paginatorInfo: PaginatorInfo;
  };
};

// ── static filter options ────────────────────────────────────────────────────
const stateOptions = [
  { value: "QLD", label: "QLD" },
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
];

const yesNoOptions = [
  { value: "1", label: "Yes" },
  { value: "0", label: "No" },
];

// value carries min/max so we can split it before sending to the API
const maxLoadCapacityOptions = [
  { value: "0-500", label: "Small (≤ 500kg)", min: 0, max: 500 },
  { value: "500-2000", label: "Medium (500kg–2T)", min: 500, max: 2000 },
  { value: "2000+", label: "Heavy (2T+)", min: 2000, max: null },
];

const availabilityOptions = [
  { value: "1", label: "1 day/week" },
  { value: "3", label: "3 days/week" },
  { value: "5", label: "5 days/week" },
  { value: "7", label: "7 days/week" },
];

export default function DriverIndex() {
  let menuBg = useColorModeValue("white", "navy.800");
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [driverStatusId, setDriverStatusId] = useState(1);

  // ── filter state ───────────────────────────────────────────────────────────
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [vehicleClassFilter, setVehicleClassFilter] = useState<number | null>(null);
  const [truckTypeFilter, setTruckTypeFilter] = useState<number | null>(null);
  const [tailLiftFilter, setTailLiftFilter] = useState<string | null>(null);
  const [sidegatesFilter, setSidegatesFilter] = useState<string | null>(null);
  const [loadRange, setLoadRange] = useState<{ min: number | null; max: number | null } | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<number | null>(null);

  // ── dynamic dropdown options (fetched from backend, not hardcoded) ─────────
  const [vehicleClassOptions, setVehicleClassOptions] = useState<{ value: number; label: string }[]>([]);
  const [truckTypeOptions, setTruckTypeOptions] = useState<{ value: number; label: string }[]>([]);

  useApolloQueryWithEffect<VehicleClassesResponse>(GET_VEHICLE_CLASSES_QUERY, {
    variables: { query: "", page: 1, first: 100, orderByColumn: "id", orderByOrder: "ASC" },
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      const list = data?.vehicleClasses?.data;
      if (!Array.isArray(list)) return;
      setVehicleClassOptions(list.map((c: any) => ({ value: Number(c.id), label: c.name })));
    },
  });

  useApolloQueryWithEffect<{ vehicleTypes: { data: any[] } }>(GET_VEHICLE_TYPES_QUERY, {
    variables: { query: "", page: 1, first: 100, orderByColumn: "id", orderByOrder: "ASC" },
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      const list = data?.vehicleTypes?.data;
      if (!Array.isArray(list)) return;
      setTruckTypeOptions(list.map((t: any) => ({ value: Number(t.id), label: t.name })));
    },
  });

  const onChangeSearchQuery = useMemo(() => {
    return debounce((value: string) => {
      setSearchQuery(value);
      setQueryPageIndex(0);
    }, 300);
  }, []);

  const tabs = [
    { id: 1, tabName: "Pending", hash: "pending" },
    { id: 2, tabName: "Active", hash: "active" },
    { id: 4, tabName: "Inactive", hash: "inactive" },
  ];

  const changeTab = useCallback((tab: number) => {
    setDriverStatusId(tab);
    setQueryPageIndex(0);
  }, []);

  const handleFilterChange = useCallback(
    (setter: (v: any) => void) => (option: any) => {
      setter(option?.value ?? null);
      setQueryPageIndex(0);
    },
    [],
  );

  const columns = useMemo(
    () => [
      {
        id: "photo",
        header: "Photo",
        accessorKey: "media_url" as const,
        cell: (tableProps: any) => {
          const url = tableProps.row.original.media_url;
          return (
            <Image
              src={url || "/img/avatars/driverIcon.png"}
              fallbackSrc="/img/avatars/driverIcon.png"
              alt={tableProps.row.original.full_name || "driver image"}
              fit="cover"
              style={{ borderRadius: "50%" }}
              width="48px"
              height="48px"
            />
          );
        },
      },
      {
        id: "name",
        header: "Name",
        accessorKey: "full_name" as const,
        cell: (tableProps: any) =>
          tableProps.row.original.full_name ||
          `${tableProps.row.original.first_name || ""} ${tableProps.row.original.last_name || ""}`.trim() ||
          "-",
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
        cell: (tableProps: any) =>
          tableProps.row.original.email || "-",
      },
      {
        id: "state",
        header: "State",
        accessorKey: "license_state" as const,
        cell: (tableProps: any) => tableProps.row.original.license_state || "-",
      },
      {
        id: "vehicleType",
        header: "Vehicle Type",
        accessorKey: "vehicle_type.name" as const,
        cell: (tableProps: any) => tableProps.row.original.vehicle_type?.name || "-",
      },
      {
        id: "vehicleDetails",
        header: "Vehicle Details",
        accessorKey: "vehicle_class.name" as const,
        cell: (tableProps: any) => tableProps.row.original.vehicle_class?.name || "-",
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        meta: { isEdit: true },
      },
    ],
    [],
  );

  const [
  getDrivers,
  { loading, data: drivers },
] = useApolloLazyQueryWithEffect<DriversResponse>(
  GET_LIST_DRIVERS_QUERY,
  {
    fetchPolicy: "no-cache",
    onError: (error) => {
      console.log(error);
    },
  }
);

  useEffect(() => {
    getDrivers({
      variables: {
        query: searchQuery,
        driverStatusId,
        page: queryPageIndex + 1,
        first: queryPageSize,
        orderByColumn: "id",
        orderByOrder: "ASC",
        addressState: stateFilter,
        vehicleClassId: vehicleClassFilter,
        truckTypeId: truckTypeFilter,
        isTailgated: tailLiftFilter !== null ? tailLiftFilter === "1" : null,
        isSidegated: sidegatesFilter !== null ? sidegatesFilter === "1" : null,
        minMaxCapacity: loadRange?.min ?? null,
        maxMaxCapacity: loadRange?.max ?? null,
        noAvailability: availabilityFilter,
      },
    });
  }, [
    getDrivers,
    queryPageIndex,
    queryPageSize,
    searchQuery,
    driverStatusId,
    stateFilter,
    vehicleClassFilter,
    truckTypeFilter,
    tailLiftFilter,
    sidegatesFilter,
    loadRange,
    availabilityFilter,
  ]);

  useEffect(() => {
    return () => {
      onChangeSearchQuery.cancel();
    };
  }, [onChangeSearchQuery]);

  console.log("drivers", drivers);

  return (
    <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
      <SimpleGrid
        mb="20px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <Flex minWidth="max-content" alignItems="center" justifyContent="space-between">
          <h1 className="mb-0">Drivers</h1>
          <Flex alignItems="center">
            <SearchBar
              searchQuery={searchQuery}
              onChangeSearchQuery={onChangeSearchQuery}
              placeholder="Search drivers"
              me="10px"
              background={menuBg}
            />
            <Box minW="140px" me="10px">
              <Select
                placeholder="State"
                options={stateOptions}
                isClearable
                onChange={handleFilterChange(setStateFilter)}
                menuPosition="fixed"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
              />
            </Box>
            <Link href="/admin/drivers/create">
              <Button variant="primary">Create New</Button>
            </Link>
          </Flex>
        </Flex>

        <TabsComponent tabs={tabs} onChange={changeTab} />

        {/* ── Filter row ──────────────────────────────────────────────────── */}
        <Flex gap="12px" flexWrap="wrap">
          <Box minW="160px" flex="1">
            <Select
              placeholder="Vehicle Class"
              options={vehicleClassOptions}
              isClearable
              onChange={handleFilterChange(setVehicleClassFilter)}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            />
          </Box>
          <Box minW="160px" flex="1">
            <Select
              placeholder="Truck Type"
              options={truckTypeOptions}
              isClearable
              onChange={handleFilterChange(setTruckTypeFilter)}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            />
          </Box>
          <Box minW="160px" flex="1">
            <Select
              placeholder="Tail Lift"
              options={yesNoOptions}
              isClearable
              onChange={handleFilterChange(setTailLiftFilter)}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            />
          </Box>
          <Box minW="160px" flex="1">
            <Select
              placeholder="Sidegates"
              options={yesNoOptions}
              isClearable
              onChange={handleFilterChange(setSidegatesFilter)}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            />
          </Box>
          <Box minW="180px" flex="1">
            <Select
              placeholder="Max Load Capacity"
              options={maxLoadCapacityOptions}
              isClearable
              onChange={(option: any) => {
                const found = maxLoadCapacityOptions.find((o) => o.value === option?.value);
                setLoadRange(found ? { min: found.min, max: found.max } : null);
                setQueryPageIndex(0);
              }}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            />
          </Box>
          <Box minW="160px" flex="1">
            <Select
              placeholder="Availability"
              options={availabilityOptions}
              isClearable
              onChange={handleFilterChange(setAvailabilityFilter)}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            />
          </Box>
        </Flex>

        {drivers?.listOfDrivers ? (
          <PaginationTable
            columns={columns}
            data={drivers.listOfDrivers.data ?? []}
            total={drivers.listOfDrivers.paginatorInfo?.total ?? 0}
            path="/admin/drivers"
            options={{
              initialState: {
                pageIndex: queryPageIndex,
                pageSize: queryPageSize,
              },
              manualPagination: true,
              pageCount: drivers.listOfDrivers.paginatorInfo?.lastPage,
            }}
            setQueryPageIndex={setQueryPageIndex}
            setQueryPageSize={setQueryPageSize}
            isServerSide
          />
        ) : loading ? (
          <Box>Loading drivers...</Box>
        ) : (
          <Box>No drivers found.</Box>
        )}
      </SimpleGrid>
    </Box>
  );
}