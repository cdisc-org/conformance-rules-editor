import { useContext, useState } from "react";
import AppContext from "../AppContext";
import PromptDialog from "../PromptDialog/PromptDialog";
import { IconButton, Toolbar, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";
import jsYaml from "js-yaml";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
    syntaxCheck,
    schemaCheck,
    jsonCheck,
    loadDefineXMLCheck,
    loadDatasetsCheck,
    testCheck,
  } = useContext(AppContext);

  const newRule = () => {
    setSelectedRule(null);
    setUnmodifiedRule({ content: ruleTemplate, history: [] });
    setModifiedRule(ruleTemplate);
  };

  const saveRule = async () => {
    if (isRuleSelected()) {
      //Patchrule
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

  const exportArtifacts = async () => {
    const zip = new JSZip();
    zip.file("Rule.yml", modifiedRule);
    zip.file(
      "Rule_spaces.json",
      JSON.stringify(syntaxCheck.details[0].details, null, 4)
    );
    zip.file(
      "Schema_Validation.json",
      JSON.stringify(schemaCheck.details[0].details, null, 4)
    );
    zip.file(
      "Rule_underscores.json",
      JSON.stringify(jsonCheck.details[0].details, null, 4)
    );
    zip.file("Define.xml", loadDefineXMLCheck.details[1]?.details ?? "");
    zip.file("Datasets.xlsx", loadDatasetsCheck.details[0]?.details ?? "");
    zip.file(
      "Datasets.json",
      JSON.stringify(loadDatasetsCheck.details[1]?.details ?? "", null, 4)
    );
    zip.file(
      "Request.json",
      JSON.stringify(testCheck.details[1]?.details ?? "", null, 4)
    );
    zip.file(
      "Results.json",
      JSON.stringify(testCheck.details[3]?.details ?? "", null, 4)
    );

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "Rule.zip");
    });
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

        <Tooltip title={"Export Artifacts"}>
          <span>
            <IconButton onClick={exportArtifacts} color="primary">
              <FileDownloadIcon />
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
