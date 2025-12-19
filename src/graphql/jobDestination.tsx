import { gql } from "@apollo/client";

export const GET_JOB_DESTINATIONS_QUERY = gql`
  query jobDestinations(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    jobDestinations(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        label
        notes
        pick_up_name
        pick_up_notes
        pick_up_condition
        job_id
        sort_id
        is_saved_address
        is_pickup
        is_unattended
        estimated_at
        address
        lng
        lat
        address_business_name
        address_line_1
        address_line_2
        address_postal_code
        address_city
        address_state
        address_country
        place_id
        job_items {
          id
          name
        }
        route_point {
          id
          name
          label
          address
          color
          lng
          lat
        }
        issue_reports {
          id
          name
          notes
        }
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

export const GET_JOB_DESTINATION_QUERY = gql`
  query jobDestination($id: ID!) {
    jobDestination(id: $id) {
      id
      name
      label
      notes
      pick_up_name
      pick_up_notes
      pick_up_condition
      job_id
      sort_id
      is_saved_address
      is_pickup
      is_unattended
      estimated_at
      address
      lng
      lat
      address_business_name
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      place_id
      job_items {
        id
        name
      }
      route_point {
        id
        name
        label
        address
        color
        lng
        lat
      }
      issue_reports {
        id
        name
        notes
      }
    }
  }
`;

export const CREATE_JOB_DESTINATION_MUTATION = gql`
  mutation createJobDestination($input: CreateJobDestinationInput!) {
    createJobDestination(input: $input) {
      name
      notes
      pick_up_name
      pick_up_notes
      pick_up_condition
      job_id
      job_destination_status_id
      sort_id
      is_saved_address
      is_pickup
      is_unattended
      estimated_at
      address
      lng
      lat
      address_business_name
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      place_id
    }
  }
`;

export const UPDATE_JOB_DESTINATION_MUTATION = gql`
  mutation updateJobDestination($input: UpdateJobDestinationInput!) {
    updateJobDestination(input: $input) {
      id
      name
      notes
      pick_up_name
      pick_up_notes
      pick_up_condition
      job_id
      job_destination_status_id
      sort_id
      is_saved_address
      is_pickup
      is_unattended
      estimated_at
      address
      lng
      lat
      address_business_name
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      place_id
    }
  }
`;

export const DELETE_JOB_DESTINATION_MUTATION = gql`
  mutation deleteJobDestination($id: ID!) {
    deleteJobDestination(id: $id) {
      id
    }
  }
`;

export interface UpdateJobDestinationInput {
  id: number;
  name: string;
  notes: string;
  pick_up_name: string;
  pick_up_notes: string;
  pick_up_condition: string;
  job_id: number;
  job_destination_status_id: number;
  sort_id: number;
  is_saved_address: boolean;
  is_pickup: boolean;
  is_unattended: boolean;
  estimated_at: string;
  address: string;
  lng: number;
  lat: number;
  address_business_name: string;
  address_line_1: string;
  address_line_2: string;
  address_postal_code: string;
  address_city: string;
  address_state: string;
  address_country: string;
  place_id: string;
}

export interface CreateJobDestinationInput {
  name: string;
  notes: string;
  pick_up_name: string;
  pick_up_notes: string;
  pick_up_condition: string;
  job_id: number;
  job_destination_status_id: number;
  sort_id: number;
  is_saved_address: boolean;
  is_pickup: boolean;
  is_unattended: boolean;
  estimated_at: string;
  address: string;
  lng: number;
  lat: number;
  address_business_name: string;
  address_line_1: string;
  address_line_2: string;
  address_postal_code: string;
  address_city: string;
  address_state: string;
  address_country: string;
  place_id: string;
}

export type JobDestination = {
  id: number | null;
  name: string;
  notes: string;
  pick_up_name: string;
  pick_up_notes: string;
  pick_up_condition: string;
  job_id: number;
  job_destination_status_id: number;
  //sort_id: number;
  is_saved_address: boolean;
  is_pickup: boolean;
  is_unattended: boolean;
  //estimated_at: string;
  address: string;
  lng: number;
  lat: number;
  address_business_name: string;
  address_line_1: string;
  address_line_2: string;
  address_postal_code: string;
  address_city: string;
  address_state: string;
  address_country: string;
  place_id: string;
  [key: string]: string | number | null | boolean | undefined | Date;
};

export const defaultJobDestination: JobDestination = {
  id: null,
  name: "",
  notes: "",
  pick_up_name: "",
  pick_up_notes: "",
  pick_up_condition: "",
  job_id: 0,
  job_destination_status_id: null,
  sort_id: null,
  is_saved_address: false,
  is_pickup: false,
  is_unattended: false,
  //estimated_at: "",
  address: "",
  lng: 0,
  lat: 0,
  address_business_name: "",
  address_line_1: "",
  address_line_2: "",
  address_postal_code: "",
  address_city: "",
  address_state: "",
  address_country: "",
  place_id: "",
};
