import { Button } from "@mui/material";
import { ChangeEventHandler } from "react";

interface Props {
  id: string;
  label: string;
  onChange: ChangeEventHandler;
}

export default function FileInput(props: Props) {
  const { id, label, onChange } = props;

  return (
    <Button variant="contained" component="label">
      {label}
      <input key={id} type="file" onChange={onChange} hidden />
    </Button>
  );
}
