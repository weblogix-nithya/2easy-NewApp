import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  UseDisclosureProps,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { DndContext, UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Select } from "chakra-react-select";
import { showGraphQLErrorToast } from "components/toast/ToastError";
import { defaultDriver, Driver } from "graphql/driver";
import { BULK_UPDATE_JOB_MUTATION } from "graphql/job";
import { reorderArray } from "helpers/helper";
import moment from "moment";
import { useEffect, useState } from "react";

import { JobBulkAssignRow } from "./JobBulkAssignRow";
interface FilterJobsModalProps extends UseDisclosureProps {
  driverOptions: { value: number; label: string }[];
  drivers: any;
  selectedJobs: any[];
  columns: any[];
  refreshPage: any;
  setSelectedJobs: React.Dispatch<React.SetStateAction<any>>;
  setIsChecked: React.Dispatch<React.SetStateAction<any>>;
}
export default function JobBulkAssignModal({
  columns,
  isOpen,
  onClose,
  driverOptions,
  drivers,
  selectedJobs,
  refreshPage,
  setSelectedJobs,
  setIsChecked,
}: FilterJobsModalProps) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver>(defaultDriver);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const getIndex = (id: UniqueIdentifier) =>
    selectedJobs?.findIndex(
      (dynamicTableUser: any) => dynamicTableUser.id == id,
    );
  // console.log(selectedJobs, "sssss");
  const activeIndex = activeId ? getIndex(activeId) : -1;
  const totals = selectedJobs.reduce(
    (acc, job) => {
      acc.totalWeights += job.original.job.total_weight;
      acc.totalCBM += job.original.job.total_volume;
      return acc;
    },
    { totalWeights: 0, totalCBM: 0 },
  );
  const sortedBulkAssignJobs = selectedJobs.map((item, index) => {
    // console.log(item, "te");
    return {
      id: item.original.job.id,
      customer_id: item.original.job.customer.id,
      company_id: item.original.job.company.id,
      driver_id: selectedDriver.id,
      name: item.original.job.name,
      d_sort_id: Number(index + 1),
      sort_datetime: moment().format("YYYY-MM-DD HH:mm:ss"), // ⬅️ NEW
      job_type_id: item.original.job.job_type.id,
    };
  });
  // console.log(sortedBulkAssignJobs,'sortedBulkAssignJobs')
  const [handleBulkAssignJobs, {}] = useMutation(BULK_UPDATE_JOB_MUTATION, {
    variables: {
      input: sortedBulkAssignJobs,
    },
    onCompleted: () => {
      toast({
        title: "Jobs assigned",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refreshPage();
      setIsChecked(false);
      setSelectedJobs([]);
      setIsSaving(false);
      onClose();
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });
  useEffect(() => {
    setSelectedDriver(defaultDriver);
  }, [isOpen]);
  return (
    <Modal id="bulk-assign-modal" isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(1px)" />
      <ModalContent maxWidth={"80%"}>
        <ModalHeader>Filter Jobs</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowX="auto">
          <Divider />
          <Box mb={4} mt={4} maxWidth={"15%"}>
            <FormControl>
              <FormLabel>Select Driver</FormLabel>
              <Select
                options={driverOptions}
                isInvalid={isError}
                onChange={(e) => {
                  const _selectedDriver = drivers.find(
                    (driver: any) => driver.id == e.value,
                  );
                  setSelectedDriver(_selectedDriver);
                  console.log(_selectedDriver, "selectedDriver")
                }}
              ></Select>
            </FormControl>
          </Box>
          <VStack spacing={4} w="full" align="start" mb={4}>
            <Flex
              minWidth="max-content"
              alignItems="center"
              justifyContent="space-between"
              w={"full"}
            >
              <h2>Delivery Jobs</h2>
              <Text>
                Capacity: {totals.totalCBM}/{selectedDriver.no_max_volume || 0}{" "}
                cbm used
              </Text>
            </Flex>
            <Table>
              <Thead>
                <Tr>
                  {columns.map((column) => (
                    <Th key={`row-header-bulk-assign-${column.id}`}>
                      {column.Header}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                <DndContext
                  onDragStart={({ active }) => {
                    if (!active) {
                      return;
                    }
                    setActiveId(active.id);
                  }}
                  onDragEnd={({ over }) => {
                    setActiveId(null);
                    if (over) {
                      const overIndex = getIndex(over.id);
                      if (activeIndex !== overIndex) {
                        let newArray = reorderArray(
                          selectedJobs,
                          activeIndex,
                          overIndex,
                        );
                        setSelectedJobs(newArray);
                      }
                    }
                  }}
                  onDragCancel={() => setActiveId(null)}
                >
                  <SortableContext items={selectedJobs}>
                    {selectedJobs.map((item) => {
                      return (
                        <JobBulkAssignRow
                          key={item.original.job.id}
                          columns={columns}
                          item={item}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </Tbody>
            </Table>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Box w={"full"}>
            <Flex justifyContent={"space-between"}>
              <Button
                variant="outline"
                onClick={() => onClose()}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                isDisabled={isSaving}
                variant="primary"
                onClick={() => {
                  setIsError(false);
                  if (!selectedDriver?.id) {
                    setIsError(true);
                    return;
                  }
                  setIsSaving(true);
                  handleBulkAssignJobs();
                }}
                className="ml-2"
              >
                Assign Jobs
              </Button>
            </Flex>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
