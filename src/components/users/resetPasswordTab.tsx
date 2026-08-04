import { useMutation } from "@apollo/client/react";
import { useToast } from "@chakra-ui/react";
import PaginationTable from "@/components/table/PaginationTable";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { GET_USERS_QUERY, UPDATE_USER_ACCESS_MUTATION } from "@/graphql/user";
import { parseCookies } from "nookies";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

interface ResetPasswordTabProps {
  searchQuery: string;
  resetColumns: any;
  queryPageIndex: number;
  queryPageSize: number;
  setQueryPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setQueryPageSize: React.Dispatch<React.SetStateAction<number>>;
}

function ResetPasswordTab({
  searchQuery,
  // setSearchQuery,
  resetColumns,
  queryPageIndex,
  queryPageSize,
  setQueryPageIndex,
  setQueryPageSize,
}: ResetPasswordTabProps) {
  const toast = useToast();
  const cookies = parseCookies();

  const { resetApprove } = useSelector((state: RootState) => state.user);

  const canAccessReset =
    resetApprove === true || cookies.reset_approve === "true";
  const [handleResetUser, {}] = useMutation(UPDATE_USER_ACCESS_MUTATION, {
    onCompleted: (_data) => {
      toast({
        title: " password reset access provided for the user successfully",
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
    loading,
    // error,
    data: resetCustomers,
    refetch,
  } = useApolloQueryWithEffect(GET_USERS_QUERY, {
    variables: {
      query: searchQuery,
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderByColumn: "id",
      orderByOrder: "ASC",
    },
    onCompleted: (_data) => {},
  });

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  const handleReset = (id: any) => {
    handleResetUser({
      variables: {
        input: {
          id: parseInt(id), // or just id
          reset_approve: true,
        },
      },
    });
  };
  return (
    <>
      {canAccessReset ? (
        resetCustomers?.users?.data?.length > 0 ? (
          <PaginationTable
            columns={resetColumns}
            data={resetCustomers?.users?.data}
            options={{
              initialState: {
                pageIndex: queryPageIndex,
                pageSize: queryPageSize,
              },
              manualPagination: true,
              pageCount: resetCustomers?.users?.paginatorInfo.lastPage,
            }}
            path="/admin/users"
            onReset={(id: any) => handleReset(id)}
            setQueryPageIndex={setQueryPageIndex}
            setQueryPageSize={setQueryPageSize}
            isServerSide
          />
        ) : (
          <div className="text-center mt-20 text-gray-500">
            No users available for reset.
          </div>
        )
      ) : (
        <div className="text-center mt-20 text-red-500 font-semibold">
          You are not authorized to access this page.
          <br />
          Please contact your administrator for reset privileges.
        </div>
      )}
    </>
  );
}

export default ResetPasswordTab;
