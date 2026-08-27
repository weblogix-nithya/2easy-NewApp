import { useMutation } from "@apollo/client";
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
import AddressesModal from "components/addresses/AddressesModal";
import CustomInputField from "components/fields/CustomInputField";
import { showGraphQLErrorToast } from "components/toast/ToastError";
import {
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
} from "graphql/customerAddress";
import React, { useEffect, useState } from "react";

export default function QuoteAddressesTab(props: {
  savedAddressesSelect?: any[];
  isAdmin?: boolean;
  defaultQuoteDestination: any;
  entityModel?: any;
  onAddressSaved: (hasChanged: boolean) => void;
  quoteDestinationChanged: (quoteDestination: any) => void;
}) {
  const {
    savedAddressesSelect,
    isAdmin = true,
    defaultQuoteDestination,
    entityModel,
    onAddressSaved,
    quoteDestinationChanged,
  } = props;

  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [savedAddressSelectedId, setSavedAddressSelectedId] = useState(null);
  const [isSavedAddress, setIsSavedAddress] = useState(false);
  const [quoteDestination, setQuoteDestination] = useState(
    defaultQuoteDestination,
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [randomIdSection, _setRandomIdSection] = useState(
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
      onCompleted: (data) => {
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
      ...quoteDestination,
      customer_id: entityModel?.customer_id,
      label: undefined,
      is_pickup: undefined,
      name: undefined,
      pick_up_condition: undefined,
      pick_up_notes: quoteDestination.notes,
      is_saved_address: undefined,
      estimated_at: undefined,
      quote_id: undefined,
      notes: undefined,
      updated_at: undefined,
      media: undefined,
      is_unattended: undefined,
      issue_reports: undefined,
      sort_id: undefined,
      is_new: undefined,
      quote_destination_status_id: undefined,
    };
  };

  const [updateCustomerAddress, {}] = useMutation(
    UPDATE_CUSTOMER_ADDRESS_MUTATION,
    {
      onCompleted: (_data) => {
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
    quoteDestinationChanged({ ...quoteDestination, customer_id: undefined });
    if (isSavedAddress && savedAddressSelectedId != null) {
      handleUpdateCustomerAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteDestination]);
  useEffect(() => {
    if (quoteDestination.id != defaultQuoteDestination.id)
      setQuoteDestination(defaultQuoteDestination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultQuoteDestination]);
  useEffect(() => {
    setIsSavedAddress(false);
    handleSetRandomIdKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              {/* Quote title wrap */}
              <AccordionButton pr={0}>
                {isExpanded ? null : (
                  <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    className="py-0"
                  >
                    <p className="py-3 text-sm">{quoteDestination.address}</p>

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
                        setQuoteDestination({
                          ..._entity,
                          id: quoteDestination.id,
                          is_new: quoteDestination.is_new,
                          notes: _entity.pick_up_notes,
                        });
                      }}
                    />

                    <CustomInputField
                      label="Address"
                      name="address"
                      value={quoteDestination.address}
                      placeholder=""
                      onClick={() => setIsAddressModalOpen(true)}
                      onChange={(e) => {
                        setSavedAddressSelectedId(e.value);
                      }}
                    />

                    <AddressesModal
                      defaultAddress={quoteDestination}
                      isModalOpen={isAddressModalOpen}
                      description="Residential address"
                      onModalClose={(e) => setIsAddressModalOpen(e)}
                      onSetAddress={(target) => {
                        setSavedAddressSelectedId(null);
                        handleSetRandomIdKey();
                        setQuoteDestination({ ...quoteDestination, ...target });
                      }}
                    />

                    <CustomInputField
                      label="Apt / Suite / Floor"
                      name="address_line_2"
                      value={quoteDestination.address_line_2}
                      placeholder=""
                      isDisabled={true}
                      onChange={(e) =>
                        setQuoteDestination({
                          ...quoteDestination,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />

                    <CustomInputField
                      name="address_business_name"
                      label="Business or building name"
                      placeholder=""
                      value={quoteDestination.address_business_name}
                      onChange={(e) =>
                        setQuoteDestination({
                          ...quoteDestination,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />

                    <CustomInputField
                      name="pick_up_name"
                      label="Pickup person"
                      placeholder=""
                      value={quoteDestination.pick_up_name}
                      onChange={(e) =>
                        setQuoteDestination({
                          ...quoteDestination,
                          [e.target.name]: e.target.value,
                        })
                      }
                    />

                    <CustomInputField
                      isTextArea={true}
                      label="Instructions"
                      placeholder=""
                      name="notes"
                      value={quoteDestination.notes}
                      onChange={(e) =>
                        setQuoteDestination({
                          ...quoteDestination,
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
                              id={"is_saved_address" + randomIdSection}
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
                              htmlFor={"is_saved_address" + randomIdSection}
                            >
                              Add to saved addresses
                            </FormLabel>
                          </Flex>

                          {/* TODO: This conditional will close the accordion once the modal address is entered,.
                            Disabling this conditional means the accordion will be closed initially.
                            Setting the button class will mean the accordion will be closed initially.
                          See TWO-245 for more comments */}
                          {quoteDestination.address ? (
                            <AccordionButton
                              onClick={handleAddressDone}
                              className={
                                "btn-primary " +
                                (quoteDestination.address ? "d-flex" : "hidden")
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
