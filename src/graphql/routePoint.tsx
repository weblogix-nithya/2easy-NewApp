import { gql } from "@apollo/client";

export const GET_ROUTE_POINTS_QUERY = gql`
  query routePoints(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    routePoints(
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

export const GET_ROUTE_POINT_QUERY = gql`
  query routePoint($id: ID!) {
    routePoint(id: $id) {
      id
      name
    }
  }
`;

export const CREATE_ROUTE_POINT_MUTATION = gql`
  mutation createRoutePoint($input: CreateRoutePointInput!) {
    createRoutePoint(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ROUTE_POINT_MUTATION = gql`
  mutation updateRoutePoint($input: UpdateRoutePointInput!) {
    updateRoutePoint(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ROUTE_POINT_SORT_ID_MUTATION = gql`
  mutation updateRoutePoint($input: UpdateRoutePointInput!) {
    updateRoutePoint(input: $input) {
      id
      sort_id
    }
  }
`;

export const DELETE_ROUTE_POINT_MUTATION = gql`
  mutation deleteRoutePoint($id: ID!) {
    deleteRoutePoint(id: $id) {
      id
    }
  }
`;

export interface UpdateRoutePointInput {
  id: Number;
  name: String;
  sort_id: Number;
}

export interface CreateRoutePointInput {
  name: String;
}

type RoutePoint = {
  id: number | null;
  [key: string]: string | number | null;
};

export const defaultRoutePoint: RoutePoint = {
  id: null,
  name: "",
};
