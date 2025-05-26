declare module "@/components/ui/table" {
  import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, TableHTMLAttributes } from "react"
  
  export const Table: React.ForwardRefExoticComponent<TableHTMLAttributes<HTMLTableElement> & React.RefAttributes<HTMLTableElement>>
  export const TableHeader: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>
  export const TableBody: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>
  export const TableFooter: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>
  export const TableHead: React.ForwardRefExoticComponent<ThHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>
  export const TableRow: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableRowElement> & React.RefAttributes<HTMLTableRowElement>>
  export const TableCell: React.ForwardRefExoticComponent<TdHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>
  export const TableCaption: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableCaptionElement> & React.RefAttributes<HTMLTableCaptionElement>>
} 