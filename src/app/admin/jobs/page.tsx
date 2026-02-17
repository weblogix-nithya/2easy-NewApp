'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import AdminJobs from '@/components/jobs/AdminJobs';
import CustomerJobs from '@/components/jobs/CustomerJobs';

export default function JobsPage() {
  const { isAdmin, isCustomer } = useSelector(
    (state: RootState) => state.user
  );

  // if (loading) return <div>Loading...</div>;

  if (isAdmin) return <AdminJobs />;
  if (isCustomer) return <CustomerJobs />;

  return <div>No access</div>;
}
