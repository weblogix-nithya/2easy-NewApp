"use client";
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  SimpleGrid,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import AreYouSureAlert from "@/components/alert/AreYouSureAlert";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { ViewOrEditField } from "@/components/form/ViewOrEditField";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import {
  defaultInvoice,
  // DELETE_INVOICE_MUTATION,
  GET_INVOICE_QUERY,
  SEND_RCTI_INVOICE_MUTATION,
  UPDATE_INVOICE_MUTATION,
} from "@/graphql/invoice";
import {
  CREATE_INVOICE_LINE_ITEM_MUTATION,
  DELETE_INVOICE_LINE_ITEM_MUTATION,
  GET_INVOICE_LINE_ITEMS_QUERY,
  UPDATE_INVOICE_LINE_ITEM_MUTATION,
} from "@/graphql/invoiceLineItem";
import { formatCurrency, formatFloat } from "@/lib/helpers/helper";
import debounce from "lodash.debounce";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

// ─── Types ────────────────────────────────────────────────────────────────────

type LineItem = {
  id: string | null;
  name: string;
  invoice_id: string;
  unit_amount: number;
  quantity: number;
  line_amount: number;
  currency?: string;
};

const INVOICE_STATUSES = [
  { id: 1, value: "1", name: "Pending/Draft", label: "Pending/Draft" },
  { id: 6, value: "6", name: "Processed/Approved", label: "Processed/Approved" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function RCTIEdit() {
  const menuBg = useColorModeValue("white", "navy.800");
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const isCustomer = useSelector((state: RootState) => state.user.isCustomer);

  const [invoice, setInvoice] = useState(defaultInvoice);
  const [invoiceLineItems, setInvoiceLineItems] = useState<LineItem[]>([]);
  const [lineItemsDirty, setLineItemsDirty] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Search debounce ──────────────────────────────────────────────────────

  const onChangeSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setQueryPageIndex(0);
      }, 300),
    [],
  );

  useEffect(() => {
    return () => onChangeSearchQuery.cancel();
  }, [onChangeSearchQuery]);

  // ─── Queries ──────────────────────────────────────────────────────────────

  const [getInvoiceLineItems, { loading }] = useApolloLazyQueryWithEffect(
    GET_INVOICE_LINE_ITEMS_QUERY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data: any) => {
        setInvoiceLineItems(data.invoiceLineItems.data);
      },
      onError: (error: any) => console.error(error),
    },
  );

  const [getInvoice, { loading: invoiceLoading }] = useApolloLazyQueryWithEffect(
    GET_INVOICE_QUERY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data: any) => {
        if (data?.invoice == null) {
          router.push("/admin/invoices");
          return;
        }
        setInvoice((prev: any) => ({ ...prev, ...data.invoice }));
      },
      onError: (error: any) => console.error(error),
    },
  );

  // Fetch on mount and when search/pagination changes
  useEffect(() => {
    if (!id) return;
    getInvoice({ variables: { id } });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id) return;
    getInvoiceLineItems({
      variables: {
        invoice_id: id,
        query: searchQuery,
        page: queryPageIndex + 1,
        first: queryPageSize,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    });
  }, [id, searchQuery, queryPageIndex, queryPageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Recalculate totals when line items change ────────────────────────────

  useEffect(() => {
    const invoiceTotal = invoiceLineItems.reduce((acc, item) => {
      return acc + parseFloat(String(item.line_amount) || "0");
    }, 0);
    // FIX: functional update avoids stale `invoice` closure
    setInvoice((prev: any) => ({
      ...prev,
      total_tax: invoiceTotal * 0.1,
      sub_total: invoiceTotal,
      total: invoiceTotal * 1.1,
    }));
  }, [invoiceLineItems]);

  // ─── Line item helper ────────────────────────────────────────────────────

  const updateLineItem = useCallback(
    (index: number, patch: Partial<LineItem>) => {
      setInvoiceLineItems((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...patch };
        return updated;
      });
      setLineItemsDirty(true);
    },
    [],
  );

  // ─── Mutations ────────────────────────────────────────────────────────────

  const [handleUpdateLineItem] = useMutation(UPDATE_INVOICE_LINE_ITEM_MUTATION, {
    onCompleted: () =>
      toast({ title: "Line Item updated", status: "success", duration: 3000, isClosable: true }),
    onError: (error) => showGraphQLErrorToast(error),
  });

  const [handleCreateLineItem] = useMutation(CREATE_INVOICE_LINE_ITEM_MUTATION, {
    onCompleted: () =>
      toast({ title: "Line Item created", status: "success", duration: 3000, isClosable: true }),
    onError: (error) => showGraphQLErrorToast(error),
  });

  const [handleSendInvoice] = useMutation(SEND_RCTI_INVOICE_MUTATION, {
    onCompleted: () =>
      toast({ title: "RCTI Invoice sent", status: "success", duration: 3000, isClosable: true }),
    onError: (error) => showGraphQLErrorToast(error),
  });

  const [handleDeleteInvoiceLineItem] = useMutation(DELETE_INVOICE_LINE_ITEM_MUTATION, {
    onError: (error) => showGraphQLErrorToast(error),
  });

  // const [handleDeleteInvoice] = useMutation(DELETE_INVOICE_MUTATION, {
  //   variables: { id },
  //   onCompleted: () => {
  //     toast({ title: "Invoice deleted", status: "success", duration: 3000, isClosable: true });
  //     router.push("/admin/invoices");
  //   },
  //   onError: (error) => showGraphQLErrorToast(error),
  // });

  const syncLineItems = useCallback(async () => {
    if (!lineItemsDirty) return;
    await Promise.all(
      invoiceLineItems.map((item) => {
        if (item.id == null) {
          return handleCreateLineItem({
            variables: {
              input: {
                name: item.name,
                invoice_id: item.invoice_id,
                is_surcharge: true,
                is_rate: false,
                tax_type: "OUTPUT",
                unit_amount: formatFloat(item.unit_amount),
                quantity: formatFloat(item.quantity),
                line_amount: formatFloat(item.line_amount),
              },
            },
          });
        }
        return handleUpdateLineItem({
          variables: {
            input: {
              id: item.id,
              name: item.name,
              invoice_id: item.invoice_id,
              unit_amount: formatFloat(item.unit_amount),
              quantity: formatFloat(item.quantity),
              line_amount: formatFloat(item.line_amount),
            },
          },
        });
      }),
    );
    setLineItemsDirty(false);
  }, [invoiceLineItems, lineItemsDirty, handleCreateLineItem, handleUpdateLineItem]);

  const [handleUpdateInvoice] = useMutation(UPDATE_INVOICE_MUTATION, {
    // FIX: onCompleted-லயே refetch — no more setTimeout hacks
    onCompleted: async () => {
      toast({ title: "Invoice updated", status: "success", duration: 3000, isClosable: true });
      await syncLineItems();
      getInvoice({ variables: { id } });
      getInvoiceLineItems({
        variables: {
          invoice_id: id,
          query: searchQuery,
          page: queryPageIndex + 1,
          first: queryPageSize,
          orderByColumn: "id",
          orderByOrder: "ASC",
        },
      });
      setStatusLoading(false);
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
      setStatusLoading(false);
    },
  });

  const saveInvoice = useCallback(
    (overrides?: Partial<typeof invoice>) => {
      const data = { ...invoice, ...overrides };
      return handleUpdateInvoice({
        variables: {
          input: {
            id,
            invoice_status_id: data.invoice_status_id,
            name: data.name,
            sub_total: data.sub_total,
            total_tax: data.total_tax,
            total: data.total,
          },
        },
      });
    },
    [invoice, id, handleUpdateInvoice],
  );

  // FIX: delete passes id directly — no setState + setTimeout race condition
  const deleteLineItem = useCallback(
    (lineItemId: string | null, index: number) => {
      if (lineItemId === null) {
        setInvoiceLineItems((prev) => prev.filter((_, i) => i !== index));
        setLineItemsDirty(true);
        return;
      }
      handleDeleteInvoiceLineItem({
        variables: { id: lineItemId },
        onCompleted: () => {
          toast({ title: "Line Item deleted", status: "success", duration: 3000, isClosable: true });
          setInvoiceLineItems((prev) => prev.filter((item) => item.id !== lineItemId));
        },
      });
    },
    [handleDeleteInvoiceLineItem, toast],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box
      className="mk-invoices-id"
      pt={{ base: "130px", md: "97px", xl: "97px" }}
      px={{ base: "20px" }}
    >
      <Grid>
        {!invoiceLoading && (
          <FormControl>
            <Flex justifyContent="space-between" alignItems="center" mb="24px" className="mt-8">
              <h1 className="mb-0">
                {invoice.is_rcti
                  ? `Invoice # ${invoice.job ? invoice.job.name : invoice.vehicle_hire?.name}`
                  : `RCTI ${invoice.name}`}
              </h1>

              <Flex gap="10px">
                {invoice.job_id && (
                  <Button
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    h="50"
                    className="!h-[39px]"
                    onClick={() => router.push("/admin/jobs/" + invoice.job_id)}
                    isLoading={invoiceLoading}
                    hidden={isCustomer}
                  >
                    Job
                  </Button>
                )}

                {invoice.invoice_status_id === "6" && (
                  <Button
                    variant="primary"
                    onClick={() => handleSendInvoice({ variables: { id } })}
                    isLoading={invoiceLoading}
                  >
                    Send Invoice
                  </Button>
                )}

                {invoice.invoice_status_id === "6" && (
                  <Button
                    variant="secondary"
                    px={10}
                    isDisabled={invoiceLoading}
                    onClick={async () => {
                      const { data } = await getInvoice({ variables: { id } });
                      if (data?.invoice?.rcti_url) {
                        window.open(data.invoice.rcti_url, "_blank", "noopener,noreferrer");
                      } else {
                        toast({
                          title: "PDF not ready",
                          description: "Please wait a moment and try again.",
                          status: "warning",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    Download PDF
                  </Button>
                )}

                <Button
                  fontSize="sm"
                  variant="brand"
                  fontWeight="500"
                  px={10}
                  className="!h-[39px]"
                  onClick={() => saveInvoice()}
                  isLoading={invoiceLoading || statusLoading}
                  hidden={isCustomer}
                >
                  Save Changes
                </Button>
              </Flex>
            </Flex>

            {/* Name */}
            <Flex alignItems="center" mb="16px">
              <FormLabel mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>
                <Skeleton isLoaded={!invoiceLoading} w="75%">Name</Skeleton>
              </FormLabel>
              <ViewOrEditField
                type="input"
                isCustomer={isCustomer}
                isLoading={invoiceLoading}
                displayValue={invoice.name}
                value={invoice.name}
                name="name"
                onChange={(e) => setInvoice((prev: any) => ({ ...prev, name: e.target.value }))}
              />
            </Flex>

            {/* Invoice Status */}
            <Flex alignItems="center" mb="16px">
              <FormLabel mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>
                <Skeleton isLoaded={!invoiceLoading} w="75%">Invoice Status</Skeleton>
              </FormLabel>
              <ViewOrEditField
                type="select"
                isCustomer={isCustomer}
                isLoading={invoiceLoading}
                displayValue={invoice.invoice_status?.name}
                options={INVOICE_STATUSES}
                value={INVOICE_STATUSES.find((s) => s.value === invoice.invoice_status_id)}
                placeholder="Select Status"
                onChange={async (option: any) => {
                  const newStatusId = option.value;
                  setInvoice((prev: any) => ({ ...prev, invoice_status_id: newStatusId }));
                  setStatusLoading(true);
                  await saveInvoice({ invoice_status_id: newStatusId });
                  // FIX: use newStatusId not stale invoice.invoice_status_id
                  if (newStatusId === "6" || newStatusId === "2") {
                    handleSendInvoice({ variables: { id } });
                  }
                }}
              />
            </Flex>

            {/* Non-RCTI: Driver */}
            {!invoice.is_rcti && (
              <Flex alignItems="center" mb="16px">
                <FormLabel mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>
                  Driver
                </FormLabel>
                <Input
                  disabled
                  variant="main"
                  value={invoice.driver?.full_name ?? ""}
                  type="text"
                  className="max-w-md"
                  fontSize="sm"
                  mb="0"
                  fontWeight="500"
                  size="lg"
                />
              </Flex>
            )}
          </FormControl>
        )}
      </Grid>

      <Divider className="mt-4" />

      {/* Line Items */}
      <Box pt={{ base: "40px" }}>
        <SimpleGrid mb="16px" columns={{ sm: 1 }} spacing={{ base: "20px", xl: "20px" }}>
          <Flex minWidth="max-content" alignItems="center">
            <h3>Line Items</h3>
            <SearchBar
              hidden={isCustomer}
              background={menuBg}
              onChangeSearchQuery={onChangeSearchQuery}
              me="10px"
              borderRadius="30px"
            />
          </Flex>

          {!loading && (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th pl="0">Description</Th>
                    <Th>Rate</Th>
                    <Th>QTY</Th>
                    <Th>Amount</Th>
                    {!isCustomer && <Th>Action</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {invoiceLineItems.map((item, index) => (
                    <Tr key={item.id ?? `new-${index}`}>
                      <Td pl="0">
                        <ViewOrEditField
                          type="input"
                          isCustomer={isCustomer}
                          isLoading={invoiceLoading}
                          displayValue={item.name}
                          value={item.name}
                          name="name"
                          onChange={(e) => updateLineItem(index, { name: e.target.value })}
                        />
                      </Td>
                      <Td maxWidth="160px">
                        <ViewOrEditField
                          type="input"
                          isCustomer={isCustomer}
                          isLoading={invoiceLoading}
                          displayValue={formatCurrency(item.unit_amount, item.currency)}
                          value={item.unit_amount}
                          name="unit_amount"
                          inputType="number"
                          onChange={(e) => {
                            const unit_amount = parseFloat(e.target.value) || 0;
                            const line_amount = parseFloat(
                              (item.quantity * unit_amount).toFixed(2)
                            );
                            updateLineItem(index, { unit_amount, line_amount });
                          }}
                        />
                      </Td>
                      <Td maxWidth="120px">
                        <ViewOrEditField
                          type="input"
                          isCustomer={isCustomer}
                          isLoading={invoiceLoading}
                          displayValue={String(item.quantity)}
                          value={item.quantity}
                          name="quantity"
                          onChange={(e) => {
                            const quantity = parseFloat(e.target.value) || 0;
                            const line_amount = parseFloat(
                              (item.unit_amount * quantity).toFixed(2)
                            );
                            updateLineItem(index, { quantity, line_amount });
                          }}
                        />
                      </Td>
                      <Td maxWidth="120px">
                        <ViewOrEditField
                          type="input"
                          isCustomer={isCustomer}
                          isLoading={invoiceLoading}
                          displayValue={formatCurrency(item.line_amount, item.currency)}
                          value={item.line_amount}
                          name="line_amount"
                          isDisabled
                          onChange={(e) => updateLineItem(index, { line_amount: parseFloat(e.target.value) || 0 })}
                        />
                      </Td>
                      {!isCustomer && (
                        <Td>
                          <AreYouSureAlert
                            onDelete={() => deleteLineItem(item.id, index)}
                          />
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </SimpleGrid>
      </Box>

      {/* Add Item */}
      <Button
        fontSize="sm"
        variant="secondary"
        onClick={() => {
          setInvoiceLineItems((prev) => [
            ...prev,
            { id: null, name: "", invoice_id: String(invoice.id), unit_amount: 0, quantity: 0, line_amount: 0 },
          ]);
          setLineItemsDirty(true);
        }}
        isLoading={invoiceLoading}
        hidden={isCustomer}
      >
        Add Item
      </Button>

      {/* Totals */}
      <Box className="w-full mt-4">
        <Box className="max-w-[400px] ml-auto">
          {[
            { label: "SubTotal", value: invoice.sub_total },
            { label: "GST", value: invoice.total_tax },
            { label: "Total", value: invoice.total },
            { label: "Balance Due", value: invoice.total, bold: true },
          ].map(({ label, value, bold }) => (
            <Flex
              key={label}
              justifyContent="space-between"
              className="py-4 border-b border-[#e3e3e3]"
            >
              <Skeleton isLoaded={!invoiceLoading} w="50%">
                <p className={`text-sm ${bold ? "text-base" : ""} !font-bold`}>{label}</p>
              </Skeleton>
              <Skeleton isLoaded={!invoiceLoading} w="50%">
                <p className={`text-sm text-right ${bold ? "text-base !font-bold" : ""}`}>
                  {formatCurrency(value, invoice.currency)}
                </p>
              </Skeleton>
            </Flex>
          ))}
        </Box>
      </Box>

      <Divider className="my-10" />
    </Box>
  );
}

export default RCTIEdit;