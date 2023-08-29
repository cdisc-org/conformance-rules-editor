import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
import AppContext from "../AppContext";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { IHistory } from "../../types/IHistory";
import { DataService } from "../../services/DataService";
import { IRule } from "../../types/IRule";

const fetchRuleVersion = async (
  unmodifiedRule: IRule,
  version: IHistory,
  dataService: DataService,
  setter: Dispatch<SetStateAction<IHistory>>
) => {
  if (version.content) {
    setter(version);
  } else {
    const rule = await dataService.get_rule(unmodifiedRule.id, version.changed);
    version.content = rule.content;
    setter(version);
  }
};

const VersionSelector = ({
  name,
  children,
  value,
  setter,
}: {
  name: string;
  children: Map<string, IHistory>;
  value: string;
  setter: Dispatch<SetStateAction<IHistory>>;
}) => {
  const { dataService, unmodifiedRule } = useContext(AppContext);

  return (
    <Grid item>
      <FormControl variant="standard">
        <InputLabel id={`${name}-label`}>{`${name}`}</InputLabel>
        <Select
          labelId={`${name}-label`}
          id={`${name}-select`}
          value={value}
          label={`${name}`}
          onChange={(event) =>
            fetchRuleVersion(
              unmodifiedRule,
              children.get(event.target.value),
              dataService,
              setter
            )
          }
        >
          {[...children.values()].map((child) => (
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

  const CURRENT_MODIFIED = useMemo(
    () => ({
      changed: "Current Modified",
      creator: user ? user : { id: "", name: "" },
      content: modifiedRule,
    }),
    [user, modifiedRule]
  );
  useEffect(() => {
    setBase(CURRENT_MODIFIED);
    setCompare(CURRENT_MODIFIED);
    setVersions(
      new Map(
        [CURRENT_MODIFIED, ...unmodifiedRule.history].map((history) => [
          history.changed,
          history,
        ])
      )
    );
    if (unmodifiedRule.history.length) {
      fetchRuleVersion(
        unmodifiedRule,
        unmodifiedRule.history[0],
        dataService,
        setBase
      );
    }
  }, [CURRENT_MODIFIED, dataService, unmodifiedRule]);
  const [base, setBase] = useState<IHistory>(CURRENT_MODIFIED);
  const [compare, setCompare] = useState<IHistory>(CURRENT_MODIFIED);
  const [versions, setVersions] = useState<Map<string, IHistory>>(
    new Map([[CURRENT_MODIFIED.changed, CURRENT_MODIFIED]])
  );

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
        original={versions.get(base.changed)?.content ?? ""}
        value={versions.get(compare.changed)?.content ?? ""}
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
