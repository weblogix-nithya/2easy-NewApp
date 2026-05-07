import {
  Divider,
  Flex,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuGroup,
  MenuList,
  Portal,
  useColorModeValue,
} from "@chakra-ui/react";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import { setCookie } from "nookies";
import { useDispatch } from "react-redux";
import { setState } from "@/lib/store/userSlice";
import { australianStates } from "@/lib/helpers/helper";

export function JobFilterMenu({
  customerName,
  pickupAddress,
  deliveryAddress,
  // australianState,
  setCustomerName,
  setPickupAddress,
  setDeliveryAddress,
  setAustralianState,
  // ...props
}: {
  customerName: any;
  pickupAddress: any;
  deliveryAddress: any;
  australianState: any;
  setCustomerName: any;
  setPickupAddress: any;
  setDeliveryAddress: any;
  setAustralianState: any;
}) {
  const textColor = useColorModeValue("navy.700", "white");
  const dispatch = useDispatch();

  return (
    <Menu closeOnSelect={false}>
      <MenuButton>
        <Flex alignItems="center">
          <p className="!font-bold  !text-[var(--chakra-colors-primary-400)]">
            Filter
          </p>
          <FontAwesomeIcon
            icon={faCaretDown}
            className="ml-2 !text-[var(--chakra-colors-primary-400)]"
          />
        </Flex>
      </MenuButton>

      <Portal>
        <MenuList className="!p-4 w-[370px]">
          <MenuGroup>
            <p className="!font-bold text-[14px]">Filter Jobs</p>

            <Divider className="my-4" />

            <FormLabel display="flex" mb="8px" fontSize="sm" color={textColor}>
              Client
            </FormLabel>
            <Input
              type="text"
              placeholder=""
              variant="main"
              className="max-w ml-0 mb-6 text-sm font-medium"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              size="lg"
            />

            <FormLabel display="flex" mb="8px" fontSize="sm" color={textColor}>
              Pick up address
            </FormLabel>
            <Input
              type="text"
              placeholder=""
              className="max-w ml-0 mb-6 text-sm font-medium"
              variant="main"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              size="lg"
            />

            <FormLabel display="flex" mb="8px" fontSize="sm" color={textColor}>
              Delivery address
            </FormLabel>
            <Input
              type="text"
              placeholder=""
              variant="main"
              className="max-w ml-0 mb-6 text-sm font-medium"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              size="lg"
            />

            <FormLabel display="flex" mb="8px" fontSize="sm" color={textColor}>
              State
            </FormLabel>
            <Select
              placeholder="Select State"
              options={australianStates}
              onChange={(e) => {
                setAustralianState(e.value);
                dispatch(setState(e.value));

                setCookie(null, "state", e.value, {
                  maxAge: 30 * 24 * 60 * 60,
                  path: "/",
                });
              }}
              size="lg"
              className="select mb-0"
              classNamePrefix="two-easy-select"
            />
          </MenuGroup>
        </MenuList>
      </Portal>
    </Menu>
  );
}