import { Badge, Chip } from "@mui/material";
import { ReactElement } from "react";

export default function ResultCount({
  label,
  color,
  count,
}: {
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  count: number;
}): ReactElement {
  return count === undefined || count === 0 ? (
    <></>
  ) : (
    <>
      &nbsp;&nbsp;&nbsp;
      <Badge badgeContent={count.toString()} color={color}>
        <Chip label={label} color={color} variant="outlined" />
      </Badge>
    </>
  );
}
