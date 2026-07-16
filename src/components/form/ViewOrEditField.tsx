import {
    Box,
    Input,
    Skeleton,
    Textarea,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";

type Option = {
    value: string;
    label: string;
};

type BaseProps = {
    isCustomer: boolean;
    isLoading?: boolean;
    displayValue?: string | number;
};

type InputFieldProps = BaseProps & {
    type: "input";
    value: string | number;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputType?: string;
    isDisabled?: boolean;
    maxWidth?: string;
};

type TextareaFieldProps = BaseProps & {
    type: "textarea";
    value: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isDisabled?: boolean;
};

type SelectFieldProps = BaseProps & {
    type: "select";
    options: Option[];
    value: Option | undefined;
    onChange: (option: Option) => void;
    placeholder?: string;
    isDisabled?: boolean;
};

type ViewOrEditFieldProps =
    | InputFieldProps
    | TextareaFieldProps
    | SelectFieldProps;

/**
 * Renders an editable field for admins and a read-only Skeleton display for customers.
 * Eliminates the repeated isCustomer ? <Input hidden> : <Skeleton> pattern.
 */
export function ViewOrEditField(props: ViewOrEditFieldProps) {
    const { isCustomer, isLoading = false, displayValue } = props;

    if (isCustomer) {
        return (
            <Skeleton isLoaded={!isLoading} w="75%">
                <span>{displayValue ?? "-"}</span>
            </Skeleton>
        );
    }

    if (props.type === "input") {
        return (
            <Input
                variant="main"
                value={props.value}
                onChange={props.onChange}
                type={props.inputType ?? "text"}
                name={props.name}
                className={`max-w-md ${props.maxWidth ?? ""}`}
                fontSize="sm"
                mb="0"
                fontWeight="500"
                size="lg"
                isDisabled={props.isDisabled}
            />
        );
    }

    if (props.type === "textarea") {
        return (
            <Textarea
                variant="main"
                value={props.value}
                onChange={props.onChange}
                name={props.name}
                className="max-w-md"
                fontSize="sm"
                mb="0"
                fontWeight="500"
                isDisabled={props.isDisabled}
            />
        );
    }

    if (props.type === "select") {
        return (
            <Box className="!max-w-md w-full">
                <Select
                    placeholder={props.placeholder ?? "Select..."}
                    value={props.value}
                    options={props.options}
                    onChange={props.onChange as any}
                    size="lg"
                    className="select mb-0"
                    classNamePrefix="two-easy-select"
                    isDisabled={props.isDisabled}
                />
            </Box>
        );
    }

    return null;
}