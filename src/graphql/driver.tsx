import { gql } from "@apollo/client";

export const GET_DRIVERS_QUERY = gql`
  query drivers(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $driverStatusId: Int
    $available: Boolean
    $has_expired: Boolean
  ) {
    drivers(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
      driverStatusId: $driverStatusId
      available: $available
      has_expired: $has_expired
    ) {
      data {
        id
        user_id
        first_name
        last_name
        full_name
        driver_no
        phone_no
        email
        rcti_email_id
        trading_name
        abn
        color
        admin_notes
        base_notes
        driver_status_id
        online_status_id
        operation_year
        no_availability
        license_no
        license_state
        license_expire_at
        is_inducted
        is_vehicle_roadworthy
        is_tailgated
        is_sidegated
        no_max_pallets
        no_max_capacity
        no_max_volume
        no_max_length
        no_max_height
        registration_no
        vehicle_make
        vehicle_model
        vehicle_year
        vehicle_class_id
        vehicle_class {
          name
        }
        vehicle_type_id
        vehicle_type {
          name
        }
        transmission_type_id
        wheelbase_type_id
        roof_height_type_id
        door_type_id
        ute_type_id
        truck_type_id
        bank_account_name
        bank_bsb
        bank_account_number
        pay_rate
        levy_rate
        address
        address_line_1
        address_line_2
        address_postal_code
        address_city
        address_state
        address_country
        lat
        lng
        media_url
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

export const GET_AVAILABLE_DRIVERS_QUERY = gql`
  query drivers(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $available: Boolean
  ) {
    drivers(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
      available: $available
    ) {
      data {
        id
        user_id
        first_name
        last_name
        full_name
        driver_no
        phone_no
        email
        rcti_email_id
        trading_name
        abn
        color
        admin_notes
        base_notes
        driver_status_id
        online_status_id
        operation_year
        no_availability
        license_no
        license_state
        license_expire_at
        is_inducted
        is_vehicle_roadworthy
        is_tailgated
        is_sidegated
        no_max_pallets
        no_max_capacity
        no_max_volume
        no_max_length
        no_max_height
        registration_no
        vehicle_make
        vehicle_model
        vehicle_year
        vehicle_class_id
        vehicle_class {
          name
        }
        vehicle_type_id
        vehicle_type {
          name
        }
        transmission_type_id
        wheelbase_type_id
        roof_height_type_id
        door_type_id
        ute_type_id
        truck_type_id
        bank_account_name
        bank_bsb
        bank_account_number
        pay_rate
        levy_rate
        address
        address_line_1
        address_line_2
        address_postal_code
        address_city
        address_state
        address_country
        lat
        lng
        media_url
        remaining_time
        current_occupied_capacity
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
export const GET_DRIVER_QUERY = gql`
  query driver($id: ID!) {
    driver(id: $id) {
      id
      user_id
      first_name
      last_name
      full_name
      driver_no
      phone_no
      email
      rcti_email_id
      trading_name
      abn
      color
      admin_notes
      base_notes
      driver_status_id
      online_status_id
      operation_year
      no_availability
      license_no
      license_state
      license_expire_at
      is_inducted
      is_vehicle_roadworthy
      is_tailgated
      is_sidegated
      no_max_pallets
      no_max_capacity
      no_max_volume
      no_max_length
      no_max_height
      registration_no
      vehicle_make
      vehicle_model
      vehicle_year
      vehicle_class_id
      vehicle_type_id
      transmission_type_id
      wheelbase_type_id
      roof_height_type_id
      door_type_id
      ute_type_id
      truck_type_id
      bank_account_name
      bank_bsb
      bank_account_number
      pay_rate
      levy_rate
      address
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      lat
      lng
      media_url
      license_media {
        id
        name
        downloadable_url
        collection_name
        file_name
      }
      vehicle_media {
        id
        name
        downloadable_url
        collection_name
        file_name
      }
    }
  }
`;

export const CREATE_DRIVER_MUTATION = gql`
  mutation createDriver($input: CreateDriverInput!) {
    createDriver(input: $input) {
      id
      user_id
      first_name
      last_name
      full_name
      driver_no
      phone_no
      email
      rcti_email_id
      trading_name
      abn
      color
      admin_notes
      base_notes
      driver_status_id
      online_status_id
      operation_year
      no_availability
      license_no
      license_state
      license_expire_at
      is_inducted
      is_vehicle_roadworthy
      is_tailgated
      is_sidegated
      no_max_pallets
      no_max_capacity
      no_max_volume
      no_max_length
      no_max_height
      registration_no
      vehicle_make
      vehicle_model
      vehicle_year
      vehicle_class_id
      vehicle_type_id
      transmission_type_id
      wheelbase_type_id
      roof_height_type_id
      door_type_id
      ute_type_id
      truck_type_id
      bank_account_name
      bank_bsb
      bank_account_number
      pay_rate
      levy_rate
      address
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      lat
      lng
      media_url
    }
  }
`;

export const UPDATE_DRIVER_MUTATION = gql`
  mutation updateDriver($input: UpdateDriverInput!) {
    updateDriver(input: $input) {
      id
      user_id
      first_name
      last_name
      full_name
      driver_no
      phone_no
      email
      rcti_email_id
      trading_name
      abn
      color
      admin_notes
      base_notes
      driver_status_id
      online_status_id
      operation_year
      no_availability
      license_no
      license_state
      license_expire_at
      is_inducted
      is_vehicle_roadworthy
      is_tailgated
      is_sidegated
      no_max_pallets
      no_max_capacity
      no_max_volume
      no_max_length
      no_max_height
      registration_no
      vehicle_make
      vehicle_model
      vehicle_year
      vehicle_class_id
      vehicle_type_id
      transmission_type_id
      wheelbase_type_id
      roof_height_type_id
      door_type_id
      ute_type_id
      truck_type_id
      bank_account_name
      bank_bsb
      bank_account_number
      pay_rate
      levy_rate
      address
      address_line_1
      address_line_2
      address_postal_code
      address_city
      address_state
      address_country
      lat
      lng
    }
  }
`;

export const DELETE_DRIVER_MUTATION = gql`
  mutation deleteDriver($id: ID!) {
    deleteDriver(id: $id) {
      id
    }
  }
`;

export interface UpdateDriverInput {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  driver_no: string;
  phone_no: string;
  email: string;
  rcti_email_id: string;
  trading_name: string;
  abn: string;
  color: string;
  admin_notes: string;
  base_notes: string;
  driver_status_id: number;
  online_status_id: number;
  operation_year: string;
  no_availability: number;
  license_no: string;
  license_state: string;
  license_expire_at: Date;
  is_inducted: boolean;
  is_vehicle_roadworthy: boolean;
  is_tailgated: boolean;
  is_sidegated: boolean;
  no_max_pallets: number;
  no_max_capacity: number;
  no_max_volume: number;
  no_max_length: number;
  no_max_height: number;
  registration_no: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_class_id: number;
  vehicle_type_id: number;
  transmission_type_id: number;
  wheelbase_type_id: number;
  roof_height_type_id: number;
  door_type_id: number;
  ute_type_id: number;
  truck_type_id: number;
  bank_account_name: string;
  bank_bsb: string;
  bank_account_number: string;
  pay_rate: number;
  levy_rate: number;
  address: string;
  address_line_1: string;
  address_line_2: string;
  address_postal_code: string;
  address_city: string;
  address_state: string;
  address_country: string;
  lat: number;
  lng: number;
}

export interface CreateDriverInput {
  user_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  driver_no: string;
  phone_no: string;
  email: string;
  rcti_email_id: string;
  trading_name: string;
  abn: string;
  color: string;
  admin_notes: string;
  base_notes: string;
  driver_status_id: number;
  online_status_id: number;
  operation_year: string;
  no_availability: number;
  license_no: string;
  license_state: string;
  license_expire_at: Date;
  is_inducted: boolean;
  is_vehicle_roadworthy: boolean;
  is_tailgated: boolean;
  is_sidegated: boolean;
  no_max_pallets: number;
  no_max_capacity: number;
  no_max_volume: number;
  no_max_length: number;
  no_max_height: number;
  registration_no: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_class_id: number;
  vehicle_type_id: number;
  transmission_type_id: number;
  wheelbase_type_id: number;
  roof_height_type_id: number;
  door_type_id: number;
  ute_type_id: number;
  truck_type_id: number;
  bank_account_name: string;
  bank_bsb: string;
  bank_account_number: string;
  pay_rate: number;
  levy_rate: number;
  address: string;
  address_line_1: string;
  address_line_2: string;
  address_postal_code: string;
  address_city: string;
  address_state: string;
  address_country: string;
  lat: number;
  lng: number;
}

export type Driver = {
  id: number | null;
  user_id: number | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  driver_no: string | null;
  phone_no: string | null;
  email: string | null;
  rcti_email_id: string | null;
  trading_name: string | null;
  abn: string | null;
  color: string | null;
  admin_notes: string | null;
  base_notes: string | null;
  driver_status_id: number | null;
  online_status_id: number | null;
  operation_year: string | null;
  no_availability: number | null;
  license_no: string | null;
  license_state: string | null;
  license_expire_at: string | null;
  is_inducted: boolean | null;
  is_vehicle_roadworthy: boolean | null;
  is_tailgated: boolean | null;
  is_sidegated: boolean | null;
  no_max_pallets: number | null;
  no_max_capacity: number | null;
  no_max_volume: number | null;
  no_max_length: number | null;
  no_max_height: number | null;
  registration_no: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: string | null;
  vehicle_class_id: number | null;
  vehicle_type_id: number | null;
  transmission_type_id: number | null;
  wheelbase_type_id: number | null;
  roof_height_type_id: number | null;
  door_type_id: number | null;
  ute_type_id: number | null;
  truck_type_id: number | null;
  bank_account_name: string | null;
  bank_bsb: string | null;
  bank_account_number: string | null;
  pay_rate: number | null;
  levy_rate: number | null;
  address: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  address_postal_code: string | null;
  address_city: string | null;
  address_state: string | null;
  address_country: string | null;
  lat: number | null;
  lng: number | null;
  media_url: string | null;
  license_media: any[] | null;
  vehicle_media: any[] | null;
  remaining_time: string | null;
  current_occupied_capacity: string | null;
};

export const defaultDriver: Driver = {
  id: null,
  user_id: null,
  first_name: "",
  last_name: "",
  full_name: "",
  driver_no: "",
  phone_no: "",
  email: "",
  rcti_email_id: "",
  trading_name: "",
  abn: "",
  color: "",
  admin_notes: "",
  base_notes: "",
  driver_status_id: null,
  online_status_id: null,
  operation_year: "",
  no_availability: 0,
  license_no: "",
  license_state: "",
  license_expire_at: null,
  is_inducted: false,
  is_vehicle_roadworthy: false,
  is_tailgated: false,
  is_sidegated: false,
  no_max_pallets: 0,
  no_max_capacity: 0,
  no_max_volume: 0,
  no_max_length: 0,
  no_max_height: 0,
  registration_no: "",
  vehicle_make: "",
  vehicle_model: "",
  vehicle_year: "",
  vehicle_class_id: null,
  vehicle_type_id: null,
  transmission_type_id: null,
  wheelbase_type_id: null,
  roof_height_type_id: null,
  door_type_id: null,
  ute_type_id: null,
  truck_type_id: null,
  bank_account_name: "",
  bank_bsb: "",
  bank_account_number: "",
  pay_rate: 0,
  levy_rate: 0,
  address: "",
  address_line_1: "",
  address_line_2: "",
  address_postal_code: "",
  address_city: "",
  address_state: "",
  address_country: "",
  lat: 0,
  lng: 0,
  media_url: "",
  license_media: [],
  vehicle_media: [],
  remaining_time: "",
  current_occupied_capacity: "",
};
