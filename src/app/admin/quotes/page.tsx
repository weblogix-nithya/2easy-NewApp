'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store'
import QuoteIndex from "./Quotes";

export default function Quotes() {
  const { isAdmin, isSubAdmin } = useSelector(
    (state: RootState) => state.user
  );

  const isAdminUser = isAdmin || isSubAdmin;

  if (isAdminUser) return <QuoteIndex />;

  return <div>No access</div>;
}