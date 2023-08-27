import { Dispatch, SetStateAction, useContext, useState } from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
import AppContext from "../AppContext";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { IHistory } from "../../types/IHistory";

const VersionSelector = ({
  name,
  children,
  value,
  setter,
}: {
  name: string;
  children: IHistory[];
  value: string;
  setter: Dispatch<SetStateAction<IHistory>>;
}) => {
  const { dataService, unmodifiedRule } = useContext(AppContext);
  const childrenAsObject = children.reduce(
    (previousValue, currentValue) => ({
      ...previousValue,
      [currentValue.changed]: currentValue,
    }),
    {}
  );
  const onChange = (
    version: string,
    setter: Dispatch<SetStateAction<IHistory>>
  ) => {
    const child = childrenAsObject[version];
    if (child.content) {
      setter(child);
    } else {
      dataService
        .get_rule(unmodifiedRule.id, child.changed)
        .then((responseJson: IHistory) => {
          setter(responseJson);
        });
    }
  };

  return (
    <Grid item>
      <FormControl variant="standard">
        <InputLabel id={`${name}-label`}>{`${name}`}</InputLabel>
        <Select
          labelId={`${name}-label`}
          id={`${name}-select`}
          value={value}
          label={`${name}`}
          onChange={(event) => onChange(event.target.value as string, setter)}
        >
          {children.map((child) => (
            <MenuItem key={`${name}-${child.changed}`} value={child.changed}>
              {`${
                isNaN(Date.parse(child.changed))
                  ? child.changed
                  : new Date(child.changed).toLocaleString("en-US")
              } - ${child.creator.name}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};

export default function YamlEditor() {
  const { modifiedRule, setModifiedRule, unmodifiedRule, user } = useContext(
    AppContext
  );

  const CURRENT_MODIFIED = {
    changed: "Current Modified",
    creator: user ? user : { id: "", name: "" },
    content: modifiedRule,
  };
  const [base, setBase] = useState<IHistory>(
    unmodifiedRule.history.length ? unmodifiedRule.history[0] : CURRENT_MODIFIED
  );
  const [compare, setCompare] = useState<IHistory>(CURRENT_MODIFIED);
  const versions = [CURRENT_MODIFIED, ...unmodifiedRule.history];

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <VersionSelector name="Base" value={base.changed} setter={setBase}>
          {versions}
        </VersionSelector>
        <VersionSelector
          name="Compare"
          value={compare.changed}
          setter={setCompare}
        >
          {versions}
        </VersionSelector>
      </Grid>
      <MonacoDiffEditor
        language="yaml"
        original={base.content}
        value={compare.content}
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
