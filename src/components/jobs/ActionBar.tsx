"use client"
import {
  Box,
  Button,
  Flex,
  FormLabel,
  HStack,
  Switch,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";

type ActionBarProps = {
  selectedJobs: any[];
  onSwitch: (state: boolean) => void;
  onClickBulkAssign: () => void;
  onClickBulkSort: () => void;
};

const ActionBar = <_P extends object>({
  selectedJobs,
  onSwitch,
  onClickBulkAssign,
  onClickBulkSort,
}: ActionBarProps) => {
  const [isSwitched, setIsSwitched] = useState<boolean>(false);

  const totals = selectedJobs.reduce(
    (acc, job) => {
      acc.totalWeights += job?.original?.job?.total_weight;
      acc.totalCBM += job?.original?.job?.total_volume;
      return acc;
    },
    { totalWeights: 0, totalCBM: 0 },
  );

  return (
    <HStack
      w="40%"
      minW="770px"
      position="fixed"
      bottom="5px"
      right="20px"
      bg="white"
      padding="10px"
      border="1px"
      borderColor="#E3E3E3"
      borderRadius="8px"
      boxShadow="0 2px 5px rgba(0, 0, 0, 0.1)"
      justify="space-between"
      left="50%"
      transform="translateX(-50%);"
    >
      <Box w="65%" fontWeight="500">
        <Flex align="center" borderRadius="16px">
          <Switch
            id="show-selected"
            onChange={(_e) => {
              setIsSwitched(!isSwitched);
              onSwitch(!isSwitched);
            }}
          />
          <FormLabel htmlFor="show-selected" ms="15px" mb="0px">
            <Text fontSize="md" fontWeight="500">
              Show selected only
            </Text>
          </FormLabel>
        </Flex>
      </Box>

      <Box className="w-full xl:text-center">
        <Text className="!font-bold">
          Total Selected: {totals.totalWeights}kg, {totals.totalCBM.toFixed(2)}{" "}
          cbm
        </Text>
      </Box>
      <Box className="w-1/2 ">
        <Button
          float="right"
          px={5}
          py={1}
          variant="secondary"
          onClick={onClickBulkAssign}
        >
          Bulk assign {"  "}
          {selectedJobs.length > 0 && <>( {selectedJobs.length} )</>}
        </Button>
      </Box>
      <Box className="w-1/2 ">
          <Button
            float="right"
            px={5}
            py={1}
            variant="secondary"
            onClick={onClickBulkSort}
          >
            Sort Jobs {"  "}
            {selectedJobs.length > 0 && <>( {selectedJobs.length} )</>}
          </Button>{" "}
        </Box>
    </HStack>
  );
};

export default ActionBar;
