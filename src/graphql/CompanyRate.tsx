import { gql } from "@apollo/client";

export interface CompanyRate {
  id: string;
  company_id: string;
  seafreight_id: number;
  area: string;
  cbm_rate: number;
  minimum_charge: number;
  created_at: string;
  updated_at: string;
  state: string;
}

export const GET_LIST_OF_SEAFREIGHTS = gql`
  query {
    allSeafreights {
      id
      location_name
      state
      city
      cbm_rate
      min_charge
    }
  }
`;

export const CREATE_COMPANY_RATE_MUTATION = gql`
  mutation CreateCompanyRate(
    $company_id: ID!
    $seafreight_id: ID
    $area: String!
    $cbm_rate: Float!
    $minimum_charge: Float!
    $state: String!
  ) {
    createCompanyRate(
      input: {
        company_id: $company_id
        seafreight_id: $seafreight_id
        area: $area
        cbm_rate: $cbm_rate
        minimum_charge: $minimum_charge
        state: $state
      }
    ) {
      id
      company_id
      seafreight_id
      area
      cbm_rate
      minimum_charge
      state
      created_at
      updated_at
    }
  }
`;

export const GET_COMPANY_RATE_QUERY = gql`
  query GetRatesByCompany($company_id: ID!) {
    getRatesByCompany(company_id: $company_id) {
      id
      company_id
      seafreight_id
      area
      cbm_rate
      minimum_charge
      state
      created_at
      updated_at
    }
  }
`;

export const UPDATE_COMPANY_RATE_MUTATION = gql`
  mutation UpdateCompanyRate(
    $id: ID!
    $company_id: ID!
    $seafreight_id: ID
    $area: String!
    $cbm_rate: Float!
    $minimum_charge: Float!
    $state: String!
  ) {
    updateCompanyRate(
      id: $id
      input: {
        company_id: $company_id
        seafreight_id: $seafreight_id
        area: $area
        cbm_rate: $cbm_rate
        minimum_charge: $minimum_charge
        state: $state
      }
    ) {
      id
      company_id
      seafreight_id
      area
      cbm_rate
      minimum_charge
      state
      created_at
      updated_at
    }
  }
`;

export const DELETE_COMPANY_RATE_MUTATION = gql`
  mutation DeleteCompanyRate($id: ID!) {
    deleteCompanyRate(id: $id) {
      id
      company_id
      seafreight_id
      area
      cbm_rate
      minimum_charge
      state
      created_at
      updated_at
    }
  }
`;

export const regionOption = [
  { value: "gc_north", label: "GC North" },
  { value: "gc_south", label: "GC South" },
  { value: "local", label: "Local" },
  { value: "sunshine_coast_south", label: "Sunshine Coast South" },
  { value: "sunshine_coast_north", label: "Sunshine Coast North" },
  { value: "toowoomba", label: "Toowoomba" },
];
