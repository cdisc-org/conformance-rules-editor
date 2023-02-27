import { useContext, useState } from "react";
import AppContext from "../AppContext";
import PromptDialog from "../PromptDialog/PromptDialog";
import { IconButton, Toolbar, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";
import jsYaml from "js-yaml";

export default function Controls() {
  const [discardDialog, setDiscardDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const {
    dataService,
    ruleTemplate,
    selectedRule,
    setSelectedRule,
    isRuleSelected,
    unmodifiedRule,
    setUnmodifiedRule,
    modifiedRule,
    setModifiedRule,
    setMonacoInputValue,
    setDirtyExplorerList,
    isRuleDirty,
    setAlertState,
    isRuleModifiable,
  } = useContext(AppContext);

  const newRule = () => {
    setSelectedRule(null);
    setUnmodifiedRule(ruleTemplate);
    setModifiedRule(ruleTemplate);
    setMonacoInputValue({ value: ruleTemplate });
  };

  const saveRule = async () => {
    if (isRuleSelected()) {
      //Patchrule
      const rule = await dataService.patch_rule(selectedRule, modifiedRule);
      setModifiedRule(rule.content);
      setMonacoInputValue({ value: rule.content });
      setUnmodifiedRule(rule.content);
    } else {
      //Postrule
      const newSelectedRule = await dataService.post_rule(modifiedRule);
      setSelectedRule(newSelectedRule);
    }
    setDirtyExplorerList(true);
    setAlertState({ message: "Saved successfully", severity: "success" });
  };

  const discardChanges = () => {
    setModifiedRule(unmodifiedRule);
    setMonacoInputValue({ value: unmodifiedRule });
  };

  const deleteRule = async () => {
    const res: Response = await dataService.delete_rule(selectedRule);
    if (res.status === 204) {
      newRule();
      setDirtyExplorerList(true);
      setAlertState({
        message: "Deleted rule successfully",
        severity: "success",
      });
    } else {
      setAlertState({ message: "Rule not deleted", severity: "error" });
    }
  };

  const publishRule = async () => {
    try {
      jsYaml.load(modifiedRule);
      const rule = await dataService.publish_rule(selectedRule);
      setModifiedRule(rule.content);
      setMonacoInputValue({ value: rule.content });
      setUnmodifiedRule(rule.content);
      setDirtyExplorerList(true);
      setAlertState({
        message: "Published successfully",
        severity: "success",
      });
    } catch (yamlException) {
      setAlertState({
        message: `Rule not published: ${yamlException.message}`,
        severity: "error",
      });
    }
  };

  return (
    <>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          bgcolor: "#DDEEFF",
        }}
      >
        <Tooltip title="New Rule">
          <span>
            <IconButton
              disabled={
                isRuleDirty() || !isRuleSelected() || !isRuleModifiable()
              }
              onClick={newRule}
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Save Rule">
          <span>
            <IconButton
              disabled={!isRuleDirty() || !isRuleModifiable()}
              onClick={saveRule}
              color="primary"
            >
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Discard Changes">
          <span>
            <IconButton
              disabled={!isRuleDirty()}
              onClick={() => setDiscardDialog(true)}
              color="primary"
            >
              <RestoreIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Delete Rule">
          <span>
            <IconButton
              disabled={!isRuleSelected() || !isRuleModifiable()}
              onClick={() => setDeleteDialog(true)}
              color="primary"
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={"Publish Rule"}>
          <span>
            <IconButton
              disabled={
                isRuleDirty() || !isRuleSelected() || !isRuleModifiable()
              }
              onClick={publishRule}
              color="primary"
            >
              <PublishIcon />
            </IconButton>
          </span>
        </Tooltip>

        <QuickSearchToolbar label="Search YAML..." queryParam={"content"} />
      </Toolbar>

      <PromptDialog
        contentText="Discard changes?"
        open={discardDialog}
        setOpen={setDiscardDialog}
        handleOkay={discardChanges}
      />
      <PromptDialog
        contentText="Delete selected rule?"
        open={deleteDialog}
        setOpen={setDeleteDialog}
        handleOkay={deleteRule}
      />
    </>
  );
}
