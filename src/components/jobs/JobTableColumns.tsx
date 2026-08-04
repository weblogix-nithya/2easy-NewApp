"use client";
// import { useMutation } from "@apollo/client";
// import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Flex,
  Icon,
  IconButton,
  // IconButton,
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
  VStack,
  // Textarea,
  // useToast,
} from "@chakra-ui/react";
import IndeterminateCheckbox from "@/components/table/IndeterminateCheckbox";
import { DynamicTableUser } from "@/graphql/dynamicTableUser";
// import { UPDATE_JOB_MUTATION } from "graphql/job";
import {
  formatAddress,
  formatDate,
  formatTime,
  // formatToTimeDate,
  outputDynamicTable,
} from "@/lib/helpers/helper";
import Image from "next/image";
import EditableFieldPopover from "@/components/jobs/EditableFieldPopover";
import React, { useState } from "react";
import { MdMenu } from "react-icons/md";
// import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, ChevronRightIcon, EditIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";

export const isAdmin = (state: RootState) => state.user.isAdmin;
export const isCustomer = (state: RootState) => state.user.isCustomer;

export const PickupAddressBusinessNameCell = ({ row }: any) => (
  <>
    <Text mb="2" minWidth={"300px"} flexWrap={"nowrap"}>
      {formatAddress(row?.original?.job?.pick_up_destinations)}
    </Text>
    <Text>
      {row.original?.job?.pick_up_destination.address_business_name || "-"}
    </Text>
  </>
);
export const JobDestinationsCell = ({ row }: any) => {
  const destinations = row?.original?.job?.job_destinations || [];
  const filteredDestinations = destinations.filter(
    (destination: any) => destination?.is_pickup === false,
  );

  const first = filteredDestinations[0];

  return (
    <>
      {first ? (
        <Text whiteSpace="normal" fontSize="sm" minWidth={"170px"}>
          {first.address_line_1}
          {"\n"}
          {first.address_city} {first.address_postal_code}
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
                <Text color="black" mb="5" key={`dest-${index}`}>
                  Address {index + 1}: {formatAddress(destination)}
                </Text>
              ))}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export function formatAddressLines(dest: any) {
  // console.log(dest);
  if (!dest) {
    return {
      firstLine: "-",
      secondLine: "-",
    };
  }
  const firstLine = dest.address_business_name || dest.address_line_1 || "-";

  const addressParts = [
    dest?.address_line_1 || null,
    dest?.address_city || null,
    dest?.address_postal_code || null,
  ].filter(Boolean);

  const secondLine = dest.address_business_name
    ? `${dest.address_business_name}\n${addressParts.join(", ")}`
    : addressParts.join(", ");

  return { firstLine, secondLine };
}
export const PickupAddressWithTimewithoutMediacustomerCell = ({ row }: any) => {
  const companyId = useSelector((state: RootState) => state.user.companyId);

  console.log(row, "rows p");
  const pickupDest = row?.original?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );
  const showPickupTime =
    row?.original?.job_status?.id == 4 ||
    row?.original?.job_status?.id == 5 ||
    row?.original?.job_status?.id == 6 ||
    row?.original?.job_status?.id == 7;
  const showfullAddress =
    Number(row?.original?.company_id) === Number(companyId);
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
      {showfullAddress ? (
        <Text
          whiteSpace="pre-wrap"
          mb="2"
          minWidth={"300px"}
          flexWrap={"nowrap"}
        >
          {pickupDest?.is_saved_address
            ? formatAddressLines(pickupDest).firstLine
            : formatAddressLines(pickupDest).secondLine}
        </Text>
      ) : (
        <Text
          whiteSpace="pre-wrap"
          mb="2"
          minWidth={"300px"}
          flexWrap={"nowrap"}
        >
          {pickupDest?.address_city}, {pickupDest?.address_postal_code}
        </Text>
      )}
    </>
  );
};
export const TimeslotCustomerCell = ({ row }: any) => {
  return (
    <Flex gap={2}>
      <Text minW="150px">{row?.original?.timeslot || "-"}</Text>
    </Flex>
  );
};
export const DeliveryAddressWithTimebulkCustomerCell = ({ row }: any) => {
  const companyId = useSelector((state: RootState) => state.user.companyId);

  const pickupDest = row?.original?.job_destinations?.find(
    (dest: any) => dest.is_pickup === false,
  );
  const showPickupTime =
    row?.original?.job_status?.id == 4 ||
    row?.original?.job_status?.id == 5 ||
    row?.original?.job_status?.id == 6 ||
    row?.original?.job_status?.id == 7;
  const showfullAddress =
    Number(row?.original?.company_id) === Number(companyId);
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
      {showfullAddress ? (
        <Text
          whiteSpace="pre-wrap"
          mb="2"
          minWidth={"300px"}
          flexWrap={"nowrap"}
        >
          {pickupDest?.is_saved_address
            ? formatAddressLines(pickupDest).firstLine
            : formatAddressLines(pickupDest).secondLine}
        </Text>
      ) : (
        <Text
          whiteSpace="pre-wrap"
          mb="2"
          minWidth={"300px"}
          flexWrap={"nowrap"}
        >
          {pickupDest?.address_city}, {pickupDest?.address_postal_code}
        </Text>
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
  // Add null check and default empty array
  const destinations = row?.original?.job?.job_destinations || [];
  const filteredDestinations = destinations.filter(
    (destination: any) => destination?.is_pickup === false,
  );

  return (
    <>
      <Text minW="180px" maxW="190px">
        {filteredDestinations[0]?.address_business_name || "-"}
      </Text>
    </>
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
    row?.original?.job?.job_status.id == 6 ||
    row?.original?.job?.job_status.id == 7;

  // Only get media if not in status 6 or 7
  const normalMedia =
    filteredDestinations[0]?.media?.filter(
      (item: any) => item.collection_name !== "signatures",
    ) || [];

  return (
    <>
      {filteredDestinations[0]?.updated_at && showDeliveryTime && (
        <>
          <Text fontSize="sm" color="blue.600" mb={1}>
            Arrival time:{" "}
            {formatDate(
              filteredDestinations[0].arrived_at,
              "HH:mm, DD/MM/YYYY",
            )}
          </Text>
          <Text fontSize="sm" color="red.600" mb={1}>
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
      {`${pickupDest?.address_line_1}, ${pickupDest?.address_city}, ${
        pickupDest?.address_postal_code
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
      {`${pickupDest?.address_line_1}, ${pickupDest?.address_city}, ${
        pickupDest?.address_postal_code
      }\n ${pickupDest?.address_business_name || "-"}`}
    </Text>
  );
};
export const PickupAddressWithTimeCell = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );
  const showPickupTime =
    row?.original?.job?.job_status.id == 4 ||
    row?.original?.job?.job_status.id == 5 ||
    row?.original?.job?.job_status.id == 6 ||
    row?.original?.job?.job_status.id == 7;
  const normalMedia =
    pickupDest?.media?.filter(
      (item: any) => item.collection_name !== "signatures",
    ) || [];
  return (
    <>
      {pickupDest?.updated_at && showPickupTime && (
        <>
          <Text fontSize="sm" color="blue.600" mb={1}>
            Arrival time:{" "}
            {formatDate(pickupDest.arrived_at, "HH:mm, DD/MM/YYYY")}
          </Text>
          <Text fontSize="sm" color="red.600" mb={1}>
            Collection time:{" "}
            {formatDate(pickupDest.updated_at, "HH:mm, DD/MM/YYYY")}
          </Text>
        </>
      )}
      <Text mb="2" minWidth={"300px"} flexWrap={"nowrap"}>
        {`${pickupDest?.address_line_1}, ${pickupDest?.address_city}, ${pickupDest?.address_postal_code}`}
      </Text>
      <Text>{pickupDest?.address_business_name || "-"}</Text>
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
  const collectionTime = pickupDest?.updated_at
    ? `Collection time: ${formatDate(
        pickupDest.updated_at,
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
    row?.original?.job?.job_status.id == 4 ||
    row?.original?.job?.job_status.id == 5 ||
    row?.original?.job?.job_status.id == 6 ||
    row?.original?.job?.job_status.id == 7;

  return (
    <>
      {pickupDest?.updated_at && showPickupTime && (
        <>
          <Text fontSize="sm" color="blue.600" mb={1}>
            Arrival time:{" "}
            {formatDate(pickupDest.arrived_at, "HH:mm, DD/MM/YYYY")}
          </Text>
          <Text fontSize="sm" color="red.600" mb={1}>
            Collection time:{" "}
            {formatDate(pickupDest.updated_at, "HH:mm, DD/MM/YYYY")}
          </Text>
        </>
      )}
      <Text>{pickupDest?.address_business_name || "-"}</Text>
      <Text mb="2" minWidth={"300px"} flexWrap={"nowrap"}>
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
    row?.original?.job?.job_status.id == 6 ||
    row?.original?.job?.job_status.id == 7;

  return (
    <>
      {filteredDestinations[0]?.updated_at && showDeliveryTime && (
        <>
          <Text fontSize="sm" color="red.600" mb={1}>
            Arrival time:{" "}
            {formatDate(
              filteredDestinations[0].arrived_at,
              "HH:mm, DD/MM/YYYY",
            )}
          </Text>
          <Text fontSize="sm" color="red.600" mb={1}>
            Delivery time:{" "}
            {formatDate(
              filteredDestinations[0].updated_at,
              "HH:mm, DD/MM/YYYY",
            )}
          </Text>
        </>
      )}
      <Text>{filteredDestinations[0]?.address_business_name || "-"}</Text>
      <Text isTruncated w={"fit-content"}>
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
      <Text isTruncated w={"fit-content"}>
        {row?.original?.job?.job_category?.name ?? "-"}
      </Text>
      <Text isTruncated w={"fit-content"}>
        R: {formatTime(row?.original?.job?.ready_at)}
      </Text>
      <Text isTruncated w={"fit-content"}>
        D: {formatTime(row?.original?.job?.drop_at)}
      </Text>
    </>
  );
};

export const ReadyDropByCellExport = ({ row }: any) =>
  `${row?.original?.job?.job_category?.name ?? "-"}\n
    R: ${formatTime(row?.original?.job?.ready_at)}\n
    D: ${formatTime(row?.original?.job?.drop_at)}`;

export const NotesCell = ({ row, refetchJobs }: any) => {
  const current = row?.original?.job?.customer_notes ?? "";
  const [display, setDisplay] = React.useState(current);

  React.useEffect(() => {
    setDisplay(current);
  }, [current]);

  return (
    <Flex gap={2} align="center">
      <Text minW="150px" noOfLines={3}>
        {display || "-"}
      </Text>
      <EditableFieldPopover
        row={row}
        field="customer_notes"
        triggerAriaLabel="Edit customer notes"
        onSaved={setDisplay}
        refetchJobs={refetchJobs}
      />
    </Flex>
  );
};
export const TotalPrice = ({ row }: any) => {
  const subTotal = Number(row?.original?.job?.price_summary?.sub_total || 0);
  const tax = Number(row?.original?.job?.price_summary?.tax || 0);
  const total = Number(row?.original?.job?.price_summary?.total || 0);
  const driverPay = Number(row?.original?.job?.driver_pay || 0);
  const driverId = row?.original?.job?.driver_id;
  const isAllZero = subTotal === 0 && tax === 0 && total === 0;

  return (
    <>
      <Text fontSize="md" w="180px">
        {isAllZero ? "Invoice: 0" : `Invoice: ${subTotal} + ${tax}= $${total}`}
      </Text>

      {/* {driverId && ( */}
      {driverId !== null && driverId !== undefined && (
        <Text fontSize="md" w="180px">
          Driver Pay: $ {driverPay}
        </Text>
      )}
    </>
  );
};
export const ItemsTypeCell = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return (
    <div>
      {items?.map((item: any) => (
        <Text key={`items-type-${item.id}`} mb={2}>
          {item?.item_type?.name}
        </Text>
      ))}
    </div>
  );
};
export const ItemsTypeCellExport = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return items?.map((item: any) => {
    return [`${item?.item_type?.name}  \n`];
  });
};
export const ItemsDimensionCell = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return (
    <div>
      {items?.map((item: any) => (
        <Text key={`items-dimension-${item.id}`} mb={2} w={"max-content"}>
          {`${(item.dimension_height * 100)?.toFixed(0)}x${(
            item.dimension_width * 100
          )?.toFixed(0)}x${(item.dimension_depth * 100)?.toFixed(0)}`}
        </Text>
      ))}
    </div>
  );
};
export const ItemsDimensionCellExport = ({ row }: any) => {
  const items = row?.original?.job?.job_items;
  return items?.map((item: any) => {
    return [
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
        <Text key={`items-quantity-${item.id}`} mb={2}>
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
        <Text key={`items-weight-${item.id}`} mb={2}>
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
        <Text key={`items-cbm-${item.id}`} mb={2}>
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

export const ItemsExtrasCellExport = ({ row }: any) => {
  return `${row?.original?.job?.extras ? `${row.original.job.extras}` : "-"}`;
};

export const DriverCell = ({ row }: any) => {
  return (
    <Text minW="130px">{row?.original?.job?.driver?.full_name || "-"}</Text>
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
  return <Text minW="160px">{name}</Text>;
};
// export const BookedByCellExport = ({ row }: any) => {
//   const pickupDest = row.original.job_destinations?.find(
//     (dest: any) => dest.is_pickup === true,
//   );
//   const collectionTime = pickupDest?.updated_at
//     ? `Collection time: ${formatDate(
//         pickupDest.updated_at,
//         "HH:mm, DD/MM/YYYY",
//       )}\n`
//     : "";

//   return `${collectionTime}${formatAddress(
//     row.original.pick_up_destination,
//   )}\n${row.original.pick_up_destination?.address_business_name || "-"}`;
// };
export const JobTypeCell: React.FC<{
  row: { original: { job: { job_type?: { name: string } } } };
}> = ({ row }) => {
  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "standard":
        return "purple.500";
      case "urgent":
        return "red.500";
      case "express":
        return "orange.500";
      default:
        return "purple.500";
    }
  };

  return (
    <Text
      color={getTypeColor(row.original.job?.job_type?.name)}
      fontWeight="bold"
    >
      {row.original.job?.job_type?.name || "-"}
    </Text>
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
    <Flex direction="column" gap={1} minWidth="210px">
      <Text fontSize="md" fontWeight="500">
        Created Date: {formatDate(row?.original?.job?.created_at) || "-"}
      </Text>
      <Text fontSize="md">
        Scheduled Date: {formatDate(row?.original?.job?.drop_at) || "-"}
        {/* It was ready_at initially, changed to drop_at as per client request,now adding both  */}
      </Text>
    </Flex>
  );
};
export const ReadyAtCellExport = ({ row }: any) =>
  `Created Date: ${
    formatDate(row?.original?.job?.created_at) || "-"
  } | Scheduled Date: ${formatDate(row?.original?.job?.drop_at) || "-"}`;

export const LastFreeAtCell = ({ row }: any) => {
  // console.log(row.original.job,"sa")
  return (
    <Text maxW="150px" minW="150px">
      {row?.original?.job?.last_free_at || "-"}
    </Text>
  );
};
export const LastFreeAtCellExport = ({ row }: any) =>
  `${
    row?.original?.job?.last_free_at ? `${row.original.job.last_free_at}` : "-"
  }`;
export const PickupBusinessNameCell = ({ row }: any) => {
  const pickupDest = row?.original?.job?.job_destinations?.find(
    (dest: any) => dest.is_pickup === true,
  );
  return (
    <Text maxW="190px" minW="190px">
      {pickupDest?.address_business_name || "-"}
    </Text>
  );
};

export const PickupAddressCell = ({ row }: any) => {
  const pickup = row?.original?.job?.job_destinations?.find(
    (d: any) => d.is_pickup === true,
  );

  if (!pickup) return <>-</>;

  const line1 = pickup.address_line_1;
  const line2 = `${pickup.address_city} ${pickup.address_postal_code}, Australia`;

  return (
    <Text whiteSpace="normal" fontSize="sm" minWidth={"170px"}>
      {line1}
      {"\n"}
      {line2}
    </Text>
  );
};

export const CustomerReferenceCell = ({ row }: any) => {
  return (
    <Text noOfLines={2} minWidth={"170px"}>
      {" "}
      {row?.original?.job?.reference_no || "-"}
    </Text>
  );
};

export const CategoryCell = ({ row }: any) => {
  return <Text>{row?.original?.job?.job_category?.name || "-"}</Text>;
};
type JobLabel = {
  id: number;
  type: "label";
  name: string;
  color?: string;
};
export const DeliveryCell = ({ row }: any) => {
  const router = useRouter();
  const job = row?.original?.job;
  const labels: JobLabel[] = Array.isArray(job?.meta) ? job.meta : [];
  const getBadgeStyle = (color?: string) => {
    if (!color)
      return { bg: "gray", color: "#fff", boxShadow: `0 0 0 1px ${color}` };
    if (color.startsWith("#")) {
      return { bg: `${color}`, color: `#fff`, boxShadow: `0 0 0 1px ${color}` };
    }
    return { bg: `${color}`, color: `#fff`, boxShadow: `0 0 0 1px ${color}` };
  };
  const handleNavigate = () => {
    if (job?.id) router.push(`/admin/jobs/${job.id}`);
  };

  return (
    <>
      {labels.length > 0 && (
        <VStack align="start" spacing="4px" mb="10px">
          {labels.map((label) => (
            <Badge
              key={label.id}
              fontSize="12px"
              px="8px"
              py="2px"
              borderRadius="4px"
              whiteSpace="nowrap"
              {...getBadgeStyle(label.color)}
            >
              {label?.name}
            </Badge>
          ))}
        </VStack>
      )}

      <Flex align="center" justify="space-between" gap="8px" maxW="260px">
        {/* RIGHT SIDE */}
        {job?.id && (
          <>
            <Text noOfLines={1}>{job?.name || "-"}</Text>
            <Tooltip label="Edit Job" placement="top">
              <IconButton
                aria-label="Edit Job"
                icon={<EditIcon />}
                size="xs"
                variant="ghost"
                onClick={handleNavigate}
              />
            </Tooltip>
          </>
        )}
      </Flex>
    </>
  );
};
type Props = {
  row: any;
};
export const DeliveryTrackingCell = ({ row }: Props) => {
  const job = row?.original;

  console.log(row, "rowss");
  const labels: JobLabel[] = Array.isArray(job?.meta) ? job.meta : [];
  const getBadgeStyle = (color?: string) => {
    if (!color)
      return { bg: "gray", color: "#fff", boxShadow: `0 0 0 1px ${color}` };
    if (color.startsWith("#")) {
      return { bg: `${color}`, color: `#fff`, boxShadow: `0 0 0 1px ${color}` };
    }
    return { bg: `${color}`, color: `#fff`, boxShadow: `0 0 0 1px ${color}` };
  };

  return (
    <>
      {labels.length > 0 && (
        <VStack align="start" spacing="4px" mb="10px">
          {labels.map((label) => (
            <Badge
              key={label.id}
              fontSize="12px"
              px="8px"
              py="2px"
              borderRadius="4px"
              whiteSpace="nowrap"
              {...getBadgeStyle(label.color)}
            >
              {label?.name}
            </Badge>
          ))}
        </VStack>
      )}
      <Text>{row.original.name} </Text>
    </>
  );
};

export const AdminNotesCell = ({ row, refetchJobs }: any) => {
  const current = row?.original?.job?.admin_notes ?? "";
  const [display, setDisplay] = React.useState(current);

  React.useEffect(() => {
    setDisplay(current);
  }, [current]);

  return (
    <Flex gap={2} align="center">
      <Text maxW="200px" noOfLines={2}>
        {display || "-"}
      </Text>
      <EditableFieldPopover
        row={row}
        field="admin_notes"
        multiline
        triggerAriaLabel="Edit admin notes"
        onSaved={setDisplay}
        refetchJobs={refetchJobs}
      />
    </Flex>
  );
};

export const TimeslotCell = ({ row, refetchJobs }: any) => {
  return (
    <Flex gap={2} align="center">
      <Text
        minW="150px"
        fontSize="28px"
        fontWeight="900"
        letterSpacing="2px"
        textAlign="center"
        color="white"
        textShadow="
    2px 2px 0 rgba(0,0,0,0.85),
    3px 3px 6px rgba(0,0,0,0.6)
  "
      >
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
    const media = MEDIA_CELL[col.id];
    if (!media) return col;
    return {
      ...col,
      cell: withMedia ? media.with : media.without,
    };
  });
}

// de-dupe helper (keeps first occurrence)
function uniqueById(cols: any[]): any[] {
  const seen = new Set<string>();
  return cols.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
}

export const tableColumn = (refetchJobs: () => void) => [
  {
    id: "name",
    header: "Delivery ID",
    cell: DeliveryCell,
  },
  {
    id: "company.name",
    accessorFn: (row) => row.job?.company?.name,
    header: "Booked By",
    cell: BookedByCell,
  },
  {
    id: "reference_no",
    header: "Customer Reference",
    cell: CustomerReferenceCell,
  },
  {
    id: "job_category.name",
    header: "category",
    cell: CategoryCell,
  },
  {
    id: "job_type.name",
    header: "Type",
    cell: JobTypeCell,
    // width: "100px",
  },
  {
    id: "job_status.name",
    header: "Status",
    cell: StatusCell,
    // width: "100px",
  },
  {
    id: "ready_at",
    header: "Date",
    cell: ReadyAtCell,
    // type: "date",
  },
  {
    id: "pick_up_destination.address_formatted",
    header: "Pickup From",
    cell: PickupAddressCell,
    // width: "150px",
  },
  // {
  //   id: "pick_up_destination.address_formatted,pick_up_destination.address_business_name",
  //   header: "Pickup Address and Name ",
  //   // width: "200px",
  //   cell: PickupAddressWithTimewithoutMediaCell, // Use the new cell component
  //   CellExport: PickupAddressWithTimeCellExport,
  // },
  {
    id: "pick_up_destination.address_business_name",
    header: "Pickup Business Name",
    cell: PickupBusinessNameCell,
  },
  {
    id: "job_destinations.address",
    header: "Delivery Address",
    // width: "100px",
    cell: JobDestinationsCell,
    CellExport: JobDestinationsCellExport,
  },
  {
    id: "job_destinations.address_business_name",
    header: "Delivery Business Name",
    cell: JobDestinationBusinessNameCell,
    CellExport: JobDestinationBusinessNameCellExport,
  },
  // {
  //   id: "job_destinations.address,job_destinations.address_business_name",
  //   header: "Delivery Address and Name",
  //   cell: JobDestinationWithBusinessNamewithoutMediaCell,
  //   CellExport: JobDestinationWithBusinessNameCellExport,
  // },
  {
    id: "job_category.name,ready_at,drop_at",
    header: "Ready By / Drop by",
    cell: ReadyDropByCell,
    CellExport: ReadyDropByCellExport,
  },
  {
    id: "timeslot",
    header: "Timeslot",
    cell: ({ row }: any) => (
      <TimeslotCell row={row} refetchJobs={refetchJobs} />
    ),
  },
  {
    id: "last_free_at",
    header: "Last Free Day",
    cell: LastFreeAtCell,
    // type: "date",
  },
  {
    id: "job_items.item_type",
    header: "Item Type",
    cell: ItemsTypeCell,
    CellExport: ItemsTypeCellExport,
  },
  {
    id: "job_items.dimensions",
    header: "Dimensions",
    cell: ItemsDimensionCell,
    CellExport: ItemsDimensionCellExport,
  },
  {
    id: "job_items.quantity",
    header: "Quantity",
    cell: ItemsQuantityCell,
    CellExport: ItemsQuantityCellExport,
  },
  {
    id: "job_items.weight",
    header: "Weight",
    cell: ItemsWeightCell,
    CellExport: ItemsWeightCellExport,
  },
  {
    id: "job_items.volume",
    header: "CBM",
    cell: ItemsCbmCell,
    CellExport: ItemsCbmCellExport,
  },
  {
    id: "extras",
    header: "Extras",
    cell: ItemsExtrasCell,
    // width: "100px",
  },
  {
    id: "customer_notes",
    header: "Client notes",
    cell: NotesCell,
  },
  {
    id: "job_price_calculation_detail.total",
    header: "Total Price",
    cell: TotalPrice,
  },
  {
    id: "driver.full_name",
    header: "Drivers",
    cell: DriverCell,
    enableSorting: true,
  },
  {
    id: "admin_notes",
    header: "Admin Notes",
    accessorKey: "admin_notes" as const,
    cell: AdminNotesCell,
    // show: isCustomer,
  },
];

export const getColumns = (
  isAdmin: boolean,
  isCustomer: boolean,
  withMedia: boolean,
  refetchGroupedJobs?: () => void,
  dynamicTableUsers?: DynamicTableUser[],
) => {
  // 1) Selection checkbox column
  // in JobTableColumns.tsx
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
  if (dynamicTableUsers === undefined) {
    const cols = uniqueById([
      ...base,
      ...tableColumn(refetchGroupedJobs), // your static defaults
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        isView: isCustomer,
        isEdit: isAdmin,
        isTracking: isCustomer,
      },
    ]);
    // Swap Cells for the special two if they exist in tableColumn
    return applyMediaCells(cols, withMedia);
  }

  // 3) Build from dynamic selection
  // NOTE: outputDynamicTable should only include columns that are active:true.
  let columns = [
    ...base,
    ...outputDynamicTable(dynamicTableUsers, tableColumn(refetchGroupedJobs)),
  ];

  // 4) Swap only the Cell for the 2 special fields based on withMedia
  columns = applyMediaCells(columns, withMedia);

  // 5) Ensure Actions at the end and de-dupe
  columns = uniqueById([
    ...columns,
    {
      id: "actions",
      header: "Actions",
      accessorKey: "id" as const,
      isView: isCustomer,
      isEdit: isAdmin,
      isTracking: isCustomer,
      meta: {
        isView: isCustomer,
        isEdit: isAdmin,
        isTracking: isCustomer,
      },
    },
  ]);

  return columns;
};

export const bulkassigntableColumn = [
  {
    id: "name",
    header: "Delivery ID",
    cell: DeliveryCell,
    // width: "100px",
  },
  {
    id: "company.name",
    accessorFn: (row) => row.job?.company?.name,
    header: "Booked By",
    cell: BookedByCell,
  },
  {
    id: "reference_no",
    header: "Customer Reference",
    cell: CustomerReferenceCell,
  },
  {
    id: "job_category.name",
    header: "category",
    cell: CategoryCell,
  },
  {
    id: "job_type.name",
    header: "Type",
    cell: JobTypeCell,
  },
  {
    id: "job_status.name",
    header: "Status",
    cell: StatusCell,
    // width: "100px",
  },
  {
    id: "ready_at",
    header: "Date",
    cell: ReadyAtCell,
    // type: "date",
  },
  {
    id: "pick_up_destination.address_formatted",
    header: "Pickup From",
    cell: PickupAddressCell,
    // width: "150px",
  },
  {
    id: "pick_up_destination.address_formatted,pick_up_destination.address_business_name",
    header: "Pickup Address and Name ",
    // width: "200px",
    cell: PickupAddressWithTimebulkCell, // Use the new cell component
    // CellExport: PickupAddressWithTimeCellExport,
  },
  {
    id: "job_destinations.address,job_destinations.address_business_name",
    header: "Delivery Address and Name",
    cell: deliveryAddressWithTimebulkCell,
    // CellExport: JobDestinationWithBusinessNameCellExport,
  },
  {
    id: "pick_up_destination.address_business_name",
    header: "Pickup Business Name",
    cell: PickupBusinessNameCell,
  },
  {
    id: "job_destinations.address",
    header: "Delivery Address",
    width: "100px",
    cell: JobDestinationsCell,
    CellExport: JobDestinationsCellExport,
  },
  {
    id: "job_destinations.address_business_name",
    header: "Delivery Business Name",
    cell: JobDestinationBusinessNameCell,
    CellExport: JobDestinationBusinessNameCellExport,
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
    cell: TimeslotCell,
    // width: "50px",
  },
  {
    id: "last_free_at",
    header: "Last Free Day",
    cell: LastFreeAtCell,
    // type: "date",
  },
  {
    id: "job_items.item_type",
    header: "Item Type",
    cell: ItemsTypeCell,
    CellExport: ItemsTypeCellExport,
  },
  {
    id: "job_items.dimensions",
    header: "Dimensions",
    cell: ItemsDimensionCell,
    CellExport: ItemsDimensionCellExport,
  },
  {
    id: "job_items.quantity",
    header: "Quantity",
    cell: ItemsQuantityCell,
    CellExport: ItemsQuantityCellExport,
  },
  {
    id: "job_items.weight",
    header: "Weight",
    cell: ItemsWeightCell,
    CellExport: ItemsWeightCellExport,
  },
  {
    id: "job_items.volume",
    header: "CBM",
    cell: ItemsCbmCell,
    CellExport: ItemsCbmCellExport,
  },
  {
    id: "extras",
    header: "Extras",
    cell: ItemsExtrasCell,
    // width: "100px",
  },
  {
    id: "customer_notes",
    header: "Client notes",
    cell: NotesCell,
  },
  {
    id: "driver.full_name",
    header: "Drivers",
    cell: DriverCell,
    enableSorting: true,
  },
  {
    id: "admin_notes",
    header: "Admin Notes",
    accessorKey: "admin_notes" as const,
    cell: AdminNotesCell,
    // show: isCustomer,
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
        cell: ({}: any) => (
          <div>
            <Icon
              mt="auto"
              mb="auto"
              as={MdMenu as unknown as React.ElementType}
              h="16px"
              w="16px"
              me="8px"
            />
          </div>
        ),
      },
      ...bulkassigntableColumn,
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        isView: isCustomer,
        isEdit: isAdmin,
        isTracking: isCustomer,
        meta: {
          isView: isCustomer,
          isEdit: isAdmin,
          isTracking: isCustomer,
        },
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
      cell: ({}: any) => (
        <div>
          <Icon
            as={MdMenu as unknown as React.ElementType}
            h="16px"
            w="16px"
            me="8px"
          />
        </div>
      ),
    },
  ];

  columns.push(...dynamicColumns);

  return columns;
};

const getTypeColor = (value: any) => {
  if (typeof value === "string") return "green.600";
  if (typeof value === "number") return "purple.600";
  if (typeof value === "boolean") return "red.500";
  if (value === null) return "gray.500";
  return "gray.700";
};

const getPreview = (value: any) => {
  if (Array.isArray(value)) return `[${value.length}]`;
  if (typeof value === "object" && value !== null)
    return `{${Object.keys(value).length}}`;
  return null;
};

const JsonNode = ({ data, level = 0 }: { data: any; level?: number }) => {
  const [open, setOpen] = useState(false);

  if (typeof data !== "object" || data === null) {
    return (
      <Text as="span" color={getTypeColor(data)}>
        {JSON.stringify(data)}
      </Text>
    );
  }
  const formatToLocal = (value: string) => {
    const date = new Date(value);

    if (isNaN(date.getTime())) return value; // not a date

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };
  const isDateString = (value: unknown): value is string => {
    return (
      typeof value === "string" &&
      !isNaN(Date.parse(value)) &&
      value.includes("T")
    );
  };
  return (
    <Box pl={level * 4}>
      {Object.entries(data).map(([key, value]) => {
        const isExpandable = typeof value === "object" && value !== null;

        return (
          <Box key={key}>
            <Flex align="center">
              {isExpandable ? (
                <Box cursor="pointer" onClick={() => setOpen(!open)} mr={1}>
                  {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
                </Box>
              ) : (
                <Box w="16px" />
              )}

              <Text as="span" color="blue.600" fontWeight="600" mr={1}>
                {key}:
              </Text>

              {!isExpandable ? (
                <Text as="span" color={getTypeColor(value)}>
                  {isDateString(value)
                    ? formatToLocal(value) // no TS error now
                    : JSON.stringify(value)}
                </Text>
              ) : (
                !open && (
                  <Text as="span" color="gray.500">
                    {getPreview(value)}
                  </Text>
                )
              )}
            </Flex>

            {isExpandable && open && (
              <JsonNode data={value} level={level + 1} />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export const JsonTreeViewer = ({ value }: { value: any }) => {
  let parsed;

  try {
    parsed = typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return <Text fontSize="sm">{value}</Text>;
  }

  return (
    <Box
      bg="gray.50"
      p={3}
      borderRadius="md"
      fontSize="sm"
      fontFamily="mono"
      maxH="300px"
      overflowY="auto"
      border="1px solid"
      borderColor="gray.200"
    >
      <JsonNode data={parsed} />
    </Box>
  );
};
