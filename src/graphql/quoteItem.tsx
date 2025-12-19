import { gql } from "@apollo/client";

export const CREATE_QUOTE_ITEM_MUTATION = gql`
  mutation createQuoteItem($input: CreateQuoteItemInput!) {
    createQuoteItem(input: $input) {
      quote_id
      quantity
      volume
      weight
      dimension_height
      dimension_width
      dimension_depth
    }
  }
`;

export const UPDATE_QUOTE_ITEM_MUTATION = gql`
  mutation updateQuoteItem($input: UpdateQuoteItemInput!) {
    updateQuoteItem(input: $input) {
      id
      quote_id
      quantity
      volume
      weight
      dimension_height
      dimension_width
      dimension_depth
    }
  }
`;

export const DELETE_QUOTE_ITEM_MUTATION = gql`
  mutation deleteQuoteItem($id: ID!) {
    deleteQuoteItem(id: $id) {
      id
    }
  }
`;

export interface UpdateQuoteItemInput {
  id: number;
  quote_id: number;
  quantity: number;
  volume: number;
  weight: number;
  dimension_height: number;
  dimension_width: number;
  dimension_depth: number;
  item_type_id: number;
}

export interface CreateQuoteItemInput {
  quote_id: number;
  quantity: number;
  volume: number;
  weight: number;
  dimension_height: number;
  dimension_width: number;
  dimension_depth: number;
  item_type_id: number;
}

export type QuoteItem = {
  id: number | null;
  quote_id: number;
  quantity: number;
  volume: number;
  volume_cm: number;
  weight: number;
  dimension_height: number;
  dimension_height_cm: number;
  dimension_width: number;
  dimension_width_cm: number;
  dimension_depth: number;
  dimension_depth_cm: number;
  item_type_id: number;
  is_new?: boolean;
  item_type: any;
};

export const defaultQuoteItem: QuoteItem = {
  id: null,
  quote_id: null,
  quantity: 0,
  volume: 0,
  volume_cm: null,
  weight: 0,
  dimension_height: 0,
  dimension_width: 0,
  dimension_depth: 0,
  item_type_id: 1,
  dimension_height_cm: 0.0,
  dimension_width_cm: 0.0,
  dimension_depth_cm: 0.0,
  is_new: true,
  item_type: null,
};
