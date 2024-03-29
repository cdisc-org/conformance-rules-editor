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
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { DataService } from "../../services/DataService";
import { IRule } from "../../types/IRule";

const fetchRuleVersion = async (
  version: IRule,
  dataService: DataService,
  setter: Dispatch<SetStateAction<IRule>>
) => {
  if (version.content) {
    setter(version);
  } else {
    const rule = await dataService.get_history(version.id);
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
  children: Map<string, IRule>;
  value: string;
  setter: Dispatch<SetStateAction<IRule>>;
}) => {
  const { dataService } = useContext(AppContext);

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
              children.get(event.target.value),
              dataService,
              setter
            )
          }
        >
          {[...children.values()].map((child) => (
            <MenuItem key={`${name}-${child.created}`} value={child.created}>
              {`${
                isNaN(Date.parse(child.created))
                  ? child.created
                  : new Date(child.created).toLocaleString("en-US")
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
    isRuleDirty,
    modifiedRule,
    setModifiedRule,
    unmodifiedRule,
    user,
  } = useContext(AppContext);

  const CURRENT_MODIFIED = useMemo(
    () => ({
      created: "Current Modified",
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
          history.created,
          history,
        ])
      )
    );
    if (unmodifiedRule.history.length) {
      fetchRuleVersion(unmodifiedRule.history[0], dataService, setBase);
    }
  }, [CURRENT_MODIFIED, dataService, unmodifiedRule]);
  const [base, setBase] = useState<IRule>(CURRENT_MODIFIED);
  const [compare, setCompare] = useState<IRule>(CURRENT_MODIFIED);
  const [versions, setVersions] = useState<Map<string, IRule>>(
    new Map([[CURRENT_MODIFIED.created, CURRENT_MODIFIED]])
  );

  const restoreVersion = () => {
    setModifiedRule(base.content);
  };

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Stack direction="row" spacing={1}>
          <Tooltip title="Restore Base Version">
            <span>
              <IconButton
                disabled={isRuleDirty()}
                onClick={restoreVersion}
                color="primary"
              >
                <RestoreIcon />
              </IconButton>
            </span>
          </Tooltip>
          <VersionSelector name="Base" value={base.created} setter={setBase}>
            {versions}
          </VersionSelector>
        </Stack>
        <VersionSelector
          name="Compare"
          value={compare.created}
          setter={setCompare}
        >
          {versions}
        </VersionSelector>
      </Grid>
      <MonacoDiffEditor
        language="yaml"
        original={base.content ?? ""}
        value={compare.content ?? ""}
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
