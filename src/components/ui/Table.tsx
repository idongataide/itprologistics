import * as React from "react";
import { cn } from "../../lib/utils";

export interface ColumnDefinition<T> {
  title: string;
  dataIndex: keyof T | (string | number)[];
  key: string;
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  rowsPerPage?: number;
  onRowClick?: (id: string) => void;
  className?: string;
  showActions?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  loading?: boolean;
}

const getValue = (obj: any, path: keyof any | (string | number)[]): any => {
  if (Array.isArray(path)) {
    return path.reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), obj);
  } else {
    return obj[path];
  }
};

const Table = <T extends { id: string }>({
  columns,
  data,
  onRowClick,
  className,
  showActions = true,
  pagination,
  loading,
  ...props
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "w-full text-sm  ",
          className
        )}
        {...props}
      >
        <thead className="bg-[#F9FAFB]">
          <tr className="text-[#F9FAFB]">
            {/* <th className="px-4 py-3 text-left font-medium w-8 border-b mb-0 border-[#E5E9F0] ">
              <input type="checkbox" className="rounded border-gray-300" />
            </th> */}
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={cn("px-7 py-3 text-left text-nowrap capitalize text-[#667085] border-b mb-0 border-[#E5E9F0] font-medium", column.className)}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row.id} className="bg-white hover:bg-gray-50">
                {/* <td className="px-4 py-4 border-b mb-0 border-[#E5E9F0]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td> */}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    onClick={() => onRowClick?.(row.id)}
                    className={cn(
                      "px-7 py-5 text-[#667085]  border-b mb-0 capitalize border-[#E5E9F0] font-normal",
                      {
                        "cursor-pointer": onRowClick,
                      },
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(getValue(row, column.dataIndex), row, rowIndex)
                      : getValue(row, column.dataIndex) as any ?? "-"}
                  </td>
                ))}
              
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (showActions ? 2 : 1)} className="px-4  capitalize py-3 text-center">
                {loading ? 'Loading...' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="flex justify-center items-center gap-1 mt-4">
          {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => pagination.onChange(page, pagination.pageSize)}
              className={cn(
                "px-3 py-1 rounded-md text-sm cursor-pointer",
                page === pagination.current
                  ? "bg-[#FFF0EA] font-medium text-[#FF6C2D]"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { Table }; 