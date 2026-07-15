"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import type {
  DocumentNode,
  ErrorLike,
  OperationVariables,
} from "@apollo/client";

export type UseApolloQueryOptions<
  TData,
  TVariables extends OperationVariables,
> = useQuery.Options<TData, TVariables> & {
  onCompleted?: (data: TData) => void;
  onError?: (error: ErrorLike) => void;
};

export function useApolloQueryWithEffect<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options?: UseApolloQueryOptions<TData, TVariables> | any,
) {
  const { onCompleted, onError, ...restOptions } = options || {};

  // Memoize by actual content, not object identity
  const apolloOptions = useMemo(
    () => restOptions,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(restOptions)],
  );

  const result = useQuery<TData, TVariables>(
    query,
    apolloOptions as useQuery.Options<TData, TVariables>,
  );

  const onDataRef = useRef<((data: TData) => void) | undefined>(onCompleted);
  const errorRef = useRef<typeof onError>(onError);

  useEffect(() => {
    onDataRef.current = onCompleted;
  }, [onCompleted]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  // const hasCalledRef = useRef(false);

  // useEffect(() => {
  //     hasCalledRef.current = false;
  // }, [options?.variables]);
  // success
  // useEffect(() => {
  //     if (!result.loading && !result.error && result.data && onDataRef.current) {
  //         // hasCalledRef.current = true;
  //         onDataRef.current(result.data as TData);
  //     }
  // }, [result.data, result.loading, result.error]);

  // inside both Copy hooks, replace the "Success" effect with:

const lastFiredDataRef = useRef<string | null>(null);

useEffect(() => {
  if (!result.loading && !result.error && result.data) {
    const serialized = JSON.stringify(result.data);
    if (serialized !== lastFiredDataRef.current) {
      lastFiredDataRef.current = serialized;
      if (onDataRef.current) {  // or callbackRef.current in the lazy hook
        onDataRef.current(result.data as TData);
      }
    }
  }
}, [result.data, result.loading, result.error]);

  useEffect(() => {
    if (result.error && errorRef.current) {
      errorRef.current(result.error);
    }
  }, [result.error]);

  return result;
}

// : useQuery.Result<TData, TVariables>
