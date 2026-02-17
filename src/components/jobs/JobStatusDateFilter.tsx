import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Box, Checkbox, Flex, Spinner, Text } from "@chakra-ui/react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { Select } from "chakra-react-select";
import React, { useCallback } from "react";

interface StatusOption {
  value: string;
  label: string;
  statusIds: number[];
}

interface Props {
  statusOptions: StatusOption[];
  onStatusChange: (option: StatusOption) => void;
  rangeDate: [Date, Date] | null;
  setRangeDate: (range: [Date, Date] | null) => void;
  selectedStatus: StatusOption | null;
  withMedia: boolean;
  handleToggleWithMedia: (e: React.ChangeEvent<HTMLInputElement>) => void; // Function to handle checkbox toggle
  isMediaBusy?: boolean; // Optional prop to indicate if media is busy
}

const JobStatusDateFilter = ({
  statusOptions,
  onStatusChange,
  rangeDate,
  setRangeDate,
  selectedStatus,
  withMedia,
  handleToggleWithMedia,
  isMediaBusy,
}: Props) => {
  const handleRangeChange = useCallback(
    (range: any) => {
      if (Array.isArray(range) && range[0] && range[1]) {
        setRangeDate(range as [Date, Date]);
      } else {
        setRangeDate(null);
      }
    },
    [setRangeDate],
  );

  return (
    <Flex>
      <Box width="300px">
        <Select
          options={statusOptions}
          // defaultValue={statusOptions?.[0] ?? null}
          value={selectedStatus}
          onChange={(value: any) => onStatusChange(value)}
          placeholder="Select Status"
          className="basic-single"
          classNamePrefix="select"
        />
      </Box>

      <Box
        alignItems="center"
        flexDirection="column"
        w="30%"
        maxW="max-content"
        p="10px 10px"
        h="max-content"
        ml="4"
        sx={{
          ".react-daterange-picker__wrapper": {
            border: "1px solid",
            borderColor: "#e3e3e3",
            padding: "6px",
            borderRadius: "0.375rem",
            marginTop: "-15px",
          },
        }}
      >
        {/* @ts-ignore */}
        <DateRangePicker
          value={rangeDate ?? undefined} // Use undefined if null
          onChange={handleRangeChange}
          clearIcon={<span style={{ color: "red", cursor: "pointer" }}>✕</span>}
        />
      </Box>
      <Box px={2} py={2}>
        <Flex align="center" gap={2}>
          {isMediaBusy && <Spinner size="xs" thickness="2px" />}
          <Checkbox
            id="withMediaCheckbox"
            name="withMediaCheckbox"
            isChecked={withMedia}
            onChange={handleToggleWithMedia}
            className="cursor-pointer"
          >
            <Flex align="center" fontSize="sm" color="gray.600" mt={1}>
              <InfoOutlineIcon mr={1} />
              <Text>
                Show images for <strong>Pickup Address and Name</strong> and{" "}
                <strong>Delivery Address and Name</strong>
              </Text>
            </Flex>
          </Checkbox>
        </Flex>
        <Text fontSize="xs" color="gray.500" mt={1} pl={6}>
          Hint: Loading images may take a few seconds depending on network
          speed.
        </Text>
      </Box>
    </Flex>
  );
};

export default JobStatusDateFilter;
