import { gql } from "@apollo/client";

export const GET_QUOTE_STATUSES_QUERY = gql`
  query quoteStatuses {
    quoteStatuses {
      id
      name
    }
  }
`;
