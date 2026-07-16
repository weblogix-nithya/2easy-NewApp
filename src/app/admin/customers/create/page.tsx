"use client";
import { useMutation } from "@apollo/client/react";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
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
  Textarea,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { GET_COMPANY_QUERY, GET_COMPANYS_QUERY } from "@/graphql/company";
import { CREATE_CUSTOMER_MUTATION, defaultCustomer } from "@/graphql/customer";
import debounce from "lodash.debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Shared shape for GET_COMPANY_QUERY response
interface CompanyQueryResult {
  company: { id: string; name: string };
}

// Shared shape for GET_COMPANYS_QUERY response
interface CompanysQueryResult {
  companys: {
    data: { id: string; name: string }[];
    paginatorInfo: { total: number; lastPage?: number };
  };
}

// Shared shape for CREATE_CUSTOMER_MUTATION response
interface CreateCustomerResult {
  createCustomer: { id: string | number };
}

function CustomerCreate() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [customer, setCustomer] = useState(defaultCustomer);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | number | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const company_id = searchParams.get("company_id");

  const onChangeCompanySearch = useMemo(
    () => debounce((e: string) => setCompanySearch(e), 300),
    [],
  );

  const [handleCreateCustomer, { }] = useMutation<CreateCustomerResult>(
    CREATE_CUSTOMER_MUTATION,
    {
      variables: {
        input: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          abn: customer.abn,
          phone_no: customer.phone_no,
          email: customer.email,
          company_name: companyName || customer.company_name,
          company_id: company_id || selectedCompanyId || null,
        },
      },
      onCompleted: (data) => {
        toast({
          title: "Customer created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push(`/admin/customers/${data?.createCustomer.id}`);
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  // Fetch single company when company_id comes from URL (locked/disabled mode)
  const [getCompany] = useApolloLazyQueryWithEffect<CompanyQueryResult>(
    GET_COMPANY_QUERY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data.company) {
          setCompanyName(data?.company.name);
        }
      },
      onError(error) {
        console.log(error);
      },
    },
  );

  useEffect(() => {
    if (company_id) {
      getCompany({ variables: { id: company_id } });
    }
  }, [company_id, getCompany]);

  // Fetch companies list for the dropdown (only needed when no company_id in URL)
  const { loading: companiesLoading } = useApolloQueryWithEffect<CompanysQueryResult>(
    GET_COMPANYS_QUERY,
    {
      variables: {
        query: companySearch,
        page: 1,
        first: 2050,
        orderByColumn: "name",
        orderByOrder: "ASC",
      },
      skip: !!company_id,
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        setCompanyOptions(
          data.companys.data.map((c) => ({ value: c.id, label: c.name })),
        );
      },
      onError: (error) => {
        console.error("Failed to load companies", error);
      },
    },
  );

  return (
    <Box
      className="mk-customerCreate"
      pt={{ base: "130px", md: "97px", xl: "97px" }}
    >
      {/* Main Fields */}
      <Grid pt="32px" px="24px">
        <FormControl>
          <Flex justifyContent="space-between" alignItems="center">
            <h1 className="mb-0">New Customer</h1>
            <Button variant="brand" onClick={() => handleCreateCustomer()}>
              Create
            </Button>
          </Flex>

          <Divider className="my-6" />

          <h3 className="mb-4">Details</h3>

          <SimpleGrid columns={2} spacing={4} mb="16px">
            {[
              { label: "First Name", name: "first_name", placeholder: "John" },
              { label: "Last Name", name: "last_name", placeholder: "Doe" },
              { label: "ABN", name: "abn", placeholder: "" },
              { label: "Phone Number", name: "phone_no", placeholder: "" },
              { label: "Email", name: "email", placeholder: "" },
            ].map(({ label, name, placeholder }) => (
              <Box key={name}>
                <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                  {label}
                </FormLabel>
                <Input
                  isRequired
                  type="text"
                  name={name}
                  value={(customer as any)[name] || ""}
                  onChange={(e) =>
                    setCustomer({ ...customer, [e.target.name]: e.target.value })
                  }
                  placeholder={placeholder}
                  variant="main"
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
                  w="full"
                />
              </Box>
            ))}

            <Box>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                Full Name
              </FormLabel>
              <Input
                disabled
                isRequired
                type="text"
                name="full_name"
                value={`${customer.first_name} ${customer.last_name}`}
                onChange={(e) =>
                  setCustomer({ ...customer, [e.target.name]: e.target.value })
                }
                placeholder="Doe"
                fontSize="sm"
                fontWeight="500"
                size="lg"
                w="full"
              />
            </Box>
            <SimpleGrid columns={2} spacing={4} mb="16px">
              <Box>
                <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                  Admin Notes
                </FormLabel>
                <Textarea
                  isRequired
                  name="admin_notes"
                  value={customer.admin_notes}
                  onChange={(e) =>
                    setCustomer({ ...customer, [e.target.name]: e.target.value })
                  }
                  placeholder="Admin notes"
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
                  w="full"
                />
              </Box>

              <Box>
                <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                  Base Notes
                </FormLabel>
                <Textarea
                  isRequired
                  name="base_notes"
                  value={customer.base_notes}
                  onChange={(e) =>
                    setCustomer({ ...customer, [e.target.name]: e.target.value })
                  }
                  placeholder="Base notes"
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
                  w="full"
                />
              </Box>
            </SimpleGrid>
            <Box>
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                Company Name
              </FormLabel>
              {company_id ? (
                <Input
                  disabled
                  isRequired
                  type="text"
                  value={companyName || ""}
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
                  w="full"
                />
              ) : (
                <Select
                  placeholder="Select company"
                  isLoading={companiesLoading}
                  options={companyOptions}
                  value={companyOptions.find((opt) => opt.value === selectedCompanyId) || null}
                  onInputChange={(val) => onChangeCompanySearch(val)}
                  onChange={(selected) => {
                    setSelectedCompanyId(selected?.value ?? null);
                    setCompanyName(selected?.label ?? null);
                    setCustomer({ ...customer, company_name: selected?.label ?? "" });
                  }}
                  isClearable
                  size="lg"
                  className="select mb-0"
                  classNamePrefix="two-easy-select"
                  menuPosition="fixed"
                  menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                />
              )}
            </Box>
          </SimpleGrid>


        </FormControl>
      </Grid>
    </Box>
  );
}

export default CustomerCreate;