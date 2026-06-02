// Chakra imports
import { useMutation } from "@apollo/client/react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  FormLabel,
  Input,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  faHandHolding,
  faInfinity,
  faTruck,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import { showGraphQLErrorToast } from "../toast/ToastError";
import { GET_JOB_QUERY, UPDATE_JOB_RIGHT_MUTATION } from "@/graphql/job";
import { GET_JOB_CATEGORIES_QUERY } from "@/graphql/jobCategories";
import {
  formatDate,
  formatDateTimeToDB,
  formatTimeUTCtoInput,
  jobStatuses,
  jobTypes,
} from "@/lib/helpers/helper";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useDispatch } from "react-redux";
import { setRightSideBarJob } from "@/lib/store/rightSideBarSlice";

import RsbJobIndicatorCircle from "./components/RsbJobIndicatorCircle";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";

const RightSideBarJob = forwardRef((props: any, ref: any) => {
  const { initJob, driverOptions } = props;

  const dispatch = useDispatch();
  const toast = useToast();
  const textColor = useColorModeValue("navy.700", "white");
  const [job, setJob] = useState(initJob);
  const [jobStartAtDate, setJobStartAtDate] = useState(
    formatDate(job.ready_at),
  );
  const [jobStartAtTime, setJobStartAtTime] = useState(
    formatTimeUTCtoInput(job.ready_at),
  );
  const [jobCategories, setJobCategories] = useState([]);

  useImperativeHandle(ref, () => ({
    onSave() {
      handleUpdateJob();
    },
  }));

  const [handleUpdateJob, { }] = useMutation(UPDATE_JOB_RIGHT_MUTATION, {
    variables: {
      input: {
        id: job.id,
        driver_id: job.driver_id,
        job_type_id: job.job_type_id,
        job_status_id: job.job_status_id,
        job_category_id: job.job_category_id,
        customer_id: job.customer_id,
        company_id: job.company_id,
        start_at: job.start_at,
        admin_notes: job.admin_notes,
      },
    },
    onCompleted: (_data) => {
      toast({
        title: "Job updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      getJob({
        variables: {
          id: job.id,
        },
      });
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const [getJob, { }] = useApolloLazyQueryWithEffect<any>(GET_JOB_QUERY, {
    // variables: {
    //   id: job.id,
    // },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data.job) {
        setJob(data.job);
        dispatch(setRightSideBarJob(data.job));
      }
    }
  });

  // GET JOB CATEGORIES QUERY.
  useApolloQueryWithEffect(GET_JOB_CATEGORIES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      const d = data as any;
      setJobCategories([]);
      d.jobCategorys.data.map((category: any) => {
        setJobCategories((jobCategories) => [
          ...jobCategories,
          {
            id: category.id,
            value: parseInt(category.id),
            label: category.name,
            name: category.name,
          },
        ]);
      });
    }
  });

  // Chakra Color Mode
  return (
    <div className="mk-right-side-bar-job">
      <h2>
        Job:{" "}
        <Link href={`/admin/jobs/${job.id}`}>
          <span className="text-[#3868d8]">#{job.name}</span>
        </Link>
      </h2>

      <Divider className="my-4" />

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Job Category
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Select
            placeholder="Select Category"
            value={jobCategories.find(
              (jobCategory) =>
                parseInt(jobCategory.id) == parseInt(job.job_category_id),
            )}
            options={jobCategories}
            onChange={(e) => {
              setJob({ ...job, job_category_id: e.id });
            }}
            size="lg"
            className="select mb-0"
            classNamePrefix="two-easy-select"
          ></Select>
        </Box>
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Type
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Select
            placeholder="Select Type"
            defaultValue={jobTypes.find(
              (jobType) => jobType.id === job.job_type_id,
            )}
            options={jobTypes}
            onChange={(e) => {
              setJob({ ...job, job_type_id: e.id });
            }}
            size="lg"
            className="select mb-0"
            classNamePrefix="two-easy-select"
          ></Select>
        </Box>
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Status
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Select
            placeholder="Select Status"
            value={jobStatuses.find(
              (jobStatus) => jobStatus.id === job.job_status_id,
            )}
            options={jobStatuses}
            onChange={(e) => {
              setJob({ ...job, job_status_id: e.id });
            }}
            size="lg"
            className="select mb-0"
            classNamePrefix="two-easy-select"
          ></Select>
        </Box>
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Customer
        </FormLabel>
        <Box className="!max-w-md w-full">
          {job.customer && (
            <Link href={`/customers/${job.customer.id}`}>
              <Text className="text-sm !font-bold text-[#3868d8]">
                {job.customer.full_name}
              </Text>
            </Link>
          )}
          {job.customer == undefined && "N/A"}
        </Box>
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Assign to
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Select
            size="lg"
            className="select mb-0"
            classNamePrefix="two-easy-select"
            placeholder="Select Driver"
            defaultValue={driverOptions.find((driverOption: any) => {
              return driverOption.value === parseInt(job.driver_id);
            })}
            options={driverOptions}
            onChange={(e) => {
              setJob({ ...job, driver_id: e.value });
            }}
          ></Select>
        </Box>
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Admin Notes
        </FormLabel>
        <Input
          isRequired={true}
          variant="main"
          value={job.admin_notes}
          onChange={(e) => setJob({ ...job, [e.target.name]: e.target.value })}
          type="text"
          name="admin_notes"
          placeholder="Admin Notes"
          className="max-w-md"
          fontSize="sm"
          ms={{ base: "0px", md: "0px" }}
          mb="0"
          fontWeight="500"
          size="lg"
        />
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Items
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Flex className="px-4 py-2 bg-[var(--chakra-colors-gray-400)]">
            <Flex flexDirection="column" flex="1">
              <p className="text-xs uppercase !font-bold text-[var(--chakra-colors-black-500)]">
                Total Qty
              </p>
              <p className="!font-bold">{job.total_quantity}</p>
            </Flex>
            <Flex flexDirection="column" flex="1">
              <p className="text-xs uppercase !font-bold text-[var(--chakra-colors-black-500)]">
                Total Weight
              </p>
              <p className="!font-bold">{job.total_weight} kg</p>
            </Flex>
            <Flex flexDirection="column" flex="1">
              <p className="text-xs uppercase !font-bold text-[var(--chakra-colors-black-500)]">
                Total Cbm
              </p>
              <p className="!font-bold">{job.total_volume.toFixed(2)}</p>
            </Flex>
          </Flex>
        </Box>
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Additions
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Flex className="px-4 py-2">
            {job.is_inbound_connect && (
              <Tooltip label="Inbound Connect">
                <FontAwesomeIcon
                  icon={faInfinity}
                  className="!text-[var(--chakra-colors-red-400)] p-1"
                  size="sm"
                />
              </Tooltip>
            )}
            {job.is_hand_unloading && (
              <Tooltip label="Handling">
                <FontAwesomeIcon
                  icon={faHandHolding}
                  className="!text-[var(--chakra-colors-red-400)] p-1"
                  size="sm"
                />
              </Tooltip>
            )}
            {job.is_dangerous_goods && (
              <Tooltip label="Dangerous goods">
                <FontAwesomeIcon
                  icon={faWarning}
                  className="!text-[var(--chakra-colors-red-400)] p-1"
                  size="sm"
                />
              </Tooltip>
            )}
            {job.is_tailgate_required && (
              <Tooltip label="Tail lift">
                <FontAwesomeIcon
                  icon={faTruck}
                  className="!text-[var(--chakra-colors-red-400)] p-1"
                  size="sm"
                />
              </Tooltip>
            )}
          </Flex>
        </Box>
      </Flex>

      <Divider className="my-4" />

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Date
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Input
            isRequired={true}
            variant="main"
            fontSize="sm"
            ms={{ base: "0px", md: "0px" }}
            type="date"
            value={jobStartAtDate}
            onChange={(e) => {
              setJobStartAtDate(e.target.value);
              setJob({
                ...job,
                start_at: formatDateTimeToDB(e.target.value, jobStartAtTime),
              });
            }}
            placeholder="date"
            className="max-w-md"
            mb="0"
            fontWeight="500"
            size="lg"
          />
        </Box>
      </Flex>

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Pickup time
        </FormLabel>
        <Box className="!max-w-md w-full">
          <Input
            isRequired={true}
            variant="main"
            fontSize="sm"
            ms={{ base: "0px", md: "0px" }}
            type="time"
            value={jobStartAtTime}
            onChange={(e) => {
              setJobStartAtTime(e.target.value);
              setJob({
                ...job,
                start_at: formatDateTimeToDB(jobStartAtDate, e.target.value),
              });
            }}
            placeholder="date"
            className="max-w-md"
            mb="0"
            fontWeight="500"
            size="lg"
          />
        </Box>
      </Flex>

      <Divider className="my-4" />

      {/* Pickup & Delivery details */}
      <div className="job-destination-card-wrap">
        {job.job_destinations.map((jobDestination: any) => {
          return (
            <Flex key={jobDestination.id} className="job-destination-card">
              <p className="text-sm w-[200px]">{jobDestination.label}</p>

              <RsbJobIndicatorCircle
                destinationStatus={jobDestination.job_destination_status_id}
              />
              <Flex className="!max-w-md w-full">
                <Flex flexDirection="column" className="w-full">
                  <Text className="text-sm">{`${jobDestination.address_line_1} ${jobDestination.address_city} ${jobDestination.address_postal_code}`}</Text>
                  {jobDestination.pick_up_name ||
                    jobDestination.pick_up_notes ? (
                    <Accordion allowMultiple variant="instructions">
                      <AccordionItem className="mb-3">
                        {({ isExpanded }) => (
                          <>
                            <AccordionButton>
                              <Flex alignItems="center">
                                <Box as="span" textAlign="left">
                                  {isExpanded ? (
                                    <p className="!font-bold">
                                      Hide Instructions
                                    </p>
                                  ) : (
                                    <p className="!font-bold">
                                      Show Instructions
                                    </p>
                                  )}
                                </Box>
                                <AccordionIcon />
                              </Flex>
                            </AccordionButton>

                            <AccordionPanel p={0}>
                              <div className="p-2 bg-[#f4f4f4] rounded-lg border">
                                <p className="text-xs mb-2">
                                  <strong>Pick up person: </strong>
                                  {`${jobDestination.pick_up_name
                                    ? jobDestination.pick_up_name
                                    : "N/A"
                                    }`}
                                </p>
                                <p className="text-xs">
                                  <strong>Pick up notes: </strong>
                                  {`${jobDestination.pick_up_notes
                                    ? jobDestination.pick_up_notes
                                    : "N/A"
                                    }`}
                                </p>
                              </div>
                            </AccordionPanel>
                          </>
                        )}
                      </AccordionItem>
                    </Accordion>
                  ) : null}
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </div>

      <Divider className="my-4" />

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Delivery notes
        </FormLabel>
        <Box className="!max-w-md w-full">
          <p className="text-sm">
            {job.pick_up_notes ? job.pick_up_notes : "N/A"}
          </p>
        </Box>
      </Flex>

      <Divider className="my-4" />

      <Flex alignItems="center" mb="16px">
        <FormLabel
          className="!flex !mb-0 w-[200px] font-semibold !text-sm"
          color={textColor}
        >
          Base notes
        </FormLabel>
        <Box className="!max-w-md w-full">
          <p className="text-sm">{job.base_notes ? job.base_notes : "N/A"}</p>
        </Box>
      </Flex>

      <Divider className="my-4" />

      <FormLabel
        className="!flex !mb-[2px] w-[200px] font-semibold !text-sm"
        color={textColor}
      >
        Item details
      </FormLabel>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th className="!pl-0">Item type</Th>
              <Th>Dimensions</Th>
              <Th>Quantity</Th>
              <Th>Weight</Th>
              <Th>CBM</Th>
            </Tr>
          </Thead>
          <Tbody>
            {job.job_items.map((jobItem: any) => {
              return (
                <Tr key={jobItem.id}>
                  <Td className="!pl-0">{jobItem.item_type.name || "N/A"}</Td>
                  <Td>{`${(jobItem.dimension_height * 100).toFixed(0)}cm x ${(
                    jobItem.dimension_width * 100
                  ).toFixed(0)}cm x ${(jobItem.dimension_depth * 100).toFixed(
                    0,
                  )}cm`}</Td>
                  <Td>{jobItem.quantity}</Td>
                  <Td>{`${jobItem.weight}kg`}</Td>
                  <Td>
                    {(
                      jobItem.volume ||
                      jobItem.dimension_height *
                      jobItem.dimension_width *
                      jobItem.dimension_depth
                    ).toFixed(2)}
                    cbm
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
});

RightSideBarJob.displayName = "RightSideBarJob";
export default RightSideBarJob;
