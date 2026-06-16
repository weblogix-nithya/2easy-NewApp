"use client";

import { GET_JOB_QUERY } from "@/graphql/job";
import {
  GET_JOB_PRICE_CALCULATION_DETAIL_QUERY,
  type JobPriceCalculationDetail,
} from "@/graphql/JobPriceCalculationDetail";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Link,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import React from "react";

const emptyValue = "-";

const formatDate = (value?: string | null) => {
  if (!value) return emptyValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyValue;

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value?: string | null) => {
  if (!value) return emptyValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyValue;

  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatBoolean = (value?: boolean | null) => (value ? "Yes" : "No");

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <Flex alignItems="flex-start" gap={4} mb="14px">
    <Text width={{ base: "280px", md: "380px" }} fontSize="sm" color="gray.600">
      {label}
    </Text>
    <Text
      width={{ base: "280px", md: "380px" }}
      flex="1"
      fontSize="sm"
      color="gray.900"
      whiteSpace="pre-wrap"
    >
      {value !== undefined && value !== null ? value : emptyValue}
    </Text>
  </Flex>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text fontSize="lg" fontWeight="700" color="gray.900" mb={4}>
    {children}
  </Text>
);

const AddressBlock = ({
  title,
  destination,
}: {
  title: string;
  destination: any;
}) => (
  <Box border="1px solid" borderColor="gray.200" borderRadius="8px" p={4}>
    <Text fontSize="md" fontWeight="700" mb={3}>
      {title}
    </Text>
    <DetailRow
      label="Name"
      value={
        destination?.address_business_name ||
        destination?.pick_up_name ||
        destination?.name
      }
    />
    <DetailRow label="Address" value={destination?.address} />
    <DetailRow label="Suburb" value={destination?.address_city} />
    <DetailRow label="State" value={destination?.address_state} />
    <DetailRow label="Postcode" value={destination?.address_postal_code} />
    <DetailRow
      label="Notes"
      value={destination?.notes || destination?.pick_up_notes}
    />
  </Box>
);

function CustomerEditJob() {
  const params = useParams();
  const jobId = params?.id as string | undefined;

  const { data, loading, error } = useApolloQueryWithEffect<{ job: any }>(
    GET_JOB_QUERY,
    {
      variables: { id: jobId },
      skip: !jobId,
      fetchPolicy: "network-only",
    },
  );

  const job = data?.job;
  const deliveryDestinations =
    job?.job_destinations?.filter(
      (destination: any) => !destination?.is_pickup,
    ) ?? [];

  const [priceCalculationDetail, setPriceCalculationDetail] = React.useState<
    JobPriceCalculationDetail | null
  >(null);

  const priceDetailQuery = useApolloQueryWithEffect<{
    jobPriceCalculationDetail: JobPriceCalculationDetail | null;
  }>(GET_JOB_PRICE_CALCULATION_DETAIL_QUERY, {
    variables: { job_id: Number(job?.id) },
    fetchPolicy: "network-only",
    skip: !job?.id,
    onCompleted: (data) => {
      setPriceCalculationDetail(data?.jobPriceCalculationDetail ?? null);
    },
    onError: () => {
      setPriceCalculationDetail(null);
    },
  });

  const attachmentList = React.useMemo(() => {
    const allFiles = [
      ...(job?.attachments || []),
      ...(job?.media || []),
      ...(job?.media_admin || []),
    ];
    const seen = new Set<string>();

    return allFiles.filter((file: any) => {
      const key = file.id || file.downloadable_url || file.url || file.file_name || file.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [job?.attachments, job?.media, job?.media_admin]);

  return (
    <Box pt={{ base: "130px", md: "97px", xl: "97px" }} bg="white" minH="100vh">
      <SimpleGrid
        mb="70px"
        pt="32px"
        px="24px"
        columns={{ sm: 1 }}
        spacing={{ base: "20px" }}
      >
        {loading && (
          <Flex align="center" justify="center" py={12}>
            <Text mr={3}>Loading job</Text>
            <Spinner size="sm" />
          </Flex>
        )}

        {error && (
          <Box color="red.600" py={6}>
            Unable to load this job. Please try again.
          </Box>
        )}

        {!loading && !error && !job && (
          <Box color="gray.600" py={6}>
            Job not found.
          </Box>
        )}

        {!loading && job && (
          <Stack spacing={8}>
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={3}
            >
              <Box>
                <Text fontSize="xl" fontWeight="bold" mb="5px">
                  Delivery Job #{job.name || job.id}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Reference : {job.reference_no || emptyValue}
                </Text>
              </Box>
              <Badge
                colorScheme="blue"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="6px"
              >
                {job.job_status?.name || emptyValue}
              </Badge>
            </Flex>

            <Box>
              <SectionTitle>Job Details</SectionTitle>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
                <GridItem>
                  <DetailRow label="Status" value={job.job_status?.name} />
                  <DetailRow
                    label="Job category"
                    value={job.job_category?.name}
                  />
                  <DetailRow
                    label="Transport type"
                    value={job.transport_type}
                  />
                  <DetailRow
                    label="Location"
                    value={job.transport_location || job.pick_up_state}
                  />
                  <DetailRow
                    label="Booked by"
                    value={job.booked_by || job.customer?.full_name}
                  />
                  <DetailRow label="Company" value={job.company?.name} />
                  <DetailRow label="Customer" value={job.customer?.full_name} />
                  <DetailRow
                    label="Operator phone"
                    value={job.customer?.phone_no}
                  />
                  <DetailRow
                    label="Operator email"
                    value={job.customer?.email}
                  />
                </GridItem>

                <GridItem>
                  <DetailRow
                    label="Date"
                    value={formatDate(job.ready_at || job.created_at)}
                  />
                  <DetailRow
                    label="Ready by"
                    value={formatTime(job.ready_at)}
                  />
                  <DetailRow label="Drop by" value={formatTime(job.drop_at)} />
                  <DetailRow label="Timeslot" value={job.timeslot} />
                  <DetailRow
                    label="Last free day"
                    value={formatDate(job.last_free_at)}
                  />
                  <DetailRow
                    label="Assigned driver"
                    value={job.driver?.full_name || "Not yet assigned"}
                  />
                  <DetailRow
                    label="Current suburb"
                    value={job.driver?.current_suburb}
                  />
                  <DetailRow
                    label="Timeslot depot"
                    value={job.timeslot_depots}
                  />
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            <Box>
              <SectionTitle>Addresses</SectionTitle>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
                <AddressBlock
                  title="Pickup"
                  destination={job.pick_up_destination}
                />
                {deliveryDestinations.length > 0 ? (
                  deliveryDestinations.map(
                    (destination: any, index: number) => (
                      <AddressBlock
                        key={destination.id || index}
                        title={`Delivery ${index + 1}`}
                        destination={destination}
                      />
                    ),
                  )
                ) : (
                  <AddressBlock title="Delivery" destination={null} />
                )}
              </Grid>
            </Box>

            <Box>
              <SectionTitle>Items</SectionTitle>
              {job.job_items?.length > 0 ? (
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th isNumeric>Qty</Th>
                        <Th isNumeric>Weight</Th>
                        <Th isNumeric>Volume</Th>
                        <Th>Dimensions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {job.job_items.map((item: any) => (
                        <Tr key={item.id}>
                          <Td>
                            {item.item_type?.name || item.name || emptyValue}
                          </Td>
                          <Td isNumeric>{item.quantity ?? emptyValue}</Td>
                          <Td isNumeric>{item.weight ?? emptyValue}</Td>
                          <Td isNumeric>{item.volume ?? emptyValue}</Td>
                          <Td>
                            {[
                              item.dimension_length,
                              item.dimension_width,
                              item.dimension_height,
                            ]
                              .filter(Boolean)
                              .join(" x ") || emptyValue}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Text fontSize="sm" color="gray.600">
                  No items available.
                </Text>
              )}
            </Box>

            <Box>
              <SectionTitle>Attachments</SectionTitle>
              {attachmentList.length > 0 ? (
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Document</Th>
                        <Th>Uploaded by</Th>
                        <Th>Date uploaded</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {attachmentList.map((file: any) => {
                        const downloadUrl = file.downloadable_url || file.url;
                        const actionLabel = file.downloadable_url ? "Download" : file.url ? "Open" : "No file";

                        return (
                          <Tr key={file.id || file.downloadable_url || file.url}>
                            <Td>{file.file_name || file.name || emptyValue}</Td>
                            <Td>
                              {file.uploaded_by?.full_name || file.created_by?.full_name || file.uploaded_by || emptyValue}
                            </Td>
                            <Td>{formatDate(file.created_at || file.uploaded_at)}</Td>
                            <Td>
                              {downloadUrl ? (
                                <Button
                                  as={Link}
                                  href={downloadUrl}
                                  colorScheme="blue"
                                  size="sm"
                                  variant="outline"
                                  isExternal
                                >
                                  {actionLabel}
                                </Button>
                              ) : (
                                emptyValue
                              )}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Text fontSize="sm" color="gray.600">No attachments available.</Text>
              )}
            </Box>

            <Box>
              <SectionTitle>Additional Info</SectionTitle>
              <Grid
                templateColumns={{ base: "0.5fr", lg: "1fr  1fr" }}
                gap={2}
              >
                <GridItem>
                  <DetailRow label="Pickup notes" value={job.pick_up_notes} />
                  <DetailRow
                    label="Customer notes"
                    value={job.customer_notes}
                  />
                  <DetailRow label="Base notes" value={job.base_notes} />
                  <DetailRow label="Decline notes" value={job.decline_notes} />
                </GridItem>
                <GridItem>
                  <DetailRow
                    label="Does this job require a timeslot booking through Inbound Connect?"
                    value={formatBoolean(job.is_inbound_connect)}
                  />
                  <DetailRow
                    label="Is Stackable Freight?"
                    value={formatBoolean(job.is_stackable_required)}
                  />
                  <DetailRow
                    label="Does this job require hand unloading?"
                    value={formatBoolean(job.is_hand_unloading)}
                  />
                  <DetailRow
                    label="Are there dangerous goods being transported?"
                    value={formatBoolean(job.is_dangerous_goods)}
                  />
                  <DetailRow
                    label="Is a Tail Lift vehicle required?"
                    value={formatBoolean(job.is_tailgate_required)}
                  />
                  <DetailRow
                    label="Is hard copy paperwork required?"
                    value={formatBoolean(job.is_paperwork_required)}
                  />
                </GridItem>
              </Grid>
            </Box>
            <Divider />

            {(priceCalculationDetail || priceDetailQuery.loading) && (
              <Box>
                <SectionTitle>Price Calculation Detail</SectionTitle>
                {priceDetailQuery.loading ? (
                  <Text fontSize="sm" color="gray.600">
                    Loading calculation details...
                  </Text>
                ) : priceCalculationDetail ? (
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <DetailRow
                      label="Total price"
                      value={priceCalculationDetail.total ?? emptyValue}
                    />
                    <DetailRow
                      label="Total weight"
                      value={priceCalculationDetail.total_weight ?? emptyValue}
                    />
                    <DetailRow
                      label="CBM auto"
                      value={priceCalculationDetail.cbm_auto ?? emptyValue}
                    />
                    <DetailRow
                      label="Freight"
                      value={priceCalculationDetail.freight ?? emptyValue}
                    />
                    <DetailRow
                      label="Fuel"
                      value={priceCalculationDetail.fuel ?? emptyValue}
                    />
                    <DetailRow
                      label="Tail lift"
                      value={priceCalculationDetail.tail_lift ?? emptyValue}
                    />
                    <DetailRow
                      label="Hand unload"
                      value={priceCalculationDetail.hand_unload ?? emptyValue}
                    />
                    <DetailRow
                      label="Time slot"
                      value={priceCalculationDetail.time_slot ?? emptyValue}
                    />
                    <DetailRow
                      label="Dangerous goods"
                      value={priceCalculationDetail.dangerous_goods ?? emptyValue}
                    />
                    <DetailRow
                      label="Stackable"
                      value={priceCalculationDetail.stackable ?? emptyValue}
                    />
                  </Grid>
                ) : (
                  <Text fontSize="sm" color="gray.600">
                    No price calculation detail available.
                  </Text>
                )}
              </Box>
            )}
          </Stack>
        )}
      </SimpleGrid>
    </Box>  
  );
}

export default CustomerEditJob;
