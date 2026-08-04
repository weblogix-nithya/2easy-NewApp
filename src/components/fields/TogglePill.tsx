"use client";
import { Button } from "@chakra-ui/react";

export default function TogglePill({
    label,
    isActive,
    onClick,
}: {
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            onClick={onClick}
            size="sm"
            borderRadius="8px"
            fontWeight="600"
            fontSize="sm"
            px="16px"
            py="10px"
            h="auto"
            border="1px solid"
            borderColor={isActive ? "blue.500" : "gray.300"}
            bg={isActive ? "blue.500" : "white"}
            color={isActive ? "white" : "gray.700"}
            _hover={{
                bg: isActive ? "blue.600" : "gray.50",
            }}
        >
            {label}
        </Button>
    );
}