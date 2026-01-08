import { useContext, useState, MouseEvent } from "react";
import AppContext from "../AppContext";
import PromptDialog from "../PromptDialog/PromptDialog";
import { Menu, Toolbar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";
import jsYaml from "js-yaml";
import ExportRulesCSV from "./ExportRulesCSV";
import ExportArtifacts from "./ExportArtifacts";
import ExportRulesYAML from "./ExportRulesYAML";
import ControlButton from "./ControlButton";

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
    setDirtyExplorerList,
    isRuleDirty,
    setAlertState,
    isRuleModifiable,
    overwriteRuleDialog,
    setOverwriteRuleDialog,
    existingRuleToOverwrite,
    setExistingRuleToOverwrite,
  } = useContext(AppContext);

  const newRule = () => {
    setSelectedRule(null);
    setUnmodifiedRule({ content: ruleTemplate, history: [] });
    setModifiedRule(ruleTemplate);
  };

 const saveRule = async () => {
  if (isRuleSelected()) {
    // Check if the currently selected rule is published
    try {
      const currentRule = await dataService.get_rule(selectedRule);
      
      if (currentRule && currentRule.json?.Core?.Status === "Published") {
        setExistingRuleToOverwrite(selectedRule);
        setOverwriteRuleDialog(true);
        return; // Exit and wait for user confirmation
      }
    } catch (error) {
      console.error("Error checking rule status:", error);
    }
    const rule = await dataService.patch_rule(selectedRule, modifiedRule);
    setModifiedRule(rule.content);
    setUnmodifiedRule(rule);
  } else {
    //Postrule
    const newSelectedRule = await dataService.post_rule(modifiedRule);
    setSelectedRule(newSelectedRule);
  }
  setDirtyExplorerList(true);
  setAlertState({ message: "Saved successfully", severity: "success" });
};

const performOverwriteSave = async () => {
  if (existingRuleToOverwrite) {
    try {
      const rule = await dataService.patch_rule(existingRuleToOverwrite, modifiedRule);
      setSelectedRule(existingRuleToOverwrite);
      setModifiedRule(rule.content);
      setUnmodifiedRule(rule);
      setExistingRuleToOverwrite(null);
      setDirtyExplorerList(true);
      setAlertState({ message: "Saved successfully", severity: "success" });
    } catch (error) {
      console.error("Error overwriting rule:", error);
      setAlertState({ message: "Failed to overwrite rule", severity: "error" });
    }
  }
};

  const discardChanges = () => {
    setModifiedRule(unmodifiedRule.content);
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
      setUnmodifiedRule(rule);
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

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const open = Boolean(exportAnchorEl);
  const handleExport = (event: MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };
  const handleExportClose = () => {
    setExportAnchorEl(null);
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
        <ControlButton
          title="New Rule"
          disabled={isRuleDirty() || !isRuleSelected() || !isRuleModifiable()}
          onClick={newRule}
        >
          <AddIcon />
        </ControlButton>
        <ControlButton
          title="Save Rule"
          disabled={!isRuleDirty() || !isRuleModifiable()}
          onClick={saveRule}
        >
          <SaveIcon />
        </ControlButton>
        <ControlButton
          title="Discard Changes"
          disabled={!isRuleDirty()}
          onClick={() => setDiscardDialog(true)}
        >
          <RestoreIcon />
        </ControlButton>
        <ControlButton
          title="Delete Rule"
          disabled={!isRuleSelected() || !isRuleModifiable()}
          onClick={() => setDeleteDialog(true)}
        >
          <DeleteIcon />
        </ControlButton>
        <ControlButton
          title={"Publish Rule"}
          disabled={isRuleDirty() || !isRuleSelected() || !isRuleModifiable()}
          onClick={publishRule}
        >
          <PublishIcon />
        </ControlButton>
        <ControlButton title={"Export..."} onClick={handleExport}>
          <FileDownloadIcon />
        </ControlButton>
        <Menu
          id="export-menu"
          anchorEl={exportAnchorEl}
          open={open}
          onClose={handleExportClose}
        >
          <ExportArtifacts onClose={handleExportClose} />
          <ExportRulesCSV onClose={handleExportClose} />
          <ExportRulesYAML onClose={handleExportClose} />
        </Menu>

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
      <PromptDialog
        contentText={`You are about to overwrite a published rule (Core ID: ${unmodifiedRule.json?.Core?.Id}). Do you want to continue?`}
        open={overwriteRuleDialog}
        setOpen={setOverwriteRuleDialog}
        handleOkay={performOverwriteSave}
      />
    </>
  );
}
