import { gql } from "@apollo/client";

export const GET_INVOICE_LINE_ITEMS_QUERY = gql`
  query invoiceLineItems(
    $query: String
    $page: Int!
    $first: Int!
    $invoice_id: ID
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    invoiceLineItems(
      query: $query
      page: $page
      first: $first
      invoice_id: $invoice_id
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        invoice_id
        is_rate
        is_surcharge
        tax_type
        quantity
        unit_amount
        tax_amount
        line_amount
        xero_line_item_id
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

export const GET_INVOICE_LINE_ITEM_QUERY = gql`
  query invoiceLineItem($id: ID!) {
    invoiceLineItem(id: $id) {
      id
      name
      invoice_id
      is_rate
      is_surcharge
      tax_type
      quantity
      unit_amount
      tax_amount
      line_amount
      xero_line_item_id
    }
  }
`;

export const CREATE_INVOICE_LINE_ITEM_MUTATION = gql`
  mutation createInvoiceLineItem($input: CreateInvoiceLineItemInput!) {
    createInvoiceLineItem(input: $input) {
      name
    }
  }
`;

export const UPDATE_INVOICE_LINE_ITEM_MUTATION = gql`
  mutation updateInvoiceLineItem($input: UpdateInvoiceLineItemInput!) {
    updateInvoiceLineItem(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_INVOICE_LINE_ITEM_MUTATION = gql`
  mutation deleteInvoiceLineItem($id: ID!) {
    deleteInvoiceLineItem(id: $id) {
      id
    }
  }
`;

export interface UpdateInvoiceLineItemInput {
  id: Number;
  name: String;
  invoice_id: Number;
  is_rate: Boolean;
  is_surcharge: Boolean;
  tax_type: String;
  quantity: Number;
  unit_amount: Number;
  tax_amount: Number;
  line_amount: Number;
  xero_line_item_id: Number;
}

export interface CreateInvoiceLineItemInput {
  name: String;
  invoice_id: Number;
  is_rate: Boolean;
  is_surcharge: Boolean;
  tax_type: String;
  quantity: Number;
  unit_amount: Number;
  tax_amount: Number;
  line_amount: Number;
  xero_line_item_id: Number;
}

type InvoiceLineItem = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultInvoiceLineItem: InvoiceLineItem = {
  id: null,
  name: "",
};
