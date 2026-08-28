import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Link,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { UPDATE_REPORT_ISSUE_MUTATION } from "@/graphql/issueReport";
import { formatDate } from "@/lib/helpers/helper";
import React, { useEffect, useMemo, useState } from "react";

import PaginationMultipleImageTable from "./PaginationMultipleImageTable";

export default function ReportsTab(props: { jobObject: any }) {
  const { jobObject } = props;
  const toast = useToast();
  const [job, setJob] = useState(jobObject);
  const [jobDestinationsConfirmed, setJobDestinationsConfirmed] = useState([]);
  const [driverIssues, setDriverIssues] = useState([]);
  const [customerIssues, setCustomerIssues] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);

  const pickupColumns = useMemo(
    () => [
      {
        id: "type",
        header: "TYPE",
        accessorKey: "type",
        meta: { Header: "TYPE" },
      },
      {
        id: "address",
        header: "ADDRESS",
        accessorKey: "address",
        meta: { Header: "ADDRESS" },
      },
      {
        id: "date",
        header: "DATE",
        accessorKey: "date_pick_up",
        meta: { Header: "DATE" },
      },
      {
        id: "pick_up_name",
        header: "HANDOVER PERSON",
        accessorKey: "pick_up_name",
        meta: { Header: "HANDOVER PERSON" },
      },
      {
        id: "pick_up_condition",
        header: "CONDITION REPORT",
        accessorKey: "pick_up_condition",
        meta: { Header: "CONDITION REPORT" },
      },
      {
        id: "media",
        header: "PHOTO EVIDENCE",
        accessorKey: "media",
        meta: { Header: "PHOTO EVIDENCE", isMultipleImage: true },
      },
      {
        id: "signature",
        header: "Handout Signature",
        accessorKey: "signature",
        meta: { Header: "Handout Signature", isMultipleImage: true },
      },
    ],
    [],
  );
  const issuesColumns = useMemo(
    () => [
      {
        id: "uploaded_by",
        header: "SUBMITED BY",
        accessorKey: "uploaded_by",
        meta: { Header: "SUBMITED BY" },
      },
      {
        id: "date",
        header: "DATE",
        accessorKey: "date",
        meta: { Header: "DATE" },
      },
      {
        id: "type",
        header: "TYPE",
        accessorKey: "type",
        meta: { Header: "TYPE" },
      },
      {
        id: "description",
        header: "DESCRIPTION",
        accessorKey: "name",
        meta: { Header: "DESCRIPTION" },
      },
      {
        id: "status",
        header: "STATUS",
        accessorKey: "status",
        meta: { Header: "STATUS" },
      },
      {
        id: "action",
        header: "Actions",
        accessorKey: "issue_report_status_id",
        meta: { Header: "Actions", isLinkAction: true },
      },
    ],
    [],
  );

  useEffect(() => {
    setIsLoadingDestinations(true);

    setJob(jobObject);
    let _driverIssues: any[] = [];
    let _customerIssues: any[] = [];
    let _jobDestinationsConfirmed = jobObject?.job_destinations?.filter(
      (jobDestination: any) => jobDestination?.job_destination_status_id === 3,
    );
    _jobDestinationsConfirmed = _jobDestinationsConfirmed?.map(
      (jobDestination: any) => {
        if (jobDestination.is_pickup) {
          jobDestination = { ...jobDestination, type: "Pickup" };
        } else {
          jobDestination = { ...jobDestination, type: "Delivery" };
        }

        jobDestination = {
          ...jobDestination,
          date_pick_up: formatDate(
            jobDestination?.updated_at,
            "HH:MM, DD/MM/YYYY",
          ),
        };
        if (jobDestination?.issue_reports.length > 0) {
          jobDestination.issue_reports?.map((issueReport: any) => {
            let _issue = {
              ...issueReport,
              date: formatDate(issueReport.updated_at, "HH:MM, DD/MM/YYYY"),
              type: issueReport.issue_report_type?.name,
              status: issueReport.issue_report_status?.name,
              uploaded_by: issueReport.sourceable?.full_name,
            };
            if (issueReport.sourceable?.__typename === "Driver") {
              _driverIssues.push(_issue);
            } else if (issueReport.sourceable?.__typename === "Customer") {
              _customerIssues.push(_issue);
            }
          });
        }
        return jobDestination;
      },
    );
    _jobDestinationsConfirmed = _jobDestinationsConfirmed?.map(
      (destination: any) => {
        const signatureMedia = destination?.media?.filter(
          (item: any) => item.collection_name === "signatures",
        );

        const normalMedia = destination?.media?.filter(
          (item: any) => item?.collection_name !== "signatures",
        );

        return {
          ...destination,
          signature: signatureMedia,
          media: normalMedia,
        };
      },
    );

    setJobDestinationsConfirmed(_jobDestinationsConfirmed);
    setDriverIssues(_driverIssues);
    setCustomerIssues(_customerIssues);
    setIsLoadingDestinations(false);
  }, [jobObject]);

  const [handleChangeIssueStatus, { }] = useMutation(
    UPDATE_REPORT_ISSUE_MUTATION,
    {
      onCompleted: (data: any) => {
        let _issueReport = data?.updateIssueReport;
        if (_issueReport.sourceable.__typename === "Driver") {
          setDriverIssues([]);
          let _driverIssues = driverIssues?.map((issue: any) => {
            if (issue.id === _issueReport.id) {
              issue = {
                ...issue,
                status: _issueReport.issue_report_status?.name,
                issue_report_status_id: _issueReport.issue_report_status_id,
              };
            }
            return issue;
          });
          setDriverIssues(_driverIssues);
        } else if (_issueReport.sourceable.__typename === "Customer") {
          let _customerIssues = customerIssues?.map((issue: any) => {
            if (issue.id === _issueReport.id) {
              issue = {
                ...issue,
                status: _issueReport.issue_report_status?.name,
                issue_report_status_id: _issueReport.issue_report_status_id,
              };
            }
            return issue;
          });
          setCustomerIssues(_customerIssues);
        }
        toast({
          title: "Issue updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );
  return (
    <Box className="mt-6">
      <Box>
        <Flex justify="space-between" align="center" className="mb-7">
          <h3 className="">Pickup & Delivery Confirmation</h3>
          {job?.pod_url != null && (
            <Button variant="secondary">
              <Link href={job?.pod_url} isExternal>
                Download POD
              </Link>
            </Button>
          )}
        </Flex>
        {isLoadingDestinations ? (
          <Center py={10}>
            <Spinner size="lg" thickness="4px" speed="0.65s" />
          </Center>
        ) : jobDestinationsConfirmed && jobDestinationsConfirmed.length > 0 ? (
          <PaginationMultipleImageTable
            columns={pickupColumns}
            data={jobDestinationsConfirmed}
          />
        ) : (
          <Center py={10} color="gray.500">
            No data
          </Center>
        )}
      </Box>

      <Divider className="my-12" />

      <Box>
        <Flex justify="space-between" align="center">
          <h3>Driver Issues</h3>
        </Flex>

        {true && (
          <PaginationMultipleImageTable
            columns={issuesColumns}
            data={driverIssues}
            onLinkEvent={(id, status) => {
              handleChangeIssueStatus({
                variables: {
                  input: {
                    id,
                    issue_report_status_id: status == 1 ? 2 : 1,
                  },
                },
              });
            }}
          />
        )}
      </Box>

      <Divider className="my-12" />

      <Box>
        <Flex justify="space-between" align="center">
          <h3>Customer Issues</h3>
        </Flex>

        {true && (
          <PaginationMultipleImageTable
            columns={issuesColumns}
            data={customerIssues}
            onLinkEvent={(id, status) => {
              handleChangeIssueStatus({
                variables: {
                  input: {
                    id,
                    issue_report_status_id: status == 1 ? 2 : 1,
                  },
                },
              });
            }}
          />
        )}
      </Box>
    </Box>
  );
}