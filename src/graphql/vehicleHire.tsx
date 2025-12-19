import { gql } from "@apollo/client";

export const GET_VEHICLE_HIRES_QUERY = gql`
  query vehicleHires(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $customer_id: ID
    $driver_id: ID
    $vehicle_hire_status_id: [Int]
  ) {
    vehicleHires(
      query: $query
      page: $page
      first: $first
      customer_id: $customer_id
      driver_id: $driver_id
      vehicle_hire_status_id: $vehicle_hire_status_id
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        notes
        instructions
        customer_notes
        base_notes
        admin_notes
        customer_id
        customer {
          full_name
          email
        }
        driver_id
        driver {
          full_name
          email
        }
        vehicle_hire_status_id
        vehicle_hire_status {
          name
        }
        vehicle_class_id
        vehicle_class {
          name
        }
        vehicle_type_id
        vehicle_type {
          name
        }
        transmission_type_id
        transmission_type {
          name
        }
        job_type_id
        job_type {
          name
        }
        hire_from_at
        hire_to_at
        is_acknowledged
        no_min_capacity
        no_max_volume
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

export const GET_VEHICLE_HIRE_QUERY = gql`
  query vehicleHire($id: ID!) {
    vehicleHire(id: $id) {
      id
      name
      notes
      instructions
      customer_notes
      base_notes
      admin_notes
      customer_id
      customer {
        full_name
        email
      }
      driver_id
      driver {
        full_name
        email
      }
      vehicle_hire_status_id
      vehicle_hire_status {
        name
      }
      vehicle_class_id
      vehicle_class {
        name
      }
      vehicle_type_id
      vehicle_type {
        name
      }
      transmission_type_id
      transmission_type {
        name
      }
      job_type_id
      job_type {
        name
      }
      hire_from_at
      hire_to_at
      is_acknowledged
      no_min_capacity
      no_max_volume
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
      reference_no
      pick_up_notes
      pick_up_name
      is_airport_run
      is_semi_required
      is_tailgate_required
      is_inbound_connect
      is_hand_unloading
      is_dangerous_goods
      issue_reports {
        id
        name
        notes
        job_id
        job_destination_id
        vehicle_hire_id
        issue_report_type_id
        issue_report_type {
          name
        }
        issue_report_status_id
        issue_report_status {
          name
        }
        sourceable {
          __typename
          ... on Driver {
            id
            full_name
          }
          ... on Customer {
            id
            full_name
          }
        }
        sourceable_type
        sourceable_id
        updated_at
      }
      chats {
        id
        name
        chat_messages {
          id
          message
          media_url
          created_at
          user {
            driver {
              id
              full_name
              first_name
              last_name
            }
            customer {
              id
              full_name
              first_name
              last_name
            }
          }
        }
      }
      customer_invoice {
        id
        name
        period
        job_id
        vehicle_hire_id
        driver_id
        customer_id
        customer {
          id
          full_name
          first_name
          last_name
          company {
            id
            name
          }
        }
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
        invoice_line_items {
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
      media {
        id
        name
        downloadable_url
        collection_name
        file_name
        uploaded_by
        created_at
      }
    }
  }
`;

export const CREATE_VEHICLE_HIRE_MUTATION = gql`
  mutation createVehicleHire($input: CreateVehicleHireInput!) {
    createVehicleHire(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_VEHICLE_HIRE_MUTATION = gql`
  mutation updateVehicleHire($input: UpdateVehicleHireInput!) {
    updateVehicleHire(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_VEHICLE_HIRE_MUTATION = gql`
  mutation deleteVehicleHire($id: ID!) {
    deleteVehicleHire(id: $id) {
      id
    }
  }
`;

export interface UpdateVehicleHireInput {
  id: Number;
  name: String;
}

export interface CreateVehicleHireInput {
  name: String;
}

type VehicleHire = {
  id: number | null;
  reference_no: string;
  media: any[] | null;
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

export const defaultVehicleHire: VehicleHire = {
  id: null,
  name: "",
  reference_no: "",
  media: [],
};
