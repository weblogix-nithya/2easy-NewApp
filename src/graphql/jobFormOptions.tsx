import { gql } from "@apollo/client";

// ---------- Create Job page — no drivers needed ----------
export const GET_JOB_FORM_OPTIONS_QUERY = gql`
  query jobFormOptions {
    jobFormOptions {
      companies {
        id
        name
      }
      job_types {
        id
        name
      }
      item_types {
        id
        name
      }
      job_categories {
        id
        name
      }
    }
  }
`;

export interface JobFormOptionsResponse {
  jobFormOptions: {
    companies: { id: string; name: string }[];
    job_types: { id: string; name: string }[];
    item_types: { id: string; name: string }[];
    job_categories: { id: string; name: string }[];
  };
}

// ---------- Edit Job page — includes drivers for driver assignment ----------
export const GET_JOB_FORM_OPTIONS_WITH_DRIVERS_QUERY = gql`
  query jobFormOptions {
    jobFormOptions {
      drivers {
        id
        name
      }
      companies {
        id
        name
      }
      job_types {
        id
        name
      }
      item_types {
        id
        name
      }
      job_categories {
        id
        name
      }
    }
  }
`;

export interface JobFormOptionsWithDriversResponse {
  jobFormOptions: {
    drivers: { id: string; name: string }[];
    companies: { id: string; name: string }[];
    job_types: { id: string; name: string }[];
    item_types: { id: string; name: string }[];
    job_categories: { id: string; name: string }[];
  };
}