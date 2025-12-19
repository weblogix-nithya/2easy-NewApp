import { gql } from "@apollo/client";

export const GET_QUOTE_LINE_ITEMS_QUERY = gql`
  query quoteLineItems(
    $query: String
    $page: Int!
    $first: Int!
    $quote_id: ID
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    quoteLineItems(
      query: $query
      page: $page
      first: $first
      quote_id: $quote_id
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
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

export const GET_QUOTE_LINE_ITEM_QUERY = gql`
  query quoteLineItem($id: ID!) {
    quoteLineItem(id: $id) {
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
  }
`;

export const CREATE_QUOTE_LINE_ITEM_MUTATION = gql`
  mutation createQuoteLineItem($input: CreateQuoteLineItemInput!) {
    createQuoteLineItem(input: $input) {
      name
    }
  }
`;

export const UPDATE_QUOTE_LINE_ITEM_MUTATION = gql`
  mutation updateQuoteLineItem($input: UpdateQuoteLineItemInput!) {
    updateQuoteLineItem(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_QUOTE_LINE_ITEM_MUTATION = gql`
  mutation deleteQuoteLineItem($id: ID!) {
    deleteQuoteLineItem(id: $id) {
      id
    }
  }
`;

export interface UpdateQuoteLineItemInput {
  id: Number;
  name: String;
  quote_id: Number;
  is_rate: Boolean;
  is_surcharge: Boolean;
  tax_type: String;
  quantity: Number;
  unit_amount: Number;
  tax_amount: Number;
  line_amount: Number;
}

export interface CreateQuoteLineItemInput {
  name: String;
  quote_id: Number;
  is_rate: Boolean;
  is_surcharge: Boolean;
  tax_type: String;
  quantity: Number;
  unit_amount: Number;
  tax_amount: Number;
  line_amount: Number;
}

export type QuoteLineItem = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultQuoteLineItem: QuoteLineItem = {
  id: null,
  name: "",
};
