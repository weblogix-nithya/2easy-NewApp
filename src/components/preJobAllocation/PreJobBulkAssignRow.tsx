import { formatDate } from "@/lib/helpers/helper";
import React, { memo } from "react";
import { MdDragIndicator } from "react-icons/md";

interface JobBulkAssignRowProps {
  columns: any[];
  item: any;
  gridTemplateColumns: string;
  isDragging?: boolean;
}

export const ROW_HEIGHT_PX = 74;
const ROW_HEIGHT = `${ROW_HEIGHT_PX}px`;

const CELL_BASE_STYLE: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: "0.75rem",
  borderBottom: "1px solid #EDF2F7",
  textAlign: "left",
  height: ROW_HEIGHT,
  maxHeight: ROW_HEIGHT,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  width: "100%",
};

const CELL_CONTENT_WRAPPER_STYLE: React.CSSProperties = {
  minWidth: 0,
  width: "100%",
  overflow: "hidden",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

function renderCell(column: any, item: any): React.ReactNode {
  const CellComponent = column?.cell;
  if (CellComponent) return <CellComponent row={item} />;
  const key = column?.accessor ?? column?.id;
  if (column?.type === "date") {
    const value = item?.original?.job?.[key];
    return value ? formatDate(value, "DD/MM/YYYY") : "-";
  }
  return item?.original?.job?.[key] ?? "-";
}

export const JobBulkAssignRow = memo(function JobBulkAssignRow({
  columns,
  item,
  gridTemplateColumns,
  isDragging,
}: JobBulkAssignRowProps) {
  const firstColumn = columns[0];
  const restColumns = columns.slice(1);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns,
        background: "white",
      }}
    >
      <div
        style={{
          ...CELL_BASE_STYLE,
          position: isDragging ? "relative" : "sticky",
          left: 0,
          background: "white",
          zIndex: 2,
          boxShadow: "2px 0 4px -2px rgba(0,0,0,0.15)",
        }}
      >
        <div
          data-drag-handle="true"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            minHeight: "28px",
            width: "100%",
          }}
        >
          <MdDragIndicator
            style={{ color: "#999", fontSize: "18px", flexShrink: 0 }}
          />
          {renderCell(firstColumn, item)}
        </div>
      </div>

      {restColumns.map((column) => (
        <div key={column?.id} style={CELL_BASE_STYLE}>
          <div style={CELL_CONTENT_WRAPPER_STYLE}>
            {renderCell(column, item)}
          </div>
        </div>
      ))}
    </div>
  );
});

JobBulkAssignRow.displayName = "JobBulkAssignRow";

export default JobBulkAssignRow;