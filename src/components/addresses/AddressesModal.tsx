// ✅ Updated AddressesModal.tsx with externalized autocomplete utils

import {
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
  // useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useId, useRef, useState } from "react";

import {
  fetchPlaceDetails,
  fetchSuggestions,
  getAddressComponent,
} from "../../utils/autocomplete";
import { GenericAddressType } from "./genericAddressType";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHandHolding, faInfinity, faTruckRampBox, faWarning } from "@fortawesome/free-solid-svg-icons";

export default function AddressesModal<T extends GenericAddressType>(props: {
  defaultAddress?: T;
  onSetAddress: (entityAddress: GenericAddressType) => void;
  onModalClose: (isOpen: boolean) => void;
  isModalOpen?: boolean;
  description?: string;
}) {
  const {
    defaultAddress,
    isModalOpen,
    description,
    onSetAddress,
    onModalClose,
  } = props;
  const inputId = useId();

  const prevQueryRef = useRef("");
  const selectedLabelRef = useRef("");
  // const textColor = useColorModeValue("navy.700", "white");
  const [entityAddress, setEntityAddress] = useState<GenericAddressType>({
    id: defaultAddress?.id ?? 0,
    address: defaultAddress?.address ?? "",
    address_line_1: defaultAddress?.address_line_1 ?? "",
    address_line_2: defaultAddress?.address_line_2 ?? "",
    address_postal_code: defaultAddress?.address_postal_code ?? "",
    address_city: defaultAddress?.address_city ?? "",
    address_state: defaultAddress?.address_state ?? "",
    address_country: defaultAddress?.address_country ?? "",
    address_business_name: defaultAddress?.address_business_name ?? "",
    lng: defaultAddress?.lng ?? 0,
    lat: defaultAddress?.lat ?? 0,
  });
  const [googleAddress, setGoogleAddress] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(isModalOpen || false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const toast = useToast();

  const onClose = () => {
    setIsOpen(false);
    onModalClose(false);
  };

  useEffect(() => {
    setIsOpen(isModalOpen);
  }, [isModalOpen]);

  useEffect(() => {
    if (defaultAddress?.address)
      setEntityAddress({
        id: defaultAddress?.id ?? 0,
        address: defaultAddress?.address ?? "",
        address_line_1: defaultAddress?.address_line_1 ?? "",
        address_line_2: defaultAddress?.address_line_2 ?? "",
        address_postal_code: defaultAddress?.address_postal_code ?? "",
        address_city: defaultAddress?.address_city ?? "",
        address_state: defaultAddress?.address_state ?? "",
        address_country: defaultAddress?.address_country ?? "",
        address_business_name: defaultAddress?.address_business_name ?? "",
        lng: defaultAddress?.lng ?? 0,
        lat: defaultAddress?.lat ?? 0,
      });
  }, [defaultAddress]);

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
      }

      prevQueryRef.current = query;
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleFetchPlaceDetails = async (placeId: string) => {
    // debugger
    const data = await fetchPlaceDetails(placeId);
    if (!data) return;
    // console.log(data, "data");
    let businessname=data.displayName.text
    const components = data.addressComponents || [];
    // console.log("Fetched place details:", data, components);
    setEntityAddress({
      ...entityAddress,
      address: data.formattedAddress || "",
      address_line_1: [
        getAddressComponent(components, "street_number"),
        getAddressComponent(components, "route"),
      ]
        .filter(Boolean) // removes empty/undefined parts
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
      address_business_name: businessname,
    });
  };

  const handleSaveAddress = async () => {
    // debugger
    // console.log("Saving address:", entityAddress);
    entityAddress.address =
      (entityAddress.address_line_2 ? entityAddress.address_line_2 + "/" : "") +
      entityAddress.address_line_1 +
      ", " +
      entityAddress.address_city +
      " " +
      entityAddress.address_state +
      " " +
      entityAddress.address_postal_code +
      ", " +
      entityAddress.address_country;

    if (!entityAddress.lat || !entityAddress.lng) {
      toast({
        title: "Error",
        description:
          "Please search for a google address first. Longitude and latitude are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      onSetAddress({ ...entityAddress });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{description || "Add addresses"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Divider mb="24px" />

          <Flex mt={4} direction="column" gap="16px">
            <FormLabel>Search Address</FormLabel>
            <Input
              placeholder="Type location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="lg"
            />
            {suggestions.map((sugg) => {
              // console.log(sugg, "sugg");
              const prediction = sugg.placePrediction;
              const mainText =
                prediction.structuredFormat?.mainText?.text || "";
              const secondaryText =
                prediction.structuredFormat?.secondaryText?.text || "";
              const fullLabel = `${mainText}, ${secondaryText}`.trim();

              return (
                <Button
                  key={prediction.placeId}
                  onClick={() => {
                    setQuery(fullLabel);
                    setSuggestions([]);
                    setGoogleAddress(prediction);
                    handleFetchPlaceDetails(prediction.placeId);
                    selectedLabelRef.current = fullLabel;
                  }}
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

            {[
              "address",
              "address_business_name",
              "address_line_1",
              "address_line_2",
              "address_city",
              "address_state",
              "address_country",
              "address_postal_code",
              "lng",
              "lat",
            ].map((name) => (
              <Flex key={name} align="center" gap={4} w="100%">
                <FormLabel
                  htmlFor={`${name}-${inputId}`}
                  w="30%"
                  mb="0"
                  textAlign="left" // ✅ align text right to line up neatly
                >
                  {name
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </FormLabel>
                <Input
                  id={`${name}-${inputId}`}
                  name={name}
                  placeholder={name
                    .replaceAll("_", " ")
                    .replace("address ", "")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={(entityAddress as any)[name] ?? ""}
                  onChange={(e) =>
                    setEntityAddress({
                      ...entityAddress,
                      [e.target.name]: e.target.value,
                    })
                  }
                  isDisabled={!googleAddress}
                  w="70%"
                />
              </Flex>
            ))}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr="auto" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveAddress}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
