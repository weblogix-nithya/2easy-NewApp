"use client"
import { useQuery } from "@apollo/client/react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
  Spacer,
  Text,
  Tooltip,
  useColorModeValue,
  // useToast,
  // useToast,
} from "@chakra-ui/react";
import { faBoltLightning } from "@fortawesome/free-solid-svg-icons";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons";
import { faChevronLeft } from "@fortawesome/pro-regular-svg-icons";
import { faTimes } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import AvailableDriverCard from "@/components/card/AvailableDriverCard";
import { JobAccordion } from "@/components/jobAllocation/JobAccordion";
import { JobFilterMenu } from "@/components/jobAllocation/JobFilterMenu";
import { Map } from "@/components/map/Map";
import { SearchBar } from "@/components/navbar/searchBar/SearchBar";
import RightSideBar from "@/components/sidebar/RightSideBar";
import { GET_AVAILABLE_DRIVERS_QUERY } from "@/graphql/driver";
import { GET_JOB_QUERY, GET_JOBS_QUERY } from "@/graphql/job";
import { GET_DRIVER_CURRENT_ROUTE_QUERY, GET_ROUTE_QUERY } from "@/graphql/route";
import { GET_VEHICLE_CLASSES_QUERY } from "@/graphql/vehicleClass";
import { australianStates, getMapIcon, jobTypes, today } from "@/lib/helpers/helper";
import debounce from "lodash.debounce";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setAvailableDrivers } from "@/lib/store/driversSlice";
import {
  setIsShowRightSideBar,
  setRightSideBarDriver,
  setRightSideBarJob,
  setRightSideBarRoute,
} from "@/lib/store/rightSideBarSlice";
import { RootState } from "@/lib/store/store";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";
import { useApolloLazyQueryWithEffect } from "@/hooks/useApolloLazyQueryWithEffect";
import { useSearchParams } from "next/navigation";
import GoogleMapProvider from "@/components/providers/GoogleMapProvider";


const stateMap: Record<string, string> = {
  vic: "Victoria",
  qld: "Queensland",
  nsw: "New South Wales",
};

export default function JobAllocationIndex() {
  let menuBg = useColorModeValue("white", "navy.800");
  const searchParams = useSearchParams();
  const urlState = searchParams.get("state")?.toLowerCase();
  const state = useSelector((state: RootState) => state.user.state);
  // console.log("user state from store:", state);
  const rightSideBarJob = useSelector(
    (state: RootState) => state.rightSideBar.job,
  );
  const [date, setDate] = useState(today);
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [queryPageSize, _setQueryPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [vehicleClasses, setVehicleClasses] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [australianState, setAustralianState] = useState(urlState && stateMap[urlState] ? stateMap[urlState] : state);
  const [_selectedVehicleClasses, setSelectedVehicleClasses] = useState([]);
  const [selectedVehicleClassIds, setSelectedVehicleClassIds] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  // const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [_selectedJob, setSelectedJob] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  // const [selectedRouteId, _setSelectedRouteId] = useState(null); // unused
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedJobIdRouting, setSelectedJobIdRouting] = useState(null);
  const [selectedRouteIdRouting, setSelectedRouteIdRouting] = useState(null);
  const [pollingSpeed, setPollingSpeed] = useState(60000);
  // const [isInitLoad, setIsInitLoad] = useState(true);
  const [selectedDriverIds, setSelectedDriverIds] = useState<number[]>([]);
  const [hasUserChosenDrivers, setHasUserChosenDrivers] = useState(false);

  // const toast = useToast();
  // const textColor = useColorModeValue("secondaryGray.900", "white");
  const dispatch = useDispatch();

  useApolloQueryWithEffect(GET_VEHICLE_CLASSES_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 100,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (data) => {
      const d = data as any;
      setVehicleClasses([]);
      d.vehicleClasses.data.map((vehicleClass: any) => {
        setVehicleClasses((vehicleClasses) => [
          ...vehicleClasses,
          { value: parseInt(vehicleClass.id), label: vehicleClass.name },
        ]);
        setSelectedVehicleClassIds((selectedVehicleClassIds) => [
          ...selectedVehicleClassIds,
          parseInt(vehicleClass.id),
        ]);
      });
    }
  });

  useApolloQueryWithEffect(GET_AVAILABLE_DRIVERS_QUERY, {
    variables: {
      query: "",
      page: 1,
      first: 10000,
      orderByColumn: "id",
      orderByOrder: "ASC",
      available: true,
      // need to add in available drivers
    },
    pollInterval: pollingSpeed,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      const d = data as any;
      // setDrivers([]);
      // data.drivers.data.map((driver: any) => {
      //   setDrivers((drivers) => [
      //     ...drivers,
      //     {
      //       lat: driver.lat,
      //       lng: driver.lng,
      //       icon: driver.media_url,
      //       data: driver,
      //     },
      //   ]);

      //   // Find the index of the selected driver in the selectedDrivers array
      //   const selectedIndex = selectedDrivers.findIndex(
      //     (selectedDriver) =>
      //       parseInt(selectedDriver.data.id) === parseInt(driver.id),
      //   );

      //   // If a matching selected driver is found
      //   if (selectedIndex !== -1) {
      //     // Update the data of the selected driver
      //     selectedDrivers[selectedIndex] = {
      //       ...selectedDrivers[selectedIndex], // Keep existing properties
      //       lat: driver.lat,
      //       lng: driver.lng,
      //       icon: driver.media_url,
      //       data: driver, // Update with new properties from the driver object
      //     };

      //     // Update the state with the modified selectedDrivers array
      //     setSelectedDrivers([...selectedDrivers]);
      //   }

      //   if (isInitLoad) {
      //     setSelectedDrivers((selectedDrivers) => [
      //       ...selectedDrivers,
      //       {
      //         lat: driver.lat,
      //         lng: driver.lng,
      //         icon: driver.media_url,
      //         data: driver,
      //       },
      //     ]);
      //     setDriverOptions((driverOptions) => [
      //       ...driverOptions,
      //       {
      //         value: parseInt(driver.id),
      //         label: driver.full_name,
      //         data: driver,
      //       },
      //     ]);
      //     setIsInitLoad(false);
      //   }
      // });
      const nextDrivers = d.drivers.data.map((driver: any) => ({
        lat: driver.lat,
        lng: driver.lng,
        icon: driver.media_url,
        data: driver,
      }));
      setDrivers(nextDrivers);

      const nextOptions = d.drivers.data.map((driver: any) => ({
        value: parseInt(driver.id, 10),
        label: driver.full_name,
        data: driver,
      }));
      setDriverOptions(nextOptions);
      // setSelectedDrivers((prev) => {
      //   if (!hasUserChosenDrivers) return nextDrivers;
      //   const selectedIds = new Set(
      //     prev.map((d) => parseInt(d.data.id as string, 10)),
      //   );
      //   return nextDrivers.filter((d) =>
      //     selectedIds.has(parseInt(d.data.id as string, 10)),
      //   );
      // });

      dispatch(setAvailableDrivers(d.drivers.data));
    },
  });

  const visibleDrivers = useMemo(() => {
    if (!drivers.length) return [];
    if (!hasUserChosenDrivers || selectedDriverIds.length === 0) {
      // initial (or cleared) -> show ALL drivers
      return drivers;
    }
    const chosen = new Set(selectedDriverIds);
    // d.data.id might be string; coerce to number
    return drivers.filter((d) => chosen.has(Number(d.data.id)));
  }, [drivers, hasUserChosenDrivers, selectedDriverIds]);

  const onChangeSearchQuery = useMemo(() => {
    return debounce((e) => {
      setSearchQuery(e);
      setQueryPageIndex(0);
    }, 300);
  }, []);

  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState(null);
  const [markers, setMarkers] = useState([]);

  // const centerChangeHandler = (data: any) => {
  //   setCenter(data);
  // };
  // const debouncedCenterChangeHandler = useMemo(
  //   () => debounce(centerChangeHandler, 300),
  //   [centerChangeHandler],
  // );

  // // cleanup to avoid memory leaks
  // useEffect(() => {
  //   return () => {
  //     debouncedCenterChangeHandler.cancel?.();
  //   };
  // }, [debouncedCenterChangeHandler]);

  const debouncedCenterChangeHandler = useMemo(
    () => debounce((data: any) => setCenter(data), 300),
    [setCenter],
  );

  useEffect(() => {
    return () => debouncedCenterChangeHandler.cancel?.();
  }, [debouncedCenterChangeHandler]);

  const [_getRoute, { }] = useApolloLazyQueryWithEffect<any>(GET_ROUTE_QUERY, {
    // variables: {
    //   id: selectedRouteId,
    // },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data.route) {
        dispatch(setRightSideBarRoute(data.route));
      }
    }
  });

  const [getJob, { }] = useApolloLazyQueryWithEffect<any>(GET_JOB_QUERY, {
    // variables: {
    //   id: selectedJobId,
    // },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data.job) {
        dispatch(setRightSideBarJob(data.job));
        dispatch(setIsShowRightSideBar(true));
      }
    }
  });

  const [getDriverCurrentRoute, { }] = useApolloLazyQueryWithEffect<any>(
    GET_DRIVER_CURRENT_ROUTE_QUERY,
    {
      // variables: {
      //   page: 1,
      //   first: 10,
      //   orderByColumn: "id",
      //   orderByOrder: "ASC",
      //   //today: moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
      //   today: moment(date).utc().format("YYYY-MM-DD") + " 14:00:00",
      //   driver_id: selectedDriverId,
      //   // driver_id: "5",
      // },
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data.routes.data.length > 0) {
          dispatch(setRightSideBarRoute(data.routes.data[0]));
          setMarkers([]);
          data.routes.data[0].route_points.map((route_point: any) => {
            setMarkers((markers) => [
              ...markers,
              {
                lat: route_point.lat,
                lng: route_point.lng,
                icon: getMapIcon(route_point),
                data: route_point,
              },
            ]);
          });
          setSelectedRouteIdRouting(data.routes.data[0].id);
        } else {
          setMarkers([]);
        }
      }
  });

  function clearJobFilters() {
    setCustomerName("");
    setPickupAddress("");
    setDeliveryAddress("");
    setAustralianState("");
  }


  function onMarkerClick(data: any) {
    if (data.job_id) {
      setSelectedJobId(data.job_id);
      getJob({
        variables: {
          id: selectedJobId,
        },
      });
    }
  }

  function onDriverClick(data: any) {
    setSelectedDriverId(parseInt(data.id));
    // getRoute();
    getDriverCurrentRoute({
      variables: {
        page: 1,
        first: 10,
        orderByColumn: "id",
        orderByOrder: "ASC",
        //today: moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
        today: moment(date).utc().format("YYYY-MM-DD") + " 14:00:00",
        driver_id: selectedDriverId,
      },
    });
    dispatch(setRightSideBarDriver(data));
    // dispatch(setRightSideBarData(data));
    dispatch(setIsShowRightSideBar(true));
  }

  function onJobClick(job: any) {
    if (selectedJobIdRouting == job.id) {
      setSelectedJobIdRouting(null);
      dispatch(setRightSideBarJob(null));
    } else {
      setSelectedJobIdRouting(job.id);
      dispatch(setRightSideBarJob(job));
    }
    setSelectedJob(job);
    setMarkers([]);
    job.job_destinations.map((destination: any) => {
      setMarkers((markers) => [
        ...markers,
        {
          lat: destination.lat,
          lng: destination.lng,
          icon: getMapIcon(destination),
          data: destination,
        },
      ]);
    });
  }

  const {
    // loading,
    // error,
    data: jobs,
    refetch: getJobs,
  } = useQuery<any>(GET_JOBS_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      today: moment(date).utc().format("YYYY-MM-DD HH:mm:ss"),
      orderBy: [{ column: "id", order: "DESC" }],
      pickup_address: pickupAddress,
      delivery_address: deliveryAddress,
      customer_name: customerName,
      pick_up_state: australianState,
      // driver_id: null,
    },
    // onCompleted: (_data) => {
      // Removed auto route on load for now
      // if (data.jobs.data[0]) {
      //   data.jobs.data.every((job: any) => {
      //     if (job.job_status_id == 1) {
      //       setSelectedJob(job);
      //       onJobClick(job);
      //       return false;
      //     }
      //   });
      // }
    // },
  });

  // Sync australianState with url state - new app change
  useEffect(() => {
    if (urlState && stateMap[urlState]) {
      setAustralianState(stateMap[urlState]);
      console.log("useffect state")
    } else if (state) {
      setAustralianState(state);
    }
  }, [urlState]);

  // Fetch jobs and set map center when relevant dependencies change
  useEffect(() => {
    onChangeSearchQuery.cancel();
    // if (center == null) {
    australianStates.forEach((st: any) => {
      if (st.value === australianState) {
        setCenter({ lat: st.lat, lng: st.lng });
        console.log("center state1")
      }
    });
    console.log("center state2")
    // }
    getJobs();
  }, [onChangeSearchQuery, rightSideBarJob, australianState, getJobs]);


  return (
    // <Wrapper
    //   apiKey={process.env.NEXT_PUBLIC_MAPS_KEY}
    //   render={render}
    //   libraries={["places", "marker"]}
    // >
    <GoogleMapProvider>
      <RightSideBar setMarkers={setMarkers}/>
      <Box
        pt={{ base: "130px", md: "97px", xl: "97px" }}
        w="full"
        overflowX="hidden"
      >
        {/* Reduced grid h for new app if needed reduce to 100px */}
        <Grid
          templateAreas={`"header header" "nav main"`}
          gridTemplateRows={"auto 1fr"}
          gridTemplateColumns={{ base: "35% 1fr", md: "400px 1fr" }}
          // h="90vh"
          h="calc(100vh - 110px)" 
          gap="1px"
          color="blackAlpha.700"
          fontWeight="bold"
          className="mk-job-allocation-wrap overflow-hidden"
          w="full"
          maxW="100%"
          minW={0}
        >
          {/* Allocation filter row */}
          <GridItem area={"header"} minW={0}>
            <Flex alignItems="center" className="py-5" w="full">  
              <h1 className="ml-6">Delivery Allocation</h1>
              <Spacer />
              {/* mailto:it@2easyfreight.com */}
              <Center>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDate(
                      /* Set date to today's date */
                      moment().format("YYYY-MM-DD"),
                    );
                  }}
                  sx={{ backgroundColor: "transparent" }}
                >
                  Today
                </Button>

                {/* setDate */}
                <IconButton
                  m={{ base: "2px" }}
                  aria-label="left button"
                  className="text-[var(--chakra-colors-primary-400)]"
                  icon={<FontAwesomeIcon icon={faChevronLeft} />}
                  onClick={() => {
                    setDate(
                      moment(date).subtract(1, "days").format("YYYY-MM-DD"),
                    );
                  }}
                />
                <Input
                  isRequired={true}
                  type="date"
                  variant="dateBlue"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                  placeholder="date"
                  className="input-blue-date"
                  ms={{ base: "0px", md: "0px" }}
                  fontSize="sm"
                  size="lg"
                />
                <IconButton
                  m={{ base: "2px" }}
                  aria-label="right button"
                  className="text-[var(--chakra-colors-primary-400)]"
                  icon={<FontAwesomeIcon icon={faChevronRight} />}
                  onClick={() => {
                    setDate(moment(date).add(1, "days").format("YYYY-MM-DD"));
                  }}
                />
              </Center>
              <Spacer />
              {/* Vehicle and driver selector */}
              <Center>
                <Box p="2" width="250px" minW={0}>
                  <Select
                    isMulti={true}
                    placeholder="All vehicle types"
                    options={vehicleClasses}
                    onChange={(e) => {
                      setSelectedVehicleClasses([]);
                      setSelectedVehicleClassIds([]);
                      if (e === null || e.length === 0) {
                        setSelectedVehicleClasses(vehicleClasses);
                        vehicleClasses.map((vehicleClass) => {
                          setSelectedVehicleClassIds(
                            (selectedVehicleClassIds) => [
                              ...selectedVehicleClassIds,
                              parseInt(vehicleClass.value),
                            ],
                          );
                        });
                        return;
                      }
                      e.map((vehicleClassOption) => {
                        let selectedVehicleClass = vehicleClasses.find(
                          (vehicleClass) =>
                            vehicleClass.value === vehicleClassOption.value,
                        );
                        setSelectedVehicleClasses((selectedVehicleClasses) => [
                          ...selectedVehicleClasses,
                          selectedVehicleClass,
                        ]);
                        setSelectedVehicleClassIds(
                          (selectedVehicleClassIds) => [
                            ...selectedVehicleClassIds,
                            selectedVehicleClass.value,
                          ],
                        );
                      });
                    }}
                    className="select mb-0"
                    classNamePrefix="two-easy-select"
                  ></Select>
                </Box>

                <Box p="2" width="350px" minW={0}>
                  <Select
                    isMulti={true}
                    placeholder="All available drivers"
                    value={
                      hasUserChosenDrivers
                        ? driverOptions.filter((opt) =>
                          selectedDriverIds.includes(opt.value),
                        )
                        : [] // no chips initially, but map shows all
                    }
                    options={driverOptions
                      .filter((opt) =>
                        selectedVehicleClassIds.includes(
                          opt.data.vehicle_class_id,
                        ),
                      )
                      .map((opt) => ({
                        ...opt,
                        label: <AvailableDriverCard driver={opt.data} />,
                      }))}
                    onChange={(e) => {
                      if (!e || e.length === 0) {
                        setHasUserChosenDrivers(false); // back to showing ALL on map
                        setSelectedDriverIds([]);
                        return;
                      }
                      setHasUserChosenDrivers(true);
                      setSelectedDriverIds(
                        e.map((opt: any) => Number(opt.value)),
                      );
                    }}
                    // setHasUserChosenDrivers(true);

                    // setSelectedDrivers([]);
                    // e.map((driverOption) => {
                    //   let selectedDriver = drivers.find(
                    //     (driver) =>
                    //       parseInt(driver.data.id) === driverOption.value,
                    //   );
                    //   setSelectedDrivers((selectedDrivers) => [
                    //     ...selectedDrivers,
                    //     selectedDriver,
                    //   ]);
                    // });
                    // }}
                    className="select mb-0"
                    classNamePrefix="two-easy-select"
                    chakraStyles={{}}
                  ></Select>
                </Box>
                <Box p="2">
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
              </Center>
            </Flex>
          </GridItem>

          {/* Job list column */}
          <GridItem
            area={"nav"}
            className="job-list-column h-full overflow-auto pt-4 px-6 border-t"
            sx={{
              maxWidth: "400px",
              height: "calc(100vh - 186px)",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          // minW={0}
          //  height="100vh"
          >
            <Flex className=" flex-col" minW={0}>
              <Flex className="relative">
                <SearchBar
                  onChangeSearchQuery={onChangeSearchQuery}
                  background={menuBg}
                  className="mb-0 mr-2.5 !w-full"
                />

                <JobFilterMenu
                  customerName={customerName}
                  pickupAddress={pickupAddress}
                  deliveryAddress={deliveryAddress}
                  australianState={australianState}
                  setCustomerName={(value: any) => setCustomerName(value)}
                  setPickupAddress={(value: any) => setPickupAddress(value)}
                  setDeliveryAddress={(value: any) => setDeliveryAddress(value)}
                  setAustralianState={(value: any) => {
                    setAustralianState(value);
                    // dispatch(setState(e.value));
                  }}
                />
              </Flex>
              {customerName ||
                pickupAddress ||
                pickupAddress ||
                australianState ? (
                <Flex className="pt-4 flex-wrap align-center">
                  <p className="text-sm mr-1">Filters: </p>

                  {customerName ? (
                    <p className="mr-1 text-sm">{customerName},</p>
                  ) : null}
                  {pickupAddress ? (
                    <p className="mr-1 text-sm">{pickupAddress},</p>
                  ) : null}
                  {deliveryAddress ? (
                    <p className="mr-1 text-sm">{deliveryAddress},</p>
                  ) : null}
                  {australianState ? (
                    <p className="text-sm">{australianState}</p>
                  ) : null}

                  <Button
                    onClick={clearJobFilters}
                    className="!h-[20px] ml-2"
                    variant="smallGreySquare"
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="pt-[1px] pr-1 mb-0"
                    />
                    Clear
                  </Button>
                </Flex>
              ) : null}
            </Flex>

            <Divider className="mb-2 mt-3" />

            <h3 className="mb-1">Unassigned</h3>
            {jobTypes.map((jobType) => {
              return (
                <Accordion
                  key={`jt-${jobType.id}`}
                  variant="jobs"
                  defaultIndex={[0]}
                  allowMultiple
                >
                  <AccordionItem>
                    <Box
                      mb="2"
                      borderRadius="0"
                      bg={jobType.color}
                      className="px-2 pt-4 pb-2"
                    >
                      <AccordionButton sx={{ padding: 0 }}>
                        <Box as="span" flex="1" textAlign="left">
                          <Text
                            color="white"
                            className="mb-2 text-xs !font-bold"
                          >
                            Unassigned {jobType.name} Jobs
                          </Text>
                        </Box>
                        <AccordionIcon sx={{ color: "#fff" }} />
                      </AccordionButton>

                      <AccordionPanel p={0}>
                        {jobs?.jobs?.data?.map((job: any) => {
                          if (
                            job.job_type_id === jobType.id &&
                            job.driver_id == null
                          ) {
                            return (
                              <JobAccordion
                                key={`jtj-${job.id}`}
                                job={job}
                                selectedJobIdRouting={selectedJobIdRouting}
                                onJobClick={(data: any) => onJobClick(data)}
                                onMarkerClick={(data: any) =>
                                  onMarkerClick(data)
                                }
                              />
                            );
                          }
                        })}
                      </AccordionPanel>
                    </Box>
                  </AccordionItem>
                </Accordion>
              );
            })}

            {/* Declined jobs */}
            <Accordion
              key={`jt-disabled`}
              variant="jobs"
              defaultIndex={[0]}
              allowMultiple
            >
              <AccordionItem>
                <Box
                  mb="2"
                  borderRadius="0"
                  bg="gray.500"
                  className="px-2 pt-4 pb-2"
                >
                  <AccordionButton sx={{ padding: 0 }}>
                    <Box as="span" flex="1" textAlign="left">
                      <Text color="white" className="mb-2 text-xs !font-bold">
                        Declined Jobs
                      </Text>
                    </Box>
                    <AccordionIcon sx={{ color: "#fff" }} />
                  </AccordionButton>

                  <AccordionPanel p={0}>
                    {jobs?.jobs?.data?.map((job: any) => {
                      if (job.job_status_id === "9" && job.driver_id != null) {
                        return (
                          <JobAccordion
                            key={`jtj-${job.id}`}
                            job={job}
                            selectedJobIdRouting={selectedJobIdRouting}
                            onJobClick={(data: any) => onJobClick(data)}
                            onMarkerClick={(data: any) => onMarkerClick(data)}
                          />
                        );
                      }
                    })}
                  </AccordionPanel>
                </Box>
              </AccordionItem>
            </Accordion>

            {/* Assigned Jobs */}
            <h3 className="mt-5 mb-1">Assigned</h3>
            {jobTypes.map((jobType) => {
              return (
                <Accordion
                  key={`jt-${jobType.id}`}
                  variant="jobs"
                  defaultIndex={[0]}
                  allowMultiple
                >
                  <AccordionItem>
                    <Box
                      mb="2"
                      borderRadius="0"
                      bg={jobType.color}
                      className="px-2 pt-4 pb-2"
                    >
                      <AccordionButton sx={{ padding: 0 }}>
                        <Box as="span" flex="1" textAlign="left">
                          <Text
                            color="white"
                            className="mb-2 text-xs !font-bold"
                          >
                            Assigned {jobType.name} Jobs
                          </Text>
                        </Box>
                        <AccordionIcon sx={{ color: "#fff" }} />
                      </AccordionButton>

                      <AccordionPanel p={0}>
                        {jobs?.jobs?.data?.map((job: any) => {
                          if (
                            job.job_type_id === jobType.id &&
                            ["2", "3", "4", "5"].includes(job.job_status_id)
                          ) {
                            return (
                              <JobAccordion
                                key={`jtj-${job.id}`}
                                job={job}
                                selectedJobIdRouting={selectedJobIdRouting}
                                onJobClick={(data: any) => onJobClick(data)}
                                onMarkerClick={(data: any) =>
                                  onMarkerClick(data)
                                }
                              />
                            );
                          }
                        })}
                      </AccordionPanel>
                    </Box>
                  </AccordionItem>
                </Accordion>
              );
            })}

            {/* Completed Jobs */}
            <h3 className="mt-5 mb-1">Completed</h3>
            {jobTypes.map((jobType) => {
              return (
                <Accordion
                  key={`jt-${jobType.id}`}
                  variant="jobs"
                  defaultIndex={[0]}
                  allowMultiple
                >
                  <AccordionItem>
                    <Box
                      mb="2"
                      borderRadius="0"
                      bg={jobType.color}
                      className="px-2 pt-4 pb-2"
                    >
                      <AccordionButton sx={{ padding: 0 }}>
                        <Box as="span" flex="1" textAlign="left">
                          <Text
                            color="white"
                            className="mb-2 text-xs !font-bold"
                          >
                            Completed {jobType.name} Jobs
                          </Text>
                        </Box>
                        <AccordionIcon sx={{ color: "#fff" }} />
                      </AccordionButton>

                      <AccordionPanel p={0}>
                        {jobs?.jobs?.data?.map((job: any) => {
                          if (
                            job.job_type_id === jobType.id &&
                            ["6", "7"].includes(job.job_status_id)
                          ) {
                            return (
                              <JobAccordion
                                key={`jtjt-${job.id}`}
                                job={job}
                                selectedJobIdRouting={selectedJobIdRouting}
                                onJobClick={(data: any) => onJobClick(data)}
                                onMarkerClick={(data: any) =>
                                  onMarkerClick(data)
                                }
                              />
                            );
                          }
                        })}
                      </AccordionPanel>
                    </Box>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </GridItem>

          {/* Job map */}
          <GridItem
            bg="green.300"
            area={"main"}
            sx={{ height: "calc(100vh - 200px)" }}
            minW={0} // ← add this
            overflow="hidden"
          >
            <Map
              center={center}
              zoom={zoom}
              markers={markers}
              drivers={visibleDrivers}
              onCenterChanged={debouncedCenterChangeHandler}
              onZoomChanged={(data: any) => setZoom(data)}
              onMarkerClick={(data: any) => onMarkerClick(data)}
              onDriverClick={(data: any) => onDriverClick(data)}
              isRouted={
                selectedJobIdRouting != null || selectedRouteIdRouting != null
                  ? true
                  : false
              }
            // options={{
            //   mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID, // 👈 dynamically load from env
            // }}
            />
          </GridItem>
        </Grid>
      </Box>
    </GoogleMapProvider>
    // </Wrapper>
  );
}
