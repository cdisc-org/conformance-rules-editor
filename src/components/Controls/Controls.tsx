import { useContext, useState } from "react";
import AppContext from "../AppContext";
import PromptDialog from "../PromptDialog/PromptDialog";
import { IconButton, Toolbar, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";

export default function Controls() {
  const [discardDialog, setDiscardDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const {
    dataService,
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
  } = useContext(AppContext);

  const newRule = () => {
    setSelectedRule(null);
    setUnmodifiedRule("");
    setModifiedRule("");
  };

  const saveRule = async () => {
    if (isRuleSelected()) {
      //Patchrule
      const rule = await dataService.patch_rule(selectedRule, modifiedRule);
      setModifiedRule(rule.content);
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
              disabled={isRuleDirty() || !isRuleSelected()}
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
              disabled={!isRuleDirty()}
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
