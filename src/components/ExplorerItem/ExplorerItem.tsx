import { styled } from '@mui/material/styles';
import { useContext } from "react";
import AppContext from "../AppContext";
import TableRow from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

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

    const { selectedRule, setSelectedRule, isRuleDirty, setIsNewRuleSelected } = useContext(AppContext);
    const { storageId, coreId, ruleType, creator, created, changed } = props;

    const handleListItemClick = (event) => {
        if (!isRuleDirty()) {
            setSelectedRule(storageId);
            setIsNewRuleSelected(true);
        }
    };

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    return (
        <>
            <TableRow hover={!isRuleDirty()} onClick={(event) => handleListItemClick(event)} selected={selectedRule === storageId}>
                <StyledTableCell>{coreId}</StyledTableCell>
                <StyledTableCell>{ruleType}</StyledTableCell>
                <StyledTableCell>{creator}</StyledTableCell>
                <StyledTableCell>{storageId}</StyledTableCell>
                <StyledTableCell>{(new Date(created)).toLocaleString('en-US')}</StyledTableCell>
                <StyledTableCell>{(new Date(changed)).toLocaleString('en-US')}</StyledTableCell>
            </TableRow>
        </>
    );
}
