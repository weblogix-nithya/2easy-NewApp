import { SearchIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { JSX } from "react";

export function SearchBar(props: {
  variant?: string;
  background?: string;
  children?: JSX.Element;
  ms?: string;
  placeholder?: string;
  borderRadius?: string | number;
  [x: string]: any;
}) {
  const {
    _variant,
    _background,
    _children,
    ms,
    placeholder,
    borderRadius,
    searchQuery,
    onChangeSearchQuery,
    ...rest
  } = props;
  const searchIconColor = useColorModeValue("gray.700", "white");
  const inputText = useColorModeValue("gray.700", "gray.100");

  return (
    <InputGroup
      w={{ base: "100%", md: "200px" }}
      ms={ms ? ms : "auto"}
      border="1px"
      borderColor="gray.200"
      borderRadius="8px"
      {...rest}
    >
      <InputLeftElement>
        <IconButton
          aria-label="search"
          bg="transparent"
          borderRadius="inherit"
          _active={{
            bg: "transparent",
            transform: "none",
            borderColor: "transparent",
          }}
          _focus={{
            boxShadow: "none",
          }}
          _hover={{
            bg: "transparent",
          }}
          icon={<SearchIcon color={searchIconColor} w="15px" h="15px" />}
        />
      </InputLeftElement>

      <Input
        id="job-search"
        name="job-search"
        variant="search"
        placeholder={placeholder ? placeholder : "Search..."}
        value={searchQuery}
        onChange={(e) => {
          onChangeSearchQuery(e.target.value);
        }}
        bg="white"
        fontWeight="500"
        fontSize="sm"
        color={inputText}
        _placeholder={{ color: "black.500", fontSize: "14px" }}
        borderRadius={borderRadius ? borderRadius : "30px"}
      />
    </InputGroup>
  );
}
