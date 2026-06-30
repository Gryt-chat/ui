import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import type { AccordionProps as MuiAccordionProps } from "@mui/material/Accordion";
import type {
  AccordionDetailsProps,
  AccordionSummaryProps
} from "@mui/material";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type AccordionProps = MuiAccordionProps;

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    { className, disableGutters = true, elevation = 0, ...props },
    ref
  ) {
    return (
      <MuiAccordion
        ref={ref}
        disableGutters={disableGutters}
        elevation={elevation}
        className={cn("gryt-accordion", className)}
        {...props}
      />
    );
  }
);

export function AccordionSummary({
  className,
  ...props
}: AccordionSummaryProps) {
  return (
    <MuiAccordionSummary
      className={cn("gryt-accordion-summary", className)}
      {...props}
    />
  );
}

export function AccordionDetails({
  className,
  ...props
}: AccordionDetailsProps) {
  return (
    <MuiAccordionDetails
      className={cn("gryt-accordion-details", className)}
      {...props}
    />
  );
}
