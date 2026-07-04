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
  Image,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  faCar,
  faNotdef,
  faShieldAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import AddressesModal from "@/components/addresses/AddressesModal";
import AreYouSureAlert from "@/components/alert/AreYouSureAlert";
import FileInput from "@/components/fileInput/FileInput";
import FileInputLink from "@/components/fileInput/FileInputLink";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import InsuranceSection from "@/components/drivers/InsuranceSection";
import {
  defaultDriver,
  DELETE_DRIVER_MUTATION,
  DriverInsurance,
  DriverResponse,
  DriverStatusesResponse,
  GET_DRIVER_QUERY,
  TransmissionTypesResponse,
  UPDATE_DRIVER_MUTATION,
  VehicleClassesResponse,
  VehicleTypesResponse,
} from "@/graphql/driver";
import { GET_DRIVER_STATUSES_QUERY } from "@/graphql/driverStatus";
import { GET_TRANSMISSION_TYPES_QUERY } from "@/graphql/transmissionsType";
import { GET_VEHICLE_CLASSES_QUERY } from "@/graphql/vehicleClass";
import { GET_VEHICLE_TYPES_QUERY } from "@/graphql/vehicleType";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// ─── helpers ────────────────────────────────────────────────────────────────

const buildInsuranceInput = (ins: DriverInsurance) => ({
  id: ins.id,
  insurance_type_id: ins.insuranceType?.id ?? ins.insurance_type_id ?? null,
  insurance_name: ins.insurance_name,
  insurance_number: ins.insurance_number,
  insurance_expire_at: ins.insurance_expire_at ?? "",
});

const buildUpdateInput = (driver: any) => ({
  ...driver,
  __typename: undefined,
  media_url: undefined,
  full_name: undefined,
  license_media: undefined,
  vehicle_media: undefined,
  remaining_time: undefined,
  current_occupied_capacity: undefined,
  insurances: (driver.insurances ?? []).map(buildInsuranceInput),
});

// ─── component ──────────────────────────────────────────────────────────────

function DriverEdit() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [driver, setDriver] = useState(defaultDriver);
  const [driverPayRatePercentage, setDriverPayRatePercentage] = useState(0);
  const [driverLevyRatePercentage, setDriverLevyRatePercentage] = useState(0);
  const [driverStatuses, setDriverStatuses] = useState<
    { value: number; label: string }[]
  >([]);
  const [vehicleClasses, setVehicleClasses] = useState<
    { value: number; label: string }[]
  >([]);
  const [vehicleTypes, setVehicleTypes] = useState<
    { value: number; label: string }[]
  >([]);
  const [transmissionTypes, setTransmissionTypes] = useState<
    { value: number; label: string }[]
  >([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tabId, setTabId] = useState(0);
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // ── data queries ────────────────────────────────────────────────────────

  const { loading: driverLoading, refetch: getDriver } =
    useApolloQueryWithEffect<DriverResponse>(GET_DRIVER_QUERY, {
      variables: { id },
      onCompleted: (data) => {
        if (data?.driver == null) {
          router.push("/admin/drivers");
          return;
        }
        setDriver((prev) => ({ ...prev, ...data.driver }));
        setDriverPayRatePercentage(Number(data.driver?.pay_rate ?? 0) * 100);
        setDriverLevyRatePercentage(Number(data.driver?.levy_rate ?? 0));
      },
      onError: (error) => console.error(error),
    });

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

  useApolloQueryWithEffect<VehicleClassesResponse>(GET_VEHICLE_CLASSES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      const list = data?.vehicleClasses?.data;
      if (!Array.isArray(list)) return;
      setVehicleClasses(
        list.map((c: any) => ({ value: parseInt(c.id), label: c.name })),
      );
    },
  });

  useApolloQueryWithEffect<VehicleTypesResponse>(GET_VEHICLE_TYPES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      const list = data?.vehicleTypes?.data;
      if (!Array.isArray(list)) return;
      setVehicleTypes(
        list.map((t: any) => ({ value: parseInt(t.id), label: t.name })),
      );
    },
  });

  useApolloQueryWithEffect<TransmissionTypesResponse>(
    GET_TRANSMISSION_TYPES_QUERY,
    {
      variables: {
        query: "",
        page: 1,
        first: 100,
        orderByColumn: "id",
        orderByOrder: "ASC",
      },
      onCompleted: (data) => {
        const list = data?.transmissionTypes?.data;
        if (!Array.isArray(list)) return;
        setTransmissionTypes(
          list.map((t: any) => ({ value: parseInt(t.id), label: t.name })),
        );
      },
    },
  );

  // ── mutations ────────────────────────────────────────────────────────────

  const [handleUpdateDriver, { loading: updating }] = useMutation(
    UPDATE_DRIVER_MUTATION,
    {
      onCompleted: () =>
        toast({
          title: "Driver updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        }),
      onError: (error) => showGraphQLErrorToast(error),
    },
  );

  const [handleDeleteDriver] = useMutation(DELETE_DRIVER_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Driver deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/admin/drivers");
    },
    onError: (error) => showGraphQLErrorToast(error),
  });

  const submitUpdate = useCallback(() => {
    handleUpdateDriver({ variables: { input: buildUpdateInput(driver) } });
  }, [driver, handleUpdateDriver]);

  // ── field helpers ────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setDriver((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDriver((prev) => ({
      ...prev,
      [e.target.name]: parseFloat(e.target.value),
    }));

  // ── nav button ───────────────────────────────────────────────────────────

  const NavBtn = ({
    id: btnId,
    icon,
    label,
  }: {
    id: number;
    icon: any;
    label: string;
  }) => (
    <Button
      onClick={() => setTabId(btnId)}
      h={45}
      fontSize="14px"
      className={
        "!items-center !justify-start !font-medium !rounded-none " +
        (tabId === btnId
          ? "text-white !bg-[var(--chakra-colors-primary-400)]"
          : "text-[var(--chakra-colors-black-400)] !bg-white")
      }
    >
      <FontAwesomeIcon icon={icon} className="mr-1" />
      {label}
    </Button>
  );

  // ── render ───────────────────────────────────────────────────────────────

  if (driverLoading) {
    return (
      <Box mt={{ base: "130px", md: "97px", xl: "97px" }} p="8">
        Loading driver…
      </Box>
    );
  }

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
              <Flex
                justifyContent="space-between"
                alignItems="center"
                className="pt-3"
              >
                <Image
                  src={driver.media_url}
                  alt="driver photo"
                  fit="cover"
                  style={{ borderRadius: "50%" }}
                  width="80px"
                  height="80px"
                />
                <FileInputLink
                  width="130px"
                  height="130px"
                  entity="Driver"
                  description="Upload photo"
                  entityId={driver.id}
                  onUpload={() => getDriver()}
                />
              </Flex>
              <h2 className="mt-5 mb-6 text-xl font-semibold">
                {driver.full_name}
              </h2>

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
                  setDriver((prev) => ({ ...prev, driver_status_id: e?.value }))
                }
              />

              <FormLabel fontSize="sm" fontWeight="600" mb="2">
                Admin Notes
              </FormLabel>
              <Textarea
                name="admin_notes"
                value={driver.admin_notes ?? ""}
                onChange={handleChange}
                placeholder="Notes"
                mb="16px"
                fontSize="sm"
              />
            </Box>

            <Flex mt={8} flexDirection="column" className="border-b">
              <NavBtn id={0} icon={faUser} label="Profile" />
              <NavBtn id={1} icon={faCar} label="Vehicle Details" />
              <NavBtn id={2} icon={faShieldAlt} label="Insurance" />
              <NavBtn id={3} icon={faNotdef} label="RCTIs" />
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
            {/* ══════════════ TAB 0 : Profile ══════════════ */}
            {tabId === 0 && (
              <FormControl>
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb="24px"
                  className="mt-8"
                >
                  <h2 className="mb-0">Profile</h2>
                  <Flex>
                    <AreYouSureAlert
                      onDelete={() =>
                        handleDeleteDriver({ variables: { id } })
                      }
                    />
                    <Button
                      fontSize="sm"
                      variant="brand"
                      fontWeight="500"
                      mb="0"
                      ms="10px"
                      onClick={submitUpdate}
                      isLoading={updating}
                    >
                      Update
                    </Button>
                  </Flex>
                </Flex>

                <Divider />
                <h3 className="mt-8 mb-6 text-lg font-semibold">Details</h3>

                <Grid templateColumns="repeat(2, 1fr)" gap="6" mb="8">
                  <FormControl>
                    <FormLabel fontSize="md" fontWeight="600" mb="3">
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
                      value={driver.driver_no ?? ""}
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
                      value={driver.first_name ?? ""}
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
                      value={driver.last_name ?? ""}
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
                      value={driver.phone_no ?? ""}
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
                      type="text"
                      name="email"
                      value={driver.email ?? ""}
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
                      type="text"
                      name="rcti_email_id"
                      value={driver.rcti_email_id ?? ""}
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
                      value={driver.trading_name ?? ""}
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
                      value={driver.abn ?? ""}
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
                      value={driver.operation_year ?? ""}
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
                      value={driver.address ?? ""}
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
                      value={driver.no_availability ?? 0}
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

                {/* License Details */}
                <Divider />
                <h3 className="mt-8 mb-6 text-lg font-semibold">
                  License Details
                </h3>

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
                      value={driver.license_no ?? ""}
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
                      value={driver.license_state ?? ""}
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

                  <FormControl gridColumn="span 2">
                    <FormLabel fontSize="md" fontWeight="600" mb="3">
                      Photo of license
                    </FormLabel>
                    <Flex width="100%" flexWrap="wrap" gap="4">
                      {driver.license_media?.map((image, index) => (
                        <Flex
                          key={index}
                          alignItems="center"
                          justifyContent="center"
                          width="130px"
                          height="130px"
                          border="1px solid #E2E8F0"
                          borderRadius="4px"
                        >
                          <Image
                            src={image.downloadable_url}
                            alt={image.name}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        </Flex>
                      ))}
                      <FileInput
                        width="130px"
                        height="130px"
                        entity="Driver"
                        description="Upload license"
                        entityId={driver.id}
                        onUpload={() => getDriver()}
                        collection_name="license"
                      />
                    </Flex>
                  </FormControl>
                </Grid>

                {/* Admin */}
                <Divider />
                <h3 className="mt-8 mb-6 text-lg font-semibold">Admin</h3>

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
                    value={driver.color ?? "#000000"}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
                </Flex>
              </FormControl>
            )}

            {/* ══════════════ TAB 1 : Vehicle Details ══════════════ */}
            {tabId === 1 && (
              <FormControl>
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb="24px"
                  className="mt-8"
                >
                  <h2 className="mb-0">Vehicle Details</h2>
                  <Button
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    mb="0"
                    ms="10px"
                    onClick={submitUpdate}
                    isLoading={updating}
                  >
                    Update
                  </Button>
                </Flex>

                <Divider />

                <Flex alignItems="center" mb="16px" mt="18px">
                  <FormLabel
                    display="flex"
                    mb="0"
                    width="200px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                  >
                    Is Vehicle Roadworthy
                  </FormLabel>
                  <Flex width="100%">
                    <RadioGroup
                      value={driver.is_vehicle_roadworthy ? "1" : "0"}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          is_vehicle_roadworthy: e === "1",
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
                    Vehicle Class
                  </FormLabel>
                  <Box width="100%">
                    <Select
                      placeholder="Select Vehicle Class"
                      value={
                        vehicleClasses.find(
                          (c) => c.value === driver.vehicle_class_id,
                        ) ?? null
                      }
                      options={vehicleClasses}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          vehicle_class_id: e?.value ?? null,
                        }))
                      }
                    />
                  </Box>
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
                    Vehicle Type
                  </FormLabel>
                  <Box width="100%">
                    <Select
                      placeholder="Select Vehicle Type"
                      value={
                        vehicleTypes.find(
                          (t) => t.value === driver.vehicle_type_id,
                        ) ?? null
                      }
                      options={vehicleTypes}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          vehicle_type_id: e?.value ?? null,
                        }))
                      }
                    />
                  </Box>
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
                    Transmission Type
                  </FormLabel>
                  <Box width="100%">
                    <Select
                      placeholder="Select Transmission Type"
                      value={
                        transmissionTypes.find(
                          (t) => t.value === driver.transmission_type_id,
                        ) ?? null
                      }
                      options={transmissionTypes}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          transmission_type_id: e?.value ?? null,
                        }))
                      }
                    />
                  </Box>
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
                    Does it have a tailgate?
                  </FormLabel>
                  <Flex width="100%">
                    <RadioGroup
                      value={driver.is_tailgated ? "1" : "0"}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          is_tailgated: e === "1",
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
                    Does it have sidegates?
                  </FormLabel>
                  <Flex width="100%">
                    <RadioGroup
                      value={driver.is_sidegated ? "1" : "0"}
                      onChange={(e) =>
                        setDriver((prev) => ({
                          ...prev,
                          is_sidegated: e === "1",
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
                    Max pallets
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="number"
                    name="no_max_pallets"
                    value={driver.no_max_pallets ?? 0}
                    onChange={handleNumericChange}
                    mb="0"
                    size="lg"
                  />
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
                    Max load capacity
                  </FormLabel>
                  <Flex width="100%">
                    <Input
                      variant="main"
                      fontSize="sm"
                      type="number"
                      name="no_max_capacity"
                      value={driver.no_max_capacity ?? 0}
                      onChange={handleNumericChange}
                      mb="0"
                      size="lg"
                      width="40%"
                    />
                    <FormLabel
                      display="flex"
                      mb="0"
                      mt="3"
                      pl="10px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                    >
                      kg
                    </FormLabel>
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
                    Max volume
                  </FormLabel>
                  <Flex width="100%">
                    <Input
                      variant="main"
                      fontSize="sm"
                      step="any"
                      type="number"
                      name="no_max_volume"
                      value={driver.no_max_volume ?? 0}
                      onChange={handleNumericChange}
                      mb="0"
                      size="lg"
                      width="40%"
                    />
                    <FormLabel
                      display="flex"
                      mb="0"
                      mt="3"
                      pl="10px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                    >
                      m³
                    </FormLabel>
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
                    Max length
                  </FormLabel>
                  <Flex width="100%">
                    <Input
                      variant="main"
                      fontSize="sm"
                      step="any"
                      type="number"
                      name="no_max_length"
                      value={driver.no_max_length ?? 0}
                      onChange={handleNumericChange}
                      mb="0"
                      size="lg"
                      width="40%"
                    />
                    <FormLabel
                      display="flex"
                      mb="0"
                      mt="3"
                      pl="10px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                    >
                      m
                    </FormLabel>
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
                    Max height
                  </FormLabel>
                  <Flex width="100%">
                    <Input
                      variant="main"
                      fontSize="sm"
                      step="any"
                      type="number"
                      name="no_max_height"
                      value={driver.no_max_height ?? 0}
                      onChange={handleNumericChange}
                      mb="0"
                      size="lg"
                      width="40%"
                    />
                    <FormLabel
                      display="flex"
                      mb="0"
                      mt="3"
                      pl="10px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                    >
                      m
                    </FormLabel>
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
                    Registration number
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="text"
                    name="registration_no"
                    value={driver.registration_no ?? ""}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
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
                    Year of manufacture
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="text"
                    name="vehicle_year"
                    value={driver.vehicle_year ?? ""}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
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
                    Make
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="text"
                    name="vehicle_make"
                    value={driver.vehicle_make ?? ""}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
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
                    Model
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="text"
                    name="vehicle_model"
                    value={driver.vehicle_model ?? ""}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
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
                    Photos of vehicle
                  </FormLabel>
                  <Flex width="100%" flexWrap="wrap" gap="4">
                    {driver.vehicle_media?.map((image, index) => (
                      <Flex
                        key={index}
                        alignItems="center"
                        justifyContent="center"
                        width="130px"
                        height="130px"
                        border="1px solid #E2E8F0"
                        borderRadius="4px"
                      >
                        <Image
                          src={image.downloadable_url}
                          alt={image.name}
                          width="100%"
                          height="100%"
                          objectFit="cover"
                        />
                      </Flex>
                    ))}
                    <FileInput
                      width="130px"
                      height="130px"
                      entity="Driver"
                      description="Upload photo"
                      entityId={driver.id}
                      onUpload={() => getDriver()}
                      collection_name="vehicle"
                    />
                  </Flex>
                </Flex>
              </FormControl>
            )}

            {/* ══════════════ TAB 2 : Insurance ══════════════
                InsuranceSection is a self-contained component.
                - insuranceTypes query runs inside it.
                - resolveTypeValue() fixes the "selected option missing" bug
                  by checking insuranceType.id (server) AND insurance_type_id
                  (local) so the dropdown always renders the correct value.
                - driverId passed → file upload shown for saved rows.
                - onMediaUploaded refetches the driver to pick up new media. */}
            {tabId === 2 && (
              <Box px="2" pt="2">
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb="6"
                  className="mt-8"
                >
                  <h2 className="mb-0">Insurance</h2>
                  <Button
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    mb="0"
                    onClick={submitUpdate}
                    isLoading={updating}
                  >
                    Save Insurance
                  </Button>
                </Flex>

                <InsuranceSection
                  insurances={driver.insurances}
                  onChange={(insurances) =>
                    setDriver((prev) => ({ ...prev, insurances }))
                  }
                  driverId={driver.id}
                  onMediaUploaded={() => getDriver()}
                  textColor={textColor}
                />
              </Box>
            )}

            {/* ══════════════ TAB 3 : RCTIs ══════════════ */}
            {tabId === 3 && (
              <FormControl>
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  mb="24px"
                  className="mt-8"
                >
                  <h2 className="mb-0">Recipient Created Tax Invoices (RCTI)</h2>
                  <Button
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    mb="0"
                    ms="10px"
                    onClick={submitUpdate}
                    isLoading={updating}
                  >
                    Update
                  </Button>
                </Flex>

                <Divider />
                <h3 className="mt-6 mb-4">Payment Details</h3>

                <Flex alignItems="center" mb="16px">
                  <FormLabel
                    display="flex"
                    mb="0"
                    width="200px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                  >
                    Account name
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="text"
                    name="bank_account_name"
                    value={driver.bank_account_name ?? ""}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
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
                    BSB
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="text"
                    name="bank_bsb"
                    value={driver.bank_bsb ?? ""}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
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
                    Account Number
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="text"
                    name="bank_account_number"
                    value={driver.bank_account_number ?? ""}
                    onChange={handleChange}
                    mb="0"
                    size="lg"
                  />
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
                    Pay rate (%)
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="number"
                    value={driverPayRatePercentage}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDriverPayRatePercentage(val);
                      setDriver((prev) => ({ ...prev, pay_rate: val / 100 }));
                    }}
                    mb="0"
                    size="lg"
                  />
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
                    Fuel/Toll rate (%)
                  </FormLabel>
                  <Input
                    variant="main"
                    fontSize="sm"
                    type="number"
                    value={driverLevyRatePercentage}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDriverLevyRatePercentage(val);
                      setDriver((prev) => ({ ...prev, levy_rate: val }));
                    }}
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

export default DriverEdit;