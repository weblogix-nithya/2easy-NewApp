import { gql } from "@apollo/client";

export const GET_INVOICE_STATUSES_QUERY = gql`
  query invoiceStatuses(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    invoiceStatuses(
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

export const GET_INVOICE_STATUS_QUERY = gql`
  query invoiceStatus($id: ID!) {
    invoiceStatus(id: $id) {
      id
      name
    }
  }
`;

export const CREATE_INVOICE_STATUS_MUTATION = gql`
  mutation createInvoiceStatus($input: CreateInvoiceStatusInput!) {
    createInvoiceStatus(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_INVOICE_STATUS_MUTATION = gql`
  mutation updateInvoiceStatus($input: UpdateInvoiceStatusInput!) {
    updateInvoiceStatus(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_INVOICE_STATUS_MUTATION = gql`
  mutation deleteInvoiceStatus($id: ID!) {
    deleteInvoiceStatus(id: $id) {
      id
    }
  }
`;

export interface UpdateInvoiceStatusInput {
  id: Number;
  name: String;
}

export interface CreateInvoiceStatusInput {
  name: String;
}

type InvoiceStatus = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultInvoiceStatus: InvoiceStatus = {
  id: null,
  name: "",
};
