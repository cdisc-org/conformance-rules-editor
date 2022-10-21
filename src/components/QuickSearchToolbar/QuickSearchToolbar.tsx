import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import AppContext from "../AppContext";
import { useEffect, useContext } from "react";

interface QuickSearchToolbarProps {
  queryParam: string;
  label?: string;
}

export default function QuickSearchToolbar(props: QuickSearchToolbarProps) {
  const { queryParam, label } = props;
  const { user, searchText, setSearchText } = useContext(AppContext);
  useEffect(() => {
    if (user && queryParam === "creator.name" && !(queryParam in searchText)) {
      setSearchText({ ...searchText, [queryParam]: user.name });
    }
  }, [user, queryParam, searchText, setSearchText]);
  const onChange = (event) => {
    setSearchText({ ...searchText, [queryParam]: event.target.value });
  };
  return (
    <TextField
      variant="standard"
      value={searchText[queryParam] || ""}
      onChange={onChange}
      placeholder={label || "Search…"}
      InputProps={{
        startAdornment: <SearchIcon fontSize="small" />,
        endAdornment: (
          <IconButton
            title="Clear"
            aria-label="Clear"
            size="small"
            style={{
              visibility: searchText[queryParam] ? "visible" : "hidden",
            }}
            onClick={() => setSearchText({ ...searchText, [queryParam]: "" })}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        ),
      }}
    />
  );
}
