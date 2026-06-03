'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import AdminJobs from '@/components/jobs/AdminJobs';
import CustomerJobs from '@/components/jobs/CustomerJobs';

export default function JobsPage() {
  const { isAdmin,isSubAdmin, isCustomer } = useSelector(
    (state: RootState) => state.user
  );
  const isAdminUser = isAdmin || isSubAdmin;

  // if (loading) return <div>Loading...</div>;

  if (isAdminUser) return <AdminJobs />;
  if (isCustomer) return <CustomerJobs />;

  return <div>No access</div>;
}
