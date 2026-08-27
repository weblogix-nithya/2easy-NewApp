"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import AdminEditQuote from "@/components/quote/AdminEditQuote";
// import CustomerEditJobs from "@/components/jobs/CustomerEditJob";

function page() {
  const { isAdmin, isSubAdmin, isCustomer } = useSelector(
    (state: RootState) => state.user,
  );
  const isAdminUser = isAdmin || isSubAdmin;
  console.log(isAdmin, isSubAdmin, isCustomer, "admin, subadmin, customer");

//   if (isAdminUser) return <AdminEditQuote />;
//   if (isCustomer) return <CustomerEditJobs />;

return <AdminEditQuote />
//   return <div>No access</div>;
}
export default page;
