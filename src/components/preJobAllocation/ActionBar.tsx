import {
  Box,
  Button,
  Flex,
  FormLabel,
  HStack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";



type ActionBarProps = {
  selectedDriver: any;
  selectedJobs: any[];
  onSwitch: (state: boolean) => void;
  onSaveChanges?: () => void;     // ✅ callback for Save button
  // onClickBulkSort: () => void;
};

const ActionBar = ({
  selectedDriver,
  selectedJobs,
  onSwitch,
  onSaveChanges,
  // onClickBulkSort,
}: ActionBarProps) => {
  const [isSwitched, setIsSwitched] = useState<boolean>(false);

  // const totals = useMemo(
  //   () =>
  //     selectedJobs.reduce(
  //       (acc, job) => {
  //         acc.totalWeights += job?.original?.job?.total_weight ?? 0;
  //         acc.totalCBM += job?.original?.job?.total_volume ?? 0;
  //         return acc;
  //       },
  //       { totalWeights: 0, totalCBM: 0 },
  //     ),
  //   [selectedJobs],
  // );
  const toast = useToast();

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
      transform="translateX(-50%)"
      zIndex={100}
    >
      {/* Switch */}
      <Box w="75%" fontWeight="500">
        <Flex align="center" borderRadius="16px">
          <Switch
            id="show-selected"
            isChecked={isSwitched}
            onChange={() => {
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
      <Box className="w-3/4 ">
        <Button
          float="right"
          px={5}
          py={1}
          variant="secondary"
          onClick={() => {
            if (!selectedDriver?.id) {
              toast({
                title: "Please select a driver.",
                status: "warning",
                duration: 3000,
                isClosable: true,
              });
              return;
            }
            if (selectedJobs.length === 0) {
              toast({
                title: "Please select jobs to pre-allocate.",
                status: "warning",
                duration: 3000,
                isClosable: true,
              });
              return;
            }
            if (!selectedDriver?.id || selectedJobs.length === 0) {
              toast({
                title: "Please select a driver and jobs to pre-allocate.",
                status: "warning",
                duration: 3000,
                isClosable: true,
              });
              return;
            }

            onSaveChanges && onSaveChanges();
          }}
          mr={3}
        >
          Pre-Allocate Jobs {"  "}
          {selectedJobs.length > 0 && <>( {selectedJobs.length} )</>}
        </Button>

        {/* <Button
          float="right"
          px={5}
          py={1}
          variant="secondary"
          onClick={onClickBulkSort}
          mr={3}
        >
          Sort Jobs {" "}
          {selectedJobs.length > 0 && <>( {selectedJobs.length} )</>}
        </Button>{" "*/}
      </Box>
      {/* Totals */}
      {/* <Box> <Text fontWeight="bold">
          Total Selected: {totals.totalWeights} kg,{" "}
          {totals.totalCBM.toFixed(2)} cbm
        </Text> </Box> */}

      {/* ✅ Save Changes Button */}
      {/* {hasChanges && (
        <Box>
          <Button
            colorScheme="blue"
            px={5}
            py={1}
            onClick={onSaveChanges}
          >
            Save Changes
          </Button>
        </Box>
      )} */}
    </HStack>
  );
};

export default React.memo(ActionBar);