import { useState } from 'react';
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";
import { useContext } from "react";
import AppContext from "../AppContext";
import { IRule } from "../../types/IRule";

export interface HeadCell {
  label: string;
  filterParam: string;
  getValue: (rule: IRule) => string;
  sortable: boolean;
  filterable: boolean;
}

export const headCells: HeadCell[] = [
  {
    label: "Rule Ids",
    filterParam: "json.Authorities.Standards.References.Rule Identifier.Id",
    getValue: (rule) =>
      rule["json.Authorities.Standards.References.Rule Identifier.Id"].join(", "),
    sortable: false,
    filterable: true,
  },
  {
    label: "Creator",
    filterParam: "creator.name",
    getValue: (rule) => rule["creator.name"],
    sortable: false,
    filterable: true,
  },
  {
    label: "Standards",
    filterParam: "json.Authorities.Standards.Name",
    getValue: (rule) => rule["json.Authorities.Standards.Name"].join(", "),
    sortable: false,
    filterable: true,
  },
  {
    label: "Orgs",
    filterParam: "json.Authorities.Organization",
    getValue: (rule) => rule["json.Authorities.Organization"].join(", "),
    sortable: false,
    filterable: true,
  },
  {
    label: "Core ID",
    filterParam: "json.Core.Id",
    getValue: (rule) => rule["json.Core.Id"],
    sortable: true,
    filterable: true,
  },
  {
    label: "Status",
    filterParam: "json.Core.Status",
    getValue: (rule) => rule["json.Core.Status"],
    sortable: true,
    filterable: true,
  },
  {
    label: "Changed Timestamp",
    filterParam: "created",
    getValue: (rule) => new Date(rule.created).toLocaleString("en-US"),
    sortable: true,
    filterable: false,
  },
  {
    label: "Universal ID",
    filterParam: "id",
    getValue: (rule) => rule["id"],
    sortable: true,
    filterable: true,
  },
];

export default function ExplorerHead() {
  const { order, setOrder, orderBy, setOrderBy, activeColumns, setActiveColumns, searchText, setSearchText } = useContext(AppContext);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const onRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const removeColumn = (filterParam: string) => {
    setActiveColumns(cols => cols.filter(col => col.filterParam !== filterParam));
    const newSearchText = { ...searchText };
    delete newSearchText[filterParam];
    setSearchText(newSearchText);
  };

  const sanitizePath = (path: string): string => {
    // Remove all characters that are not alphanumeric, period, or underscore
    return path.replace(/[^a-zA-Z0-9._@]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\.+|\.+$/g, '');
  };

  const addColumn = () => {
    if (newColumnName) {
      const sanitizedPath = sanitizePath(newColumnName);
      const newColumn: HeadCell = {
        label: sanitizedPath,
        filterParam: `custom.${sanitizedPath}`,
        getValue: (rule) => rule[`custom.${sanitizedPath}`]?.toString() || '',
        sortable: false,
        filterable: true,
      };
      setActiveColumns(prevCols => [...prevCols, newColumn]);
      setShowAddColumn(false);
      setNewColumnName("");
    }
  };

  const addDefaultColumn = (column: HeadCell) => {
    if (!activeColumns.find(col => col.filterParam === column.filterParam)) {
      setActiveColumns(cols => [...cols, column]);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {activeColumns.map((headCell) => (
          <TableCell
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              bgcolor: "#DDEEFF",
              minWidth: 150,
              position: 'relative'
            }}
            key={headCell.filterParam}
            sortDirection={orderBy === headCell.filterParam ? order : false}
          >
            <Box className="flex items-center justify-between">
              <TableSortLabel
                active={orderBy === headCell.filterParam}
                direction={orderBy === headCell.filterParam ? order : "asc"}
                onClick={() => onRequestSort(headCell.filterParam)}
                disabled={!headCell.sortable}
              >
                {headCell.label}
                {orderBy === headCell.filterParam ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
              <IconButton
                size="small"
                onClick={() => removeColumn(headCell.filterParam)}
                className="opacity-50 hover:opacity-100"
              >
                ✕
              </IconButton>
            </Box>
            {headCell.filterable && (
              <QuickSearchToolbar queryParam={headCell.filterParam} />
            )}
          </TableCell>
        ))}
        
        <TableCell sx={{ bgcolor: "#DDEEFF", minWidth: 150 }}>
          {showAddColumn ? (
            <Box className="space-y-2">
              <input
                type="text"
                placeholder="Enter path (e.g. Core.Id)"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full p-1 border rounded"
              />
              <div className="flex justify-between">
                <Button
                  size="small"
                  variant="contained"
                  onClick={addColumn}
                  className="bg-blue-500"
                >
                  Add
                </Button>
                <Button
                  size="small"
                  onClick={() => setShowAddColumn(false)}
                >
                  Cancel
                </Button>
              </div>
            </Box>
          ) : (
            <Box className="space-y-2">
              <Select
                size="small"
                value=""
                onChange={(e) => {
                  const column = headCells.find(
                    col => col.filterParam === e.target.value
                  );
                  if (column) addDefaultColumn(column);
                }}
                displayEmpty
                className="w-full"
              >
                <MenuItem value="" disabled>
                  Add Default Column
                </MenuItem>
                {headCells.filter(
                  defaultCol => !activeColumns.find(
                    activeCol => activeCol.filterParam === defaultCol.filterParam
                  )
                ).map(col => (
                  <MenuItem key={col.filterParam} value={col.filterParam}>
                    {col.label}
                  </MenuItem>
                ))}
              </Select>
              
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowAddColumn(true)}
                className="w-full"
              >
                + Add Custom Column
              </Button>
            </Box>
          )}
        </TableCell>
      </TableRow>
    </TableHead>
  );
}