// @ts-nocheck
import {
  Button,
  ButtonGroup,
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
import { formatCurrency, formatDate } from "@/lib/helpers/helper";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
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

type PaginationTableProps<T extends object> = {
  data: T[];
  // columns: Column<T>[];
  // options?: Omit<TableOptions<T>, "data" | "columns">;
  // plugins?: PluginHook<T>[];
  columns: any[];
  options?: any; // changed: legacy v7 options accepted for initialState only
  path?: string;
  // showDelete?: boolean; // changed: unused prop
  total?: number;
  onDelete?: (data: any) => void;
  showPageSizeSelect?: boolean;
  showManualPages?: boolean;
  isChecked?: boolean;
  restyleTable?: boolean;
  hideEditForStatuses?: number[];
  // onSortingChange?: any;
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

const PaginationTableCustomer = <T extends object>({
  columns,
  data,
  isServerSide = false,
  total,
  options,
  // plugins = [], // changed: v7 plugin system not used in v8
  // showDelete = false,
  setQueryPageIndex,
  setQueryPageSize,
  onDelete,
  path,
  showPageSizeSelect = false,
  showManualPages = false,
  showRowSelection = false,
  isFilterRowSelected = false,
  setSelectedRow,
  isChecked,
  // onSortingChange,
  restyleTable = false,
  hideEditForStatuses,
}: PaginationTableProps<T>) => {
  const router = useRouter();
  // const [pageRows, setPageRows] = useState([]); // changed: derive from rows instead of state

  const pageSizeOptions = [
    { value: 10, label: "10 / page" },
    { value: 30, label: "30 / page" },
    { value: 50, label: "50 / page" },
    { value: 100, label: "100 / page" },
    { value: 150, label: "150 / page" },
    { value: 200, label: "200 / page" },
  ];

  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: options?.initialState?.pageIndex ?? 0,
    pageSize: options?.initialState?.pageSize ?? 10,
  });

  // const [sorting, setSorting] = React.useState<any[]>(
  //   options?.initialState?.sortBy ?? [],
  // );

  // const {
  //   getTableProps,
  //   getTableBodyProps,
  //   headerGroups,
  //   prepareRow,
  //   page,
  //   canPreviousPage,
  //   canNextPage,
  //   nextPage,
  //   previousPage,
  //   setPageSize,
  //   state: { pageIndex, pageSize, sortBy },
  //   selectedRows,
  //   gotoPage,
  //   table.getPageCount(),
  //   toggleAllRowsSelected,
  //   // toggleSortBy,
  // } = useTable<T>(
  //   {
  //     ...options,
  //     columns,
  //     data,
  //   },
  //   useSortBy,
  //   usePagination,
  //   // ...plugins,
  //   useRowSelect,
  // );

  const table = useReactTable({
    data,
    columns,
    state: {
      // sorting,
      rowSelection,
      pagination,
    },
    // onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  const previousPage = () => table.previousPage();
  const nextPage = () => table.nextPage();
  const setPageSize = (size: number) => table.setPageSize(size); // changed: v8 page size setter

  const selectedRows = table.getSelectedRowModel().rows;
  const rows = table.getRowModel().rows;

  useEffect(() => {
    if (isServerSide && setQueryPageIndex && setQueryPageSize) {
      setQueryPageIndex(pageIndex);
      setQueryPageSize(pageSize);
    }
  }, [isServerSide, pageIndex, pageSize, setQueryPageIndex, setQueryPageSize]);

  useEffect(() => {
    if (showRowSelection) {
      setSelectedRow(selectedRows);
    }
    // changed: removed pageRows state management; derive below instead
  }, [isFilterRowSelected, showRowSelection, setSelectedRow, selectedRows]);

  // changed: derive pageRows from rows instead of managing state
  const pageRows = isFilterRowSelected
    ? rows.filter((row) => row.getIsSelected())
    : rows;
  // (old pattern: used useState and setPageRows in effect; now derived)

  const renderPageNumbers = () => {
    const pages = [];
    const endPage = Math.min(pageIndex + 9, table.getPageCount());
    for (let i = pageIndex; i <= endPage; i++) {
      pages.push(
        <Button onClick={() => table.setPageIndex(i)} key={`page-index-${i}`}>
          {i + 1}
        </Button>,
      );
    }
    return pages;
  };

  // const previousSorting = useRef<any[]>(sorting);
  //
  // useEffect(() => {
  //   if (!onSortingChange) return;
  //
  //   const sameSorting =
  //     previousSorting.current.length === sorting.length &&
  //     sorting.every(
  //       (item: any, index: number) =>
  //         item?.id === previousSorting.current[index]?.id &&
  //         item?.desc === previousSorting.current[index]?.desc,
  //     );
  //
  //   if (sameSorting) return;
  //
  //   previousSorting.current = sorting;
  //   onSortingChange(sorting);
  // }, [sorting, onSortingChange]);

  useEffect(() => {
    if (isChecked === false) {
      table.toggleAllRowsSelected(false);
    }
  }, [isChecked]);

  return (
    <VStack w="full" align="start" spacing={4}>
      <Table colorScheme="white">
        <Thead>
          {table.getHeaderGroups().map((headerGroup, index) => (
            // <Tr
            //   // {...headerGroup.getHeaderGroupProps()}
            //   key={`header-row-${index}`}
            // >
            <Tr key={`header-row-${headerGroup.id}`}>
              {headerGroup.headers.map((header) => {
                // const isSorted = header.column.getIsSorted();

                // changed: added return statement (was missing, caused render bug)
                return (
                  <Th
                    // {...column.getHeaderProps(
                    //   column.enableSorting
                    //     ? header.column.getToggleSortingHandler()
                    //     : undefined,
                    // )}
                    // {...column.getHeaderProps()} // changed: v7 patterns commented out
                    key={`row-header-${header.id}`}
                    // onClick={
                    //   header.column.getCanSort()
                    //     ? header.column.getToggleSortingHandler()
                    //     : undefined
                    // }
                    // key={`row-header-${column.id}`}
                    paddingLeft={restyleTable && 1}
                    paddingInlineStart={restyleTable && 1}
                    paddingRight={restyleTable && 2}
                    paddingInlineEnd={restyleTable && 2}
                  >
                    {restyleTable}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {/* {header.column.getCanSort() && (
                      <span>
                        {isSorted === "desc" ? (
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
                    )} */}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>

        <Tbody>
          {pageRows?.map((row, index) => {
            // prepareRow(row);
            return (
              <Tr
                // {...row.getRowProps()}
                key={`row-${index || row.id}`}
                // onClick={isChecked ? () => row.toggleRowSelected() : undefined}
                onClick={isChecked ? row.getToggleSelectedHandler() : undefined}
              >
                {row?.getVisibleCells()?.map((cell, index) => {
                  const meta: any = cell.column.columnDef.meta || {};
                  const headerLabel = meta.Header;
                  let data;
                  if (headerLabel === "Actions") {
                    // compute safe href base and id to avoid undefined segments
                    const basePath = path || "/admin/jobs";
                    const rowId =
                      // many data shapes use row.original as the job
                      // fall back to nested job.id or the column value
                      row?.original?.id ??
                      row?.original?.job?.id ??
                      cell.getValue();

                    data = (
                      <Td
                        key={`action-${index}`}
                        paddingLeft={restyleTable && 1}
                        paddingInlineStart={restyleTable && 1}
                        paddingRight={restyleTable && 2}
                        paddingInlineEnd={restyleTable && 2}
                      >
                        {/* {
                          //@ts-expect-error
                          meta.isDownload && (
                            <Link
                              // href={cell.getValue()}
                              href={cell.getValue() as string}
                              target="_blank"
                              fontWeight="700"
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
                       */}
                        {
                          //@ts-expect-error
                          meta.isView && (
                            <Link
                              href={rowId ? `${basePath}/${rowId}` : basePath}
                              fontWeight="700"
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
                          meta.isTracking &&
                            hideEditForStatuses?.includes(
                              Number(row.original?.job_status_id),
                            ) && (
                              <Link
                                href={
                                  rowId
                                    ? `${basePath}/tracking/${rowId}`
                                    : `${basePath}`
                                }
                                fontWeight="700"
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
                        {/* {
                          //@ts-expect-error
                          meta.isDelete && (
                            <Button
                              // bg={boxBg}
                              bg="white"
                              fontSize="sm"
                              // fontWeight="500"
                              className="!text-[var(--chakra-colors-black-400)]"
                              onClick={() => {
                                onDelete(cell.row.original.id);
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
                        } */}
                      </Td>
                    );
                  } else if (headerLabel === "Instructions") {
                    data = (
                      <Td
                        // {...cell.getCellProps()}
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
                          />
                        </Tooltip>
                      </Td>
                    );
                  } else {
                    data = (
                      <Td
                        // {...cell.getCellProps()}
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
                              {cell.getValue()
                                ? formatDate(cell.getValue(), "DD/MM/YYYY")
                                : "-"}
                            </Text>
                          ) : cell.column.type === "money" ? (
                            <Text>
                              {cell.getValue()
                                ? formatCurrency(cell.getValue())
                                : "$0"}
                            </Text>
                          ) : cell.column.type === "boolean" ? (
                            <Text>
                              {cell.getValue() == true
                                ? cell.column.trueLabel || "Yes"
                                : cell.column.falseLabel || "No"}
                            </Text>
                          ) : (
                            // cell.render("Cell")
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )
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
            );
          })}
        </Tbody>
      </Table>

      <HStack w="full" justify="space-between">
        {!isFilterRowSelected && showPageSizeSelect && (
          <HStack minW="xs">
            <Select
              isSearchable={false}
              size="sm"
              maxW="70px"
              value={pageSizeOptions.find((option) => option.value == pageSize)}
              onChange={(e) => setPageSize(Number(e.value))}
              options={pageSizeOptions}
              classNamePrefix="chakra-react-select"
              menuPosition={"fixed"}
            />
          </HStack>
        )}

        {!isFilterRowSelected &&
          (showManualPages ? (
            <ButtonGroup isAttached variant="outline" flexWrap="wrap">
              <IconButton
                aria-label="Go to previous page"
                icon={<HiChevronLeft />}
                isDisabled={!canPreviousPage}
                onClick={() => previousPage()}
              />
              {renderPageNumbers()}
              <IconButton
                aria-label="Go to next page"
                icon={<HiChevronRight />}
                isDisabled={!canNextPage}
                onClick={() => nextPage()}
              />
            </ButtonGroup>
          ) : (
            <>
              <Text>
                Showing {pageIndex * pageSize + 1} to{' '}
                {data.length} of {(pageIndex + 1) * pageSize} entries
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
          ))}
      </HStack>
    </VStack>
  );
};

export default PaginationTableCustomer;
