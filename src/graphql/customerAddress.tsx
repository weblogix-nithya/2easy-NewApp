import { gql } from "@apollo/client";

export const GET_CUSTOMER_ADDRESSES_QUERY = gql`
  query customerAddresses(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $customer_id: ID
  ) {
    customerAddresses(
      query: $query
      page: $page
      first: $first
      customer_id: $customer_id
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        pick_up_name
        pick_up_notes
        customer_id
        address
        address_business_name
        address_line_1
        address_line_2
        address_postal_code
        address_city
        address_state
        address_country
        lng
        lat
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

export const GET_CUSTOMER_ADDRESS_QUERY = gql`
  query customerAddress($id: ID!) {
    customerAddress(id: $id) {
      id
      name
      pick_up_name
      pick_up_notes
      customer_id
      address
      address_business_name
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      lng
      lat
    }
  }
`;

export const CREATE_CUSTOMER_ADDRESS_MUTATION = gql`
  mutation createCustomerAddress($input: CreateCustomerAddressInput!) {
    createCustomerAddress(input: $input) {
      id
      name
      pick_up_name
      pick_up_notes
      customer_id
      address
      address_business_name
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      lng
      lat
    }
  }
`;

export const UPDATE_CUSTOMER_ADDRESS_MUTATION = gql`
  mutation updateCustomerAddress($input: UpdateCustomerAddressInput!) {
    updateCustomerAddress(input: $input) {
      id
      name
      pick_up_name
      pick_up_notes
      customer_id
      address
      address_business_name
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      lng
      lat
    }
  }
`;

export const DELETE_CUSTOMER_ADDRESS_MUTATION = gql`
  mutation deleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) {
      id
    }
  }
`;

export interface UpdateCustomerAddressInput {
  id: Number;
  name: String;
  pick_up_name: String;
  pick_up_notes: String;
  address: String;
  address_business_name: String;
  address_line_1: String;
  address_line_2: String;
  address_postal_code: String;
  address_city: String;
  address_state: String;
  address_country: String;
  lng: Number;
  lat: Number;
}

export interface CreateCustomerAddressInput {
  name: String;
  customer_id: Number;
  pick_up_name: String;
  pick_up_notes: String;
  address: String;
  address_business_name: String;
  address_line_1: String;
  address_line_2: String;
  address_postal_code: String;
  address_city: String;
  address_state: String;
  address_country: String;
  lng: Number;
  lat: Number;
}

type CustomerAddress = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultCustomerAddress: CustomerAddress = {
  id: null,
  name: "",
  customer_id: null,
  pick_up_name: "",
  pick_up_notes: "",
  address: "",
  address_business_name: "",
  address_line_1: "",
  address_line_2: "",
  address_postal_code: "",
  address_city: "",
  address_state: "",
  address_country: "",
  lng: 0,
  lat: 0,
};
