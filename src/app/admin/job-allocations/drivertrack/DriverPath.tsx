"use client";

import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";

import { Box, Button, Text } from "@chakra-ui/react";
import DriverPathMap from "@/components/map/DriverPathMap";
import { DRIVER_LOGS_QUERY } from "@/graphql/route";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Point = {
  lat: number;
  lng: number;
  time: string;
  suburb?: string;
};

export default function DriverPathPage() {
  const router = useRouter();
  const [fromTime, setFromTime] = useState("05:00"); // 5 AM
  const [toTime, setToTime] = useState("18:00"); // 6 PM
  const [points, setPoints] = useState<Point[]>([]);
  const [driverId, setDriverId] = useState("1216");
  const [errorMsg, setErrorMsg] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  const [getLogs, { loading }] = useApolloLazyQueryWithEffect(
    DRIVER_LOGS_QUERY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data: any) => {
        const logs = data?.driverLogsList?.data ?? [];

        if (!logs.length) {
          setPoints([]);
          setErrorMsg(
            "Driver ID may be invalid or no records found for the selected date.",
          );
          return;
        }

        setErrorMsg("");

        const sorted = [...logs].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        const formatted: Point[] = sorted.map((log: any) => ({
          lat: log.lat,
          lng: log.lng,
          time: moment
            .utc(log.created_at, "YYYY-MM-DD HH:mm:ss")
            .local()
            .format("hh:mm A"),
          suburb: log.suburb,
        }));

        setPoints(formatted);
      },
    },
  );
  const handleLoad = (dayType: "today" | "yesterday" = "today") => {
    if (!driverId) return alert("Enter driver ID");
    const selectedDate = moment()
      .subtract(dayType === "yesterday" ? 1 : 0, "day")
      .format("YYYY-MM-DD");
    // const today = moment().format("YYYY-MM-DD");

    if (fromTime > toTime) {
      return alert("From time cannot be greater than To time");
    }

    setErrorMsg("");

    getLogs({
      variables: {
        driver_id: Number(driverId),
        first: 10000,
        page: 1,
        between_at: {
          from_at: `${selectedDate} ${fromTime}:00`,
          to_at: `${selectedDate} ${toTime}:59`,
          timezone: timezone,
        },
      },
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 🔥 TOP CONTROL PANEL */}
      <Box
        position="absolute"
        top="108px"
        left="16px"
        zIndex="1000"
        bg="white"
        p="14px"
        borderRadius="10px"
        boxShadow="lg"
        display="flex"
        flexDirection="column"
        gap="10px"
        minW="320px"
      >
        {/* 🔙 Back Button */}
        <Button size="sm" onClick={() => router.back()}>
          ← Back
        </Button>

        {/* Driver ID */}
        <Box>
          <Text fontSize="12px" mb="4px" color="gray.600">
            Driver ID
          </Text>
          <input
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            style={{
              padding: "6px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </Box>

        {/* Date Picker */}
        <Box>
          <Text fontSize="12px" mb="4px" color="gray.600">
            Time Range (Today)
          </Text>

          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <Text fontSize="11px" color="gray.400" mt="2px">
            Default: 5:00 AM – 6:00 PM
          </Text>
        </Box>

        {/* Load Button */}
        <Button
          colorScheme="blue"
          onClick={() => handleLoad("today")}
          isLoading={loading}
        >
          Load today&apos;s Route
        </Button>

        <Button
          colorScheme="blue"
          onClick={() => handleLoad("yesterday")}
          isLoading={loading}
        >
          Load yesterday&apos;s Route
        </Button>
        {/* Error Message */}
        {errorMsg && (
          <Text fontSize="12px" color="red.500">
            {errorMsg}
          </Text>
        )}
      </Box>

      {/* 🗺️ MAP */}
      {points.length > 0 && <DriverPathMap points={points} />}
    </div>
  );
}
