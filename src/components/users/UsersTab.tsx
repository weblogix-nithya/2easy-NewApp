import PaginationTable from "@/components/table/PaginationTable";
import React from "react";

interface UsersTabProps {
  loading: boolean;
  error: any;
  columns: any;
  users: any;
  queryPageIndex: number;
  queryPageSize: number;
  setQueryPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setQueryPageSize: React.Dispatch<React.SetStateAction<number>>;
}

function UsersTab({
  error,
  columns,
  users,
  loading,
  queryPageIndex,
  queryPageSize,
  setQueryPageIndex,
  setQueryPageSize,
}: UsersTabProps) {
  // console.log(users.users.data,'us')
  return (
    <>
      {!loading && !error && users?.users?.data?.length > 0 && (
        <PaginationTable
          columns={columns}
          data={users?.users?.data}
          options={{
            initialState: {
              pageIndex: queryPageIndex,
              pageSize: queryPageSize,
            },
            manualPagination: true,
            pageCount: users?.users?.paginatorInfo.lastPage,
          }}
          path="/admin/users"
          setQueryPageIndex={setQueryPageIndex}
          setQueryPageSize={setQueryPageSize}
          isServerSide
        />
      )}
    </>
  );
}

export default UsersTab;
