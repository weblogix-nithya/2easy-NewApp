import { gql } from "@apollo/client";

export const GET_CLIENT_STATUSES_QUERY = gql`
  query clientStatuses(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    clientStatuses(
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

export const GET_CLIENT_QUERY = gql`
  query clientStatus($id: ID!) {
    clientStatus(id: $id) {
      id
      name
    }
  }
`;

export const CREATE_CLIENT_MUTATION = gql`
  mutation createClientStatus($input: CreateClientStatusInput!) {
    createClientStatus(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_CLIENT_MUTATION = gql`
  mutation updateClientStatus($input: UpdateClientStatusInput!) {
    updateClientStatus(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_CLIENT_MUTATION = gql`
  mutation deleteClientStatus($id: ID!) {
    deleteClientStatus(id: $id) {
      id
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
