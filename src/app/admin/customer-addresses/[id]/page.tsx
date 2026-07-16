"use client";
// External Imports
import { useMutation } from "@apollo/client/react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
// Chakra UI Imports
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  SimpleGrid,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
// Local Imports
import AreYouSureAlert from "@/components/alert/AreYouSureAlert";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import {
  defaultCustomerAddress,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  GET_CUSTOMER_ADDRESS_QUERY,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
} from "@/graphql/customerAddress";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchPlaceDetails,
  fetchSuggestions,
  getAddressComponent,
} from "../../../../utils/autocomplete";

interface CustomerAddressQueryResult {
  customerAddress: any;
}

function CustomerAddressEdit() {
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [customerAddress, setCustomerAddress] = useState(
    defaultCustomerAddress,
  );
  const [originalCustomerAddress, setOriginalCustomerAddress] = useState(null);
  const [query, setQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

  const router = useRouter();
  const params = useParams();
  const id = (params?.id ?? "") as string;

  const { loading: customerAddressLoading } = useApolloQueryWithEffect<CustomerAddressQueryResult>(
    GET_CUSTOMER_ADDRESS_QUERY,
    {
      variables: { id },
      skip: !id,
      onCompleted: (data) => {
        if (data?.customerAddress == null) {
          router.push("/admin/customer-addresses");
        }
        setCustomerAddress({ ...customerAddress, ...data?.customerAddress });
        setOriginalCustomerAddress({ ...data?.customerAddress });
      },
      onError(error) {
        console.log("onError");
        console.log(error);
      },
    },
  );

  const hasChanges = () => {
    return (
      JSON.stringify(customerAddress) !==
      JSON.stringify(originalCustomerAddress)
    );
  };

  const [handleUpdateCustomerAddress, { }] = useMutation(
    UPDATE_CUSTOMER_ADDRESS_MUTATION,
    {
      variables: {
        input: {
          id: customerAddress.id,
          name: customerAddress.address,
          customer_id: customerAddress.customer_id,
          pick_up_name: customerAddress.pick_up_name,
          pick_up_notes: customerAddress.pick_up_notes,
          address: customerAddress.address,
          address_business_name: customerAddress.address_business_name,
          address_line_1: customerAddress.address_line_1,
          address_line_2: customerAddress.address_line_2,
          address_postal_code: customerAddress.address_postal_code,
          address_city: customerAddress.address_city,
          address_state: customerAddress.address_state,
          address_country: customerAddress.address_country,
          lng: customerAddress.lng,
          lat: customerAddress.lat,
        },
      },
      onCompleted: (_data) => {
        toast({
          title: "CustomerAddress updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setOriginalCustomerAddress({ ...customerAddress });
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  const [handleDeleteCustomerAddress, { }] = useMutation(
    DELETE_CUSTOMER_ADDRESS_MUTATION,
    {
      variables: {
        id: id,
      },
      onCompleted: (_data) => {
        toast({
          title: "CustomerAddress deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/admin/customer-addresses");
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  useEffect(() => {
    const fetchAutoCompleteResults = async () => {
      if (query.length >= 2) {
        const results = await fetchSuggestions(query);
        setAddressSuggestions(results);
      } else {
        setAddressSuggestions([]);
      }
    };

    fetchAutoCompleteResults();
  }, [query]);

  const handleSelectAddress = async (placeId: string) => {
    try {
      const data = await fetchPlaceDetails(placeId);
      if (!data) return;

      const components = data.addressComponents || [];

      const getComponent = (type: string) =>
        getAddressComponent(components, type) || "";

      setCustomerAddress({
        ...customerAddress,
        address: data.formattedAddress || "",
        address_line_1:
          getComponent("street_number") + " " + getComponent("route"),
        address_city:
          getComponent("locality") ||
          getComponent("administrative_area_level_2"),
        address_state: getComponent("administrative_area_level_1"),
        address_country: getComponent("country"),
        address_postal_code: getComponent("postal_code"),
        lng: data.location?.longitude || null,
        lat: data.location?.latitude || null,
      });

      setQuery("");
      setAddressSuggestions([]);
    } catch (error) {
      console.log("Error fetching place details:", error);
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} px={{ base: "16px", md: "24px" }}>
      <Grid maxW="1200px" mx="auto">
        <Box p={{ base: "20px", md: "32px" }} bg="white" borderRadius="12px" boxShadow="sm" border="1px solid" borderColor="gray.100">
          {!customerAddressLoading && (
            <FormControl>
              <FormLabel
                display="flex"
                fontSize="xl"
                fontWeight="700"
                color={textColor}
                mb="20px"
              >
                Address Details
              </FormLabel>

              <FormControl mb="24px">
                <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                  Search address
                </FormLabel>
                <Input
                  placeholder="Search for an address"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size="lg"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: "gray.300" }}
                  _focus={{ borderColor: "blue.400", bg: "white" }}
                />
                {addressSuggestions.length > 0 && (
                  <Box
                    mt="8px"
                    maxH="200px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    boxShadow="md"
                  >
                    {addressSuggestions.map((suggestion) => {
                      const pred = suggestion.placePrediction;
                      const label = pred?.text?.text;

                      return (
                        <Button
                          key={pred.placeId}
                          onClick={() => handleSelectAddress(pred.placeId)}
                          variant="ghost"
                          justifyContent="flex-start"
                          width="100%"
                          whiteSpace="normal"
                          fontSize="sm"
                          borderRadius="0"
                          py="10px"
                          _hover={{ bg: "gray.50" }}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </Box>
                )}
              </FormControl>

              <Divider mb="24px" />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb="28px">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                    Business or Building Name
                  </FormLabel>
                  <Input
                    value={customerAddress.address_business_name}
                    onChange={(e) =>
                      setCustomerAddress({
                        ...customerAddress,
                        address_business_name: e.target.value,
                      })
                    }
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                    Address line 1
                  </FormLabel>
                  <Input
                    value={customerAddress.address_line_1}
                    onChange={(e) =>
                      setCustomerAddress({
                        ...customerAddress,
                        address_line_1: e.target.value,
                      })
                    }
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                    Apt / Suite / Floor
                  </FormLabel>
                  <Input
                    value={customerAddress.address_line_2}
                    onChange={(e) =>
                      setCustomerAddress({
                        ...customerAddress,
                        address_line_2: e.target.value,
                      })
                    }
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                    Address City
                  </FormLabel>
                  <Input
                    value={customerAddress.address_city}
                    onChange={(e) =>
                      setCustomerAddress({
                        ...customerAddress,
                        address_city: e.target.value,
                      })
                    }
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                    Address state
                  </FormLabel>
                  <Input
                    value={customerAddress.address_state}
                    onChange={(e) =>
                      setCustomerAddress({
                        ...customerAddress,
                        address_state: e.target.value,
                      })
                    }
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                    Address Country
                  </FormLabel>
                  <Input
                    value={customerAddress.address_country}
                    onChange={(e) =>
                      setCustomerAddress({
                        ...customerAddress,
                        address_country: e.target.value,
                      })
                    }
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb="6px">
                    Address Postcode
                  </FormLabel>
                  <Input
                    value={customerAddress.address_postal_code}
                    onChange={(e) =>
                      setCustomerAddress({
                        ...customerAddress,
                        address_postal_code: e.target.value,
                      })
                    }
                    size="lg"
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="600"
                w="100%"
                h="50px"
                mb="20px"
                onClick={() => handleUpdateCustomerAddress()}
                isLoading={customerAddressLoading}
                disabled={!hasChanges()}
              >
                Update
              </Button>

              <Flex gap="10px">
                <AreYouSureAlert
                  onDelete={handleDeleteCustomerAddress}
                ></AreYouSureAlert>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/admin/customers/${customerAddress.customer_id}`,
                    )
                  }
                >
                  Back
                </Button>
              </Flex>
            </FormControl>
          )}
        </Box>
      </Grid>
    </Box>
  );
}

export default CustomerAddressEdit;