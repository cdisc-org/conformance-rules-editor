import { Button } from "@mui/material";

interface Props {
  accept: string;
  id: string;
  label: string;
  setFile: (file: File) => void;
}

export default function FileInput(props: Props) {
  const { accept, id, label, setFile } = props;

  const handleFileSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (event.currentTarget.files.length) {
      setFile(event.currentTarget.files[0]);
    }
  };

  const handleClick = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    event.currentTarget.value = null;
  };

  return (
    <Button variant="contained" component="label">
      {label}
      <input
        accept={accept}
        key={id}
        type="file"
        onChange={handleFileSelected}
        onClick={handleClick}
        hidden
      />
    </Button>
  );
}
