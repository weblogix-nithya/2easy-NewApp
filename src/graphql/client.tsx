import { gql } from "@apollo/client";

export const GET_CLIENTS_QUERY = gql`
  query clients(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    clients(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
      organisation_id: 1
    ) {
      data {
        id
        first_name
        last_name
        full_name
        client_no
        email
        phone
        organisation_id
        client_status_id
        client_type_id
        organisation {
          name
          organisation_no
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

export const GET_CLIENT_QUERY = gql`
  query client($id: ID!) {
    client(id: $id) {
      id
      first_name
      last_name
      full_name
      client_no
      email
      phone
      organisation_id
      client_status_id
      client_type_id
      # media {
      #   id
      #   name
      #   downloadable_url
      #   collection_name
      #   file_name
      #   mime_type
      #   size
      #   uuid
      # }
    }
  }
`;

export const CREATE_CLIENT_MUTATION = gql`
  mutation createClient($input: CreateClientInput!) {
    createClient(input: $input) {
      id
      first_name
      last_name
      full_name
      client_no
      email
      phone
      organisation_id
      client_status_id
      client_type_id
    }
  }
`;

export const UPDATE_CLIENT_MUTATION = gql`
  mutation updateClient($input: UpdateClientInput!) {
    updateClient(input: $input) {
      id
      first_name
      last_name
      full_name
      client_no
      email
      phone
      organisation_id
      client_status_id
      client_type_id
    }
  }
`;

export const DELETE_CLIENT_MUTATION = gql`
  mutation deleteClient($id: ID!) {
    deleteClient(id: $id) {
      id
    }
  }
`;

export interface UpdateClientInput {
  id: Number;
  first_name: String;
  last_name: String;
  full_name: String;
  client_no: String;
  email: String;
  phone: String;
  organisation_id: Number;
  client_status_id: Number;
  client_type_id: Number;
}

export interface CreateClientInput {
  first_name: String;
  last_name: String;
  full_name: String;
  client_no: String;
  email: String;
  phone: String;
  organisation_id: Number;
  client_status_id: Number;
  client_type_id: Number;
}

type Client = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultClient: Client = {
  id: null,
  first_name: "",
  last_name: "",
  full_name: "",
  client_no: "",
  email: "",
  phone: "",
  organisation_id: 1,
  client_status_id: null,
  client_type_id: null,
};
