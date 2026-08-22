'use client';
import {
  Badge, Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text, Th,
  Thead, Tr, VStack
} from "@chakra-ui/react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { Select } from "chakra-react-select";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Driver {
  id: number;
  full_name: string;
  driver_no?: string;
  phone_no?: string;
  registration_no?: string;
  is_tailgated?: boolean;
  no_max_capacity?: number;
  no_max_volume?: number;
  no_max_pallets?: number;
  first_job_start_at_today?: string;
  last_job_drop_at_today?: string;
  jobs?: any[];
  [key: string]: any;
}

interface DriverOption {
  value: string;
  label: string;
  data: Driver;
}

interface Props {
  driverOptions: DriverOption[];
  onDriverChange: (driver: Driver | null) => void;
  rangeDate: [Date, Date] | null;
  setRangeDate: (range: [Date, Date] | null) => void;
  selectedDriver: Driver | null;
  withMedia: boolean;
  handleToggleWithMedia: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMediaBusy?: boolean;
  selectedJobs: any[];
  columns: any[];
}

const JobStatusDateFilter = ({
  columns,
  driverOptions,
  onDriverChange,
  rangeDate,
  setRangeDate,
  selectedDriver,
  selectedJobs,
}: Props) => {
  // ✅ FIX 1: useMemo — recalculates only when selectedJobs changes.
  // BEFORE: inline reduce() ran on every render, including scroll events.
  const totals = useMemo(
    () =>
      selectedJobs?.reduce(
        (acc, job) => {
          acc.totalWeights += job?.original?.job?.total_weight ?? 0;
          acc.totalCBM += job?.original?.job?.total_volume ?? 0;
          return acc;
        },
        { totalWeights: 0, totalCBM: 0 },
      ) || { totalWeights: 0, totalCBM: 0 },
    [selectedJobs],
  );

  const isCBMOver = totals.totalCBM > (selectedDriver?.no_max_volume ?? Infinity);
  const isWeightOver = totals.totalWeights > (selectedDriver?.no_max_capacity ?? Infinity);

  const handleRangeChange = useCallback(
    (range: any) => {
      if (Array.isArray(range) && range[0] && range[1]) {
        setRangeDate(range as [Date, Date]);
      } else {
        setRangeDate(null);
      }
    },
    [setRangeDate],
  );

  // ✅ FIX 2: useCallback — a new function isn't created every render.
  const handleDriverSelectChange = useCallback(
    (option: DriverOption | null) => {
      onDriverChange(option?.data ?? null);
    },
    [onDriverChange],
  );

  const [isFixed, setIsFixed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // ✅ FIX 3: useCallback for handleScroll
  // BEFORE: scroll handler recreated every render → stale closure + listener issues
  const handleScroll = useCallback(() => {
    if (!boxRef.current) return;
    const scrollY = window.scrollY;
    const boxTop = boxRef.current.offsetTop;
    setIsFixed(scrollY > boxTop);
  }, []); // boxRef is a stable ref object — no dep needed

  // ✅ FIX 4: add handleScroll to deps array
  // BEFORE: [] — stale closure, listener never updated
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Flex wrap="wrap" gap={4}>
        <Box width="300px">
          <Select
            options={driverOptions}
            value={
              selectedDriver
                ? driverOptions.find((d) => d.data.id === selectedDriver.id)
                : null
            }
            onChange={handleDriverSelectChange}
            placeholder="Select Driver"
            classNamePrefix="select"
            isClearable
          />
        </Box>

        <Box
          w="30%"
          maxW="max-content"
          float="right"
          p="10px 10px"
          h="max-content"
          sx={{
            ".react-daterange-picker__wrapper": {
              border: "1px solid #e3e3e3",
              padding: "6px",
              borderRadius: "0.375rem",
              marginTop: "-15px",
            },
          }}
        >
          {/* @ts-ignore */}
          <DateRangePicker
            value={rangeDate ?? undefined}
            onChange={handleRangeChange}
            clearIcon={<span style={{ color: "red", cursor: "pointer" }}>✕</span>}
          />
        </Box>
      </Flex>

      {selectedDriver && (
        <Flex direction="column">
          <Box
            ref={boxRef}
            position={isFixed ? "fixed" : "relative"}
            top={isFixed ? 0 : undefined}
            width={isFixed ? "87%" : undefined}
            zIndex={10}
            bg="#1d2d53"
            color="#fff"
            px={6}
            py={3}
            borderRadius="md"
            boxShadow="md"
          >
            <VStack align="start" spacing={3} w="full">
              <Flex wrap="wrap" gap={3} w="full">
                <Badge colorScheme="Darkblue" variant="subtle">
                  Driver: {selectedDriver.full_name} — {selectedDriver.driver_no}
                </Badge>
                <Badge colorScheme="red" variant="subtle">
                  Current Suburb: -
                </Badge>
                <Badge colorScheme="red" variant="subtle">
                  Mobile Number: {selectedDriver.phone_no ?? "-"}
                </Badge>
                <Badge colorScheme="red" variant="subtle">
                  Rego: {selectedDriver.registration_no ?? "-"}
                </Badge>
                <Badge colorScheme="red" variant="subtle">
                  TAILGATE: {selectedDriver.is_tailgated ? "Yes" : "No"}
                </Badge>
                <Badge
                  colorScheme={isCBMOver ? "pink" : "blue"}
                  textColor={isCBMOver ? "red" : undefined}
                  variant="subtle"
                >
                  CBM: {totals.totalCBM.toFixed(2)} / {selectedDriver.no_max_volume ?? 0}
                </Badge>
                <Badge
                  colorScheme={isWeightOver ? "pink" : "blue"}
                  textColor={isWeightOver ? "red" : undefined}
                  variant="subtle"
                >
                  Weight: {totals.totalWeights.toFixed(2)} /{" "}
                  {selectedDriver.no_max_capacity ?? 0}
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  Pallets: {selectedDriver.no_max_pallets ?? 0}
                </Badge>
              </Flex>

              {(isCBMOver || isWeightOver) && (
                <Text color="red.500" fontSize="sm">
                  ⚠️ Selected jobs exceed max{" "}
                  {isCBMOver ? "CBM" : ""}
                  {isCBMOver && isWeightOver ? " & " : ""}
                  {isWeightOver ? "Weight" : ""}. Uncheck jobs to reduce totals.
                </Text>
              )}
            </VStack>

            {selectedJobs.length !== 0 && (
              <VStack
                bg="#ffffff"
                color="#111111"
                w="full"
                align="start"
                p={0}
                mt="1"
                mb={1}
                overflowX="auto"
                maxH="250px"
                overflowY="auto"
                spacing={4}
                fontSize="xs"
              >
                <Table size="sm">
                  <Thead>
                    <Tr>
                      {columns.slice(1).map((column) => (
                        <Th key={column.id} fontSize="xs">
                          {column.header}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* ✅ FIX: plain Tr/Td — the drag-enabled row component
                        needs a Reorder.Group ancestor. This is display-only,
                        no drag needed. */}
                    {selectedJobs.map((item) => {
                      const job = item?.original?.job;
                      return (
                        <Tr key={job?.id}>
                          {columns.slice(1).map((column) => {
                            const bg = column.id === "total_weight"
                              ? (job?.weight_color ?? undefined)
                              : column.id === "total_volume"
                                ? (job?.volume_color ?? undefined)
                                : undefined;
                            const CellComponent = column.cell;
                            return (
                              <Td key={column.id} bg={bg} py={1} px={2} fontSize="xs">
                                {CellComponent ? (
                                  <CellComponent row={item} />
                                ) : column?.type === "date" ? (
                                  "-"
                                ) : (
                                  job?.[column.accessor] ?? "-"
                                )}
                              </Td>
                            );
                          })}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </VStack>
            )}
          </Box>
        </Flex>
      )}
    </>
  );
};

export default JobStatusDateFilter;