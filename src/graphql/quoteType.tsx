import { gql } from "@apollo/client";

export const GET_QUOTE_TYPES_QUERY = gql`
  query quoteTypes {
    quoteTypes {
      id
      name
    }
  }
`;
