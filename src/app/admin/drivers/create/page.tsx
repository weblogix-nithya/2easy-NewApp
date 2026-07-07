"use client";
import { useMutation } from "@apollo/client/react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import AddressesModal from "@/components/addresses/AddressesModal";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import InsuranceSection from "@/components/tabs/InsuranceSectionTab";
import {
  CREATE_DRIVER_MUTATION,
  defaultDriver,
  DriverInsurance,
  DriverStatusesResponse,
} from "@/graphql/driver";
import { GET_DRIVER_STATUSES_QUERY } from "@/graphql/driverStatus";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// ─── helpers ────────────────────────────────────────────────────────────────

const buildInsuranceInput = (ins: DriverInsurance) => ({
  id: ins.id,
  insurance_type_id: ins.insuranceType?.id ?? ins.insurance_type_id ?? null,
  insurance_name: ins.insurance_name,
  insurance_number: ins.insurance_number,
  insurance_expire_at: ins.insurance_expire_at ?? "",
});

// ─── component ──────────────────────────────────────────────────────────────

function DriverCreate() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [driver, setDriver] = useState(defaultDriver);
  const [driverStatuses, setDriverStatuses] = useState<
    { value: number; label: string }[]
  >([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tabId, setTabId] = useState(0);
  const router = useRouter();

  // ── lookup queries ──────────────────────────────────────────────────────

  useApolloQueryWithEffect<DriverStatusesResponse>(GET_DRIVER_STATUSES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      const list = data?.driverStatuses?.data;
      if (!Array.isArray(list)) return;
      setDriverStatuses(
        list.map((s: any) => ({ value: parseInt(s.id), label: s.name })),
      );
    },
  });

  // ── mutation ────────────────────────────────────────────────────────────

  const [handleDriverCreate, { loading: creating }] = useMutation(
    CREATE_DRIVER_MUTATION,
    {
      onCompleted: (data: any) => {
        toast({
          title: "Driver Created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push(`/admin/drivers/${data.createDriver.id}`);
      },
      onError: (error) => showGraphQLErrorToast(error),
    },
  );

  const submitCreate = useCallback(() => {
    handleDriverCreate({
      variables: {
        input: {
          ...driver,
          id: undefined,
          media_url: undefined,
          full_name: undefined,
          license_media: undefined,
          vehicle_media: undefined,
          remaining_time: undefined,
          current_occupied_capacity: undefined,
          insurances: driver.insurances.map(buildInsuranceInput),
        },
      },
    });
  }, [driver, handleDriverCreate]);

  // ── field helper ─────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setDriver((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <Box
      className="mk-drivers-id overflow-auto"
      mt={{ base: "130px", md: "97px", xl: "97px" }}
      h={{
        base: "calc(100vh - 130px)",
        md: "calc(100vh - 97px)",
        xl: "calc(100vh - 97px)",
      }}
      backgroundColor="white"
    >
      <Grid
        pr="24px"
        className="mk-mainInner"
        h={{
          base: "calc(100vh - 130px)",
          md: "calc(100vh - 97px)",
          xl: "calc(100vh - 97px)",
        }}
      >
        <Grid
          templateAreas={`"nav main"`}
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
          {/* ── Left sidebar ──────────────────────────────────────────── */}
          <GridItem
            area={"nav"}
            className="border-r border-[var(--chakra-colors-gray-200)]"
            sx={{ height: "calc(100vh - 97px)" }}
            backgroundColor="white"
          >
            <Box mx="26px">
              <h2 className="mt-5 mb-4">{driver.full_name}</h2>

              <FormLabel fontSize="sm" fontWeight="600" mb="2">
                Driver Status
              </FormLabel>
              <Select
                className="mb-8"
                placeholder="Select Driver Status"
                value={
                  driverStatuses.find(
                    (s) => s.value === driver.driver_status_id,
                  ) ?? null
                }
                options={driverStatuses}
                onChange={(e) =>
                  setDriver((prev) => ({
                    ...prev,
                    driver_status_id: e?.value,
                  }))
                }
              />

              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Notes
              </FormLabel>
              <Textarea
                name="admin_notes"
                value={driver.admin_notes}
                onChange={handleChange}
                placeholder="Notes"
                mb="16px"
                fontSize="sm"
              />
            </Box>

            <Flex mt={8} flexDirection="column" className="border-b">
              <Button
                onClick={() => setTabId(0)}
                h={45}
                fontSize="14px"
                className={
                  "!items-center !justify-start !font-medium !rounded-none " +
                  (tabId === 0
                    ? "text-white !bg-[var(--chakra-colors-primary-400)]"
                    : "text-[var(--chakra-colors-black-400)] !bg-white")
                }
              >
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                Profile
              </Button>
            </Flex>
          </GridItem>

          {/* ── Main content ──────────────────────────────────────────── */}
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
            {tabId === 0 && (
              <FormControl>
                {/* Header */}
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb="24px"
                  className="mt-8"
                >
                  <h2 className="mb-0">New Driver</h2>
                  <Button
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    mb="0"
                    ms="10px"
                    onClick={submitCreate}
                    isLoading={creating}
                  >
                    Create
                  </Button>
                </Flex>

                <Divider />
                <h3 className="mt-6 mb-4">Details</h3>

                {/* ── Details grid ───────────────────────────────────── */}
                <Grid templateColumns="repeat(2, 1fr)" gap="6" mb="8">
                  <FormControl>
                    <FormLabel
                      fontSize="md"
                      fontWeight="600"
                      mb="3"
                      color={textColor}
                    >
                      Completed induction/WHS?
                    </FormLabel>
                    <Checkbox
                      size="lg"
                      name="is_inducted"
                      isChecked={driver.is_inducted}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          is_inducted: e.target.checked,
                        }))
                      }
                      fontWeight="500"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Driver ID
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="driver_no"
                      value={driver.driver_no}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      First Name
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="first_name"
                      value={driver.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Last Name
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="last_name"
                      value={driver.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Phone Number
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="phone_no"
                      value={driver.phone_no}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Email Address
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="email"
                      name="email"
                      value={driver.email}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Owner Email Address
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="email"
                      name="rcti_email_id"
                      value={driver.rcti_email_id}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Trading Name
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="trading_name"
                      value={driver.trading_name}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      ABN
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="abn"
                      value={driver.abn}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Years in Operation
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="operation_year"
                      value={driver.operation_year}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl gridColumn="span 2">
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Residential Address
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="address"
                      readOnly
                      value={driver.address}
                      onClick={() => setIsAddressModalOpen(true)}
                      cursor="pointer"
                      size="md"
                    />
                    <AddressesModal
                      defaultAddress={{ ...driver }}
                      isModalOpen={isAddressModalOpen}
                      description="Residential address"
                      onModalClose={(e) => setIsAddressModalOpen(e)}
                      onSetAddress={(address) =>
                        setDriver((prev) => ({ ...prev, ...address }))
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Availability (Days a week)
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="number"
                      name="no_availability"
                      value={driver.no_availability}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          no_availability: parseInt(e.target.value),
                        }))
                      }
                      size="md"
                    />
                  </FormControl>
                </Grid>

                {/* ── License Details ─────────────────────────────────── */}
                <Divider />
                <h3 className="mt-6 mb-4">License Details</h3>

                <Grid templateColumns="repeat(2, 1fr)" gap="6" mb="8">
                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Licence No.
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="license_no"
                      value={driver.license_no}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      State
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="text"
                      name="license_state"
                      value={driver.license_state}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="600"
                      color={textColor}
                    >
                      Expire
                    </FormLabel>
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="date"
                      name="license_expire_at"
                      value={driver.license_expire_at ?? ""}
                      onChange={handleChange}
                      size="md"
                    />
                  </FormControl>
                </Grid>

                {/* ── Insurance Section (shared component) ─────────────
                    No driverId here — file upload is hidden until the
                    driver has been created and has a real DB id.        */}
                <InsuranceSection
                  insurances={driver.insurances}
                  onChange={(insurances) =>
                    setDriver((prev) => ({ ...prev, insurances }))
                  }
                  textColor={textColor}
                />

                {/* ── Admin ───────────────────────────────────────────── */}
                <Divider />
                <h3 className="mt-6 mb-4">Admin</h3>

                <Flex alignItems="center" mb="16px">
                  <FormLabel
                    display="flex"
                    mb="0"
                    width="200px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                  >
                    Show earning price on mobile app?
                  </FormLabel>
                  <Flex width="100%">
                    <RadioGroup
                      value={driver.earning_toggle ? "1" : "0"}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          earning_toggle: e === "1",
                        }))
                      }
                    >
                      <Stack direction="row">
                        <Radio value="1">Yes</Radio>
                        <Radio value="0">No</Radio>
                      </Stack>
                    </RadioGroup>
                  </Flex>
                </Flex>

                <Flex alignItems="center" mb="16px">
                  <FormLabel
                    display="flex"
                    mb="0"
                    width="200px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                  >
                    Map route colour
                  </FormLabel>
                  <Input
                    width="30px"
                    type="color"
                    variant="main"
                    name="color"
                    padding="0px"
                    value={driver.color}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
                </Flex>
              </FormControl>
            )}
          </GridItem>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DriverCreate;