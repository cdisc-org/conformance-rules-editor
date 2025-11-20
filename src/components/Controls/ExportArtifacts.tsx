import { useContext,} from "react";
import AppContext from "../AppContext";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { MenuItem } from "@mui/material";

export default function ExportArtifacts({
    onClose
  }) {
    const {
        modifiedRule,
        syntaxCheck,
        schemaCheck,
        jsonCheck,
        loadDefineXMLCheck,
        loadDatasetsCheck,
        testCheck,
      } = useContext(AppContext);

    const exportArtifacts = async () => {
        const zip = new JSZip();
        zip.file("Rule.yml", modifiedRule);
        zip.file(
          "Rule_spaces.json",
          JSON.stringify(syntaxCheck.details[0].details, null, 4)
        );
        zip.file(
          "Schema_Validation.json",
          JSON.stringify(schemaCheck.details[0].details, null, 4)
        );
        zip.file(
          "Rule_underscores.json",
          JSON.stringify(jsonCheck.details[0].details, null, 4)
        );
        zip.file("Define.xml", loadDefineXMLCheck.details[1]?.details ?? "");
        if (loadDatasetsCheck.details[0]?.details) {
          zip.file("Datasets.xlsx", loadDatasetsCheck.details[0].details);
        }
        zip.file(
          "Datasets.json",
          JSON.stringify(loadDatasetsCheck.details[1]?.details ?? "", null, 4)
        );
        zip.file(
          "Request.json",
          JSON.stringify(testCheck.details[1]?.details ?? "", null, 4)
        );
        zip.file(
          "Results.json",
          JSON.stringify(testCheck.details[3]?.details ?? "", null, 4)
        );
    
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, "Rule.zip");
        });
    
        onClose();
      };
      return (
        <MenuItem onClick={exportArtifacts}>Export debugging artifacts</MenuItem>
      );

  }
