import { useMutation } from "@apollo/client/react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  Flex,
  FormLabel,
  GridItem,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { faPen } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddressesModal from "../addresses/AddressesModal";
import CustomInputField from "../fields/CustomInputField";
import { showGraphQLErrorToast } from "../toast/ToastError";
import {
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
} from "@/graphql/customerAddress";
import React, { useEffect, useId,useState } from "react";

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
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [_randomIdSection, _setRandomIdSection] = useState(
    Math.random().toString(36).substring(7),
  );
  const [randomIdKey, setRandomIdKey] = useState(
    Math.random().toString(36).substring(7),
  );

  const [_isAddressExpanded, setIsAddressExpanded] = useState(false);

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
  const [saveCustomerAddress, {}] = useMutation(
    CREATE_CUSTOMER_ADDRESS_MUTATION,
    {
      onCompleted: (data: any) => {
        toast({
          title: "Address saved to customer",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setSavedAddressSelectedId(data.createCustomerAddress.id);
        onAddressSaved(true);
        //delay
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

  const [updateCustomerAddress, {}] = useMutation(
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
    if (jobDestination.id != defaultJobDestination.id)
      setJobDestination(defaultJobDestination);
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
    <GridItem colSpan={7}>
      <Accordion variant="jobAddress" defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          {({ isExpanded = true }) => (
            <>
              {/* Job title wrap */}
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

              {/* Show inputs */}
              {isAdmin && (
                <AccordionPanel pb={4}>
                  <Box>
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
                        setJobDestination({
                          ..._entity,
                          id: jobDestination.id,
                          is_new: jobDestination.is_new,
                          notes: _entity.pick_up_notes,
                        });
                      }}
                    />

                    <CustomInputField
                      label="Address"
                      name="address"
                      value={jobDestination.address}
                      placeholder=""
                      onClick={() => setIsAddressModalOpen(true)}
                      onChange={(e) => {
                        setSavedAddressSelectedId(e.value);
                      }}
                    />

                    <AddressesModal
                      defaultAddress={jobDestination}
                      isModalOpen={isAddressModalOpen}
                      description="Residential address"
                      onModalClose={(e) => setIsAddressModalOpen(e)}
                      onSetAddress={(target) => {
                        setSavedAddressSelectedId(null);
                        handleSetRandomIdKey();
                        setJobDestination({ ...jobDestination, ...target });
                        console.log(target, "target");
                      }}
                    />

                    <CustomInputField
                      label="Apt / Suite / Floor"
                      name="address_line_2"
                      value={jobDestination.address_line_2}
                      placeholder=""
                      isDisabled={true}
                      onChange={(e) =>
                        setJobDestination({
                          ...jobDestination,
                          [e.target.name]: e.target.value,
                        })
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

                    <Flex>
                      <FormLabel width="200px"></FormLabel>

                      <Box width="100%">
                        <Flex w="50%" justifyContent="space-between">
                          <Flex
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Checkbox
                              defaultChecked={isSavedAddress}
                              key={randomIdKey}
                              colorScheme="brandScheme"
                              name="is_saved_address"
                              // id={"is_saved_address" + randomIdSection}
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
                              // htmlFor={"is_saved_address" + randomIdSection}
                            >
                              Add to saved addresses
                            </FormLabel>
                          </Flex>

                          {/* TODO: This conditional will close the accordion once the modal address is entered,.
                            Disabling this conditional means the accordion will be closed initially.
                            Setting the button class will mean the accordion will be closed initially.
                          See TWO-245 for more comments */}
                          {jobDestination.address ? (
                            <AccordionButton
                              onClick={handleAddressDone}
                              className={
                                "btn-primary " +
                                (jobDestination.address ? "d-flex" : "hidden")
                              }
                            >
                              Done
                            </AccordionButton>
                          ) : null}
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                </AccordionPanel>
              )}
            </>
          )}
        </AccordionItem>
      </Accordion>
    </GridItem>
  );
}
