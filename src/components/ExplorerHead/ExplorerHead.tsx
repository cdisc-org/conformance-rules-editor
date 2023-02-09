import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import QuickSearchToolbar from "../QuickSearchToolbar/QuickSearchToolbar";
import { useContext } from "react";
import AppContext from "../AppContext";

export interface HeadCell {
  label: string;
  queryParam: string;
}

export const headCells: readonly HeadCell[] = [
  {
    queryParam: "json.Core.Id",
    label: "Core ID",
  },
  {
    queryParam: "json.Rule Type",
    label: "Rule Type",
  },
  {
    queryParam: "creator.name",
    label: "Creator",
  },
  {
    queryParam: "json.Core.Status",
    label: "Status",
  },
  {
    queryParam: "json.Authorities",
    label: "Rule Ids",
  },
  {
    queryParam: "created",
    label: "Created Timestamp",
  },
  {
    queryParam: "changed",
    label: "Changed Timestamp",
  },
  {
    queryParam: "id",
    label: "Universal ID",
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
            key={headCell.queryParam}
            sortDirection={orderBy === headCell.queryParam ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.queryParam}
              direction={orderBy === headCell.queryParam ? order : "asc"}
              onClick={() => onRequestSort(headCell.queryParam)}
            >
              {headCell.label}
              {orderBy === headCell.queryParam ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
            <QuickSearchToolbar queryParam={headCell.queryParam} />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
