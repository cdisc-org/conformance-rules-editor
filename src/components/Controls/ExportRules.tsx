import ControlButton from "./ControlButton";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AppContext from "../AppContext";
import { useContext } from "react";
import { IFilter } from "../../types/IFilter";
import { saveAs } from "file-saver";
import { ColumnOption, stringify } from "csv-stringify/browser/esm/sync";

const columns: ColumnOption[] = [
  {
    header: "Core-ID",
    key: "json.Core.Id",
  },
  {
    header: "CDISC Rule ID",
    key: "json.Authorities.Standards.References.Rule Identifier.Id",
  },
  {
    header: "Error Message",
    key: "json.Outcome.Message",
  },
  {
    header: "Description",
    key: "json.Description",
  },
  {
    header: "Standard Name",
    key: "json.Authorities.Standards.Name",
  },
  {
    header: "Standard Version",
    key: "json.Authorities.Standards.Version",
  },
  {
    header: "Scope",
    key: "json.Scope",
  },
  {
    header: "Executability",
    key: "json.Executability",
  },
  {
    header: "Status",
    key: "json.Core.Status",
  },
];

const cast = {
  object: (value) =>
    Array.isArray(value) ? value.join(", ") : JSON.stringify(value),
};

export default function ExportRules() {
  const { dataService, orderBy, order, searchText, setAlertState } = useContext(
    AppContext
  );

  const exportRules = async () => {
    const params = {
      orderBy: orderBy,
      order: order,
      select: columns.map((column) => column.key),
      filters: Object.entries(searchText)
        .filter(
          ([_, filterValue]: [string, string]) =>
            !(filterValue == null || filterValue === "")
        )
        .map(
          ([filterName, filterValue]: [string, string]): IFilter => ({
            name: filterName,
            operator: "contains",
            value: filterValue,
          })
        ),
    };
    const rules = [];
    setAlertState({
      message: `Downloading Rules ${rules.length}/?...`,
      severity: "info",
    });
    var currentRules = await dataService.get_rules_filter_sort(params);
    rules.push(...currentRules.rules);
    while (currentRules.next) {
      setAlertState({
        message: `Downloading Rules ${rules.length}/?...`,
        severity: "info",
      });
      currentRules = await dataService.get_rules_filter_sort(currentRules.next);
      rules.push(...currentRules.rules);
    }
    setAlertState({
      message: `Saving ${rules.length} Rules...`,
      severity: "info",
    });
    saveAs(
      new Blob(
        [
          stringify(rules, {
            header: true,
            columns: columns,
            cast: cast,
            escape_formulas: true,
          }),
        ],
        {
          type: "text/csv",
        }
      ),
      "Rules.csv"
    );
    setAlertState({
      message: `Saved ${rules.length} Rules`,
      severity: "success",
    });
  };

  return (
    <ControlButton title={"Export Rules (as filtered)"} onClick={exportRules}>
      <ChecklistIcon />
    </ControlButton>
  );
}
