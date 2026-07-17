// components/tabs/JobDetailsTab.tsx
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
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Toast,
  Tr,
} from "@chakra-ui/react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AreYouSureAlert from "../alert/AreYouSureAlert";
import ColorSelect from "../fields/ColorSelect";
import CustomInputField from "../fields/CustomInputField";
import Time12HourPicker from "../fields/Time12HourPicker";
import FileInput from "../fileInput/FileInput";
import JobAddressesSection from "../jobs/JobAddressesSection";
import PaginationTable from "../table/PaginationTable";
import TagsInput from "../tagsInput";
import { UPDATE_JOB_MUTATION } from "@/graphql/job";
import { formatDate, formatTime } from "@/lib/helpers/helper";
import React, { useState } from "react";

import JobInputTable from "./JobInputTable";

const JobDetailsTab = ({
  isAdmin,
  // companyToll,
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
      // ✅ Step 1: Update job
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

      // ✅ Step 2: Delete job (THIS WAS MISSING)
      await handleDeleteJob();

      // ✅ Step 3: Close modal
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
      {/* Basic fields */}
      {isAdmin ? (
        <Box mb="16px">
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
              {/* Transport Type Select */}
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

              {/* Location Select */}
              <CustomInputField
                key="locationKey"
                isSelect={true}
                optionsArray={[
                  { value: "VIC", label: "Victoria" },
                  { value: "QLD", label: "Queensland" },
                ]}
                label="Location"
                name="transport_location"
                value={[
                  { value: "VIC", label: "Victoria" },
                  { value: "QLD", label: "Queensland" },
                ].find((_e) => _e.value == job.transport_location)}
                placeholder=""
              // onChange={(e) => {
              //   const newState = {
              //     ...refinedData,
              //     state_code: e.value,
              //     state: e.label,
              //   };
              //   setJob({ ...job, transport_location: e.value });
              //   setRefinedData(newState);
              // }}
              />
              <Text
                style={{
                  color: "red",
                  paddingLeft: "11.4rem",
                  paddingBottom: "1rem",
                  fontSize: "14px",
                }}
              >
                Note: For LCL and Airfreight Only
              </Text>
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

            // onChange={(e) => {
            //   setJob({
            //     ...job,
            //     company_id: e.value || null,
            //     customer_id: null,
            //   });
            //   getCustomersByCompanyId({
            //     query: "",
            //     page: 1,
            //     first: 100,
            //     orderByColumn: "id",
            //     orderByOrder: "ASC",
            //     company_id: e.value,
            //   });
            // }}
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
              // Update job with the selected customer ID
              setJob((prev) => ({
                ...prev,
                customer_id: e.value || null,
              }));

              // Fetch the selected customer details
              const selectedCustomer = customerOptions.find(
                (option) => option.value === e.value,
              )?.entity;

              if (selectedCustomer) {
                getCustomerAddresses(); // Re-fetch customer addresses
              }
            }}
          />

          <Flex alignItems="center" mb="16px">
            <FormLabel
              display="flex"
              mb="0"
              width="200px"
              fontSize="sm"
              fontWeight="500"
              _hover={{ cursor: "pointer" }}
            >
              <SimpleGrid columns={{ sm: 1 }}>
                <GridItem>Additional email notification to: </GridItem>
              </SimpleGrid>
            </FormLabel>
            <Box>
              <TagsInput
                tags={jobCcEmailTags}
                onTagsChange={handleJobCcEmailsChange}
                onTagAdd={handleJobCcEmailAdd}
                onTagRemove={handleJobCcEmailRemove}
                wrapProps={{
                  direction: "column",
                  align: "start",
                  width: "300px",
                }}
                wrapItemProps={(isInput) =>
                  isInput ? { alignSelf: "stretch" } : null
                }
              />
            </Box>
          </Flex>

          <CustomInputField
            label="Operator phone:"
            placeholder=""
            isDisabled={true}
            name="operator_phone"
            value={customerSelected.phone_no ?? ""}
            onChange={
              (_e) => { }
              //setJob({
              //  ...job,
              //  [e.target.name]: e.target.value,
              //})
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
              //setJob({
              //  ...job,
              //  [e.target.name]: e.target.value,
              //})
            }
          />
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
          {/* 
          <CustomInputField
            label="Timeslot:"
            placeholder=""
            name="timeslot"
            value={job.timeslot ?? ""}
            onChange={(e) =>
              setJob((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
          /> */}

          <Flex alignItems="center" mb="16px">
            <FormLabel
              width="200px"
              fontSize="sm"
              fontWeight="500"
              color="navy.700"
            >
              Timeslot:
            </FormLabel>

            <Box width="100%">
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
          </Flex>
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

          <ColorSelect
            label="Type:"
            optionsArray={jobTypeOptions}
            selectedJobId={job.job_type_id}
            value={
              job.job_type_id
                ? jobTypeOptions.find(
                  (jobType) => jobType.value == job.job_type_id,
                )
                : ""
            }
            placeholder="Select type"
            onChange={(e) => {
              const selectedType = e.value;
              const selectedTypeName = jobTypeOptions.find(
                (jobType) => jobType.value === selectedType,
              )?.label;

              setJob((prev) => ({
                ...prev,
                job_type_id: selectedType || null,
              }));

              setRefinedData((prev) => ({
                ...prev,
                service_choice: selectedTypeName || null,
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

          <CustomInputField
            isTextArea={true}
            label="Admin notes:"
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
        </Box>
      ) : (
        <Box mb="16px">
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Status:
            </Text>
            <Text fontSize="sm">{job.job_status?.name}</Text>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Job category:
            </Text>
            <Text fontSize="sm">{job.job_category?.name}</Text>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Booked by:
            </Text>

            <SimpleGrid columns={{ sm: 1 }}>
              <GridItem>
                <Text fontSize="sm">{job.customer?.full_name}</Text>
              </GridItem>
              <GridItem>
                <Text fontSize="xs" color={textColorSecodary}>
                  {job.company?.name}
                </Text>
              </GridItem>
            </SimpleGrid>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Operator phone:
            </Text>
            <Text fontSize="sm">{job.customer?.phone_no}</Text>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Operator email:
            </Text>
            <Text fontSize="sm">{job.customer?.email}</Text>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Notification Emails:
            </Text>
            {job.job_cc_emails?.map((email: any) => (
              <Text fontSize="sm" key={email?.email}>
                {email?.email}
                {", "}
              </Text>
            ))}
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Date:
            </Text>
            <Text fontSize="sm">{formatDate(jobDateAt, "DD MMM YYYY")}</Text>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Ready by:
            </Text>
            <Text fontSize="sm">{formatTime(job.ready_at)}</Text>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Drop by:
            </Text>
            <Text fontSize="sm">{formatTime(job.drop_at)}</Text>
          </Flex>
          <Flex alignItems="center" mb={"16px"}>
            <Text width="200px" fontSize="sm">
              Reference:
            </Text>
            <Text fontSize="sm">{job.reference_no}</Text>
          </Flex>
        </Box>
      )}
      <Divider className="my-12" />
      {/* Addresses */}
      <Box>
        <h2 className="mb-4">Addresses</h2>

        {/* Pickup address */}
        <Box mb="16px">
          <h3 className="mb-5 mt-3">Pickup Information</h3>
          <Grid templateColumns="repeat(10, 1fr)" gap={0}>
            <GridItem colSpan={2}>
              <h4 className="mt-3">Pickup depot</h4>
            </GridItem>
            {isAdmin ? (
              <JobAddressesSection
                isAdmin={isAdmin}
                entityModel={job}
                savedAddressesSelect={savedAddressesSelect}
                defaultJobDestination={pickUpDestination}
                onAddressSaved={(_hasChanged) => {
                  getCustomerAddresses();
                }}
                jobDestinationChanged={(jobDestination) => {
                  setPickUpDestination({
                    ...pickUpDestination,
                    ...jobDestination,
                    ...{ is_pickup: true },
                  });
                  // const selectedStateCode= jobDestination?.address_state=="Victoria"? "VIC" : jobDestination?.address_state=="Queensland"? "QLD" :"";
                  // setFilteredDepotOptions(depotOptions.filter((option) => option.label === selectedStateCode));
                  // console.log(depotOptions.filter((option) => option.label === selectedStateCode))
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
                }}
              />
            ) : (
              <GridItem colSpan={7}>
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  className="py-0"
                >
                  <p className="py-3 text-sm">{pickUpDestination.address}</p>
                </Flex>
              </GridItem>
            )}
          </Grid>
        </Box>

        <Divider className="my-6" />

        {/* Delivery Information */}
        <Box mb="16px">
          <h3 className="mb-5 mt-3">Delivery Information</h3>
          {/* foreach jobDestinations */}
          {jobDestinations.map((jobDestination, index) => {
            return (
              <Box key={jobDestination.id}>
                <Grid templateColumns="repeat(10, 1fr)" gap={4}>
                  <GridItem colSpan={2}>
                    <h4 className="mt-3">Delivery Address {index + 1}</h4>
                  </GridItem>
                  {isAdmin ? (
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
                  ) : (
                    <GridItem colSpan={7}>
                      <Flex
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                        className="py-0"
                      >
                        <p className="py-3 text-sm">{jobDestination.address}</p>
                      </Flex>
                    </GridItem>
                  )}

                  <GridItem>
                    <Flex>
                      {/* if index == 0 */}
                      {jobDestinations.length > 1 && isAdmin && (
                        <Button
                          bg="white"
                          className="!text-[var(--chakra-colors-black-400)] mt-[3px] !py-3 !px-1 !h-[unset]"
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
                  </GridItem>
                </Grid>
                <Divider className="my-6" />
              </Box>
            );
          })}
        </Box>

        {isAdmin && (
          <Box mb="16px">
            <Flex alignItems="center" mb="16px" mt={5}>
              <Button
                variant="secondary"
                onClick={() => {
                  addToJobDestinations();
                }}
              >
                + Add delivery location
              </Button>
            </Flex>
            <Divider className="my-12" />
          </Box>
        )}
      </Box>
      {/* Items */}
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
        {isAdmin ? (
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

            {/* <Divider className="my-12" /> */}
          </Box>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>TYPE</Th>
                <Th>DIMENSIONS (L,W,H)</Th>
                <Th>QTY</Th>
                <Th>TOTAL WEIGHT</Th>
                <Th>RAW CBM</Th>
              </Tr>
            </Thead>
            <Tbody
              className="bg-white divide-y divide-gray-200"
              style={{ height: "200px" }}
            >
              {jobItems.map((jobItem) => {
                return (
                  <Tr key={jobItem.id}>
                    <Td> {jobItem.item_type?.name}</Td>
                    <Td>
                      {(jobItem.dimension_height * 100).toFixed(2)}
                      cm x {(jobItem.dimension_width * 100).toFixed(2)}
                      cm x {(jobItem.dimension_depth * 100).toFixed(2)}
                      cm
                    </Td>
                    <Td> {jobItem.quantity}</Td>
                    <Td> {jobItem.weight}kg</Td>
                    <Td>{jobItem.volume.toFixed(2)}cbm</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
        <Box
          mt={4}
          p={3}
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          backgroundColor="gray.50"
        >
          {/* CBM Auto */}
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

          {/* Total Weight */}
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
      {/* Attachments */}
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

        {/* foreach jobAttachments */}
        {!jobLoading && Array.isArray(job?.media_admin) && (
          <PaginationTable
            columns={attachmentColumns}
            data={job.media_admin}
            // showDelete={isAdmin} // Removed in Current ver of table
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
      {/* Additional Info */}
      <Box mb="16px">
        <h3 className="mb-5">Additional Info</h3>
        {isAdmin ? (
          <Box mb="16px">
            <CustomInputField
              label="Customer Notes"
              placeholder=""
              extra="Visible to driver"
              isTextArea={true}
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
              label="Base notes"
              placeholder=""
              name="base_notes"
              value={job.base_notes}
              onChange={(_e) =>{ }
                // setJob({
                //   ...job,
                //   [e.target.name]: e.target.value,
                // })
              }
            />

            {/* <Text fontSize="sm" color={textColorSecodary} mt={3}>
                            <strong>Hint: </strong>To get a quote, the location
                            must be <strong>Victoria or Queensland</strong>, and
                            the job category should be{" "}
                            <strong>Air Freight or LCL</strong>.
                          </Text> */}
          </Box>
        ) : (
          <Flex alignItems="center" mb={"16px"}>
            <SimpleGrid width="200px" columns={{ sm: 1 }}>
              <GridItem>
                <Text fontSize="sm">Customer Notes</Text>
              </GridItem>
              <GridItem>
                <Text fontSize="xs" color={textColorSecodary}>
                  Visible to driver
                </Text>
              </GridItem>
            </SimpleGrid>
            <Text fontSize="sm" width={"50%"}>
              {job.customer_notes}
            </Text>
          </Flex>
        )}
        <Box mb="16px">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Flex alignItems="center" width="100%" pt={7}>
                <SimpleGrid columns={{ sm: 1 }} width="100%">
                  <GridItem>
                    <FormLabel
                      display="flex"
                      mb="0"
                      fontSize="sm"
                      fontWeight="500"
                      _hover={{ cursor: "pointer" }}
                    >
                      Does this job require a timeslot booking through Inbound
                      Connect?
                    </FormLabel>
                  </GridItem>
                  <GridItem>
                    <RadioGroup
                      isDisabled={!isAdmin}
                      value={job.is_inbound_connect ? "1" : "0"}
                      onChange={(e) => {
                        setJob((prev) => ({
                          ...prev,
                          is_inbound_connect: e === "1" ? true : false,
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
                        // console.log(
                        //   filtereddepotOption,job.pick_up_state,
                        //   "filtereddepotOption",
                        // );
                        setFilteredDepotOptions(filtereddepotOption);
                      }}
                    >
                      <Stack direction="row" pt={3}>
                        <Radio value="0">No</Radio>
                        <Radio value="1" pl={6}>
                          Yes
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </GridItem>
                </SimpleGrid>
              </Flex>

              {(job.job_category_id == 1 || job.job_category_id == 2) &&
                job.is_inbound_connect == true && (
                  <Box>
                    <CustomInputField
                      isSelect={true}
                      isDisabled={!isAdmin}
                      optionsArray={filtereddepotOptions} // Use the state directly
                      label="Timeslot depots:"
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
                        })); // Update the selected depot directly
                        //  console.log("Selected depot: ", e.value)
                        setJob((prev) => ({
                          ...prev,
                          timeslot_depots: e.value, // Update job.timeslot_depots
                        }));
                        sendFreightData();
                      }}
                    />
                  </Box>
                )}
              <Flex
                flexDirection="column"
                alignItems="flex-start"
                width="100%"
                pt={7}
              >
                <FormLabel
                  display="flex"
                  mb={2} // Added margin-bottom for spacing
                  fontSize="sm"
                  fontWeight="500"
                  _hover={{ cursor: "pointer" }}
                >
                  Is Stackable Freight?
                </FormLabel>
                <RadioGroup
                  value={job?.is_stackable_required ? "1" : "0"} // ✅ controlled
                  onChange={(e) => {
                    setJob((prev) => ({
                      ...prev,
                      is_stackable_required: e === "1", // ✅ correct mapping
                    }));
                  }}
                >
                  <Stack direction="row">
                    <Radio value="0">No</Radio>
                    <Radio value="1" pl={6}>
                      Yes
                    </Radio>
                  </Stack>
                </RadioGroup>
                {/* ✅ Warning Message */}

                {!job?.is_stackable_required && (
                  <Alert
                    status="warning"
                    mt={3}
                    borderRadius="md"
                    bg="white"
                    border="1px solid"
                    borderColor="orange.300"
                  >
                    <AlertIcon color="orange.400" />
                    <AlertTitle fontSize="sm" color="orange.600">
                      Non-stackable freight may be subject to a higher rate on
                      the final invoice
                    </AlertTitle>
                  </Alert>
                )}
              </Flex>
              <Flex alignItems="center" width="100%" pt={7}>
                <SimpleGrid columns={{ sm: 1 }} width="100%">
                  <GridItem>
                    <FormLabel
                      display="flex"
                      mb="0"
                      fontSize="sm"
                      fontWeight="500"
                      _hover={{ cursor: "pointer" }}
                    >
                      Does this job require hand unloading?
                    </FormLabel>
                  </GridItem>
                  <GridItem>
                    <RadioGroup
                      isDisabled={!isAdmin}
                      value={job.is_hand_unloading ? "1" : "0"}
                      onChange={(e) => {
                        setJob((prev) => ({
                          ...prev,
                          is_hand_unloading: e === "1" ? true : false,
                        }));
                      }}
                    >
                      <Stack direction="row" pt={3}>
                        <Radio value="0">No</Radio>
                        <Radio value="1" pl={6}>
                          Yes
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </GridItem>
                </SimpleGrid>
              </Flex>

              <Flex alignItems="center" width="100%" pt={7}>
                <SimpleGrid columns={{ sm: 1 }} width="100%">
                  <GridItem>
                    <FormLabel
                      display="flex"
                      mb="0"
                      fontSize="sm"
                      fontWeight="500"
                      _hover={{ cursor: "pointer" }}
                    >
                      Are there dangerous goods being transported?
                    </FormLabel>
                  </GridItem>
                  <GridItem>
                    <RadioGroup
                      isDisabled={!isAdmin}
                      value={job.is_dangerous_goods ? "1" : "0"}
                      onChange={(e) => {
                        setJob((prev) => ({
                          ...prev,
                          is_dangerous_goods: e === "1" ? true : false,
                        }));
                      }}
                    >
                      <Stack direction="row" pt={3}>
                        <Radio value="0">No</Radio>
                        <Radio value="1" pl={6}>
                          Yes
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </GridItem>
                </SimpleGrid>
              </Flex>

              <Flex alignItems="center" width="100%" pt={7}>
                <SimpleGrid columns={{ sm: 1 }} width="100%">
                  <GridItem>
                    <FormLabel
                      display="flex"
                      mb="0"
                      fontSize="sm"
                      fontWeight="500"
                      _hover={{ cursor: "pointer" }}
                    >
                      Is a Tail Lift vehicle required?
                    </FormLabel>
                  </GridItem>
                  <GridItem>
                    <RadioGroup
                      isDisabled={!isAdmin}
                      value={job.is_tailgate_required ? "1" : "0"}
                      onChange={(e) => {
                        setJob((prev) => ({
                          ...prev,
                          is_tailgate_required: e === "1" ? true : false,
                        }));
                      }}
                    >
                      <Stack direction="row" pt={3}>
                        <Radio value="0">No</Radio>
                        <Radio value="1" pl={6}>
                          Yes
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </GridItem>
                </SimpleGrid>
              </Flex>

              <Flex alignItems="center" width="100%" pt={7}>
                <SimpleGrid columns={{ sm: 1 }} width="100%">
                  <GridItem>
                    <FormLabel
                      display="flex"
                      mb="0"
                      fontSize="sm"
                      fontWeight="500"
                      _hover={{ cursor: "pointer" }}
                    >
                      Is hard copy paperwork required?
                    </FormLabel>
                  </GridItem>
                  <GridItem>
                    <RadioGroup
                      isDisabled={!isAdmin}
                      value={job.is_paperwork_required ? "1" : "0"}
                      onChange={(e) => {
                        setJob((prev) => ({
                          ...prev,
                          is_paperwork_required: e === "1" ? true : false,
                        }));
                      }}
                    >
                      <Stack direction="row" pt={3}>
                        <Radio value="0">No</Radio>
                        <Radio value="1" pl={6}>
                          Yes
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </GridItem>
                </SimpleGrid>
              </Flex>
            </Box>
            <Box>
              {/* Right side content goes here */}
              <GridItem pr={4}>
                {/* {(job.job_category_id == 1 ||
                                job.job_category_id == 2) &&
                                (job.transport_location === "VIC" ||
                                  job.transport_location === "QLD") && ( */}
                <Flex
                  height="100%"
                  justifyContent="center"
                  pt={7}
                  flexDirection="column"
                >
                  {/* First Row: Button */}
                  <Flex justify="center">
                    <Button
                      bg="#3b82f6" /* Match the blue color */
                      color="white"
                      disabled={!isAdmin}
                      _hover={{
                        bg: "#2563eb", // Slightly darker blue for hover
                      }}
                      _active={{
                        bg: "#2563eb", // Active state
                        transform: "scale(0.95)", // Slightly shrink button when activated
                      }}
                      borderRadius="8px" /* Rounded corners */
                      px={6}
                      py={3}
                      fontWeight="500"
                      fontSize="sm"
                      onClick={() => {
                        handleSaveJobPriceCalculation();
                      }}
                    >
                      {buttonText}
                    </Button>
                    <Button
                      variant="outline"
                      ms={4}
                      colorScheme="blue"
                      onClick={downloadQuotePdf}
                      isLoading={isDownloading}
                      loadingText="Downloading"
                      isDisabled={isDownloading}
                    >
                      Download Quote
                    </Button>
                  </Flex>

                  {/* Second Row: Other Elements */}
                  {quoteCalculationRes && (
                    <Box mt={4}>
                      <Stack spacing={3}>
                        {/* Freight */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Freight:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.freight ?? 0}
                          </Text>
                        </Flex>

                        {/* Fuel */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Fuel levy:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.fuel ?? 0}
                          </Text>
                        </Flex>

                        {/* Hand Unload */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Hand Unload:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.hand_unload ?? 0}
                          </Text>
                        </Flex>

                        {/* Time Slot */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Time Slot:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.time_slot ?? 0}
                          </Text>
                        </Flex>

                        {/* Dangerous Goods */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Dangerous Goods:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.dangerous_goods ?? 0}
                          </Text>
                        </Flex>

                        {/* tail_lift */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Tail Lift:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.tail_lift ?? 0}
                          </Text>
                        </Flex>

                        {/* Stackable */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Stackable:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.stackable ?? 0}
                          </Text>
                        </Flex>

                        {/* {companyToll === 1 ? ( */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Toll Levy ({quoteCalculationRes.toll_levy_type}):
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="blue.600"
                          >
                            {quoteCalculationRes.toll_amount}
                          </Text>
                        </Flex>
                        {/* ) : null} */}

                        {/* Total */}
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="gray.700"
                            pr={2}
                          >
                            Total:
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="blue.600">
                            {quoteCalculationRes.total ?? 0}
                          </Text>
                        </Flex>
                      </Stack>
                    </Box>
                  )}
                </Flex>
                {/* )} */}
              </GridItem>
            </Box>
          </SimpleGrid>
        </Box>
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
