import {
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Image,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { faTrashAlt } from "@fortawesome/pro-light-svg-icons";
import { faDownload, faPen } from "@fortawesome/pro-regular-svg-icons";
import { faMessageLines } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
// import {
//   Column,
//   PluginHook,
//   TableOptions,
//   usePagination,
//   useTable,
// } from "react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

type PaginationTableProps<T extends object> = {
  columns: any[];
  data: T[];
  options?: any;
  // Omit<TableOptions<T>, "data" | "columns">;
  // plugins?: PluginHook<T>[];
  path?: string;
  onDelete?: (data: any) => void;
  onLinkEvent?: (id: number, status: number) => void;
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
);

const PaginationMultipleImageTable = <T extends object>({
  columns,
  data,
  isServerSide = false,
  // options,
  setQueryPageIndex,
  setQueryPageSize,
  onDelete,
  onLinkEvent,
  path,
}: PaginationTableProps<T>) => {
  const textColorLink = useColorModeValue("blue.600", "blue");

  // const tableColumns = React.useMemo<Column<T>[]>(
  //   () => columns ?? [],
  //   [columns],
  // );
  // const tableData = React.useMemo<T[]>(
  //   () => (Array.isArray(data) ? data : []),
  //   [data],
  // );

  const tableColumns = React.useMemo(() => columns ?? [], [columns]);

  const tableData = React.useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );
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
  //   // setPageSize,
  //   state: { pageIndex, pageSize },
  // } = useTable<T>(
  //   {
  //     // columns,
  //     // data,
  //     ...(options ?? {}),
  //     columns: tableColumns,
  //     data: tableData,
  //   } as TableOptions<T>,
  //   usePagination,
  //   ...(plugins ?? []),
  // );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  const previousPage = () => table.previousPage();
  const nextPage = () => table.nextPage();

  console.log("tableData", tableData);
  useEffect(() => {
    if (isServerSide && setQueryPageIndex && setQueryPageSize) {
      setQueryPageIndex(pageIndex);
      setQueryPageSize(pageSize);
    }
  }, [isServerSide, pageIndex, pageSize, setQueryPageIndex, setQueryPageSize]);

  return (
    <VStack w="full" align="start" spacing={4}>
      {/* <HStack minW="xs">
        <Select
          size="sm"
          maxW="70px"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </Select>
        <Text>entries per page</Text>
      </HStack> */}
      <Table colorScheme="white">
        <Thead>
          {table.getHeaderGroups().map((headerGroup, index) => (
            <Tr
              // {...headerGroup.getHeaderGroupProps()}
              key={`header-row-${index}`}
            >
              {headerGroup.headers.map((header) => (
                <Th
                  // {...column.getHeaderProps()}
                  key={`row-header-${header.id}`}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>

        <Tbody>
          {/* {page?.map((row, index) => { */}
          {table.getRowModel().rows.map((row, index) => {
            // prepareRow(row);

            return (
              <Tr key={`row-${index || row.id}`}>
                {/* {row?.cells?.map((cell, index) => { */}
                {row?.getVisibleCells()?.map((cell, index) => {
                  // const meta: any = cell.column.columnDef.meta || {};
                  const meta: any = cell.column.columnDef.meta || {};
                  const headerLabel = meta.Header;
                  let data;
                  if (headerLabel === "Actions") {
                    data = (
                      <Td key={`action-${index}`}>
                        {
                          //@ts-ignore
                          meta.isDelete && (
                            <Button
                              // bg={boxBg}
                              bg="white"
                              fontSize="sm"
                              // fontWeight="500"
                              className="!text-[var(--chakra-colors-black-400)]"
                              onClick={() => {
                                //@ts-ignore
                                onDelete(cell.row.original.id);
                              }}
                              // color={textColorSecondary}
                              // borderRadius="7px"
                            >
                              <FontAwesomeIcon
                                icon={faTrashAlt}
                                className="!text-[var(--chakra-colors-black-400)]"
                                size="lg"
                              />
                            </Button>
                          )
                        }
                        {
                          //@ts-ignore
                          meta.isLinkAction && (
                            <Link
                              bg="white"
                              color={textColorLink}
                              fontSize="sm"
                              onClick={() => {
                                //@ts-ignore
                                onLinkEvent?.(
                                  (cell.row.original as any).id,
                                  cell.getValue() as number,
                                );
                              }}
                            >
                              {cell.getValue() == 1
                                ? "Mark as resolved"
                                : "Mark as open"}
                            </Link>
                          )
                        }
                        {
                          //@ts-ignore
                          meta.isDownload && (
                            <Link
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
                        {
                          //@ts-ignore
                          ((!meta.isLinkAction &&
                            //@ts-ignore
                            !meta.isDelete &&
                            //@ts-ignore
                            !meta.isDownload) ||
                            //@ts-ignore
                            meta.isEdit) && (
                            <Link
                              href={`${path || ""}/${cell.getValue() as string}`}
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
                                  icon={faPen}
                                  className="!text-[var(--chakra-colors-black-400)]"
                                  size="lg"
                                />
                              </Button>
                            </Link>
                          )
                        }
                      </Td>
                    );
                  } else if (headerLabel === "Instructions") {
                    data = (
                      <Td
                        // {...cell.getCellProps()}
                        key={`instructions-${index}`}
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
                    //@ts-ignore
                  } else if (meta.isMultipleImage) {
                    const images = cell.getValue() as {
                      downloadable_url: string;
                      name: string;
                    }[];
                    data = (
                      <Td key={`default-${index}`}>
                        {/* {...cell.getCellProps()} */}
                        <Grid
                          templateAreas={`"nav main"`}
                          gridTemplateColumns={"50% 1fr"}
                          h="auto"
                          gap="1"
                          color="blackAlpha.700"
                          fontWeight="bold"
                        >
                          {/* Left side */}
                          {images &&
                            images.map(
                              (
                                image: {
                                  downloadable_url: string;
                                  name: string;
                                },
                                index: React.Key,
                              ) => (
                                <GridItem key={index}>
                                  <Flex
                                    alignItems="center"
                                    justifyContent="center"
                                    width="100px"
                                    height="100px"
                                    marginTop={1}
                                    marginBottom={1}
                                    border="1px solid #E2E8F0"
                                    borderRadius="14px"
                                    mr="4"
                                  >
                                    <Link
                                      href={image.downloadable_url}
                                      target="_blank"
                                      fontWeight="700"
                                    >
                                      <Image
                                        src={image.downloadable_url}
                                        alt={image.name}
                                        borderRadius="14px"
                                        width="100%"
                                        height="100%"
                                        objectFit="cover"
                                      />
                                    </Link>
                                  </Flex>
                                </GridItem>
                              ),
                            )}
                        </Grid>
                        {/* {(!cell.getValue() || cell.getValue().length === 0) && ( */}
                        {(!images || images.length === 0) && (
                          <Flex
                            alignItems="center"
                            justifyContent="center"
                            width="130px"
                            height="130px"
                            border="1px solid #E2E8F0"
                            borderRadius="4px"
                            mr="4"
                          >
                            <Text>No Image</Text>
                          </Flex>
                        )}
                      </Td>
                    );
                  } else {
                    data = (
                      <Td key={`default-${index}`}>
                        {/* {cell.render("Cell")} */}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
        <Text>
          Showing {pageIndex * pageSize + 1} to {(pageIndex + 1) * pageSize} of{" "}
          {data?.length} entries
        </Text>
        <ButtonGroup isAttached variant="outline">
          <IconButton
            aria-label="Go to previous page"
            icon={<HiChevronLeft />}
            disabled={!canPreviousPage}
            onClick={() => previousPage()}
          />
          <IconButton
            aria-label="Go to next page"
            icon={<HiChevronRight />}
            disabled={!canNextPage}
            onClick={() => nextPage()}
          />
        </ButtonGroup>
      </HStack>
    </VStack>
  );
};

export default PaginationMultipleImageTable;
