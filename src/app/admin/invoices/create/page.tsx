"use client";
import { useMutation } from "@apollo/client/react";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
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
import { Select } from "chakra-react-select";
// import CustomInputField from "@/components/fields/CustomInputField";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { GET_COMPANYS_QUERY } from "@/graphql/company";
import { GET_CUSTOMERS_QUERY } from "@/graphql/customer";
import {
  CREATE_INVOICE_MUTATION,
  defaultInvoice,
  GENERATE_INVOICE_PDF_MUTATION,
  SEND_INVOICE_MUTATION,
} from "@/graphql/invoice";
import { CREATE_INVOICE_LINE_ITEM_MUTATION } from "@/graphql/invoiceLineItem";
import { GET_INVOICE_STATUSES_QUERY, InvoiceStatusesResponse } from "@/graphql/invoiceStatus";
import { formatCurrency, formatFloat, formatToSelect } from "@/lib/helpers/helper";
import debounce from "lodash.debounce";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

// ---------- Types ----------
interface CompanysQueryResult {
  companys: {
    data: { id: string | number; name: string; payment_term?: string }[];
  };
}

interface CustomersQueryResult {
  customers: {
    data: { id: string | number; full_name: string }[];
  };
}

interface CreateInvoiceResult {
  createInvoice: { id: string | number; invoice_status_id: string | number };
}

// Shared card style
const cardProps = {
  bg: "white",
  border: "1px solid",
  borderColor: "gray.200",
  borderRadius: "12px",
  p: "24px",
  mb: "20px",
};

function InvoiceCreate() {
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];

  const textColor = useColorModeValue("navy.700", "white");
  const [invoice, setInvoice] = useState({
    ...defaultInvoice,
    issued_at: today,
    due_at: today,
  });

  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState(null);
  const [invoiceLineItems, setInvoiceLineItems] = useState([]);
  const [invoiceStatuses, setInvoiceStatuses] = useState([]);
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobDateAt, _setJobDateAt] = useState(today);

  const getDaysFromTerm = (termValue) => {
    if (!termValue) return 0;
    const match = termValue.match(/^(\d+)_days/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const addDays = (dateString, days) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const {
    isAdmin,
    isCompany,
    isCompanyAdmin,
    companyId,
    customerId,
    isCustomer,
  } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const defaultVariables = {
    query: "",
    page: 1,
    first: 100,
    orderByColumn: "id",
    orderByOrder: "ASC",
  };

  // ---------- Lookup queries ----------

  useApolloQueryWithEffect<InvoiceStatusesResponse>(GET_INVOICE_STATUSES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      setInvoiceStatuses(
        (data?.invoiceStatuses?.data || []).map((invoiceStatus: any) => ({
          value: invoiceStatus.id,
          label: invoiceStatus.name,
        })),
      );
    },
  });

  const onChangeSearchQuery = useMemo(() => {
    return debounce((e) => {
      setDebouncedSearch(e);
    }, 300);
  }, []);

  useApolloQueryWithEffect<CompanysQueryResult>(GET_COMPANYS_QUERY, {
    variables: {
      query: debouncedSearch,
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      const newCompaniesOptions = (data?.companys?.data || []).map((_entity: any) => ({
        value: parseInt(_entity.id),
        label: _entity.name,
        term: _entity.payment_term,
      }));
      setCompaniesOptions(newCompaniesOptions);
    },
  });

  // ---------- Manually-triggered query (customers by company) ----------

  const [getCustomersByCompanyId] = useApolloLazyQueryWithEffect<CustomersQueryResult>(
    GET_CUSTOMERS_QUERY,
    {
      onCompleted: (data) => {
        let _customerOptions = formatToSelect(
          data?.customers?.data || [],
          "id",
          "full_name",
        );
        setCustomerOptions(_customerOptions);
        if (isCustomer) {
          setInvoice((prev) => ({ ...prev, customer_id: customerId }));
        }
      },
      onError: (error) => {
        console.error("Failed to load customers", error);
      },
    },
  );

  useEffect(() => {
    if ((!isCompany && !isCompanyAdmin) || !companyId) return;
    if (invoice.company_id === companyId) return;

    setInvoice((prev) => ({ ...prev, company_id: companyId }));
    getCustomersByCompanyId({
      variables: { ...defaultVariables, company_id: companyId },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // ---------- Mutations ----------

  const [handleGenerateInvoicePdf] = useMutation(GENERATE_INVOICE_PDF_MUTATION, {
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const handleInvoiceCreation = () => {
    if (isAdmin && !invoice.company_id) {
      toast({
        title: "Company Required",
        description: "Please select a company and customer again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    handleCreateInvoice();
  };

  const [handleCreateInvoice] = useMutation<CreateInvoiceResult>(CREATE_INVOICE_MUTATION, {
    variables: {
      input: {
        invoice_status_id: invoice.invoice_status_id,
        name: invoice.name,
        company_id: invoice.company_id,
        customer_id: invoice.customer_id,
        sub_total: invoice.sub_total,
        total_tax: invoice.total_tax,
        total: invoice.total,
        issued_at: invoice.issued_at,
        due_at: invoice.due_at,
        is_rcti: true,
      },
    },
    onCompleted: async (data) => {
      await Promise.all(
        invoiceLineItems.map((invoiceLineItem: any) =>
          handleCreateLineItem({
            input: {
              name: invoiceLineItem.name,
              invoice_id: data.createInvoice.id,
              is_surcharge: true,
              tax_type: "OUTPUT",
              unit_amount: formatFloat(invoiceLineItem.unit_amount),
              quantity: formatFloat(invoiceLineItem.quantity),
              line_amount: formatFloat(invoiceLineItem.line_amount),
            },
          }),
        ),
      );
      await handleGenerateInvoicePdf({
        variables: {
          id: data.createInvoice.id,
        },
      });
      toast({
        title: "Invoice created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (String(data.createInvoice.invoice_status_id) === "2") {
        await handleSendInvoice({
          variables: {
            id: data.createInvoice.id,
          },
        });
      }
      router.push(`/admin/invoices/${data.createInvoice.id}`);
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [handleSendInvoice] = useMutation(SEND_INVOICE_MUTATION, {
    onCompleted: (_data) => {
      toast({
        title: "Invoice sent to the customer",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [createLineItem] = useMutation(CREATE_INVOICE_LINE_ITEM_MUTATION);

  const handleCreateLineItem = (lineItem: any) => {
    return new Promise((resolve, reject) => {
      createLineItem({ variables: lineItem })
        .then(({ data }) => {
          toast({
            title: "Line Item created",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
          showGraphQLErrorToast(error);
        });
    });
  };

  useEffect(() => {
    if (!invoiceLineItems || invoiceLineItems.length === 0) return;

    const invoiceTotal = invoiceLineItems.reduce((acc, item) => {
      const amount = parseFloat(item.line_amount) || 0;
      return acc + amount;
    }, 0);

    const taxRate = 0.1;
    const subTotal = parseFloat(invoiceTotal.toFixed(2));
    const totalTax = parseFloat((invoiceTotal * taxRate).toFixed(2));
    const total = parseFloat((invoiceTotal + totalTax).toFixed(2));

    setInvoice((prev) => ({
      ...prev,
      sub_total: subTotal,
      total_tax: totalTax,
      total: total,
    }));
  }, [invoiceLineItems]);

  const handleDeleteItem = (index) => {
    setInvoiceLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box
      className="mk-invoices-id"
      pt={{ base: "130px", md: "110px", xl: "110px" }}
      px={{ base: "20px" }}
      maxW="auto"
    >
      {/* Page header */}
      <Flex justifyContent="space-between" alignItems="center" mt="8" mb="20px">
        <h1 className="mb-0">New Invoice</h1>
        <Button
          fontSize="sm"
          lineHeight="19px"
          variant="brand"
          fontWeight="500"
          pl={10}
          pr={10}
          h="50"
          className="!h-[39px]"
          onClick={() => handleInvoiceCreation()}
        >
          Create Invoice
        </Button>
      </Flex>

      {/* ---------- Details card ---------- */}
      <Box {...cardProps}>
        <h3 style={{ marginBottom: "16px" }}>Details</h3>
        <FormControl>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacingX="24px" spacingY="16px">
            <Box>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="6px">
                Name / Reference No.
              </FormLabel>
              <Input
                isRequired={true}
                variant="main"
                value={invoice.name}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    [e.target.name]: e.target.value,
                  })
                }
                type="text"
                name="name"
                fontSize="sm"
                mb="0"
                fontWeight="500"
                size="lg"
                w="full"
              />
            </Box>

            <Box>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="6px">
                Invoice Status
              </FormLabel>
              <Select
                placeholder="Select Status"
                defaultValue={invoiceStatuses.find(
                  (invoiceStatus) =>
                    invoiceStatus.value == invoice.invoice_status_id,
                )}
                options={invoiceStatuses}
                onChange={(e) => {
                  setInvoice({ ...invoice, invoice_status_id: e.value });
                }}
                size="lg"
                className="select mb-0"
                classNamePrefix="two-easy-select"
                isDisabled={isCustomer}
              />
            </Box>

            {isAdmin && (
              <Box>
                <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="6px">
                  Company
                </FormLabel>
                <Select
                  placeholder="Select Company"
                  options={companiesOptions}
                  value={companiesOptions.find(
                    (entity) => entity.value === invoice.company_id,
                  )}
                  onInputChange={(e) => {
                    onChangeSearchQuery(e);
                  }}
                  onChange={(e) => {
                    getCustomersByCompanyId({
                      variables: { ...defaultVariables, company_id: e.value },
                    });
                    setInvoice({
                      ...invoice,
                      company_id: e.value || null,
                      customer_id: null,
                    });
                    setSelectedPaymentTerm(e.term);
                    setInvoice((prev) => ({
                      ...prev,
                      issued_at: jobDateAt,
                      due_at: addDays(prev.issued_at, getDaysFromTerm(e.term)),
                    }));
                  }}
                  isClearable
                  size="lg"
                  className="select mb-0"
                  classNamePrefix="two-easy-select"
                />
              </Box>
            )}

            <Box>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="6px">
                Issued At
              </FormLabel>
              <Input
                type="date"
                name="issued_at"
                value={invoice.issued_at}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const days = getDaysFromTerm(selectedPaymentTerm);
                  const newDueDate = addDays(newDate, days);

                  setInvoice((prev) => ({
                    ...prev,
                    issued_at: newDate,
                    due_at: newDueDate,
                  }));
                }}
                variant="main"
                fontSize="sm"
                mb="0"
                fontWeight="500"
                size="lg"
                w="full"
              />
              {invoice.company_id && (
                <Flex alignItems="center" mt={2} color="gray.500" fontSize="sm">
                  <InfoOutlineIcon mr={2} />
                  <span>
                    Selected Company&apos;s Payment Term: {selectedPaymentTerm}
                  </span>
                </Flex>
              )}
            </Box>

            <Box>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="6px">
                Customer
              </FormLabel>
              <Select
                placeholder="Select Customer"
                options={customerOptions}
                value={
                  customerOptions.find(
                    (entity) => entity.value === invoice.customer_id,
                  ) || null
                }
                isDisabled={!isAdmin}
                onChange={(e) => {
                  if (isCompany && isCompanyAdmin) return;
                  setInvoice({
                    ...invoice,
                    customer_id: e?.value || null,
                  });
                }}
                isClearable
                size="lg"
                className="select mb-0"
                classNamePrefix="two-easy-select"
              />
            </Box>

            <Box>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="6px">
                Due At
              </FormLabel>
              <Input
                type="date"
                name="due_at"
                value={invoice.due_at}
                onChange={(e) => {
                  setInvoice({
                    ...invoice,
                    [e.target.name]: e.target.value,
                  });
                }}
                variant="main"
                fontSize="sm"
                mb="0"
                fontWeight="500"
                size="lg"
                w="full"
              />
            </Box>
          </SimpleGrid>
        </FormControl>
      </Box>

      {/* ---------- Line items card ---------- */}
      <Box {...cardProps}>
        <Flex justifyContent="space-between" alignItems="center" mb="16px">
          <h3 style={{ margin: 0 }}>Line Items</h3>
          <Button
            fontSize="sm"
            variant="outline"
            size="sm"
            onClick={() =>
              setInvoiceLineItems([
                ...invoiceLineItems,
                {
                  id: null,
                  name: "",
                  unit_amount: 0,
                  quantity: 0,
                  line_amount: 0,
                },
              ])
            }
          >
            + Add Item
          </Button>
        </Flex>

        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th pl="0">Description</Th>
                <Th>Rate</Th>
                <Th>QTY</Th>
                <Th>Amount</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>

            <Tbody>
              {invoiceLineItems.map((invoiceLineItem: any, index: number) => (
                <Tr key={index}>
                  <Td pl="0">
                    <Input
                      variant="main"
                      value={invoiceLineItem.name}
                      onChange={(e) => {
                        let items = [...invoiceLineItems];
                        let item = { ...invoiceLineItems[index] };
                        item[e.target.name] = e.target.value;
                        items[index] = item;
                        setInvoiceLineItems(items);
                      }}
                      type="text"
                      name="name"
                      fontSize="sm"
                      mb="0"
                      fontWeight="500"
                      size="sm"
                    />
                  </Td>

                  <Td maxWidth="140px">
                    <Input
                      variant="main"
                      value={invoiceLineItem.unit_amount ?? 0}
                      onChange={(e) => {
                        let items = [...invoiceLineItems];
                        let item = { ...invoiceLineItems[index] };
                        item[e.target.name] = e.target.value || 0;
                        item.unit_amount = parseFloat(e.target.value) || 0;
                        item.line_amount = (
                          (item.quantity || 0) * item.unit_amount
                        ).toFixed(2);
                        items[index] = item;
                        setInvoiceLineItems(items);
                      }}
                      type="number"
                      name="unit_amount"
                      fontSize="sm"
                      mb="0"
                      fontWeight="500"
                      size="sm"
                    />
                  </Td>

                  <Td maxWidth="100px">
                    <Input
                      variant="main"
                      value={invoiceLineItem.quantity}
                      onChange={(e) => {
                        let items = [...invoiceLineItems];
                        let item = { ...invoiceLineItems[index] };
                        item[e.target.name] = e.target.value;
                        item.line_amount = (
                          item.unit_amount * parseFloat(e.target.value)
                        ).toFixed(2);
                        items[index] = item;
                        setInvoiceLineItems(items);
                      }}
                      type="text"
                      name="quantity"
                      fontSize="sm"
                      mb="0"
                      fontWeight="500"
                      size="sm"
                    />
                  </Td>

                  <Td maxWidth="120px" color="gray.600">
                    {formatCurrency(invoiceLineItem.line_amount ?? 0)}
                  </Td>

                  <Td
                    sx={{
                      color: "red.500",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleDeleteItem(index)}
                  >
                    <span>✕</span>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* ---------- Totals card ---------- */}
      <Flex justifyContent="flex-end" mb="40px">
        <Box {...cardProps} w={{ base: "full", md: "320px" }} mb="0">
          <Flex justifyContent="space-between" className="py-2 border-b border-[#e3e3e3]">
            <p className="text-sm !font-bold">SubTotal</p>
            <p className="text-sm text-right">
              {formatCurrency(invoice.sub_total, invoice.currency)}
            </p>
          </Flex>

          <Flex justifyContent="space-between" className="py-2 border-b border-[#e3e3e3]">
            <p className="text-sm !font-bold">GST</p>
            <p className="text-sm text-right">
              {formatCurrency(invoice.total_tax, invoice.currency)}
            </p>
          </Flex>

          <Flex justifyContent="space-between" className="py-2 border-b border-[#e3e3e3]">
            <p className="text-sm !font-bold">Total</p>
            <p className="text-sm text-right">
              {formatCurrency(invoice.total, invoice.currency)}
            </p>
          </Flex>

          <Flex justifyContent="space-between" className="py-2">
            <p className="text-base !font-bold">Balance Due</p>
            <p className="text-base !font-bold text-right">
              {formatCurrency(invoice.total, invoice.currency)}
            </p>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default InvoiceCreate;