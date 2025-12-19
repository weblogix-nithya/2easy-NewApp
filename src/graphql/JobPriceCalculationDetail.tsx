import { gql } from "@apollo/client";

// JobPriceCalculationDetail Queries and Mutations

export const GET_JOB_PRICE_CALCULATION_DETAIL_QUERY = gql`
  query JobPriceCalculationDetail($job_id: ID!) {
    jobPriceCalculationDetail(job_id: $job_id) {
      id
      job_id
      customer_id
      cbm_auto
      total_weight
      freight
      fuel
      time_slot
      tail_lift
      hand_unload
      dangerous_goods
      stackable
      total
    }
  }
`;

export const GET_JOB_PRICE_CALCULATION_DETAILS_QUERY = gql`
  query JobPriceCalculationDetails(
    $query: String
    $page: Int
    $first: Int
    $orderBy: OrderByClause
  ) {
    jobPriceCalculationDetails(
      query: $query
      page: $page
      first: $first
      orderBy: $orderBy
    ) {
      data {
        id
        job_id
        customer_id
        cbm_auto
        total_weight
        freight
        fuel
        hand_unload
        dangerous_goods
        time_slot
        tail_lift
        stackable
        total
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

export const CREATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION = gql`
  mutation CreateJobPriceCalculationDetail($input: CreateJobPriceCalculationDetailInput!) {
    createJobPriceCalculationDetail(input: $input) {
      id
      job_id
      customer_id
      cbm_auto
      total_weight
      freight
      fuel
      hand_unload
      dangerous_goods
      time_slot
      tail_lift
      stackable
      total
    }
  }
`;

export const UPDATE_JOB_PRICE_CALCULATION_DETAIL_MUTATION = gql`
  mutation updateJobPriceCalculationDetailByJobId(
    $job_id: ID!,
    $input: UpdateJobPriceCalculationDetailInput!
  ) {
    updateJobPriceCalculationDetailByJobId(job_id: $job_id, input: $input) {
      id
      job_id
      customer_id
      cbm_auto
      total_weight
      freight
      fuel
      hand_unload
      dangerous_goods
      time_slot
      tail_lift
      stackable
      total
    }
  }
`;


export const DELETE_JOB_PRICE_CALCULATION_DETAIL_MUTATION = gql`
  mutation DeleteJobPriceCalculationDetail($id: ID!) {
    deleteJobPriceCalculationDetail(id: $id) {
      id
    }
  }
`;

// JobPriceCalculationDetail TypeScript Types and Interfaces

export interface JobPriceCalculationDetail {
  id: string | null;
  job_id: number | null; // Changed from string to number
  customer_id: number | null;
  cbm_auto: number | null;
  total_weight: number | null;
  freight: number | null;
  fuel: number | null;
  hand_unload: number | null;
  dangerous_goods: number | null;
  stackable: number | null;
  total: number | null;
  tail_lift: number | null,
  time_slot: number | null,
  total_cbm: number | null,
}


export interface CreateJobPriceCalculationDetailInput {
  job_id: number | null;
  customer_id: number;
  cbm_auto: number;
  total_weight: number;
  freight: number;
  fuel: number;
  hand_unload: number;
  dangerous_goods: number;
  tail_lift: number,
  time_slot: number,
  stackable: number;
  total: number;
}

export interface UpdateJobPriceCalculationDetailInput {
  job_id?: number | null;
  customer_id?: number;
  cbm_auto?: number;
  total_weight?: number;
  freight?: number;
  fuel?: number;
  hand_unload?: number;
  dangerous_goods?: number;
  tail_lift?: number,
  time_slot?: number,
  stackable?: number;
  total?: number;
}

// Default JobPriceCalculationDetail
export const defaultJobPriceCalculationDetail: JobPriceCalculationDetail = {
  id: null,
  job_id: null,
  customer_id: null,
  cbm_auto: null,
  total_weight: null,
  freight: null,
  fuel: null,
  hand_unload: null,
  tail_lift: null,
  time_slot: null,
  dangerous_goods: null,
  stackable: null,
  total: null,
  total_cbm: null,
};
