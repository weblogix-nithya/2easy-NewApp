"use client";
import { useMutation } from "@apollo/client/react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  faFileInvoiceDollar,
  faGear,
  faUserLock,
} from "@fortawesome/free-solid-svg-icons";
import { faUserMinus } from "@fortawesome/pro-regular-svg-icons";
import { faTimes } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import AddressesModal from "@/components/addresses/AddressesModal";
import InvoiceTab from "@/components/tabs/InvoiceTab";
import FileInputLink from "@/components/fileInput/FileInputLink";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import {
  defaultCompany,
  GET_COMPANY_QUERY,
  paymentTerms,
  UPDATE_COMPANY_MUTATION,
} from "@/graphql/company";
import {
  CompanyRate,
  CREATE_COMPANY_RATE_MUTATION,
  DELETE_COMPANY_RATE_MUTATION,
  GET_COMPANY_RATE_QUERY,
  GET_LIST_OF_SEAFREIGHTS,
  UPDATE_COMPANY_RATE_MUTATION,
} from "@/graphql/CompanyRate";
import {
  GET_CUSTOMERS_QUERY,
  UPDATE_CUSTOMER_MUTATION,
  CustomersQueryResult,
} from "@/graphql/customer";
import debounce from "lodash.debounce";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Seafreight {
  value: number;
  label: string;
  cbm_rate: number;
  min_charge: number;
  state: string;
}

interface GroupedSeafreights {
  [key: string]: Seafreight[];
}

function CompanyEdit() {
  const toast = useToast();
  let menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("navy.700", "white");
  const [company, setCompany] = useState(defaultCompany);
  const [initialCompany, setInitialCompany] = useState(defaultCompany);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (params?.id ?? "") as string;

  // ✅ Tab state synced with URL (?tab=0|1|2)
  const initialTab = Number(searchParams.get("tab") ?? 0);
  const [isCompanySetting, setIsCompanySetting] = useState(initialTab);

  const handleTabChange = (tabIndex: number) => {
    setIsCompanySetting(tabIndex);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", String(tabIndex));
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [rateCardUrl, setRateCardUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [companyRate, setCompanyRate] = useState<Partial<CompanyRate>>({
    company_id: id as string,
    seafreight_id: null,
    area: "",
    cbm_rate: 0,
    minimum_charge: 0,
    state: "",
  });
  const [companyRates, setCompanyRates] = useState<CompanyRate[]>([]);
  const [prevCompanyRates, setPrevCompanyRates] = useState<CompanyRate[]>([]);
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [groupedSeafreights, setGroupedSeafreights] =
    useState<GroupedSeafreights>({});
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  const [newRate, setNewRate] = useState<CompanyRate>({
    id: undefined,
    company_id: "",
    seafreight_id: null,
    area: "",
    cbm_rate: 0,
    minimum_charge: 0,
    state: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // ✅ FIX: Use ref for selectCustomerId to avoid stale closures in mutations
  const selectCustomerIdRef = useRef<any>(null);
  const [_selectCustomerId, _setSelectCustomerId] = useState(null);
  const setSelectCustomerId = useCallback((val: any) => {
    selectCustomerIdRef.current = val;
    _setSelectCustomerId(val);
  }, []);

  // ✅ Remove-customer confirmation dialog state
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onOpenDeleteConfirm,
    onClose: onCloseDeleteConfirm,
  } = useDisclosure();
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);

  const { loading: companyLoading, refetch: getCompany } =
    useApolloQueryWithEffect<{
      company: any;
    }>(GET_COMPANY_QUERY, {
      variables: { id },
      skip: !id,
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        if (data?.company == null) router.push("/admin/companies");
        setCompany({ ...company, ...data?.company });
        setInitialCompany({ ...data?.company });
        setRateCardUrl(data?.company.rate_card_url);
        setLogoUrl(data?.company.logo_url);
      },
      onError(error) {
        console.log(error);
      },
    });

  const hasCompanyChanges = () => {
    if (!initialCompany.id || !company.id) return false;
    return Object.keys(company).some((key) => {
      if (key === "rate_card_url" || key === "logo_url") return false;
      const companyValue = (company as any)[key] ?? "";
      const initialValue = (initialCompany as any)[key] ?? "";
      return companyValue !== initialValue;
    });
  };

  const { refetch: getCompanyRates } = useApolloQueryWithEffect<{
    getRatesByCompany: CompanyRate[];
  }>(GET_COMPANY_RATE_QUERY, {
    variables: { company_id: company.id },
    skip: !company.id,
    fetchPolicy: "network-only",
    onCompleted: (data: any) => {
      if (data?.getRatesByCompany) {
        const rates = [...data.getRatesByCompany];
        setCompanyRates(rates);
        setPrevCompanyRates(rates);
      }
    },
  });

  useApolloQueryWithEffect<{ allSeafreights: any[] }>(GET_LIST_OF_SEAFREIGHTS, {
    fetchPolicy: "cache-first",
    onCompleted(data) {
      const grouped = data.allSeafreights.reduce((acc: any, item: any) => {
        if (!acc[item.state]) acc[item.state] = [];
        acc[item.state].push({
          value: item.id,
          label: item.location_name,
          cbm_rate: item.cbm_rate,
          min_charge: item.min_charge,
          state: item.state,
        });
        return acc;
      }, {});
      setGroupedSeafreights(grouped);
      setStateOptions(
        Object.keys(grouped).map((state) => ({ value: state, label: state })),
      );
    },
    onError(error) {
      console.error("GraphQL Error:", error);
      toast({
        title: "Error fetching seafreights",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    if (company.id) getCompanyRates({ company_id: company.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.id]);

  const handleRegionChange = (selected: any) => {
    const selectedSeafreight = (groupedSeafreights as Record<string, any[]>)[
      selectedState
    ]?.find((item: any) => item.value === selected.value);
    if (selectedSeafreight) {
      if (isRegionAlreadyUsed(selectedState, selectedSeafreight.label)) {
        toast({
          title: "Duplicate Entry",
          description: `A rate for ${selectedSeafreight.label} in ${selectedState} already exists`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setCompanyRate({
        ...companyRate,
        seafreight_id: selected.value,
        area: selectedSeafreight.label,
        cbm_rate: selectedSeafreight.cbm_rate,
        minimum_charge: selectedSeafreight.min_charge,
      });
    }
  };

  const isRegionAlreadyUsed = (state: string, region: string) =>
    companyRates.some((rate) => rate.state === state && rate.area === region);

  const handleStateChange = (selected: any) => {
    setSelectedState(selected.value);
    setCompanyRate({
      ...companyRate,
      state: selected.value,
      seafreight_id: null,
      area: "",
      cbm_rate: 0,
      minimum_charge: 0,
    });
  };

  const hasValidChangesToSave = () => {
    if (
      companyRate?.area &&
      companyRate?.state &&
      companyRate?.seafreight_id &&
      companyRate.cbm_rate > 0 &&
      companyRate.minimum_charge > 0
    )
      return true;
    if (
      isAddingRate &&
      newRate?.area &&
      newRate?.state &&
      newRate?.seafreight_id &&
      newRate.cbm_rate > 0 &&
      newRate.minimum_charge > 0
    )
      return true;
    return companyRates.some((rate) => {
      const prevRate = prevCompanyRates.find((pr) => pr.id === rate.id);
      return (
        prevRate &&
        (prevRate.area !== rate.area ||
          prevRate.cbm_rate !== rate.cbm_rate ||
          prevRate.minimum_charge !== rate.minimum_charge ||
          prevRate.state !== rate.state)
      );
    });
  };

  const addNewRate = () => {
    setIsAddingRate(true);
    setNewRate({
      id: undefined,
      company_id: String(company.id),
      seafreight_id: null,
      area: "",
      cbm_rate: 0,
      minimum_charge: 0,
      state: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const handleRateInputChange = (index: number, field: string, value: any) => {
    const updatedRates = [...companyRates];
    updatedRates[index] = {
      ...updatedRates[index],
      [field]:
        field === "cbm_rate" || field === "minimum_charge"
          ? parseFloat(value) || 0
          : value,
    };
    setCompanyRates(updatedRates);
    setIsEditMode(true);
  };

  const saveRates = async () => {
    try {
      setIsSaving(true);
      if (isAddingRate) {
        if (
          !companyRate.area ||
          !companyRate.state ||
          !companyRate.seafreight_id ||
          companyRate.cbm_rate === 0 ||
          companyRate.minimum_charge === 0
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all fields",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        if (isRegionAlreadyUsed(companyRate.state, companyRate.area)) {
          toast({
            title: "Duplicate Entry",
            description: `A rate for ${companyRate.area} in ${companyRate.state} already exists`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        await createCompanyRate({
          variables: {
            company_id: String(company.id),
            seafreight_id: String(companyRate.seafreight_id),
            area: companyRate.area,
            cbm_rate: Number(companyRate.cbm_rate),
            minimum_charge: Number(companyRate.minimum_charge),
            state: companyRate.state,
          },
        });
      } else if (isEditMode) {
        const modifiedRates = companyRates.filter((rate) => {
          const prevRate = prevCompanyRates.find((pr) => pr.id === rate.id);
          return (
            prevRate &&
            (prevRate.area !== rate.area ||
              prevRate.cbm_rate !== rate.cbm_rate ||
              prevRate.minimum_charge !== rate.minimum_charge ||
              prevRate.state !== rate.state ||
              prevRate.seafreight_id !== rate.seafreight_id)
          );
        });
        const invalidRate = modifiedRates.find(
          (rate) =>
            !rate.area ||
            !rate.state ||
            !rate.seafreight_id ||
            rate.cbm_rate === 0 ||
            rate.minimum_charge === 0,
        );
        if (invalidRate) {
          toast({
            title: "Validation Error",
            description: "Please ensure all fields are filled",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        for (const rate of modifiedRates) {
          await updateCompanyRate({
            variables: {
              id: rate.id,
              company_id: String(company.id),
              seafreight_id: rate.seafreight_id,
              area: rate.area,
              cbm_rate: parseFloat(rate.cbm_rate.toString()),
              minimum_charge: parseFloat(rate.minimum_charge.toString()),
              state: rate.state,
            },
          });
        }
      }
      const { data } = await getCompanyRates({
        company_id: Number(company.id),
      });
      if (data?.getRatesByCompany) {
        setCompanyRates(data.getRatesByCompany);
        setPrevCompanyRates(data.getRatesByCompany);
      }
      setCompanyRate({
        company_id: String(company.id),
        seafreight_id: null,
        area: "",
        cbm_rate: 0,
        minimum_charge: 0,
        state: "",
      });
      setSelectedState("");
      setIsAddingRate(false);
      setIsEditMode(false);
      toast({
        title: isAddingRate
          ? "New rate added successfully"
          : "Rates updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error saving rates",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const [createCompanyRate] = useMutation(CREATE_COMPANY_RATE_MUTATION);
  const [updateCompanyRate] = useMutation(UPDATE_COMPANY_RATE_MUTATION);
  const [deleteCompanyRate] = useMutation(DELETE_COMPANY_RATE_MUTATION);

  const [handleUpdateCompany] = useMutation(UPDATE_COMPANY_MUTATION, {
    variables: {
      input: { ...company, rate_card_url: undefined, logo_url: undefined },
    },
    onCompleted: async () => {
      toast({
        title: "Company updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError(error) {
      showGraphQLErrorToast(error);
    },
  });

  const handleDeleteRate = async (rateId: string) => {
    try {
      await deleteCompanyRate({ variables: { id: rateId } });
      const { data } = await getCompanyRates({ company_id: company.id });
      if (data?.getRatesByCompany) {
        setCompanyRates(data.getRatesByCompany);
        setPrevCompanyRates(data.getRatesByCompany);
      }
      toast({
        title: "Rate deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting rate",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onChangeSearchQuery = useMemo(
    () =>
      debounce((e) => {
        setSearchQuery(e);
        setQueryPageIndex(0);
      }, 300),
    [],
  );

  const [availableCustomersOptions, setAvailableCustomersOptions] = useState(
    [],
  );

  // ✅ v8-style columns: header (lowercase) + accessorKey + meta for action flags
  const columns = useMemo(
    () => [
      {
        id: "full_name",
        header: "Name",
        accessorKey: "full_name" as const,
      },
      {
        id: "phone_no",
        header: "Phone Number",
        accessorKey: "phone_no" as const,
      },
      {
        id: "is_company_admin",
        header: "Company Role",
        accessorKey: "is_company_admin" as const,
        meta: { type: "boolean", trueLabel: "Admin", falseLabel: "User" },
      },
      {
        id: "is_pod_sendable",
        header: "Send POD",
        accessorKey: "is_pod_sendable" as const,
        meta: { type: "boolean", trueLabel: "Yes", falseLabel: "No" },
      },
      {
        id: "is_invoice_sendable",
        header: "Send Invoice",
        accessorKey: "is_invoice_sendable" as const,
        meta: { type: "boolean", trueLabel: "Yes", falseLabel: "No" },
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        meta: {
          isDelete: true,
          isView: true,
          isEdit: false,
          deleteIcon: faUserMinus,
        },
      },
    ],
    [],
  );

  // ✅ FIX: first: 50 instead of 10000 — dropdown needs only recent customers
  const { refetch: getAvailableCustomers } =
    useApolloQueryWithEffect<CustomersQueryResult>(GET_CUSTOMERS_QUERY, {
      variables: {
        query: "",
        page: 1,
        first: 250,
        orderByColumn: "id",
        orderByOrder: "DESC",
        company_id: null,
      },
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        setAvailableCustomersOptions(
          data.customers.data.map((customer: any) => ({
            value: parseInt(customer.id),
            label: `${customer.full_name} — ${customer.email}`,
          })),
        );
      },
    });

  const {
    loading,
    data: customers,
    refetch: getCustomers,
  } = useApolloQueryWithEffect<CustomersQueryResult>(GET_CUSTOMERS_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderByColumn: "id",
      orderByOrder: "ASC",
      company_id: id ? Number(id) : undefined,
    },
    fetchPolicy: "cache-and-network",
    skip: !id,
  });

  // ✅ FIX: Use ref to avoid stale closure
  const [addCustomerToCompany] = useMutation(UPDATE_CUSTOMER_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Customer updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      getCustomers();
      getAvailableCustomers();
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [removeCustomerFromCompany] = useMutation(UPDATE_CUSTOMER_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Customer removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      getCustomers();
      getAvailableCustomers();
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const handleAddCustomer = useCallback(() => {
    if (!selectCustomerIdRef.current) return;
    addCustomerToCompany({
      variables: { input: { id: selectCustomerIdRef.current, company_id: id } },
    });
  }, [addCustomerToCompany, id]);

  // ✅ Opens the confirm dialog instead of deleting immediately
  const handleRemoveCustomer = useCallback(
    (customerId: any) => {
      if (!customerId) return;
      setCustomerToDelete(Number(customerId));
      onOpenDeleteConfirm();
    },
    [onOpenDeleteConfirm],
  );

  // ✅ Runs the actual mutation once the user confirms
  const handleConfirmRemoveCustomer = useCallback(() => {
    if (customerToDelete) {
      removeCustomerFromCompany({
        variables: { input: { id: customerToDelete, company_id: null } },
      });
    }
    onCloseDeleteConfirm();
    setCustomerToDelete(null);
  }, [customerToDelete, removeCustomerFromCompany, onCloseDeleteConfirm]);

  return (
    <Box
      className="mk-companies-id"
      pt={{ base: "130px", md: "97px", xl: "97px" }}
    >
      <Grid pr="24px">
        {!companyLoading && (
          <Grid
            templateAreas={`"nav main"`}
            gridTemplateRows={"90vh"}
            gridTemplateColumns={"25% 1fr"}
            h="auto"
            gap="1"
            color="blackAlpha.700"
            fontWeight="bold"
          >
            {/* Left side */}
            <GridItem
              area={"nav"}
              className="border-r border-[var(--chakra-colors-gray-200)]"
            >
              <Box mx="26px">
                <h2 className="mt-10 mb-4">{company.name}</h2>
              </Box>
              <Flex mt={8} flexDirection="column" className="border-b">
                <Button
                  disabled={isCompanySetting == 0}
                  onClick={() => handleTabChange(0)}
                  alignItems="start"
                  h={45}
                  fontSize="14px"
                  className={
                    isCompanySetting == 0
                      ? "!items-center !justify-start !font-medium text-white !bg-[var(--chakra-colors-primary-400)] !rounded-none"
                      : "!items-center !justify-start !font-medium text-[var(--chakra-colors-black-400)] !bg-white !rounded-none"
                  }
                >
                  <FontAwesomeIcon icon={faGear} className="mr-1" /> Company
                  Settings
                </Button>
                <Button
                  disabled={isCompanySetting == 1}
                  onClick={() => handleTabChange(1)}
                  alignItems="start"
                  h={45}
                  fontSize="14px"
                  className={
                    isCompanySetting == 1
                      ? "!items-center !justify-start !font-medium !text-left text-white !bg-[var(--chakra-colors-primary-400)] !rounded-none"
                      : "!items-center !justify-start !font-medium text-[var(--chakra-colors-black-400)] !bg-white !rounded-none"
                  }
                >
                  <FontAwesomeIcon icon={faUserLock} className="mr-1" /> Company
                  Users
                </Button>
                <Button
                  disabled={isCompanySetting == 2}
                  onClick={() => handleTabChange(2)}
                  alignItems="start"
                  h={45}
                  fontSize="14px"
                  className={
                    isCompanySetting == 2
                      ? "!items-center !justify-start !font-medium !text-left text-white !bg-[var(--chakra-colors-primary-400)] !rounded-none"
                      : "!items-center !justify-start !font-medium text-[var(--chakra-colors-black-400)] !bg-white !rounded-none"
                  }
                >
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    className="mr-1"
                  />{" "}
                  Invoices
                </Button>
              </Flex>
            </GridItem>

            {/* Right side */}
            <GridItem pl="2" area={"main"}>
              {/* Company Settings */}
              {isCompanySetting == 0 && (
                <FormControl className="pb-10">
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb="24px"
                    className="mt-8"
                  >
                    <h2 className="mb-0">Company Settings</h2>
                    <Button
                      fontSize="sm"
                      lineHeight="19px"
                      variant="brand"
                      fontWeight="500"
                      w="auto"
                      h="50"
                      mb="0"
                      ms="10px"
                      className="!h-[39px]"
                      onClick={() => handleUpdateCompany()}
                      isLoading={companyLoading}
                      isDisabled={!hasCompanyChanges()}
                    >
                      Update
                    </Button>
                  </Flex>
                  <Divider />
                  <Box className="pl-6 pr-6">
                    <h3 className="mt-6 mb-4">Details</h3>

                    <SimpleGrid columns={2} spacing={4} mb="16px">
                      {[
                        { label: "Name", name: "name", type: "text" },
                        { label: "ABN", name: "abn", type: "text" },
                        {
                          label: "Main contact number",
                          name: "contact_phone",
                          type: "text",
                          placeholder: "+61",
                        },
                        {
                          label: "Main contact email",
                          name: "contact_email",
                          type: "text",
                        },
                        {
                          label: "Integration email",
                          name: "integration_email",
                          type: "text",
                        },
                      ].map(({ label, name, type, placeholder }) => (
                        <Box key={name}>
                          <FormLabel
                            fontSize="sm"
                            fontWeight="500"
                            color={textColor}
                            mb="4px"
                          >
                            {label}
                          </FormLabel>
                          <Input
                            isRequired
                            type={type}
                            name={name}
                            value={(company as any)[name] || ""}
                            placeholder={placeholder || ""}
                            onChange={(e) =>
                              setCompany({
                                ...company,
                                [e.target.name]: e.target.value,
                              })
                            }
                            variant="main"
                            fontSize="sm"
                            fontWeight="500"
                            size="lg"
                            w="full"
                          />
                        </Box>
                      ))}

                      <Box>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color={textColor}
                          mb="4px"
                        >
                          Payment Terms
                        </FormLabel>
                        <Select
                          placeholder="Select Payment Terms"
                          value={paymentTerms.find(
                            (term) => term.value === company.payment_term,
                          )}
                          options={paymentTerms}
                          onChange={(selectedOption) =>
                            setCompany({
                              ...company,
                              payment_term: selectedOption?.value,
                            })
                          }
                          size="lg"
                          className="select mb-0"
                          classNamePrefix="two-easy-select"
                        />
                      </Box>

                      {[
                        {
                          label: "Weight (kg/cubic)",
                          name: "weight_per_cubic",
                          type: "number",
                          parser: (v: string) => (v ? parseInt(v, 10) : ""),
                        },
                        {
                          label: "Fuel Levy %",
                          name: "fuel_levy_percentage",
                          type: "number",
                          step: "0.01",
                          parser: parseFloat,
                        },
                        {
                          label: "QLD Toll Levy %",
                          name: "qld_toll_levy_percentage",
                          type: "number",
                          step: "0.01",
                          parser: parseFloat,
                        },
                        {
                          label: "VIC Toll Levy %",
                          name: "vic_toll_levy_percentage",
                          type: "number",
                          step: "0.01",
                          parser: parseFloat,
                        },
                      ].map(({ label, name, type, step, parser }) => (
                        <Box key={name}>
                          <FormLabel
                            fontSize="sm"
                            fontWeight="500"
                            color={textColor}
                            mb="4px"
                          >
                            {label}
                          </FormLabel>
                          <Input
                            isRequired
                            type={type}
                            step={step}
                            name={name}
                            value={(company as any)[name] ?? ""}
                            onChange={(e) =>
                              setCompany({
                                ...company,
                                [name]: parser(e.target.value),
                              })
                            }
                            variant="main"
                            fontSize="sm"
                            fontWeight="500"
                            size="lg"
                            w="full"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={4} mb="16px">
                      <Box>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color={textColor}
                          mb="4px"
                        >
                          Admin Notes
                        </FormLabel>
                        <Textarea
                          name="admin_notes"
                          value={company.admin_notes || ""}
                          onChange={(e) =>
                            setCompany({
                              ...company,
                              [e.target.name]: e.target.value,
                            })
                          }
                          fontSize="sm"
                          rows={4}
                          placeholder="Admin Notes"
                          w="full"
                        />
                      </Box>

                      <Box>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="500"
                          color={textColor}
                          mb="4px"
                        >
                          Base Notes
                        </FormLabel>
                        <Textarea
                          name="base_notes"
                          value={company.base_notes || ""}
                          onChange={(e) =>
                            setCompany({
                              ...company,
                              [e.target.name]: e.target.value,
                            })
                          }
                          fontSize="sm"
                          rows={4}
                          placeholder="Base Notes"
                          w="full"
                        />
                        <p className="mt-2 text-[10px] text-[var(--chakra-colors-black-500)] font-medium">
                          Base notes are displayed to drivers on all jobs placed
                          by this customer
                        </p>
                      </Box>
                    </SimpleGrid>
                    <Divider />
                    <Flex alignItems="center" mt="8px" mb="16px">
                      <FormLabel
                        display="flex"
                        width="200px"
                        fontSize="sm"
                        mb="0"
                        fontWeight="500"
                        color={textColor}
                      >
                        Company Logo
                      </FormLabel>
                      <Flex
                        alignItems={"center"}
                        ms={{ base: "0px", md: "0px" }}
                      >
                        {logoUrl && (
                          <Button
                            onClick={() =>
                              window.open(
                                logoUrl,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            fontSize="sm"
                            variant="outline"
                            fontWeight="500"
                            lineHeight="19px"
                            w="80%"
                            h="50"
                            mb="0"
                            className="!h-[39px]"
                          >
                            View Logo
                          </Button>
                        )}
                        <FileInputLink
                          width="60px"
                          height="50px"
                          entity="Company"
                          collection_name="companyLogo"
                          description="Upload Logo"
                          entityId={company.id}
                          onUpload={(new_url: string) => {
                            setLogoUrl(new_url);
                            getCompany();
                          }}
                          accept="image/*"
                        />
                      </Flex>
                    </Flex>

                    <Divider />

                    <h3 className="mt-6 mb-4">Billing</h3>
                    <Box mb="16px" maxW="md">
                      <FormLabel
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="4px"
                      >
                        Accounts email
                      </FormLabel>
                      <Input
                        type="text"
                        name="account_email"
                        value={company.account_email || ""}
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            [e.target.name]: e.target.value,
                          })
                        }
                        variant="main"
                        fontSize="sm"
                        fontWeight="500"
                        size="lg"
                        w="full"
                      />
                    </Box>

                    <h4 className="mt-6 mb-4">Billing Address</h4>
                    <Box mb="16px" maxW="md">
                      <FormLabel
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="4px"
                      >
                        Address
                      </FormLabel>
                      <Input
                        type="text"
                        name="address"
                        value={company.address || ""}
                        placeholder=""
                        variant="main"
                        fontSize="sm"
                        fontWeight="500"
                        size="lg"
                        w="full"
                        isReadOnly
                        onClick={() => setIsAddressModalOpen(true)}
                      />
                    </Box>
                    <AddressesModal
                      defaultAddress={company}
                      isModalOpen={isAddressModalOpen}
                      description="Billing address"
                      onModalClose={(e) => setIsAddressModalOpen(e)}
                      onSetAddress={(target) =>
                        setCompany({ ...company, ...target })
                      }
                    />

                    <SimpleGrid columns={2} spacing={4} mb="16px">
                      {[
                        { label: "Address line 1", name: "address_line_1" },
                        {
                          label: "Apt / Suite / Floor",
                          name: "address_line_2",
                        },
                        { label: "Address city", name: "address_city" },
                        { label: "Address state", name: "address_state" },
                        {
                          label: "Address postcode",
                          name: "address_postal_code",
                        },
                      ].map(({ label, name }) => (
                        <Box key={name}>
                          <FormLabel
                            fontSize="sm"
                            fontWeight="500"
                            color={textColor}
                            mb="4px"
                          >
                            {label}
                          </FormLabel>
                          <Input
                            type="text"
                            name={name}
                            value={(company as any)[name] || ""}
                            onChange={(e) =>
                              setCompany({
                                ...company,
                                [e.target.name]: e.target.value,
                              })
                            }
                            variant="main"
                            fontSize="sm"
                            fontWeight="500"
                            size="lg"
                            w="full"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>

                    <Divider />
                    <h3 className="mt-6 mb-4">Rates</h3>
                    <Flex alignItems="center" mb="16px">
                      <FormLabel
                        display="flex"
                        width="200px"
                        fontSize="sm"
                        mb="0"
                        fontWeight="500"
                        color={textColor}
                      >
                        Rate Card
                      </FormLabel>
                      <Flex
                        alignItems={"center"}
                        ms={{ base: "0px", md: "0px" }}
                      >
                        {rateCardUrl && (
                          <Button
                            onClick={() =>
                              window.open(
                                rateCardUrl,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            fontSize="sm"
                            variant="outline"
                            fontWeight="500"
                            lineHeight="19px"
                            w="80%"
                            h="50"
                            mb="0"
                            className="!h-[39px]"
                          >
                            Download Rate Card
                          </Button>
                        )}
                        <FileInputLink
                          width="60px"
                          height="50px"
                          entity="Company"
                          collection_name="rate_card_url"
                          description="Upload Rate Card"
                          entityId={company.id}
                          onUpload={(new_url: string) => {
                            setRateCardUrl(new_url);
                            getCompany();
                          }}
                          accept="application/pdf"
                        />
                      </Flex>
                    </Flex>

                    <Box mb="16px" maxW="md">
                      <FormLabel
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="4px"
                      >
                        LCL Rate
                      </FormLabel>
                      <Input
                        type="number"
                        name="lcl_rate"
                        value={company.lcl_rate || ""}
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            [e.target.name]: parseFloat(e.target.value),
                          })
                        }
                        variant="main"
                        fontSize="sm"
                        fontWeight="500"
                        size="lg"
                        w="full"
                      />
                    </Box>
                    <Divider />

                    <h3 className="mt-6 mb-4">Custom rate</h3>
                    <Box>
                      <Flex justifyContent="end" mb={4}>
                        <Button
                          onClick={addNewRate}
                          fontSize="sm"
                          variant="brand"
                          fontWeight="500"
                        >
                          + Add Rate
                        </Button>
                      </Flex>
                      <Grid
                        templateColumns="1fr 1fr 1fr 1fr 40px"
                        gap={4}
                        mb={4}
                      >
                        <Text fontSize="sm" fontWeight="500">
                          STATE
                        </Text>
                        <Text fontSize="sm" fontWeight="500">
                          QUADRANT
                        </Text>
                        <Text fontSize="sm" fontWeight="500">
                          CBM RATE
                        </Text>
                        <Text fontSize="sm" fontWeight="500">
                          MIN CHARGE
                        </Text>
                      </Grid>
                      {companyRates.map((rate, index) => (
                        <SimpleGrid
                          key={rate.id || index}
                          columns={5}
                          spacing={4}
                          mb={4}
                        >
                          <FormControl>
                            <Select
                              value={{ value: rate.state, label: rate.state }}
                              options={stateOptions}
                              onChange={(selected) => {
                                const updatedRates = [...companyRates];
                                updatedRates[index] = {
                                  ...rate,
                                  state: selected.value,
                                  seafreight_id: null,
                                  area: "",
                                  cbm_rate: 0,
                                  minimum_charge: 0,
                                };
                                setCompanyRates(updatedRates);
                              }}
                            />
                          </FormControl>
                          <FormControl>
                            <Select
                              value={{
                                value: rate.seafreight_id,
                                label: rate.area,
                              }}
                              options={groupedSeafreights[rate.state] || []}
                              onChange={(selected) => {
                                const selectedSeafreight = groupedSeafreights[
                                  rate.state
                                ]?.find(
                                  (sf: any) => sf.value === selected.value,
                                );
                                if (selectedSeafreight) {
                                  handleRateInputChange(
                                    index,
                                    "seafreight_id",
                                    selected.value,
                                  );
                                  handleRateInputChange(
                                    index,
                                    "area",
                                    selectedSeafreight.label,
                                  );
                                  handleRateInputChange(
                                    index,
                                    "cbm_rate",
                                    selectedSeafreight.cbm_rate,
                                  );
                                  handleRateInputChange(
                                    index,
                                    "minimum_charge",
                                    selectedSeafreight.min_charge,
                                  );
                                  setIsEditMode(true);
                                }
                              }}
                              isDisabled={!rate.state}
                            />
                          </FormControl>
                          <FormControl>
                            <Input
                              type="number"
                              value={rate.cbm_rate}
                              onChange={(e) =>
                                handleRateInputChange(
                                  index,
                                  "cbm_rate",
                                  e.target.value,
                                )
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <Input
                              type="number"
                              value={rate.minimum_charge}
                              onChange={(e) =>
                                handleRateInputChange(
                                  index,
                                  "minimum_charge",
                                  e.target.value,
                                )
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <IconButton
                              aria-label="Delete rate"
                              icon={<FontAwesomeIcon icon={faTimes} />}
                              size="sm"
                              sx={{
                                backgroundColor: "lightpink",
                                marginTop: "3px",
                              }}
                              colorScheme="red"
                              variant="ghost"
                              onClick={() =>
                                rate.id && handleDeleteRate(rate.id)
                              }
                              isDisabled={!rate.id}
                            />
                          </FormControl>
                        </SimpleGrid>
                      ))}

                      {isAddingRate && (
                        <Box mt={6}>
                          <Text fontSize="md" fontWeight="500" mb={4}>
                            Add New Rate
                          </Text>
                          <SimpleGrid columns={5} spacing={4}>
                            <Select
                              value={stateOptions.find(
                                (option) => option.value === selectedState,
                              )}
                              options={stateOptions}
                              onChange={handleStateChange}
                              placeholder="Select State"
                            />
                            <Select
                              value={(
                                groupedSeafreights as Record<string, any[]>
                              )[selectedState]?.find(
                                (option: any) =>
                                  option.value === companyRate.seafreight_id,
                              )}
                              options={
                                (groupedSeafreights as Record<string, any[]>)[
                                  selectedState
                                ] || []
                              }
                              onChange={handleRegionChange}
                              placeholder="Select Region"
                              isDisabled={!selectedState}
                            />
                            <Input
                              type="number"
                              value={companyRate.cbm_rate}
                              onChange={(e) =>
                                setCompanyRate({
                                  ...companyRate,
                                  cbm_rate: parseFloat(e.target.value),
                                })
                              }
                            />
                            <Input
                              type="number"
                              value={companyRate.minimum_charge}
                              onChange={(e) =>
                                setCompanyRate({
                                  ...companyRate,
                                  minimum_charge: parseFloat(e.target.value),
                                })
                              }
                            />
                          </SimpleGrid>
                        </Box>
                      )}

                      <Button
                        onClick={saveRates}
                        fontSize="sm"
                        variant="brand"
                        fontWeight="500"
                        mt={6}
                        mb={4}
                        isDisabled={!hasValidChangesToSave()}
                        isLoading={isSaving}
                      >
                        Save Rates
                      </Button>
                    </Box>
                    <Divider />
                    <SimpleGrid columns={3} spacing={4} mt="10px" mb="16px">
                      {[
                        {
                          label: "Job Type (Standard for all?)",
                          key: "standard_static",
                        },
                        { label: "Toll Enabled", key: "toll_enabled" },
                        {
                          label: "Waiting Time Enabled",
                          key: "waiting_enabled",
                        },
                        { label: "Send POD", key: "is_pod_sendable" },
                        { label: "Send Invoice", key: "is_invoice_sendable" },
                      ].map(({ label, key }) => (
                        <Box key={key}>
                          <FormLabel
                            fontSize="sm"
                            fontWeight="500"
                            color={textColor}
                            mb="4px"
                          >
                            {label}
                          </FormLabel>
                          <RadioGroup
                            value={(company as any)[key] ? "1" : "0"}
                            onChange={(e) =>
                              setCompany({ ...company, [key]: e === "1" })
                            }
                          >
                            <Stack direction="row" pt={1}>
                              <Radio value="0">No</Radio>
                              <Radio value="1" pl={6}>
                                Yes
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </Box>
                      ))}
                    </SimpleGrid>
                    <Divider />
                  </Box>
                </FormControl>
              )}

              {/* Company Users */}
              {isCompanySetting == 1 && (
                <>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb="24px"
                    className="mt-8"
                  >
                    <h2 className="mb-0">Company Users</h2>
                    <Flex>
                      <Link
                        href={`/admin/customers/create?company_id=${id}`}
                        me="8px"
                      >
                        <Button
                          fontSize="sm"
                          variant="brand"
                          fontWeight="500"
                          lineHeight="19px"
                          w="100%"
                          h="50"
                          mb="0"
                          ms="10px"
                          className="!h-[39px]"
                        >
                          Create New
                        </Button>
                      </Link>
                      <Button
                        fontSize="sm"
                        variant="brand"
                        fontWeight="500"
                        lineHeight="19px"
                        w="100%"
                        h="50"
                        mb="0"
                        ms="10px"
                        onClick={onOpen}
                        className="!h-[39px]"
                      >
                        Add existing
                      </Button>

                      <Modal isOpen={isOpen} onClose={onClose}>
                        <ModalOverlay />
                        <ModalContent>
                          <ModalHeader>Add existing customer</ModalHeader>
                          <ModalCloseButton />
                          <ModalBody>
                            <Divider mb="24px" />
                            <Text mb="24px">
                              Search existing customers to add to this company
                            </Text>
                            <Box className="!max-w-md w-full">
                              <Select
                                placeholder="Select customer"
                                options={availableCustomersOptions}
                                onChange={(e) => setSelectCustomerId(e.value)}
                                size="lg"
                                className="select mb-0"
                                classNamePrefix="two-easy-select"
                              />
                            </Box>
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              variant="outline"
                              mr="auto"
                              onClick={onClose}
                            >
                              Close
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleAddCustomer}
                            >
                              Add to company
                            </Button>
                          </ModalFooter>
                        </ModalContent>
                      </Modal>
                    </Flex>
                  </Flex>
                  <Divider />
                  <Box pt={{ base: "40px", md: "40px", xl: "40px" }}>
                    <SimpleGrid
                      mb="20px"
                      columns={{ sm: 1 }}
                      spacing={{ base: "20px", xl: "20px" }}
                    >
                      <Flex minWidth="max-content">
                        <SearchBar
                          background={menuBg}
                          onChangeSearchQuery={onChangeSearchQuery}
                          me="10px"
                          borderRadius="30px"
                        />
                      </Flex>
                      {!loading && customers?.customers.data.length >= 0 && (
                        <Box
                          sx={{
                            "th, td": {
                              paddingX: "12px",
                              whiteSpace: "nowrap",
                            },
                          }}
                        >
                          <PaginationTable
                            columns={columns}
                            total={
                              customers?.customers.paginatorInfo.total ?? 0
                            }
                            data={customers?.customers.data}
                            options={{
                              initialState: {
                                pageIndex: queryPageIndex,
                                pageSize: queryPageSize,
                              },
                              manualPagination: true,
                              pageCount:
                                customers?.customers.paginatorInfo.lastPage,
                            }}
                            setQueryPageIndex={setQueryPageIndex}
                            setQueryPageSize={setQueryPageSize}
                            onDelete={handleRemoveCustomer}
                            isServerSide
                            path="/admin/customers"
                          />
                        </Box>
                      )}
                    </SimpleGrid>
                  </Box>

                  {/* ✅ Remove-customer confirmation dialog */}
                  <AlertDialog
                    isOpen={isDeleteConfirmOpen}
                    leastDestructiveRef={cancelDeleteRef}
                    onClose={onCloseDeleteConfirm}
                    isCentered
                  >
                    <AlertDialogOverlay>
                      <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                          Remove Customer
                        </AlertDialogHeader>
                        <AlertDialogBody>
                          Are you sure you want to remove this customer from the
                          company?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                          <Button
                            ref={cancelDeleteRef}
                            onClick={onCloseDeleteConfirm}
                          >
                            Cancel
                          </Button>
                          <Button
                            colorScheme="red"
                            onClick={handleConfirmRemoveCustomer}
                            ml={3}
                          >
                            Remove
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogOverlay>
                  </AlertDialog>
                </>
              )}

              {/* Invoice */}
              {isCompanySetting == 2 && company.id !== null && (
                <InvoiceTab company_id={company.id} />
              )}
            </GridItem>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default CompanyEdit;
