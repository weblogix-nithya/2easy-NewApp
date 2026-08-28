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
import {
  BULK_UPDATE_JOB_MUTATION,
  GET_PREALLOCATED_JOBS_BY_DRIVER_QUERY,
} from "@/graphql/job";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

import { JobBulkAssignRow } from "./PreJobBulkAssignRow";

const GRID_TEMPLATE_COLUMNS = "40px 120px 90px 170px 380px 380px 110px";

function formatDate(date: Date, isStart: boolean): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} ${isStart ? "00:00:00" : "23:59:59"}`;
}

interface FilterJobsModalProps extends UseDisclosureProps {
  driver: any;
  isOpen: boolean;
  onClose: () => void;
  columns: any[];
  setSelectedJobs: React.Dispatch<React.SetStateAction<any>>;
  setIsChecked: React.Dispatch<React.SetStateAction<any>>;
  rangeDate?: [Date, Date];
}

function AssignJobsModalBase({
  columns,
  isOpen,
  onClose,
  setSelectedJobs,
  setIsChecked,
  driver,
  rangeDate,
}: FilterJobsModalProps) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localJobs, setLocalJobs] = useState<any[]>([]);
  const localJobsRef = useRef<any[]>([]);

  localJobsRef.current = localJobs;

  const driverIdForQuery = parseInt(String(driver?.value ?? driver?.id), 10);

  const { refetch: fetchDriverJobs, loading } = useApolloQueryWithEffect(
    GET_PREALLOCATED_JOBS_BY_DRIVER_QUERY,
    {
      fetchPolicy: "network-only",
      skip: !isOpen || !driverIdForQuery,
      variables: {
        preallocation_driver_id: driverIdForQuery || undefined,
        first: 20,
        page: 1,
        orderBy: [{ column: "d_sort_id", order: "ASC" }],
      },
      onCompleted: (data: any) => {
        const jobs = data?.jobs?.data ?? [];
        setLocalJobs(
          jobs.map((job: any) => ({
            id: String(job.id),
            original: { job },
          })),
        );
      },
      onError: (error: any) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  // Fetch only when the modal opens or driver/date changes.
  useEffect(() => {
    if (!isOpen || !driver) {
      if (!isOpen) setLocalJobs([]);
      return;
    }

    const driverId = parseInt(String(driver?.value ?? driver?.id), 10);
    if (!driverId) return;

    fetchDriverJobs({
      variables: {
        preallocation_driver_id: driverId,
        between_at: rangeDate?.[0]
          ? {
            from_at: formatDate(rangeDate[0], true),
            to_at: formatDate(rangeDate[1], false),
          }
          : undefined,
        orderBy: [{ column: "d_sort_id", order: "ASC" }],
        first: 20,
        page: 1,
      },
    });
  }, [isOpen, driver?.id, driver?.value, fetchDriverJobs, driver, rangeDate]);

  const buildPayload = useCallback(() => {
    const driverId = parseInt(String(driver?.value ?? driver?.id), 10);
    if (!driverId) return [];

    const sortDatetime = moment().format("YYYY-MM-DD HH:mm:ss");

    return localJobsRef.current.map((item, index) => {
      const job = item?.original?.job;
      return {
        id: job?.id,
        customer_id: job?.customer?.id,
        company_id: job?.company?.id,
        driver_id: driverId,
        preallocation_driver_id: null,
        name: job?.name,
        d_sort_id: index + 1,
        sort_datetime: sortDatetime,
        job_type_id: job?.job_type_id ?? job?.job_type?.id,
      };
    });
  }, [driver?.id, driver?.value]);

  const [handleBulkAssignJobs] = useMutation(BULK_UPDATE_JOB_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Jobs assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsChecked(false);
      setSelectedJobs([]);
      setLocalJobs([]);
      setIsSaving(false);
      onClose();
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
      setIsSaving(false);
    },
  });

  const handleSave = useCallback(() => {
    if (isSaving) return;
    if (!localJobsRef.current.length) return;
    setIsSaving(true);
    handleBulkAssignJobs({ variables: { input: buildPayload() } });
  }, [isSaving, handleBulkAssignJobs, buildPayload]);

  return (
    <Modal id="bulk-assign-modal" isCentered isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(1px)" />

      <ModalContent maxWidth="85%">
        <ModalHeader>
          <Text m="4">
            Pre-Allocated Jobs{driver?.label ? ` - ${driver.label}` : ""}
          </Text>
          <Divider />
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody p="4">
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="lg" />
            </Box>
          ) : localJobs.length === 0 ? (
            <Box textAlign="center" py={10} color="gray.500">
              No jobs assigned to this driver.
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
              Save Order ({localJobs.length})
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
    prev.driver?.id === next.driver?.id &&
    prev.driver?.value === next.driver?.value &&
    prev.rangeDate?.[0] === next.rangeDate?.[0] &&
    prev.rangeDate?.[1] === next.rangeDate?.[1] &&
    prev.columns === next.columns
  );
}

const AssignJobsModal = React.memo(AssignJobsModalBase, areEqual);

export default AssignJobsModal;