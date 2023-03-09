import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";
import { useContext } from "react";
import AppContext from "../AppContext";
import { IRule } from "../../types/IRule";
import { resolvePath } from "../../utils/json_yaml";

export interface HeadCell {
  label: string;
  selectParam: string;
  filterParam: string;
  getValue: (rule: IRule) => string;
  sortable: boolean;
  filterable: boolean;
}

export const headCells: readonly HeadCell[] = [
  {
    label: "Rule Ids",
    selectParam: "json.Authorities",
    filterParam: "json.Authorities.Standards.References.Rule Identifier.Id",
    getValue: (rule) =>
      resolvePath(
        rule.json,
        "Authorities.Standards.References.Rule Identifier.Id"
      ),
    sortable: false,
    filterable: true,
  },
  {
    label: "Creator",
    selectParam: "creator.name",
    filterParam: "creator.name",
    getValue: (rule) => rule.creator.name,
    sortable: false,
    filterable: true,
  },
  {
    label: "Standards",
    selectParam: "json.Authorities",
    filterParam: "json.Authorities.Standards.Name",
    getValue: (rule) => resolvePath(rule.json, "Authorities.Standards.Name"),
    sortable: false,
    filterable: true,
  },
  {
    label: "Orgs",
    selectParam: "json.Authorities",
    filterParam: "json.Authorities.Organization",
    getValue: (rule) => resolvePath(rule.json, "Authorities.Organization"),
    sortable: false,
    filterable: true,
  },
  {
    label: "Core ID",
    selectParam: "json.Core.Id",
    filterParam: "json.Core.Id",
    getValue: (rule) => resolvePath(rule.json, "Core.Id"),
    sortable: true,
    filterable: true,
  },
  {
    label: "Status",
    selectParam: "json.Core.Status",
    filterParam: "json.Core.Status",
    getValue: (rule) => resolvePath(rule.json, "Core.Status"),
    sortable: true,
    filterable: true,
  },
  {
    label: "Created Timestamp",
    selectParam: "created",
    filterParam: "created",
    getValue: (rule) => new Date(rule.created).toLocaleString("en-US"),
    sortable: true,
    filterable: false,
  },
  {
    label: "Changed Timestamp",
    selectParam: "changed",
    filterParam: "changed",
    getValue: (rule) => new Date(rule.changed).toLocaleString("en-US"),
    sortable: true,
    filterable: false,
  },
  {
    label: "Universal ID",
    selectParam: "id",
    filterParam: "id",
    getValue: (rule) => rule.id,
    sortable: true,
    filterable: true,
  },
];

export default function ExplorerHead() {
  const { order, setOrder, orderBy, setOrderBy } = useContext(AppContext);

  const onRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              bgcolor: "#DDEEFF",
              minWidth: 150,
            }}
            key={headCell.filterParam}
            sortDirection={orderBy === headCell.selectParam ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.selectParam}
              direction={orderBy === headCell.selectParam ? order : "asc"}
              onClick={() => onRequestSort(headCell.selectParam)}
              disabled={!headCell.sortable}
            >
              {headCell.label}
              {orderBy === headCell.selectParam ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
            {headCell.filterable && (
              <>
                <br />
                <QuickSearchToolbar queryParam={headCell.filterParam} />
              </>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
