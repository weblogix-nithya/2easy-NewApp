'use client';
import { Td, Text, Tr } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDate } from "@/lib/helpers/helper";

export function JobBulkAssignRow(props: { columns: any[]; item: any }) {
  const { columns, item } = props;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.original.job.id }); // ✅ must match SortableContext ids

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <Tr ref={setNodeRef} style={style} {...attributes}>
      {columns.map((column) => {
        // First column (order/drag handle) — attach listeners only here
        const isHandleColumn = column.id === "order";

        return (
          <Td key={column.id} {...(isHandleColumn ? listeners : {})}>
            {column.cell ? (
              column.cell({ row: item })  // ✅ lowercase .cell matches your config
            ) : column?.type === "date" ? (
              <Text>
                {item.original.job[column.accessor]
                  ? formatDate(item.original.job[column.accessor], "DD/MM/YYYY")
                  : "-"}
              </Text>
            ) : (
              <Text>{item.original.job[column.accessor] ?? "-"}</Text>
            )}
          </Td>
        );
      })}
    </Tr>
  );
}