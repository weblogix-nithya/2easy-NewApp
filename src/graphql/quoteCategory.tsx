import { gql } from "@apollo/client";

export const GET_QUOTE_CATEGORIES_QUERY = gql`
  query quoteCategories {
    quoteCategories {
      id
      name
    }
  }
`;
