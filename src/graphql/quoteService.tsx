import { gql } from "@apollo/client";

export const GET_QUOTE_SERVICES_QUERY = gql`
  query quoteServices {
    quoteServices {
      id
      name
    }
  }
`;
