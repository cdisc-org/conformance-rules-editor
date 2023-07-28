import { useContext, useState } from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
import AppContext from "../AppContext";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";

const VersionSelector = ({
  name,
  children,
  value,
  onChange,
}: {
  name: string;
  children: string[];
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <Grid item>
      <FormControl variant="standard">
        <InputLabel id={`${name}-label`}>{`${name}`}</InputLabel>
        <Select
          labelId={`${name}-label`}
          id={`${name}-select`}
          value={value}
          label={`${name}`}
          onChange={(event) => onChange(event.target.value as string)}
        >
          {children.map((child) => (
            <MenuItem key={`${name}-${child}`} value={child}>
              {child}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};

export default function YamlEditor() {
  const { modifiedRule, setModifiedRule, unmodifiedRule } = useContext(
    AppContext
  );

  const CURRENT_MODIFIED = "Current Modified";
  const LATEST_SAVED = "Latest Saved";

  const [base, setBase] = useState<string>(LATEST_SAVED);
  const [compare, setCompare] = useState<string>(CURRENT_MODIFIED);

  const versionNames = [CURRENT_MODIFIED, LATEST_SAVED];
  const versions = {
    [CURRENT_MODIFIED]: () => modifiedRule,
    [LATEST_SAVED]: () => unmodifiedRule,
  };

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <VersionSelector name="Base" value={base} onChange={setBase}>
          {versionNames}
        </VersionSelector>
        <VersionSelector name="Compare" value={compare} onChange={setCompare}>
          {versionNames}
        </VersionSelector>
      </Grid>
      <MonacoDiffEditor
        language="yaml"
        original={versions[base]()}
        value={versions[compare]()}
        onChange={setModifiedRule}
        theme="vs-dark"
        options={{
          automaticLayout: true,
          wordWrap: "on",
          readOnly: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </>
  );
}
