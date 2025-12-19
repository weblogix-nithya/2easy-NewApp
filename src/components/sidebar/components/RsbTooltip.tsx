import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { faChevronDown } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function RsbTooltip(props: { jobName: string; pickupNotes: string }) {
  const { jobName, pickupNotes } = props;

  return (
    <>
      <Flex>
        <Text fontSize="xs">{jobName}</Text>
        <Tooltip label={pickupNotes} aria-label="A tooltip">
          <Text fontSize="xs" as="b" color="#888" className="ml-4">
            Instructions{" "}
            <FontAwesomeIcon icon={faChevronDown} className="ml-1" />
          </Text>
        </Tooltip>
      </Flex>
    </>
  );
}

export default RsbTooltip;
