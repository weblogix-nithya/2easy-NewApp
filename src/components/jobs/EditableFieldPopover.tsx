// EditableFieldPopover.tsx
import { useMutation } from "@apollo/client/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import {
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import Time12HourPicker from "@/components/fields/Time12HourPicker";
import { UPDATE_JOB_MUTATION } from "@/graphql/job";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

type Props = {
  row: any;
  field: "admin_notes" | "timeslot" | "customer_notes";
  multiline?: boolean; // textarea when true, input when false
  triggerAriaLabel: string; // a11y label for button
  onSaved?: (newValue: string) => void; // optional: lift updated display value
  refetchJobs?: () => void; // ✅ new
};

export default function EditableFieldPopover({
  row,
  field,
  multiline = false,
  triggerAriaLabel,
  onSaved,
  refetchJobs,
}: Props) {
  const toast = useToast();
  const isAdmin = useSelector((s: RootState) => s.user.isAdmin);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const current = (row?.original?.job?.[field] ?? "") as string;
  const [draftValue, setDraftValue] = useState(current);

  // Strict ref-only draft (no state re-renders while typing)
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const [updateJob] = useMutation(UPDATE_JOB_MUTATION, {
    onCompleted: () => {
      const newVal = ref.current?.value ?? "";
      onSaved?.(newVal);
      toast({ title: "Updated", status: "success", duration: 2000 });
      setIsSaving(false);
      setIsOpen(false);
      refetchJobs?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to update",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      setIsSaving(false);
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      setDraftValue(current);
    }
  }, [isOpen, current]);

  const handleSave = () => {
    const value =
      field === "timeslot" ? draftValue : (ref.current?.value ?? "");

    if (field !== "timeslot" && !ref.current?.reportValidity()) {
      return;
    }

    setIsSaving(true);
    updateJob({
      variables: {
        input: {
          id: parseInt(row.original.job.id),
          customer_id: row.original.job.customer.id,
          company_id: row.original.job.company.id,
          job_type_id: row.original.job.job_type.id,
          // send only the edited field
          [field]: value,
        },
      },
    });
  };

  const handleSaveWithValue = (overrideValue: string) => {
    setIsSaving(true);

    updateJob({
      variables: {
        input: {
          id: parseInt(row.original.job.id),
          customer_id: row.original.job.customer.id,
          company_id: row.original.job.company.id,
          job_type_id: row.original.job.job_type.id,
          [field]: overrideValue,
        },
      },
    });
  };
  if (!isAdmin) return null;

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => {
        if (ref.current) ref.current.value = current; // revert
        setIsOpen(false);
      }}
      placement="auto"
    >
      <PopoverTrigger>
        <IconButton
          aria-label={triggerAriaLabel}
          icon={<EditIcon />}
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(true)}
          isDisabled={isSaving}
        />
      </PopoverTrigger>

      <PopoverContent p={4} w="sm">
        <PopoverArrow />
        <PopoverCloseButton
          onClick={() => {
            // if (ref.current) ref.current.value = current; // revert
            setIsOpen(false);
          }}
        />
        <Flex direction="column" gap={2}>
          {field === "timeslot" ? (
            // <Input
            //   type="time"
            //   defaultValue={current.length>0 ? current: "06:00"}
            //   step={900} // Validation (00,15,30,45)
            //   ref={ref as React.RefObject<HTMLInputElement>}
            //   size="sm"
            // />
            <Time12HourPicker
              mode="quick"
              value={draftValue}
              // onChange={(val) => setDraftValue(val)}
              onChange={(val) => {
                setDraftValue(val);

                // 🔥 auto save immediately
                setTimeout(() => {
                  handleSaveWithValue(val);
                }, 0);
              }}
            />
          ) : multiline ? (
            <Textarea
              defaultValue={current}
              ref={ref as React.RefObject<HTMLTextAreaElement>}
              size="sm"
              rows={8}
              resize="none"
            />
          ) : (
            <Textarea
              defaultValue={current}
              ref={ref as React.RefObject<HTMLTextAreaElement>}
              size="sm"
              rows={4}
              placeholder="Enter value"
            />
          )}
          <Flex gap={2} justify="flex-end">
            <IconButton
              aria-label="Save"
              icon={isSaving ? <Spinner size="xs" /> : <CheckIcon />}
              size="sm"
              colorScheme="green"
              onClick={handleSave}
              isDisabled={isSaving}
            />

            <IconButton
              aria-label="Cancel"
              icon={<CloseIcon />}
              size="sm"
              colorScheme="red"
              onClick={() => {
                if (ref.current) ref.current.value = current;
                setIsOpen(false);
              }}
              isDisabled={isSaving}
            />
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  );
}
