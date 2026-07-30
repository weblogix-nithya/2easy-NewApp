"use client";
import { Box, Flex, Text } from "@chakra-ui/react";

function getColors(label: string, isActive: boolean) {
    const normalized = (label || "").toLowerCase().trim();

    const palette: Record<string, { border: string; bg: string; text: string }> = {
        standard: { border: "green.500", bg: "green.500", text: "white" },
        express: { border: "orange.500", bg: "orange.500", text: "white" },
        urgent: { border: "red.500", bg: "red.500", text: "white" },
    };

    const match = palette[normalized] || {
        border: "gray.400",
        bg: "gray.400",
        text: "white",
    };

    return {
        borderColor: match.border,
        bg: isActive ? match.bg : "white",
        color: isActive ? match.text : match.border,
    };
}

// Fixed display order — Standard, Express, Urgent — regardless of the
// order the backend API returns them in.
const DISPLAY_ORDER = ["standard", "express", "urgent"];

function sortByDisplayOrder(options: { value: number; label: string }[]) {
    return [...(options || [])].sort((a, b) => {
        const aIndex = DISPLAY_ORDER.indexOf((a.label || "").toLowerCase().trim());
        const bIndex = DISPLAY_ORDER.indexOf((b.label || "").toLowerCase().trim());
        const safeA = aIndex === -1 ? DISPLAY_ORDER.length : aIndex;
        const safeB = bIndex === -1 ? DISPLAY_ORDER.length : bIndex;
        return safeA - safeB;
    });
}

export default function JobUrgencyToggle({
    label = "Urgency",
    optionsArray,
    value,
    onChange,
}: {
    label?: string;
    optionsArray: { value: number; label: string }[];
    value?: { value: number; label: string } | null;
    onChange: (option: { value: number; label: string }) => void;
}) {
    const sortedOptions = sortByDisplayOrder(optionsArray);

    return (
        <Flex alignItems="center" gap="16px">
            <Text fontSize="lg" fontWeight="700" color="navy.700" flexShrink={0}>
                {label}
            </Text>
            <Flex gap="10px" wrap="wrap">
                {sortedOptions.map((opt) => {
                    const isActive = value?.value === opt.value;
                    const colors = getColors(opt.label, isActive);

                    return (
                        <Box
                            key={opt.value}
                            as="button"
                            type="button"
                            onClick={() => onChange(opt)}
                            px="18px"
                            py="8px"
                            borderRadius="8px"
                            border="2px solid"
                            borderColor={colors.borderColor}
                            bg={colors.bg}
                            color={colors.color}
                            fontSize="sm"
                            fontWeight="600"
                            cursor="pointer"
                            transition="all 0.15s"
                            _hover={{ opacity: 0.85 }}
                        >
                            {opt.label}
                        </Box>
                    );
                })}
            </Flex>
        </Flex>
    );
}