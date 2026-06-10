"use client";
import {
  Badge,
  Button,
  Flex,
  Grid,
  Icon,
  IconButton,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  faHandHolding,
  faInfinity,
  faPager,
  faTruckRampBox,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IndeterminateCheckbox from "@/components/table/IndeterminateCheckbox";
import { DynamicTableUser } from "@/graphql/dynamicTableUser";
import { REMOVE_PRE_ALLOCATE_DRIVER } from "../../graphql/job";
import {
  formatAddress,
  formatDate,
  formatTime,
  // formatToTimeDate,
  outputDynamicTable,
} from "@/lib/helpers/helper";
import Image from "next/image";
import EditableFieldPopover from "@/components/jobs/EditableFieldPopover";
import React from "react";
import { MdMenu } from "react-icons/md";
import { RootState } from "@/lib/store/store";
import { useMutation } from "@apollo/client/react";
import { CloseIcon } from "@chakra-ui/icons";

type JobLabel = {
  id: number;
  type: "label";
  name: string;
  color?: string;
};

export const isAdmin = (state: RootState) => state.user.isAdmin;
// export const isCustomer = (state: RootState) => state.user.isCustomer;

export const PickupAddressBusinessNameCell = ({ row }: any) => (
  <>
    <Text fontSize="md">
      {row.originaljob.pick_up_destination.address_business_name || "-"}
    </Text>
    <Text fontSize="md" mb="2" minWidth={"300px"} flexWrap={"nowrap"}>
      {formatAddress(row?.original?.job?.pick_up_destinations)}
    </Text>
  </>
);
export const JobDestinationsCell = ({ row }: any) => {
  const destinations = row?.original?.job?.job_destinations || [];

  const filteredDestinations = destinations.filter(
    (destination: any) => destination?.is_pickup === false,
  );

  const first = filteredDestinations[0];

  const renderAddress = (destination: any) => {
    // if (destination?.is_saved_address) {
    //   // Only show business name if saved address
    //   return destination.address_business_name || "-";
    // } else {
    return (
      <>
        {/* {destination.address_business_name ? `${destination.address_business_name}\n` : ""}
        {destination.address_line_1 ? `${destination.address_line_1}\n` : ""} */}
        {destination.address_city}
        {"\n"}
        {destination.address_postal_code}, {destination.address_state}
      </>
    );
    // }
  };

  return (
    <>
      {first ? (
        <Text whiteSpace="pre-line" fontSize="md" minWidth={"170px"}>
          {renderAddress(first)}
        </Text>
      ) : (
        <Text>-</Text>
      )}

      {filteredDestinations.length > 1 && (
        <Popover placement="bottom" closeOnBlur={false}>
          <PopoverTrigger>
            <Text color="primary.400" cursor="pointer">
              <strong>View All</strong>
            </Text>
          </PopoverTrigger>
          <PopoverContent color="black" bg="black.100" borderColor="black.100">
            <PopoverHeader color="black" pt={4} fontWeight="bold" border="0">
              Delivery addresses:
            </PopoverHeader>
            <PopoverArrow bg="black.100" />
            <PopoverCloseButton />
            <PopoverBody>
              {filteredDestinations.map((destination: any, index: number) => (
                <Text
                  color="black"
                  mb="5"
                  key={`dest-${index}`}
                  whiteSpace="pre-line"
                >
                  Address {index + 1}: {renderAddress(destination)}
                </Text>
              ))}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export const JobDestinationsCellExport = ({ row }: any) => {
  const filteredDestinations = row?.original?.job?.job_destinations.filter(
    (destination: any) => destination.is_pickup === false,
  );

  return formatAddress(filteredDestinations[0]);
};
export const JobDestinationBusinessNameCell = ({ row }: any) => {
  const destinations = row?.original?.job?.job_destinations || [];
  const filteredDestinations = destinations.filter(
    (destination: any) => destination?.is_pickup === false,
  );

  const businessName = filteredDestinations[0]?.address_business_name || "-";

  return (
    <Text fontSize="md" textTransform="capitalize" minW="130px" maxW="170px">
      {businessName?.toLowerCase()}
    </Text>
  );
};

export const JobDestinationBusinessNameCellExport = ({ row }: any) => {
  const filteredDestinations = row?.original?.job?.job_destinations.filter(
    (destination: any) => destination.is_pickup === false,
  );
  return filteredDestinations[0]?.address_business_name || "-";
};
export const JobDestinationWithBusinessNameCell = ({ row }: any) => {
  const destinations = row?.original?.job?.job_destinations || [];
  const filteredDestinations = destinations.filter(
    (destination: any) => destination?.is_pickup === false,
  );
  const showDeliveryTime =
    row?.original?.job?.job_status?.id == 6 ||
    row?.original?.job?.job_status?.id == 7;

  // Only get media if not in status 6 or 7
  const normalMedia =
    filteredDestinations[0]?.media?.filter(
      (item: any) => item.collection_name !== "signatures",
    ) || [];

  return (
    <>
      {filteredDestinations[0]?.updated_at && showDeliveryTime && (
        <>
          <Text fontSize="md" color="blue.600" mb={1}>
            Arrival time:{" "}
            {formatDate(
              filteredDestinations[0].arrived_at,
              "HH:mm, DD/MM/YYYY",
            )}
          </Text>
          <Text fontSize="md" color="red.600" mb={1}>
            Delivery time:{" "}
            {formatDate(
              filteredDestinations[0].updated_at,
              "HH:mm, DD/MM/YYYY",
            )}
          </Text>
        </>
      )}
      <Text isTruncated w={"fit-content"}>
        {filteredDestinations.length > 0
          ? `${filteredDestinations[0].address_line_1}, ${filteredDestinations[0].address_city}, ${filteredDestinations[0].address_postal_code}`
          : "-"}
      </Text>
      <Text>{filteredDestinations[0]?.address_business_name || "-"}</Text>
      {normalMedia.length > 0 && (
        <Flex gap={2} flexWrap="wrap">
          {normalMedia.map((media: any, index: number) => (
            <Link key={`${index + 1}`} href={media.downloadable_url} isExternal>
              <Image
                src={media.downloadable_url}
                alt={media.name || "Delivery evidence"}
                width={50}
                height={50}
                style={{
                  objectFit: "cover",
                  borderRadius: "4px",
                  width: "50px",
                  height: "50px",
                }}
              />
            </Link>
          ))}
        </Flex>
      )}
    </>
  );
};
export const JobDestinationWithBusinessNameCellExport = ({ row }: any) => {
  const filteredDestinations = row?.original?.job?.job_destinations.filter(
    (destination: any) => destination.is_pickup === false,
  );
  const formattedAddress = formatAddress(filteredDestinations[0]);
  const businessName = filteredDestinations[0]?.address_business_name || "-";
  return `${formattedAddress}\n${businessName}`;
};
export const PickupAddressWithTimebulkCell = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );

  return (
    <Text mb="2" minWidth={"300px"} flexWrap={"nowrap"}>
      {`${pickupDest?.address_line_1}, ${pickupDest?.address_city}, ${pickupDest?.address_postal_code
        }\n ${pickupDest?.address_business_name || "-"}`}
    </Text>
  );
};
export const deliveryAddressWithTimebulkCell = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === false,
  );

  return (
    <Text mb="2" minWidth={"300px"} flexWrap={"nowrap"}>
      {`${pickupDest?.address_line_1}, ${pickupDest?.address_city}, ${pickupDest?.address_postal_code
        }\n ${pickupDest?.address_business_name || "-"}`}
    </Text>
  );
};
export const PickupAddressWithTimeCell = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );
  const showPickupTime =
    row?.original?.job?.job_status?.id == 4 ||
    row?.original?.job?.job_status?.id == 5 ||
    row?.original?.job?.job_status?.id == 6 ||
    row?.original?.job?.job_status?.id == 7;
  const normalMedia =
    pickupDest?.media?.filter(
      (item: any) => item.collection_name !== "signatures",
    ) || [];
  return (
    <>
      {pickupDest?.pickup_at && showPickupTime && (
        <>
          <Text fontSize="md" color="blue.600" mb={1}>
            Arrival time:{" "}
            {formatDate(pickupDest.arrived_at, "HH:mm, DD/MM/YYYY")}
          </Text>
          <Text fontSize="md" color="red.600" mb={1}>
            Collection time:{" "}
            {formatDate(pickupDest.pickup_at, "HH:mm, DD/MM/YYYY")}
          </Text>
        </>
      )}
      <Text>{pickupDest?.address_business_name || "-"}</Text>
      <Text mb="2" minWidth={"300px"} flexWrap={"nowrap"}>
        {`${pickupDest?.address_line_1}, ${pickupDest?.address_city}, ${pickupDest?.address_postal_code}`}
      </Text>

      {normalMedia.length > 0 && (
        <Flex gap={2} flexWrap="wrap">
          {normalMedia.map((media: any, index: number) => (
            <Link key={index} href={media.downloadable_url} isExternal>
              <Image
                src={media.downloadable_url}
                alt={media.name || "Pickup evidence"}
                width={50}
                height={50}
                style={{
                  objectFit: "cover",
                  borderRadius: "4px",
                  width: "50px",
                  height: "50px",
                }}
              />
            </Link>
          ))}
        </Flex>
      )}
    </>
  );
};
export const PickupAddressWithTimeCellExport = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );
  const collectionTime = pickupDest?.pickup_at
    ? `Collection time: ${formatDate(
      pickupDest.pickup_at,
      "HH:mm, DD/MM/YYYY",
    )}\n`
    : "";

  return `${collectionTime}${formatAddress(
    row?.original?.job?.pick_up_destination,
  )}\n${row?.original?.job?.pick_up_destination?.address_business_name || "-"}`;
};
export const PickupAddressWithTimewithoutMediaCell = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );
  const showPickupTime =
    row?.original?.job?.job_status?.id == 4 ||
    row?.original?.job?.job_status?.id == 5 ||
    row?.original?.job?.job_status?.id == 6 ||
    row?.original?.job?.job_status?.id == 7;

  return (
    <>
      {pickupDest?.pickup_at && showPickupTime && (
        <>
          <Text fontSize="md" color="blue.600" mb={1}>
            Arrival time:{" "}
            {formatDate(pickupDest.arrived_at, "HH:mm, DD/MM/YYYY")}
          </Text>
          <Text fontSize="md" color="red.600" mb={1}>
            Collection time:{" "}
            {formatDate(pickupDest.pickup_at, "HH:mm, DD/MM/YYYY")}
          </Text>
        </>
      )}
      <Text fontSize="md">{pickupDest?.address_business_name || "-"}</Text>
      <Text mb="2" fontSize="md" minWidth={"300px"} flexWrap={"nowrap"}>
        {`${pickupDest?.address_line_1}, ${pickupDest?.address_city}, ${pickupDest?.address_postal_code}`}
      </Text>
    </>
  );
};
export const JobDestinationWithBusinessNamewithoutMediaCell = ({
  row,
}: any) => {
  const destinations = row?.original?.job?.job_destinations || [];
  const filteredDestinations = destinations.filter(
    (destination: any) => destination?.is_pickup === false,
  );
  const showDeliveryTime =
    row?.original?.job?.job_status?.id == 6 ||
    row?.original?.job?.job_status?.id == 7;

  return (
    <>
      {filteredDestinations[0]?.updated_at && showDeliveryTime && (
        <>
          <Text fontSize="md" color="blue.600" mb={1}>
            Arrival time:{" "}
            {formatDate(
              filteredDestinations[0].arrived_at,
              "HH:mm, DD/MM/YYYY",
            )}
          </Text>
          <Text fontSize="md" color="red.600" mb={1}>
            Delivery time:{" "}
            {formatDate(
              filteredDestinations[0].updated_at,
              "HH:mm, DD/MM/YYYY",
            )}
          </Text>
        </>
      )}
      <Text fontSize="md">
        {filteredDestinations[0]?.address_business_name || "-"}
      </Text>
      <Text fontSize="md" isTruncated w={"fit-content"}>
        {filteredDestinations.length > 0
          ? `${filteredDestinations[0].address_line_1}, ${filteredDestinations[0].address_city}, ${filteredDestinations[0].address_postal_code}`
          : "-"}
      </Text>
    </>
  );
};

export const ReadyDropByCell = ({ row }: any) => {
  return (
    <>
      <Text fontSize="md" isTruncated w={"fit-content"}>
        {row?.original?.job?.job_category?.name ?? "-"}
      </Text>
      <Text isTruncated fontSize="md" w={"fit-content"}>
        R: {formatTime(row?.original?.job?.ready_at)}
      </Text>
      <Text isTruncated fontSize="md" w={"fit-content"}>
        D: {formatTime(row?.original?.job?.drop_at)}
      </Text>
    </>
  );
};

export const ReadyDropByCellExport = ({ row }: any) =>
  `${row?.original?.job?.job_category?.name ?? "-"}\n
    R: ${formatTime(row?.original?.job?.ready_at)}\n
    D: ${formatTime(row?.original?.job?.drop_at)}`;

export const NotesCell = ({ row }: any) => {
  const current = row?.original?.job?.customer_notes ?? "";
  const [display, setDisplay] = React.useState(current);

  React.useEffect(() => {
    setDisplay(current);
  }, [current]);

  return (
    <Flex gap={2} align="center">
      <Text fontSize="md" maxW="200px" noOfLines={3}>
        {display || "-"}
      </Text>
      <EditableFieldPopover
        row={row}
        field="customer_notes"
        triggerAriaLabel="Edit customer notes"
        onSaved={setDisplay}
      />
    </Flex>
  );
};

export const ItemsTypeCell = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return (
    <div>
      {items?.map((item: any) => (
        <Text fontSize="md" key={`items-type-${item?.id}`} mb={2}>
          {item.item_type.name}
        </Text>
      ))}
    </div>
  );
};
export const ItemsTypeCellExport = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return items?.map((item: any) => {
    return [`${item.item_type.name}  \n`];
  });
};
export const ItemsDimensionCell = ({ row }: any) => {
  const items = row?.original?.job?.job_items || [];
  const [showAll, setShowAll] = React.useState(false);

  const visibleItems = showAll ? items : items.slice(0, 2);

  return (
    // <VStack align="start" spacing={1}>
    //   {visibleItems.map((item: any) => (
    //     <Text
    //       fontSize="md"
    //       key={`items-dimension-${item?.id}`}
    //       w="max-content"
    //     >
    //       {`${(item.quantity)} x ${(item.weight)} x ${(item.dimension_height * 100).toFixed(0)}x${(
    //         item.dimension_width * 100
    //       ).toFixed(0)}x${(item.dimension_depth * 100).toFixed(0)}`}
    //     </Text>
    //   ))}

    //   {items.length > 2 && (
    //     <Button
    //       size="xs"
    //       variant="link"
    //       colorScheme="blue"
    //       onClick={() => setShowAll(!showAll)}
    //     >
    //       {showAll ? "Less" : `+${items.length - 2} More`}
    //     </Button>
    //   )}
    // </VStack>
    <VStack align="stretch" spacing={1} w="100%">
      {visibleItems.map((item: any) => (
        <Grid
          key={`items-dimension-${item?.id}`}
          templateColumns="120px 50px 40px 80px 80px"
          columnGap={4}
          fontSize="md"
        >
          {/* Dimensions */}
          <Text>
            {(item.dimension_height * 100).toFixed(0)}x
            {(item.dimension_width * 100).toFixed(0)}x
            {(item.dimension_depth * 100).toFixed(0)}
          </Text>
          <Text>{item?.item_type?.name}</Text>

          {/* Quantity */}
          <Text textAlign="right">{item.quantity}</Text>

          {/* Weight */}
          <Text textAlign="right">{item.weight}kg</Text>

          {/* CBM (volume from API) */}
          <Text textAlign="right">{item.volume?.toFixed(2)}cbm</Text>
        </Grid>
      ))}

      {items.length > 2 && (
        <Button
          size="xs"
          variant="link"
          colorScheme="blue"
          onClick={() => setShowAll(!showAll)}
          alignSelf="flex-start"
        >
          {showAll ? "Less" : `+${items.length - 2} More`}
        </Button>
      )}
    </VStack>
  );
};
export const ItemsDimensionCellExport = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return items?.map((item: any) => {
    return [
      `${(item.quantity * 100)?.toFixed(2)}x `,
      `${(item.weight * 100)?.toFixed(2)}cm x `,
      `${(item.dimension_height * 100)?.toFixed(2)}cm x `,
      `${(item.dimension_width * 100)?.toFixed(2)}cm x `,
      `${(item.dimension_depth * 100)?.toFixed(2)}cm  \n`,
    ];
  });
};
export const ItemsQuantityCell = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return (
    <div>
      {items?.map((item: any) => (
        <Text key={`items-quantity-${item?.id}`} mb={2}>
          {item?.quantity}
        </Text>
      ))}
    </div>
  );
};
export const ItemsQuantityCellExport = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return items?.map((item: any) => {
    return [`${item?.quantity}  \n`];
  });
};
export const ItemsWeightCell = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return (
    <div>
      {items?.map((item: any) => (
        <Text key={`items-weight-${item?.id}`} mb={2}>
          {item?.weight}kg
        </Text>
      ))}
    </div>
  );
};
export const ItemsWeightCellExport = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return items?.map((item: any) => {
    return [`${item?.weight}kg  \n`];
  });
};
export const ItemsCbmCell = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return (
    <div>
      {items?.map((item: any) => (
        <Text key={`items-cbm-${item?.id}`} mb={2}>
          {item.volume?.toFixed(2)}cbm
        </Text>
      ))}
    </div>
  );
};
export const ItemsExtrasCell = ({ row }: any) => {
  return (
    <Text
      minW="140px"
      fontSize="26px"
      whiteSpace="nowrap"
      fontWeight="800"
      letterSpacing="1.5px"
      textAlign="center"
      color="white"
      textShadow="
        2px 2px 0 rgba(0,0,0,0.95),
        4px 4px 6px rgba(0,0,0,0.65)
      "
    >
      {row?.original?.job?.extras || "-"}
    </Text>
  );
};

export const DriverCell = ({ row }: any) => {
  return (
    <Text fontSize="md">{row?.original?.job?.driver?.full_name || "-"}</Text>
  );
};
export const ItemsCbmCellExport = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return items?.map((item: any) => {
    return [`${item.volume?.toFixed(2)}cbm  \n`];
  });
};
export const BookedByCell = ({ row }: any) => {
  const name = row?.original?.job?.company?.name || "-";
  return (
    <Text fontSize="md" maxW="150px" minW="100px">
      {name}
    </Text>
  );
};


export const JobTypeCell: React.FC<{
  row: { original: { job: { job_type?: { name: string } } } };
}> = ({ row }) => {
  const type = row.original.job?.job_type?.name || "-";

  const getTypeColors = (type: string) => {
    switch (type.toLowerCase()) {
      case "standard":
        return { color: "white", bg: "purple.500" };
      case "urgent":
        return { color: "white", bg: "red.500" };
      case "express":
        return { color: "white", bg: "orange.500" };
      default:
        return { color: "black", bg: "gray.200" };
    }
  };

  const { color, bg } = getTypeColors(type);

  return (
    <Badge
      color={color}
      bg={bg}
      fontWeight="bold"
      px={2}
      py={1}
      borderRadius="md"
      textTransform="capitalize"
    >
      {type}
    </Badge>
  );
};
export const StatusCell = ({ row }: any) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "blue.500";
      case "unassigned":
        return "gray.500";
      case "in transit":
        return "green.400";
      case "en route for pickup":
        return "orange.400";
      case "assigned":
        return "purple.400";
      default:
        return "black";
    }
  };

  return (
    <Text
      color={getStatusColor(row?.original?.job?.job_status?.name)}
      fontWeight="bold"
    >
      {row?.original?.job?.job_status?.name || "-"}
    </Text>
  );
};

export const ReadyAtCell = ({ row }: any) => {
  return (
    <Flex direction="column" gap={1} minWidth="150px">
      <Text fontSize="md" fontWeight="500">
        Created:
        {formatDate(row?.original?.job?.created_at) || "-"}
      </Text>
      <Text fontSize="md">
        Scheduled:
        {formatDate(row?.original?.job?.drop_at) || "-"}
        {/* It was ready_at initially, changed to drop_at as per client request,now adding both  */}
      </Text>
    </Flex>
  );
};

export const LastFreeAtCell = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="150px" minW="150px">
      {row?.original?.job?.last_free_at || "-"}
    </Text>
  );
};
export const PickupBusinessNameCell = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );
  return (
    <Text fontSize="md" maxW="150px" minW="100px">
      {pickupDest?.address_business_name || "-"}
    </Text>
  );
};

export const PickupAddressCell = ({ row }: any) => {
  const pickup = row?.original?.job?.job_destinations?.find(
    (d: any) => d.is_pickup === true,
  );

  if (!pickup) return <>-</>;

  const renderPickupAddress = (pickup: any) => {
    // if (pickup?.is_saved_address) {
    //   // Only show business name
    //   return pickup.address_business_name || "-";
    // }

    // Show full address
    return (
      <>
        {/* {pickup.address_business_name ? `${pickup.address_business_name}\n` : ""}
        {pickup.address_line_1 ? `${pickup.address_line_1}\n` : ""} */}
        {pickup.address_city}, {pickup.address_postal_code}{" "}
        {pickup.address_state}
      </>
    );
  };

  return (
    <Text
      whiteSpace="pre-line"
      textTransform="capitalize"
      fontSize="md"
      minWidth={"170px"}
    >
      {renderPickupAddress(pickup)}
    </Text>
  );
};

export const CustomerReferenceCell = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="150px" noOfLines={2}>
      {" "}
      {row?.original?.job?.reference_no || "-"}
    </Text>
  );
};

export const CategoryCell = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="100px">
      {row?.original?.job?.job_category?.name || "-"}
    </Text>
  );
};

export const DeliveryCell = ({ row, refetchTable }) => {
  const job = row?.original?.job;
  const toast = useToast();
  const labels: JobLabel[] = Array.isArray(job?.meta) ? job.meta : [];

  const canRemove = !!job?.preallocation_driver_id;

  const getBadgeStyle = (color?: string) => ({
    bg: color?.startsWith("#") ? color : color || "gray",
    color: "#fff",
    boxShadow: `0 0 0 1px ${color || "gray"}`,
  });

  // ✅ ICON CONFIG (Cleaner)
  const jobIcons = [
    {
      condition: job?.is_inbound_connect,
      label: "Inbound Connect",
      icon: faInfinity,
    },
    {
      condition: job?.is_paperwork_required,
      label: "Paperwork Required",
      icon: faPager,
    },
    {
      condition: job?.is_hand_unloading,
      label: "Handling",
      icon: faHandHolding,
    },
    {
      condition: job?.is_dangerous_goods,
      label: "Dangerous goods",
      icon: faWarning,
    },
    {
      condition: job?.is_tailgate_required,
      label: "Tail lift",
      icon: faTruckRampBox,
    },
  ];

  const [removeDriver, { loading }] = useMutation(REMOVE_PRE_ALLOCATE_DRIVER, {
    onCompleted: () => {
      toast({
        title: "Removed job from driver",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetchTable?.();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleRemove = () => {
    removeDriver({
      variables: {
        input: {
          id: job?.id,
          customer_id: job.customer?.id,
          company_id: job.company?.id,
          job_type_id: job.job_type?.id,
          name: job.name,
          preallocation_driver_id: null,
          driver_id: job.driver_id || null,
          d_sort_id: job.d_sort_id || null,
          sort_datetime: job.sort_datetime || null,
        },
      },
    });
  };

  return (
    <>
      {/* LABELS */}
      {labels.length > 0 && (
        <VStack align="start" spacing="4px" mb="10px">
          {labels.map((label) => (
            <Badge
              key={label?.id}
              fontSize="12px"
              px="8px"
              py="2px"
              borderRadius="4px"
              whiteSpace="nowrap"
              {...getBadgeStyle(label.color)}
            >
              {label.name}
            </Badge>
          ))}
        </VStack>
      )}

      <Flex direction="column" w="100%" maxW="150px">
        {/* ROW 1 */}
        <Flex align="center" justify="space-between" w="100%">
          {canRemove && (
            <Tooltip label="Remove Job from Driver">
              <IconButton
                aria-label="Remove Job"
                icon={<CloseIcon />}
                size="xs"
                color="red.500"
                variant="ghost"
                isLoading={loading}
                onClick={handleRemove}
              />
            </Tooltip>
          )}

          <Text ml="2" noOfLines={1}>
            {job?.name || "-"}
          </Text>
        </Flex>

        {/* ROW 2 - ICONS */}
        <Flex
          justify={canRemove ? "flex-end" : "flex-start"}
          gap={1}
          mt="1"
          ml="2"
        >
          {jobIcons
            .filter((item) => item.condition)
            .map((item, index) => (
              <Tooltip key={index} label={item.label}>
                <FontAwesomeIcon
                  icon={item.icon}
                  className="!text-[var(--chakra-colors-red-400)] p-1"
                  size="sm"
                />
              </Tooltip>
            ))}
        </Flex>
      </Flex>
    </>
  );
};

export const DeliveryCellBulkAssign = ({ row }: any) => {
  const job = row?.original?.job;
  return (
    <Flex align="center" justify="space-between" maxW="150px">
      <Text mr="2" noOfLines={1}>
        {job?.name || "-"}
      </Text>
    </Flex>
  );
};



export const AdminNotesCell = ({ row }: any) => {
  const current = row?.original?.job?.admin_notes ?? "";
  const [display, setDisplay] = React.useState(current);

  React.useEffect(() => {
    setDisplay(current);
  }, [current]);

  return (
    <Flex gap={2} align="center">
      <Text fontSize="md" maxW="200px" noOfLines={2}>
        {display || "-"}
      </Text>
      <EditableFieldPopover
        row={row}
        field="admin_notes"
        multiline
        triggerAriaLabel="Edit admin notes"
        onSaved={setDisplay}
      />
    </Flex>
  );
};

export const TimeslotCell = ({ row, refetchJobs }: any) => {
  return (
    <Flex gap={2} align="center">
      <Text maxW="140px" fontSize="md" fontWeight="bold" noOfLines={1}>
        {row?.original?.job?.timeslot || "-"}
      </Text>
      <EditableFieldPopover
        row={row}
        field="timeslot"
        triggerAriaLabel="Edit timeslot"
        refetchJobs={refetchJobs}
      />
    </Flex>
  );
};

export const TotalQuantityCell = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="100px">
      {row?.original?.job?.total_quantity || "-"}
    </Text>
  );
};
export const TotalWeightCell = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="120px">
      {row?.original?.job?.total_weight || "-"}
    </Text>
  );
};
export const TotalVolumeCell = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="120px">
      {row?.original?.job?.total_volume || "-"}
    </Text>
  );
};

export const Charges = ({ row }: any) => {
  const charges = row?.original?.job?.price_summary?.charges || [];

  return (
    <>
      {charges.length > 0 ? (
        charges.map((item: any, index: number) => (
          <Text key={index} fontSize="md" w="180px">
            {item.name} - ${item.total}
          </Text>
        ))
      ) : (
        <Text fontSize="md">0</Text>
      )}
    </>
  );
};

export const SubTotal = ({ row }: any) => {
  const subTotal = Number(row?.original?.job?.price_summary?.sub_total || 0);
  const tax = Number(row?.original?.job?.price_summary?.tax || 0);
  const total = Number(row?.original?.job?.price_summary?.total || 0);
  const driverPay = Number(row?.original?.job?.driver_pay || 0);
  const driverId = row?.original?.job?.driver_id;

  const isAllZero = subTotal === 0 && tax === 0 && total === 0;

  return (
    <>
      <Text fontSize="md" w="250px">
        {isAllZero ? "Invoice: 0" : `Invoice: ${subTotal}+${tax}= $${total}`}
      </Text>

      {/* {driverId && ( */}
      {driverId !== null && driverId !== undefined && (
        <Text fontSize="md" w="250px">
          Driver Pay: $ {driverPay}
        </Text>
      )}
    </>
  );
};

export const Tax = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="150px">
      {row?.original?.job?.price_summary?.tax || "0"}
    </Text>
  );
};

export const TotalPrice = ({ row }: any) => {
  return (
    <Text fontSize="md" maxW="160px">
      {row?.original?.job?.price_summary?.total || "0"}
    </Text>
  );
};

export const SuburbAreaCell = ({ row }: any) => {
  const area = row?.original?.job?.suburb_area || "";
  const bgColor = row?.original?.job?.area_color || "#751010"; // fallback color

  return (
    <>
      <Badge
        bg={bgColor}
        color="white"
        maxW="100px"
        px={2}
        py={1}
        borderRadius="md"
        textTransform="capitalize"
      >
        {area}
      </Badge>
      <Text fontSize="xs" mt={1}>
        {row?.original?.job?.driver?.full_name || ""}
      </Text>
    </>
  );
};

export const FromQuadCell = ({ row }: any) => {
  const fromQuad = row?.original?.job?.pickup_quad || "";
  return (
    <>
      <Text mt={1} fontSize="md" fontWeight="bold">
        {fromQuad}
      </Text>
    </>
  );
};

export const ToQuadCell = ({ row }: any) => {
  const toQuad = row?.original?.job?.delivery_quad || "";

  return (
    <>
      <Text mt={1} fontSize="md" fontWeight="bold">
        {toQuad}
      </Text>
    </>
  );
};

const MEDIA_CELL: Record<string, { with: any; without: any }> = {
  "pick_up_destination.address_formatted,pick_up_destination.address_business_name":
  {
    with: PickupAddressWithTimeCell,
    without: PickupAddressWithTimewithoutMediaCell,
  },
  "job_destinations.address,job_destinations.address_business_name": {
    with: JobDestinationWithBusinessNameCell,
    without: JobDestinationWithBusinessNamewithoutMediaCell,
  },
};

// Replace the Cell for specific columns based on withMedia flag
function applyMediaCells(cols: any[], withMedia: boolean): any[] {
  return cols.map((col) => {
    const media = MEDIA_CELL[col?.id];
    if (!media) return col;
    return {
      ...col,
      Cell: withMedia ? media.with : media.without,
    };
  });
}

// de-dupe helper (keeps first occurrence)
function uniqueById(cols: any[]): any[] {
  const seen = new Set<string>();
  return cols.filter((c) =>
    seen.has(c?.id) ? false : (seen.add(c?.id), true),
  );
}

export const tableColumn = (refetchJobs: () => void) => [
  {
    id: "name",
    header: "Delivery ID",
    cell: ({ row }: any) => <DeliveryCell row={row} refetchTable={refetchJobs} />,
    accessorFn: (row: any) => row?.job?.id || 0,
    enableSorting: true,
  },
  {
    id: "suburb_area,area_color",
    header: "Quad",
    cell: SuburbAreaCell,
    accessorFn: (row: any) => row?.job?.suburb_area || "",
    enableSorting: true,
  },
  {
    id: "pickup_quad",
    header: "From Quad",
    cell: FromQuadCell,
  },
  {
    id: "delivery_quad",
    header: "To Quad",
    cell: ToQuadCell,
  },
  {
    id: "job_type.name",
    header: "Type",
    cell: JobTypeCell,
  },
  {
    id: "pick_up_destination.address_formatted",
    header: "Pickup From",
    cell: PickupAddressCell,
  },
  {
    id: "pick_up_destination.address_formatted,pick_up_destination.address_business_name",
    header: "Pickup Address and Name",
    cell: PickupAddressWithTimewithoutMediaCell,
    CellExport: PickupAddressWithTimeCellExport,
  },
  {
    id: "pick_up_destination.address_business_name",
    header: "Pickup Company",
    cell: PickupBusinessNameCell,
  },
  {
    id: "job_destinations.address",
    header: "Delivery To",
    cell: JobDestinationsCell,
    CellExport: JobDestinationsCellExport,
  },
  {
    id: "job_destinations.address_business_name",
    header: "Del. Company",
    cell: JobDestinationBusinessNameCell,
    CellExport: JobDestinationBusinessNameCellExport,
  },
  {
    id: "total_quantity",
    header: "Pcs/Qty",
    cell: TotalQuantityCell,
  },
  {
    id: "total_weight",
    header: "Weight",
    cell: TotalWeightCell,
  },
  {
    id: "total_volume",
    header: "CBM",
    cell: TotalVolumeCell,
  },
  {
    id: "price_summary.charges",
    header: "Charges",
    cell: Charges,
  },
  {
    id: "price_summary.sub_total",
    header: "Total",
    cell: SubTotal,
  },
  {
    id: "price_summary.tax",
    header: "Tax",
    cell: Tax,
  },
  {
    id: "price_summary.total",
    header: "Total Price",
    cell: TotalPrice,
  },
  {
    id: "job_destinations.address,job_destinations.address_business_name",
    header: "Delivery Address and Name",
    cell: JobDestinationWithBusinessNamewithoutMediaCell,
    CellExport: JobDestinationWithBusinessNameCellExport,
  },
  {
    id: "reference_no",
    header: "Customer Ref.",
    cell: CustomerReferenceCell,
  },
  {
    id: "job_category.name",
    header: "category",
    cell: CategoryCell,
  },
  {
    id: "company.name",
    header: "Company",
    cell: BookedByCell,
  },
  {
    id: "ready_at",
    header: "Date",
    cell: ReadyAtCell,
  },
  {
    id: "job_category.name,ready_at,drop_at",
    header: "Ready By / Drop by",
    cell: ReadyDropByCell,
    CellExport: ReadyDropByCellExport,
  },
  {
    id: "timeslot",
    header: "Timeslot",
    cell: ({ row }: any) => <TimeslotCell row={row} refetchJobs={refetchJobs} />,
  },
  {
    id: "last_free_at",
    header: "Last Free Day",
    cell: LastFreeAtCell,
  },
  {
    id: "job_items.dimensions",
    header: "Dimensions",
    cell: ItemsDimensionCell,
    CellExport: ItemsDimensionCellExport,
  },
  {
    id: "customer_notes",
    header: "Client notes",
    cell: NotesCell,
  },
  {
    id: "admin_notes",
    header: "Admin Notes",
    accessorKey: "admin_notes" as const,
    cell: AdminNotesCell,
  },
];

export const getColumnsPre = (
  isAdmin: boolean,
  // isCustomer: boolean,
  withMedia: boolean,
  refetchJobs?: () => void,
  dynamicTableUsers?: DynamicTableUser[],
  // setSelectedJobs?: any,
) => {
  // 1) Selection checkbox column
  const base: any[] = [
    {
      id: "selection",
      header: ({ table }: any) => (
        <div>
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div>
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected?.() ?? false}
            disabled={row.getCanSelect ? !row.getCanSelect() : false}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
  ];

  // 2) If no config yet, show your default tableColumn only
  if (!dynamicTableUsers || dynamicTableUsers.length === 0) {
    const cols = uniqueById([
      ...base,
      ...tableColumn(refetchJobs), // your static defaults
      // {
      //   id: "actions",
      //   Header: "Actions",
      //   accessor: "id" as const,
      //   isView: isCustomer,
      //   isEdit: isAdmin,
      //   isTracking: isCustomer,
      // },
    ]);
    // Swap Cells for the special two if they exist in tableColumn
    return applyMediaCells(cols, withMedia);
  }
  // 3) Build from dynamic selection
  // NOTE: outputDynamicTable should only include columns that are active:true.
  let columns = [
    ...base,
    ...outputDynamicTable(dynamicTableUsers, tableColumn(refetchJobs)),
  ];

  // 4) Swap only the Cell for the 2 special fields based on withMedia
  columns = applyMediaCells(columns, withMedia);

  // 5) Ensure Actions at the end and de-dupe
  columns = uniqueById([
    ...columns,
    // {
    //   id: "actions",
    //   Header: "Actions",
    //   accessor: "id" as const,
    //   isView: isCustomer,
    //   isEdit: isAdmin,
    //   isTracking: isCustomer,
    // },
  ]);

  return columns;
};

export const bulkassigntableColumn = [
  {
    id: "name",
    header: "Delivery ID",
    cell: DeliveryCell,
  },
  {
    id: "job_type.name",
    header: "Type",
    cell: JobTypeCell,
  },
  {
    id: "pick_up_destination.address_formatted",
    header: "Pickup From",
    cell: PickupAddressCell,
  },
  {
    id: "pick_up_destination.address_formatted,pick_up_destination.address_business_name",
    header: "Pickup Address and Name",
    cell: PickupAddressWithTimewithoutMediaCell,
    CellExport: PickupAddressWithTimeCellExport,
  },
  {
    id: "pick_up_destination.address_business_name",
    header: "Pickup Company",
    cell: PickupBusinessNameCell,
  },
  {
    id: "job_destinations.address",
    header: "Delivery To",
    cell: JobDestinationsCell,
    CellExport: JobDestinationsCellExport,
  },
  {
    id: "job_destinations.address_business_name",
    header: "Del. Company",
    cell: JobDestinationBusinessNameCell,
    CellExport: JobDestinationBusinessNameCellExport,
  },
  {
    id: "total_quantity",
    header: "Pcs/Qty",
    cell: TotalQuantityCell,
  },
  {
    id: "total_weight",
    header: "Weight",
    cell: TotalWeightCell,
  },
  {
    id: "total_volume",
    header: "CBM",
    cell: TotalVolumeCell,
  },
  {
    id: "price_summary.charges",
    header: "Charges",
    cell: Charges,
  },
  {
    id: "price_summary.sub_total",
    header: "Total",
    cell: SubTotal,
  },
  {
    id: "price_summary.tax",
    header: "Tax",
    cell: Tax,
  },
  {
    id: "price_summary.total",
    header: "Total Price",
    cell: TotalPrice,
  },
  {
    id: "job_destinations.address,job_destinations.address_business_name",
    header: "Delivery Address and Name",
    cell: JobDestinationWithBusinessNamewithoutMediaCell,
    CellExport: JobDestinationWithBusinessNameCellExport,
  },
  {
    id: "reference_no",
    header: "Customer Ref.",
    cell: CustomerReferenceCell,
  },
  {
    id: "job_category.name",
    header: "category",
    cell: CategoryCell,
  },
  {
    id: "pickup_quad",
    header: "From Quad",
    cell: FromQuadCell,
  },
  {
    id: "delivery_quad",
    header: "To Quad",
    cell: ToQuadCell,
  },
  {
    id: "suburb_area,area_color",
    header: "Quad",
    cell: SuburbAreaCell,
  },
  {
    id: "company.name",
    header: "Company",
    cell: BookedByCell,
  },
  {
    id: "ready_at",
    header: "Date",
    cell: ReadyAtCell,
  },
  {
    id: "job_category.name,ready_at,drop_at",
    header: "Ready By / Drop by",
    cell: ReadyDropByCell,
    CellExport: ReadyDropByCellExport,
  },
  {
    id: "timeslot",
    header: "Timeslot",
    cell: ({ row }: any) => <TimeslotCell row={row} />,
  },
  {
    id: "last_free_at",
    header: "Last Free Day",
    cell: LastFreeAtCell,
  },
  {
    id: "job_items.dimensions",
    header: "Dimensions",
    cell: ItemsDimensionCell,
    CellExport: ItemsDimensionCellExport,
  },
  {
    id: "customer_notes",
    header: "Client notes",
    cell: NotesCell,
  },
  {
    id: "admin_notes",
    header: "Admin Notes",
    accessorKey: "admin_notes" as const,
    cell: AdminNotesCell,
  },
];

export const getBulkAssignColumns = (
  isAdmin: boolean,
  isCustomer: boolean,
  dynamicTableUsers?: DynamicTableUser[],
) => {
  if (dynamicTableUsers === undefined || dynamicTableUsers.length === 0) {
    return [
      {
        id: "order",
        header: "",
        cell: ({ }: any) => (
          <div>
            <Icon mt="auto" mb="auto" as={MdMenu} h="16px" w="16px" me="8px" />
          </div>
        ),
      },
      ...bulkassigntableColumn,
      {
        // id: "actions",
        // header: "Actions",
        // accessorKey: "id" as const,
        // isView: isCustomer,
        // isEdit: isAdmin,
        // isTracking: isCustomer,
      },
    ];
  }

  const dynamicColumns = outputDynamicTable(
    dynamicTableUsers,
    bulkassigntableColumn,
  );

  var columns: any[] = [
    {
      id: "order",
      header: "",
      cell: ({ }: any) => (
        <div>
          <Icon as={MdMenu} h="16px" w="16px" me="8px" />
        </div>
      ),
    },
  ];

  columns.push(...dynamicColumns);

  return columns;
};