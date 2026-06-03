'use client';
import { Box, Divider, Icon, Switch, Text } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DynamicTableUser } from "@/graphql/dynamicTableUser";
import React from "react";
import { MdMenu } from "react-icons/md";

interface SortableJobTableSettingProps {
  dynamicTableUser: DynamicTableUser;
  onActiveToggle?: () => void;
  onReload?: () => void;
}

export default function SortableJobTableSetting({
  dynamicTableUser,
  onActiveToggle,
  // onReload,
}: SortableJobTableSettingProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: dynamicTableUser.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box key={dynamicTableUser.id} w={"full"} ref={setNodeRef} style={style}>
      <div className="flex justify-between">
        <div className="flex justify-left" {...attributes} {...listeners}>
          <Icon as={MdMenu} h="16px" w="16px" me="8px" mt="auto" mb="auto" />
          <div className="flex flex-col">
            <p>{dynamicTableUser.name}</p>
            <Text className="text-sm text-slate-600" variant="black.500">
              {dynamicTableUser.dynamic_table?.column_description}
            </Text>
          </div>
        </div>
        <Switch
          mt="auto"
          mb="auto"
          isChecked={dynamicTableUser.is_active}
          onChange={(_e) => {
            onActiveToggle();
          }}
        />
      </div>
      <Divider mt="1" />
    </Box>
  );
}
