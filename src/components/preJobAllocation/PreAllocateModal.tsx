import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  UseDisclosureProps,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { Reorder } from "framer-motion";
import { PREALLOCATE_JOBS_MUTATION } from "@/graphql/job";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { JobBulkAssignRow } from "./PreJobBulkAssignRow";

const GRID_TEMPLATE_COLUMNS = "40px 120px 90px 170px 380px 380px 110px";

interface FilterJobsModalProps extends UseDisclosureProps {
  selectedDriver: any;
  selectedJobs: any[];
  columns: any[];
  refreshPage: any;
  setSelectedJobs: React.Dispatch<React.SetStateAction<any>>;
  setIsChecked: React.Dispatch<React.SetStateAction<any>>;
}

function PreAllocateModalBase({
  columns,
  isOpen,
  onClose,
  selectedJobs,
  refreshPage,
  selectedDriver,
}: FilterJobsModalProps) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localJobs, setLocalJobs] = useState<any[]>([]);
  const localJobsRef = useRef<any[]>([]);
  const initializedRef = useRef(false);

  localJobsRef.current = localJobs;

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      setLocalJobs([]);
      return;
    }
    if (initializedRef.current) return;
    setLocalJobs(selectedJobs.map((job: any) => job));
    initializedRef.current = true;
  }, [isOpen, selectedJobs]);

  const buildPayload = useCallback(() => {
    const driverId = Number(selectedDriver?.id);
    if (!driverId) return [];

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    return localJobsRef.current.map((item, index) => {
      const job = item?.original?.job;
      return {
        id: job?.id,
        customer_id: job?.customer?.id,
        company_id: job?.company?.id,
        preallocation_driver_id: driverId,
        name: job?.name,
        d_sort_id: index + 1,
        sort_datetime: now,
        job_type_id: job?.job_type?.id ?? job?.job_type_id,
      };
    });
  }, [selectedDriver?.id]);

  const [handleBulkAssignJobs] = useMutation(PREALLOCATE_JOBS_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Jobs pre-allocated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsSaving(false);
      refreshPage();
      onClose();
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Pre-allocation error:", error);
      setIsSaving(false);
      showGraphQLErrorToast(error);
    },
  });

  const handleSave = useCallback(() => {
    if (isSaving) return;

    const driverId = Number(selectedDriver?.id);
    if (!driverId) {
      toast({
        title: "Please select a driver",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!localJobsRef.current.length) {
      toast({
        title: "No jobs selected",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    handleBulkAssignJobs({ variables: { input: buildPayload() } });
  }, [isSaving, selectedDriver?.id, handleBulkAssignJobs, buildPayload, toast]);

  return (
    <Modal
      id="bulk-assign-modal"
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(1px)" />

      <ModalContent maxWidth="85%">
        <ModalHeader>
          <Text m="4">
            Pre-Allocation Jobs
            {selectedDriver?.full_name ? ` - ${selectedDriver.full_name}` : ""}
          </Text>
          <Divider />
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody p="4">
          {localJobs.length === 0 ? (
            <Box textAlign="center" py={10} color="gray.500">
              No jobs selected.
            </Box>
          ) : (
            <VStack spacing={0} w="full" align="start" p={2} mb={2}>
              <Box
                style={{
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
                    width: "max-content",
                    minWidth: "100%",
                    borderBottom: "2px solid #E2E8F0",
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                    background: "white",
                  }}
                >
                  {columns.map((column, index) => (
                    <div
                      key={`bulk-header-${column?.id}`}
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#718096",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        position: index === 0 ? "sticky" : undefined,
                        left: index === 0 ? 0 : undefined,
                        zIndex: index === 0 ? 6 : undefined,
                        background: index === 0 ? "white" : undefined,
                        boxShadow:
                          index === 0
                            ? "2px 0 4px -2px rgba(0,0,0,0.15)"
                            : undefined,
                      }}
                    >
                      {column?.Header}
                    </div>
                  ))}
                </div>

                <Reorder.Group
                  as="div"
                  axis="y"
                  layoutScroll
                  values={localJobs}
                  onReorder={setLocalJobs}
                  style={{
                    width: "max-content",
                    minWidth: "100%",
                    maxHeight: "55vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    position: "relative",
                  }}
                >
                  {localJobs.map((item) => (
                    <JobBulkAssignRow
                      key={item?.original?.job?.id ?? item?.id}
                      columns={columns}
                      item={item}
                      gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
                    />
                  ))}
                </Reorder.Group>
              </Box>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Flex w="full" justifyContent="space-between">
            <Button variant="outline" onClick={onClose} isDisabled={isSaving}>
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleSave}
              isDisabled={isSaving || localJobs.length === 0}
            >
              {isSaving && <Spinner size="sm" mr={2} />}
              Pre-Allocate Jobs ({localJobs.length})
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function areEqual(prev: FilterJobsModalProps, next: FilterJobsModalProps) {
  return (
    prev.isOpen === next.isOpen &&
    prev.selectedJobs === next.selectedJobs &&
    prev.selectedDriver?.id === next.selectedDriver?.id &&
    prev.columns === next.columns
  );
}

const PreAllocateModal = React.memo(PreAllocateModalBase, areEqual);

export default PreAllocateModal;