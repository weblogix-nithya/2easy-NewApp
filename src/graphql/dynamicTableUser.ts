import { gql } from "@apollo/client";

import { DynamicTable } from "./dynamicTable";

export const GET_DYNAMIC_TABLE_USERS_QUERY = gql`
  query dynamicTableUsers(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $user_id: ID
  ) {
    dynamicTableUsers(
        query: $query
        page: $page
        first: $first
        orderBy: { column: $orderByColumn, order: $orderByOrder }
        user_id: $user_id
    ) {
      data {
        id
        name
        dynamic_table_id
        dynamic_table {
          name
          column_name
          column_description
          table_name
          is_default_active
        }
        user_id
        is_active
        sort_id
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

export const GET_DYNAMIC_TABLE_USER_QUERY = gql`
  query dynamicTableUser($id: ID!) {
    dynamicTableUser(id: $id) {
        id
        name
        dynamic_table_id
        dynamic_table {
            name
            column_description
        }
        user_id
        is_active
        sort_id
    }
  }
`;

export const CREATE_DYNAMIC_TABLE_USER_MUTATION = gql`
  mutation createDynamicTableUser($input: CreateDynamicTableUserInput!) {
    createDynamicTableUser(input: $input) {
        id
        name
        dynamic_table_id
        dynamic_table {
            name
            column_description
        }
        user_id
        is_active
        sort_id
    }
  }
`;

export const UPDATE_DYNAMIC_TABLE_USER_MUTATION = gql`
  mutation updateDynamicTableUser($input: UpdateDynamicTableUserInput!) {
    updateDynamicTableUser(input: $input) {
        id
        name
        dynamic_table_id
        dynamic_table {
            name
            column_description
        }
        user_id
        is_active
        sort_id
    }
  }
`;

export const DELETE_DYNAMIC_TABLE_USER_MUTATION = gql`
  mutation deleteDynamicTableUser($id: ID!) {
    deleteDynamicTableUser(id: $id) {
      id
    }
  }
`;


export const BULK_UPDATE_DYNAMIC_TABLE_USERS_MUTATION = gql`
  mutation bulkUpdateDynamicTableUsers($input: [UpdateDynamicTableUserInput]!) {
    bulkUpdateDynamicTableUsers(input: $input) {
        id
        name
        dynamic_table_id
        dynamic_table {
            name
            column_description
        }
        user_id
        is_active
        sort_id
    }
  }
`;

export interface UpdateDynamicTableUserInput {
    id: Number;
    name: String;
    dynamic_table_id: number;
    user_id: number;
    is_active: Boolean;
    sort_id: number;
}

export interface CreateDynamicTableUserInput {
    name: String;
    dynamic_table_id: number;
    user_id: number;
    is_active: Boolean;
    sort_id: number;
}

export type DynamicTableUser = {
    id: number | string |null;
    name: string;
    dynamic_table_id: number;
    user_id: number;
    is_active: boolean;
    sort_id: number;
    dynamic_table?: DynamicTable;
};

export const defaultDynamicTableUser: DynamicTableUser = {
    id: null,
    name: "",
    dynamic_table_id: null,
    user_id: null,
    is_active: false,
    sort_id: null
};
