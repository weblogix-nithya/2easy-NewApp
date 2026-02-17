import { useQuery } from "@apollo/client";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormLabel,
  // Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  UseDisclosureProps,
  VStack,
} from "@chakra-ui/react";
import { CreatableSelect, Select } from "chakra-react-select";
import CustomInputField from "components/fields/CustomInputField";
import {
  defaultSelectedFilter,
  filterDisplayNames as defaultFilterDisplayNames,
} from "components/jobs/Filters";
import { GET_COMPANYS_QUERY } from "graphql/company";
// import { formatDateTimeToDB } from "helpers/helper";
import debounce from "lodash.debounce";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

import { SelectedFilter } from "./Filters";

interface FilterJobsModalProps extends UseDisclosureProps {
  // jobStatuses?: { value: string; label: string }[];
  jobCategories?: { value: string; label: string }[];
  onFilterApply: (
    selectedFilters: SelectedFilter,
    filterDisplayNames: any,
  ) => void;
  selectedFilters: SelectedFilter;
  setSelectedFilters: React.Dispatch<React.SetStateAction<SelectedFilter>>;
  jobFilter: any;
  filterDisplayNames: any;
  setJobFilter: any;
}

export default function FilterJobsModal({
  isOpen,
  onClose,
  // jobStatuses,
  jobCategories,
  onFilterApply,
  selectedFilters,
  setSelectedFilters,
  jobFilter,
  setJobFilter,
  filterDisplayNames,
}: FilterJobsModalProps) {
  const isCompany = useSelector((state: RootState) => state.user.isCompany);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [localFilterDisplayNames, setLocalFilterDisplayNames] =
    useState(filterDisplayNames);
  const onChangeSearchCompany = useMemo(() => {
    return debounce((e) => {
      setDebouncedSearch(e);
    }, 300);
  }, []);
  const handleFilterApply = () => {
    onFilterApply(
      {
        ...selectedFilters,
      },
      { ...localFilterDisplayNames },
    );
    onClose();
  };
  const handleResetAll = () => {
    onFilterApply(
      {
        ...defaultSelectedFilter,
      },
      { ...defaultFilterDisplayNames },
    );
    onClose();
  };
  const stateOptions = [
    { value: "Queensland", label: "QLD" },
    { value: "Victoria", label: "VIC" },
    { value: "New South Wales", label: "NSW" },
    { value: "Western Australia", label: "WA" },
    { value: "South Australia", label: "SA" },
    { value: "Tasmania", label: "TAS" },
  ];

  // useQuery(GET_COMPANYS_QUERY, {
  //   variables: {
  //     query: debouncedSearch,
  //     page: 1,
  //     first: 100,
  //     orderByColumn: "id",
  //     orderByOrder: "ASC",
  //   },
  //   onCompleted: (data) => {
  //     setCompaniesOptions([]);
  //     data.companys.data.map((_entity: any) => {
  //       setCompaniesOptions((companys) => [
  //         ...companys,
  //         {
  //           value: parseInt(_entity.id),
  //           label: _entity.name,
  //         },
  //       ]);
  //     });
  //   },
  // });
  // before: useQuery(..., { onCompleted: (...) { setCompaniesOptions(...) } })
  const { data: companiesData } = useQuery(GET_COMPANYS_QUERY, {
    variables: {
      query: debouncedSearch,
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    skip: !isOpen, // don't fetch while modal is closed
  });
  useEffect(() => {
    if (!companiesData?.companys?.data) return;
    setCompaniesOptions(
      companiesData.companys.data.map((e: any) => ({
        value: Number(e.id),
        label: e.name,
      })),
    );
  }, [companiesData]);

  useEffect(() => {
    return () => {
      // lodash.debounce adds .cancel()
      // @ts-ignore
      onChangeSearchCompany.cancel?.();
    };
  }, [onChangeSearchCompany]);

  function handleInputHighlight(
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ): void {
    // User request to highlight input field on click
    event.currentTarget.select();
  }
  return (
    <Modal id="filter-jobs-modal" isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(1px)" />
      <ModalContent>
        <ModalHeader>Filter Jobs</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack w="full" align="start" spacing={3}>
            <Divider />
            <Box w={"full"}>
              <FormLabel>State</FormLabel>
              <Select
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
                value={selectedFilters.states}
                isMulti={true}
                options={stateOptions}
                name="states"
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    states: e.length > 0 ? e : undefined,
                  });
                  const values = e.map((o) => o.value);
                  const labels = e.map((o) => o.label).join(",");
                  setJobFilter({
                    ...jobFilter,
                    states: values,
                  });
                  setLocalFilterDisplayNames({
                    ...localFilterDisplayNames,
                    states: {
                      ...localFilterDisplayNames.states,
                      value: labels,
                    },
                  });
                }}
              />
            </Box>
            <Box w={"full"}>
              <FormLabel>Suburb</FormLabel>
              <CreatableSelect
                isMulti
                value={selectedFilters.suburbs}
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    suburbs: e.length > 0 ? e : undefined,
                  });
                  const values = e.map((o) => o.value);
                  const labels = e.map((o) => o.label).join(",");
                  setJobFilter({
                    ...jobFilter,
                    suburbs: values,
                  });
                  setLocalFilterDisplayNames({
                    ...localFilterDisplayNames,
                    suburbs: {
                      ...localFilterDisplayNames.suburbs,
                      value: labels,
                    },
                  });
                }}
                formatCreateLabel={(userInput) => `${userInput}`}
              />
            </Box>
            <Box w={"full"}>
              <FormLabel>Business Name</FormLabel>
              <CreatableSelect
                isMulti
                value={selectedFilters.address_business_name}
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    address_business_name: e.length > 0 ? e : undefined,
                  });
                  const values = e.map((o) => o.value);
                  const labels = e.map((o) => o.label).join(",");
                  setJobFilter({
                    ...jobFilter,
                    address_business_name: values,
                  });
                  setLocalFilterDisplayNames({
                    ...localFilterDisplayNames,
                    address_business_name: {
                      ...localFilterDisplayNames.address_business_name,
                      value: labels,
                    },
                  });
                }}
                formatCreateLabel={(userInput) => `${userInput}`}
              />
            </Box>
            {!isCompany && (
              <Box w={"full"}>
                <FormLabel>Company</FormLabel>
                <Select
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  value={selectedFilters.has_company_ids}
                  isMulti={true}
                  options={companiesOptions}
                  name="has_company_ids"
                  onInputChange={(e) => {
                    onChangeSearchCompany(e);
                  }}
                  onChange={(e) => {
                    setSelectedFilters({
                      ...selectedFilters,
                      has_company_ids: e.length > 0 ? e : undefined,
                    });
                    const values = e.map((o) => o.value);
                    const labels = e.map((o) => o.label).join(",");
                    setJobFilter({
                      ...jobFilter,
                      has_company_ids: values,
                    });
                    setLocalFilterDisplayNames({
                      ...localFilterDisplayNames,
                      has_company_ids: {
                        ...localFilterDisplayNames.has_company_ids,
                        value: labels,
                      },
                    });
                  }}
                />
              </Box>
            )}
            <Box w={"full"}>
              <FormLabel>Job Type</FormLabel>
              <Select
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
                value={selectedFilters.has_job_category_ids}
                isMulti={true}
                options={jobCategories}
                name="has_job_category_ids"
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    has_job_category_ids: e.length > 0 ? e : undefined,
                  });
                  const values = e.map((o) => o.value);
                  const labels = e.map((o) => o.label).join(",");
                  setJobFilter({
                    ...jobFilter,
                    has_job_category_ids: values,
                  });
                  setLocalFilterDisplayNames({
                    ...localFilterDisplayNames,
                    has_job_category_ids: {
                      ...localFilterDisplayNames.has_job_category_ids,
                      value: labels,
                    },
                  });
                }}
              />
            </Box>
            {/* <Box w={"full"}>
              <FormLabel>Date</FormLabel>

              <Input
                type={"date"}
                placeholder=""
                name="job_date_at"
                value={selectedFilters.job_date_at}
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    job_date_at: e.target.value,
                  });
                  setJobFilter({
                    ...jobFilter,
                    job_date_at: formatDateTimeToDB(e.target.value, "00:00"),
                  });
                  setLocalFilterDisplayNames({
                    ...localFilterDisplayNames,
                    job_date_at: {
                      ...localFilterDisplayNames.job_date_at,
                      value: e.target.value,
                    },
                  });
                }}
              />
            </Box> */}
            {/* <Box w={"full"}>
              <FormLabel>Status</FormLabel>
              <Select
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
                value={selectedFilters.job_status_id}
                isMulti={true}
                options={jobStatuses}
                name="job_status_id"
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    job_status_id: e,
                  });
                  const values = e.map((o) => o.value);
                  const labels = e.map((o) => o.label).join(",");
                  setJobFilter({
                    ...jobFilter,
                    job_status_id: values,
                  });
                  setLocalFilterDisplayNames({
                    ...localFilterDisplayNames,
                    job_status_id: {
                      ...localFilterDisplayNames.job_status_id,
                      value: labels,
                    },
                  });
                }}
              />
            </Box> */}
            <Box w={"full"}>
              <Checkbox
                isChecked={selectedFilters.is_tailgate_required}
                onChange={(e) => {
                  setJobFilter({
                    ...jobFilter,
                    is_tailgate_required: e.target.checked,
                  });
                  setSelectedFilters({
                    ...selectedFilters,
                    is_tailgate_required: e.target.checked,
                  });
                  setLocalFilterDisplayNames({
                    ...localFilterDisplayNames,
                    is_tailgate_required: {
                      ...localFilterDisplayNames.is_tailgate_required,
                      value: e.target.checked && "Yes",
                    },
                  });
                }}
              >
                Tailgate jobs only
              </Checkbox>
            </Box>

            <FormLabel fontWeight={"500"}>Shipment Size</FormLabel>
            <VStack spacing={3}>
              <Flex>
                <Box w={"full"}>
                  <FormLabel fontWeight={"bold"}>From</FormLabel>
                  <CustomInputField
                    type="number"
                    showLabel={false}
                    placeholder="0.00"
                    name="weight_from"
                    defaultValue={selectedFilters.weight_from}
                    suffixText="kg"
                    onClick={handleInputHighlight}
                    onChange={(e) => {
                      setSelectedFilters({
                        ...selectedFilters,
                        weight_from: e.target.value,
                      });
                      setJobFilter({
                        ...jobFilter,
                        weight_from: parseInt(e.target.value),
                      });
                      setLocalFilterDisplayNames({
                        ...localFilterDisplayNames,
                        weight_from: {
                          ...localFilterDisplayNames.weight_from,
                          value: e.target.value,
                        },
                      });
                    }}
                    maxWidth="95%"
                    mb="0"
                  />
                </Box>
                <Box w={"full"}>
                  <FormLabel fontWeight={"bold"}>To</FormLabel>
                  <CustomInputField
                    type="number"
                    showLabel={false}
                    placeholder="0.00"
                    name="weight_to"
                    defaultValue={selectedFilters.weight_to}
                    suffixText="kg"
                    onClick={handleInputHighlight}
                    onChange={(e) => {
                      setSelectedFilters({
                        ...selectedFilters,
                        weight_to: e.target.value,
                      });
                      setJobFilter({
                        ...jobFilter,
                        weight_to: parseInt(e.target.value),
                      });
                      setLocalFilterDisplayNames({
                        ...localFilterDisplayNames,
                        weight_to: {
                          ...localFilterDisplayNames.weight_to,
                          value: e.target.value,
                        },
                      });
                    }}
                    maxWidth="95%"
                    mb="0"
                  />
                </Box>
              </Flex>
              <Flex>
                <Box w={"full"}>
                  <FormLabel fontWeight={"bold"}>From</FormLabel>
                  <CustomInputField
                    type="number"
                    showLabel={false}
                    placeholder="0.00"
                    name="volume_from"
                    defaultValue={selectedFilters.volume_from}
                    suffixText="cbm"
                    onClick={handleInputHighlight}
                    onChange={(e) => {
                      setSelectedFilters({
                        ...selectedFilters,
                        volume_from: e.target.value,
                      });
                      setJobFilter({
                        ...jobFilter,
                        volume_from: parseInt(e.target.value),
                      });
                      setLocalFilterDisplayNames({
                        ...localFilterDisplayNames,
                        volume_from: {
                          ...localFilterDisplayNames.volume_from,
                          value: e.target.value,
                        },
                      });
                    }}
                    maxWidth="95%"
                    mb="0"
                  />
                </Box>
                <Box w={"full"}>
                  <FormLabel fontWeight={"bold"}>To</FormLabel>
                  <CustomInputField
                    type="number"
                    showLabel={false}
                    placeholder="0.00"
                    name="volume_to"
                    defaultValue={selectedFilters.volume_to}
                    suffixText="cbm"
                    onClick={handleInputHighlight}
                    onChange={(e) => {
                      setSelectedFilters({
                        ...selectedFilters,
                        volume_to: e.target.value,
                      });
                      setJobFilter({
                        ...jobFilter,
                        volume_to: parseInt(e.target.value),
                      });
                      setLocalFilterDisplayNames({
                        ...localFilterDisplayNames,
                        volume_to: {
                          ...localFilterDisplayNames.volume_to,
                          value: e.target.value,
                        },
                      });
                    }}
                    maxWidth="95%"
                    mb="0"
                  />
                </Box>
              </Flex>
            </VStack>
            <Divider />
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Box w={"full"}>
            <Flex justifyContent={"space-between"}>
              <Button
                variant="outline"
                onClick={() => handleResetAll()}
                className="mr-2"
              >
                Reset all
              </Button>
              <Button
                variant="primary"
                onClick={() => handleFilterApply()}
                className="ml-2"
              >
                Filter jobs
              </Button>
            </Flex>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
