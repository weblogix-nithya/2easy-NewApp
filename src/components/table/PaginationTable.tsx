// @ts-nocheck
import {
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
import { SortAlt } from "@/components/icons/Icons";
import {
  formatCurrency,
  formatDate,
  getTimeDifferenceInMinutes,
} from "@/lib/helpers/helper";
// import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
// import { useRouter } from "next/navigation"; // changed: router no longer used in this v8 refactor
// import {
//   Column,
//   PluginHook,
//   TableOptions,
//   usePagination,
//   useRowSelect,
//   useSortBy,
//   useTable,
// } from "react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getTimeslotBgColor } from "./JobPaginationTable";

type PaginationTableProps<T extends object> = {
  columns: any[]; // accept v7 or v8
  data: T[];
  total: number;
  options?: any; // keep your existing options object (manualPagination, initialState, pageCount, etc.)
  path?: string;
  // showDelete?: boolean; // changed: unused in current v8 implementation
  onReset?: (data: any) => void;
  onDelete?: (data: any) => void;
  isapprove?: boolean; // changed: unused in current v8 implementation
  isRestore?: boolean;
  onRestore?: (data: any) => void;
  onApprove?: (data: any) => void;
  showPageSizeSelect?: boolean;
  // showManualPages?: boolean; // changed: unused in current v8 implementation
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
      setSelectedRow: React.Dispatch<React.SetStateAction<any[]>>;
      isFilterRowSelected: boolean;
    }
  );

const PaginationTable = <T extends object>({
  columns,
  data,
  total,
  isServerSide = false,
  options,
  path,
  showPageSizeSelect = false,
  showRowSelection = false,
  isFilterRowSelected = false,
  setSelectedRow,
  isChecked,
  onSortingChange,
  restyleTable = false,
  setQueryPageIndex,
  setQueryPageSize,
  onDelete,
  onApprove,
  onRestore,
  onReset,
}: PaginationTableProps<T>) => {
  // const router = useRouter(); // changed: router not used in this v8 implementation

  const pageSizeOptions = [
    { value: 10, label: "10 / page" },
    { value: 30, label: "30 / page" },
    { value: 50, label: "50 / page" },
    { value: 100, label: "100 / page" },
    { value: 150, label: "150 / page" },
    { value: 200, label: "200 / page" },
  ];

  // initial state from your v7-style options.initialState
  const initialPageIndex = options?.initialState?.pageIndex ?? 0;
  const initialPageSize = options?.initialState?.pageSize ?? 10;
  const initialSortBy = options?.initialState?.sortBy ?? []; // v7 shape
  const initialSorting = (initialSortBy || []).map((s: any) => ({
    id: s.id,
    desc: !!s.desc,
  }));

  const [sorting, setSorting] = React.useState<any[]>(initialSorting);
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});
  const [pagination, setPagination] = React.useState({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    ...(options || {}),
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    enableRowSelection: showRowSelection,
    onSortingChange: (updater: any) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
    },
    onRowSelectionChange: (updater: any) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(next);
    },
    onPaginationChange: (updater: any) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: options?.manualSortBy ? undefined : getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: !!options?.manualSortBy,
    manualPagination: !!options?.manualPagination || isServerSide,
    pageCount:
      (!!options?.manualPagination || isServerSide) &&
        options?.pageCount != null
        ? options.pageCount
        : undefined,
    autoResetAll: false,
  });

  // optimistic selection (instant UI)
  const optimisticSelRef = React.useRef<Map<string, boolean>>(new Map());
  const [, force] = React.useState(0);
  const forceUpdate = () => force((x) => x + 1);

  const selectedRows = table.getSelectedRowModel().rows;

  useEffect(() => {
    if (optimisticSelRef.current.size) {
      optimisticSelRef.current.clear();
    }
  }, [selectedRows.length]);

  function getOptimisticSelected(row: any) {
    const v = optimisticSelRef.current.get(row.id);
    return typeof v === "boolean" ? v : row.getIsSelected();
  }

  function toggleOptimisticRow(row: any) {
    const next = !getOptimisticSelected(row);
    optimisticSelRef.current.set(row.id, next);
    forceUpdate();
    row.toggleSelected(next);
  }

  // server-side sync out to parent
  useEffect(() => {
    if (isServerSide && setQueryPageIndex && setQueryPageSize) {
      setQueryPageIndex(table.getState().pagination.pageIndex);
      setQueryPageSize(table.getState().pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isServerSide,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
  ]);

  // selected rows output to parent (same as selectedFlatRows)
  useEffect(() => {
    if (showRowSelection && setSelectedRow) {
      setSelectedRow(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRowSelection, rowSelection]);

  // sorting callback to parent (same as v7 sortBy)
  useEffect(() => {
    if (onSortingChange) onSortingChange(sorting);
  }, [sorting]);

  // external clear selection
  useEffect(() => {
    if (isChecked === false) {
      table.toggleAllRowsSelected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecked]);

  // rows to render (paginated)
  const rows = table.getRowModel().rows;
  const pageRows = isFilterRowSelected
    ? rows.filter((r) => r.getIsSelected())
    : rows;

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  const previousPage = () => table.previousPage();
  const nextPage = () => table.nextPage();
  const setPageSize = (size: number) => table.setPageSize(size);

  return (
    <VStack w="full" align="start" spacing={4}>
      <Table colorScheme="white">
        {/* <Table
        colorScheme="white"
        border="1px solid"
        borderColor="gray.200"
        sx={{
          "th, td": {
            border: "1px solid", 
            // borderColor: "gray.500",
            px: 3,
            py: 3,
            verticalAlign: "top",
          },
        }}
      >*/}
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted(); // 'asc' | 'desc' | false

                return (
                  <Th
                    key={header.id}
                    // bg="gray.300"
                    // color="gray.900"
                    // fontSize="11px"
                    // fontWeight="700"
                    // textTransform="uppercase"
                    // letterSpacing="0.5px"
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    cursor={canSort ? "pointer" : "default"}
                    paddingLeft={restyleTable && 1}
                    paddingInlineStart={restyleTable && 1}
                    paddingRight={restyleTable && 2}
                    paddingInlineEnd={restyleTable && 2}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {canSort && (
                      <span style={{ marginLeft: 6 }}>
                        {isSorted ? (
                          isSorted === "desc" ? (
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
                );
              })}
            </Tr>
          ))}
        </Thead>

        <Tbody>
          {pageRows.map((row, index) => {
            return (
              <React.Fragment key={`driver-header-${row.id}`}>
                <Tr
                  key={`data-row-${row.id || index}`}
                  // key={`data-row-${row.id}`}
                  // sx={{
                  //   borderbottom: "2px solid",
                  //   borderColor: "#020e1e !important",
                  // }}
                  // style={getStatusStyle(status)}
                  cursor={showRowSelection ? "pointer" : "default"}

                  onClick={(e) => {
                    if (!showRowSelection) return;
                    const target = e.target as HTMLElement;
                    if (isInteractive(target)) return;

                    const td = target.closest("td");
                    const colId = td?.getAttribute("data-column-id") || "";
                    if (EXCLUDED_IDS.has(colId)) return;

                    toggleOptimisticRow(row);
                  }}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const meta = cell.column.columnDef.meta || {};
                    const headerLabel = meta.Header;

                    // selection column
                    if (cell.column.id === "selection") {
                      return (
                        <Td
                          key={cell.id}
                          data-column-id="selection"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!showRowSelection) return;
                            toggleOptimisticRow(row);
                          }}
                          cursor="pointer"
                        >
                          <Box pointerEvents="none">
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
                            </HStack>
                          </Box>
                        </Td>
                      );
                    }

                    // Actions column
                    if (
                      headerLabel === "Actions" ||
                      cell.column.id === "actions"
                    ) {
                      const cellValue = cell.getValue();
                      const id = row.original?.job?.id ?? row.original.id ?? undefined;
                      return (
                        <Td
                          key={cell.id}
                          data-column-id="actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Flex gap={2} wrap="wrap" align="center">
                            {meta.isDownload && (
                              <Link
                                href={cellValue}
                                target="_blank"
                                fontWeight="700"
                                data-no-row-toggle
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  bg="white"
                                  fontSize="sm"
                                  className="!text-[var(--chakra-colors-black-400)]"
                                >
                                  <FontAwesomeIcon
                                    icon={faDownload}
                                    className="!text-[var(--chakra-colors-black-400)]"
                                    size="lg"
                                  />
                                </Button>
                              </Link>
                            )}

                            {(meta.isEdit === undefined || meta.isEdit) && (

                              <Link
                                href={`${path || ""}/${id}`}
                                fontWeight="700"
                                data-no-row-toggle
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  bg="white"
                                  fontSize="sm"
                                  className="!text-[var(--chakra-colors-black-400)]"
                                >
                                  <FontAwesomeIcon
                                    icon={faPen}
                                    className="!text-[var(--chakra-colors-black-400)]"
                                    size="lg"
                                  />
                                </Button>
                              </Link>
                            )}

                            {meta.isView && (
                              <Link
                                href={`${path || ""}/${row.original?.job?.id}`}
                                fontWeight="700"
                                data-no-row-toggle
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  bg="white"
                                  fontSize="sm"
                                  className="!text-[var(--chakra-colors-black-400)]"
                                >
                                  <FontAwesomeIcon
                                    icon={faEye}
                                    className="!text-[var(--chakra-colors-black-400)]"
                                    size="lg"
                                  />
                                </Button>
                              </Link>
                            )}

                            {meta.isTracking && (
                              <Link
                                href={`${path || ""}/tracking/${row.original?.job?.id}`}
                                fontWeight="700"
                                data-no-row-toggle
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  bg="white"
                                  fontSize="sm"
                                  className="!text-[#3B68DB]"
                                >
                                  Track
                                </Button>
                              </Link>
                            )}

                            {meta.isDelete && (
                              <Button
                                bg="white"
                                fontSize="sm"
                                className="!text-[var(--chakra-colors-black-400)]"
                                onClick={() =>
                                  onDelete?.(row.original?.job?.id)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={
                                    meta.deleteIcon != undefined
                                      ? meta.deleteIcon
                                      : faTrashAlt
                                  }
                                  className="!text-[var(--chakra-colors-black-400)]"
                                  size="lg"
                                />
                              </Button>
                            )}
                            {
                              //@ts-expect-error
                              meta.isApprove &&
                              (row.original.is_approve === false ||
                                row.original.is_approve === "false" ||
                                row.original.is_approve === 0 ||
                                row.original.is_approve === "0") && (
                                <Button
                                  bg="blue.100"
                                  color="white"
                                  fontSize="sm"
                                  _hover={{ bg: "blue.300" }}
                                  className="!text-[var(--chakra-colors-black-400)]"
                                  // onClick={() => {onApprove(cell.row.original.id)}}
                                  onClick={() => onApprove?.(row.original.id)}
                                >
                                  Approve
                                </Button>
                              )
                            }
                            {
                              //@ts-expect-error
                              meta.isRestore && (
                                <Button
                                  bg="white"
                                  fontSize="sm"
                                  className="!text-[var(--chakra-colors-black-400)]"
                                  // onClick={() => {onRestore(cell.row.original.id)}}
                                  onClick={() => onRestore?.(row.original.id)}
                                >
                                  Restore
                                </Button>
                              )
                            }
                            {meta.isReset && (
                              <Flex
                                align="center"
                                justify="space-between"
                                width="100%"
                              >
                                <Button
                                  bg={
                                    row.original.is_admin
                                      ? row.original.reset_approve
                                        ? "green.100"
                                        : "blue.100"
                                      : "gray.100"
                                  }
                                  color={
                                    row.original.is_admin
                                      ? row.original.reset_approve
                                        ? "green.800"
                                        : "blue.800"
                                      : "gray.600"
                                  }
                                  _hover={{
                                    bg: row.original.is_admin
                                      ? row.original.reset_approve
                                        ? "green.200"
                                        : "blue.200"
                                      : "gray.200",
                                  }}
                                  fontSize="sm"
                                  className="!text-[var(--chakra-colors-black-400)]"
                                  onClick={() => {
                                    if (row.original.is_admin) {
                                      onReset?.(row.original.id);
                                    }
                                  }}
                                  isDisabled={
                                    !row.original.is_admin ||
                                    row.original.reset_approve === true
                                  }
                                >
                                  {row.original.is_admin
                                    ? row.original.reset_approve
                                      ? "Approved"
                                      : "Reset Access"
                                    : "Not Admin"}
                                </Button>

                                <Link
                                  href={`${path || ""}/reset/${row.original.id}`}
                                  fontWeight="700"
                                  mr="40%"
                                  data-no-row-toggle
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    bg="blue.200"
                                    color="blackAlpha.300"
                                    ml={4}
                                    className="!text-[#3B68DB]"
                                  >
                                    Reset Password
                                  </Button>
                                </Link>
                              </Flex>
                            )}
                          </Flex>
                        </Td>
                      );
                    }

                    // Instructions column
                    if (
                      headerLabel === "Instructions" ||
                      cell.column.id === "instructions"
                    ) {
                      return (
                        <Td
                          key={cell.id}
                          data-column-id={cell.column.id}
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
                                    {row.original?.pick_up_name || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Instructions: </strong>
                                    {row.original?.pick_up_notes || "N/A"}
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
                    }

                    // Default column render (supports meta.type like your old code)
                    const value = cell.getValue();

                    return (
                      <Td
                        key={cell.id}
                        data-column-id={cell.column.id}
                        paddingLeft={restyleTable && 1}
                        paddingInlineStart={restyleTable && 1}
                        paddingRight={restyleTable && 2}
                        paddingInlineEnd={restyleTable && 2}
                        pr="20px"
                        bg={
                          cell.column.id === "timeslot" &&
                            !["6", "7", "8", "9", "10"].includes(
                              row?.original?.job?.job_status?.id,
                            )
                            ? (getTimeslotBgColor(
                              row?.original?.job?.timeslot,
                            ) ?? "transparent")
                            : "transparent"
                        }
                      >
                        {meta.type === "date" ? (
                          <Text>
                            {value ? formatDate(value, "DD/MM/YYYY") : "-"}
                          </Text>
                        ) : meta.type === "money" ? (
                          <Text>{value ? formatCurrency(value) : "$0"}</Text>
                        ) : meta.type === "boolean" ? (
                          <Text>
                            {value == true
                              ? meta.trueLabel || "Yes"
                              : meta.falseLabel || "No"}
                          </Text>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}

                        {meta.showCompany === true && (
                          <Text className="text-gray-400">
                            {row.original?.company?.name}
                          </Text>
                        )}
                      </Td>
                    );
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
                onClick={previousPage}
              />
              <IconButton
                aria-label="Go to next page"
                icon={<HiChevronRight />}
                isDisabled={!canNextPage}
                onClick={nextPage}
              />
            </ButtonGroup>
          </>
        )}
      </HStack>
    </VStack>
  );
};

export default PaginationTable;
