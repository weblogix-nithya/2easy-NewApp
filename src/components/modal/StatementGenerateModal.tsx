import { useMutation } from "@apollo/client/react";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Checkbox,
  Flex,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
} from "@chakra-ui/react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { Select } from "chakra-react-select";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { GET_COMPANYS_QUERY } from "@/graphql/company";
import { GET_CUSTOMERS_QUERY } from "@/graphql/customer";
import { GENERATE_COMPANY_STATEMENT_PDF_MUTATION } from "@/graphql/invoice";
import debounce from "lodash.debounce";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

interface StatementGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatementGenerateModal({
  isOpen,
  onClose,
}: StatementGenerateModalProps) {
  const { companyId, isAdmin, isCompanyAdmin, isCustomer } = useSelector(
    (state: RootState) => state.user,
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [rangeDate, setRangeDate] = useState([null, null]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const toast = useToast();

  // Company auto-selected. console
  useEffect(() => {
    if (!isAdmin && (isCompanyAdmin || isCustomer)) {
      setSelectedCompany({ value: companyId, label: "" });
    }
  }, [isAdmin, isCompanyAdmin, isCustomer, companyId]);

  const onChangeSearchCompany = useMemo(() => {
    return debounce((e) => {
      setDebouncedSearch(e);
    }, 300);
  }, []);

  useEffect(() => {
    return () => onChangeSearchCompany.cancel();
  }, [onChangeSearchCompany]);

  // ---------- Companies (admin only) ----------
  const [getCompanys] = useApolloLazyQueryWithEffect(GET_COMPANYS_QUERY, {
    onCompleted: (data: any) => {
      setCompaniesOptions(
        data.companys.data.map((_entity: any) => ({
          value: parseInt(_entity.id),
          label: _entity.name,
        })),
      );
    },
    onError: (error) => console.error("Failed to load companies", error),
  });

  useEffect(() => {
    if (!isAdmin) return;
    getCompanys({
      variables: {
        query: debouncedSearch,
        page: 1,
        first: 100,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    });
  }, [getCompanys, isAdmin, debouncedSearch]);

  // ---------- Customers (admin / company admin) ----------
  const [getCustomers] = useApolloLazyQueryWithEffect(GET_CUSTOMERS_QUERY, {
    onCompleted: (data: any) => {
      setCustomerOptions(
        data.customers.data.map((customer: any) => ({
          value: parseInt(customer.id),
          label: customer.full_name,
        })),
      );
    },
    onError: (error) => console.error("Failed to load customers", error),
  });

  // Initial load, based on role/company context
  useEffect(() => {
    if (!isAdmin && !isCompanyAdmin) return;
    getCustomers({
      variables: {
        company_id: isAdmin ? undefined : companyId,
        query: "",
        page: 1,
        first: 200,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
    });
  }, [getCustomers, isAdmin, isCompanyAdmin, companyId]);

  const handleClose = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    onClose();
  };

  const [generateCompanyStatementPDF] = useMutation<
    { generateCompanyInvoiceStatement: string },
    { companyId?: number; customerIds?: number[]; invoiceDateRange?: any }
  >(GENERATE_COMPANY_STATEMENT_PDF_MUTATION, {
    onCompleted: (data: any) => {
      setIsLoading(false);
      if (data.generateCompanyInvoiceStatement === "No data found") {
        toast({
          title: "No data found",
          status: "error",
          duration: 5000,
        });
        return;
      }
      window.open(data.generateCompanyInvoiceStatement, "_blank");
    },
    onError: (error) => {
      setIsLoading(false);
      showGraphQLErrorToast(error);
    },
  });

  const handleGenerateCompanyStatementPDF = () => {
    if (isAdmin) {
      if (!selectedCompany || selectedCustomer.length === 0) {
        toast({
          title: "Please select company and customer",
          status: "error",
          duration: 3000,
        });
        return;
      }
    } else {
      if (!rangeDate || !rangeDate[0] || !rangeDate[1]) {
        toast({
          title: "Please select date range",
          status: "error",
          duration: 3000,
        });
        return;
      }
    }

    toast({
      title: "Company statement PDF generating. Please wait to download.",
      status: "success",
      duration: 3000,
    });

    setIsLoading(true);

    generateCompanyStatementPDF({
      variables: {
        companyId: isAdmin ? selectedCompany?.value : companyId,
        customerIds: isAdmin
          ? selectedCustomer
          : selectedCustomer.length > 0
            ? selectedCustomer
            : undefined,
        invoiceDateRange: rangeDate,
      },
    });
  };

  const handleSelectAllCustomers = (isChecked: boolean) => {
    setSelectAllCustomers(isChecked);
    if (isChecked) {
      setSelectedCustomer(customerOptions.map((customer) => customer.value));
    } else {
      setSelectedCustomer([]);
    }
  };

  const handleCustomerChange = (selectedOptions: any) => {
    setSelectedCustomer(
      selectedOptions && selectedOptions.length > 0
        ? selectedOptions.map((item: any) => item.value)
        : [],
    );
    if (selectedOptions && selectedOptions.length === customerOptions.length) {
      setSelectAllCustomers(true);
    } else {
      setSelectAllCustomers(false);
    }
  };

  return (
    <>
      <Modal
        id="statement-generate-modal"
        isCentered
        size={"xl"}
        isOpen={isOpen}
        onClose={handleClose}
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(1px)" />
        <ModalContent>
          <ModalHeader>Generate Statement PDF</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack w="full" align="start" spacing={3}>
              {isAdmin && (
                <Box w="full">
                  <FormLabel>Company</FormLabel>
                  <Select
                    placeholder="Company"
                    options={companiesOptions}
                    size="lg"
                    className="select mb-0"
                    classNamePrefix="two-easy-select"
                    onInputChange={(e) => {
                      onChangeSearchCompany(e);
                    }}
                    onChange={(e) => {
                      setSelectedCompany(e);
                      if (e) {
                        getCustomers({
                          variables: {
                            query: "",
                            page: 1,
                            first: 200,
                            orderByColumn: "id",
                            orderByOrder: "ASC",
                            company_id: e.value,
                          },
                        });
                      }
                    }}
                    isClearable={true}
                  ></Select>
                </Box>
              )}

              {!isCustomer && (
                <Box w="full">
                  <FormLabel>Customer</FormLabel>
                  {(isCompanyAdmin || isAdmin) && (
                    <Checkbox
                      isChecked={selectAllCustomers}
                      onChange={(e) =>
                        handleSelectAllCustomers(e.target.checked)
                      }
                    >
                      Select all customers
                    </Checkbox>
                  )}
                  <Select
                    placeholder="Customer"
                    options={customerOptions}
                    isMulti
                    size="lg"
                    className="select mb-0"
                    classNamePrefix="two-easy-select"
                    onChange={(selectedOptions) =>
                      handleCustomerChange(selectedOptions)
                    }
                    isClearable={true}
                    value={customerOptions.filter((option) =>
                      selectedCustomer.includes(option.value),
                    )}
                  ></Select>
                </Box>
              )}

              <Box
                alignItems="center"
                flexDirection="column"
                w="full"
                h="max-content"
              >
                <FormLabel>Period</FormLabel>
                {/* @ts-ignore */}
                <DateRangePicker value={rangeDate} onChange={setRangeDate} />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent={"center"}>
            <Box w={"full"}>
              <Flex justifyContent={"space-between"}>
                <Button
                  variant="primary"
                  className="ml-2"
                  onClick={handleGenerateCompanyStatementPDF}
                  isDisabled={
                    isAdmin
                      ? !selectedCompany || selectedCustomer.length === 0
                      : !rangeDate || !rangeDate[0] || !rangeDate[1]
                  }
                  isLoading={isLoading}
                >
                  Generate PDF
                </Button>
              </Flex>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Exit
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to exit the Statement PDF generation?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmClose} ml={3}>
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
