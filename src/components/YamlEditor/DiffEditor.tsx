import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
import AppContext from "../AppContext";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { IHistory } from "../../types/IHistory";

const VersionSelector = ({
  name,
  children,
  value,
  setter,
  versionsAsObject,
}: {
  name: string;
  children: IHistory[];
  value: string;
  setter: Dispatch<SetStateAction<IHistory>>;
  versionsAsObject: { [changed: string]: IHistory };
}) => {
  const { dataService, unmodifiedRule } = useContext(AppContext);

  const onChange = (
    version: string,
    setter: Dispatch<SetStateAction<IHistory>>
  ) => {
    const child = versionsAsObject[version];
    if (child.content) {
      setter(child);
    } else {
      dataService
        .get_rule(unmodifiedRule.id, child.changed)
        .then((responseJson: IHistory) => {
          child.content = responseJson.content;
          setter(child);
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
  const {
    dataService,
    modifiedRule,
    setModifiedRule,
    unmodifiedRule,
    user,
  } = useContext(AppContext);

  const CURRENT_MODIFIED = {
    changed: "Current Modified",
    creator: user ? user : { id: "", name: "" },
    content: modifiedRule,
  };
  const [base, setBase] = useState<IHistory>(CURRENT_MODIFIED);
  const [compare, setCompare] = useState<IHistory>(CURRENT_MODIFIED);
  const versions = [CURRENT_MODIFIED, ...unmodifiedRule.history];
  const versionsAsObject = versions.reduce(
    (previousValue, currentValue) => ({
      ...previousValue,
      [currentValue.changed]: currentValue,
    }),
    {}
  );

  useEffect(() => {
    if (unmodifiedRule.history.length) {
      dataService
        .get_rule(unmodifiedRule.id, unmodifiedRule.history[0].changed)
        .then((responseJson: IHistory) => {
          unmodifiedRule.history[0].content = responseJson.content;
          setBase(unmodifiedRule.history[0]);
        });
    }
    setCompare(CURRENT_MODIFIED);
  }, [unmodifiedRule]);

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <VersionSelector
          name="Base"
          value={base.changed}
          setter={setBase}
          versionsAsObject={versionsAsObject}
        >
          {versions}
        </VersionSelector>
        <VersionSelector
          name="Compare"
          value={compare.changed}
          setter={setCompare}
          versionsAsObject={versionsAsObject}
        >
          {versions}
        </VersionSelector>
      </Grid>
      <MonacoDiffEditor
        language="yaml"
        original={versionsAsObject[base.changed]?.content ?? ""}
        value={versionsAsObject[compare.changed]?.content ?? ""}
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
