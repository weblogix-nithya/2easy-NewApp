"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode, OperationVariables } from "@apollo/client";

export function useApolloQueryWithEffect<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode,
  options: any,
  onData?: (data: TData) => void,
) {
  const result = useQuery<TData, TVariables>(query, options);

  const onDataRef = useRef<((data: TData) => void) | undefined>(onData);
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  const hasCalledRef = useRef(false);

  useEffect(() => {
    hasCalledRef.current = false;
  }, [options?.variables]);

  useEffect(() => {
    if (result.data && onDataRef.current && !hasCalledRef.current) {
      hasCalledRef.current = true;
      onDataRef.current(result.data as TData);
    }
  }, [result.data]);

  return result;
}