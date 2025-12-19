import "moment-timezone";

import { Text } from "@chakra-ui/react";
import { DynamicTableUser } from "@/graphql/dynamicTableUser";
import moment from "moment";

export function formatFloat(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatDate(date: any, format: string = "YYYY-MM-DD") {
  return moment.utc(date).local().format(format);
}

export function formatedDate(date: any, format: string = "YYYY-MM-DD") {
  return moment.utc(date).local().format(format);
}

export function formatTime(dateTime: string) {
  return moment.utc(dateTime).local().format("hh:mm a");
}

export function formatTimeUTCtoInput(dateTime: string) {
  return moment.utc(dateTime).local().format("HH:mm");
}

export const getRowBgColor = (status?: string): string => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case "in transit":
    case "assigned":
      return "yellow.100"; // light yellow
    case "delivered":
    case "completed":
      return "green.200"; // light green
    default:
      return "transparent";
  }
};


export function formatToTimeDate(apiDate: string): string {
  if (!apiDate) return "-";
  return moment.utc(apiDate).local().format("HH:mm, DD/MM/YYYY");
}

export function formatDateTimeToDB(date: string, time: string) {
  return moment(`${date} ${time}`, "YYYY-MM-DD hh:mm a")
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
}

export function formatFromNow(dateTime: string) {
  return moment.utc(dateTime).local().fromNow();
}

export function formatAddress(destination: any) {
  return destination?.address_formatted ?? "-";
}

export function outputDynamicTable(
  dynamicTableUsers: DynamicTableUser[],
  tableColumn: any,
) {
  return dynamicTableUsers
    .filter(
      (dynamicTableUser: DynamicTableUser) =>
        dynamicTableUser.is_active == true,
    )
    .map((dynamicTableUser: DynamicTableUser) => {
      const columnNames = dynamicTableUser.dynamic_table.column_name.split(",");
      const tableColumnItem = tableColumn.find(
        (item: any) => item.id === dynamicTableUser.dynamic_table.column_name,
      );
      const outputValue = {
        id: dynamicTableUser.dynamic_table.column_name,
        Header: dynamicTableUser.dynamic_table.name,
        accessor: dynamicTableUser.dynamic_table.column_name,
        ...(tableColumnItem?.enableSorting
          ? { enableSorting: tableColumnItem.enableSorting }
          : { enableSorting: false }),
        ...(tableColumnItem?.type !== undefined
          ? { type: tableColumnItem?.type }
          : {
              Cell: ({ row }: any) => {
                if (tableColumnItem && tableColumnItem.Cell) {
                  return tableColumnItem.Cell({ row });
                }
                return (
                  <>
                    {columnNames.map((columnName) => {
                      return (
                        <Text
                          key={columnName}
                          mb="2"
                          w={tableColumnItem?.width ?? "fit-content"}
                          flexWrap={"nowrap"}
                        >
                          {getValueFromRow(row.original, columnName) || "-"}
                        </Text>
                      );
                    })}
                  </>
                );
              },
            }),
      };
      return outputValue;
    });
}

export function outputDynamicTableHeader(
  dynamicTableUsers: DynamicTableUser[],
) {
  return dynamicTableUsers
    .filter(
      (dynamicTableUser: DynamicTableUser) =>
        dynamicTableUser.is_active == true,
    )
    .map((dynamicTableUser: DynamicTableUser) => {
      return dynamicTableUser.dynamic_table.name.toUpperCase();
    });
}

export function outputDynamicTableBody(
  dynamicTableUsers: DynamicTableUser[],
  tableColumn: any,
  rows: any,
) {
  return rows?.map((row: any) => {
    return dynamicTableUsers
      .filter(
        (dynamicTableUser: DynamicTableUser) =>
          dynamicTableUser.is_active == true,
      )
      .map((dynamicTableUser: DynamicTableUser) => {
        const columnNames =
          dynamicTableUser.dynamic_table.column_name.split(",");
        const tableColumnItem = tableColumn.find(
          (item: any) => item.id === dynamicTableUser.dynamic_table.column_name,
        );
        if (tableColumnItem && tableColumnItem.CellExport) {
          return tableColumnItem.CellExport({ row });
        }
        const outputValue = columnNames.map((columnName) => {
          return tableColumnItem?.type == "date"
            ? formatDate(
                getValueFromRow(row.original, columnName),
                "DD/MM/YYYY",
              )
            : getValueFromRow(row.original, columnName) || "-";
        });
        return outputValue.toString();
      });
  });
}

export function getValueFromRow(row: any, columnName: string): any {
  // Split column name with dot (.) for nested access
  const parts = columnName.split(".");
  let currentData = row;

  for (const part of parts) {
    if (currentData && part in currentData) {
      currentData = currentData[part];
    } else {
      return "-"; // Handle missing nested keys (return default value)
    }
  }
  return currentData;
}

export function formatCurrency(
  amount: number,
  currency: string = "AUD",
  divide = 1,
) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
  }).format(Number(amount / divide));
}

export function getMapIcon(data: any) {
  const vehicleHireIcon = "/img/maps/vehicle_hire_icon.png";
  const pickupIcon = "/img/maps/pickup_icon.png";
  const destinationIcon = "/img/maps/destination_icon.png";
  const completeIcon = "/img/maps/complete_icon.png";
  const defaultIcon = "/img/maps/truck.png";
  if (data.job_destination_status_id == 3) {
    return completeIcon;
  }
  if (data.is_pickup == true) {
    return pickupIcon;
  }
  if (data.is_pickup == false) {
    return destinationIcon;
  }
  if (data.route_point_status_id !== undefined) {
    if (data.route_point_status_id == 3) {
      return completeIcon;
    }
    if (data.label.includes("Pickup")) {
      return pickupIcon;
    }
    if (data.label.includes("hire")) {
      return vehicleHireIcon;
    }

    return destinationIcon;
  }
  return defaultIcon;
}

export const today = moment().utc().local().format("YYYY-MM-DD");

export function reorderArray<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  newArray.splice(
    to < 0 ? newArray.length + to : to,
    0,
    newArray.splice(from, 1)[0],
  );

  return newArray;
}

export const placeholderOptions = [
  {
    value: 1,
    label: "Option 1",
  },
  {
    value: 2,
    label: "Option 2",
  },
];

export const jobCategories = [
  {
    id: "3",
    value: 3,
    name: "On demand",
    label: "On demand",
  },
  {
    id: "2",
    value: 2,
    name: "Air Freight",
    label: "Air Freight",
  },
  {
    id: "1",
    value: 1,
    name: "LCL",
    label: "LCL",
  },
];

export const jobTypes = [
  {
    id: "3",
    value: 3,
    name: "Urgent",
    label: "Urgent",
    color: "#ed1a2c",
  },
  {
    id: "2",
    value: 2,
    name: "Express",
    label: "Express",
    color: "#FA8231",
  },
  {
    id: "1",
    value: 1,
    name: "Standard",
    label: "Standard",
    color: "#8854d0",
  },
];

export const jobStatuses = [
  {
    id: "9",
    value: 9,
    name: "Declined",
    label: "Declined",
    color: "#ED1A2D",
  },
  {
    id: "8",
    value: 8,
    name: "Cancelled",
    label: "Cancelled",
    color: "#ED1A2D",
  },
  {
    id: "7",
    value: 7,
    name: "Completed",
    label: "Completed",
    color: "#2BA620",
  },
  {
    id: "6",
    value: 6,
    name: "Delivered",
    label: "Delivered",
    color: "#2BA620",
  },
  {
    id: "5",
    value: 5,
    name: "In transit",
    label: "In transit",
    color: "#10B9B1",
  },
  {
    id: "4",
    value: 4,
    name: "En route",
    label: "En route",
    color: "#FA8131",
  },
  {
    id: "3",
    value: 3,
    name: "Assigned",
    label: "Assigned",
    color: "#852CF6",
  },
  {
    id: "2",
    value: 2,
    name: "Scheduled",
    label: "Scheduled",
    color: "#1A94EB",
  },
  {
    id: "1",
    value: 1,
    name: "Unassigned",
    label: "Unassigned",
    color: "#888888",
  },
];

export const australianStates = [
  {
    value: "Queensland",
    label: "QLD",
    lat: -27.3821429,
    lng: 152.9931964,
  },
  {
    value: "Victoria",
    label: "VIC",
    lat: -37.813628,
    lng: 144.963058,
  },
  {
    value: "New South Wales",
    label: "NSW",
    lat: -33.865143,
    lng: 151.2099,
  },
];

export const roleOptions = [
  {
    id: "1",
    value: 1,
    name: "Super Admin",
    label: "Super Admin",
  },
  {
    id: "7",
    value: 7,
    name: "Company Admin",
    label: "Company Admin",
  },
  {
    id: "6",
    value: 6,
    name: "Customer",
    label: "Customer",
  },
  {
    id: "5",
    value: 5,
    name: "Driver",
    label: "Driver",
  },
];

export const formatToSelect = (
  _entityArray: any[],
  valueKeyName: string,
  labelKeyName: string,
) => {
  return _entityArray.map((_entityItem) => {
    return {
      value: _entityItem[valueKeyName],
      label: _entityItem[labelKeyName],
      entity: _entityItem,
    };
  });
};

export function isAfterCutoff(cutoffTime: string, timeZone: string): boolean {
  const currentTime = moment().tz(timeZone);
  const cutoff = moment(cutoffTime, "HH:mm:ss").tz(timeZone);
  return currentTime.isAfter(cutoff);
}

export function isSameDay(jobDate: string, timeZone: string): boolean {
  const currentTime = moment().tz(timeZone);
  const jobDateTime = moment(jobDate).tz(timeZone);
  return currentTime.isSame(jobDateTime, "day");
}

// Get job destination timezone based on the latitude and longitude using Google Maps API
export async function getTimezone(lat: number, lng: number) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${moment().unix()}&key=${
      process.env.GOOGLE_API_KEY
    }`,
  );

  const data = await response.json();
  return data.timeZoneId;
}

