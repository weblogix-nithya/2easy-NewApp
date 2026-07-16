"use client";
import { useMutation } from "@apollo/client/react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import PaginationTable from "@/components/table/PaginationTable";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import {
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  defaultCustomerAddress,
  GET_CUSTOMER_ADDRESSES_QUERY,
} from "@/graphql/customerAddress";
import debounce from "lodash.debounce";
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchPlaceDetails,
  fetchSuggestions,
  getAddressComponent,
} from "../../utils/autocomplete";

// Shared shape for GET_CUSTOMER_ADDRESSES_QUERY response
interface CustomerAddressesQueryResult {
  customerAddresses: {
    data: any[];
    paginatorInfo: {
      total: number;
      lastPage?: number;
    };
  };
}

export default function CustomerAddressesTab(props: any) {
  const toast = useToast();
  const { customer } = props;
  const textColor = useColorModeValue("navy.700", "white");
  let menuBg = useColorModeValue("white", "navy.800");
  const [customerAddress, setCustomerAddress] = useState(
    defaultCustomerAddress,
  );
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, setQueryPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [googleAddress, _setGoogleAddress] = useState(null);
  const [_suggestions, setSuggestions] = useState([]);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

  const onChangeSearchQuery = useMemo(() => {
    return debounce((e) => {
      setSearchQuery(e);
      setQueryPageIndex(0);
    }, 300);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAddressQuery("");
      setAddressSuggestions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchAutoCompleteResults = async () => {
      if (addressQuery.length >= 2) {
        const results = await fetchSuggestions(addressQuery);
        setAddressSuggestions(results);
      } else {
        setAddressSuggestions([]);
      }
    };
    fetchAutoCompleteResults();
  }, [addressQuery]);

  const columns = useMemo(
    () => [
      {
        id: "address_line_1",
        header: "Address",
        accessorKey: "address_line_1" as const,
      },
      {
        id: "address_city",
        header: "Suburb",
        accessorKey: "address_city" as const,
      },
      {
        id: "address_line_2",
        header: "Apt/Suite/Floor",
        accessorKey: "address_line_2" as const,
      },
      {
        id: "address_business_name",
        header: "Company",
        accessorKey: "address_business_name" as const,
      },
      {
        id: "instructions",
        header: "Instructions",
        accessorKey: "pick_up_name" as const,
        meta: { isTooltip: true },
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        meta: { isEdit: true },
      },
    ],
    [],
  );

  const {
    loading,
    data: customerAddresses,
    refetch: getCustomerAddresses,
  } = useApolloQueryWithEffect<CustomerAddressesQueryResult>(
    GET_CUSTOMER_ADDRESSES_QUERY,
    {
      variables: {
        query: searchQuery,
        page: queryPageIndex + 1,
        first: queryPageSize,
        orderByColumn: "address_business_name",
        orderByOrder: "ASC",
        customer_id: parseInt(customer.id),
      },
      skip: !customer?.id,
    },
  );

  useEffect(() => {
    if (googleAddress) {
      updateCustomerAddress(googleAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAddress]);

  const [handleCreateCustomerAddress, { }] = useMutation(
    CREATE_CUSTOMER_ADDRESS_MUTATION,
    {
      variables: {
        input: {
          customer_id: customer.id,
          name: customerAddress.name,
          address: customerAddress.address,
          address_line_1: customerAddress.address_line_1,
          address_line_2: customerAddress.address_line_2,
          address_city: customerAddress.address_city,
          address_state: customerAddress.address_state,
          address_postal_code: customerAddress.address_postal_code,
          address_country: customerAddress.address_country,
          address_business_name: customerAddress.address_business_name,
          lng: customerAddress.lng,
          lat: customerAddress.lat,
          pick_up_name: customerAddress.pick_up_name,
          pick_up_notes: customerAddress.pick_up_notes,
        },
      },
      onCompleted: () => {
        toast({
          title: "CustomerAddress created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        getCustomerAddresses();
        setCustomerAddress(defaultCustomerAddress);
        onClose();
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  const handleAddressSelect = async (placeId: string) => {
    const data = await fetchPlaceDetails(placeId);
    if (!data) return;

    const components = data.addressComponents || [];
    const pick = (type: string) => getAddressComponent(components, type) || "";

    const streetNumber = pick("street_number");
    const route = pick("route");
    const addressLine1 = [streetNumber, route].filter(Boolean).join(" ").trim();

    setCustomerAddress((prev) => ({
      ...prev,
      name: data.formattedAddress || "",
      address_line_1: addressLine1,
      address_line_2: pick("subpremise"),
      address_city: pick("locality") || pick("administrative_area_level_2"),
      address_state: pick("administrative_area_level_1"),
      address_country: pick("country"),
      address_postal_code: pick("postal_code"),
      lat: data.location?.latitude ?? 0,
      lng: data.location?.longitude ?? 0,
    }));

    setAddressQuery("");
    setAddressSuggestions([]);
  };

  function updateCustomerAddress(data) {
    const components = data.addressComponents || [];

    setCustomerAddress({
      ...customerAddress,
      name: data.formattedAddress || "",
      address_line_1:
        getAddressComponent(components, "street_address") ||
        getAddressComponent(components, "route") ||
        "",
      address_city: getAddressComponent(components, "locality"),
      address_state: getAddressComponent(
        components,
        "administrative_area_level_1",
      ),
      address_country: getAddressComponent(components, "country"),
      address_postal_code: getAddressComponent(components, "postal_code"),
      lat: data.location?.latitude || 0,
      lng: data.location?.longitude || 0,
    });
    getCustomerAddresses();
  }

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [isOpen]);

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex
          justifyContent="space-between"
          alignItems="center"
          className="mt-8"
          width="100%"
        >
          <h2 className="mb-0">Addresses</h2>
          <Button fontSize="sm" variant="brand" onClick={onOpen}>
            Create New
          </Button>
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add address</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Divider mb="24px" />
              <p className="mb-4">
                <strong>Address Details</strong>
              </p>

              <Box mb="16px" w="full">
                <FormLabel
                  display="block"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="2"
                >
                  Search address
                </FormLabel>

                <Box position="relative" w="full" maxW="unset" minW={0}>
                  <Input
                    placeholder="Type location"
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    size="lg"
                    w="full"
                    maxW="unset"
                    minW={0}
                  />

                  {!!addressSuggestions.length && (
                    <Box
                      position="absolute"
                      top="100%"
                      left="0"
                      right="0"
                      mt="2"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="8px"
                      boxShadow="md"
                      zIndex="popover"
                      maxH="260px"
                      overflowY="auto"
                      p="1"
                    >
                      {addressSuggestions?.map((sugg, index) => {
                        const pred = sugg?.placePrediction;
                        if (!pred) return null;

                        const main =
                          pred?.structuredFormat?.mainText?.text ?? "";
                        const secondary =
                          pred?.structuredFormat?.secondaryText?.text ?? "";
                        const fallback = pred?.text?.text ?? "";
                        const fullLabel =
                          [main, secondary].filter(Boolean).join(", ") ||
                          fallback;

                        const placeId = pred?.placeId ?? `sugg-${index}`;

                        return (
                          <Button
                            key={placeId}
                            onClick={() => handleAddressSelect(pred.placeId)}
                            variant="ghost"
                            justifyContent="flex-start"
                            w="full"
                            whiteSpace="normal"
                            fontSize="sm"
                            py="2"
                          >
                            {fullLabel}
                          </Button>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>

              <Flex alignItems="center" mb="16px">
                <FormLabel
                  display="flex"
                  mb="0"
                  width="200px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                >
                  Address line 1
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.address_line_1}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="address_line_1"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
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
                  Apt / Suite / Floor
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.address_line_2}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="address_line_2"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
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
                  Address City
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.address_city}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="address_city"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
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
                  Address state
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.address_state}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="address_state"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
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
                  Address Country
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.address_country}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="address_country"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
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
                  Address Postcode
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.address_postal_code}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="address_postal_code"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
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
                  Business or building name
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.address_business_name}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="address_business_name"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
                  size="lg"
                />
              </Flex>

              <Divider className="my-6" />

              <p className="mb-4 text-sm font-medium">Instructions</p>

              <Flex alignItems="center" mb="16px">
                <FormLabel
                  display="flex"
                  mb="0"
                  width="200px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                >
                  Pickup person
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="main"
                  value={customerAddress.pick_up_name}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  type="text"
                  name="pick_up_name"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
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
                  Instructions
                </FormLabel>
                <Textarea
                  isRequired={true}
                  value={customerAddress.pick_up_notes || ""}
                  onChange={(e) =>
                    setCustomerAddress({
                      ...customerAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  name="pick_up_notes"
                  className="max-w-md"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  mb="0"
                  fontWeight="500"
                  size="lg"
                />
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mr="auto" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleCreateCustomerAddress()}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>

      <Divider />

      <Box className="mt-6">
        <SimpleGrid columns={{ sm: 1 }}>
          <Flex className="mb-4">
            <SearchBar
              background={menuBg}
              onChangeSearchQuery={onChangeSearchQuery}
            />
          </Flex>

          {!loading && customerAddresses?.customerAddresses?.data && (
            <PaginationTable
              columns={columns}
              data={customerAddresses.customerAddresses.data}
              total={customerAddresses.customerAddresses.paginatorInfo?.total ?? 0}
              options={{
                initialState: {
                  pageIndex: queryPageIndex,
                  pageSize: queryPageSize,
                },
                manualPagination: true,
                pageCount:
                  customerAddresses.customerAddresses.paginatorInfo?.lastPage,
              }}
              setQueryPageIndex={setQueryPageIndex}
              setQueryPageSize={setQueryPageSize}
              isServerSide
              path="/admin/customer-addresses"
            />
          )}
        </SimpleGrid>
      </Box>
    </>
  );
}