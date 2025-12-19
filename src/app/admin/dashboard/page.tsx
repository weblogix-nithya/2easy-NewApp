"use client"
import { useQuery } from "@apollo/client/react";
import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import DashboardBookingCard from "@/components/card/DashboardBookingCard";
import DashboardInfoCard from "@/components/card/DashboardInfoCard";
import DashboardInfoCardRow from "@/components/card/DashboardInfoCardRow";
import { GET_DRIVERS_QUERY } from "@/graphql/driver";
import { GET_JOBS_QUERY } from "@/graphql/job";
import { today } from "@/lib/helpers/helper";
// import AdminLayout from "@/layouts/admin";
import moment from "moment";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { faExclamationCircle, faIdCard, faSignOut, faTruck, faUser, faUserPlus } from "@fortawesome/free-solid-svg-icons";

interface PaginatorInfo {
  total: string;
}

interface JobsResponse {
  jobs: {
    data: any[];
    paginatorInfo: PaginatorInfo;
  };
}

interface DriversResponse {
  drivers: {
    data: any[];
    paginatorInfo: PaginatorInfo;
  };
}
export default function Dashboard() {
  // const brandColor = useColorModeValue("brand.500", "white");
  // const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  const isAdmin = useSelector((state: RootState) => state.user.isAdmin);
  // const isCompany = useSelector((state: RootState) => state.user.isCompany);
  // const isCustomer = useSelector((state: RootState) => state.user.isCustomer);
  const [date, _setDate] = useState(
    moment(today).utc().format("YYYY-MM-DD HH:mm:ss"),
  );

  const { data: unassignedJobs } = useQuery<JobsResponse>(
    GET_JOBS_QUERY,
    {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        job_status_ids: [1],
        today: date,
      },
      skip: !isAdmin,
    },
  );

  const {
    // loading: unassignedStandardJobsLoading,
    data: unassignedStandardJobs,
  } = useQuery<JobsResponse>(GET_JOBS_QUERY, {
    variables: {
      page: 1,
      first: 30,
      orderBy: [{ column: "id", order: "DESC" }],
      job_status_ids: [1],
      job_type_id: 1,
      today: date,
    },
    skip: !isAdmin,
  });

  const { data: unassignedExpressJobs } =
    useQuery<JobsResponse>(GET_JOBS_QUERY, {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        job_status_ids: [1],
        job_type_id: 2,
        today: date,
      },
      skip: !isAdmin,
    });

  const { data: unassignedUrgentJobs } =
    useQuery<JobsResponse>(GET_JOBS_QUERY, {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        job_status_ids: [1],
        job_type_id: 3,
        today: date,
      },
      skip: !isAdmin,
    });

  const { data: declinedJobs } = useQuery<JobsResponse>(
    GET_JOBS_QUERY,
    {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        job_status_ids: [9],
        today: date,
      },
      skip: !isAdmin,
    },
  );

  const { data: incompleteJobs } = useQuery<JobsResponse>(
    GET_JOBS_QUERY,
    {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        job_status_ids: [2, 3, 4, 5],
        today: date,
      },
      skip: !isAdmin,
    },
  );

  const {  data: incompleteUrgentJobs } = useQuery<JobsResponse>(GET_JOBS_QUERY, {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        job_status_ids: [2, 3, 4, 5],
        job_type_id: 3,
        today: date,
      },
      skip: !isAdmin,
    });

  const {  data: incompleteExpressJobs } = useQuery<JobsResponse>(GET_JOBS_QUERY, {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        job_status_ids: [2, 3, 4, 5],
        job_type_id: 2,
        today: date,
      },
      skip: !isAdmin,
    });

  const {data: incompleteStandardJobs } = useQuery<JobsResponse>(GET_JOBS_QUERY, {
    variables: {
      page: 1,
      first: 30,
      orderBy: [{ column: "id", order: "DESC" }],
      job_status_ids: [2, 3, 4, 5],
      job_type_id: 1,
      today: date,
    },
    skip: !isAdmin,
  });

  const {data: customerIssueReportJobs} = useQuery<JobsResponse>(GET_JOBS_QUERY, {
    variables: {
      page: 1,
      first: 30,
      orderBy: [{ column: "id", order: "DESC" }],
      today: date,
      has_customer_issue: true,
    },
    skip: !isAdmin,
  });

  const { loading: _driverIssueReportJobsLoading, data: driverIssueReportJobs } =
    useQuery<JobsResponse>(GET_JOBS_QUERY, {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        today: date,
        has_driver_issue: true,
      },
      skip: !isAdmin,
    });

  const { loading: _reportIssueReportJobsLoading, data: _reportIssueReportJobs } =
    useQuery(GET_JOBS_QUERY, {
      variables: {
        page: 1,
        first: 30,
        orderBy: [{ column: "id", order: "DESC" }],
        today: date,
        has_report_issue: true,
      },
      skip: !isAdmin,
    });

  const { loading: _onlineDriversLoading, data: onlineDrivers } = useQuery<DriversResponse>(
    GET_DRIVERS_QUERY,
    {
      variables: {
        page: 1,
        first: 30,
        orderByColumn: "id",
        orderByOrder: "DESC",
        available: true,
      },
      skip: !isAdmin,
    },
  );

  const { loading: _pendingDriversLoading, data: pendingDrivers } = useQuery<DriversResponse>(
    GET_DRIVERS_QUERY,
    {
      variables: {
        page: 1,
        first: 30,
        orderByColumn: "id",
        orderByOrder: "DESC",
        driverStatusId: 1,
      },
      skip: !isAdmin,
    },
  );

  const { loading: _expiredLicenseDriversLoading, data: expiredLicenseDrivers } =
    useQuery<DriversResponse>(GET_DRIVERS_QUERY, {
      variables: {
        page: 1,
        first: 30,
        orderByColumn: "id",
        orderByOrder: "DESC",
        has_expired: true,
      },
      skip: !isAdmin,
    });

  return (
    // <AdminLayout>
      <Box pt={{ base: "130px", md: "97px", xl: "97px" }}>
        <SimpleGrid
          mb="20px"
          pt="32px"
          px="24px"
          columns={{ sm: 1 }}
          spacing={{ base: "20px", xl: "20px" }}
        >
          {/* Admin info dashboard */}
          {isAdmin && (
            <Flex flexDirection="column">
              <h1 className="mb-4">Dashboard</h1>

              {/* Today's jobs */}
              <Box className="">
                <h2 className="mb-4">{`Today's Jobs`}</h2>

                <SimpleGrid minChildWidth="380px" spacing="16px">
                  <Box className="">
                    <DashboardInfoCard
                      title="Unassigned Jobs"
                      quantity={
                        unassignedJobs?.jobs?.paginatorInfo?.total || "0"
                      }
                      icon={faUser}
                      iconBgColor="#3B68DB"
                    >
                      <DashboardInfoCardRow
                        title="Unassigned Urgent Jobs"
                        description={
                          unassignedUrgentJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={unassignedUrgentJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#ED1A2C"
                      />

                      <DashboardInfoCardRow
                        title="Unassigned Express Jobs"
                        description={
                          unassignedExpressJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={unassignedExpressJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#FA8231"
                      />

                      <DashboardInfoCardRow
                        title="Unassigned Standard Jobs"
                        description={
                          unassignedStandardJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={unassignedStandardJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#8854d0"
                      />
                      <DashboardInfoCardRow
                        title="Declined Jobs"
                        description={declinedJobs?.jobs?.paginatorInfo?.total}
                        data={declinedJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#888888"
                      />
                    </DashboardInfoCard>
                  </Box>

                  <Box className="">
                    <DashboardInfoCard
                      title="Incomplete Jobs"
                      quantity={
                        incompleteJobs?.jobs?.paginatorInfo?.total || "0"
                      }
                      icon={faTruck}
                      iconBgColor="#3B68DB"
                    >
                      <DashboardInfoCardRow
                        title="Incomplete Urgent Jobs"
                        description={
                          incompleteUrgentJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={incompleteUrgentJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#ED1A2C"
                      />
                      <DashboardInfoCardRow
                        title="Incomplete Express Jobs"
                        description={
                          incompleteExpressJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={incompleteExpressJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#FA8231"
                      />
                      <DashboardInfoCardRow
                        title="Incomplete Standard Jobs"
                        description={
                          incompleteStandardJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={incompleteStandardJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#888888"
                      />
                    </DashboardInfoCard>
                  </Box>

                  <Box>
                    <DashboardInfoCard
                      title="Issue Reports"
                      quantity={
                        customerIssueReportJobs?.jobs?.paginatorInfo.total +
                          driverIssueReportJobs?.jobs?.paginatorInfo?.total ||
                        "0"
                      }
                      icon={faExclamationCircle}
                      iconBgColor="#DC1728"
                    >
                      <DashboardInfoCardRow
                        title="Customer Issues"
                        description={
                          customerIssueReportJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={customerIssueReportJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#ED1A2C"
                      />
                      <DashboardInfoCardRow
                        title="Driver Issues"
                        description={
                          driverIssueReportJobs?.jobs?.paginatorInfo?.total ||
                          "0"
                        }
                        data={driverIssueReportJobs?.jobs?.data}
                        path="/admin/jobs"
                        descriptionBgColor="#ED1A2C"
                      />
                    </DashboardInfoCard>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Drivers row */}
              <Box className="">
                <h2 className="mt-10 mb-4">Drivers</h2>

                <SimpleGrid minChildWidth="380px" spacing="16px">
                  <Box className="">
                    <DashboardInfoCard
                      title="Online Drivers"
                      quantity={
                        onlineDrivers?.drivers?.paginatorInfo?.total || "0"
                      }
                      icon={faUser}
                      iconBgColor="#2BA620"
                    ></DashboardInfoCard>
                  </Box>

                  <Box className="">
                    <DashboardInfoCard
                      title="Incomplete Log-off requests (in development)"
                      quantity="2"
                      icon={faSignOut}
                      iconBgColor="#888888"
                    >
                      <DashboardInfoCardRow
                        title="in development"
                        description="- incomplete"
                        descriptionBgColor="#DC1728"
                      />
                      <DashboardInfoCardRow
                        title="in development"
                        description="- incomplete"
                        descriptionBgColor="#DC1728"
                      />
                    </DashboardInfoCard>
                  </Box>

                  <Box>
                    <DashboardInfoCard
                      title="New Driver Applications"
                      quantity={
                        pendingDrivers?.drivers?.paginatorInfo?.total || "0"
                      }
                      icon={faUserPlus}
                      iconBgColor="#2BA620"
                    >
                      <DashboardInfoCardRow
                        title="View Applications"
                        description={
                          pendingDrivers?.drivers?.paginatorInfo?.total || "0"
                        }
                        data={pendingDrivers?.drivers?.data}
                        path="/admin/drivers"
                      />
                    </DashboardInfoCard>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Vehicles & Registrations */}
              <Box className="">
                <h2 className="mt-10 mb-4">Vehicles & Registrations</h2>

                <SimpleGrid minChildWidth="380px" spacing="16px">
                  <Box className="">
                    <DashboardInfoCard
                      title="Expired Registrations (in development)"
                      quantity="-"
                      icon={faUserPlus}
                      iconBgColor="#888888"
                    >
                      <DashboardInfoCardRow title="View Applications" />
                    </DashboardInfoCard>
                  </Box>

                  <Box className="">
                    <DashboardInfoCard
                      title="Expired Drivers Licenses"
                      quantity={
                        expiredLicenseDrivers?.drivers?.paginatorInfo?.total ||
                        "0"
                      }
                      icon={faIdCard}
                      iconBgColor="#888888"
                    >
                      <DashboardInfoCardRow
                        title="View Applications"
                        data={expiredLicenseDrivers?.drivers?.data}
                      />
                    </DashboardInfoCard>
                  </Box>
                </SimpleGrid>
              </Box>
            </Flex>
          )}

          {/* Customer Dashboard */}
          {!isAdmin && (
            <Flex flexDirection="column">
              {/* TODO: Add username */}
              <h1 className="mb-6">Welcome, (...)</h1>

              <Flex flexWrap="wrap">
                {/* TODO: Add actual link paths */}
                <div className="mb-3 mr-3">
                  <DashboardBookingCard
                    image={"/img/dashboards/jobtype-express-icon.png"}
                    title="Book New Delivery"
                    linkText="New booking"
                    link="/admin/jobs/create"
                  />
                </div>
                <div className="mb-3">
                  <DashboardBookingCard
                    image={"/img/dashboards/jobtype-standard-icon.png"}
                    title="Book New Hourly Hire"
                    linkText="New booking"
                    link="/admin/vehicle-hires/create"
                  />
                </div>
              </Flex>

              {/* Assistance details */}
              <div className="mt-16">
                <h4 className="mb-4">Do you require assistance?</h4>

                <div className="mb-4">
                  <p className="!font-bold">QLD and Northern NSW bookings</p>
                  <p>Email: hello.bne@2easyfreight.com</p>
                  <p>Phone: 1300 600 054</p>
                </div>

                <div>
                  <p className="!font-bold">VIC bookings</p>
                  <p>Email: hello.mel@2easyfreight.com</p>
                  <p>Phone: 1300 600 054</p>
                </div>
              </div>
            </Flex>
          )}
        </SimpleGrid>
      </Box>
    //  </AdminLayout>
  );
}
