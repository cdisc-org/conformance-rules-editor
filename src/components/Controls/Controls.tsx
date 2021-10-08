import  Button from "@material-ui/core/Button";
import { useContext, useState } from "react";
import AppContext from "../AppContext";
import PromptDialog from "../PromptDialog/PromptDialog";

interface Props {

}

export default function Controls(props: Props) {

    const [discardDialog, setDiscardDialog] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const { dataService, selectedRule, setSelectedRule, isRuleSelected, unmodifiedRule, setUnmodifiedRule, setAutoModifiedRule, userModifiedRule, setDirtyExplorerList, isRuleDirty, setAlertState } = useContext(AppContext);

    const newRule = () => {
        setUnmodifiedRule("");
        setSelectedRule(null);
    }

    const saveRule = async () => {
        if (isRuleSelected()) {
            //Patchrule
            await dataService.patch_rule(selectedRule, userModifiedRule)
                .then(function (response) {
                    return response.json();
                })
                .then(function (responseJson) {
                    return JSON.parse(responseJson.body);
                });
        } else {
            //Postrule
            const newSelectedRule = await dataService.post_rule(userModifiedRule)
                .then(function (response) {
                    return response.json();
                })
                .then(function (responseJson) {
                    return JSON.parse(responseJson.body).data.id;
                });
            setSelectedRule(newSelectedRule);
        }
        setUnmodifiedRule(userModifiedRule);
        setDirtyExplorerList(true);
        setAlertState({ message: "Saved successfully", severity: "success" });
    }

    const discardChanges = () => {
        setAutoModifiedRule(unmodifiedRule);
    }

    const deleteRule = async () => {
        const statusCode = await dataService.delete_rule(selectedRule)
            .then(function (response) {
                return response.json();
            })
            .then(function (responseJson) {
                return JSON.parse(responseJson.body);
            });
        if (statusCode === 204) {
            setUnmodifiedRule("");
            setSelectedRule(null);
            setDirtyExplorerList(true);
            setAlertState({ message: "Deleted rule successfully", severity: "success" });
        } else {
            setAlertState({ message: "Rule not deleted", severity: "error" });
        }
    }

    return (<>
        <Button variant="outlined" disabled={isRuleDirty() || !isRuleSelected()} onClick={newRule}>New Rule</Button>
        <Button variant="outlined" disabled={!isRuleDirty()} onClick={saveRule}>Save Rule</Button>
        <Button variant="outlined" disabled={!isRuleDirty()} onClick={() => setDiscardDialog(true)}>Discard Changes</Button>
        <PromptDialog contentText="Discard changes?" open={discardDialog} setOpen={setDiscardDialog} handleOkay={discardChanges} />
        <Button variant="outlined" disabled={!isRuleSelected()} onClick={() => setDeleteDialog(true)}>Delete Rule</Button>
        <PromptDialog contentText="Delete selected rule?" open={deleteDialog} setOpen={setDeleteDialog} handleOkay={deleteRule} />
    </>);

}
