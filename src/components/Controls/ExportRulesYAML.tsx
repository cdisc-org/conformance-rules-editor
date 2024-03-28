import AppContext from "../AppContext";
import { useContext } from "react";
import { IFilter } from "../../types/IFilter";
import { saveAs } from "file-saver";
import { ColumnOption } from "csv-stringify/browser/esm/sync";
import { MenuItem } from "@mui/material";
import JSZip from "jszip";

const columns: ColumnOption[] = [
  {
    header: "id",
    key: "id",
  },
  {
    header: "ruleId",
    key: "json.Authorities.Standards.References.Rule Identifier.Id",
  },
  {
    header: "content",
    key: "content",
  },
];

const cast = (value) =>
  Array.isArray(value) ? value.join(",") : JSON.stringify(value);

export default function ExportRulesYAML({ onClose }) {
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

    const zip = new JSZip();
    for (const rule of rules) {
      zip.file(
        `${cast(
          rule["json.Authorities.Standards.References.Rule Identifier.Id"]
        )}.${rule["id"]}.yml`,
        rule["content"]
      );
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "Rules.zip");
    });

    setAlertState({
      message: `Saved ${rules.length} Rules`,
      severity: "success",
    });
    onClose();
  };

  return (
    <MenuItem onClick={exportRules}>Export rules YAML (as filtered)</MenuItem>
  );
}
