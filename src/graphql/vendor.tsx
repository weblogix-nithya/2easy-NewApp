import { gql } from "@apollo/client";

export const GET_VENDORS_QUERY = gql`
  query vendors(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    vendors(
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

export const GET_VENDOR_QUERY = gql`
  query vendor($id: ID!) {
    vendor(id: $id) {
      id
      name
      abn
      is_pod_sendable
      is_invoice_sendable
      contact_phone
      contact_email
      account_email
      admin_notes
      base_notes
      lcl_rate
      address_business_name
      address
      lng
      lat
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      vendor_service_id
      on_hold
      is_active
      account_name
      account_number
      bsb_code
      swift_code
      payment_term
    }
  }
`;

export const CREATE_VENDOR_MUTATION = gql`
  mutation createVendor($input: CreateVendorInput!) {
    createVendor(input: $input) {
      id
      name
      abn
      is_pod_sendable
      is_invoice_sendable
      contact_phone
      contact_email
      account_email
      admin_notes
      base_notes
      lcl_rate
      address_business_name
      address
      lng
      lat
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      vendor_service_id
      on_hold
      is_active
      account_name
      account_number
      bsb_code
      swift_code
      payment_term
      vendor_service {
        id
        service_name
        description
        created_at
        updated_at
      }
    }
  }
`;

export const UPDATE_VENDOR_MUTATION = gql`
  mutation updateVendor($id: ID!, $input: UpdateVendorInput!) {
    updateVendor(id: $id, input: $input) {
      id
      name
      abn
      is_pod_sendable
      is_invoice_sendable
      contact_phone
      contact_email
      account_email
      admin_notes
      base_notes
      lcl_rate
      address_business_name
      address
      lng
      lat
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      vendor_service_id
      on_hold
      is_active
      account_name
      account_number
      bsb_code
      swift_code
      deleted_at
      created_at
      updated_at
      payment_term
    }
  }
`;

export const DELETE_VENDOR_MUTATION = gql`
  mutation deleteVendor($id: ID!) {
    deleteVendor(id: $id) {
      id
    }
  }
`;

export const GET_VENDOR_SERVICES_QUERY = gql`
  query VendorServices {
    vendorServices {
      id
      service_name
    }
  }
`;

// Vendor Service Type
export interface VendorService {
  id: string;
  service_name: string;
  description: string;
  created_at: string; // DateTime represented as a string (e.g., "2018-05-23 13:43:32")
  updated_at: string; // DateTime represented as a string with the same format
}

// UpdateVendorInput Interface
export interface UpdateVendorInput {
  id: number;
  name: string;
  abn: string;
  contact_phone: string;
  contact_email: string;
  account_email: string;
  is_pod_sendable: boolean;
  is_invoice_sendable: boolean;
  admin_notes: string;
  base_notes: string;
  lcl_rate: number;
  address_business_name: string;
  address: string;
  lng: number;
  lat: number;
  address_line_1: string;
  address_line_2: string;
  address_postal_code: string;
  address_city: string;
  address_state: string;
  address_country: string;
  vendor_service_id: number;
  on_hold: boolean;
  is_active: boolean;
  account_name: string;
  account_number: string;
  bsb_code: string;
  swift_code: string;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  payment_term: string;
  vendor_service?: VendorService; // Optional VendorService object
}

// CreateVendorInput Interface
export interface CreateVendorInput {
  name: string;
  abn: string;
  contact_phone: string;
  contact_email: string;
  account_email: string;
  is_pod_sendable: boolean;
  is_invoice_sendable: boolean;
  admin_notes: string;
  base_notes: string;
  lcl_rate: number;
  address_business_name: string;
  address: string;
  lng: number;
  lat: number;
  address_line_1: string;
  address_line_2: string;
  address_postal_code: string;
  address_city: string;
  address_state: string;
  address_country: string;
  vendor_service_id: number;
  on_hold: boolean;
  is_active: boolean;
  account_name: string;
  account_number: string;
  bsb_code: string;
  swift_code: string;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  payment_term: string;
  vendor_service?: VendorService; // Optional VendorService object
}

// Vendor Type
export type Vendor = {
  id: number | null;
  name: string | null;
  abn: string | null;
  is_pod_sendable: boolean | null;
  is_invoice_sendable: boolean | null;
  contact_phone: string | null;
  contact_email: string | null;
  account_email: string | null;
  admin_notes: string | null;
  base_notes: string | null;
  lcl_rate: number | null;
  address_business_name: string | null;
  address: string | null;
  lng: number | null;
  lat: number | null;
  address_line_1: string | null;
  address_line_2: string | null;
  address_postal_code: string | null;
  address_city: string | null;
  address_state: string | null;
  address_country: string | null;
  vendor_service_id: number | null;
  on_hold: boolean | null;
  is_active: boolean | null;
  account_name: string | null;
  account_number: string | null;
  bsb_code: string | null;
  swift_code: string | null;
  deleted_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  payment_term: string | null;
  vendor_service: VendorService | null;
};

// Default Vendor
export const defaultVendor: Vendor = {
  id: null,
  name: "",
  abn: "",
  is_pod_sendable: false,
  is_invoice_sendable: false,
  contact_phone: "",
  contact_email: "",
  account_email: "",
  admin_notes: "",
  base_notes: "",
  lcl_rate: 0,
  address_business_name: "",
  address: "",
  lng: null,
  lat: null,
  address_line_1: "",
  address_line_2: "",
  address_postal_code: "",
  address_city: "",
  address_state: "",
  address_country: "",
  vendor_service_id: null,
  on_hold: false,
  is_active: true,
  account_name: "",
  account_number: "",
  bsb_code: "",
  swift_code: "",
  payment_term: "",
  vendor_service: null,
  deleted_at: undefined,
  created_at: undefined,
  updated_at: undefined,
};

export const paymentTerms = [
  { label: "EOD", value: "EOD" },
  { label: "7 Days", value: "7_days" },
  { label: "14 Days", value: "14_days" },
  { label: "21 Days", value: "21_days" },
  { label: "30 Days", value: "30_days" },
  { label: "7 Days EOM", value: "7_days_eom" },
  { label: "14 Days EOM", value: "14_days_eom" },
  { label: "20 Days EOM", value: "20_days_eom" },
  { label: "21 Days EOM", value: "21_days_eom" },
  { label: "30 Days EOM", value: "30_days_eom" },
  { label: "75 Days EOM", value: "75_days_eom" },
];
