import { useContext, useState } from "react";
import AppContext from "../AppContext";
import PromptDialog from "../PromptDialog/PromptDialog";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
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
  } = useContext(AppContext);

  const newRule = () => {
    setSelectedRule(null);
    setUnmodifiedRule("");
    setModifiedRule("");
  };

  const saveRule = async () => {
    if (isRuleSelected()) {
      //Patchrule
      await dataService
        .patch_rule(selectedRule, modifiedRule)
        .then(function (response) {
          return response.json();
        })
        .then(function (responseJson) {
          return JSON.parse(responseJson.body);
        });
    } else {
      //Postrule
      const newSelectedRule = await dataService
        .post_rule(modifiedRule)
        .then(function (response) {
          return response.json();
        })
        .then(function (responseJson) {
          return JSON.parse(responseJson.body).data.id;
        });
      setSelectedRule(newSelectedRule);
    }
    setUnmodifiedRule(modifiedRule);
    setDirtyExplorerList(true);
    setAlertState({ message: "Saved successfully", severity: "success" });
  };

  const discardChanges = () => {
    setModifiedRule(unmodifiedRule);
  };

  const deleteRule = async () => {
    const statusCode = await dataService
      .delete_rule(selectedRule)
      .then(function (response) {
        return response.json();
      })
      .then(function (responseJson) {
        return JSON.parse(responseJson.body);
      });
    if (statusCode === 204) {
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
            >
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Save Rule">
          <span>
            <IconButton disabled={!isRuleDirty()} onClick={saveRule}>
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Discard Changes">
          <span>
            <IconButton
              disabled={!isRuleDirty()}
              onClick={() => setDiscardDialog(true)}
            >
              <RestoreIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Delete Rule">
          <span>
            <IconButton
              disabled={!isRuleSelected()}
              onClick={() => setDeleteDialog(true)}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>

        <QuickSearchToolbar label="Search YAML..." queryParam={"body.value"} />
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
