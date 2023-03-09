import { useContext } from "react";
import AppContext from "../AppContext";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { IRule } from "../../types/IRule";
import { headCells } from "../ExplorerHead/ExplorerHead";

export default function ExplorerItem(rule: IRule) {
  const { selectedRule, setSelectedRule, isRuleDirty } = useContext(AppContext);

  const handleListItemClick = () => {
    if (!isRuleDirty()) {
      setSelectedRule(rule.id);
    }
  };

  return (
    <TableRow
      hover={!isRuleDirty()}
      onClick={handleListItemClick}
      selected={selectedRule === rule.id}
    >
      {headCells.map((headCell) => (
        <TableCell key={`${rule.id}.${headCell.filterParam}`}>
          {headCell.getValue(rule)}
        </TableCell>
      ))}
    </TableRow>
  );
}
