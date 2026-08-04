import { useMutation } from "@apollo/client/react";
import { useToast } from "@chakra-ui/react";
import PaginationTable from "@/components/table/PaginationTable";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { MUTATION_RESTORE_USER } from "@/graphql/user";
import { GET_TRASHED_USERS_QUERY } from "@/graphql/user";
import React from "react";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

interface RestoreUserTabProps {
  restoreColumns: any;
  queryPageIndex: number;
  queryPageSize: number;
  searchQuery: string;
  setQueryPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setQueryPageSize: React.Dispatch<React.SetStateAction<number>>;
}

function RestoreUserTab({
  restoreColumns,
  searchQuery,
  queryPageIndex,
  queryPageSize,
  setQueryPageIndex,
  setQueryPageSize,
}: RestoreUserTabProps) {
  const toast = useToast();

  const [handleRestoreUser, {}] = useMutation(MUTATION_RESTORE_USER, {
    onCompleted: () => {
      // console.log("APP", _data);
      // Toast()
      toast({
        title: "Restored the user successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      showGraphQLErrorToast(error);
    },
  });

  const {
    refetch,
    loading,
    data: restoreCustomers,
  } = useApolloQueryWithEffect(GET_TRASHED_USERS_QUERY, {
    variables: {
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderByColumn: "id",
      orderByOrder: "ASC",
      query: searchQuery,
    },
    fetchPolicy: "network-only", // ensures always fresh data
  });

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  const handleRestore = (id: any) => {
    handleRestoreUser({
      variables: {
        id: parseInt(id),
      },
    });
  };
  return (
    <>
      {restoreCustomers?.users?.data?.length > 0 ? (
        <PaginationTable
          columns={restoreColumns}
          data={restoreCustomers?.users?.data}
          options={{
            initialState: {
              pageIndex: queryPageIndex,
              pageSize: queryPageSize,
            },
            manualPagination: true,
            pageCount: restoreCustomers?.users?.paginatorInfo.lastPage,
          }}
          onRestore={(id: any) => {
            handleRestore(id);
          }}
          path="/admin/users"
          setQueryPageIndex={setQueryPageIndex}
          setQueryPageSize={setQueryPageSize}
          isServerSide
        />
      ) : (
        <div className="text-center mt-20">No User to Restore</div>
      )}
    </>
  );
}

export default RestoreUserTab;
