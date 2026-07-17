// Chakra imports
import {
  Box,
  Flex,
  FormLabel,
  GridItem,
  SimpleGrid,
  SpaceProps,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";

export default function Default(props: {
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  selectedJobId: number;
  value: string | number | any;
  isDisabled?: boolean;
  optionsArray?: any[];
  onChange?: (field: any) => void;
  onClick?: (field: any) => void;
  mb?: SpaceProps["mb"];
}) {
  const {
    showLabel = true,
    label = "",
    placeholder = "",
    value,
    selectedJobId,
    isDisabled,
    optionsArray,
    onChange,
    mb,
  } = props;

  const jobTypeClassName = (jobTypeId: number) => {
    let selectClassName = "";
    switch (jobTypeId) {
      case 1:
        selectClassName = "bg-[var(--chakra-colors-purple-400)]";
        break;
      case 2:
        selectClassName = "bg-[var(--chakra-colors-orange-400)]";
        break;
      case 3:
        selectClassName = "bg-[var(--chakra-colors-red-500)]";
        break;
      default:
        selectClassName = "bg-[var(--chakra-colors-gray-500)]";
        break;
    }
    return selectClassName;
  };

  return (
    <Flex alignItems="center" mb={mb ? mb : "16px"}>
      {showLabel && (
        <FormLabel
          display="flex"
          mb="0"
          width="200px"
          fontSize="sm"
          fontWeight="500"
          _hover={{ cursor: "pointer" }}
        >
          <SimpleGrid columns={{ sm: 1 }}>
            <GridItem>{label}</GridItem>
          </SimpleGrid>
        </FormLabel>
      )}
      <Box width="100%">
        <Box>
          <Select
            className={"color-select " + jobTypeClassName(selectedJobId)}
            classNamePrefix="two-color-select"
            isDisabled={isDisabled}
            placeholder={placeholder}
            value={value}
            options={optionsArray}
            onChange={onChange}
          ></Select>
        </Box>
      </Box>
    </Flex>
  );
}