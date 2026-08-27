import {
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { faTrashAlt } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomInputField from "components/fields/CustomInputField";
import { QuoteItem } from "graphql/quoteItem";
import React, { useMemo } from "react";
import { PluginHook, usePagination, useTable } from "react-table";

type PaginationTableProps<T extends QuoteItem> = {
  data: T[];
  optionsSelect?: any[];
  plugins?: PluginHook<T>[];
  onRemoveClick?: (id: number) => void;
  onValueChanged?: (value: any, index: number, fieldToUpdate?: string) => void;
};

const QuoteItemsTable = ({
  data,
  onRemoveClick,
  onValueChanged,
  optionsSelect = [],
  plugins = [],
}: PaginationTableProps<QuoteItem>) => {
  const columns = useMemo(
    () => [
      {
        Header: "Type",
      },
      {
        Header: "DIMENSIONS (L,W,H)",
      },
      {
        Header: "QTY",
      },
      {
        Header: "WEIGHT",
      },
      {
        Header: "CBM",
      },
      {
        Header: "Action",
      },
    ],
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups } =
    useTable<QuoteItem>(
      { ...optionsSelect, columns, data },
      usePagination,
      ...plugins,
    );

  function handleInputHighlight(
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ): void {
    // User request to highlight input field on click
    event.currentTarget.select();
  }

  return (
    <VStack w="full" align="start" spacing={4}>
      {/* */}
      <Table colorScheme="white" {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup, index) => (
            <Tr
              {...headerGroup.getHeaderGroupProps()}
              key={`header-row-${index}`}
            >
              {headerGroup.headers.map((column) => (
                <Th
                  {...column.getHeaderProps()}
                  key={`row-header-${column.id}`}
                  className="first:pl-0"
                >
                  {column.render("Header")}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>

        <Tbody {...getTableBodyProps()}>
          {data.map((row, index) => {
            return (
              <Tr key={index + row.id}>
                <Td padding={"0px"}>
                  <CustomInputField
                    isSelect={true}
                    optionsArray={optionsSelect}
                    showLabel={false}
                    value={optionsSelect.find(
                      (_entity) => _entity.value === row.item_type_id,
                    )}
                    placeholder=""
                    onChange={(e) => {
                      onValueChanged(
                        { ...row, item_type_id: e.value || null },
                        index,
                      );
                    }}
                    mb="0"
                    maxWidth="100%"
                    minWidth="150px"
                  />
                </Td>

                <Td>
                  <Flex align="center">
                    <CustomInputField
                      // inputRef={heightRef}
                      type="number"
                      showLabel={false}
                      placeholder="0.00"
                      name="dimension_height"
                      defaultValue={
                        row.dimension_height_cm
                          ? row.dimension_height_cm
                          : (row.dimension_height * 100).toFixed(2)
                      }
                      suffixText="cm"
                      onClick={handleInputHighlight}
                      onChange={(e) => {
                        onValueChanged(
                          {
                            ...row,
                            [e.target.name]:
                              parseFloat(e.target.value) / 100 || 0,
                            [e.target.name + "_cm"]:
                              parseFloat(e.target.value) || 0,
                          },
                          index,
                          "volume",
                        );
                      }}
                      maxWidth="95%"
                      mb="0"
                      inputStyles={
                        row.dimension_height_cm == 0.0 ||
                        (row.dimension_height * 100).toFixed(2) == "0.00"
                          ? { color: "var(--chakra-colors-secondaryGray-600)" }
                          : null
                      }
                    />

                    <CustomInputField
                      type="number"
                      // inputRef={widthRef}
                      showLabel={false}
                      placeholder="0.00"
                      name="dimension_width"
                      defaultValue={
                        row.dimension_width_cm
                          ? row.dimension_width_cm
                          : (row.dimension_width * 100).toFixed(2)
                      }
                      suffixText="cm"
                      onClick={handleInputHighlight}
                      onChange={(e) => {
                        onValueChanged(
                          {
                            ...row,
                            [e.target.name]:
                              parseFloat(e.target.value) / 100 || null,
                            [e.target.name + "_cm"]:
                              parseFloat(e.target.value) || null,
                          },
                          index,
                          "volume",
                        );
                      }}
                      maxWidth="95%"
                      mb="0"
                      inputStyles={
                        row.dimension_width_cm == 0.0 ||
                        (row.dimension_width * 100).toFixed(2) == "0.00"
                          ? { color: "var(--chakra-colors-secondaryGray-600)" }
                          : null
                      }
                    />

                    <CustomInputField
                      type="number"
                      // inputRef={depthRef}
                      showLabel={false}
                      placeholder="0.00"
                      name="dimension_depth"
                      defaultValue={
                        row.dimension_depth_cm
                          ? row.dimension_depth_cm
                          : (row.dimension_depth * 100).toFixed(2)
                      }
                      suffixText="cm"
                      onClick={handleInputHighlight}
                      onChange={(e) => {
                        onValueChanged(
                          {
                            ...row,
                            [e.target.name]:
                              parseFloat(e.target.value) / 100 || null,
                            [e.target.name + "_cm"]:
                              parseFloat(e.target.value) || null,
                          },
                          index,
                          "volume",
                        );
                      }}
                      maxWidth="95%"
                      mb="0"
                      inputStyles={
                        row.dimension_depth_cm == 0.0 ||
                        (row.dimension_depth * 100).toFixed(2) == "0.00"
                          ? { color: "var(--chakra-colors-secondaryGray-600)" }
                          : null
                      }
                    />
                  </Flex>
                </Td>

                <Td>
                  <CustomInputField
                    showLabel={false}
                    type="number"
                    placeholder="0"
                    maxWidth="95%"
                    name="quantity"
                    value={row.quantity}
                    onChange={(e) => {
                      onValueChanged(
                        {
                          ...row,
                          [e.target.name]: parseInt(e.target.value) || null,
                        },
                        index,
                        "volume",
                      );
                    }}
                    mb="0"
                  />
                </Td>

                <Td>
                  <CustomInputField
                    showLabel={false}
                    placeholder=""
                    maxWidth="100%"
                    name="weight"
                    value={row.weight}
                    suffixText="kg"
                    onChange={(e) => {
                      onValueChanged(
                        {
                          ...row,
                          [e.target.name]: parseFloat(e.target.value) || null,
                        },
                        index,
                      );
                    }}
                    mb="0"
                  />
                </Td>

                <Td>
                  <CustomInputField
                    type="number"
                    showLabel={false}
                    placeholder="0.00"
                    maxWidth="100%"
                    name="volume"
                    value={row.volume}
                    suffixText="cbm"
                    onChange={(e) => {
                      onValueChanged(
                        {
                          ...row,
                          [e.target.name]: parseFloat(e.target.value) || null,
                          [e.target.name + "_cm"]:
                            parseFloat(e.target.value) * 1000000 || null,
                        },
                        index,
                      );
                    }}
                    mb="0"
                  />
                </Td>

                <Td>
                  {/* Hide button if this is the ONLY index of the loop */}
                  {index === 0 && data.length === 1 ? null : (
                    <Button
                      bg="white"
                      fontSize="sm"
                      className="!text-[var(--chakra-colors-black-400)]"
                      onClick={() => {
                        onRemoveClick(index);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        className="!text-[var(--chakra-colors-black-400)]"
                        size="lg"
                      />
                    </Button>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </VStack>
  );
};

export default QuoteItemsTable;
