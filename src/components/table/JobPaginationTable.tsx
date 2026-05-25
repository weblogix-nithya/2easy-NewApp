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
  Textarea,
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
  formatToTimeDate,
} from "@/lib/helpers/helper";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

const getStatusStyle = (status: string) => {
  const st = status?.toLowerCase();

  if (st === "in transit") return { background: "#FFD580", color: "#8B4000" };
  if (st === "assigned") return { background: "#FFFACD", color: "#665c00" };
  if (["completed", "delivered"].includes(st))
    return { background: "#d4edda", color: "#155724" };
  if (["rejected", "cancelled"].includes(st))
    return { background: "#f8d7da", color: "#721c24" };

  return {};
};

// ----------- helpers: accept old v7 columns OR new v8 ColumnDef -----------
function normalizeColumns(columns: any[]) {
  // If columns already look like TanStack ColumnDef (have accessorKey/accessorFn/columnDef-ish),
  // return as-is.
  const looksLikeV8 = columns?.some(
    (c) => "accessorKey" in (c || {}) || "accessorFn" in (c || {}),
  );
  if (looksLikeV8) return columns;

  // Otherwise treat as v7 react-table columns and convert best-effort.
  return (columns || []).map((c: any) => {
    const id = c.id || c.accessor || c.Header;
    const accessor = c.accessor;

    // Put your custom flags/type/showCompany/etc into meta (so your render code can use them)
    const meta = { ...c };

    return {
      id,
      accessorKey: typeof accessor === "string" ? accessor : undefined,
      accessorFn:
        typeof accessor === "function"
          ? (row: any) => accessor(row, undefined, undefined)
          : undefined,
      header: () => {
        // v7 allows Header as string or function
        if (typeof c.Header === "function") return c.Header({ column: c });
        return c.Header ?? "";
      },
      enableSorting:
        c.enableSorting !== undefined
          ? !!c.enableSorting
          : c.disableSortBy
            ? false
            : true,
      cell: (info: any) => {
        // If v7 column had Cell renderer, call it with a v7-ish shape
        if (typeof c.Cell === "function") {
          const v7CellLike = {
            value: info.getValue(),
            row: { original: info.row.original, id: info.row.id },
            column: c,
          };
          return c.Cell(v7CellLike);
        }

        // Default: show value
        const v = info.getValue();
        return v ?? null;
      },
      meta,
    };
  });
}

// v7 sortBy shape expected by your parent: [{ id, desc }]
function toV7SortBy(sortingState: any[]) {
  return (sortingState || []).map((s) => ({ id: s.id, desc: !!s.desc }));
}

type PaginationTableProps<T extends object> = {
  columns: any[]; // accept v7 or v8
  data: T[];
  total: number;
  options?: any; // keep your existing options object (manualPagination, initialState, pageCount, etc.)
  path?: string;
  showDelete?: boolean;
  onDelete?: (data: any) => void;
  showPageSizeSelect?: boolean;
  showManualPages?: boolean;
  isChecked?: boolean;
  onSortingChange?: any;
  restyleTable?: boolean;
  editingDriverId: number | null;
  setEditingDriverId: React.Dispatch<React.SetStateAction<number | null>>;
  freeTextValue?: string;
  savingDriverId?: number | null;
  setSavingDriverId?: React.Dispatch<React.SetStateAction<number | null>>;
  setFreeTextValue?: React.Dispatch<React.SetStateAction<string>>;
  // onContextMenu?: (event: React.MouseEvent, rowData: any) => void;
  onUpdateDriverFreeText?: (driver: any, value: string) => Promise<void>;
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
  onContextMenu,
  editingDriverId,
  setEditingDriverId,
  // setFreeTextValue,
  savingDriverId,
  setSavingDriverId,
  onUpdateDriverFreeText,
  setQueryPageIndex,
  setQueryPageSize,
  onDelete,
}: PaginationTableProps<T>) => {
  const router = useRouter();

  const freeTextRef = useRef<HTMLTextAreaElement>(null);

  const pageSizeOptions = [
    { value: 10, label: "10 / page" },
    { value: 30, label: "30 / page" },
    { value: 50, label: "50 / page" },
    { value: 100, label: "100 / page" },
    { value: 150, label: "150 / page" },
    { value: 200, label: "200 / page" },
  ];

  const v8Columns = React.useMemo(() => normalizeColumns(columns), [columns]);

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
    data,
    columns: v8Columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
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

    enableRowSelection: showRowSelection,
    getRowId: (row: any, index: number) =>
      String(row?.job?.id ?? row?.id ?? index),

    // core models
    getCoreRowModel: getCoreRowModel(),
    // if you do server-side sorting, set manualSorting true
    manualSorting: !!options?.manualSortBy,
    getSortedRowModel: options?.manualSortBy ? undefined : getSortedRowModel(),

    // pagination
    manualPagination: !!options?.manualPagination || isServerSide,
    pageCount:
      (!!options?.manualPagination || isServerSide) &&
      options?.pageCount != null
        ? options.pageCount
        : undefined,
    getPaginationRowModel: getPaginationRowModel(),

    // prevent auto resets (similar to autoResetSelectedRows: false)
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
    if (onSortingChange) onSortingChange(toV7SortBy(sorting));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted(); // 'asc' | 'desc' | false

                return (
                  <Th
                    key={header.id}
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
            const status = row.original?.job?.job_status?.name;

            const driver = row.original?.driver;
            const prevDriver = pageRows[index - 1]?.original?.driver;

            const shouldShowDriverHeader =
              !!driver?.full_name &&
              (!prevDriver?.full_name || driver?.id !== prevDriver?.id);

            return (
              <React.Fragment key={`driver-header-${row.id}`}>
                {shouldShowDriverHeader && (
                  <Tr>
                    <Td fontSize="md" colSpan={columns.length} p={0}>
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
                        {/* ================= ROW 1 ================= */}
                        <Flex
                          w="100%"
                          align="flex-start"
                          justify="space-between"
                          gap={6}
                          mb={4}
                        >
                          {/* LEFT COLUMN — FIXED WIDTH */}
                          <Box minW="420px" maxW="420px">
                            <VStack align="start" spacing={2}>
                              <Badge
                                colorScheme="darkblue"
                                variant="subtle"
                                fontSize="md"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxW="100%"
                              >
                                #{driver?.id} : {driver?.full_name}
                              </Badge>

                              <HStack spacing={3} whiteSpace="nowrap">
                                <Badge
                                  colorScheme="purple"
                                  variant="subtle"
                                  fontSize="md"
                                >
                                  First Collection:{" "}
                                  {formatToTimeDate(
                                    driver?.first_job_start_at_today,
                                  )}
                                </Badge>

                                <Badge
                                  colorScheme="purple"
                                  variant="subtle"
                                  fontSize="md"
                                >
                                  Last Delivery:{" "}
                                  {formatToTimeDate(
                                    driver?.last_job_drop_at_today,
                                  )}
                                </Badge>
                                {driver?.no_max_length != null && (
                                  <Badge
                                    colorScheme="blue"
                                    variant="subtle"
                                    fontSize="md"
                                  >
                                    L: {driver.no_max_length} M
                                  </Badge>
                                )}
                                {driver?.no_max_height != null && (
                                  <Badge
                                    colorScheme="blue"
                                    variant="subtle"
                                    fontSize="md"
                                  >
                                    H: {driver.no_max_height} M
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </Box>

                          {/* CENTER — FIXED START POSITION */}
                          <Box w="550px" flexShrink={0}>
                            {editingDriverId === driver?.id ? (
                              <HStack align="flex-start" spacing={2}>
                                <Textarea
                                  flex="1"
                                  defaultValue={
                                    driver?.today_free_text?.text || ""
                                  }
                                  ref={freeTextRef}
                                  resize="none"
                                  fontSize="md"
                                  bg="gray.100"
                                  color="red.600"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  minH="60px"
                                />

                                <VStack spacing={2}>
                                  <IconButton
                                    aria-label="Save"
                                    size="sm"
                                    colorScheme="green"
                                    icon={<span>✔</span>}
                                    isLoading={savingDriverId === driver?.id}
                                    onClick={async () => {
                                      if (!onUpdateDriverFreeText) return;
                                      try {
                                        const value =
                                          freeTextRef.current?.value || "";
                                        setSavingDriverId(driver?.id);
                                        await onUpdateDriverFreeText(
                                          driver,
                                          value.trim(),
                                        );
                                        setEditingDriverId(null);
                                      } finally {
                                        setSavingDriverId(null);
                                      }
                                    }}
                                  />

                                  <IconButton
                                    aria-label="Cancel"
                                    size="sm"
                                    colorScheme="red"
                                    icon={<span>✖</span>}
                                    onClick={() => setEditingDriverId(null)}
                                  />
                                </VStack>
                              </HStack>
                            ) : (
                              <Box
                                w="100%"
                                minH="60px"
                                px={3}
                                py={2}
                                bg="gray.100"
                                color="red.600"
                                border="1px solid"
                                borderColor="gray.300"
                                borderRadius="md"
                                // whiteSpace="pre-line"
                                cursor="pointer"
                                onClick={() => setEditingDriverId(driver.id)}
                              >
                                {driver?.today_free_text?.text?.trim() ? (
                                  <Box
                                    dangerouslySetInnerHTML={{
                                      __html: driver.today_free_text.text,
                                    }}
                                  />
                                ) : (
                                  "Click to add driver notes"
                                )}
                              </Box>
                            )}
                          </Box>

                          {/* RIGHT — PRICE */}
                          <Box minW="150px" textAlign="right">
                            <>
                              <Badge
                                colorScheme="red"
                                variant="subtle"
                                fontSize="sm"
                                mr={"4px"}
                              >
                                Today Price:{" "}
                                {driver?.total_jobs_today_price ?? 0}
                              </Badge>

                              <Badge
                                colorScheme="red"
                                variant="subtle"
                                fontSize="sm"
                              >
                                Weekly Price:{" "}
                                {driver?.total_jobs_weekly_price ?? 0}
                              </Badge>
                            </>
                          </Box>
                        </Flex>

                        {/* ================= ROW 2 ================= */}
                        <Flex wrap="wrap" align="center" gap={3}>
                          <Badge
                            colorScheme="red"
                            variant="subtle"
                            fontSize="md"
                          >
                            Current Suburb: {driver?.current_suburb ?? "-"}
                          </Badge>

                          <Badge
                            colorScheme="red"
                            variant="subtle"
                            fontSize="md"
                          >
                            Mobile Number: {driver?.phone_no ?? "-"}
                          </Badge>

                          <Badge
                            colorScheme="red"
                            variant="subtle"
                            fontSize="md"
                          >
                            Rego: {driver?.registration_no ?? "-"}
                          </Badge>

                          <Badge
                            colorScheme="red"
                            variant="subtle"
                            fontSize="md"
                          >
                            TAILGATE: {driver?.is_tailgated ? "Yes" : "No"}
                          </Badge>

                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            fontSize="md"
                          >
                            CBM: {driver?.cbm_summary_today ?? 0} /{" "}
                            {driver?.no_max_volume ?? 0}
                          </Badge>

                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            fontSize="md"
                          >
                            Weight: {driver?.weight_summary_today ?? 0} /{" "}
                            {driver?.no_max_capacity ?? 0}
                          </Badge>

                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            fontSize="md"
                          >
                            Pallets: {driver?.no_max_pallets ?? 0}
                          </Badge>
                        </Flex>
                      </Box>
                    </Td>
                  </Tr>
                )}
                <Tr
                  key={`data-row-${row.id}`}
                  style={getStatusStyle(status)}
                  cursor={showRowSelection ? "pointer" : "default"}
                   onContextMenu={(e) => {
                    if (onContextMenu) {
                      // ✅ Check if handler exists
                      onContextMenu(e, row.original.job);
                    }
                  }}
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
