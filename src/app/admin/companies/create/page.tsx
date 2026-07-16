"use client";
// React and Next.js imports
// Apollo GraphQL imports
import { useMutation } from "@apollo/client/react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
// Chakra UI imports
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
// Third-party library imports
import { Select } from "chakra-react-select";
// Local components imports
import AddressesModal from "@/components/addresses/AddressesModal";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
// Local GraphQL imports
import {
  CREATE_COMPANY_MUTATION,
  defaultCompany,
  paymentTerms,
} from "@/graphql/company";
import {
  CompanyRate,
  CREATE_COMPANY_RATE_MUTATION,
  GET_LIST_OF_SEAFREIGHTS,
} from "@/graphql/CompanyRate";
// Layout imports
import { useRouter } from "next/navigation";
import { useState } from "react";

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

function CompanyCreate() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [company, setCompany] = useState(defaultCompany);
  const router = useRouter();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [groupedSeafreights, setGroupedSeafreights] =
    useState<GroupedSeafreights>({});
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [_regionOption, setRegionOption] = useState([]);
  const [companyRates, setCompanyRates] = useState<CompanyRate[]>([
    {
      id: undefined,
      company_id: "",
      seafreight_id: null,
      area: "",
      cbm_rate: 0,
      minimum_charge: 0,
      state: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [createCompanyRate] = useMutation(CREATE_COMPANY_RATE_MUTATION);

  const [handleCreateCompany, {}] = useMutation<{
    createCompany: { id: string | number };
  }>(CREATE_COMPANY_MUTATION, {
    variables: {
      input: {
        name: company.name,
        abn: company.abn,
        contact_phone: company.contact_phone,
        contact_email: company.contact_email,
        account_email: company.account_email,
        address: company.address,
        address_business_name: company.address_business_name,
        address_line_1: company.address_line_1,
        address_line_2: company.address_line_2,
        address_city: company.address_city,
        address_postal_code: company.address_postal_code,
        address_state: company.address_state,
        address_country: company.address_country,
        lng: company.lng,
        lat: company.lat,
        lcl_rate: company.lcl_rate,
        rate_card_url: undefined,
        logo_url: undefined,
        payment_term: company.payment_term ?? "7_days",
        weight_per_cubic: company.weight_per_cubic ?? 500,
        standard_static: company.standard_static ?? false,
      },
    },
    onCompleted: async (data) => {
      try {
        const validRates = companyRates.filter(
          (rate) =>
            rate.seafreight_id &&
            rate.area &&
            rate.cbm_rate > 0 &&
            rate.minimum_charge > 0,
        );

        for (const rate of validRates) {
          await createCompanyRate({
            variables: {
              company_id: Number(data?.createCompany.id),
              seafreight_id: Number(rate.seafreight_id),
              area: rate.area,
              cbm_rate: parseFloat(rate.cbm_rate.toString()),
              state: rate.state,
              minimum_charge: parseFloat(rate.minimum_charge.toString()),
            },
          });
        }

        toast({
          title: "Company and rates created successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        router.push("/admin/companies");
      } catch (error) {
        showGraphQLErrorToast(error as any);
      }
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const handleRateChange = (index: number, field: string, value: any) => {
    const updatedRates = [...companyRates];
    updatedRates[index] = {
      ...updatedRates[index],
      [field]: value,
    };
    setCompanyRates(updatedRates);
  };

  useApolloQueryWithEffect<{ allSeafreights: any[] }>(GET_LIST_OF_SEAFREIGHTS, {
    onCompleted(data) {
      const grouped = data.allSeafreights.reduce(
        (acc: { [x: string]: Seafreight[] }, item: any) => {
          if (!acc[item.state]) {
            acc[item.state] = [];
          }
          acc[item.state].push({
            value: item.id,
            label: item.location_name,
            cbm_rate: item.cbm_rate,
            min_charge: item.min_charge,
            state: item.state,
          });
          return acc;
        },
        {},
      );
      setGroupedSeafreights(grouped);
      const states = Object.keys(grouped).map((state) => ({
        value: state,
        label: state,
      }));
      setStateOptions(states);
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

  const handleSaveRow = (index: number) => {
    const currentRate = companyRates[index];

    if (
      !currentRate.state ||
      !currentRate.area ||
      !currentRate.seafreight_id ||
      !currentRate.cbm_rate ||
      !currentRate.minimum_charge
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please select State and Location, minimum charge and CBM rate before saving",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCompanyRates((prevCompanyRates) => [
      ...prevCompanyRates,
      {
        id: "",
        company_id: "",
        seafreight_id: null,
        area: "",
        state: "",
        cbm_rate: 0,
        minimum_charge: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    setSelectedState("");
    setRegionOption([]);
  };

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

      const currentIndex = companyRates.length - 1;
      const updatedRates = [...companyRates];
      updatedRates[currentIndex] = {
        ...updatedRates[currentIndex],
        seafreight_id: selected.value,
        area: selectedSeafreight.label,
        state: selectedState,
        cbm_rate: selectedSeafreight.cbm_rate || 0,
        minimum_charge: selectedSeafreight.min_charge || 0,
      };

      setCompanyRates(updatedRates);
    }
  };
  const handleStateChange = (selected: any) => {
    setSelectedState(selected.value);
  };

  const isRegionAlreadyUsed = (state: string, region: string) => {
    return companyRates.some(
      (rate) => rate.state === state && rate.area === region,
    );
  };

  return (
    <Box
      className="mk-companyCreate"
      pt={{ base: "130px", md: "97px", xl: "97px" }}
    >
      {/* Main Fields */}
      <Grid pt="32px" px="24px">
        <FormControl>
          <Flex justifyContent="space-between" alignItems="center">
            <h1 className="mb-0">New Company</h1>
            <Button
              fontSize="sm"
              variant="brand"
              onClick={() => handleCreateCompany()}
            >
              Create
            </Button>
          </Flex>

          <Divider className="my-6" />

          <Box
            p="4"
            mb="2"
            bg={useColorModeValue("white", "navy.800")}
            borderRadius="16px"
          >
            <h3 className="mb-4">Details</h3>

            <SimpleGrid columns={2} spacing={4} mb="16px">
              {[
                { label: "Company Name", name: "name", type: "text" },
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
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        [e.target.name]: e.target.value,
                      })
                    }
                    placeholder={placeholder || ""}
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
                  Payment Terms
                </FormLabel>
                <Select
                  placeholder="Select Payment Terms"
                  value={paymentTerms.find(
                    (term) => term.value === company.payment_term,
                  )}
                  options={paymentTerms}
                  onChange={(selectedOption) => {
                    setCompany({
                      ...company,
                      payment_term: selectedOption?.value,
                    });
                  }}
                  size="lg"
                  className="select mb-0"
                  classNamePrefix="two-easy-select"
                />
              </Box>

              <Box>
                <FormLabel
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="4px"
                >
                  Weight(kg/cubic)
                </FormLabel>
                <Input
                  isRequired
                  type="text"
                  name="weight_per_cubic"
                  value={company.weight_per_cubic}
                  onChange={(e) =>
                    setCompany({ ...company, [e.target.name]: e.target.value })
                  }
                  variant="main"
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
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
                  Fuel Levy %
                </FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  name="fuel_levy_percentage"
                  value={company.fuel_levy_percentage ?? 22}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      fuel_levy_percentage: parseFloat(e.target.value),
                    })
                  }
                  variant="main"
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
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
                  QLD Toll Levy %
                </FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  name="qld_toll_levy_percentage"
                  value={company.qld_toll_levy_percentage ?? 8}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      qld_toll_levy_percentage: parseFloat(e.target.value),
                    })
                  }
                  variant="main"
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
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
                  VIC Toll Levy %
                </FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  name="vic_toll_levy_percentage"
                  value={company.vic_toll_levy_percentage ?? 12}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      vic_toll_levy_percentage: parseFloat(e.target.value),
                    })
                  }
                  variant="main"
                  fontSize="sm"
                  fontWeight="500"
                  size="lg"
                  w="full"
                />
              </Box>
            </SimpleGrid>

            <Flex className="w-full" alignItems="center" mb="16px">
              <FormLabel
                display="flex"
                mb="0"
                width="200px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
              >
                Job Type (Would you like to display &apos;Standard&apos; for all
                dates and times?)
              </FormLabel>

              <RadioGroup
                value={company.standard_static ? "1" : "0"}
                onChange={(e) => {
                  setCompany({
                    ...company,
                    standard_static: e === "1" ? true : false,
                  });
                }}
              >
                <Stack direction="row" pt={3}>
                  <Radio value="0">No</Radio>
                  <Radio value="1" pl={6}>
                    Yes
                  </Radio>
                </Stack>
              </RadioGroup>
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
                isRequired
                type="text"
                name="account_email"
                value={company.account_email}
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
                value={company.address}
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
              onSetAddress={(target) => {
                setCompany({ ...company, ...target });
              }}
            />

            <SimpleGrid columns={2} spacing={4} mb="16px">
              {[
                { label: "Address line 1", name: "address_line_1" },
                { label: "Apt / Suite / Floor", name: "address_line_2" },
                { label: "Address city", name: "address_city" },
                { label: "Address state", name: "address_state" },
                { label: "Address postcode", name: "address_postal_code" },
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
                    isRequired
                    type="text"
                    name={name}
                    value={(company as any)[name]}
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

            <h3 className="mt-6 mb-4">Rates </h3>
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
                isRequired
                type="number"
                name="lcl_rate"
                value={company.lcl_rate}
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

            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <h3 className="mt-6 mb-4">Custom rate </h3>
            </Flex>
            <SimpleGrid columns={5} spacing={4} className="mb-4">
              <Box>
                {" "}
                <FormLabel>STATE</FormLabel>{" "}
              </Box>
              <Box>
                {" "}
                <FormLabel>QUADRANT</FormLabel>{" "}
              </Box>
              <Box>
                {" "}
                <FormLabel>CBM RATE</FormLabel>{" "}
              </Box>
              <Box>
                {" "}
                <FormLabel>MIN CHARGE</FormLabel>{" "}
              </Box>
            </SimpleGrid>
            {companyRates.slice(0, -1).map((rate, idx) => (
              <SimpleGrid key={idx} columns={5} spacing={4} className="mb-4">
                <Box>
                  <Input value={rate.state} isReadOnly />
                </Box>
                <Box>
                  <Input value={rate.area} isReadOnly />
                </Box>
                <Box>
                  <Input value={rate.cbm_rate} isReadOnly />
                </Box>
                <Box>
                  <Input value={rate.minimum_charge} isReadOnly />
                </Box>
              </SimpleGrid>
            ))}

            {/* Input row for new rate */}
            <SimpleGrid columns={5} spacing={4} className="mb-4">
              <Box>
                <Select
                  placeholder="Select State"
                  options={stateOptions}
                  onChange={handleStateChange}
                  value={stateOptions.find(
                    (option) => option.value === selectedState,
                  )}
                />
              </Box>
              <Box>
                <Select
                  placeholder="Select Quadrant"
                  options={
                    selectedState ? groupedSeafreights[selectedState] : []
                  }
                  onChange={handleRegionChange}
                  isDisabled={!selectedState}
                />
              </Box>
              <Box>
                <Input
                  type="number"
                  value={companyRates[companyRates.length - 1]?.cbm_rate || 0}
                  onChange={(e) =>
                    handleRateChange(
                      companyRates.length - 1,
                      "cbm_rate",
                      parseFloat(e.target.value),
                    )
                  }
                />
              </Box>
              <Box>
                <Input
                  type="number"
                  value={
                    companyRates[companyRates.length - 1]?.minimum_charge || 0
                  }
                  onChange={(e) =>
                    handleRateChange(
                      companyRates.length - 1,
                      "minimum_charge",
                      parseFloat(e.target.value),
                    )
                  }
                />
              </Box>
              <Box>
                <Button
                  onClick={() => handleSaveRow(companyRates.length - 1)}
                  colorScheme="blue"
                  width="full"
                >
                  +
                </Button>
              </Box>
            </SimpleGrid>
          </Box>
        </FormControl>
      </Grid>
    </Box>
  );
}

export default CompanyCreate;
