"use client";

import { useEffect, useRef } from "react";
import {
    type OperationVariables,
    type DocumentNode,
    ErrorLike,
} from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";


type UseApolloLazyQueryOptions<
    TData,
    TVariables extends OperationVariables,
    > = useLazyQuery.Options<TData, TVariables> & {
        onCompleted?: (data: TData) => void;
        onError?: (error: ErrorLike) => void;
    };

export function useApolloLazyQueryWithEffect<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    >(
        query: DocumentNode,
        options?: UseApolloLazyQueryOptions<TData, TVariables>,
    // onCompleted?: (data: TData) => void,
): useLazyQuery.ResultTuple<TData, TVariables> {

    const {
        onCompleted,
        onError,
        ...apolloOptions
    } = options || {};

    const [execute, result] = useLazyQuery<TData, TVariables>(
        query,
        apolloOptions,
    );

    // Keep latest callback
    const callbackRef = useRef<typeof onCompleted>(onCompleted);
    const errorRef = useRef<typeof onError>(onError);

    useEffect(() => {
        callbackRef.current = onCompleted;
    }, [onCompleted]);

    useEffect(() => {
        errorRef.current = onError;
    }, [onError]);

    // Success
    useEffect(() => {
        if (!result.loading && !result.error && result.data && callbackRef.current) {
            callbackRef.current(result.data as TData);
        }
    }, [result.data, result.loading, result.error]);

    // Error
    useEffect(() => {
        if (result.error && errorRef.current) {
            errorRef.current(result.error);
        }
    }, [result.error]);

    return [execute, result];
}