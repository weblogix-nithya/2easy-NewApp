import { Button, Flex, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react"
import { SelectedFilter } from "components/jobs/Filters"

interface JobFiltersTagRowProps {
  mainFilters: SelectedFilter
  mainFilterDisplayNames: typeof import("components/jobs/Filters").filterDisplayNames
  onRemoveFilter: (key: keyof SelectedFilter) => void
  onClearAll: () => void
}

const JobFiltersTagRow = ({
  mainFilters,
  mainFilterDisplayNames,
  onRemoveFilter,
  onClearAll
}: JobFiltersTagRowProps) => {
  if (!mainFilters || !mainFilterDisplayNames) return null; // ✅ Prevent render on undefined

  return (
    <Flex alignItems="left" flexWrap="wrap" mt={2}>
      {Object.keys(mainFilters).map((filterKey) => {
        const key = filterKey as keyof SelectedFilter;
        const filterDef = mainFilterDisplayNames[key];

        if (mainFilters[key] && filterDef) {
          return (
            <Tag
              key={filterKey}
              size="md"
              borderRadius="full"
              variant="solid"
              bg="black.100"
              color="black"
              mr={2}
              mb={2}
            >
              <TagLabel>
                {filterDef.label}:{filterDef.value}
              </TagLabel>
              <TagCloseButton onClick={() => onRemoveFilter(key)} />
            </Tag>
          );
        }
        return null;
      })}

      <Button
        className="!h-[30px]"
        variant="smallGreySquare"
        bg="none"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </Flex>
  );
};

export default JobFiltersTagRow
