'use client';

import { Box } from '@chakra-ui/react';
import ActionBar from 'components/jobs/ActionBar';

interface ActionBarWrapperProps {
  isAdmin: boolean;
  loading: boolean;
  selectedJobs: any[];
  onSwitch: (checked: boolean) => void;
  onClickBulkAssign: () => void;
  onClickBulkSort: () => void;
}

const ActionBarWrapper = ({
  isAdmin,
  loading,
  selectedJobs,
  onSwitch,
  onClickBulkAssign,
  onClickBulkSort,
}: ActionBarWrapperProps) => {
  if (!isAdmin || loading) return null;

  return (
    <Box>
      <ActionBar
        selectedJobs={selectedJobs}
        onSwitch={onSwitch}
        onClickBulkAssign={onClickBulkAssign}
        onClickBulkSort={onClickBulkSort}
      />
    </Box>
  );
};

export default ActionBarWrapper;
