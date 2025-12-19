import { gql } from "@apollo/client";

import { QuoteLineItem } from "./quoteLineItem";

export const GET_QUOTES_QUERY = gql`
  query quotes(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $quote_category_id: ID
    $quote_status_id: ID
    $customer_id: ID
  ) {
    quotes(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
      quote_category_id: $quote_category_id
      quote_status_id: $quote_status_id
      customer_id: $customer_id
    ) {
      data {
        id
        name
        company {
          name
        }        
        quote_url
        customer_name
        customer_reference
        date_required
        submitted_at
        created_at
        quote_type {
          name
        }
        quote_service {
          name
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

export const GET_QUOTE_QUERY = gql`
  query quote($id: ID!) {
    quote(id: $id) {
      id
      name
      customer_id
      customer {
        rate_card_url
      }
      quote_url
      company_id
      company {
        name
      }
      customer_name
      customer_reference
      admin_notes
      customer_notes
      date_required
      ready_at
      quote_status_id
      quote_status {
        id
        name
      }
      quote_category_id
      quote_service_id
      quote_type_id
      quote_items {
        id
        quote_id
        quantity
        weight
        dimension_height
        dimension_width
        dimension_depth
        volume
        item_type_id
        item_type {
          name
        }
      }
      quote_line_items {
        id
        name
        quote_id
        is_rate
        is_surcharge
        tax_type
        quantity
        unit_amount
        tax_amount
        line_amount
      }
      quote_destinations {
        id
        name
        label
        address
        address_business_name
        address_line_1
        address_line_2
        address_postal_code
        address_state
        address_country
        address_city
        is_pickup
        notes
        pick_up_name
        pick_up_notes
        quote_id
        lat
        lng
        quote_destination_status_id
      }
      pick_up_destination {
        id
        name
        label
        address
        address_business_name
        address_line_1
        address_line_2
        address_postal_code
        address_state
        address_country
        address_city
        is_pickup
        quote_destination_status_id
        pick_up_name
        pick_up_notes
        pick_up_condition
        is_saved_address
        quote_id
        lat
        lng
        notes
        updated_at
      }
      media {
        id
        name
        downloadable_url
        collection_name
        file_name
        uploaded_by
        created_at
      }
      is_tailgate_required
      is_stackable_freight
      is_hand_unloading
      is_dangerous_goods
      is_timeslot_required
      is_approved
      is_quote_send
      job {
        id
        name
      }
      sub_total
      total_tax
      total
      quoted_price
    }
  }
`;

export const DELETE_QUOTE_MUTATION = gql`
  mutation deleteQuote($id: ID!) {
    deleteQuote(id: $id) {
      id
    }
  }
`;

export const CREATE_QUOTE_MUTATION = gql`
  mutation createQuote($input: CreateQuoteInput!) {
    createQuote(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_QUOTE_MUTATION = gql`
  mutation updateQuote($input: UpdateQuoteInput!) {
    updateQuote(input: $input) {
      id
      name
      customer_id
      sub_total
      total_tax
      total
      quote_url
    }
  }
`;

export const PROCESS_QUOTE_AND_BOOK_MUTATION = gql`
  mutation processBookQuote($id: ID!) {
    processBookQuote(id: $id) {
      id
      name
      job {
        id
      }
    }
  }
`;
export const APPROVE_QUOTE_MUTATION = gql`
  mutation approveQuote($id: ID!) {
    approveQuote(id: $id) {
      id
      name
    }
  }
`;

export const PROCESS_QUOTE_MUTATION = gql`
  mutation processQuote($id: ID!) {
    processQuote(id: $id) {
      id
      name
    }
  }
`;

export const SEND_QUOTE_MUTATION = gql`
  mutation sendQuote($id: ID!) {
    sendQuote(id: $id) {
      id
      name
    }
  }
`;

export const GENERATE_QUOTE_PDF_MUTATION = gql`
  mutation generateQuotePdf($id: ID!) {
    generateQuotePdf(id: $id) {
      id
    }
  }
`;
export interface CreateQuoteInput {
  name: String;
}

export interface UpdateQuoteInput {
  id: Number;
  name: String;
  customer_id: Number;
  sub_total: number;
  total_tax: number;
  total: number;
  quote_url: string;
}

type Quote = {
  id: number | null;
  name?: string;
  customer_name?: string;
  customer_id: number | null;
  company_id: number | null;
  customer_reference?: string;
  admin_notes?: string;
  customer_notes?: string;
  date_required?: string;
  ready_at?: string;
  quote_status_id: number | null;
  quote_category_id: number | null;
  quote_service_id: number | null;
  quote_type_id: number | null;
  media: any[] | null;
  is_tailgate_required: boolean;
  is_stackable_freight: boolean;
  is_hand_unloading: boolean;
  is_dangerous_goods: boolean;
  is_timeslot_required: boolean;
  sub_total: number;
  total_tax: number;
  total: number;
  is_approved: boolean;
  is_quote_send: boolean;
  quote_status: any;
  job: any;
  quote_line_items: QuoteLineItem;
  quoted_price?: string;
  quote_url?: string;
  [key: string]: string | number | boolean | undefined | QuoteLineItem | any;
};

export const defaultQuote: Quote = {
  id: null,
  name: "",
  customer_name: "",
  customer_id: null,
  company_id: null,
  customer_reference: "",
  admin_notes: "",
  customer_notes: "",
  quote_status_id: 1,
  quote_category_id: null,
  quote_service_id: null,
  quote_type_id: null,
  media: [],
  is_tailgate_required: false,
  is_stackable_freight: false,
  is_hand_unloading: false,
  is_dangerous_goods: false,
  is_timeslot_required: false,
  sub_total: null,
  total_tax: null,
  total: null,
  ready_at: "",
  date_required: "",
  is_approved: false,
  is_quote_send: undefined,
  quote_status: undefined,
  job: undefined,
  quote_line_items: undefined,
  quoted_price: null,
};
