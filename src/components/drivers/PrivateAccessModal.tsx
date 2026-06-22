import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";

type PrivateAccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  requiredPassword?: string;
  redirectPath?: string;
};

export default function PrivateAccessModal({
  isOpen,
  onClose,
  requiredPassword,
  redirectPath = "/admin/dashboard",
}: PrivateAccessModalProps) {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const router = useRouter();

  const handleAccess = () => {
    const activePassword =
      requiredPassword || process.env.NEXT_PUBLIC_MENU_PASSWORD;

    if (password === "" || password !== activePassword) {
      setError(true);
    } else {
      resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
    router.push(redirectPath);
  };

  const resetForm = () => {
    setError(false);
    setPassword("");
    onClose();
  };

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>Password required</ModalHeader>
        <ModalBody>
          <FormControl>
            <Flex>
              <FormLabel display="flex" mb="0" fontWeight="500">
                Password (4 digits)
              </FormLabel>
            </Flex>
            <InputGroup size="md">
              <Input
                isRequired={true}
                variant="main"
                value={password}
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Password"
                onChange={(e) => {
                  setError(false);
                  setPassword(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAccess();
                  }
                }}
                name="password"
                className="max-w-md"
                fontSize="sm"
                ms={{ base: "0px", md: "0px" }}
                mb="0"
                fontWeight="500"
                size="lg"
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {error && (
              <Text fontSize="sm" color="red">
                Invalid Password.
              </Text>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleAccess} className="mr-2">
            Access
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
