"use client";

import { useEffect, useRef } from "react";
import {
    type OperationVariables,
    type DocumentNode,
} from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

export function useApolloLazyQueryWithEffect<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    >(
        query: DocumentNode,
        options?: useLazyQuery.Options<TData, TVariables>,
        onCompleted?: (data: TData) => void,
): useLazyQuery.ResultTuple<TData, TVariables>  {
    const [execute, result] = useLazyQuery<TData, TVariables>(
        query,
        options,
    );

    // Keep latest callback
    const callbackRef = useRef<typeof onCompleted>(onCompleted);
    useEffect(() => {
        callbackRef.current = onCompleted;
    }, [onCompleted]);

    useEffect(() => {
        if (!result.loading && !result.error && result.data && callbackRef.current) {
            callbackRef.current(result.data as TData);
        }
    }, [result.data, result.loading, result.error]);

    return [execute, result];
}