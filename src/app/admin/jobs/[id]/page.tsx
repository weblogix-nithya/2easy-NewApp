"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import AdminEditJobs from "@/components/jobs/AdminEditJob";
import CustomerEditJobs from "@/components/jobs/CustomerEditJob";

function page() {
  const { isAdmin, isSubAdmin, isCustomer } = useSelector(
    (state: RootState) => state.user,
  );
  const isAdminUser = isAdmin || isSubAdmin;
  console.log(isAdmin, isSubAdmin, isCustomer, "admin, subadmin, customer");

  if (isAdminUser) return <AdminEditJobs />;
  if (isCustomer) return <CustomerEditJobs />;

  return <div>No access</div>;
}
export default page;