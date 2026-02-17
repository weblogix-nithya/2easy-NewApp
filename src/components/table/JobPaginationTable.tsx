// @ts-nocheck
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { faTrashAlt } from "@fortawesome/pro-light-svg-icons";
import { faDownload, faEye, faPen } from "@fortawesome/pro-regular-svg-icons";
import { faMessageLines } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import { SortAlt } from "components/icons/Icons";
import { formatCurrency, formatDate, formatToTimeDate } from "helpers/helper";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import {
  Column,
  PluginHook,
  TableOptions,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";

// Non-toggle column ids
const EXCLUDED_IDS = new Set([
  "actions",
  "admin_notes",
  "timeslot",
  "job_destinations.address",
]);

// Click landed on a control? then don't toggle the row.
const isInteractive = (el: HTMLElement | null): boolean =>
  !!el?.closest(
    'a,button,[role="button"],input,textarea,select,[contenteditable="true"],[data-no-row-toggle]',
  );

export const isAdmin = (state: RootState) => state.user.isAdmin;
export const isCustomer = (state: RootState) => state.user.isCustomer;

const getStatusStyle = (status: string) => {
  const st = status?.toLowerCase();

  if (st === "in transit") {
    return { background: "#FFD580", color: "#8B4000" }; // brighter orange
  }

  if (st === "assigned") {
    return { background: "#FFFACD", color: "#665c00" }; // light lemon yellow
  }

  if (["completed", "delivered"].includes(st)) {
    return { background: "#d4edda", color: "#155724" }; // green
  }

  if (["rejected", "cancelled"].includes(st)) {
    return { background: "#f8d7da", color: "#721c24" }; // red
  }

  return {};
};

type PaginationTableProps<T extends object> = {
  columns: Column<T>[];
  data: T[];
  total: number;
  options?: Omit<TableOptions<T>, "data" | "columns">;
  plugins?: PluginHook<T>[];
  path?: string;
  showDelete?: boolean;
  onDelete?: (data: any) => void;
  showPageSizeSelect?: boolean;
  showManualPages?: boolean;
  isChecked?: boolean;
  onSortingChange?: any;
  restyleTable?: boolean;
} & (
  | {
      isServerSide?: false;
      setQueryPageIndex?: never;
      setQueryPageSize?: never;
    }
  | {
      isServerSide: true;
      setQueryPageIndex: React.Dispatch<React.SetStateAction<number>>;
      setQueryPageSize: React.Dispatch<React.SetStateAction<number>>;
    }
) &
  (
    | {
        showRowSelection?: false;
        setSelectedRow?: never;
        isFilterRowSelected?: never;
      }
    | {
        showRowSelection: true;
        setSelectedRow: React.Dispatch<React.SetStateAction<array>>;
        isFilterRowSelected: boolean;
      }
  );
const PaginationTable = <T extends object>({
  columns,
  data,
  total,
  isServerSide = false,
  options,
  plugins = [],
  _showDelete = false,
  setQueryPageIndex,
  setQueryPageSize,
  // onDelete,
  path,
  showPageSizeSelect = false,
  // showManualPages = false,
  showRowSelection = false,
  isFilterRowSelected = false,
  setSelectedRow,
  isChecked,
  onSortingChange,
  restyleTable = false,
}: // restyleTable = false,
// autoResetSelectedRows= false,
PaginationTableProps<T>) => {
  const router = useRouter();
  // const [pageRows, setPageRows] = useState([]);

  const pageSizeOptions = [
    { value: 10, label: "10 / page" },
    { value: 30, label: "30 / page" },
    { value: 50, label: "50 / page" },
    { value: 100, label: "100 / page" },
    { value: 150, label: "150 / page" },
    { value: 200, label: "200 / page" },
  ];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
    selectedFlatRows,
    // gotoPage,
    // pageCount,
    toggleAllRowsSelected,
    // autoResetSelectedRows
  } = useTable<T>(
    {
      ...options,
      columns,
      data,
      autoResetSelectedRows: false,
    },
    useSortBy,
    usePagination,
    ...plugins,
    useRowSelect,
  );

  const optimisticSelRef = React.useRef<Map<string, boolean>>(new Map());
  const [, force] = React.useState(0);
  const forceUpdate = () => force((x) => x + 1);

  useEffect(() => {
    if (optimisticSelRef.current.size) {
      optimisticSelRef.current.clear();
      // no need to force here; next render will show real state anyway
    }
  }, [selectedFlatRows]);
  function getOptimisticSelected(row: any) {
    const v = optimisticSelRef.current.get(row.id);
    return typeof v === "boolean" ? v : row.isSelected;
  }

  function toggleOptimisticRow(row: any) {
    const next = !getOptimisticSelected(row);
    optimisticSelRef.current.set(row.id, next); // flip instantly
    forceUpdate(); // paint now
    row.toggleRowSelected(next); // real react-table state
  }

  // useEffect(() => {
  //   console.log("Page rows changed:", pageRows.map((r) => r.original?.job?.name));
  // }, [pageRows]);

  useEffect(() => {
    if (isServerSide && setQueryPageIndex && setQueryPageSize) {
      setQueryPageIndex(pageIndex);
      setQueryPageSize(pageSize);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isServerSide, pageIndex, pageSize, setQueryPageIndex, setQueryPageSize]);

  useEffect(() => {
    if (showRowSelection) {
      setSelectedRow(selectedFlatRows);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, showRowSelection, setSelectedRow, selectedFlatRows]);

  // const pageRows = useMemo(() => {
  //   return isFilterRowSelected ? page.filter((row) => row.isSelected) : page;
  //   //eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [page, isFilterRowSelected]);

  const pageRows = isFilterRowSelected
    ? page.filter((row) => row.isSelected)
    : page;

  useEffect(() => {
    if (onSortingChange) onSortingChange(sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useEffect(() => {
    if (!isChecked) toggleAllRowsSelected(isChecked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecked]);

  return (
    <VStack w="full" align="start" spacing={4}>
      <Table colorScheme="white" {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup, index) => (
            <Tr
              {...headerGroup.getHeaderGroupProps()}
              key={`header-row-${index}`}
            >
              {headerGroup.headers.map((column) => (
                <Th
                  {...column.getHeaderProps(
                    column.enableSorting
                      ? column.getSortByToggleProps()
                      : undefined,
                  )}
                  {...column.getHeaderProps()}
                  key={`row-header-${column.id}`}
                  paddingLeft={restyleTable && 1}
                  paddingInlineStart={restyleTable && 1}
                  paddingRight={restyleTable && 2}
                  paddingInlineEnd={restyleTable && 2}
                >
                  {restyleTable}
                  {column.render("Header")}
                  {column.enableSorting && (
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          "↓"
                        ) : (
                          "↑"
                        )
                      ) : (
                        <SortAlt
                          size={16}
                          style={{ transform: "rotate(180deg)" }}
                        />
                      )}
                    </span>
                  )}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {pageRows.map((row, index) => {
            // console.log(row, "row one");
            prepareRow(row);
            const status = row.original?.job?.job_status?.name;

            const driver = row.original.driver;
            const prevDriver = pageRows[index - 1]?.original?.driver;

            const shouldShowDriverHeader =
              !!driver?.full_name &&
              (!prevDriver?.full_name || driver?.id !== prevDriver?.id);

            return (
              <React.Fragment key={`driver-header-${index}`}>
                {shouldShowDriverHeader && (
                  <Tr>
                    <Td colSpan={columns.length} p={0}>
                      <Box
                        bg="#1d2d53"
                        color="#fff"
                        px={6}
                        py={3}
                        borderTop="4px solid"
                        borderLeft="4px solid"
                        borderColor="#2F80ED"
                        borderRadius="md"
                        w="100%"
                      >
                        <VStack align="start" spacing={2}>
                          <Flex
                            wrap="wrap"
                            justify="space-between"
                            align="start"
                            gap={4}
                            w="full"
                          >
                            <Text fontWeight="800" minW="200px" fontSize="xl">
                              Driver: {driver.full_name} — {driver.driver_no}
                            </Text>

                            <Flex wrap="wrap" gap={3}>
                              <Badge colorScheme="purple" variant="subtle" fontSize="md">
                                First Collection:{" "}
                                {formatToTimeDate(
                                  driver.first_job_start_at_today,
                                )}
                              </Badge>
                              <Badge colorScheme="purple" variant="subtle" fontSize="md" >
                                Last Delivery:{" "}
                                {formatToTimeDate(
                                  driver.last_job_drop_at_today,
                                )}
                              </Badge>
                              <Badge colorScheme="blue" variant="subtle" fontSize="md">
                                CBM: {driver.cbm_summary_today ?? 0} /{" "}
                                {driver.no_max_volume ?? 0}
                              </Badge>
                              <Badge colorScheme="blue" variant="subtle" fontSize="md">
                                Weight: {driver.weight_summary_today ?? 0} /{" "}
                                {driver.no_max_capacity ?? 0}
                              </Badge>
                              <Badge colorScheme="blue" variant="subtle" fontSize="md">
                                Pallets: {driver.no_max_pallets ?? 0}
                              </Badge>
                            </Flex>
                          </Flex>

                          <Flex
                            wrap="wrap"
                            justify="space-between"
                            gap={4}
                            w="full"
                          >
                            <Badge colorScheme="red" variant="subtle" fontSize="md">
                              Current Suburb: WIP
                            </Badge>
                            <Badge colorScheme="red" variant="subtle" fontSize="md">
                              Mobile Number: {driver.phone_no ?? "-"}
                            </Badge>
                            <Badge colorScheme="red" variant="subtle" fontSize="md">
                              Rego: {driver.registration_no ?? "-"}
                            </Badge>
                            <Badge colorScheme="red" variant="subtle" fontSize="md">
                              TAILGATE: {driver.is_tailgated ? "Yes" : "No"}
                            </Badge>
                          </Flex>
                        </VStack>
                      </Box>
                    </Td>
                  </Tr>
                )}
                <Tr
                  {...row.getRowProps()}
                  key={`data-row-${row.id || idx}`}
                  style={getStatusStyle(status)}
                  cursor={showRowSelection ? "pointer" : "default"}
                  onClick={(e) => {
                    if (!showRowSelection) return;
                    const target = e.target as HTMLElement;
                    if (isInteractive(target)) return;
                    const td = target.closest("td");
                    const colId = td?.getAttribute("data-column-id") || "";
                    if (EXCLUDED_IDS.has(colId)) return;
                    toggleOptimisticRow(row); // instant
                  }}
                  // className="css-en-xlrwr4"
                  // onClick={
                  //   isChecked ? () => row.toggleRowSelected() : undefined
                  // }
                >
                  {row?.cells?.map((cell, index) => {
                    let data;
                    if (cell.column.id === "selection") {
                      return (
                        <Td
                          {...cell.getCellProps({
                            "data-column-id": "selection",
                          })}
                          key={`selection-${index}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!showRowSelection) return;
                            toggleOptimisticRow(row);
                          }}
                          cursor="pointer"
                        >
                          <Box pointerEvents="none">
                            {/* Render a visual checkbox using optimistic selected state */}
                            <HStack>
                              <Box
                                boxSize="16px"
                                border="1px solid"
                                borderColor="gray.300"
                                borderRadius="2px"
                                bg={
                                  getOptimisticSelected(row)
                                    ? "blue.500"
                                    : "white"
                                }
                                position="relative"
                              >
                                {getOptimisticSelected(row) && (
                                  <Box
                                    position="absolute"
                                    inset="2px"
                                    bg="white"
                                    clipPath="polygon(14% 44%, 0 59%, 44% 100%, 100% 36%, 86% 22%, 44% 64%)"
                                  />
                                )}
                              </Box>
                              {/* Optional: label */}
                            </HStack>
                          </Box>
                        </Td>
                      );
                    }

                    if (cell.column.Header === "Actions") {
                      data = (
                        <Td
                          key={`action-${index}`}
                          data-column-id="actions"
                          // paddingLeft={restyleTable && 1}
                          // paddingInlineStart={restyleTable && 1}
                          // paddingRight={restyleTable && 2}
                          // paddingInlineEnd={restyleTable && 2}
                        >
                          <Flex gap={2} wrap="wrap" align="center">
                            {
                              //@ts-expect-error
                              cell.column.isDownload && (
                                <Link
                                  href={cell.value}
                                  target="_blank"
                                  fontWeight="700"
                                  data-no-row-toggle
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    // bg={boxBg}
                                    bg="white"
                                    fontSize="sm"
                                    // fontWeight="500"
                                    className="!text-[var(--chakra-colors-black-400)]"
                                    // color={textColorSecondary}
                                    // borderRadius="7px"
                                  >
                                    <FontAwesomeIcon
                                      icon={faDownload}
                                      className="!text-[var(--chakra-colors-black-400)]"
                                      size="lg"
                                    />
                                  </Button>
                                </Link>
                              )
                            }
                            {
                              //@ts-expect-error
                              (cell.column.isEdit == undefined ||
                                //@ts-expect-error
                                cell.column.isEdit) && (
                                <Link
                                  href={`${path || router.pathname}/${
                                    cell.row.original.job.id
                                  }`}
                                  fontWeight="700"
                                  data-no-row-toggle
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    bg="white"
                                    fontSize="sm"
                                    // fontWeight="500"
                                    className="!text-[var(--chakra-colors-black-400)]"
                                    // color={textColorSecondary}
                                    // borderRadius="7px"
                                  >
                                    <FontAwesomeIcon
                                      icon={faPen}
                                      className="!text-[var(--chakra-colors-black-400)]"
                                      size="lg"
                                    />
                                  </Button>
                                </Link>
                              )
                            }
                            {
                              //@ts-expect-error
                              cell.column.isView && (
                                <Link
                                  href={`${path || router.pathname}/${
                                    cell.row.original.job.id
                                  }`}
                                  fontWeight="700"
                                  data-no-row-toggle
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    // bg={boxBg}
                                    bg="white"
                                    fontSize="sm"
                                    // fontWeight="500"
                                    className="!text-[var(--chakra-colors-black-400)]"
                                    // color={textColorSecondary}
                                    // borderRadius="7px"
                                  >
                                    <FontAwesomeIcon
                                      icon={faEye}
                                      className="!text-[var(--chakra-colors-black-400)]"
                                      size="lg"
                                    />
                                  </Button>
                                </Link>
                              )
                            }
                            {
                              //@ts-expect-error
                              cell.column.isTracking && (
                                <Link
                                  href={`${path || router.pathname}/tracking/${
                                    cell.row.original.job.id
                                  }`}
                                  fontWeight="700"
                                  data-no-row-toggle
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    // bg={boxBg}
                                    bg="white"
                                    fontSize="sm"
                                    // fontWeight="500"
                                    className="!text-[#3B68DB]"
                                    // color={textColorSecondary}
                                    // borderRadius="7px"
                                  >
                                    Track
                                  </Button>
                                </Link>
                              )
                            }
                            {
                              //@ts-expect-error
                              cell.column.isDelete && (
                                <Button
                                  // bg={boxBg}
                                  bg="white"
                                  fontSize="sm"
                                  // fontWeight="500"
                                  className="!text-[var(--chakra-colors-black-400)]"
                                  onClick={() => {
                                    onDelete(cell.row.original.job.id);
                                  }}
                                  // color={textColorSecondary}
                                  // borderRadius="7px"
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      cell.column.deleteIcon != undefined
                                        ? cell.column.deleteIcon
                                        : faTrashAlt
                                    }
                                    className="!text-[var(--chakra-colors-black-400)]"
                                    size="lg"
                                  />
                                </Button>
                              )
                            }
                          </Flex>
                        </Td>
                      );
                    } else if (cell.column.Header === "Instructions") {
                      data = (
                        <Td
                          {...cell.getCellProps({
                            "data-column-id": cell.column.id,
                          })}
                          key={`instructions-${index}`}
                          paddingLeft={restyleTable && 1}
                          paddingInlineStart={restyleTable && 1}
                          paddingRight={restyleTable && 2}
                          paddingInlineEnd={restyleTable && 2}
                        >
                          <Tooltip
                            label={
                              <React.Fragment>
                                <div className="text-xs">
                                  <p className="mb-2">
                                    <strong>Pick up Person: </strong>
                                    {
                                      // @ts-expect-error
                                      row.original?.pick_up_name || "N/A"
                                    }
                                  </p>
                                  <p>
                                    <strong>Instructions: </strong>
                                    {
                                      // @ts-expect-error
                                      row.original?.pick_up_notes || "N/A"
                                    }
                                  </p>
                                </div>
                              </React.Fragment>
                            }
                            aria-label="A tooltip"
                          >
                            <FontAwesomeIcon
                              icon={faMessageLines}
                              className="!text-[var(--chakra-colors-black-400)] hover:!text-[var(--chakra-colors-primary-400)]"
                              size="lg"
                              data-no-row-toggle
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Tooltip>
                        </Td>
                      );
                    } else {
                      data = (
                        <Td
                          {...cell.getCellProps({
                            "data-column-id": cell.column.id,
                          })}
                          key={`default-${index}`}
                          paddingLeft={restyleTable && 1}
                          paddingInlineStart={restyleTable && 1}
                          paddingRight={restyleTable && 2}
                          paddingInlineEnd={restyleTable && 2}
                          pr="20px"
                        >
                          {
                            // @ts-expect-error
                            cell.column.type === "date" ? (
                              <Text>
                                {cell.value
                                  ? formatDate(cell.value, "DD/MM/YYYY")
                                  : "-"}
                              </Text>
                            ) : cell.column.type === "money" ? (
                              <Text>
                                {cell.value ? formatCurrency(cell.value) : "$0"}
                              </Text>
                            ) : cell.column.type === "boolean" ? (
                              <Text>
                                {cell.value == true
                                  ? cell.column.trueLabel || "Yes"
                                  : cell.column.falseLabel || "No"}
                              </Text>
                            ) : (
                              cell.render("Cell")
                            )
                          }
                          {cell.column.showCompany == true && (
                            <Text className="text-gray-400">
                              {row.original.company?.name}
                            </Text>
                          )}
                        </Td>
                      );
                    }
                    return data;
                  })}
                </Tr>
              </React.Fragment>
            );
          })}
        </Tbody>
      </Table>

      {/* Pagination Controls */}
      <HStack w="full" justify="space-between">
        {!isFilterRowSelected && showPageSizeSelect && (
          <Select
            isSearchable={false}
            size="sm"
            maxW="70px"
            value={pageSizeOptions.find((option) => option.value == pageSize)}
            onChange={(e) => setPageSize(Number(e.value))}
            options={pageSizeOptions}
            classNamePrefix="chakra-react-select"
            menuPosition="fixed"
          />
        )}

        {!isFilterRowSelected && (
          <>
            <Text>
              Showing {pageIndex * pageSize + 1} to {(pageIndex + 1) * pageSize}{" "}
              of {total} entries
            </Text>
            <ButtonGroup isAttached variant="outline">
              <IconButton
                aria-label="Go to previous page"
                icon={<HiChevronLeft />}
                isDisabled={!canPreviousPage}
                onClick={() => previousPage()}
              />
              <IconButton
                aria-label="Go to next page"
                icon={<HiChevronRight />}
                isDisabled={!canNextPage}
                onClick={() => nextPage()}
              />
            </ButtonGroup>
          </>
        )}
      </HStack>
    </VStack>
  );
};

export default PaginationTable;
