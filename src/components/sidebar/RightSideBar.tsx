// chakra imports
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  Flex,
  FormLabel,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { faGripLines } from "@fortawesome/pro-light-svg-icons";
import { faUserMinus } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "chakra-react-select";
import { showGraphQLErrorToast } from "../toast/ToastError";
import { GET_DRIVER_AVAILABILITYS_QUERY } from "@/graphql/driverAvailability";
import { UPDATE_ROUTE_MUTATION } from "@/graphql/route";
import { UPDATE_ROUTE_POINT_SORT_ID_MUTATION } from "@/graphql/routePoint";
import { formatTime } from "@/lib/helpers/helper";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsShowRightSideBar,
  setRightSideBarData,
  setRightSideBarDriver,
  setRightSideBarJob,
  setRightSideBarRoute,
} from "@/lib/store/rightSideBarSlice";
import { RootState } from "@/lib/store/store";
import RsbDraggableIndicatorCircle from "./components/RsbDraggableIndicatorCircle";
import RsbTooltip from "./components/RsbTooltip";
import RightSideBarJob from "./RightSideBarJob";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

// TODO: Driver select dropdown avatar
// remember to import "chakraComponents" from "chakra-react-select"!
// const driverDropdownOptions = {
//   Option: ({ children, ...props }) => (
//     <chakraComponents.Option {...props}>
//       <img source={props.data.image} className="mr-2 h-8 w-8 rounded-full" />
//       {children}
//     </chakraComponents.Option>
//   ),
// };

// Assets

interface Marker {
  lng: number;
  lat: number;
  icon?: string;
  data?: any;
}

function RightSideBar({
  setMarkers,
}: {
  setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>;
}) {
  const rightSideBarJobRef = useRef(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  // let variantChange = "0.2s linear";
  // let shadow = useColorModeValue(
  //   "14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
  //   "unset",
  // );
  // let sidebarBg = useColorModeValue("white", "navy.800");
  // let sidebarMargins = "0px";
  let sidebarBackgroundColor = useColorModeValue("white", "navy.800");
  // let menuColor = useColorModeValue("gray.400", "white");
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef(null);
  const router = useRouter();
  const [routePoints, setRoutePoints] = useState([]);
  const [driverAvailabilitys, setDriverAvailabilitys] = useState([]);
  const [route, setRoute] = useState({
    driver_id: null,
    id: null,
    current_volume: 0,
    current_weight: 0,
  });
  const [driver, setDriver] = useState(null);

  const isShowRightSideBar = useSelector(
    (state: RootState) => state.rightSideBar.isShow,
  );
  // const _rightSideBarData = useSelector(
  //   (state: RootState) => state.rightSideBar.data,
  // );
  const rightSideBarJob = useSelector(
    (state: RootState) => state.rightSideBar.job,
  );
  const rightSideBarRoute = useSelector(
    (state: RootState) => state.rightSideBar.route,
  );
  const rightSideBarDriver = useSelector(
    (state: RootState) => state.rightSideBar.driver,
  );
  const driverOptions = useSelector(
    (state: RootState) => state.drivers.availableDriverOptions,
  );
  const drivers = useSelector(
    (state: RootState) => state.drivers.availableDrivers,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (isShowRightSideBar) {
      onOpen();
      if (rightSideBarRoute) {
        setRoutePoints(rightSideBarRoute.route_points);
        setRoute(rightSideBarRoute);
        setDriver(rightSideBarRoute.driver);
      }
    } else {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowRightSideBar, onClose, onOpen, rightSideBarRoute]);

  function onCloseComplete() {
    dispatch(setIsShowRightSideBar(false));
    dispatch(setRightSideBarData(null));
    dispatch(setRightSideBarJob(null));
    dispatch(setRightSideBarRoute(null));
    dispatch(setRightSideBarDriver(null));
    setMarkers([])
  }

  // a little function to help us with reordering the result
  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    const newRoutePoints = reorder(
      routePoints,
      result.source.index,
      result.destination.index,
    );

    setRoutePoints(newRoutePoints);
  }

  // GET_DRIVER_AVAILABILITYS_QUERY
  useApolloQueryWithEffect(GET_DRIVER_AVAILABILITYS_QUERY, {
    variables: {
      first: 100,
      page: 1,
      today: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
      orderByColumn: "id",
      orderByOrder: "ASC",
      driver_id: route.driver_id,
    }},
    (data) => {
      const d = data as any;
      setDriverAvailabilitys(d.driverAvailabilitys.data);
    },
  );

  const [handleUpdateRoutePointSortId, { }] = useMutation(
    UPDATE_ROUTE_POINT_SORT_ID_MUTATION,
    {
      onCompleted: (_data: any) => {
        toast({
          title: "Route Point updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  const [updateRoute, { }] = useMutation(UPDATE_ROUTE_MUTATION, {
    onCompleted: (_data: any) => {
      toast({
        title: "Route updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      showGraphQLErrorToast(error);
    },
  });

  function onSave() {
    if (rightSideBarJob) {
      rightSideBarJobRef.current.onSave();
    } else {
      if (routePoints.length !== 0) {
        routePoints.forEach((routePoint: any, index: number) => {
          handleUpdateRoutePointSortId({
            variables: {
              input: {
                id: routePoint.id,
                sort_id: index,
              },
            },
          });
        });
      }
      if (route) {
        updateRoute({
          variables: {
            input: {
              id: route.id,
              driver_id: route.driver_id,
            },
          },
        });
      }
    }
  }
  function navigateToJob() {
    router.push(`/admin/jobs/${rightSideBarJob.id}`);
  }
  return (
    // Delivery allocation, click on a driver avatar
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        finalFocusRef={btnRef}
        onCloseComplete={onCloseComplete}
        size="md"
      >
        <DrawerContent bg={sidebarBackgroundColor} className="map-drawer">
          <DrawerCloseButton
            zIndex="3"
            onClick={onClose}
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />

          <DrawerBody px="1rem" pb="0" pt="20px">
            {rightSideBarJob && (
              <>
                <RightSideBarJob
                  ref={rightSideBarJobRef}
                  initJob={rightSideBarJob}
                  driverOptions={driverOptions}
                ></RightSideBarJob>
              </>
            )}

            {rightSideBarDriver && (
              <h2>Driver: {rightSideBarDriver.full_name}</h2>
            )}

            {rightSideBarDriver && rightSideBarRoute == null && (
              <>
                <Divider my="1" />
                <Text className="mt-3">
                  No route available, please assign a job
                </Text>
              </>
            )}

            {rightSideBarRoute && (
              <>
                {/* TODO::should make this another component */}
                <h2>Route: #{rightSideBarRoute.name || `N/A`}</h2>

                <Divider my="1" />

                <Flex alignItems="center" mt="24px" mb="16px">
                  <FormLabel
                    className="ml-0 !mb-0 w-[200px] font-semibold !text-sm"
                    color={textColor}
                  >
                    Date
                  </FormLabel>
                  <Box className="!max-w-md w-full">
                    <Text>N/A</Text>
                  </Box>
                </Flex>

                <Flex alignItems="center" mb="16px">
                  <FormLabel
                    className="ml-0 !mb-0 w-[200px] font-semibold !text-sm"
                    color={textColor}
                  >
                    Assigned to
                  </FormLabel>
                  <Box className="!max-w-md w-full">
                    {/* TODO: style input with driver avatar, component started */}
                    <Select
                      className="0px"
                      placeholder="Select Driver"
                      defaultValue={driverOptions.find((driverOption) => {
                        return (
                          driverOption.value === rightSideBarRoute.driver_id
                        );
                      })}
                      options={driverOptions}
                      onChange={(e) => {
                        var driver = drivers.find((driverOption) => {
                          return parseInt(driverOption.id) === e.value;
                        });
                        setDriver(driver);
                        setRoute({ ...route, driver_id: e.value });
                      }}
                    // components={driverDropdownOptions}
                    ></Select>
                  </Box>
                </Flex>

                <Flex alignItems="center" mb="16px">
                  <FormLabel
                    className="ml-0 !mb-0 w-[200px] font-semibold !text-sm"
                    color={textColor}
                  >
                    Capacity
                  </FormLabel>
                  <Box className="!max-w-md w-full">
                    <Text fontSize="sm">
                      <div>
                        {driver ? (
                          <span
                            style={{
                              color:
                                route.current_volume >
                                  driver.no_max_capacity * 0.9
                                  ? "red"
                                  : "black",
                            }}
                          >
                            {route.current_volume || 0}
                          </span>
                        ) : (
                          <span>{route.current_volume || 0}</span>
                        )}
                        / {driver ? driver.no_max_volume : 0}Cbm
                      </div>
                      <div>
                        {driver ? (
                          <span
                            style={{
                              color:
                                route.current_weight >
                                  driver.no_max_capacity * 0.9
                                  ? "red"
                                  : "black",
                            }}
                          >
                            {route.current_weight || 0}
                          </span>
                        ) : (
                          <span>{route.current_weight || 0}</span>
                        )}
                        / {driver ? driver.no_max_capacity : 0}Kg
                      </div>
                    </Text>
                  </Box>
                </Flex>

                <Flex alignItems="center" mb="16px">
                  <FormLabel
                    className="ml-0 !mb-0 w-[200px] font-semibold !text-sm"
                    color={textColor}
                  >
                    Availability
                  </FormLabel>
                  <Box className="!max-w-md w-full">
                    {driverAvailabilitys.length !== 0 ? (
                      <Text fontSize="sm">
                        {driverAvailabilitys.map((driverAvailability: any) => {
                          return (
                            <span key={driverAvailability.id}>
                              {`${formatTime(
                                driverAvailability.from_at,
                              )} - ${formatTime(
                                driverAvailability.to_at,
                              )}`}{" "}
                            </span>
                          );
                        })}
                      </Text>
                    ) : (
                      <Text>N/A</Text>
                    )}
                  </Box>
                </Flex>

                <Divider my="6" />

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided: any, _snapshot: any) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        // style={getListStyle(snapshot.isDraggingOver)}
                        className="rsb-route-point-wrap"
                      >
                        {routePoints.map((routePoint: any, index: any) => {
                          return (
                            <Draggable
                              key={routePoint.id}
                              draggableId={routePoint.id}
                              index={index}
                            >
                              {(provided: any, _snapshot: any) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <Flex
                                    alignItems="center"
                                    className="relative py-2"
                                  >
                                    <RsbDraggableIndicatorCircle
                                      destinationStatus={
                                        routePoint.route_point_status_id
                                      }
                                      indicatorColor={routePoint.color}
                                    />

                                    {/* Card information */}
                                    <Flex className="ml-5 p-2 w-full rounded-lg">
                                      <Flex flexDirection="column">
                                        <Text fontSize="xs">
                                          {routePoint.label}
                                        </Text>

                                        <Text className="my-1 !text-sm !font-bold">{`${routePoint.address}`}</Text>

                                        {routePoint.job_destination_id && (
                                          <RsbTooltip
                                            jobName={
                                              "Job #" + routePoint.job.name
                                            }
                                            pickupNotes={
                                              routePoint.job.pick_up_notes
                                            }
                                          />
                                        )}

                                        {routePoint.vehicle_hire_id && (
                                          <RsbTooltip
                                            jobName={
                                              "Vehicle Hire #" +
                                              routePoint.vehicle_hire.name
                                            }
                                            pickupNotes={
                                              routePoint.vehicle_hire
                                                .customer_notes
                                            }
                                          />
                                        )}
                                      </Flex>

                                      {/* Job buttons */}
                                      <Flex className="flex-col justify-start items-center ml-auto">
                                        {/* Unassign job dropdown button */}
                                        <Menu>
                                          <MenuButton as={Button} p="2">
                                            <div>
                                              <FontAwesomeIcon
                                                icon={faEllipsis}
                                                className="text-[var(--chakra-colors-secondaryGray-100)]"
                                              />
                                            </div>
                                          </MenuButton>

                                          <MenuList>
                                            {/* TODO: Actually unassign job */}
                                            <MenuItem className="hover:!bg-transparent text-sm !font-bold">
                                              <FontAwesomeIcon
                                                icon={faUserMinus}
                                                className="mr-2 text-[var(--chakra-colors-red-400)]"
                                              />
                                              <p className="text-[var(--chakra-colors-red-400)]">
                                                Unassign Job
                                              </p>
                                            </MenuItem>
                                          </MenuList>
                                        </Menu>

                                        {/* TODO: Disable repositioning order if Job is complete */}
                                        {/* Drag handle, hide if complete */}
                                        {routePoint.route_point_status_id !=
                                          3 ? (
                                          <div {...provided.dragHandleProps}>
                                            <FontAwesomeIcon
                                              icon={faGripLines}
                                              className="text-[var(--chakra-colors-secondaryGray-100)]"
                                            />
                                          </div>
                                        ) : null}
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </Box>
                              )}
                            </Draggable>
                          );
                        })}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </>
            )}
          </DrawerBody>

          <DrawerFooter className="d-flex">
            <Button onClick={onClose} variant="outline" className="mr-auto">
              Cancel
            </Button>
            {rightSideBarJob && (
              <>
                <Button onClick={navigateToJob} variant="secondary" mr={2}>
                  Edit Job
                </Button>
              </>
            )}

            <Button onClick={onSave} variant="primary">
              Save Changes
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default RightSideBar;
