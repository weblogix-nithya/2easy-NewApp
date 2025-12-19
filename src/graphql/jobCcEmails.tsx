import { gql } from "@apollo/client";

export const GET_JOB_CC_EMAILS_QUERY = gql`
  query jobCcEmails(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    jobCcEmails(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        job_id
        email
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

export const GET_JOB_CC_EMAIL_QUERY = gql`
  query jobCcEmail($id: ID!) {
    jobCcEmail(id: $id) {
      id
      job_id
      email
    }
  }
`;

export const CREATE_JOB_CC_EMAIL_MUTATION = gql`
  mutation createJobCcEmail($input: CreateJobCcEmailInput!) {
    createJobCcEmail(input: $input) {
      id
      job_id
      email
    }
  }
`;

export const UPDATE_JOB_CC_EMAIL_MUTATION = gql`
  mutation updateJobCcEmail($input: UpdateJobCcEmailInput!) {
    updateJobCcEmail(input: $input) {
      id
      job_id
      email
    }
  }
`;

export const DELETE_JOB_CC_EMAIL_MUTATION = gql`
  mutation deleteJobCcEmail($id: ID!) {
    deleteJobCcEmail(id: $id) {
      id
    }
  }
`;

export const GET_JOB_EMAIL_TEMPLATE_QUERY = gql`
  query GetJobEmailTemplate(
    $id: ID!
    $reason: String!
    $extra_details: String
  ) {
    getJobEmailTemplate(
      id: $id
      reason: $reason
      extra_details: $extra_details
    ) {
      subject
      body
    }
  }
`;

export const SEND_JOB_EMAIL = gql`
  mutation SendJobEmail(
    $id: ID!
    $reason: String!
    $extra_details: String
    $subject: String
    $body: String
  ) {
    sendJobEmail(
      id: $id
      reason: $reason
      extra_details: $extra_details
      subject: $subject
      body: $body
    ) {
      success
      message
    }
  }
`;

export const SEND_GROUP_EMAIL = gql`
  mutation SendGroupEmail($subject: String!, $body: String!) {
    sendGroupEmail(subject: $subject, body: $body) {
      success
      message
    }
  }
`;
export interface JobEmailTemplate {
  subject: string;
  body: string;
}

export interface SendJobEmailResponse {
  success: boolean;
  message: string;
}

export interface UpdateJobCcEmailInput {
  id: Number;
  job_id: Number;
  email: String;
}

export interface CreateJobCcEmailInput {
  job_id: Number;
  email: String;
}

type JobCcEmail = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultJobCcEmail: JobCcEmail = {
  id: null,
  job_id: null,
  email: "",
};
