// import { ApolloError } from "@apollo/client/core";
import { createStandaloneToast } from "@chakra-ui/react";
import { GraphQLFormattedError } from "graphql";

const { toast } = createStandaloneToast();

export function showGraphQLErrorToast(apolloError) {
  const graphQLErrors = apolloError.graphQLErrors;
  let errorMessage = "";
  try {
    graphQLErrors.forEach((graphQLError: GraphQLFormattedError) => {
      if (graphQLErrors[0]?.extensions?.category === "validation") {
        Object.values(graphQLErrors[0].extensions.validation).forEach(
          (validationErrors: any) => {
            validationErrors.forEach((validationError: String) => {
              errorMessage += `${validationError} `;
            });
          }
        );
      } else if (graphQLErrors[0].extensions?.category === "authentication") {
        window.location.href = "/auth/login";
      } else {
        errorMessage += `${graphQLError.message}`;
      }
    });
  } catch (error) {}
  if (errorMessage) {
    toast({
      title: "Error",
      description: errorMessage,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } else {
    toast({
      title: "Error",
      description: "Server error",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
}
