import { gql } from "@apollo/client";

// $is_approved: Int
// is_approved: $is_approved
export const GET_CUSTOMERS_QUERY = gql`
  query customers(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $company_id: ID
    $is_approved: Boolean
  ) {
    customers(
      query: $query
      page: $page
      first: $first
      company_id: $company_id
      is_approved: $is_approved
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        first_name
        last_name
        full_name
        admin_notes
        base_notes
        company_id
        abn
        phone_no
        email
        is_approved
        company_name
        is_company_admin
        is_pod_sendable
        is_invoice_sendable
        rate_card_url
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

// Role-based customer list — backend field: customersByRole
// Note: uses standard Lighthouse @orderBy directive shape ([OrderByClause!]),
// NOT the flat orderByColumn/orderByOrder pattern used in GET_CUSTOMERS_QUERY.
export const GET_CUSTOMERS_BY_ROLE_QUERY = gql`
  query customersByRole(
    $role: String!
    $query: String
    $page: Int!
    $first: Int!
    $orderBy: [OrderByClause!]
    $company_id: ID
    $is_approved: Boolean
  ) {
    customersByRole(
      role: $role
      query: $query
      page: $page
      first: $first
      orderBy: $orderBy
      company_id: $company_id
      is_approved: $is_approved
    ) {
      data {
        id
        first_name
        last_name
        full_name
        company_id
        company_name
        email
        is_approved
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

export const GET_ALL_CUSTOMERS_QUERY = gql`
  query AllCustomers(
    $role: String
    $orderBy: [OrderByClause!]
    $query: String
    $company_id: ID
    $is_approved: Boolean
  ) {
    allCustomers(
      role: $role
      orderBy: $orderBy
      query: $query
      company_id: $company_id
      is_approved: $is_approved
    ) {
      id
      full_name
      email
    }
  }
`;

export const SEND_GROUP_EMAIL_MUTATION = gql`
  mutation SendGroupEmail(
    $subject: String!
    $body: String!
    $customerIds: [ID!]!
    $attachments: [Upload!]
  ) {
    sendGroupEmail(
      subject: $subject
      body: $body
      customerIds: $customerIds
      attachments: $attachments
    ) {
      success
      message
      count
    }
  }
`;

export const GET_CUSTOMER_QUERY = gql`
  query customer($id: ID!) {
    customer(id: $id) {
      id
      first_name
      last_name
      full_name
      admin_notes
      base_notes
      abn
      phone_no
      email
      company_name
      company_id
      is_company_admin
      is_pod_sendable
      is_invoice_sendable
      is_approved
    }
  }
`;

export const CREATE_CUSTOMER_MUTATION = gql`
  mutation createCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id
      first_name
      last_name
      full_name
      admin_notes
      base_notes
      abn
      phone_no
      email
      company_name
      company_id
      is_company_admin
      is_pod_sendable
      is_invoice_sendable
    }
  }
`;

export const MUTATION_CUSTOMER_REGISTER = gql`
  mutation registerCustomer($input: RegisterCustomerInput!) {
    registerCustomer(input: $input) {
      id
    }
  }
`;

export const MUTATION_APPROVE_CUSTOMER = gql`
  mutation approveCustomer($customerId: ID!) {
    approveCustomer(customerId: $customerId) {
      status
      message
    }
  }
`;

export const MUTATION_RESTORE_USER = gql`
  mutation restoreUser($id: ID!) {
    restoreUser(id: $id) {
      id
      name
    }
  }
`;

export const UPDATE_CUSTOMER_MUTATION = gql`
  mutation updateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      id
      first_name
      last_name
      full_name
      admin_notes
      base_notes
      abn
      phone_no
      email
      company_name
      company_id
      is_company_admin
      is_pod_sendable
      is_invoice_sendable
    }
  }
`;

export interface RegisterCustomerInput {
  first_name: String;
  last_name: String;
  email: String;
  password: String;
  password_confirmation: String;
}

export const DELETE_CUSTOMER_MUTATION = gql`
  mutation deleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
    }
  }
`;

export interface UpdateCustomerInput {
  id: Number;
  first_name: String;
  last_name: String;
  full_name: String;
  admin_notes: String;
  base_notes: String;
  abn: String;
  phone_no: String;
  email: String;
  company_name: String;
  company_id: Number;
  is_company_admin: Boolean;
  is_pod_sendable: Boolean;
  is_invoice_sendable: Boolean;
}

export interface CreateCustomerInput {
  first_name: String;
  last_name: String;
  full_name: String;
  admin_notes: String;
  base_notes: String;
  abn: String;
  phone_no: String;
  email: String;
  company_name: String;
  company_id: Number;
  is_company_admin: Boolean;
  is_pod_sendable: Boolean;
  is_invoice_sendable: Boolean;
}

type Customer = {
  id: number | null;
  [key: string]:
  | string
  | number
  | null
  | boolean
  | undefined
  | Date
  | any[]
  | any;
};

export const defaultCustomer: Customer = {
  id: null,
  first_name: "",
  last_name: "",
  full_name: "",
  admin_notes: "",
  base_notes: "",
  abn: "",
  phone_no: "",
  email: "",
  company_name: "",
  is_company_admin: false,
  is_pod_sendable: false,
  is_invoice_sendable: false,
};

export interface CustomersQueryResult {
  customers: {
    data: any[];
    paginatorInfo: {
      total: number;
      lastPage?: number;
    };
  };
}