import {
  Avatar,
  Badge,
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { faBoltLightning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  DeliveryAddressWithTimebulkCustomerCell,
  DeliveryTrackingCell,
  PickupAddressWithTimewithoutMediacustomerCell,
  TimeslotCustomerCell,
} from "@/components/jobs/JobTableColumns";
import { TrackingMap } from "@/components/map/TrackingMap";
import PaginationTable from "@/components/table/PaginationTable";
import { GET_JOB_QUERY } from "@/graphql/job";
import { GET_DRIVER_CURRENT_ROUTE_QUERY } from "@/graphql/route";
import { australianStates, formatDate, getMapIcon } from "@/lib/helpers/helper";
import debounce from "lodash.debounce";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import GoogleMapProvider from "@/components/providers/GoogleMapProvider";

export default function TrackingJob() {
  const router = useRouter();
  const { id: jobId } = router.query;
  const [routePoints, setRoutePoints] = useState([]);

  // Google Maps data.
  const [zoom, setZoom] = useState(5);
  const [center, setCenter] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pollingSpeed, setPollingSpeed] = useState(60000);

  const Columns = useMemo(
    () => [
      {
        id: "sort_order",
        Header: "Sort Order",
        Cell: ({ row }: any) => {
          const dSortId = row.original?.d_sort_id;
          return dSortId !== null && dSortId !== undefined ? (
            <Badge colorScheme="green">#{dSortId}</Badge>
          ) : (
            <Badge colorScheme="orange">Not Sorted</Badge>
          );
        },
      },
      {
        id: "name",
        Header: "Delivery ID",
        Cell: ({ row }: any) => <DeliveryTrackingCell row={row} />,
      },
      {
        id: "timeslot",
        Header: "Timeslot",
        Cell: ({ row }: any) => <TimeslotCustomerCell row={row} />,
      },
      {
        id: "pick_up_destination.address_formatted,pick_up_destination.address_business_name",
        Header: "Pickup Address and Name ",
        Cell: PickupAddressWithTimewithoutMediacustomerCell,
      },
      {
        id: "job_destinations.address,job_destinations.address_business_name",
        Header: "Delivery Address and Name",
        Cell: DeliveryAddressWithTimebulkCustomerCell,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  // const centerChangeHandler = (data: any) => {
  //   setCenter(data);
  // };
  // const debouncedCenterChangeHandler = useCallback(
  //   debounce(centerChangeHandler, 300),
  //   [],
  // );
  const debouncedCenterChangeHandler = useMemo(() => {
    return debounce((data: any) => {
      setCenter(data);
    }, 300);
  }, [setCenter]);

  useEffect(() => {
    return () => {
      debouncedCenterChangeHandler.cancel?.(); // if using lodash.debounce
    };
  }, [debouncedCenterChangeHandler]);

  const {
    loading: jobLoading,
    data: jobData,
    refetch: _getJob,
  } = useApolloQueryWithEffect(GET_JOB_QUERY, {
    variables: {
      id: jobId,
    },
    skip: !jobId,
    onCompleted: (data: any) => {
      const localDate = formatDate(data?.job?.ready_at);
      getDriverCurrentRoutes({
        variables: {
          page: 1,
          first: 20,
          orderByColumn: "id",
          orderByOrder: "ASC",
          // today: moment(localDate).utc().format("YYYY-MM-DD HH:mm:ss"),
          today: moment(localDate).utc().format("YYYY-MM-DD") + " 14:00:00",
          driver_id: Number(data?.job?.driver_id),
        },
      });
      // getJobs({
      //   variables: {
      //     page: 1,
      //     first: 50,
      //     // today: moment(localDate).utc().format("YYYY-MM-DD HH:mm:ss"),
      //     orderBy: [{ column: "id", order: "DESC" }],
      //     between_at: {
      //       from_at: `${currentDate} 00:00:00`,
      //       to_at: `${currentDate} 23:59:59`,
      //     },
      //     driver_id: driverId,
      //   },
      // });
    },
    onError(error) {
      console.log("onError");
      console.log(error);
    },
  });

  const [
    getDriverCurrentRoutes,
    { data: driverCurrentRoutesData, loading: loadingDriverCurrentRoutes },
  ] = useApolloLazyQueryWithEffect(GET_DRIVER_CURRENT_ROUTE_QUERY, {
    pollInterval: pollingSpeed,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: any) => {
      if (data.routes.data.length > 0) {
        const route = data.routes.data[0];
        // Filter out Completed Stops.
        const routePoints = route.route_points.filter(
          (point: any) =>
            Number(point.route_point_status_id) <= 3 && point.job_destination,
        );
        console.log(routePoints, "routep");
        const markers = routePoints.map((point: any) => {
          return {
            lat: point.lat,
            lng: point.lng,
            icon: getMapIcon(point),
            data: point,
          };
        });

        const drivers = [
          {
            lat: route.driver.lat,
            lng: route.driver.lng,
            icon: route.driver.media_url,
            data: route.driver,
          },
        ];

        setRoutePoints(routePoints);
        console.log(routePoints, "routep");
        setMarkers(markers);
        setCenter({
          lat: australianStates[1].lat,
          lng: australianStates[1].lng,
        });
        setDrivers(drivers);
      } else {
        setRoutePoints([]);
        setMarkers([]);
      }
    },
  });

  const groupedJobs = Object.values(
    routePoints.reduce((acc: Record<string, any>, point: any) => {
      const jobId = point?.job?.id;
      if (!jobId) return acc;

      if (!acc[jobId]) {
        acc[jobId] = {
          ...point.job,
        };
      }
      console.log(acc, "Grped acc");
      return acc;
    }, {}),
  ).sort((a: any, b: any) => {
    const aSort = (a as any).d_sort_id ?? Infinity;
    const bSort = (b as any).d_sort_id ?? Infinity;
    return aSort - bSort;
  });

  // ✅ Single flag — true if ANY job has no sort order
  const hasUnsortedJobs = groupedJobs.some(
    (job: any) => job.d_sort_id === null,
  );

  console.log(groupedJobs, "gr");
  return (
    <Box
      className="mk-customers-id overflow-auto"
      pt={{ base: "130px", md: "97px", xl: "97px" }}
      backgroundColor="white"
    >
      <Grid
        pr="24px"
        className="mk-mainInner"
        h={{
          base: "calc(100vh - 130px)",
          md: "calc(100vh - 97px)",
          xl: "calc(100vh - 97px)",
        }}
      >
        {!jobLoading && jobData && (
          <Grid backgroundColor="white">
            <Flex className="my-8 pl-6 justify-between">
              <Box>
                <h1>Track Delivery</h1>
              </Box>
              <Box>
                <Tooltip
                  label={`Current polling speed ${pollingSpeed / 1000}s`}
                >
                  <IconButton
                    m={{ base: "2px" }}
                    aria-label="left button"
                    className="text-[var(--chakra-colors-primary-400)] float-right"
                    icon={<FontAwesomeIcon icon={faBoltLightning} />}
                    onClick={() => {
                      pollingSpeed == 60000
                        ? setPollingSpeed(10000)
                        : setPollingSpeed(60000);
                    }}
                    colorScheme={pollingSpeed == 10000 ? "blue" : "gray"}
                  />
                </Tooltip>
              </Box>
            </Flex>

            {hasUnsortedJobs && (
              <Badge colorScheme="orange" mb={2}>
                ⚠ Some jobs have not been sorted yet
              </Badge>
            )}
            <Grid
              templateAreas={`"nav main"`}
              gridTemplateRows={"1fr 30px"}
              // gridTemplateColumns={{ base: "35% 1fr", md: "420px 1fr" }}
              gridTemplateColumns={{
                base: "1fr",
                md: "minmax(300px, 50%) 50%",
              }}
              // h="90vh"
              gap="1px"
              color="blackAlpha.700"
              fontWeight="bold"
              className="mk-job-allocation-wrap overflow-hidden"
            >
              {/* Left Column */}
              <GridItem
                area={"nav"}
                className="job-list-column h-full overflow-auto pt-4 border-t"
                sx={{ height: "calc(100vh - 186px)" }}
              >
                <Box className="px-6">
                  <Flex justify="space-between" align="flex-start" gap={6}>
                    {/* ✅ LEFT COLUMN ONLY */}
                    <Box flex="1">
                      <h2>Job #{jobData.job.name}</h2>

                      <Divider className="mb-2 mt-3" />

                      <Flex alignItems="center" mb="16px">
                        <Text width="200px" fontSize="sm">
                          Date
                        </Text>
                        <Text fontSize="sm">
                          {formatDate(jobData.job.ready_at, "DD MMM YYYY")}
                        </Text>
                      </Flex>

                      <Flex alignItems="center" mb="16px">
                        <Text width="200px" fontSize="sm">
                          Assigned to
                        </Text>
                        <Flex align="center">
                          <Avatar
                            variant="jobAllocation"
                            src={
                              jobData.job.driver
                                ? jobData.job.driver.media_url
                                : "/img/avatars/driverIcon.png"
                            }
                          />
                          <Text ml={2}>{jobData?.job.driver?.full_name}</Text>
                        </Flex>
                      </Flex>
                    </Box>

                    <Box flex="1">
                      {/* your collection / delivery UI */}
                      <Flex justify="space-between" mb="12px">
                        <Box textAlign="center">
                          <Text fontSize="3xl" color="black">
                            Collection
                          </Text>
                          <Text fontSize="3xl" color="black">
                            {driverCurrentRoutesData?.routes?.data?.[0]
                              ?.pickup_delivery_count?.pickup_count ?? 0}
                          </Text>
                        </Box>
                        <Divider
                          orientation="vertical"
                          borderColor="gray.300"
                        />
                        <Box textAlign="center">
                          <Text fontSize="3xl" color="black">
                            Delivery
                          </Text>
                          <Text fontSize="3xl" color="black">
                            {driverCurrentRoutesData?.routes?.data?.[0]
                              ?.pickup_delivery_count?.delivery_count ?? 0}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                  {/* <Divider className="mb-2 mt-3" /> */}

                  {jobData?.job.driver && (
                    <Box
                      bg="#1d2d53"
                      color="#fff"
                      px={6}
                      py={3}
                      borderTop="4px solid"
                      borderLeft="4px solid"
                      borderColor="#2F80ED"
                      borderRadius="md"
                      w="100%"
                    >
                      <Flex justify="space-between" align="center">
                        <Badge colorScheme="red" variant="subtle" fontSize="md">
                          Current Suburb:{" "}
                          {jobData?.job.driver?.current_suburb ?? "-"}
                        </Badge>

                        <Badge colorScheme="red" variant="subtle" fontSize="md">
                          TAILGATE:{" "}
                          {jobData?.job.driver?.is_tailgated ? "Yes" : "No"}
                        </Badge>
                      </Flex>
                    </Box>
                  )}

                  {/* ROUTE POINTS */}
                  {/* {!loadingDriverCurrentRoutes && routePoints.length > 0 && ( */}
                  <Flex className="flex-col mt-4 job-destination-card-wrap">
                    {!jobLoading && groupedJobs?.length > 0 ? (
                      <PaginationTable
                        columns={Columns}
                        data={groupedJobs ?? []}
                        options={{
                          initialState: {
                            pageIndex: 0,
                            pageSize: 100,
                          },
                          manualPagination: false,
                          pageCount: groupedJobs.length,
                        }}
                        isServerSide={false}
                      />
                    ) : (
                      <div className="text-center mt-20 text-gray-500">
                        No data yet
                      </div>
                    )}
                  </Flex>
                  {/* // )}  */}
                </Box>
              </GridItem>

              {/* Job map */}
              <GoogleMapProvider>
                {!loadingDriverCurrentRoutes &&
                  routePoints &&
                  markers.length > 0 && (
                    <GridItem
                      bg="green.300"
                      area={"main"}
                      sx={{ height: "calc(100vh - 200px)" }}
                    >
                      <TrackingMap
                        center={center}
                        zoom={zoom}
                        markers={markers}
                        onCenterChanged={(data: any) =>
                          debouncedCenterChangeHandler(data)
                        }
                        onZoomChanged={(data: any) => {
                          setZoom(data);
                        }}
                        isRouting
                        drivers={drivers}
                      />
                    </GridItem>
                  )}
              </GoogleMapProvider>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
