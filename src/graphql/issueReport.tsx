import { gql } from "@apollo/client";

export const GET_REPORT_ISSUES_QUERY = gql`
  query issueReports(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    issueReports(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        name
        notes
        job_id
        job_destination_id
        vehicle_hire_id
        issue_report_type_id
        issue_report_status_id
        sourceable_type
        sourceable_id
      }
      paginatorInfo {
        count
        currentPage
        firstItem
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_REPORT_ISSUE_QUERY = gql`
  query issueReport($id: ID!) {
    issueReport(id: $id) {
      name
      notes
      job_id
      job_destination_id
      vehicle_hire_id
      issue_report_type_id
      issue_report_status_id
      sourceable_type
      sourceable_id
      sourceable {
        __typename
        ... on Driver {
          id
          full_name
        }
        ... on Customer {
          id
          full_name
        }
      }
    }
  }
`;

export const CREATE_REPORT_ISSUE_MUTATION = gql`
  mutation createIssueReport($input: CreateIssueReportInput!) {
    createIssueReport(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_REPORT_ISSUE_MUTATION = gql`
  mutation updateIssueReport($input: UpdateIssueReportInput!) {
    updateIssueReport(input: $input) {
      id
      name
      notes
      job_id
      job_destination_id
      vehicle_hire_id
      issue_report_type_id
      issue_report_status_id
      sourceable_type
      sourceable_id
      issue_report_status {
        name
      }
      sourceable {
        __typename
        ... on Driver {
          id
          full_name
        }
        ... on Customer {
          id
          full_name
        }
      }
    }
  }
`;

export const DELETE_REPORT_ISSUE_MUTATION = gql`
  mutation deleteIssueReport($id: ID!) {
    deleteIssueReport(id: $id) {
      id
    }
  }
`;

export interface UpdateIssueReportInput {
  id: Number;
  name: String;
  issue_report_status_id: Number;
}

export interface CreateIssueReportInput {
  name: String;
}

type IssueReport = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultIssueReport: IssueReport = {
  id: null,
  name: "",
};
