"use client";
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormLabel,
  Input,
  Text,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomInputField from "@/components/fields/VCustomInputField";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import {
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
  CreateCustomerAddressResult,
  UpdateCustomerAddressResult,
} from "@/graphql/customerAddress";
import {
  fetchPlaceDetails,
  fetchSuggestions,
  getAddressComponent,
} from "@/utils/autocomplete";
import React, { useEffect, useRef, useState } from "react";

const CollapseFix = Collapse as unknown as React.FC<{
  in: boolean;
  animateOpacity?: boolean;
  children?: React.ReactNode;
}>;

function composeAddress(dest: any) {
  return (
    (dest.address_line_2 ? dest.address_line_2 + "/" : "") +
    (dest.address_line_1 || "") +
    (dest.address_city ? ", " + dest.address_city : "") +
    (dest.address_state ? " " + dest.address_state : "") +
    (dest.address_postal_code ? " " + dest.address_postal_code : "") +
    (dest.address_country ? ", " + dest.address_country : "")
  );
}

export default function JobAddressesTab(props: {
  savedAddressesSelect?: any[];
  isAdmin?: boolean;
  defaultJobDestination: any;
  entityModel?: any;
  onAddressSaved: (hasChanged: boolean) => void;
  jobDestinationChanged: (jobDestination: any) => void;
}) {
  const {
    savedAddressesSelect,
    isAdmin = true,
    defaultJobDestination,
    entityModel,
    onAddressSaved,
    jobDestinationChanged,
  } = props;

  const toast = useToast();
  const [savedAddressSelectedId, setSavedAddressSelectedId] = useState(null);
  const [isSavedAddress, setIsSavedAddress] = useState(false);
  const [jobDestination, setJobDestination] = useState(defaultJobDestination);
  const [randomIdKey, setRandomIdKey] = useState(
    Math.random().toString(36).substring(7),
  );

  const [isOpen, setIsOpen] = useState(!defaultJobDestination?.address);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const prevQueryRef = useRef("");
  const selectedLabelRef = useRef("");

  useEffect(() => {
    if (defaultJobDestination?.address && !query) {
      setQuery(defaultJobDestination.address);
      selectedLabelRef.current = defaultJobDestination.address;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query === selectedLabelRef.current) return;

    const timeout = setTimeout(() => {
      const isTyping = query.length >= 2;
      const isNotBackspace = query.length > prevQueryRef.current.length;

      if (isTyping && isNotBackspace) {
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();

        fetchSuggestions(query, controllerRef.current.signal).then(
          (results) => {
            setSuggestions(results);
          },
        );
      } else {
        setSuggestions([]);
      }

      prevQueryRef.current = query;
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelectSuggestion = async (prediction: any, fullLabel: string) => {
    setQuery(fullLabel);
    setSuggestions([]);
    selectedLabelRef.current = fullLabel;

    const data = await fetchPlaceDetails(prediction.placeId);
    if (!data) return;

    const businessName = data.displayName?.text ?? "";
    const components = data.addressComponents || [];

    const updated = {
      ...jobDestination,
      address_line_1: [
        getAddressComponent(components, "street_number"),
        getAddressComponent(components, "route"),
      ]
        .filter(Boolean)
        .join(" ")
        .trim(),
      address_city: getAddressComponent(components, "locality"),
      address_state: getAddressComponent(
        components,
        "administrative_area_level_1",
      ),
      address_country: getAddressComponent(components, "country"),
      address_postal_code: getAddressComponent(components, "postal_code"),
      lat: data.location?.latitude || 0,
      lng: data.location?.longitude || 0,
      address_business_name: businessName,
    };
    updated.address = data.formattedAddress || composeAddress(updated);

    setSavedAddressSelectedId(null);
    handleSetRandomIdKey();
    setJobDestination(updated);
    setIsOpen(false);
  };

  const handleFieldChange = (name: string, value: string) => {
    const updated = { ...jobDestination, [name]: value };
    if (name !== "address") {
      updated.address = composeAddress(updated);
    }
    setJobDestination(updated);
  };

  const handleSaveCustomerAddress = () => {
    saveCustomerAddress({
      variables: {
        input: { ...getParsedInput(), id: undefined },
      },
    });
  };
  const [saveCustomerAddress] = useMutation<CreateCustomerAddressResult>(
    CREATE_CUSTOMER_ADDRESS_MUTATION,
    {
      onCompleted: (data) => {
        toast({
          title: "Address saved to customer",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setSavedAddressSelectedId(data.createCustomerAddress.id);
        onAddressSaved(true);
        setIsSavedAddress(true);
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  const handleUpdateCustomerAddress = () => {
    updateCustomerAddress({
      variables: {
        input: { ...getParsedInput(), id: savedAddressSelectedId },
      },
    });
  };
  const getParsedInput = () => {
    return {
      ...jobDestination,
      customer_id: entityModel?.customer_id,
      label: undefined,
      is_pickup: undefined,
      name: undefined,
      pick_up_condition: undefined,
      pick_up_notes: jobDestination.notes,
      is_saved_address: undefined,
      estimated_at: undefined,
      job_id: undefined,
      notes: undefined,
      updated_at: undefined,
      route_point: undefined,
      media: undefined,
      is_unattended: undefined,
      issue_reports: undefined,
      sort_id: undefined,
      is_new: undefined,
      job_destination_status_id: undefined,
    };
  };

  const [updateCustomerAddress] = useMutation<UpdateCustomerAddressResult>(
    UPDATE_CUSTOMER_ADDRESS_MUTATION,
    {
      onCompleted: () => {
        toast({
          title: "Saved customer address updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  const isSyncingFromPropsRef = useRef(true);

  useEffect(() => {
    if (isSyncingFromPropsRef.current) {
      isSyncingFromPropsRef.current = false;
      return;
    }
    jobDestinationChanged({ ...jobDestination, customer_id: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobDestination]);

  useEffect(() => {
    if (
      defaultJobDestination &&
      (jobDestination.id != defaultJobDestination.id ||
        jobDestination.address !== defaultJobDestination.address)
    ) {
      isSyncingFromPropsRef.current = true;
      setJobDestination(defaultJobDestination);
      setQuery(defaultJobDestination?.address || "");
      selectedLabelRef.current = defaultJobDestination?.address || "";
      if (!jobDestination?.address && defaultJobDestination?.address) {
        setIsOpen(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultJobDestination]);

  useEffect(() => {
    setIsSavedAddress(false);
    handleSetRandomIdKey();
  }, [entityModel?.customer_id]);

  const handleSetRandomIdKey = () => {
    setRandomIdKey(Math.random().toString(36).substring(7));
  };

  if (!isAdmin) return null;

  return (
    <Box w="full">
      <CustomInputField
        key={randomIdKey}
        isSelect={true}
        optionsArray={savedAddressesSelect}
        label="Saved Addresses"
        name="address_line_1"
        value={savedAddressesSelect.find(
          (_e) => _e.value === savedAddressSelectedId,
        )}
        placeholder=""
        onChange={(e) => {
          setSavedAddressSelectedId(e.value);
          setIsSavedAddress(false);
          handleSetRandomIdKey();
          let _entity = savedAddressesSelect.find(
            (_e) => _e.value === e.value,
          ).entity;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { __typename, ...cleanEntity } = _entity;

          const updated = {
            ...cleanEntity,
            id: jobDestination.id,
            is_new: jobDestination.is_new,
            notes: _entity.pick_up_notes,
          };
          setJobDestination(updated);
          setQuery(updated.address || "");
          selectedLabelRef.current = updated.address || "";
          setIsOpen(false);
        }}
      />

      { }
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb="8px"
        py="8px"
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Flex
          alignItems="center"
          gap="8px"
          cursor="pointer"
          onClick={() => setIsOpen((prev) => !prev)}
          flex="1"
          minW="0"
        >
          <FontAwesomeIcon
            icon={isOpen ? faChevronUp : faChevronDown}
            className="!text-[var(--chakra-colors-gray-500)]"
          />
          <Text
            fontSize="sm"
            color={jobDestination.address ? "gray.700" : "gray.400"}
            noOfLines={1}
          >
            {jobDestination.address || "No address selected — click to add"}
          </Text>
        </Flex>

        <Button
          variant="outline"
          colorScheme="blue"
          size="sm"
          flexShrink={0}
          ml="12px"
          onClick={(e) => {
            e.stopPropagation();
            if (!jobDestination.address) {
              toast({
                title: "Enter an address first",
                status: "warning",
                duration: 3000,
                isClosable: true,
              });
              return;
            }
            if (!entityModel?.customer_id) {
              toast({
                title: "Please select a customer",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
              return;
            }
            if (isSavedAddress && savedAddressSelectedId != null) {
              handleUpdateCustomerAddress();
            } else {
              handleSaveCustomerAddress();
            }
          }}
        >
          {isSavedAddress ? "Address Saved ✓" : "add to saved address"}
        </Button>
      </Flex>

      <CollapseFix in={isOpen} animateOpacity>
        <Box pt="4px">
          <Box position="relative" mb="16px">
            <FormLabel fontSize="sm" fontWeight="500" mb="8px">
              Search Address
            </FormLabel>
            <Input
              placeholder="Type location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="lg"
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                mt="6px"
                maxH="220px"
                overflowY="auto"
                position="absolute"
                bg="white"
                w="full"
                zIndex={10}
                boxShadow="md"
              >
                {suggestions.map((sugg) => {
                  const prediction = sugg.placePrediction;
                  const mainText = prediction.structuredFormat?.mainText?.text || "";
                  const secondaryText =
                    prediction.structuredFormat?.secondaryText?.text || "";
                  const fullLabel = `${mainText}, ${secondaryText}`.trim();

                  return (
                    <Button
                      key={prediction.placeId}
                      onClick={() => handleSelectSuggestion(prediction, fullLabel)}
                      w="100%"
                      justifyContent="flex-start"
                      variant="ghost"
                      whiteSpace="normal"
                      fontSize="sm"
                      textAlign="left"
                    >
                      {fullLabel}
                    </Button>
                  );
                })}
              </Box>
            )}
            {!jobDestination.lat && !jobDestination.lng && (
              <Text color="orange.500" fontSize="xs" mt="6px">
                Select an address from the search suggestions to set its location.
              </Text>
            )}
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacingX="20px" spacingY="0px">
            <CustomInputField
              label="Address"
              name="address"
              placeholder="Address"
              autoComplete="off"
              value={jobDestination.address}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />

            <CustomInputField
              label="Address Business Name"
              name="address_business_name"
              placeholder="Business Name"
              value={jobDestination.address_business_name}
              onChange={(e) =>
                setJobDestination({ ...jobDestination, [e.target.name]: e.target.value })
              }
            />

            <CustomInputField
              label="Address Line 1"
              name="address_line_1"
              placeholder="Line 1"
              autoComplete="off"
              value={jobDestination.address_line_1}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />

            <CustomInputField
              label="Address Line 2"
              name="address_line_2"
              placeholder="Line 2"
              autoComplete="off"
              value={jobDestination.address_line_2}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />

            <CustomInputField
              label="Address City"
              name="address_city"
              placeholder="City"
              autoComplete="off"
              value={jobDestination.address_city}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />

            <CustomInputField
              label="Address State"
              name="address_state"
              placeholder="State"
              autoComplete="off"
              value={jobDestination.address_state}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />

            <CustomInputField
              label="Address Country"
              name="address_country"
              placeholder="Country"
              autoComplete="off"
              value={jobDestination.address_country}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />

            <CustomInputField
              label="Address Postal Code"
              name="address_postal_code"
              placeholder="Postal Code"
              autoComplete="off"
              value={jobDestination.address_postal_code}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
            />

            <CustomInputField
              label="Lng"
              name="lng"
              type="number"
              value={jobDestination.lng ?? 0}
              onChange={(e) =>
                setJobDestination({
                  ...jobDestination,
                  lng: parseFloat(e.target.value) || 0,
                })
              }
            />

            <CustomInputField
              label="Lat"
              name="lat"
              type="number"
              value={jobDestination.lat ?? 0}
              onChange={(e) =>
                setJobDestination({
                  ...jobDestination,
                  lat: parseFloat(e.target.value) || 0,
                })
              }
            />

            <CustomInputField
              name="pick_up_name"
              label="Pickup Person"
              placeholder=""
              value={jobDestination.pick_up_name}
              onChange={(e) =>
                setJobDestination({ ...jobDestination, [e.target.name]: e.target.value })
              }
            />

            <CustomInputField
              isTextArea={true}
              label="Instructions"
              placeholder=""
              name="notes"
              value={jobDestination.notes}
              onChange={(e) =>
                setJobDestination({ ...jobDestination, [e.target.name]: e.target.value })
              }
            />
          </SimpleGrid>
        </Box>
      </CollapseFix >
    </Box>
  );
}