"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode, ErrorLike, OperationVariables } from "@apollo/client";

type UseApolloQueryOptions<
    TData,
    TVariables extends OperationVariables,
    > = useQuery.Options<TData, TVariables> & {
        onCompleted?: (data: TData) => void;
        onError?: (error: ErrorLike) => void;
    };

export function useApolloQueryWithEffect<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    >(
        query: DocumentNode,
        options?: UseApolloQueryOptions<TData, TVariables>,
    // onCompleted?: (data: TData) => void,
) {

    const {
        onCompleted,
        onError,
        ...apolloOptions
    } = options || {};

    const result = useQuery<TData, TVariables>(query, apolloOptions as useQuery.Options<TData, TVariables>);

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

    useEffect(() => {
        if (!result.loading && !result.error && result.data && onDataRef.current) {
            // hasCalledRef.current = true;
            onDataRef.current(result.data as TData);
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