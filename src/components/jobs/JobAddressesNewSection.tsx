"use client";
import { useMutation } from "@apollo/client/react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Flex,
  FormLabel,
  // GridItem,
  Input,
  SimpleGrid,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { faPen } from "@fortawesome/pro-regular-svg-icons";
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
import React, { useEffect, useId, useRef, useState } from "react";

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
  const uniqueId = useId();

  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [savedAddressSelectedId, setSavedAddressSelectedId] = useState(null);
  const [isSavedAddress, setIsSavedAddress] = useState(false);
  const [jobDestination, setJobDestination] = useState(defaultJobDestination);
  const [_randomIdSection, _setRandomIdSection] = useState(
    Math.random().toString(36).substring(7),
  );
  const [randomIdKey, setRandomIdKey] = useState(
    Math.random().toString(36).substring(7),
  );

  const [_isAddressExpanded, setIsAddressExpanded] = useState(false);

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
  };

  const handleFieldChange = (name: string, value: string) => {
    const updated = { ...jobDestination, [name]: value };
    updated.address = composeAddress(updated);
    setJobDestination(updated);
  };

  const handleAddressDone = () => {
    setIsAddressExpanded(false);
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
        setTimeout(() => {
          setIsSavedAddress(true);
        }, 1000);
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
  useEffect(() => {
    jobDestinationChanged({ ...jobDestination, customer_id: undefined });
    if (isSavedAddress && savedAddressSelectedId != null) {
      handleUpdateCustomerAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobDestination]);
  useEffect(() => {
    if (jobDestination.id != defaultJobDestination.id) {
      setJobDestination(defaultJobDestination);
      setQuery(defaultJobDestination?.address || "");
      selectedLabelRef.current = defaultJobDestination?.address || "";
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

  return (
    <Box w="full">
      <Accordion variant="jobAddress" defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          {({ isExpanded = true }) => (
            <>
              <AccordionButton pr={0}>
                {isExpanded ? null : (
                  <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    className="py-0"
                  >
                    <p className="py-3 text-sm">{jobDestination.address}</p>

                    <FontAwesomeIcon
                      icon={faPen}
                      className="!text-[var(--chakra-colors-black-400)]"
                    />
                  </Flex>
                )}
              </AccordionButton>

              {isAdmin && (
                <AccordionPanel pb={4}>
                  <Box>
                    <SimpleGrid
                      columns={{ base: 1, md: 4 }}
                      spacingX="20px"
                      spacingY="0px"
                    >
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
                        }}
                      />

                      {/* Search Address — same width as a single grid cell */}
                      <Box position="relative">
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
                              const mainText =
                                prediction.structuredFormat?.mainText?.text ||
                                "";
                              const secondaryText =
                                prediction.structuredFormat?.secondaryText
                                  ?.text || "";
                              const fullLabel =
                                `${mainText}, ${secondaryText}`.trim();

                              return (
                                <Button
                                  key={prediction.placeId}
                                  onClick={() =>
                                    handleSelectSuggestion(
                                      prediction,
                                      fullLabel,
                                    )
                                  }
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
                            Select an address from the search suggestions to
                            set its location.
                          </Text>
                        )}
                      </Box>

                      <CustomInputField
                        label="Address Line 1"
                        name="address_line_1"
                        placeholder=""
                        autoComplete="off"
                        value={jobDestination.address_line_1}
                        onChange={(e) =>
                          handleFieldChange(e.target.name, e.target.value)
                        }
                      />
                      <CustomInputField
                        label="Apt / Suite / Floor"
                        name="address_line_2"
                        placeholder=""
                        autoComplete="off"
                        value={jobDestination.address_line_2}
                        onChange={(e) =>
                          handleFieldChange(e.target.name, e.target.value)
                        }
                      />

                      <CustomInputField
                        label="City / Suburb"
                        name="address_city"
                        placeholder=""
                        autoComplete="off"
                        value={jobDestination.address_city}
                        onChange={(e) =>
                          handleFieldChange(e.target.name, e.target.value)
                        }
                      />
                      <CustomInputField
                        label="State"
                        name="address_state"
                        placeholder=""
                        autoComplete="off"
                        value={jobDestination.address_state}
                        onChange={(e) =>
                          handleFieldChange(e.target.name, e.target.value)
                        }
                      />
                      <CustomInputField
                        label="Postcode"
                        name="address_postal_code"
                        placeholder=""
                        autoComplete="off"
                        value={jobDestination.address_postal_code}
                        onChange={(e) =>
                          handleFieldChange(e.target.name, e.target.value)
                        }
                      />
                      <CustomInputField
                        label="Country"
                        name="address_country"
                        placeholder=""
                        autoComplete="off"
                        value={jobDestination.address_country}
                        onChange={(e) =>
                          handleFieldChange(e.target.name, e.target.value)
                        }
                      />

                      <CustomInputField
                        name="address_business_name"
                        label="Business or building name"
                        placeholder=""
                        value={jobDestination.address_business_name}
                        onChange={(e) =>
                          setJobDestination({
                            ...jobDestination,
                            [e.target.name]: e.target.value,
                          })
                        }
                      />

                      <CustomInputField
                        name="pick_up_name"
                        label="Pickup person"
                        placeholder=""
                        value={jobDestination.pick_up_name}
                        onChange={(e) =>
                          setJobDestination({
                            ...jobDestination,
                            [e.target.name]: e.target.value,
                          })
                        }
                      />


                      <CustomInputField
                        isTextArea={true}
                        label="Instructions"
                        placeholder=""
                        name="notes"
                        value={jobDestination.notes}
                        onChange={(e) =>
                          setJobDestination({
                            ...jobDestination,
                            [e.target.name]: e.target.value,
                          })
                        }
                      />
                    </SimpleGrid>
                    <Flex
                      w="full"
                      justifyContent="space-between"
                      alignItems="center"
                      mt="8px"
                    >
                      <Flex alignItems="center">
                        <Checkbox
                          defaultChecked={isSavedAddress}
                          key={randomIdKey}
                          colorScheme="brandScheme"
                          name="is_saved_address"
                          id={`is_saved_address_${uniqueId}`}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (entityModel?.customer_id) {
                                handleSaveCustomerAddress();
                              } else {
                                toast({
                                  title: "Please select a customer",
                                  status: "error",
                                  duration: 3000,
                                  isClosable: true,
                                });
                                e.target.checked = false;
                                setIsSavedAddress(e.target.checked);
                                handleSetRandomIdKey();
                              }
                            }
                            setIsSavedAddress(e.target.checked);
                          }}
                        />

                        <FormLabel
                          mb={0}
                          ms={"8px"}
                          color={textColor}
                          fontSize="sm"
                          fontWeight="700"
                          htmlFor={`is_saved_address_${uniqueId}`}
                        >
                          Add to saved addresses
                        </FormLabel>
                      </Flex>

                      {jobDestination.address ? (
                        <AccordionButton
                          onClick={handleAddressDone}
                          className={
                            "btn-primary " +
                            (jobDestination.address ? "d-flex" : "hidden")
                          }
                          width="auto"
                        >
                          Done
                        </AccordionButton>
                      ) : null}
                    </Flex>
                  </Box>
                </AccordionPanel>
              )}
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  );
}