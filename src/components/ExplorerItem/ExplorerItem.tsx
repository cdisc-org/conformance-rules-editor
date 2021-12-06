import { useContext } from "react";
import AppContext from "../AppContext";
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

interface Props {
    storageId,
    coreId,
    ruleType,
    creator,
    created,
    changed,
    revisionTimestamp?,
}

export default function ExplorerItem(props: Props) {

    const { selectedRule, setSelectedRule, isRuleDirty } = useContext(AppContext);
    const { storageId, coreId, ruleType, creator, created, changed } = props;

    const handleListItemClick = (event) => {
        if (!isRuleDirty()) {
            setSelectedRule(storageId);
        }
    };

    return (
        <TableRow hover={!isRuleDirty()} onClick={(event) => handleListItemClick(event)} selected={selectedRule === storageId}>
            <TableCell>{coreId}</TableCell>
            <TableCell>{ruleType}</TableCell>
            <TableCell>{creator}</TableCell>
            <TableCell>{storageId}</TableCell>
            <TableCell>{(new Date(created)).toLocaleString('en-US')}</TableCell>
            <TableCell>{(new Date(changed)).toLocaleString('en-US')}</TableCell>
        </TableRow>
    );
}
