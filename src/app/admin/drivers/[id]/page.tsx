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
import PaginationTable from "@/components/table/PaginationTable";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import InsuranceSection from "@/components/tabs/InsuranceSectionTab";
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
import { GET_INVOICES_QUERY } from "@/graphql/invoice";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import debounce from "lodash.debounce";

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

const LOOKUP_VARS = {
  query: "",
  page: 1,
  first: 100,
  orderByColumn: "id",
  orderByOrder: "ASC",
};

function DriverEdit() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [driver, setDriver] = useState(defaultDriver);
  const [driverPayRatePercentage, setDriverPayRatePercentage] = useState(0);
  const [driverLevyRatePercentage, setDriverLevyRatePercentage] = useState(0);
  const [driverStatuses, setDriverStatuses] = useState<{ value: number; label: string }[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<{ value: number; label: string }[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<{ value: number; label: string }[]>([]);
  const [transmissionTypes, setTransmissionTypes] = useState<{ value: number; label: string }[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tabId, setTabId] = useState(0);
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // ── RCTI invoices tab state ─────────────────────────────────────────────
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  const columns = useMemo(
    () => [
      { id: "name", header: "Invoice", accessorKey: "name" as const },
      { id: "issued_at", header: "Date", accessorKey: "issued_at" as const, meta: { type: "date" } },
      { id: "total", header: "Amount", accessorKey: "total" as const, meta: { type: "money" } },
      { id: "actions", header: "Actions", accessorKey: "id" as const, meta: { isEdit: true } },
    ],
    [],
  );

  // ── data queries ────────────────────────────────────────────────────────

  const { loading: driverLoading, refetch: getDriver } =
    useApolloQueryWithEffect<DriverResponse>(GET_DRIVER_QUERY, {
      variables: { id },
      onCompleted: (data) => {
        if (data?.driver == null) { router.push("/admin/drivers"); return; }
        setDriver((prev) => ({ ...prev, ...data.driver }));
        setDriverPayRatePercentage(Number(data.driver?.pay_rate ?? 0) * 100);
        setDriverLevyRatePercentage(Number(data.driver?.levy_rate ?? 0));
      },
      onError: (error) => console.error(error),
    });

  useApolloQueryWithEffect<DriverStatusesResponse>(GET_DRIVER_STATUSES_QUERY, {
    variables: LOOKUP_VARS,
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      const list = data?.driverStatuses?.data;
      if (!Array.isArray(list)) return;
      setDriverStatuses(list.map((s: any) => ({ value: parseInt(s.id), label: s.name })));
    },
  });

  useApolloQueryWithEffect<VehicleClassesResponse>(GET_VEHICLE_CLASSES_QUERY, {
    variables: LOOKUP_VARS,
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      const list = data?.vehicleClasses?.data;
      if (!Array.isArray(list)) return;
      setVehicleClasses(list.map((c: any) => ({ value: parseInt(c.id), label: c.name })));
    },
  });

  useApolloQueryWithEffect<VehicleTypesResponse>(GET_VEHICLE_TYPES_QUERY, {
    variables: LOOKUP_VARS,
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      const list = data?.vehicleTypes?.data;
      if (!Array.isArray(list)) return;
      setVehicleTypes(list.map((t: any) => ({ value: parseInt(t.id), label: t.name })));
    },
  });

  useApolloQueryWithEffect<TransmissionTypesResponse>(GET_TRANSMISSION_TYPES_QUERY, {
    variables: LOOKUP_VARS,
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      const list = data?.transmissionTypes?.data;
      if (!Array.isArray(list)) return;
      setTransmissionTypes(list.map((t: any) => ({ value: parseInt(t.id), label: t.name })));
    },
  });

  // ✅ RCTI invoices — moved to top level, before any conditional return
  const {
    loading,
    data: invoices,
  } = useApolloQueryWithEffect<{
    invoices: {
      data: any[];
      paginatorInfo: { total: number; lastPage?: number };
    };
  }>(GET_INVOICES_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      is_rcti: false,
      driver_id: id,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    skip: !id,
  });

  // ── mutations ────────────────────────────────────────────────────────────

  const [handleUpdateDriver, { loading: updating }] = useMutation(UPDATE_DRIVER_MUTATION, {
    onCompleted: () => toast({ title: "Driver updated", status: "success", duration: 3000, isClosable: true }),
    onError: (error) => showGraphQLErrorToast(error),
  });

  const [handleDeleteDriver] = useMutation(DELETE_DRIVER_MUTATION, {
    onCompleted: () => {
      toast({ title: "Driver deleted", status: "success", duration: 3000, isClosable: true });
      router.push("/admin/drivers");
    },
    onError: (error) => showGraphQLErrorToast(error),
  });

  const submitUpdate = useCallback(() => {
    handleUpdateDriver({ variables: { input: buildUpdateInput(driver) } });
  }, [driver, handleUpdateDriver]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDriver((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const handleNumericChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDriver((prev) => ({ ...prev, [e.target.name]: parseFloat(e.target.value) })),
    []
  );

  const selectedDriverStatus = useMemo(
    () => driverStatuses.find((s) => s.value === driver.driver_status_id) ?? null,
    [driverStatuses, driver.driver_status_id]
  );

  const selectedVehicleClass = useMemo(
    () => vehicleClasses.find((c) => c.value === driver.vehicle_class_id) ?? null,
    [vehicleClasses, driver.vehicle_class_id]
  );

  const selectedVehicleType = useMemo(
    () => vehicleTypes.find((t) => t.value === driver.vehicle_type_id) ?? null,
    [vehicleTypes, driver.vehicle_type_id]
  );

  const selectedTransmissionType = useMemo(
    () => transmissionTypes.find((t) => t.value === driver.transmission_type_id) ?? null,
    [transmissionTypes, driver.transmission_type_id]
  );

  const NavBtn = useCallback(({ id: btnId, icon, label }: { id: number; icon: any; label: string }) => (
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
  ), [tabId]);

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
      h={{ base: "calc(100vh - 130px)", md: "calc(100vh - 97px)", xl: "calc(100vh - 97px)" }}
      backgroundColor="white"
    >
      <Grid
        pr="24px"
        className="mk-mainInner"
        h={{ base: "calc(100vh - 130px)", md: "calc(100vh - 97px)", xl: "calc(100vh - 97px)" }}
      >
        <Grid
          templateAreas={`"nav main"`}
          gridTemplateColumns={"25% 1fr"}
          h={{ base: "calc(100vh - 130px)", md: "calc(100vh - 97px)", xl: "calc(100vh - 97px)" }}
          gap="1"
          backgroundColor="white"
          color="blackAlpha.700"
          fontWeight="bold"
        >
          {/* ── Left sidebar ──────────────────────────────────────────── */}
          <GridItem area={"nav"} className="border-r border-[var(--chakra-colors-gray-200)]"
            sx={{ height: "calc(100vh - 97px)" }} backgroundColor="white">
            <Box mx="26px">
              <Flex justifyContent="space-between" alignItems="center" className="pt-3">
                <Image src={driver.media_url} alt="driver photo" fit="cover"
                  style={{ borderRadius: "50%" }} width="80px" height="80px" />
                <FileInputLink width="130px" height="130px" entity="Driver" description="Upload photo"
                  entityId={driver.id} onUpload={() => getDriver()} />
              </Flex>
              <h2 className="mt-5 mb-6 text-xl font-semibold">{driver.full_name}</h2>

              <FormLabel fontSize="sm" fontWeight="600" mb="2">Driver Status</FormLabel>
              <Select
                className="mb-8"
                placeholder="Select Driver Status"
                value={selectedDriverStatus}
                options={driverStatuses}
                onChange={(e) => setDriver((prev) => ({ ...prev, driver_status_id: e?.value }))}
              />

              <FormLabel fontSize="sm" fontWeight="600" mb="2">Admin Notes</FormLabel>
              <Textarea name="admin_notes" value={driver.admin_notes ?? ""} onChange={handleChange}
                placeholder="Notes" mb="16px" fontSize="sm" />
            </Box>

            <Flex mt={8} flexDirection="column" className="border-b">
              <NavBtn id={0} icon={faUser} label="Profile" />
              <NavBtn id={1} icon={faCar} label="Vehicle Details" />
              <NavBtn id={2} icon={faShieldAlt} label="Insurance" />
              <NavBtn id={3} icon={faNotdef} label="RCTIs" />
            </Flex>
          </GridItem>

          {/* ── Main content ──────────────────────────────────────────── */}
          <GridItem pl="2" area={"main"}
            h={{ base: "calc(100vh - 130px)", md: "calc(100vh - 97px)", xl: "calc(100vh - 97px)" }}
            backgroundColor="white">

            {/* ══════════════ TAB 0 : Profile ══════════════ */}
            {tabId === 0 && (
              <FormControl>
                <Flex justifyContent="space-between" alignItems="center" mb="24px" className="mt-8">
                  <h2 className="mb-0">Profile</h2>
                  <Flex>
                    <AreYouSureAlert onDelete={() => handleDeleteDriver({ variables: { id } })} />
                    <Button fontSize="sm" variant="brand" fontWeight="500" mb="0" ms="10px"
                      onClick={submitUpdate} isLoading={updating}>Update</Button>
                  </Flex>
                </Flex>
                <Divider />
                <h3 className="mt-8 mb-6 text-lg font-semibold">Details</h3>
                <Grid templateColumns="repeat(2, 1fr)" gap="6" mb="8">
                  <FormControl>
                    <FormLabel fontSize="md" fontWeight="600" mb="3">Completed induction/WHS?</FormLabel>
                    <Checkbox size="lg" name="is_inducted" isChecked={driver.is_inducted}
                      onChange={(e) => setDriver((prev) => ({ ...prev, is_inducted: e.target.checked }))}
                      fontWeight="500" />
                  </FormControl>

                  {[
                    { label: "Driver ID", name: "driver_no" },
                    { label: "First Name", name: "first_name", placeholder: "John" },
                    { label: "Last Name", name: "last_name", placeholder: "Doe" },
                    { label: "Phone Number", name: "phone_no" },
                    { label: "Email Address", name: "email" },
                    { label: "Owner Email Address", name: "rcti_email_id" },
                    { label: "Trading Name", name: "trading_name" },
                    { label: "ABN", name: "abn" },
                    { label: "Years in Operation", name: "operation_year" },
                  ].map(({ label, name, placeholder }) => (
                    <FormControl key={name}>
                      <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>{label}</FormLabel>
                      <Input variant="main" fontSize="sm" type="text" name={name}
                        value={(driver as any)[name] ?? ""} onChange={handleChange}
                        placeholder={placeholder || ""} size="md" />
                    </FormControl>
                  ))}

                  <FormControl gridColumn="span 2">
                    <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>Residential Address</FormLabel>
                    <Input variant="main" fontSize="sm" type="text" name="address" readOnly
                      value={driver.address ?? ""} onClick={() => setIsAddressModalOpen(true)} cursor="pointer" size="md" />
                    <AddressesModal defaultAddress={{ ...driver }} isModalOpen={isAddressModalOpen}
                      description="Residential address" onModalClose={(e) => setIsAddressModalOpen(e)}
                      onSetAddress={(address) => setDriver((prev) => ({ ...prev, ...address }))} />
                  </FormControl>

                  <FormControl>
                    <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>Availability (Days a week)</FormLabel>
                    <Input variant="main" fontSize="sm" type="number" name="no_availability"
                      value={driver.no_availability ?? 0}
                      onChange={(e) => setDriver((prev) => ({ ...prev, no_availability: parseInt(e.target.value) }))}
                      size="md" />
                  </FormControl>
                </Grid>

                <Divider />
                <h3 className="mt-8 mb-6 text-lg font-semibold">License Details</h3>
                <Grid templateColumns="repeat(2, 1fr)" gap="6" mb="8">
                  <FormControl>
                    <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>Licence No.</FormLabel>
                    <Input variant="main" fontSize="sm" type="text" name="license_no" value={driver.license_no ?? ""} onChange={handleChange} size="md" />
                  </FormControl>
                  <FormControl>
                    <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>State</FormLabel>
                    <Input variant="main" fontSize="sm" type="text" name="license_state" value={driver.license_state ?? ""} onChange={handleChange} size="md" />
                  </FormControl>
                  <FormControl>
                    <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>Expire</FormLabel>
                    <Input variant="main" fontSize="sm" type="date" name="license_expire_at" value={driver.license_expire_at ?? ""} onChange={handleChange} size="md" />
                  </FormControl>
                  <FormControl gridColumn="span 2">
                    <FormLabel fontSize="md" fontWeight="600" mb="3">Photo of license</FormLabel>
                    <Flex width="100%" flexWrap="wrap" gap="4">
                      {driver.license_media?.map((image, index) => (
                        <Flex key={index} alignItems="center" justifyContent="center"
                          width="130px" height="130px" border="1px solid #E2E8F0" borderRadius="4px">
                          <Image src={image.downloadable_url} alt={image.name} width="100%" height="100%" objectFit="cover" />
                        </Flex>
                      ))}
                      <FileInput width="130px" height="130px" entity="Driver" description="Upload license"
                        entityId={driver.id} onUpload={() => getDriver()} collection_name="license" />
                    </Flex>
                  </FormControl>
                </Grid>

                <Divider />
                <h3 className="mt-8 mb-6 text-lg font-semibold">Admin</h3>
                <Flex alignItems="center" mb="16px">
                  <FormLabel display="flex" mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>
                    Show earning price on mobile app?
                  </FormLabel>
                  <RadioGroup value={driver.earning_toggle ? "1" : "0"}
                    onChange={(e) => setDriver((prev) => ({ ...prev, earning_toggle: e === "1" }))}>
                    <Stack direction="row"><Radio value="1">Yes</Radio><Radio value="0">No</Radio></Stack>
                  </RadioGroup>
                </Flex>
                <Flex alignItems="center" mb="16px">
                  <FormLabel display="flex" mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>Map route colour</FormLabel>
                  <Input width="30px" type="color" variant="main" name="color" padding="0px"
                    value={driver.color ?? "#000000"} onChange={handleChange} mb="0" size="lg" />
                </Flex>
              </FormControl>
            )}

            {/* ══════════════ TAB 1 : Vehicle Details ══════════════ */}
            {tabId === 1 && (
              <FormControl>
                <Flex justifyContent="space-between" alignItems="center" mb="24px" className="mt-8">
                  <h2 className="mb-0">Vehicle Details</h2>
                  <Button fontSize="sm" variant="brand" fontWeight="500" mb="0" ms="10px"
                    onClick={submitUpdate} isLoading={updating}>Update</Button>
                </Flex>
                <Divider />

                <Grid templateColumns="repeat(2, 1fr)" gap="6" mt="18px" mb="16px">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">Is Vehicle Roadworthy</FormLabel>
                    <RadioGroup value={driver.is_vehicle_roadworthy ? "1" : "0"}
                      onChange={(e) => setDriver((prev) => ({ ...prev, is_vehicle_roadworthy: e === "1" }))}>
                      <Stack direction="row"><Radio value="1">Yes</Radio><Radio value="0">No</Radio></Stack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">Vehicle Class</FormLabel>
                    <Select placeholder="Select Vehicle Class" value={selectedVehicleClass} options={vehicleClasses}
                      onChange={(e) => setDriver((prev) => ({ ...prev, vehicle_class_id: e?.value ?? null }))}
                      menuPosition="fixed"
                      menuPortalTarget={typeof window !== "undefined" ? document.body : undefined} />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">Vehicle Type</FormLabel>
                    <Select placeholder="Select Vehicle Type" value={selectedVehicleType} options={vehicleTypes}
                      onChange={(e) => setDriver((prev) => ({ ...prev, vehicle_type_id: e?.value ?? null }))}
                      menuPosition="fixed"
                      menuPortalTarget={typeof window !== "undefined" ? document.body : undefined} />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">Transmission Type</FormLabel>
                    <Select placeholder="Select Transmission Type" value={selectedTransmissionType} options={transmissionTypes}
                      onChange={(e) => setDriver((prev) => ({ ...prev, transmission_type_id: e?.value ?? null }))}
                      menuPosition="fixed"
                      menuPortalTarget={typeof window !== "undefined" ? document.body : undefined} />
                  </FormControl>

                  {[
                    { label: "Does it have a tailgate?", key: "is_tailgated" },
                    { label: "Does it have sidegates?", key: "is_sidegated" },
                  ].map(({ label, key }) => (
                    <FormControl key={key}>
                      <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">{label}</FormLabel>
                      <RadioGroup value={(driver as any)[key] ? "1" : "0"}
                        onChange={(e) => setDriver((prev) => ({ ...prev, [key]: e === "1" }))}>
                        <Stack direction="row"><Radio value="1">Yes</Radio><Radio value="0">No</Radio></Stack>
                      </RadioGroup>
                    </FormControl>
                  ))}

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">Max pallets</FormLabel>
                    <Input variant="main" fontSize="sm" type="number" name="no_max_pallets"
                      value={driver.no_max_pallets ?? 0} onChange={handleNumericChange} size="lg" />
                  </FormControl>

                  {[
                    { label: "Max load capacity", name: "no_max_capacity", unit: "kg" },
                    { label: "Max volume", name: "no_max_volume", unit: "m³" },
                    { label: "Max length", name: "no_max_length", unit: "m" },
                    { label: "Max height", name: "no_max_height", unit: "m" },
                  ].map(({ label, name, unit }) => (
                    <FormControl key={name}>
                      <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">{label}</FormLabel>
                      <Flex alignItems="center">
                        <Input variant="main" fontSize="sm" step="any" type="number" name={name}
                          value={(driver as any)[name] ?? 0} onChange={handleNumericChange} size="lg" width="70%" />
                        <FormLabel mb="0" pl="10px" fontSize="sm" fontWeight="500" color={textColor}>{unit}</FormLabel>
                      </Flex>
                    </FormControl>
                  ))}

                  {[
                    { label: "Registration number", name: "registration_no" },
                    { label: "Year of manufacture", name: "vehicle_year" },
                    { label: "Make", name: "vehicle_make" },
                    { label: "Model", name: "vehicle_model" },
                  ].map(({ label, name }) => (
                    <FormControl key={name}>
                      <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">{label}</FormLabel>
                      <Input variant="main" fontSize="sm" type="text" name={name}
                        value={(driver as any)[name] ?? ""} onChange={handleChange} size="lg" />
                    </FormControl>
                  ))}
                </Grid>

                <FormControl mb="16px">
                  <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="4px">Photos of vehicle</FormLabel>
                  <Flex width="100%" flexWrap="wrap" gap="4">
                    {driver.vehicle_media?.map((image, index) => (
                      <Flex key={index} alignItems="center" justifyContent="center"
                        width="130px" height="130px" border="1px solid #E2E8F0" borderRadius="4px">
                        <Image src={image.downloadable_url} alt={image.name} width="100%" height="100%" objectFit="cover" />
                      </Flex>
                    ))}
                    <FileInput width="130px" height="130px" entity="Driver" description="Upload photo"
                      entityId={driver.id} onUpload={() => getDriver()} collection_name="vehicle" />
                  </Flex>
                </FormControl>
              </FormControl>
            )}

            {/* ══════════════ TAB 2 : Insurance ══════════════ */}
            {tabId === 2 && (
              <Box px="2" pt="2">
                <Flex justifyContent="space-between" alignItems="center" mb="6" className="mt-8">
                  <h2 className="mb-0">Insurance</h2>
                  <Button fontSize="sm" variant="brand" fontWeight="500" mb="0"
                    onClick={submitUpdate} isLoading={updating}>Save Insurance</Button>
                </Flex>
                <InsuranceSection
                  insurances={driver.insurances}
                  onChange={(insurances) => setDriver((prev) => ({ ...prev, insurances }))}
                  driverId={driver.id}
                  onMediaUploaded={() => getDriver()}
                  textColor={textColor}
                />
              </Box>
            )}

            {/* ══════════════ TAB 3 : RCTIs ══════════════ */}
            {tabId === 3 && (
              <>
                <FormControl>
                  <Flex justifyContent="space-between" alignItems="center" mb="24px" className="mt-8">
                    <h2 className="mb-0">Recipient Created Tax Invoices (RCTI)</h2>
                    <Button fontSize="sm" variant="brand" fontWeight="500" mb="0" ms="10px"
                      onClick={submitUpdate} isLoading={updating}>Update</Button>
                  </Flex>
                  <Divider />
                  <h3 className="mt-6 mb-4">Payment Details</h3>

                  {[
                    { label: "Account name", name: "bank_account_name" },
                    { label: "BSB", name: "bank_bsb" },
                    { label: "Account Number", name: "bank_account_number" },
                  ].map(({ label, name }) => (
                    <Flex key={name} alignItems="center" mb="16px">
                      <FormLabel display="flex" mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>{label}</FormLabel>
                      <Input variant="main" fontSize="sm" type="text" name={name}
                        value={(driver as any)[name] ?? ""} onChange={handleChange} mb="0" size="lg" />
                    </Flex>
                  ))}

                  <Flex alignItems="center" mb="16px">
                    <FormLabel display="flex" mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>Pay rate (%)</FormLabel>
                    <Input variant="main" fontSize="sm" type="number" value={driverPayRatePercentage}
                      onChange={(e) => { const val = parseFloat(e.target.value); setDriverPayRatePercentage(val); setDriver((prev) => ({ ...prev, pay_rate: val / 100 })); }}
                      mb="0" size="lg" />
                  </Flex>

                  <Flex alignItems="center" mb="16px">
                    <FormLabel display="flex" mb="0" width="200px" fontSize="sm" fontWeight="500" color={textColor}>Fuel/Toll rate (%)</FormLabel>
                    <Input variant="main" fontSize="sm" type="number" value={driverLevyRatePercentage}
                      onChange={(e) => { const val = parseFloat(e.target.value); setDriverLevyRatePercentage(val); setDriver((prev) => ({ ...prev, levy_rate: val })); }}
                      mb="0" size="lg" />
                  </Flex>
                </FormControl>
                <Divider my="48px" />
                <Flex alignItems="center" mb="16px">
                  {!loading && invoices?.invoices?.data && (
                    <PaginationTable
                      columns={columns}
                      data={invoices.invoices.data}
                      total={invoices.invoices.paginatorInfo?.total ?? 0}
                      options={{
                        initialState: {
                          pageIndex: queryPageIndex,
                          pageSize: queryPageSize,
                        },
                        manualPagination: true,
                        pageCount: invoices.invoices.paginatorInfo?.lastPage,
                      }}
                      setQueryPageIndex={setQueryPageIndex}
                      setQueryPageSize={setQueryPageSize}
                      isServerSide
                      path="/admin/invoices"
                    />
                  )}
                </Flex>
              </>
            )}
          </GridItem>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DriverEdit;