import { gql } from "@apollo/client";

export const GET_INVOICES_QUERY = gql`
  query invoices(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $is_rcti: Boolean
    $driver_id: ID
    $customer_id: ID
    $company_id: ID
    $invoice_status_id: ID
    $today: DateTime
    $between_at: InvoiceBetweenInput
    $job_category_id: ID
    $state: String
    $company_filter_id: ID
    $customer_filter_ids: [ID]
  ) {
    invoices(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
      is_rcti: $is_rcti
      driver_id: $driver_id
      customer_id: $customer_id
      company_id: $company_id
      invoice_status_id: $invoice_status_id
      today: $today
      between_at: $between_at
      job_category_id: $job_category_id
      state: $state
      company_filter_id: $company_filter_id
      customer_filter_ids: $customer_filter_ids
    ) {
      data {
        id
        name
        job_id
        job {
          name
          job_category_id
          job_category {
            name
          }
        }
        vehicle_hire_id
        vehicle_hire {
          name
        }
        driver_id
        driver {
          full_name
        }
        customer_id
        customer {
          full_name
        }
        company_id
        company {
          name
        }
        invoice_status_id
        invoice_status {
          name
        }
        is_rcti
        issued_at
        due_at
        paid_at
        line_amount_types
        currency
        sub_total
        total_tax
        total
        amount_due
        amount_paid
        xero_invoice_id
        xero_updated_at
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

export const GET_INVOICE_TOTALS_QUERY = gql`
  query invoices(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $is_rcti: Boolean
    $driver_id: ID
    $customer_id: ID
    $company_id: ID
    $invoice_status_id: ID
    $today: DateTime
    $between_at: InvoiceBetweenInput
    $job_category_id: ID
    $state: String
  ) {
    invoices(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
      is_rcti: $is_rcti
      driver_id: $driver_id
      customer_id: $customer_id
      company_id: $company_id
      invoice_status_id: $invoice_status_id
      today: $today
      between_at: $between_at
      job_category_id: $job_category_id
      state: $state
    ) {
      data {
        id
        name
        job {
          job_category_id
          job_category {
            name
          }
        }
        sub_total
        total_tax
        total
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

export const GET_INVOICE_QUERY = gql`
  query invoice($id: ID!) {
    invoice(id: $id) {
      id
      name
      job_id
      rcti_url
      job {
        name
        invoice_url
      }
      vehicle_hire_id
      vehicle_hire {
        name
      }
      driver_id
      driver {
        full_name
      }
      customer_id
      customer {
        full_name
      }
      company_id
      company {
        name
        lcl_rate
      }
      invoice_status_id
      invoice_status {
        name
      }
      is_rcti
      issued_at
      due_at
      paid_at
      line_amount_types
      currency
      sub_total
      total_tax
      total
      amount_due
      amount_paid
      xero_invoice_id
      xero_updated_at
    }
  }
`;

export const CREATE_INVOICE_MUTATION = gql`
  mutation createInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      name
    }
  }
`;

export const UPDATE_INVOICE_MUTATION = gql`
  mutation updateInvoice($input: UpdateInvoiceInput!) {
    updateInvoice(input: $input) {
      id
      name
      job_id
      vehicle_hire_id
      driver_id
      customer_id
      company_id
      invoice_status_id
      is_rcti
      issued_at
      due_at
      paid_at
      line_amount_types
      currency
      sub_total
      total_tax
      total
      amount_due
      amount_paid
      xero_invoice_id
      xero_updated_at
    }
  }
`;

export const DELETE_INVOICE_MUTATION = gql`
  mutation deleteInvoice($id: ID!) {
    deleteInvoice(id: $id) {
      id
    }
  }
`;

export const SEND_INVOICE_MUTATION = gql`
  mutation sendInvoice($id: ID!) {
    sendInvoice(id: $id) {
      id
    }
  }
`;

export const SEND_RCTI_INVOICE_MUTATION = gql`
  mutation send($id: ID!) {
    sendRcti(id: $id) {
      id
    }
  }
`;
export const GENERATE_INVOICE_PDF_MUTATION = gql`
  mutation generateInvoicePdf($id: ID!) {
    generateInvoicePdf(id: $id) {
      id
    }
  }
`;

export const GENERATE_COMPANY_STATEMENT_PDF_MUTATION = gql`
  mutation generateCompanyInvoiceStatement(
    $companyId: ID!
    $customerIds: [ID!]!
    $invoiceDateRange: [String]
  ) {
    generateCompanyInvoiceStatement(
      company_id: $companyId
      customer_ids: $customerIds
      invoice_date_range: $invoiceDateRange
    )
  }
`;

export interface UpdateInvoiceInput {
  id: Number;
  name: String;
  job_id: number;
  vehicle_hire_id: number;
  driver_id: number;
  customer_id: number;
  company_id: number;
  invoice_status_id: number;
  is_rcti: Boolean;
  issued_at: Date;
  due_at: Date;
  paid_at: Date;
  line_amount_types: String;
  currency: String;
  sub_total: number;
  total_tax: number;
  total: number;
  amount_due: number;
  amount_paid: number;
  xero_invoice_id: String;
}

export interface CreateInvoiceInput {
  name: String;
}

type Invoice = {
  id: number | null;
  name: string;
  vehicle_hire_id: number;
  rcti_url: string;
  driver_id: number;
  customer_id: number;
  company_id: number;
  invoice_status_id: number | string;
  is_rcti: Boolean;
  issued_at: Date;
  due_at: Date;
  paid_at: Date;
  line_amount_types: string;
  currency: string;
  sub_total: number;
  total_tax: number;
  total: number;
  amount_due: number;
  amount_paid: number;
  xero_invoice_id: string;
  customer: any;
  company: any;
  driver: any;
  job: any;
  job_id: number;
  vehicle_hire: any;
  invoice_status: any;
  payment_terms: string;
};

export const defaultInvoice: Invoice = {
  id: null,
  name: "",
  vehicle_hire_id: null,
  rcti_url: null,
  driver_id: null,
  customer_id: null,
  company_id: null,
  invoice_status_id: null,
  is_rcti: null,
  issued_at: null,
  due_at: null,
  paid_at: null,
  line_amount_types: null,
  currency: "AUD",
  sub_total: null,
  total_tax: null,
  total: null,
  amount_due: null,
  amount_paid: null,
  xero_invoice_id: null,
  customer: null,
  company: null,
  driver: null,
  job: null,
  job_id: null,
  vehicle_hire: null,
  invoice_status: null,
  payment_terms: "",
};
export interface InvoiceBetweenInput {
  from_at: string;
  to_at: string;
}
