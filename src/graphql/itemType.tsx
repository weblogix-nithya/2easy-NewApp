import { gql } from "@apollo/client";

export const GET_ITEM_TYPES_QUERY = gql`
  query itemTypes(
    $query: String
    $page: Int!
    $first: Int!
    $orderByColumn: String!
    $orderByOrder: SortOrder!
  ) {
    itemTypes(
      query: $query
      page: $page
      first: $first
      orderBy: { column: $orderByColumn, order: $orderByOrder }
    ) {
      data {
        id
        name
        is_small
        is_large
        height_limit
        width_limit
        depth_limit
        weight_limit
        media_url
      }
    }
  }
`;

export const GET_ITEM_TYPE_QUERY = gql`
  query itemType($id: ID!) {
    itemType(id: $id) {
      id
      name
      is_small
      is_large
      height_limit
      width_limit
      depth_limit
      weight_limit
      media_url
    }
  }
`;

export type ItemType = {
  id: number | null;
  name: string;
  is_small: boolean;
  is_large: boolean;
  height_limit: number;
  width_limit: number;
  depth_limit: number;
  weight_limit: number;
};

export const defaultItemType: ItemType = {
  id: null,
  name: "",
  is_small: false,
  is_large: false,
  height_limit: 0,
  width_limit: 0,
  depth_limit: 0,
  weight_limit: 0,
};
