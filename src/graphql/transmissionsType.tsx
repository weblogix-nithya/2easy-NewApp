import { gql } from "@apollo/client";

export const GET_TRANSMISSION_TYPES_QUERY = gql`
  query transmissionTypes(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    transmissionTypes(
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

export interface UpdateTransmissionTypesInput {
  id: Number;
  name: String;
}

export interface CreateTransmissionTypesInput {
  name: String;
}

type TransmissionTypes = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultTransmissionTypes: TransmissionTypes = {
  id: null,
  name: "",
};
