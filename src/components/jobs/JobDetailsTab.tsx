import { useMutation } from "@apollo/client/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Divider,
  Flex,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Toast,
} from "@chakra-ui/react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AreYouSureAlert from "../alert/AreYouSureAlert";
import CustomInputField from "../fields/VCustomInputField";
import Time12HourPicker from "../fields/Time12HourPickerCreateJob";
import TogglePill from "../fields/TogglePill";
import FileInput from "../fileInput/FileInput";
import JobAddressesSection from "../jobs/JobAddressesNewSection";
import JobUrgencyToggle from "../jobs/JobUrgencyToggle";
import PaginationTable from "../table/PaginationTable";
import TagsInput from "../tagsInput";
import { UPDATE_JOB_MUTATION } from "@/graphql/job";
import React, { useState } from "react";

import JobInputTable from "./JobInputTable";

const JobDetailsTab = ({
  isAdmin,
  job,
  setJob,
  deleteReason,
  setDeleteReason,
  jobStatuses,
  jobCategories,
  drivers,
  companiesOptions,
  customerOptions,
  customerSelected,
  jobCcEmailTags,
  handleJobCcEmailsChange,
  handleJobCcEmailAdd,
  handleJobCcEmailRemove,
  jobDateAt,
  setJobDateAt,
  readyAt,
  setReadyAt,
  dropAt,
  setDropAt,
  jobTypeOptions,
  _refinedData,
  setRefinedData,
  today,
  setIsSameDayJob,
  setIsTomorrowJob,
  savedAddressesSelect,
  pickUpDestination,
  setPickUpDestination,
  getCustomerAddresses,
  jobDestinations,
  handleJobDestinationChanged,
  addToJobDestinations,
  handleRemoveFromJobDestinations,
  quoteCalculationRes,
  buttonText,
  downloadQuotePdf,
  isDownloading,
  handleSaveJobPriceCalculation,
  handleBTypeReferenceChange,
  filtereddepotOptions,
  setFilteredDepotOptions,
  setSelectedDepot,
  sendFreightData,
  jobItems,
  addToJobItems,
  handleRemoveFromJobItems,
  handleJobItemChanged,
  itemsTableColumns,
  itemTypes,
  getJob,
  _updatingMedia,
  setUpdatingMedia,
  handleDeleteMedia,
  jobLoading,
  attachmentColumns,
  handleDeleteJob,
  onChangeCustomerSearchQuery,
  onChangeSearchQuery,
  textColorSecodary,
  depotOptions,
  _setDepotOptions,
}) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDeleteWithReason = async () => {
    if (!deleteReason.trim()) {
      Toast({
        title: "Please enter delete reason",
        status: "error",
        duration: 2000,
      });
      return;
    }

    try {
      await handleUpdateJob({
        variables: {
          input: {
            id: job.id,
            name: job.name,
            job_type_id: job.job_type_id,
            company_id: job.company_id,
            customer_id: job.customer_id,
            delete_reason: deleteReason,
          },
        },
      });

      await handleDeleteJob();

      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
  const [handleUpdateJob] = useMutation(UPDATE_JOB_MUTATION);

  const openDeleteModal = () => {
    setIsDeleteOpen(true);
  };
  const handleClose = () => {
    setDeleteReason("");
    setIsDeleteOpen(false);
  };
  return (
    <Box mt={10}>
      { }
      {isAdmin && (
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="12px"
          p="20px"
          mb="20px"
        >
          <SimpleGrid columns={{ base: 1, md: 4 }} spacingX="20px" spacingY="0px">
            <CustomInputField
              isSelect={true}
              optionsArray={jobStatuses}
              label="Job Status:"
              value={
                jobStatuses.find(
                  (job_status) => job_status.value == job.job_status_id,
                ) ?? undefined
              }
              placeholder=""
              onChange={(e) => {
                setJob((prev) => ({
                  ...prev,
                  job_status_id: e?.value ?? null,
                }));
              }}
            />
            <CustomInputField
              isSelect={true}
              optionsArray={drivers}
              label="Assigned to:"
              onInputChange={(e) => {
                onChangeCustomerSearchQuery(e);
              }}
              value={
                job.driver_id != null
                  ? drivers.find((driver) => driver.value == job.driver_id)
                  : null
              }
              placeholder=""
              onChange={(e) => {
                setJob((prev) => ({
                  ...prev,
                  driver_id: e?.value ?? null,
                }));
              }}
            />
            <CustomInputField
              isSelect={true}
              optionsArray={jobCategories}
              label="Job category:"
              value={
                jobCategories.find((c) => c.value == job.job_category_id) ??
                undefined
              }
              placeholder=""
              onChange={(e) => {
                const selectedCategory = e.value;
                const selectedCategoryName = jobCategories.find(
                  (job_category) => job_category.value === selectedCategory,
                )?.label;
                setJob((prev) => ({
                  ...prev,
                  job_category_id: selectedCategory,
                }));
                setRefinedData((prev) => ({
                  ...prev,
                  freight_type: selectedCategoryName || null,
                }));
              }}
            />

            {(job.job_category_id == 1 || job.job_category_id == 2) && (
              <>
                { }
                <CustomInputField
                  key="transport_typeKey"
                  isSelect={true}
                  optionsArray={[
                    { value: "import", label: "Import" },
                    { value: "export", label: "Export" },
                  ]}
                  label="Transport Type"
                  name="transport_type"
                  value={[
                    { value: "import", label: "Import" },
                    { value: "export", label: "Export" },
                  ].find((_e) => _e.value == job.transport_type)}
                  placeholder=""
                  onChange={(e) => {
                    setJob((prev) => ({ ...prev, transport_type: e.value }));
                    setRefinedData((prev) => ({
                      ...prev,
                      transport_type: e.value,
                    }));
                  }}
                />

                <Box>
                  <Flex align="baseline" mb="4px">
                    <FormLabel
                      mb="0"
                      fontSize="sm"
                      fontWeight="500"
                    >
                      Location
                    </FormLabel>

                    <Text color="red.500" fontSize="xs" ml="8px">
                      (Note: For LCL and Airfreight Only)
                    </Text>
                  </Flex>
                  <CustomInputField
                    key="locationKey"
                    isSelect={true}
                    optionsArray={[
                      { value: "VIC", label: "Victoria" },
                      { value: "QLD", label: "Queensland" },
                    ]}
                    // label="Location"
                    name="transport_location"
                    value={[
                      { value: "VIC", label: "Victoria" },
                      { value: "QLD", label: "Queensland" },
                    ].find((_e) => _e.value == job.transport_location)}
                    placeholder=""
                  />
                </Box>
              </>
            )}
            {isAdmin && (
              <CustomInputField
                isSelect={true}
                optionsArray={companiesOptions}
                label="Company:"
                onInputChange={(e) => {
                  onChangeSearchQuery(e);
                }}
                value={companiesOptions.find(
                  (entity) => entity.value == job.company_id,
                )}
                placeholder=""
                isDisabled={true}

              />
            )}
            <CustomInputField
              isSelect={true}
              optionsArray={customerOptions}
              label="Customer:"
              value={
                customerOptions.find(
                  (entity) => entity.value == job.customer_id,
                ) || { value: null, label: "" }
              }
              placeholder=""
              onChange={(e) => {
                setJob((prev) => ({
                  ...prev,
                  customer_id: e.value || null,
                }));

                const selectedCustomer = customerOptions.find(
                  (option) => option.value === e.value,
                )?.entity;

                if (selectedCustomer) {
                  getCustomerAddresses();
                }
              }}
            />

            <CustomInputField
              label="Operator phone:"
              placeholder=""
              isDisabled={true}
              name="operator_phone"
              value={customerSelected.phone_no ?? ""}
              onChange={
                (_e) => { }
              }
            />
            <CustomInputField
              label="Operator email:"
              placeholder=""
              name="operator_email"
              isDisabled={true}
              value={customerSelected.email ?? ""}
              onChange={
                (_e) => { }
              }
            />

            <Box>
              <FormLabel fontSize="sm" fontWeight="500" mb="8px">
                Additional email notification to:
              </FormLabel>
              <TagsInput
                tags={jobCcEmailTags}
                onTagsChange={handleJobCcEmailsChange}
                onTagAdd={handleJobCcEmailAdd}
                onTagRemove={handleJobCcEmailRemove}
                wrapProps={{
                  direction: "column",
                  align: "start",
                  width: "100%",
                }}
                wrapItemProps={(isInput) =>
                  isInput ? { alignSelf: "stretch" } : null
                }
              />
            </Box>

            <CustomInputField
              label="Date:"
              type={"date"}
              placeholder=""
              name="job_date_at"
              value={jobDateAt ?? ""}
              onChange={(e) => {
                setJobDateAt(e.target.value);
                setIsSameDayJob(today === e.target.value);
                setIsTomorrowJob(
                  new Date(e.target.value).toDateString() ===
                  new Date(
                    new Date(today).setDate(new Date(today).getDate() + 1),
                  ).toDateString(),
                );
              }}
            />

            <CustomInputField
              label="Ready by:"
              type={"time"}
              placeholder=""
              name="ready_at"
              value={readyAt ?? ""}
              onChange={(e) => {
                setReadyAt(e.target.value);
                setJob((prev) => ({
                  ...prev,
                  ready_at: new Date(
                    `${jobDateAt} ${e.target.value}`,
                  ).toISOString(),
                  drop_at: new Date(`${jobDateAt} ${dropAt}`).toISOString(),
                }));
              }}
            />

            <CustomInputField
              label="Drop by:"
              type={"time"}
              placeholder=""
              name="drop_at"
              value={dropAt ?? ""}
              onChange={(e) => {
                setDropAt(e.target.value);
                setJob((prev) => ({
                  ...prev,
                  ready_at: new Date(`${jobDateAt} ${readyAt}`).toISOString(),
                  drop_at: new Date(
                    `${jobDateAt} ${e.target.value}`,
                  ).toISOString(),
                }));
              }}
            />
            { }

            <Box>
              <FormLabel fontSize="sm" fontWeight="500" mb="8px">
                Timeslot:
              </FormLabel>
              <Time12HourPicker
                value={job.timeslot}
                onChange={(val) =>
                  setJob((prev) => ({
                    ...prev,
                    timeslot: val,
                  }))
                }
                mode="full"
              />
            </Box>
            <CustomInputField
              label="Last Free Day:"
              type={"date"}
              placeholder=""
              name="last_free_at"
              value={job.last_free_at ?? ""}
              onChange={(e) => {
                const value = e.target.value == "" ? null : e.target.value;
                setJob((prev) => ({
                  ...prev,
                  [e.target.name]: value,
                }));
              }}
            />

            <CustomInputField
              label="Reference:"
              placeholder=""
              name="reference_no"
              value={job.reference_no ?? ""}
              onChange={(e) =>
                setJob((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />
            <CustomInputField
              label="B Type Reference:"
              placeholder="B Type Reference"
              name="b_reference_no"
              value={job.b_reference_no}
              onChange={handleBTypeReferenceChange}
            />

            <CustomInputField
              label="Booked By:"
              placeholder=""
              name="booked_by"
              value={job.booked_by ?? ""}
              onChange={(e) =>
                setJob((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />

            <CustomInputField
              isInput
              label="Quoted Price (Buy Price)"
              placeholder=""
              name="quoted_price"
              value={job.quoted_price ?? ""}
              onChange={(e) =>
                setJob((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />
          </SimpleGrid>
        </Box>
      )}
      <Box mb="16px">
        <Flex justifyContent="space-between" alignItems="flex-start" mb="12px" gap="16px">
          <Text fontSize="md" fontWeight="600" color="gray.600">
            Job Requirements
          </Text>
          {!job?.is_stackable_required && (
            <Alert
              status="warning"
              borderRadius="md"
              bg="white"
              border="1px solid"
              borderColor="orange.300"
              maxW="520px"
              py="6px"
              px="10px"
            >
              <AlertIcon color="orange.400" boxSize="16px" />
              <AlertTitle fontSize="sm" fontWeight="500" color="orange.600">
                Non-stackable freight may be subject to a higher rate on the final invoice
              </AlertTitle>
            </Alert>
          )}
        </Flex>

        <Flex wrap="wrap" gap="12px" align="center">
          <TogglePill
            label="Timeslot Required"
            isActive={job.is_inbound_connect === true}
            onClick={() => {
              setJob((prev) => ({
                ...prev,
                is_inbound_connect: !(prev.is_inbound_connect === true),
              }));
              const selectedStateCode =
                job.pick_up_state == "Victoria"
                  ? "VIC"
                  : job.pick_up_state == "Queensland"
                    ? "QLD"
                    : "";
              const filtereddepotOption = depotOptions.filter(
                (option) => option.state_code == selectedStateCode,
              );
              setFilteredDepotOptions(filtereddepotOption);
            }}
          />

          {(job.job_category_id == 1 || job.job_category_id == 2) &&
            job.is_inbound_connect === true && (
              <Box minW="270px" mt="4px" height="42px">
                <CustomInputField
                  isSelect={true}
                  showLabel={false}
                  isDisabled={!isAdmin}
                  optionsArray={filtereddepotOptions}
                  value={
                    filtereddepotOptions.find(
                      (option: any) => option.value === job.timeslot_depots,
                    ) || null
                  }
                  placeholder="Select a depot"
                  onChange={(e) => {
                    setSelectedDepot(e.value);
                    setRefinedData((prevData) => ({
                      ...prevData,
                      timeslot_depots: e.value,
                    }));
                    setJob((prev) => ({
                      ...prev,
                      timeslot_depots: e.value,
                    }));
                    sendFreightData();
                  }}
                />
              </Box>
            )}

          <TogglePill
            label="Hand Unloading"
            isActive={job.is_hand_unloading === true}
            onClick={() => {
              setJob((prev) => ({
                ...prev,
                is_hand_unloading: !prev.is_hand_unloading,
              }));
            }}
          />

          <TogglePill
            label="DG Dangerous Goods"
            isActive={job.is_dangerous_goods === true}
            onClick={() => {
              setJob((prev) => ({
                ...prev,
                is_dangerous_goods: !prev.is_dangerous_goods,
              }));
            }}
          />

          <TogglePill
            label="Tailgate Required"
            isActive={job.is_tailgate_required === true}
            onClick={() => {
              setJob((prev) => ({
                ...prev,
                is_tailgate_required: !prev.is_tailgate_required,
              }));
            }}
          />

          <TogglePill
            label="Hard Copy Paperwork"
            isActive={job.is_paperwork_required === true}
            onClick={() => {
              setJob((prev) => ({
                ...prev,
                is_paperwork_required: !prev.is_paperwork_required,
              }));
            }}
          />

          <TogglePill
            label="Non Stackable Freight"
            isActive={!job?.is_stackable_required}
            onClick={() => {
              setJob((prev) => ({
                ...prev,
                is_stackable_required: !prev.is_stackable_required,
              }));
            }}
          />
        </Flex>
      </Box>
      <Divider className="my-6" />
      <Box mb="16px">
        <h2 className="mb-4">Addresses</h2>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacingX="12px" spacingY="12px" >
          <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="12px" p="20px">
            <h4 style={{ marginBottom: "20px" }}>Pickup Information</h4>
            {isAdmin && (
              <JobAddressesSection
                isAdmin={isAdmin}
                entityModel={job}
                savedAddressesSelect={savedAddressesSelect}
                defaultJobDestination={pickUpDestination}
                onAddressSaved={(_hasChanged) => {
                  getCustomerAddresses();
                }}
                jobDestinationChanged={(jobDestination) => {
                  setPickUpDestination((prev) => {
                    if (!jobDestination?.address && prev?.address) {
                      return prev;
                    }
                    return {
                      ...prev,
                      ...jobDestination,
                      ...{ is_pickup: true },
                    };
                  });
                  if (jobDestination?.address) {
                    setJob((prev) => ({
                      ...prev,
                      ...{
                        pick_up_lng: jobDestination.lng,
                        pick_up_lat: jobDestination.lat,
                        pick_up_address: jobDestination.address,
                        pick_up_notes: jobDestination.notes,
                        pick_up_name: jobDestination.name,
                        pick_up_report: jobDestination.report,
                      },
                    }));
                  }
                }}
              />
            )}
          </Box>

          {jobDestinations.map((jobDestination, index) => {
            return (
              <Box
                key={jobDestination.id}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="12px"
                p="20px"
              >
                <Flex justifyContent="space-between" alignItems="center" mb="12px">
                  <h4 style={{ margin: 0 }}>Delivery Address {index + 1}</h4>
                  {jobDestinations.length > 1 && isAdmin && (
                    <Button
                      bg="white"
                      className="!text-[var(--chakra-colors-black-400)] !py-2 !px-3 !h-[unset]"
                      onClick={() => {
                        handleRemoveFromJobDestinations(index);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrashCan}
                        className="!text-[var(--chakra-colors-black-400)]"
                      />
                    </Button>
                  )}
                </Flex>
                {isAdmin && (
                  <JobAddressesSection
                    isAdmin={isAdmin}
                    entityModel={job}
                    savedAddressesSelect={savedAddressesSelect}
                    defaultJobDestination={jobDestination}
                    jobDestinationChanged={(jobDestination) => {
                      handleJobDestinationChanged(jobDestination, index);
                    }}
                    onAddressSaved={(_hasChanged) => {
                      getCustomerAddresses();
                    }}
                  />
                )}
              </Box>
            );
          })}
        </SimpleGrid>

        {isAdmin && (
          <Box mt="16px">
            <Button
              variant="secondary"
              onClick={() => {
                addToJobDestinations();
              }}
            >
              + Add delivery location
            </Button>
          </Box>
        )}
      </Box>

      <JobUrgencyToggle
        label="Job Type(Urgency)"
        optionsArray={jobTypeOptions}
        value={
          jobTypeOptions?.find((jobType) => jobType.value === job.job_type_id) ||
          null
        }
        onChange={(e) => {
          setJob((prev) => ({
            ...prev,
            job_type_id: e.value || null,
          }));
          setRefinedData((prev) => ({
            ...prev,
            service_choice: e?.label ?? null,
          }));
        }}
      />
      <Divider className="my-12" />

      <Box mb="16px" mt={4}>
        <Flex justify="space-between" align="center" mb="37px">
          <h3 className="">Items</h3>
          <Button
            hidden={!isAdmin}
            variant="secondary"
            onClick={() => {
              addToJobItems();
            }}
          >
            + Add item
          </Button>
        </Flex>
        {isAdmin && (
          <Box>
            <JobInputTable
              columns={itemsTableColumns}
              data={jobItems}
              optionsSelect={itemTypes}
              onRemoveClick={(index) => {
                handleRemoveFromJobItems(index);
              }}
              onValueChanged={handleJobItemChanged}
            />

            { }
          </Box>
        )}
        <Box
          mt={4}
          p={3}
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          backgroundColor="gray.50"
        >
          { }
          <Flex justify="flex-end" align="center" mb={2}>
            <Text fontSize="sm" fontWeight="500" color="gray.700" pl={4}>
              CBM Auto&nbsp;:&nbsp;
            </Text>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="blue.600"
              textAlign="right"
              pr={4}
            >
              {quoteCalculationRes.cbm_auto ?? 0}
            </Text>
          </Flex>

          { }
          <Flex justify="flex-end" align="center">
            <Text fontSize="sm" fontWeight="500" color="gray.700" pl={4}>
              Total Weight&nbsp;:&nbsp;
            </Text>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="blue.600"
              textAlign="right"
              pr={4}
            >
              {quoteCalculationRes.total_weight ?? 0}
            </Text>
          </Flex>
        </Box>
      </Box>
      { }
      <Divider />
      <Box>
        <h3 className="mb-6">Attachments</h3>
        {isAdmin && (
          <Flex width="100%" className="mb-6">
            <FileInput
              entity="Job"
              entityId={job.id}
              onUpload={() => {
                getJob();
                setUpdatingMedia(true);
              }}
              description="Browse or drop your files here to upload"
              height="80px"
              bg="primary.100"
            ></FileInput>
          </Flex>
        )}

        { }
        {!jobLoading && Array.isArray(job?.media_admin) && (
          <PaginationTable
            columns={attachmentColumns}
            data={job.media_admin}
            onDelete={(mediaId) => {
              handleDeleteMedia({
                variables: {
                  id: mediaId,
                },
              });
            }}
          />
        )}
      </Box>
      <Divider className="my-12" />
      { }
      <Box mb="16px">
        <h3 className="mb-5">Additional Info</h3>
        {isAdmin && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacingX="32px" spacingY="8px" mb="16px">
            <CustomInputField
              isTextArea={true}
              label="Customer Notes"
              placeholder=""
              extra="Visible to driver"
              name="customer_notes"
              value={job.customer_notes}
              onChange={(e) =>
                setJob((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />
            <CustomInputField
              isTextArea={true}
              label="Admin notes"
              placeholder="Admin notes"
              name="admin_notes"
              value={job.admin_notes ?? ""}
              onChange={(e) =>
                setJob((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />
            <CustomInputField
              isTextArea={true}
              label="Base notes"
              placeholder=""
              name="base_notes"
              value={job.base_notes}
              onChange={(e) =>
                setJob((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />
          </SimpleGrid>
        )}

        <Flex justify="flex-end">
          <Box w="320px" flexShrink={0}>
            <Flex justify="flex-end" mb="16px" gap="12px">
              <Button
                variant="outline"
                borderColor="#3b82f6"
                color="#3b82f6"
                borderRadius="8px"
                px={6}
                py={3}
                fontWeight="600"
                fontSize="sm"
                onClick={downloadQuotePdf}
                isLoading={isDownloading}
                loadingText="Downloading"
                isDisabled={isDownloading}
              >
                Download Quote
              </Button>
              <Button
                bg="#3b82f6"
                color="white"
                disabled={!isAdmin}
                _hover={{ bg: "#2563eb" }}
                _active={{
                  bg: "#2563eb",
                  transform: "scale(0.95)",
                }}
                borderRadius="8px"
                px={6}
                py={3}
                fontWeight="600"
                fontSize="sm"
                onClick={() => {
                  handleSaveJobPriceCalculation();
                }}
              >
                {buttonText}
              </Button>
            </Flex>

            {quoteCalculationRes && (
              <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="12px"
                p="20px"
              >
                <Stack spacing="10px">
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Freight

                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.freight ?? 0}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Fuel Levy
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.fuel ?? 0}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Hand Unload
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.hand_unload ?? 0}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Time Slot
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.time_slot ?? 0}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Dangerous Goods
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.dangerous_goods ?? 0}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Tail Lift
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.tail_lift ?? 0}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Stackable
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.stackable ?? 0}
                    </Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Toll Levy ({quoteCalculationRes.toll_levy_type})
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.600">
                      {quoteCalculationRes.toll_amount}
                    </Text>
                  </Flex>

                  <Divider my="4px" />

                  <Flex justify="space-between">
                    <Text fontSize="sm" fontWeight="700">
                      Total
                    </Text>
                    <Text fontSize="sm" fontWeight="700" color="blue.600">
                      {quoteCalculationRes.total ?? 0}
                    </Text>
                  </Flex>
                </Stack>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
      {isAdmin && (
        <Box>
          <Divider className="mt-12 mb-6" />

          <Flex alignItems="center" className="mb-8">
            <AreYouSureAlert onDelete={openDeleteModal}></AreYouSureAlert>
          </Flex>
        </Box>
      )}{" "}
      <Modal isOpen={isDeleteOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Job</ModalHeader>

          <ModalBody>
            <Textarea
              placeholder="Enter delete reason..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={handleClose}>
              Cancel
            </Button>

            <Button
              colorScheme="red"
              onClick={handleDeleteWithReason}
              isDisabled={!deleteReason.trim()}
            >
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default JobDetailsTab;