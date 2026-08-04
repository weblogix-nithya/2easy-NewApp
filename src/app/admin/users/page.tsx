"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import UserList from "./UserList";

export default function UsersPage() {
  const { isAdmin, isSubAdmin } = useSelector((state: RootState) => state.user);
  const isAdminUser = isAdmin || isSubAdmin;
  if (isAdminUser) return <UserList />;
  return <div>No access</div>;
}
