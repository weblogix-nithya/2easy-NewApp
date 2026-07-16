"use client";
import { useMutation } from "@apollo/client/react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Textarea,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AreYouSureAlert from "@/components/alert/AreYouSureAlert";
import CustomerAddressesTab from "@/components/tabs/CustomerAddressesTab";
import CustomerJobsTab from "@/components/tabs/CustomerJobsTab";
import CustomerVehicleHiresTab from "@/components/tabs/CustomerVehicleHiresTab";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { GET_COMPANYS_QUERY } from "@/graphql/company";
import {
  defaultCustomer,
  DELETE_CUSTOMER_MUTATION,
  GET_CUSTOMER_QUERY,
  UPDATE_CUSTOMER_MUTATION,
} from "@/graphql/customer";
import debounce from "lodash.debounce";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

// Shared shape for GET_CUSTOMER_QUERY response
interface CustomerQueryResult {
  customer: any;
}

// Shared shape for GET_COMPANYS_QUERY response
interface CompanysQueryResult {
  companys: {
    data: { id: string; name: string }[];
    paginatorInfo: { total: number; lastPage?: number };
  };
}

function CustomerEdit() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [customer, setCustomer] = useState(defaultCustomer);
  const [tabId, setTabId] = useState(0);
  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();
  const params = useParams();
  const id = (params?.id ?? "") as string;
  const { isAdmin } = useSelector((state: RootState) => state.user);

  const onChangeCompanySearch = useMemo(
    () => debounce((e: string) => setCompanySearch(e), 300),
    [],
  );

  const { loading: customerLoading } = useApolloQueryWithEffect<CustomerQueryResult>(
    GET_CUSTOMER_QUERY,
    {
      variables: { id },
      skip: !id,
      onCompleted: (data) => {
        if (data?.customer == null) {
          router.push("/admin/customers");
        }
        setCustomer({ ...customer, ...data?.customer });
      },
      onError(error) {
        console.log("onError");
        console.log(error);
      },
    },
  );

  // Companies dropdown — only needed while editing a customer with no company yet
  const { loading: companiesLoading } = useApolloQueryWithEffect<CompanysQueryResult>(
    GET_COMPANYS_QUERY,
    {
      variables: {
        query: companySearch,
        page: 1,
        first: 50,
        orderByColumn: "name",
        orderByOrder: "ASC",
      },
      skip: !!customer.company_id,
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

  const [handleUpdateCustomer, { }] = useMutation(UPDATE_CUSTOMER_MUTATION, {
    variables: {
      input: customer,
    },
    onCompleted: (_data) => {
      toast({
        title: "Customer updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [handleDeleteCustomer, { }] = useMutation(DELETE_CUSTOMER_MUTATION, {
    variables: {
      id: id,
    },
    onCompleted: (_data) => {
      toast({
        title: "Customer deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/admin/customers");
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  return (
    <Box
      className="mk-customers-id overflow-auto"
      mt={{ base: "130px", md: "97px", xl: "97px" }}
      h={{
        base: "calc(100vh - 130px)",
        md: "calc(100vh - 97px)",
        xl: "calc(100vh - 97px)",
      }}
      backgroundColor="white"
    >
      {/* Main Fields */}
      <Grid
        pr="24px"
        className="mk-mainInner"
        h={{
          base: "calc(100vh - 130px)",
          md: "calc(100vh - 97px)",
          xl: "calc(100vh - 97px)",
        }}
      >
        {!customerLoading && (
          <Grid
            templateAreas={`"nav main"`}
            gridTemplateRows={"calc(100vh)"}
            gridTemplateColumns={"25% 1fr"}
            h={{
              base: "calc(100vh - 130px)",
              md: "calc(100vh - 97px)",
              xl: "calc(100vh - 97px)",
            }}
            gap="1"
            backgroundColor="white"
            color="blackAlpha.700"
            fontWeight="bold"
          >
            {/* Left side */}
            <GridItem
              area={"nav"}
              className="border-r border-[var(--chakra-colors-gray-200)]"
              sx={{ height: "calc(100vh - 97px)" }}
              backgroundColor="white"
            >
              <Box mx="26px">
                <h2 className="mt-10 mb-4">{!customer.name && "Customer"}</h2>

                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Admin Notes
                </FormLabel>
                <Textarea
                  name="admin_notes"
                  value={customer.admin_notes || ""}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      [e.target.name]: e.target.value,
                    })
                  }
                  placeholder="Admin Notes"
                  mb="16px"
                  fontSize="sm"
                />

                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Base Notes
                </FormLabel>
                <Textarea
                  fontSize="sm"
                  name="base_notes"
                  value={customer.base_notes || ""}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      [e.target.name]: e.target.value,
                    })
                  }
                  placeholder="Admin Notes"
                />
                <p className="mt-2 text-[10px] text-[var(--chakra-colors-black-500)] font-medium">
                  Base notes are displayed to drivers on all jobs placed by
                  this customer
                </p>
              </Box>

              <Flex mt={8} flexDirection="column" className="border-b">
                <Button
                  disabled={tabId == 0}
                  onClick={() => setTabId(0)}
                  alignItems="start"
                  h={45}
                  fontSize="14px"
                  className={
                    "!items-center !justify-start !font-medium !rounded-none " +
                    (tabId == 0
                      ? "text-white !bg-[var(--chakra-colors-primary-400)] "
                      : "text-[var(--chakra-colors-black-400)] !bg-white")
                  }
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1" />
                  Profile
                </Button>
                <Button
                  disabled={tabId == 1}
                  onClick={() => setTabId(1)}
                  alignItems="start"
                  h={45}
                  fontSize="14px"
                  className={
                    "!items-center !justify-start !font-medium !rounded-none " +
                    (tabId == 1
                      ? "text-white !bg-[var(--chakra-colors-primary-400)] "
                      : "text-[var(--chakra-colors-black-400)] !bg-white")
                  }
                >
                  <FontAwesomeIcon icon={faMapLocationDot} className="mr-1" />
                  Addresses
                </Button>

                <Button
                  disabled={tabId == 2}
                  onClick={() => setTabId(2)}
                  alignItems="start"
                  h={45}
                  fontSize="14px"
                  className={
                    "!items-center !justify-start !font-medium !rounded-none " +
                    (tabId == 2
                      ? "text-white !bg-[var(--chakra-colors-primary-400)] "
                      : "text-[var(--chakra-colors-black-400)] !bg-white")
                  }
                >
                  <FontAwesomeIcon icon={faTruck} className="mr-1" />
                  Delivery Jobs
                </Button>
                <Button
                  disabled={tabId == 3}
                  onClick={() => setTabId(3)}
                  alignItems="start"
                  h={45}
                  fontSize="14px"
                  className={
                    "!items-center !justify-start !font-medium !rounded-none " +
                    (tabId == 3
                      ? "text-white !bg-[var(--chakra-colors-primary-400)] "
                      : "text-[var(--chakra-colors-black-400)] !bg-white")
                  }
                >
                  <FontAwesomeIcon icon={faTruckFast} className="mr-1" />
                  Hourly Hires
                </Button>
              </Flex>
            </GridItem>

            {/* Right side */}
            <GridItem
              pl="2"
              area={"main"}
              h={{
                base: "calc(100vh - 130px)",
                md: "calc(100vh - 97px)",
                xl: "calc(100vh - 97px)",
              }}
              backgroundColor="white"
            >
              {tabId == 0 && (
                <FormControl>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb="24px"
                    className="mt-8"
                  >
                    <h2 className="mb-0">Profile</h2>

                    <Flex>
                      {isAdmin && (
                        <AreYouSureAlert
                          onDelete={handleDeleteCustomer}
                        ></AreYouSureAlert>
                      )}
                      <Button
                        fontSize="sm"
                        variant="brand"
                        fontWeight="500"
                        w="100%"
                        mb="0"
                        ms="10px"
                        onClick={() => handleUpdateCustomer()}
                        isLoading={customerLoading}
                      >
                        Update
                      </Button>
                    </Flex>
                  </Flex>

                  <Divider />

                  <h3 className="mt-6 mb-4">Details</h3>

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
                          variant="main"
                          fontSize="sm"
                          type="text"
                          name={name}
                          value={(customer as any)[name] || ""}
                          onChange={(e) =>
                            setCustomer({
                              ...customer,
                              [e.target.name]: e.target.value,
                            })
                          }
                          placeholder={placeholder}
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
                        variant="main"
                        fontSize="sm"
                        type="text"
                        name="full_name"
                        value={`${customer.first_name} ${customer.last_name}`}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            [e.target.name]: e.target.value,
                          })
                        }
                        placeholder="Doe"
                        fontWeight="500"
                        size="lg"
                        w="full"
                      />
                    </Box>

                    <Box>
                      <FormLabel
                        display="flex"
                        mb="0"
                        width="200px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                      >
                        Company Name
                      </FormLabel>

                      <Box flex="1">
                        <Select
                          placeholder="Select company"
                          // isDisabled={customer.company_id !== null}
                          isLoading={!customer.company_id && companiesLoading}
                          options={companyOptions}
                          value={
                            customer.company_id
                              ? { value: customer.company_id, label: customer.company_name }
                              : companyOptions.find((opt) => opt.value === customer.company_id) || null
                          }
                          onInputChange={(val) => onChangeCompanySearch(val)}
                          onChange={(selected) => {
                            setCustomer({
                              ...customer,
                              company_id: selected?.value ?? null,
                              company_name: selected?.label ?? "",
                            });
                          }}
                          isClearable
                          size="lg"
                          className="select mb-0"
                          classNamePrefix="two-easy-select"
                          menuPosition="fixed"
                          menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                        />
                      </Box>
                    </Box>
                  </SimpleGrid>

                  <Flex
                    alignItems="flex-end"
                    flexDirection="column"
                    mb="16px"
                    className="w-full"
                  >
                    {customer.company_id !== null && (
                      <Link
                        href={`/admin/companies/${customer.company_id}`}
                        className="mt-3 text-[var(--chakra-colors-primary-400)]"
                      >
                        Go to company
                      </Link>
                    )}
                  </Flex>

                  <SimpleGrid columns={2} spacing={4} mb="16px">
                    {[
                      { label: "Company Admin", key: "is_company_admin" },
                      { label: "Send POD", key: "is_pod_sendable" },
                      { label: "Send Invoice", key: "is_invoice_sendable" },
                    ].map(({ label, key }) => (
                      <Box key={key}>
                        <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                          {label}
                        </FormLabel>
                        <RadioGroup
                          value={(customer as any)[key] ? "1" : "0"}
                          onChange={(e) => {
                            setCustomer({
                              ...customer,
                              [key]: e === "1" ? true : false,
                            });
                          }}
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
                </FormControl>
              )}

              {tabId == 1 && (
                <CustomerAddressesTab
                  customer={customer}
                ></CustomerAddressesTab>
              )}

              {tabId == 2 && (
                <CustomerJobsTab customer={customer}></CustomerJobsTab>
              )}

              {tabId == 3 && (
                <CustomerVehicleHiresTab
                  customer={customer}
                ></CustomerVehicleHiresTab>
              )}
            </GridItem>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default CustomerEdit;