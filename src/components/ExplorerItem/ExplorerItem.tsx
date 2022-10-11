import { useContext } from "react";
import AppContext from "../AppContext";
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { IRule } from "../../types/IRule";
import { resolvePath } from "../../utils/json_yaml";

export default function ExplorerItem(ruleItem: IRule) {

    const { selectedRule, setSelectedRule, isRuleDirty } = useContext(AppContext);
    const rule = ruleItem.json;

    const handleListItemClick = () => {
        if (!isRuleDirty()) {
            setSelectedRule(ruleItem.id);
        }
    };

    return (
        <TableRow hover={!isRuleDirty()} onClick={handleListItemClick} selected={selectedRule === ruleItem.id}>
            <TableCell>{resolvePath(rule, "Core.Id")}</TableCell>
            <TableCell>{resolvePath(rule, "Rule Type")}</TableCell>
            <TableCell>{ruleItem.creator.name}</TableCell>
            <TableCell>{ruleItem.id}</TableCell>
            <TableCell>{ruleItem.isPublished.toString()}</TableCell>
            <TableCell>{(new Date(ruleItem.created)).toLocaleString('en-US')}</TableCell>
            <TableCell>{(new Date(ruleItem.changed)).toLocaleString('en-US')}</TableCell>
        </TableRow>
    );
}
