import { gql } from "@apollo/client";

export const GET_DRIVER_STATUSES_QUERY = gql`
  query driverStatuses(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    driverStatuses(
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

export interface UpdateClientStatusInput {
  id: Number;
  name: String;
}

export interface CreateClientStatusInput {
  name: String;
}

type ClientStatus = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultClientStatus: ClientStatus = {
  id: null,
  name: "",
};
