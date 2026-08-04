import { useMutation } from "@apollo/client/react";
import { useToast } from "@chakra-ui/react";
import PaginationTable from "@/components/table/PaginationTable";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import {
  GET_APPROVAL_USERS_QUERY,
  MUTATION_APPROVE_USER,
} from "@/graphql/user";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useApolloQueryWithEffect } from "@/hooks/useApolloQueryWithEffect";

interface ApprovalRequiredTabProps {
  // approveColumns: any;
  searchQuery: string;
  queryPageIndex: number;
  queryPageSize: number;
  setQueryPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setQueryPageSize: React.Dispatch<React.SetStateAction<number>>;
}

function ApprovalRequiredTab({
  // approveColumns,
  searchQuery,
  queryPageIndex,
  queryPageSize,
  setQueryPageIndex,
  setQueryPageSize,
}: ApprovalRequiredTabProps) {
  const toast = useToast();
  const { isAdmin } = useSelector((state: RootState) => state.user);
  console.log(isAdmin, "re");
  const approveColumns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name" as const,
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "id" as const,
        isApprove: isAdmin,
        meta: {
          isApprove: isAdmin,
        },
      },
    ],
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [handleApproveUser, {}] = useMutation(MUTATION_APPROVE_USER, {
    onCompleted: () => {
      // console.log("APP", _data);
      // Toast()
      toast({
        title: "user is Approved manually",
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
    data: approvalUsers,
  } = useApolloQueryWithEffect(GET_APPROVAL_USERS_QUERY, {
    variables: {
      page: queryPageIndex + 1,
      first: queryPageSize,
      orderByColumn: "id",
      orderByOrder: "ASC",
      query: searchQuery,
      is_approve: false, // 👈 filter for approval required
      without_drivers: true,
    },
    fetchPolicy: "network-only", // ensures always fresh data
  });

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  const handleApprove = (id: any) => {
    handleApproveUser({
      variables: {
        userId: parseInt(id),
      },
    });
  };
  return (
    <>
      {approvalUsers?.users?.data?.length > 0 ? (
        <PaginationTable
          columns={approveColumns}
          data={approvalUsers?.users.data}
          options={{
            initialState: {
              pageIndex: queryPageIndex,
              pageSize: queryPageSize,
            },
            manualPagination: true,
            pageCount: approvalUsers?.users.paginatorInfo.lastPage,
          }}
          onApprove={(id: any) => {
            handleApprove(id);
          }}
          path="/admin/users"
          setQueryPageIndex={setQueryPageIndex}
          setQueryPageSize={setQueryPageSize}
          isServerSide
        />
      ) : (
        <div className="text-center mt-20">No user for manual approval</div>
      )}
    </>
  );
}

export default ApprovalRequiredTab;
