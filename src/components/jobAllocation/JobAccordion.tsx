import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Button,
  Divider,
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
// import { useColorMode } from "@chakra-ui/system";
import {
  faEye,
  faHandHolding,
  faInfinity,
  faMap,
  faTruckRampBox,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFromNow, formatTime } from "@/lib/helpers/helper";
import RsbJobIndicatorCircle from "../sidebar/components/RsbJobIndicatorCircle";

export function JobAccordion({
  job,
  selectedJobIdRouting,
  onJobClick,
  onMarkerClick,
  // ...props
}: {
  job: any;
  selectedJobIdRouting: any;
  onJobClick: any;
  onMarkerClick: any;
}) {
  // const { colorMode } = useColorMode();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  return (
    <Accordion
      key={`jtj-${job.id}`}
      variant="jobDetails"
      defaultIndex={[0]}
      allowMultiple
    >
      <AccordionItem mb="3">
        {/* Card title */}
        <AccordionButton sx={{ padding: "8px" }}>
          <div className="w-full">
            <div className="w-full flex items-center justify-between">
              <div className="grow shrink basis-0">
                <p className="text-left text-xs !font-bold">#{job.name}</p>
                <p className="text-left text-xs !font-medium !text-black">
                  {job.total_weight || "n/a "}kg, {job.total_volume || "n/a "}
                  cbm
                </p>
              </div>

              <div className=" grow shrink basis-0">
                {/*
                  TODO: Put this time var in and uncommend the line below this
                  <p className="text-xs !font-bold">13:30pm</p>
                  */}
                <p className="text-xxs !font-bold !text-black">
                  {job.pick_up_destination.address_city},{" "}
                  {job.pick_up_destination.address_postal_code}
                </p>
              </div>

              <div className="flex items-center justify-end grow shrink basis-0">
                {job.driver_id == null && (
                  <p className="text-xs !font-bold">
                    {formatFromNow(job.created_at)}
                  </p>
                )}

                <Avatar
                  variant="jobAllocation"
                  ml="1"
                  src={
                    job.driver
                      ? job.driver.media_url
                      : "/img/avatars/driverIcon.png"
                  }
                />
              </div>
            </div>
          </div>
        </AccordionButton>

        <AccordionPanel px="2" pb="0">
          <Divider className="mb-2" />

          <div className="job-destination-card-wrap">
            {job.job_destinations.map((job_destination: any, index: number) => {
              return (
                <Flex
                  key={`k-${index}`}
                  className="job-destination-card pb-3 last:pb-0"
                >
                  <RsbJobIndicatorCircle
                    destinationStatus={
                      job_destination.job_destination_status_id
                    }
                  />
                  <div key={`jd-${job_destination.id}`} className="">
                    {/* Pickup or dropoff time */}
                    <Text color={textColor} className="text-xs !font-bold">
                      {job_destination.is_pickup ? "Pickup" : "Drop-off"}{" "}
                      {formatTime(job_destination.estimated_at)}
                    </Text>

                    {/* Location for Pickup or dropoff */}
                    <Text
                      color={textColor}
                      className="text-xs !font-medium"
                    >{`${job_destination.address_city} ${job_destination.address_postal_code}`}</Text>
                  </div>
                </Flex>
              );
            })}
          </div>

          <Divider className="my-2" />

          {/* Buttons */}
          <Flex justifyContent="flex-end" className="mb-2">
            <Flex className="px-4 py-2">
              {job.is_inbound_connect && (
                <Tooltip label="Inbound Connect">
                  <FontAwesomeIcon
                    icon={faInfinity}
                    className="!text-[var(--chakra-colors-red-400)] p-1"
                    size="sm"
                  />
                </Tooltip>
              )}
              {job.is_hand_unloading && (
                <Tooltip label="Handling">
                  <FontAwesomeIcon
                    icon={faHandHolding}
                    className="!text-[var(--chakra-colors-red-400)] p-1"
                    size="sm"
                  />
                </Tooltip>
              )}
              {job.is_dangerous_goods && (
                <Tooltip label="Dangerous goods">
                  <FontAwesomeIcon
                    icon={faWarning}
                    className="!text-[var(--chakra-colors-red-400)] p-1"
                    size="sm"
                  />
                </Tooltip>
              )}
              {job.is_tailgate_required && (
                <Tooltip label="Tail lift">
                  <FontAwesomeIcon
                    icon={faTruckRampBox}
                    className="!text-[var(--chakra-colors-red-400)] p-1"
                    size="sm"
                  />
                </Tooltip>
              )}
            </Flex>
            <Button
              aria-label="left button"
              variant="secondary"
              className="!py-[8px] !h-[36px] !w-[90px] !min-w-[90px] ml-auto mr-3 text-[var(--chakra-colors-primary-400)]"
              onClick={() => onMarkerClick(job.job_destinations[0])}
            >
              <FontAwesomeIcon icon={faEye} className="mr-1" />
              Details
            </Button>

            <Button
              aria-label="right button"
              variant="secondary"
              className={
                "!py-[8px] !h-[36px] !w-[90px] !min-w-[90px] text-[var(--chakra-colors-primary-400)] hover:bg-[var(--chakra-colors-primary-500)] " +
                (selectedJobIdRouting == job.id
                  ? "!text-white !bg-[var(--chakra-colors-primary-400)]"
                  : "bg-[var(--chakra-colors-primary-200)] hover:bg-[var(--chakra-colors-primaryHover-200)]")
              }
              onClick={() => onJobClick(job)}
            // colorScheme={selectedJobIdRouting == job.id ? "blue" : "gray"}
            >
              <FontAwesomeIcon icon={faMap} className="mr-1" />
              Map
            </Button>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}