import { IconButton, Tooltip } from "@mui/material";

export default function ControlButton({
  title,
  onClick,
  children,
  disabled = false,
}) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton onClick={onClick} color="primary" disabled={disabled}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}
