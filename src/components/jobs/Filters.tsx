import { MultiValue } from "chakra-react-select";

export type SelectedFilter = {
  states?: MultiValue<{ value: string; label: string }>;
  suburbs?: any;
  address_business_name?: any;
  has_company_ids?: MultiValue<{ value: string; label: string }>;
  has_job_category_ids?: MultiValue<{ value: string; label: string }>;
  job_date_at?: string;
  job_status_id?: MultiValue<{ value: string; label: string }>;
  is_tailgate_required?: boolean;
  weight_from?: number;
  weight_to?: number;
  volume_from?: number;
  volume_to?: number;
};

export const filterDisplayNames = {
  states: { label: "States", value: "" },
  suburbs: { label: "Suburbs", value: "" },
  address_business_name: { label: "Business Name", value: "" },
  has_company_ids: { label: "Company", value: "" },
  has_job_category_ids: { label: "Job Type", value: "" },
  job_date_at: { label: "Date", value: "" },
  job_status_id: { label: "Job Status", value: "" },
  is_tailgate_required: { label: "Tailgate", value: "" },
  weight_from: { label: "Weight From", value: "" },
  weight_to: { label: "Weight To", value: "" },
  volume_from: { label: "Volume From", value: "" },
  volume_to: { label: "Volume To", value: "" },
};

export const defaultSelectedFilter: SelectedFilter = {
  states: undefined,
  suburbs: undefined,
  address_business_name: undefined,
  has_company_ids: undefined,
  has_job_category_ids: undefined,
  job_date_at: "",
  job_status_id: undefined,
  is_tailgate_required: undefined,
  weight_from: undefined,
  weight_to: undefined,
  volume_from: undefined,
  volume_to: undefined,
};

export type JobFilter = {
  states?: string[];
  suburbs?: string[];
  address_business_name?: string[];
  has_company_ids?: string[];
  has_job_category_ids?: any;
  job_date_at: string;
  job_status_id?: string[];
  is_tailgate_required?: boolean;
  weight_from?: number;
  weight_to?: number;
  volume_from?: number;
  volume_to?: number;
};

export const defaultJobFilter: JobFilter = {
  states: [],
  suburbs: [],
  address_business_name: [],
  has_company_ids: [],
  has_job_category_ids: [],
  job_date_at: "",
  job_status_id: [],
  is_tailgate_required: false,
  weight_from: null,
  weight_to: null,
  volume_from: null,
  volume_to: null,
};
