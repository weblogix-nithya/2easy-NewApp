import { Box, Flex, Input, Text, useOutsideClick } from "@chakra-ui/react";
import React, { useRef, useState } from "react";

type Props = {
    value?: string;
    onChange: (val: string) => void;
    placeholder?: string;
    mode?: "full" | "quick";
};

export default function Time12HourPicker({
    value,
    onChange,
    placeholder = "--:-- --",
    mode = "full",
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const [hour, setHour] = useState("06");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState<"AM" | "PM">("AM");

    const minutes = ["00", "15", "30", "45"];
    const hours = Array.from({ length: 12 }, (_, i) =>
        String(i + 1).padStart(2, "0"),
    );

    useOutsideClick({
        ref,
        handler: () => setIsOpen(false),
    });

    React.useEffect(() => {
        if (!value) return;

        let cleaned = value.trim().toUpperCase();

        // 🔥 Fix dot format (7.00 AM → 7:00 AM)
        cleaned = cleaned.replace(/\./g, ":");

        // Remove extra spaces
        cleaned = cleaned.replace(/\s+/g, " ");

        // ✅ 12hr format
        const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
        if (match12) {
            setHour(match12[1].padStart(2, "0"));
            setMinute(match12[2]);
            setPeriod(match12[3] as "AM" | "PM");
            return;
        }

        // ✅ 24hr format
        const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
        if (match24) {
            let h = parseInt(match24[1], 10);
            const m = match24[2];

            const p = h >= 12 ? "PM" : "AM";
            h = h % 12 || 12;

            setHour(String(h).padStart(2, "0"));
            setMinute(m);
            setPeriod(p);
        }
    }, [value, isOpen]);

    // const handleHourSelect = (h: string) => {
    //   setHour(h);
    // };

    // const handleMinuteSelect = (m: string) => {
    //   setMinute(m);
    // };

    // const handlePeriodSelect = (p: "AM" | "PM") => {
    //   setPeriod(p);

    //   const finalValue = `${hour}:${minute} ${p}`;
    //   onChange(finalValue);

    //   setIsOpen(false); // close ONLY after AM/PM
    // };

    const commitValue = (h: string, m: string, p: "AM" | "PM") => {
        const finalValue = `${h}:${m} ${p}`;
        onChange(finalValue);
    };

    const handleHourSelect = (h: string) => {
        setHour(h);

        if (mode === "quick") {
            commitValue(h, minute, period);
        }
    };

    const handleMinuteSelect = (m: string) => {
        setMinute(m);

        if (mode === "quick") {
            commitValue(hour, m, period);
        }
    };

    const handlePeriodSelect = (p: "AM" | "PM") => {
        setPeriod(p);

        if (mode === "quick") {
            commitValue(hour, minute, p);
            setIsOpen(false);
        }

        if (mode === "full") {
            commitValue(hour, minute, p);
            setIsOpen(false);
        }
    };
    return (
        <Box position="relative" ref={ref} w="100%">
            <Flex
                border="1px solid"
                borderColor="gray.300"
                px={3}
                py={2}
                borderRadius="md"
                bg="white"
                justify="space-between"
                align="center"
            >
                <Input
                    variant="unstyled"
                    fontSize="sm"
                    value={value ?? ""}
                    placeholder={placeholder}
                    onClick={() => setIsOpen(true)}
                    onChange={(e) => {
                        const raw = e.target.value.toUpperCase();
                        onChange(raw); // let parent control value
                    }}

                />

                <Text
                    fontSize="xs"
                    color="gray.500"
                    cursor="pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    🕒
                </Text>
            </Flex>
            {/* Popup */}
            {isOpen && (
                <Box
                    position="absolute"
                    top="110%"
                    left="0"
                    bg="white"
                    shadow="lg"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.200"
                    zIndex={1000}
                    p={3}
                >
                    <Flex gap={4}>
                        {/* Hours */}
                        <Box>
                            <Flex direction="column">
                                {hours.map((h) => (
                                    <Box
                                        key={h}
                                        px={3}
                                        py={1}
                                        cursor="pointer"
                                        borderRadius="md"
                                        _hover={{ bg: "blue.50" }}
                                        bg={hour === h ? "blue.100" : undefined}
                                        onClick={() => handleHourSelect(h)}
                                        fontSize="sm"
                                    >
                                        {h}
                                    </Box>
                                ))}
                            </Flex>
                        </Box>

                        {/* Minutes */}
                        <Box>
                            {minutes.map((m) => (
                                <Box
                                    key={m}
                                    px={3}
                                    py={1}
                                    cursor="pointer"
                                    borderRadius="md"
                                    _hover={{ bg: "blue.50" }}
                                    bg={minute === m ? "blue.100" : undefined}
                                    onClick={() => handleMinuteSelect(m)}
                                    fontSize="sm"
                                >
                                    {m}
                                </Box>
                            ))}
                        </Box>

                        {/* AM / PM */}
                        <Box>
                            {["AM", "PM"].map((p) => (
                                <Box
                                    key={p}
                                    px={3}
                                    py={1}
                                    cursor="pointer"
                                    borderRadius="md"
                                    _hover={{ bg: "blue.50" }}
                                    bg={period === p ? "blue.100" : undefined}
                                    onClick={() => handlePeriodSelect(p as "AM" | "PM")}
                                    fontSize="sm"
                                >
                                    {p}
                                </Box>
                            ))}
                        </Box>
                    </Flex>
                </Box>
            )}
        </Box>
    );
}
