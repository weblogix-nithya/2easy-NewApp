import { gql } from "@apollo/client";

export const GET_QUOTE_DESTINATIONS_QUERY = gql`
  query quoteDestinations(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    quoteDestinations(
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
        quote_id
        sort_id
        is_saved_address
        is_pickup
        is_unattended
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

export const GET_QUOTE_DESTINATION_QUERY = gql`
  query quoteDestination($id: ID!) {
    quoteDestination(id: $id) {
      id
      name
      label
      notes
      pick_up_name
      pick_up_notes
      pick_up_condition
      quote_id
      sort_id
      is_saved_address
      is_pickup
      is_unattended
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

export const CREATE_QUOTE_DESTINATION_MUTATION = gql`
  mutation createQuoteDestination($input: CreateQuoteDestinationInput!) {
    createQuoteDestination(input: $input) {
      name
      notes
      pick_up_name
      pick_up_notes
      pick_up_condition
      quote_id
      quote_destination_status_id
      sort_id
      is_saved_address
      is_pickup
      is_unattended
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

export const UPDATE_QUOTE_DESTINATION_MUTATION = gql`
  mutation updateQuoteDestination($input: UpdateQuoteDestinationInput!) {
    updateQuoteDestination(input: $input) {
      id
      name
      notes
      pick_up_name
      pick_up_notes
      pick_up_condition
      quote_id
      quote_destination_status_id
      sort_id
      is_saved_address
      is_pickup
      is_unattended
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

export const DELETE_QUOTE_DESTINATION_MUTATION = gql`
  mutation deleteQuoteDestination($id: ID!) {
    deleteQuoteDestination(id: $id) {
      id
    }
  }
`;

export interface UpdateQuoteDestinationInput {
  id: number;
  name: string;
  notes: string;
  pick_up_name: string;
  pick_up_notes: string;
  pick_up_condition: string;
  quote_id: number;
  quote_destination_status_id: number;
  sort_id: number;
  is_saved_address: boolean;
  is_pickup: boolean;
  is_unattended: boolean;
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

export interface CreateQuoteDestinationInput {
  name: string;
  notes: string;
  pick_up_name: string;
  pick_up_notes: string;
  pick_up_condition: string;
  quote_id: number;
  quote_destination_status_id: number;
  sort_id: number;
  is_saved_address: boolean;
  is_pickup: boolean;
  is_unattended: boolean;
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

export type QuoteDestination = {
  id: number | null;
  name: string;
  notes: string;
  pick_up_name: string;
  pick_up_notes: string;
  pick_up_condition: string;
  quote_id: number;
  quote_destination_status_id: number;
  //sort_id: number;
  is_saved_address: boolean;
  is_pickup: boolean;
  is_unattended: boolean;
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

export const defaultQuoteDestination: QuoteDestination = {
  id: null,
  name: "",
  notes: "",
  pick_up_name: "",
  pick_up_notes: "",
  pick_up_condition: "",
  quote_id: 0,
  quote_destination_status_id: null,
  sort_id: null,
  is_saved_address: false,
  is_pickup: false,
  is_unattended: false,
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
