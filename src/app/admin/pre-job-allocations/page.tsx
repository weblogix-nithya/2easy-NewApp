'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import AdminPreJobs from '@/components/preJobAllocation/AdminPreJobs';

export default function PreJobAllocationsPage() {
  const { isAdmin, isSubAdmin, isCustomer } = useSelector(
    (state: RootState) => state.user
  );
  const isAdminUser = isAdmin || isSubAdmin;

  // if (loading) return <div>Loading...</div>;

  if (isAdminUser) return <AdminPreJobs />;

  return <div>No access</div>;
}
