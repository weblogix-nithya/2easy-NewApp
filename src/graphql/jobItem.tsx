import { gql } from "@apollo/client";

export const GET_JOB_ITEMS_QUERY = gql`
  query jobItems(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    jobItems(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        notes
        job_id
        job_destination_id
        job_destination {
          id
          name
          label
          address
          address_city
          address_postal_code
          is_pickup
          estimated_at
          job_id
          lat
          lng
        }
        quantity
        volume
        weight
        dimension_height
        dimension_width
        dimension_depth
        item_type_id
        item_type {
          id
          name
        }
      }
    }
  }
`;

export const GET_JOB_ITEM_QUERY = gql`
  query jobItem($id: ID!) {
    jobItem(id: $id) {
      id
      name
      notes
      job_id
      job_destination_id
      job_destination {
        id
        name
        label
        address
        address_city
        address_postal_code
        is_pickup
        estimated_at
        job_id
        lat
        lng
      }
      quantity
      volume
      weight
      dimension_height
      dimension_width
      dimension_depth
      item_type_id
      item_type {
        id
        name
      }
    }
  }
`;

export const CREATE_JOB_ITEM_MUTATION = gql`
  mutation createJobItem($input: CreateJobItemInput!) {
    createJobItem(input: $input) {
      name
      notes
      job_id
      job_destination_id
      quantity
      volume
      weight
      dimension_height
      dimension_width
      dimension_depth
      item_type_id
    }
  }
`;

export const UPDATE_JOB_ITEM_MUTATION = gql`
  mutation updateJobItem($input: UpdateJobItemInput!) {
    updateJobItem(input: $input) {
      id
      name
      notes
      job_id
      job_destination_id
      quantity
      volume
      weight
      dimension_height
      dimension_width
      dimension_depth
      item_type_id
    }
  }
`;

export const DELETE_JOB_ITEM_MUTATION = gql`
  mutation deleteJobItem($id: ID!) {
    deleteJobItem(id: $id) {
      id
    }
  }
`;

export interface UpdateJobItemInput {
  id: number;
  name: string;
  notes: string;
  job_id: number;
  job_destination_id: number;
  quantity: number;
  volume: number;
  weight: number;
  dimension_height: number;
  dimension_width: number;
  dimension_depth: number;
  item_type_id: number;
}

export interface CreateJobItemInput {
  name: string;
  notes: string;
  job_id: number;
  job_destination_id: number;
  quantity: number;
  volume: number;
  weight: number;
  dimension_height: number;
  dimension_width: number;
  dimension_depth: number;
  item_type_id: number;
}

export type JobItem = {
  id: number | null;
  name: string;
  notes: string;
  job_id: number;
  //job_destination_id: number;
  quantity: number;
  volume: number;
  volume_cm: number;
  weight: number;
  dimension_height: number;
  dimension_height_cm: number;
  dimension_width: number;
  dimension_width_cm: number;
  dimension_depth: number;
  dimension_depth_cm: number;
  item_type_id: number;
  is_new: boolean;
  item_type: any;
};

export const defaultJobItem: JobItem = {
  id: null,
  name: "",
  notes: "",
  job_id: 0,
  //job_destination_id: 0,
  quantity: 0,
  volume: 0,
  volume_cm: null,
  weight: 0,
  dimension_height: 0,
  dimension_width: 0,
  dimension_depth: 0,
  item_type_id: 1,
  dimension_height_cm: 0.0,
  dimension_width_cm: 0.0,
  dimension_depth_cm: 0.0,
  is_new: null,
  item_type: null,
};
