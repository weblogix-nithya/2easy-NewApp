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
        onCompleted?: (data: TData) => void,
) {
    const result = useQuery<TData, TVariables>(query, options);
 
    const onDataRef = useRef<((data: TData) => void) | undefined>(onCompleted);
    useEffect(() => {
        onDataRef.current = onCompleted;
    }, [onCompleted]);
 
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
 
    return result;
}