import { useMutation } from "@apollo/client/react";
import { CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Checkbox,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input,
    Link,
    SimpleGrid,
    Text,
    useToast,
    VStack
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { UPDATE_JOB_MUTATION } from "@/graphql/job";
import {
    ASSIGN_META_TO_JOB_MUTATION,
    GET_JOB_META_LIST_QUERY,
    JobMeta,
    JobMetaListData,
} from "@/graphql/jobMeta";
import { GET_JOB_STATUSES_QUERY } from "@/graphql/jobStatus";
import { formatDate, formatDateTimeToDB, formatTimeUTCtoInput, today } from "@/lib/helpers/helper";
import React, { useEffect, useRef, useState } from "react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

type DriverOption = { value: string | number; label: string };
type StatusOption = { value: string; label: string };

interface JobContextMenuProps {
    job: any;
    position: { x: number; y: number };
    onClose: () => void;
    drivers: DriverOption[];
}

const MENU_WIDTH = 360;
const PADDING = 12; // gap from screen edges

const JobContextMenu: React.FC<JobContextMenuProps> = ({ job, position, onClose, drivers }) => {
    const toast = useToast();
    const menuRef = useRef<HTMLDivElement>(null);

    const [selectedDriver, setSelectedDriver] = useState<DriverOption | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>(null);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [jobStatuses, setJobStatuses] = useState<StatusOption[]>([]);

    const [jobDateAt, setJobDateAt] = useState(today);
    const [readyAt, setReadyAt] = useState("06:00");
    const [dropAt, setDropAt] = useState("17:00");

    const { data: metaData } = //  refetch: getJobMetaList
        useApolloQueryWithEffect<JobMetaListData>(
            GET_JOB_META_LIST_QUERY,
            {
                notifyOnNetworkStatusChange: true,
                onCompleted: (data) => {
                    console.log("Job Meta List:", data);
                },
            }
        );
    const { data: statusData } = //, refetch: getJobStatuses 
        useApolloQueryWithEffect(GET_JOB_STATUSES_QUERY, {
            variables: {
                query: "",
                page: 1,
                first: 100,
                orderByColumn: "id",
                orderByOrder: "ASC",
            },
            notifyOnNetworkStatusChange: true,
            onCompleted: (data: any) => {
                setJobStatuses(data?.jobStatuses?.data || []);
            },
        });

    const [assignMetaToJob] = useMutation(ASSIGN_META_TO_JOB_MUTATION);
    const [updateJobRight] = useMutation(UPDATE_JOB_MUTATION, { onError: showGraphQLErrorToast });

    const toggleLabel = (labelId: string) => {
        setSelectedLabels(prev =>
            prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
        );
    };

    const handleSave = async () => {
        try {
            await assignMetaToJob({
                variables: { input: { job_id: job.id, job_meta_ids: selectedLabels } },
            });

            const fieldsToUpdate: any = {};
            if (String(selectedDriver?.value) !== String(job.driver_id))
                fieldsToUpdate.driver_id = selectedDriver?.value || null;
            if (String(selectedStatus?.value) !== String(job.job_status?.id))
                fieldsToUpdate.job_status_id = selectedStatus?.value || null;
            if (jobDateAt && readyAt && formatDateTimeToDB(jobDateAt, readyAt) !== job.ready_at)
                fieldsToUpdate.ready_at = formatDateTimeToDB(jobDateAt, readyAt);
            if (jobDateAt && dropAt && formatDateTimeToDB(jobDateAt, dropAt) !== job.drop_at)
                fieldsToUpdate.drop_at = formatDateTimeToDB(jobDateAt, dropAt);

            if (Object.keys(fieldsToUpdate).length > 0) {
                await updateJobRight({
                    variables: {
                        input: {
                            id: job.id,
                            customer_id: job?.customer?.id,
                            company_id: job?.company?.id,
                            job_type_id: job?.job_type?.id,
                            ...fieldsToUpdate,
                        },
                    },
                });
            }

            toast({ title: "Job updated successfully", status: "success", duration: 3000, isClosable: true });
            onClose();
        } catch (e: any) {
            showGraphQLErrorToast(e);
        }
    };

    useEffect(() => {
        if (job?.driver_id) setSelectedDriver(drivers.find(d => String(d.value) === String(job.driver_id)) || null);
        if (job?.job_status) setSelectedStatus({ value: String(job.job_status.id), label: job.job_status.name });
        if (job?.meta) setSelectedLabels(job.meta.map((m: any) => String(m.id)));
        if (job?.ready_at) { setJobDateAt(formatDate(job.ready_at)); setReadyAt(formatTimeUTCtoInput(job.ready_at)); }
        if (job?.drop_at) setDropAt(formatTimeUTCtoInput(job.drop_at));
    }, [job, drivers]);

    useEffect(() => {
        if (statusData?.jobStatuses?.data)
            setJobStatuses(statusData.jobStatuses.data.map((s: any) => ({ value: String(s.id), label: s.name })));
    }, [statusData]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    // ✅ Calculate how much space is available below and above the click point
    const spaceBelow = window.innerHeight - position.y - PADDING;
    const spaceAbove = position.y - PADDING;
    const idealHeight = Math.min(600, window.innerHeight - PADDING * 2);

    // ✅ Decide: open downward or upward?
    // Prefer downward. If not enough space below, open upward.
    const openDownward = spaceBelow >= Math.min(idealHeight, 300);

    const top = openDownward
        ? position.y                                  // open below click
        : Math.max(PADDING, position.y - idealHeight); // open above click

    // ✅ maxHeight = actual remaining space in chosen direction, capped at idealHeight
    const maxHeight = openDownward
        ? Math.min(idealHeight, spaceBelow)
        : Math.min(idealHeight, spaceAbove);

    // ✅ Horizontal: shift left if overflows right edge
    const left = Math.min(position.x, window.innerWidth - MENU_WIDTH - PADDING);

    const availableLabels: JobMeta[] =
        metaData?.jobMetaList?.filter(
            (m: JobMeta) => m.type?.toLowerCase() === "label"
        ) || [];

    return (
        <Box
            ref={menuRef}
            position="fixed"
            left={`${left}px`}
            top={`${top}px`}
            bg="white"
            boxShadow="xl"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            width={`${MENU_WIDTH}px`}
            zIndex={9999}
            // ✅ Key fix: maxHeight is dynamically computed from available screen space
            maxHeight={`${maxHeight}px`}
            display="flex"
            flexDirection="column"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
        >
            {/* Sticky Header */}
            <Box px={4} pt={4} pb={3} flexShrink={0}>
                <Flex justify="space-between" align="center" mb={3}>
                    <Text fontWeight="semibold">
                        Job #{job.name}
                        <Link href={`/admin/jobs/${job.id}`} isExternal ml={1} color="blue.500">
                            <ExternalLinkIcon />
                        </Link>
                    </Text>
                    <IconButton aria-label="Close" icon={<CloseIcon />} size="xs" onClick={onClose} />
                </Flex>
                <Divider />
            </Box>

            {/* Scrollable Body */}
            <Box px={4} pb={4} overflowY="auto" flex={1}>
                <VStack spacing={4} align="stretch">
                    <FormControl>
                        <FormLabel fontSize="sm">Labels</FormLabel>
                        <SimpleGrid columns={2} spacing={1}>
                            {availableLabels.map(label => (
                                <Checkbox
                                    key={label.id}
                                    size="sm"
                                    isChecked={selectedLabels.includes(String(label.id))}
                                    onChange={() => toggleLabel(String(label.id))}
                                >
                                    <HStack spacing={2}>
                                        <Box w="12px" h="12px" borderRadius="full" bg={label.color || "gray.300"} />
                                        <Text fontSize="sm">{label.name}</Text>
                                    </HStack>
                                </Checkbox>
                            ))}
                        </SimpleGrid>
                    </FormControl>

                    <Divider />
                    <FormControl>
                        <FormLabel fontSize="sm">Job Date</FormLabel>
                        <Input type="date" size="sm" value={jobDateAt} onChange={e => setJobDateAt(e.target.value)} />
                    </FormControl>
                    <HStack spacing={2}>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">Ready By</FormLabel>
                            <Input type="time" size="sm" value={readyAt} onChange={e => setReadyAt(e.target.value)} />
                        </FormControl>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">Drop By</FormLabel>
                            <Input type="time" size="sm" value={dropAt} onChange={e => setDropAt(e.target.value)} />
                        </FormControl>
                    </HStack>

                    <Divider />
                    <HStack spacing={2}>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">Driver</FormLabel>
                            <Select options={drivers} value={selectedDriver} onChange={setSelectedDriver} placeholder="Select Driver" isClearable size="sm" />
                        </FormControl>
                        <FormControl flex={1}>
                            <FormLabel fontSize="sm">Status</FormLabel>
                            <Select options={jobStatuses} value={selectedStatus} onChange={setSelectedStatus} placeholder="Select Status" isClearable size="sm" />
                        </FormControl>
                    </HStack>

                    <Divider />
                    <HStack>
                        <Button size="sm" variant="outline" flex={1} onClick={onClose}>Cancel</Button>
                        <Button size="sm" colorScheme="blue" flex={1} onClick={handleSave}>Save</Button>
                    </HStack>
                </VStack>
            </Box>
        </Box>
    );
};

export default JobContextMenu;