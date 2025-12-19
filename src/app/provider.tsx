"use client"

import { ApolloProvider } from "@apollo/client/react";
import { Provider as ReduxProvider } from "react-redux";
import theme from "@/lib/theme/theme";
import { store } from "@/lib/store/store";
import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";
import { NormalizedCacheObject } from "@apollo/client";
import { useApollo } from "@/graphql/ApolloClient";



interface Props {
  children: ReactNode;
  initialApolloState?: NormalizedCacheObject;
}

export default function Providers({ children, initialApolloState }: Props) {
  const apolloClient = useApollo(initialApolloState ?? {});

  return (
    <ChakraProvider theme={theme}>
      <ReduxProvider store={store}>
        <ApolloProvider client={apolloClient}>
          {children}
        </ApolloProvider>
      </ReduxProvider>
    </ChakraProvider>
  );
}

