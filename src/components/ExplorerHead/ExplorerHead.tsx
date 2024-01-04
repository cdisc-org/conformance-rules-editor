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

export interface HeadCell {
  label: string;
  filterParam: string;
  getValue: (rule: IRule) => string;
  sortable: boolean;
  filterable: boolean;
}

export const headCells: readonly HeadCell[] = [
  {
    label: "Rule Ids",
    filterParam: "json.Authorities.Standards.References.Rule Identifier.Id",
    getValue: (rule) =>
      rule["json.Authorities.Standards.References.Rule Identifier.Id"].join(
        ", "
      ),
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
            sortDirection={orderBy === headCell.filterParam ? order : false}
          >
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
