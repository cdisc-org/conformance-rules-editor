import { useContext } from "react";
import AppContext from "../AppContext";
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

interface Props {
    storageId,
    coreId,
    ruleType,
    creator,
    published,
    created,
    changed,
    revisionTimestamp?,
}

export default function ExplorerItem(props: Props) {

    const { selectedRule, setSelectedRule, isRuleDirty } = useContext(AppContext);
    const { storageId, coreId, ruleType, creator, published, created, changed } = props;

    const handleListItemClick = (event) => {
        if (!isRuleDirty()) {
            setSelectedRule(storageId);
        }
    };

    return (
        <TableRow hover={!isRuleDirty()} onClick={handleListItemClick} selected={selectedRule === storageId}>
            <TableCell>{coreId}</TableCell>
            <TableCell>{ruleType}</TableCell>
            <TableCell>{creator}</TableCell>
            <TableCell>{storageId}</TableCell>
            <TableCell>{published.toString()}</TableCell>
            <TableCell>{(new Date(created)).toLocaleString('en-US')}</TableCell>
            <TableCell>{(new Date(changed)).toLocaleString('en-US')}</TableCell>
        </TableRow>
    );
}
