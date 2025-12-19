import { gql } from "@apollo/client";

export const GET_DYNAMIC_TABLES_QUERY = gql`
  query dynamicTables(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    dynamicTables(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        column_name
        column_description
        table_name
        is_default_active
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

export const GET_DYNAMIC_TABLE_QUERY = gql`
  query dynamicTable($id: ID!) {
    dynamicTable(id: $id) {
        id
        name
        column_name
        column_description
        table_name
        is_default_active
    }
  }
`;

export const CREATE_DYNAMIC_TABLE_MUTATION = gql`
  mutation createDynamicTable($input: CreateDynamicTableInput!) {
    createDynamicTable(input: $input) {
      id
      name
        column_name
        column_description
        table_name
        is_default_active
    }
  }
`;

export const UPDATE_DYNAMIC_TABLE_MUTATION = gql`
  mutation updateDynamicTable($input: UpdateDynamicTableInput!) {
    updateDynamicTable(input: $input) {
      id
      name
        column_name
        column_description
        table_name
        is_default_active
    }
  }
`;

export const DELETE_DYNAMIC_TABLE_MUTATION = gql`
  mutation deleteDynamicTable($id: ID!) {
    deleteDynamicTable(id: $id) {
      id
    }
  }
`;

export interface UpdateDynamicTableInput {
    id: Number;
    name: String;
    column_name: String
    column_description: String
    table_name: String
    is_default_active: boolean
}

export interface CreateDynamicTableInput {
    name: String;
    column_name: String
    column_description: String
    table_name: String
    is_default_active: boolean
}

export type DynamicTable = {
    id: number | null;
    name: string;
    column_name: string;
    column_description: string;
    table_name: string;
    is_default_active: boolean;
};

export const defaultDynamicTable: DynamicTable = {
    id: null,
    name: "",
    column_name: "",
    column_description: "",
    table_name: "",
    is_default_active: false
};
