
// import {
//   ApolloClient,
//   HttpOptions,
//   InMemoryCache,
//   NormalizedCacheObject,
//   from,
// } from "@apollo/client";

// import { onError } from "@apollo/client/link/error";
// import { createUploadLink } from "apollo-upload-client";
// import { destroyCookie, parseCookies } from "nookies";
// import { useMemo } from "react";

// export let apolloClient: ApolloClient | null = null;

// /* -------------------- CLEAR COOKIES -------------------- */
// const clearAllCookies = () => {
//   const cookieNames = [
//     "access_token",
//     "user_name",
//     "user_email",
//     "customer_id",
//     "driver_id",
//     "company_id",
//     "is_admin",
//     "is_company_admin",
//     "user_id",
//     "state",
//   ];

//   cookieNames.forEach((name) => {
//     destroyCookie(null, name, { path: "/" });
//   });

//   localStorage.clear();
//   sessionStorage.clear();
// };

// /* -------------------- CREATE UPLOAD LINK -------------------- */
// const createLink = (opts: HttpOptions = {}) => {
//   return createUploadLink({
//     uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
//     credentials: "include",
//     fetchOptions: { credentials: "include" },
//     ...opts,
//   });
// };

// /* -------------------- APOLLO CLIENT FACTORY -------------------- */
// function createApolloClient(token = "") {
//   const uploadLink = createUploadLink({
//     uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
//     credentials: "include",
//     fetchOptions: { credentials: "include" },
//     headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//   });

//   /* ---- ERROR HANDLING LINK ---- */
//   const errorLink = onError(({ graphQLErrors, networkError }) => {
//     const isUnauth =
//       networkError?.statusCode === 401 ||
//       networkError?.message?.includes("401") ||
//       graphQLErrors?.some(
//         (err) =>
//           err?.extensions?.code === "UNAUTHENTICATED" ||
//           err.message?.toLowerCase().includes("unauthenticated")
//       );

//     if (isUnauth && typeof window !== "undefined") {
//       const redirectTo = window.location.pathname + window.location.search;

//       clearAllCookies();

//       apolloClient?.clearStore().then(() => {
//         window.location.href = `/auth/login?redirectTo=${encodeURIComponent(
//           redirectTo
//         )}`;
//       });
//     }
//   });

//   return new ApolloClient({
//     ssrMode: typeof window === "undefined",
//     cache: new InMemoryCache({ addTypename: false }),
//     link: from([errorLink, uploadLink]),
//     defaultOptions: {
//       watchQuery: { errorPolicy: "all" },
//     },
//   });
// }

// /* -------------------- INITIALIZE APOLLO -------------------- */
// export function initializeApollo(initialState = {}) {
//   const cookies = parseCookies();
//   const token = cookies.access_token || "";

//   const _apolloClient = apolloClient ?? createApolloClient(token);

//   if (initialState) {
//     const existingCache = _apolloClient.extract();
//     _apolloClient.cache.restore({ ...existingCache, ...initialState });
//   }

//   if (typeof window === "undefined") return _apolloClient;

//   if (!apolloClient) {
//     apolloClient = _apolloClient;
//   }

//   return apolloClient;
// }

// /* -------------------- REACT HOOK -------------------- */
// export function useApollo(initialState: NormalizedCacheObject) {
//   return useMemo(() => initializeApollo(initialState), []);
// }

// /* -------------------- TOKEN RESET (v4 Compatible) -------------------- */
// export const setAuthToken = () => {
//   const cookies = parseCookies();
//   const token = cookies.access_token || "";

//   if (!apolloClient) return;

//   // ❗ setLink() removed in v4 → must recreate the entire client
//   apolloClient = createApolloClient(token);
// };



import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  CombinedGraphQLErrors,
  ApolloLink,
} from "@apollo/client";

import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs"
import { ErrorLink } from "@apollo/client/link/error";
import { SetContextLink } from "@apollo/client/link/context";
import { parseCookies, destroyCookie } from "nookies";
import { useMemo } from "react";

export let apolloClient: ApolloClient | null = null;

/* -------------------- CLEAR COOKIES -------------------- */
const clearAllCookies = () => {
  const cookieNames = [
    "access_token",
    "user_name",
    "user_email",
    "customer_id",
    "driver_id",
    "company_id",
    "is_admin",
    "is_company_admin",
    "user_id",
    "state",
  ];

  cookieNames.forEach((name) => {
    destroyCookie(null, name, { path: "/" });
  });

  localStorage.clear();
  sessionStorage.clear();
};

/* -------------------- UPLOAD LINK -------------------- */
// This link ALWAYS must be last in the chain.
const uploadLink = new UploadHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
  credentials: "include",
  fetchOptions: { credentials: "include" },
});

/* -------------------- AUTH LINK (Dynamic per request) -------------------- */
// const authLink = setContext((_, { headers }) => {
//   const cookies = parseCookies();
//   const token = cookies.access_token;

//   return {
//     headers: {
//       ...headers,
//       Authorization: token ? `Bearer ${token}` : "",
//     },
//   };
// });

const authLink = new SetContextLink((prevContext) => {
  const cookies = parseCookies();
  const token = cookies.access_token || "";

  return {
    headers: {
      ...prevContext.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

/* -------------------- ERROR HANDLING LINK -------------------- */
const errorLink =  new ErrorLink(({ error }) => {
  // const isUnauth =
  //   networkError?.statusCode === 401 ||
  //   networkError?.message?.includes("401") ||
  //   graphQLErrors?.some(
  //     (err) =>
  //       err?.extensions?.code === "UNAUTHENTICATED" ||
  //       err.message?.toLowerCase().includes("unauthenticated")
  //   );

  let isUnauth = false;

  // 1️⃣ Handle GraphQL errors
  if (CombinedGraphQLErrors.is(error)) {
    isUnauth = error.errors.some(
      (err) =>
        err.extensions?.code === "UNAUTHENTICATED" ||
        err.message.toLowerCase().includes("unauthenticated")
    );
  }

  // 2️⃣ Handle Network errors
  if (error?.message?.includes("401")) {
    isUnauth = true;
  }

  if (isUnauth && typeof window !== "undefined") {
    const redirectTo = window.location.pathname + window.location.search;

    clearAllCookies();

    apolloClient?.clearStore().then(() => {
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(
        redirectTo
      )}`;
    });
  }
});

/* -------------------- CREATE CLIENT -------------------- */
function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    cache: new InMemoryCache(),
    // link: from([
    //   errorLink, // Handle errors first
    //   authLink,  // Attach token per request
    //   uploadLink // Must be last
    // ]),
    link: ApolloLink.from([errorLink, authLink, uploadLink]),
    defaultOptions: {
      watchQuery: { errorPolicy: "all" },
    },
  });
}

/* -------------------- INITIALIZE APOLLO -------------------- */
export function initializeApollo(initialState : NormalizedCacheObject = {}) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = _apolloClient.extract() as NormalizedCacheObject;
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  if (typeof window === "undefined") return _apolloClient;

  if (!apolloClient) apolloClient = _apolloClient;

  return apolloClient;
}

/* -------------------- REACT HOOK -------------------- */
export function useApollo(initialState: NormalizedCacheObject) {
  return useMemo(() => initializeApollo(initialState), []);
}
