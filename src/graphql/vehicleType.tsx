import { gql } from "@apollo/client";

export const GET_VEHICLE_TYPES_QUERY = gql`
  query vehicleTypes(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    vehicleTypes(
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

export const GET_VEHICLE_TYPE_QUERY = gql`
  query vehicleType($id: ID!) {
    vehicleType(id: $id) {
      id
      name
    }
  }
`;

export const CREATE_VEHICLE_TYPE_MUTATION = gql`
  mutation createVehicleType($input: CreateVehicleTypeInput!) {
    createVehicleType(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_VEHICLE_TYPE_MUTATION = gql`
  mutation updateVehicleType($input: UpdateVehicleTypeInput!) {
    updateVehicleType(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_VEHICLE_TYPE_MUTATION = gql`
  mutation deleteVehicleType($id: ID!) {
    deleteVehicleType(id: $id) {
      id
    }
  }
`;

export interface UpdateVehicleTypeInput {
  id: Number;
  name: String;
}

export interface CreateVehicleTypeInput {
  name: String;
}

type VehicleType = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultVehicleType: VehicleType = {
  id: null,
  name: "",
};
