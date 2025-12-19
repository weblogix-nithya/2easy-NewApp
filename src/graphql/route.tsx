import { gql } from "@apollo/client";

export const GET_ROUTES_QUERY = gql`
  query routes(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    routes(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
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

export const GET_DRIVER_CURRENT_ROUTE_QUERY = gql`
  query routes(
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $driver_id: Int!
    $today: DateTime!
  ) {
    routes(
      page: $page
      first: $first
      driver_id: $driver_id
      today: $today
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        start_at
        driver_id
        progression
        current_volume
        current_weight
        route_status {
          id
          name
        }
        driver {
          id
          full_name
          no_max_volume
          no_max_capacity
          media_url
          lat
          lng
        }
        route_points {
          id
          label
          address
          color
          lng
          lat
          name
          vehicle_hire_id
          job_destination_id
          route_point_status_id
          job {
            id
            name
            pick_up_notes
            customer_notes
          }
          vehicle_hire {
            name
            customer_notes
          }
          pointable {
            ... on VehicleHire {
              name
              hire_from_at
              hire_to_at
              vehicle_hire_status_id
            }
            ... on JobDestination {
              name
              estimated_at
              is_pickup
              address_city
              address_state
              address_postal_code
            }
          }
          job_destination {
            name
            estimated_at
            is_pickup
            address
            address_business_name
            address_line_1
            address_line_2
            address_postal_code
            address_state
            address_country
            address_city
            pick_up_notes
            notes
          }
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

export const GET_ROUTE_QUERY = gql`
  query route($id: ID!) {
    route(id: $id) {
      id
      name
      start_at
      driver_id
      progression
      current_volume
      current_weight
      route_status {
        id
        name
      }
      driver {
        id
        full_name
        no_max_volume
        no_max_capacity
        media_url
      }
      route_points {
        id
        label
        address
        color
        lng
        lat
        name
        vehicle_hire_id
        job_destination_id
        route_point_status_id
        job {
          name
          pick_up_notes
          customer_notes
        }
        vehicle_hire {
          name
          customer_notes
        }
        pointable {
          ... on VehicleHire {
            name
            hire_from_at
            hire_to_at
            vehicle_hire_status_id
          }
          ... on JobDestination {
            name
            estimated_at
          }
        }
      }
    }
  }
`;

export const CREATE_ROUTE_MUTATION = gql`
  mutation createRoute($input: CreateRouteInput!) {
    createRoute(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ROUTE_MUTATION = gql`
  mutation updateRoute($input: UpdateRouteInput!) {
    updateRoute(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_ROUTE_MUTATION = gql`
  mutation deleteRoute($id: ID!) {
    deleteRoute(id: $id) {
      id
    }
  }
`;

export interface UpdateRouteInput {
  id: Number;
  name: String;
  driver_id: Number;
}

export interface CreateRouteInput {
  name: String;
}

type Route = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultRoute: Route = {
  id: null,
  name: "",
};
