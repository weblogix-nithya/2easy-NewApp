import { gql } from "@apollo/client";

export const GET_VEHICLE_HIRE_STATUSES_QUERY = gql`
  query vehicleHireStatuses(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    vehicleHireStatuses(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        color
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

export const GET_VEHICLE_HIRE_STATUS_QUERY = gql`
  query vehicleHireStatus($id: ID!) {
    vehicleHireStatus(id: $id) {
      id
      name
      color
    }
  }
`;

export const CREATE_VEHICLE_HIRE_STATUS_MUTATION = gql`
  mutation createVehicleHireStatus($input: CreateVehicleHireStatusInput!) {
    createVehicleHireStatus(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_VEHICLE_HIRE_STATUS_MUTATION = gql`
  mutation updateVehicleHireStatus($input: UpdateVehicleHireStatusInput!) {
    updateVehicleHireStatus(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_VEHICLE_HIRE_STATUS_MUTATION = gql`
  mutation deleteVehicleHireStatus($id: ID!) {
    deleteVehicleHireStatus(id: $id) {
      id
    }
  }
`;

export interface UpdateVehicleHireStatusInput {
  id: Number;
  name: String;
}

export interface CreateVehicleHireStatusInput {
  name: String;
}

type VehicleHireStatus = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultVehicleHireStatus: VehicleHireStatus = {
  id: null,
  name: "",
};
