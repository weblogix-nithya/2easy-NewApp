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
import React, { memo, useCallback, useEffect, useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const EXCLUDED_IDS = new Set([
  "actions",
  "admin_notes",
  "timeslot",
  "job_destinations.address",
]);

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

const DriverHeaderRow = memo(({
  driver,
  columnsLength,
  onAssignClick,
}: {
  driver: any;
  columnsLength: number;
  onAssignClick?: (driver: any) => void;
}) => (
  <Tr>
    <Td colSpan={columnsLength} p={0}>
      <Box
        bg={driver.bgcolor === "blue" ? "rgb(29, 45, 83)" : "rgb(250, 220, 82)"}
        color={driver.bgcolor === "yellow" ? "#000" : "#fff"}
        px={6} py={3}
        borderTop="4px solid" borderLeft="4px solid"
        borderColor="#2F80ED"
        borderRadius="md" w="100%"
      >
        <VStack align="start" spacing={3} w="full">
          <Flex direction="column" align="start" wrap="wrap" gap={3} w="full">
            <Flex wrap="wrap" align="start" gap={3}>
              <Badge colorScheme="Darkblue" variant="subtle" fontSize="md" style={{ marginRight: "10px" }}>
                #{driver.id} : {driver.full_name}
              </Badge>
              <Badge colorScheme="purple" variant="subtle" fontSize="md">
                First Collection: {formatToTimeDate(driver.first_job_start_at_today)}
              </Badge>
              <Badge colorScheme="purple" variant="subtle" fontSize="md">
                Last Delivery: {formatToTimeDate(driver.last_job_drop_at_today)}
              </Badge>
              {driver.bgcolor === "yellow" && (
                <Button
                  type="button" px={5} py={1} colorScheme="blue" fontSize="sm"
                  onClick={(e) => { e.stopPropagation(); onAssignClick?.(driver); }}
                >
                  Assign Jobs
                </Button>
              )}
              {driver.bgcolor === "blue" && (
                <>
                  <Badge colorScheme="red" variant="subtle" fontSize="sm">
                    Today Price: {driver.total_jobs_today_price ?? 0}
                  </Badge>
                  <Badge colorScheme="red" variant="subtle" fontSize="sm">
                    Weekly Price: {driver.total_jobs_weekly_price ?? 0}
                  </Badge>
                </>
              )}
            </Flex>
          </Flex>
          <Flex wrap="wrap" align="start" gap={3} w="full">
            <Badge colorScheme="red" variant="subtle" fontSize="sm">Current Suburb: {driver.current_suburb || "-"}</Badge>
            <Badge colorScheme="red" variant="subtle" fontSize="sm">Mobile Number: {driver.phone_no || "-"}</Badge>
            <Badge colorScheme="red" variant="subtle" fontSize="sm">Rego: {driver.registration_no ?? "-"}</Badge>
            <Badge colorScheme="red" variant="subtle" fontSize="sm">TAILGATE: {driver.is_tailgated ? "Yes" : "No"}</Badge>
            <Badge colorScheme="blue" variant="subtle" fontSize="sm">
              CBM: {driver.cbm_summary_today ?? 0} / {driver.no_max_volume ?? 0}
            </Badge>
            <Badge colorScheme="blue" variant="subtle" fontSize="sm">
              Weight: {driver.weight_summary_today ?? 0} / {driver.no_max_capacity ?? 0}
            </Badge>
            <Badge colorScheme="blue" variant="subtle" fontSize="sm">Pallets: {driver.no_max_pallets ?? 0}</Badge>
          </Flex>
        </VStack>
      </Box>
    </Td>
  </Tr>
));
DriverHeaderRow.displayName = "DriverHeaderRow";

const DataRow = memo(function DataRow({
  row,
  isSelected,
  showRowSelection,
  restyleTable,
  path,
  onContextMenu,
  onToggle,
  onDelete,
}: {
  row: any;
  isSelected: boolean;
  showRowSelection: boolean;
  restyleTable: boolean;
  path?: string;
  onContextMenu?: (e: React.MouseEvent, job: any) => void;
  onToggle: (row: any) => void;
  onDelete?: (id: any) => void;
}) {
  const status = row.original?.job?.job_status?.name;

  const handleRowClick = useCallback((e: React.MouseEvent) => {
    if (!showRowSelection) return;
    const target = e.target as HTMLElement;
    if (isInteractive(target)) return;
    const td = target.closest("td");
    const colId = td?.getAttribute("data-column-id") || "";
    if (EXCLUDED_IDS.has(colId)) return;
    onToggle(row);
  }, [showRowSelection, onToggle, row]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (showRowSelection) onToggle(row);
  }, [showRowSelection, onToggle, row]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (onContextMenu) onContextMenu(e, row.original.job);
  }, [onContextMenu, row.original.job]);

  return (
    <Tr
      style={getStatusStyle(status)}
      cursor={showRowSelection ? "pointer" : "default"}
      onContextMenu={handleContextMenu}
      onClick={handleRowClick}
    >
      {row.getVisibleCells().map((cell: any) => {
        const meta = cell.column.columnDef.meta || {};
        const headerLabel = meta.Header;

        if (cell.column.id === "selection") {
          return (
            <Td
              key={cell.id}
              data-column-id="selection"
              onClick={handleCheckboxClick}
              cursor="pointer"
            >
              <Box pointerEvents="none">
                <HStack>
                  <Box
                    boxSize="16px"
                    border="1px solid"
                    borderColor="gray.300"
                    borderRadius="2px"
                    bg={isSelected ? "blue.500" : "white"}
                    position="relative"
                  >
                    {isSelected && (
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

        if (headerLabel === "Actions" || cell.column.id === "actions") {
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
                    onClick={() => onDelete?.(row.original?.job?.id)}
                  >
                    <FontAwesomeIcon
                      icon={meta.deleteIcon != undefined ? meta.deleteIcon : faTrashAlt}
                      className="!text-[var(--chakra-colors-black-400)]"
                      size="lg"
                    />
                  </Button>
                )}
              </Flex>
            </Td>
          );
        }

        if (headerLabel === "Instructions" || cell.column.id === "instructions") {
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
              <Text>{value ? formatDate(value, "DD/MM/YYYY") : "-"}</Text>
            ) : meta.type === "money" ? (
              <Text>{value ? formatCurrency(value) : "$0"}</Text>
            ) : meta.type === "boolean" ? (
              <Text>
                {value == true ? meta.trueLabel || "Yes" : meta.falseLabel || "No"}
              </Text>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}

            {meta.showCompany === true && (
              <Text className="text-gray-400">{row.original?.company?.name}</Text>
            )}
          </Td>
        );
      })}
    </Tr>
  );
}, (prev, next) => {
  return (
    prev.row.id === next.row.id &&
    prev.row.original === next.row.original &&
    prev.isSelected === next.isSelected &&
    prev.showRowSelection === next.showRowSelection &&
    prev.restyleTable === next.restyleTable &&
    prev.path === next.path &&
    prev.onContextMenu === next.onContextMenu &&
    prev.onToggle === next.onToggle &&
    prev.onDelete === next.onDelete
  );
});
DataRow.displayName = "DataRow";


export const getTimeslotBgColor = (time: string | null | undefined) => {
  const diffMinutes = getTimeDifferenceInMinutes(time);

  if (diffMinutes === null) return "transparent";


  if (diffMinutes <= 60) return "#e63a49"; //red
  if (diffMinutes <= 120) return "#ff7f00"; //orange
  return "#00ff00"; //green
};

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
  freeTextValue?: string;
  savingDriverId?: number | null;
  setSavingDriverId?: React.Dispatch<React.SetStateAction<number | null>>;
  setFreeTextValue?: React.Dispatch<React.SetStateAction<string>>;
  onUpdateDriverFreeText?: (driver: any, value: string) => Promise<void>;
  onContextMenu?: (event: React.MouseEvent, rowData: any) => void;
  refetchJobs?: () => void;
  onAssignClick?: (driver: any) => void;
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
  onAssignClick,
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

  const v8Columns = React.useMemo(() =>
    columns.map((col: any) => {
      const {
        accessorKey: _accessorKey,
        accessor: _accessor,
        ...rest
      } = col;

      const realAccessorFn =
        col.accessorFn ??
        (typeof col.accessor === "function"
          ? col.accessor
          : typeof col.accessor === "string" &&
            !col.accessor.includes(".") &&
            !col.accessor.includes(",")
            ? (row: any) => row?.[col.accessor]
            : () => null);

      return {
        ...rest,
        header: col.header ?? (
          typeof col.Header === "string"
            ? col.Header
            : col.Header
              ? (props: any) => col.Header(props)
              : col.id
        ),
        cell: col.cell ?? (
          col.Cell
            ? (props: any) => col.Cell({ row: props.row, getValue: props.getValue })
            : undefined
        ),
        // Always supply an explicit accessorFn and strip any accessorKey /
        // accessor above. Column ids here are often compound, display-only
        // keys like "job_category.name,ready_at,drop_at" — if TanStack sees
        // a dotted accessorKey (or falls back to the id), it parses it as a
        // nested key path and logs "deeply nested key returned undefined".
        // These columns render via a custom `cell`, so a no-op accessor
        // returning null is correct and silences the warnings.
        accessorFn: realAccessorFn,
      };
    })
    , [columns]);

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

    getCoreRowModel: getCoreRowModel(),
    manualSorting: !!options?.manualSortBy,
    getSortedRowModel: options?.manualSortBy ? undefined : getSortedRowModel(),

    manualPagination: !!options?.manualPagination || isServerSide,
    pageCount:
      (!!options?.manualPagination || isServerSide) &&
        options?.pageCount != null
        ? options.pageCount
        : undefined,
    getPaginationRowModel: getPaginationRowModel(),

    autoResetAll: false,
  });

  const optimisticSelRef = React.useRef<Map<string, boolean>>(new Map());
  const [, force] = React.useState(0);
  const forceUpdate = useCallback(() => force((x) => x + 1), []);

  const selectedRows = table.getSelectedRowModel().rows;

  useEffect(() => {
    const selectedIds = new Set(selectedRows.map((r: any) => r.id));
    optimisticSelRef.current.forEach((val, key) => {
      if (val === selectedIds.has(key)) {
        optimisticSelRef.current.delete(key);
      }
    });
  }, [selectedRows]);

  const getOptimisticSelected = useCallback((row: any) => {
    const v = optimisticSelRef.current.get(row.id);
    return typeof v === "boolean" ? v : row.getIsSelected();
  }, []);

  const toggleOptimisticRow = useCallback((row: any) => {
    const current = optimisticSelRef.current.get(row.id);
    const next = typeof current === "boolean" ? !current : !row.getIsSelected();
    optimisticSelRef.current.set(row.id, next);
    forceUpdate();
    row.toggleSelected(next);
  }, [forceUpdate]);

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

  useEffect(() => {
    if (showRowSelection && setSelectedRow) {
      setSelectedRow(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRowSelection, rowSelection]);

  useEffect(() => {
    if (onSortingChange) onSortingChange(sorting);
  }, [sorting]);

  useEffect(() => {
    if (isChecked === false) {
      table.toggleAllRowsSelected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecked]);

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
      {/* <Table colorScheme="white"> */}
      <Table
        colorScheme="white"
        border="1px solid"
        borderColor="gray.200"
        sx={{
          "th, td": {
            border: "1px solid",
            borderColor: "gray.200",
          },
        }}
      >
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
            const driver = row.original?.driver;
            const prevDriver = pageRows[index - 1]?.original?.driver;

            const shouldShowDriverHeader =
              !!driver?.full_name &&
              (!prevDriver?.full_name ||
                driver?.id !== prevDriver?.id ||
                driver?.bgcolor !== prevDriver?.bgcolor);

            return (
              <React.Fragment key={`driver-header-${row.id}`}>
                {shouldShowDriverHeader && (
                  <DriverHeaderRow
                    driver={driver}
                    columnsLength={columns.length}
                    onAssignClick={onAssignClick}
                  />
                )}
                <DataRow
                  key={`data-row-${row.id}`}
                  row={row}
                  isSelected={getOptimisticSelected(row)}
                  showRowSelection={showRowSelection}
                  restyleTable={restyleTable}
                  path={path}
                  onContextMenu={onContextMenu}
                  onToggle={toggleOptimisticRow}
                  onDelete={onDelete}
                />
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