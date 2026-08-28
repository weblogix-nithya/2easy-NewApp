import {
    Box,
    FormLabel,
    Input,
    SpaceProps,
    Text,
    Textarea,
    useColorModeValue,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useId } from "react";

export default function Default(props: {
    id?: string;
    inputRef?: any;
    label?: string;
    extra?: string;
    placeholder?: string;
    suffixText?: string;
    type?: string;
    name?: string;
    min?: string;
    showLabel?: boolean;
    value?: string | number | any;
    defaultValue?: string | number | any;
    maxWidth?: string;
    minWidth?: string;
    isDisabled?: boolean;
    isSelect?: boolean;
    isTextArea?: boolean;
    isInput?: boolean;
    inputStyles?: React.CSSProperties;
    optionsArray?: any[];
    onChange?: (field: any) => void;
    onInputChange?: (field: any) => void;
    onClick?: (field: any) => void;
    mb?: SpaceProps["mb"];
    autoComplete?: string;
}) {
    const {
        id,
        inputRef,
        label = "",
        extra,
        placeholder = "",
        suffixText,
        value,
        defaultValue,
        name,
        min,
        type,
        maxWidth,
        minWidth,
        showLabel = true,
        isDisabled,
        isSelect,
        isTextArea,
        mb,
        isInput = !isSelect && !isTextArea,
        inputStyles,
        optionsArray,
        onChange,
        onInputChange,
        onClick = (e) => {
            e.preventDefault();
        },
        autoComplete,
        ...rest
    } = props;
    const textColorPrimary = useColorModeValue("navy.700", "white");
    const textColorSecodary = useColorModeValue("#888888", "#888888");
    const generatedId = useId();
    const randomIdSection = generatedId;

    return (
        <Box mb={mb ? mb : "10px"} w="full">
            {showLabel && (
                <FormLabel
                    display="flex"
                    alignItems="baseline"
                    mb="2px"
                    fontSize="sm"
                    fontWeight="600"
                    htmlFor={(id ? id : name) + randomIdSection}
                    color={textColorPrimary}
                    _hover={{ cursor: "pointer" }}
                >
                    {label}
                    {extra && (
                        <Text
                            as="span"
                            fontSize="xs"
                            fontWeight="400"
                            ms="6px"
                            textColor={textColorSecodary}
                        >
                            {extra}
                        </Text>
                    )}
                </FormLabel>
            )}

            {isSelect && (
                <Box w="full" maxWidth={maxWidth ? maxWidth : "100%"} minWidth={minWidth}>
                    <Select
                        onInputChange={onInputChange}
                        isDisabled={isDisabled}
                        placeholder={placeholder}
                        value={value}
                        options={optionsArray}
                        onChange={onChange}
                        size="lg"
                        className="select mb-0"
                        classNamePrefix="two-easy-select"
                    ></Select>
                </Box>
            )}

            {isInput && (
                <div className="relative w-full">
                    <Input
                        ref={inputRef}
                        {...rest}
                        isDisabled={isDisabled}
                        type={type ? type : "text"}
                        id={(id ? id : name) + randomIdSection}
                        variant="main"
                        placeholder={placeholder}
                        _placeholder={{ fontWeight: "400", color: "secondaryGray.600" }}
                        isRequired={true}
                        name={name}
                        value={value ?? ""}
                        onChange={onChange}
                        min={min}
                        onClick={
                            type === "date"
                                ? (e) => {
                                    e.preventDefault();
                                    e.currentTarget.showPicker?.();
                                }
                                : onClick
                        }
                        ms={{ base: "0px", md: "0px" }}
                        mb="0"
                        size="lg"
                        w="full"
                        maxWidth={maxWidth ? maxWidth : "100%"}
                        fontSize="sm"
                        fontWeight="500"
                        style={inputStyles}
                    />
                    {suffixText && (
                        <p className="absolute top-[13px] right-[17px] text-[var(--chakra-colors-secondaryGray-600)]">
                            {suffixText}
                        </p>
                    )}
                </div>
            )}

            {isTextArea && (
                <Textarea
                    {...rest}
                    isDisabled={isDisabled}
                    id={(id ? id : name) + randomIdSection}
                    placeholder={placeholder}
                    _placeholder={{ fontWeight: "400", color: "secondaryGray.600" }}
                    isRequired={true}
                    fontSize="sm"
                    w="full"
                    maxWidth={maxWidth ? maxWidth : "100%"}
                    name={name}
                    value={value ? value : ""}
                    onChange={onChange}
                    onClick={onClick}
                    mb="0"
                />
            )}
        </Box>
    );
}