import { useContext } from "react";
import AppContext from "../AppContext";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { IRule } from "../../types/IRule";

export default function ExplorerItem(rule: IRule) {
  const { selectedRule, setSelectedRule, isRuleDirty, activeColumns} = useContext(AppContext);

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
 {activeColumns.map((headCell) => {
        let cellValue = "";
        try {
          cellValue = headCell.getValue(rule);
        } catch (error) {
          console.error(`Error getting value for ${headCell.filterParam}:`, error);
          cellValue = "Error";
        }
        
        return (
          <TableCell key={`${rule.id}.${headCell.filterParam}`}>
            {cellValue}
          </TableCell>
        );
      })}
    </TableRow>
  );
}