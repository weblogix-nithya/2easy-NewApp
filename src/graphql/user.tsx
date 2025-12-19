import { gql } from "@apollo/client";

export const GET_USERS_QUERY = gql`
  query users(
    $query: String
    $page: Int!
    $first: Int!
    $is_approve: Boolean
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    users(
      query: $query
      page: $page
      first: $first
      is_approve: $is_approve
      orderBy: [{ column: $orderByColumn, order: $orderByOrder }]
    ) {
      data {
        id
        name
        email
        is_approve
        is_admin
        reset_approve
        roles {
          id
          name
        }
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

export const GET_APPROVAL_USERS_QUERY = gql`
  query users(
    $query: String
    $page: Int!
    $first: Int!
    $is_approve: Boolean
    $without_drivers: Boolean
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    users(
      query: $query
      page: $page
      first: $first
      is_approve: $is_approve
      without_drivers: $without_drivers
      orderBy: [{ column: $orderByColumn, order: $orderByOrder }]
    ) {
      data {
        id
        name
        email
        is_approve
        is_admin
        reset_approve
        roles {
          id
          name
        }
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
export const GET_TRASHED_USERS_QUERY = gql`
  query trashedUsers(
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
    $query: String
  ) {
    users(
      trashed: ONLY
      page: $page
      first: $first
      query: $query
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        email
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

export const GET_USER_QUERY = gql`
  query user($id: ID!) {
    user(id: $id) {
      id
      name
      email
      state
      is_approve
      is_admin
      reset_approve
      media_url
      roles {
        id
        name
      }
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation createUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      state
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      state
    }
  }
`;

export const UPDATE_USER_ACCESS_MUTATION = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      reset_approve
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation deleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

export const RESET_USER_PASSWORD_MUTATION = gql`
  mutation ResetUserPassword($id: ID!, $new_password: String!) {
    resetUserPassword(id: $id, new_password: $new_password) {
      id
      name
      email
    }
  }
`;

export const MUTATION_APPROVE_USER = gql`
  mutation ApproveUser {
    approveUser(userId: 2233) {
      id
      name
      email
      is_approve
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

// export const MUTATION_RESTORE_USER = gql`
//   mutation restoreUser($id: ID!) {
//     restoreUser(id: $id) {
//       id
//       name
//     }
//   }
// `;

export interface UpdateUserInput {
  id: Number;
  name: String;
  email: String;
  is_approve?: true;
}

export interface CreateUserInput {
  name: String;
  email: String;
  password: String;
  state: String;
}

export interface UserType {
  id: number;
  name: string;
  email: string;
}

export interface User {
  id: any;
  name: string;
  email: string;
  media_url: string;
  state: string;
  roles: any[];
}

export const defaultUser: User = {
  id: null,
  name: "",
  email: "",
  media_url: "",
  state: "Queensland",
  roles: [],
};
