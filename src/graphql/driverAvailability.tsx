import { gql } from "@apollo/client";

export const GET_DRIVER_AVAILABILITYS_QUERY = gql`
  query driverAvailabilitys(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $driver_id: Int
    $today: DateTime
  ) {
    driverAvailabilitys(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
      driver_id: $driver_id
      today: $today
    ) {
      data {
        id
        driver_id
        from_at
        to_at
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

export const GET_DRIVER_AVAILABILITY_QUERY = gql`
  query driverAvailability($id: ID!) {
    driverAvailability(id: $id) {
      id
      name
    }
  }
`;

export const CREATE_DRIVER_AVAILABILITY_MUTATION = gql`
  mutation createDriverAvailability($input: CreateDriverAvailabilityInput!) {
    createDriverAvailability(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_DRIVER_AVAILABILITY_MUTATION = gql`
  mutation updateDriverAvailability($input: UpdateDriverAvailabilityInput!) {
    updateDriverAvailability(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_CLIENT_THEYP_MUTATION = gql`
  mutation deleteDriverAvailability($id: ID!) {
    deleteDriverAvailability(id: $id) {
      id
    }
  }
`;

export interface UpdateDriverAvailabilityInput {
  id: Number;
  name: String;
}

export interface CreateDriverAvailabilityInput {
  name: String;
}

type DriverAvailability = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultDriverAvailability: DriverAvailability = {
  id: null,
  name: "",
};
