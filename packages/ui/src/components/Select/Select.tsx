import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";
import { TextField } from "../TextField/TextField";
import type { TextFieldProps } from "../TextField/TextField";

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends Omit<TextFieldProps, "select"> {
  options?: SelectOption[];
}

export function Select({ children, options, ...props }: SelectProps) {
  return (
    <TextField select {...props}>
      {options?.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </MenuItem>
      ))}
      {children}
    </TextField>
  );
}

export { MenuItem };
