import { gql } from "@apollo/client";

export const GET_JOB_META_LIST_QUERY = gql`
  query jobMetaList {
    jobMetaList {
      id
      type
      name
      color
      created_at
      updated_at
    }
  }
`;

export type JobMeta = {
  id: number;
  type: string;
  name: string;
  color?: string;
};

export const CREATE_JOB_META_MUTATION = gql`
  mutation createJobMeta($input: CreateJobMetaInput!) {
    createJobMeta(input: $input) {
      id
      type
      name
      color
    }
  }
`;

export const UPDATE_JOB_META_MUTATION = gql`
  mutation updateJobMeta($input: UpdateJobMetaInput!) {
    updateJobMeta(input: $input) {
      id
      type
      name
      color
    }
  }
`;

export const DELETE_JOB_META_MUTATION = gql`
  mutation deleteJobMeta($id: ID!) {
    deleteJobMeta(id: $id) {
      id
    }
  }
`;

export const ASSIGN_META_TO_JOB_MUTATION = gql`
  mutation AssignMetaToJob($input: AssignMetaToJobInput!) {
    assignMetaToJob(input: $input) {
      id
      job_id
      job_meta_id
    }
  }
`;


export interface JobMetaListData {
  jobMetaList: JobMeta[];
}

