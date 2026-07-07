"use client";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Image,
  Input,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState } from "react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import FileInput from "@/components/fileInput/FileInput";
import {
  DriverInsurance,
  GET_INSURANCE_TYPES_QUERY,
  InsuranceTypesResponse,
} from "@/graphql/driver";

interface InsuranceTypeOption {
  value: number;
  label: string;
}

interface InsuranceSectionProps {
  insurances: DriverInsurance[];
  onChange: (insurances: DriverInsurance[]) => void;
  /**
   * Only pass this once the driver actually exists in the DB (edit page).
   * On the create page leave undefined — file upload stays hidden until
   * the driver has been saved and has a real id.
   */
  driverId?: number | null;
  onMediaUploaded?: () => void;
  textColor?: string;
}

const emptyInsurance = (): DriverInsurance => ({
  insurance_type_id: null,
  insurance_name: "",
  insurance_number: "",
  insurance_expire_at: "",
});

function InsuranceSection({
  insurances,
  onChange,
  driverId,
  onMediaUploaded,
  textColor,
}: InsuranceSectionProps) {
  // ── insurance types lookup ─────────────────────────────────────────────
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceTypeOption[]>([]);

  useApolloQueryWithEffect<InsuranceTypesResponse>(GET_INSURANCE_TYPES_QUERY, {
    onCompleted: (data) => {
      const list = data?.insuranceTypes;
      if (!Array.isArray(list)) return;
      setInsuranceTypes(
        list.map((t) => ({ value: parseInt(t.id), label: t.name })),
      );
    },
  });

  const list = insurances ?? [];

  // ── helpers ─────────────────────────────────────────────────────────────
  const updateInsurance = (index: number, patch: Partial<DriverInsurance>) =>
    onChange(list.map((ins, i) => (i === index ? { ...ins, ...patch } : ins)));

  const addInsurance = () => onChange([...list, emptyInsurance()]);

  const removeInsurance = (index: number) =>
    onChange(list.filter((_, i) => i !== index));

  /**
   * Resolve the currently-selected InsuranceTypeOption for a given row.
   *
   * GraphQL returns the nested object as `insuranceType { id name }` but
   * the flat scalar `insurance_type_id` may not be back-filled from it.
   * We therefore check both so the Select always shows the right option
   * whether the row came from the server or was just picked in the UI.
   */
  const resolveTypeValue = (ins: DriverInsurance): InsuranceTypeOption | null =>
    insuranceTypes.find(
      (t) => t.value === (ins.insuranceType?.id ?? ins.insurance_type_id),
    ) ?? null;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mt="8" mb="4">
        <h3 className="mb-0 text-lg font-semibold">Insurance Details</h3>
        <Button size="sm" variant="outline" onClick={addInsurance}>
          + Add Insurance
        </Button>
      </Flex>

      {list.length === 0 && (
        <Text fontSize="sm" color="gray.500" mb="6">
          No insurance added yet. Click &ldquo;Add Insurance&rdquo; to add one.
        </Text>
      )}

      {list.map((ins, index) => (
        <Box
          key={ins.id ?? `new-ins-${index}`}
          border="1px solid #E2E8F0"
          borderRadius="8px"
          p="4"
          mb="4"
        >
          {/* row header */}
          <Flex justifyContent="space-between" alignItems="center" mb="4">
            <Text fontSize="sm" fontWeight="600" color={textColor}>
              {ins.insuranceType?.name
                ? `${ins.insuranceType.name}${ins.insurance_name ? ` — ${ins.insurance_name}` : ""}`
                : `Insurance #${index + 1}`}
            </Text>
            <Button
              size="xs"
              colorScheme="red"
              variant="ghost"
              onClick={() => removeInsurance(index)}
            >
              Remove
            </Button>
          </Flex>

          {/* fields */}
          <Grid templateColumns="repeat(2, 1fr)" gap="6" mb="4">
            <FormControl gridColumn="span 2">
              <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>
                Insurance Type
              </FormLabel>
              {/* KEY FIX: value resolved via resolveTypeValue which checks
                  both insuranceType.id (server data) and insurance_type_id
                  (locally-set data) so the selected option always renders. */}
              <Select
                placeholder="Select Insurance Type"
                value={resolveTypeValue(ins)}
                options={insuranceTypes}
                onChange={(e) =>
                  updateInsurance(index, {
                    insurance_type_id: e?.value ?? null,
                    // keep the nested object in sync so resolveTypeValue
                    // still works before the next server fetch
                    insuranceType: e
                      ? { id: e.value, name: e.label }
                      : undefined,
                  })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>
                Insurance Name
              </FormLabel>
              <Input
                variant="main"
                fontSize="sm"
                type="text"
                value={ins.insurance_name ?? ""}
                onChange={(e) =>
                  updateInsurance(index, { insurance_name: e.target.value })
                }
                fontWeight="500"
                size="md"
              />
            </FormControl>

            <FormControl>
              <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>
                Insurance Number
              </FormLabel>
              <Input
                variant="main"
                fontSize="sm"
                type="text"
                value={ins.insurance_number ?? ""}
                onChange={(e) =>
                  updateInsurance(index, { insurance_number: e.target.value })
                }
                fontWeight="500"
                size="md"
              />
            </FormControl>

            <FormControl>
              <FormLabel mb="0" fontSize="sm" fontWeight="600" color={textColor}>
                Expire
              </FormLabel>
              <Input
                variant="main"
                fontSize="sm"
                type="date"
                value={ins.insurance_expire_at ?? ""}
                onChange={(e) =>
                  updateInsurance(index, { insurance_expire_at: e.target.value })
                }
                fontWeight="500"
                size="md"
              />
            </FormControl>
          </Grid>

          {/* File upload — only when this insurance row already exists in DB
              (has an id) AND the parent driver exists too. */}
          {driverId && ins.id && (
            <FormControl>
              <FormLabel mb="2" fontSize="sm" fontWeight="600" color={textColor}>
                Photo of insurance
              </FormLabel>
              <Flex width="100%" flexWrap="wrap" gap="4">
                {ins.insurance_media?.map((media: any, i: number) => (
                  <Flex
                    key={media.id ?? i}
                    alignItems="center"
                    justifyContent="center"
                    width="130px"
                    height="130px"
                    border="1px solid #E2E8F0"
                    borderRadius="4px"
                  >
                    <Image
                      src={media.downloadable_url}
                      alt={media.name ?? media.file_name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  </Flex>
                ))}
                <FileInput
                  width="130px"
                  height="130px"
                  entity="DriverInsurance"
                  description="Upload insurance"
                  entityId={ins.id}
                  onUpload={() => onMediaUploaded?.()}
                  collection_name="insurance"
                />
              </Flex>
            </FormControl>
          )}
        </Box>
      ))}

      <Divider mt="2" />
    </Box>
  );
}

export default InsuranceSection;