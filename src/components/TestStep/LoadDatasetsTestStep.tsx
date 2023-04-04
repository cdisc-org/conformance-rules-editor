import { useContext, useEffect, useState } from "react";
import AppContext, { DetailsType, Status, Steps } from "../AppContext";
import { excelToJsonDatasets, IDataset } from "../../utils/ExcelDataset";
import TestStep from "./TestStep";
import FileInput from "../FileInput/FileInput";

export default function LoadDatasetsTestStep() {
  const { loadDatasetsCheck, setLoadDatasetsCheck, selectedRule } = useContext(
    AppContext
  );
  const [file, setFile] = useState<File>();

  useEffect(() => {
    const loadExcel = async () => {
      const data: IDataset[] = await excelToJsonDatasets(file);
      setLoadDatasetsCheck({
        status: Status.Pass,
        details: [
          { detailsType: DetailsType.file, details: file },
          { detailsType: DetailsType.json, details: data },
        ],
      });
    };
    if (file) {
      loadExcel();
    }
  }, [setLoadDatasetsCheck, file]);

  return (
    <TestStep
      title="Load Test Datasets"
      step={Steps.LoadDatasets}
      results={loadDatasetsCheck}
    >
      <FileInput
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        id={selectedRule}
        label="Test Datasets File..."
        setFile={setFile}
      />
    </TestStep>
  );
}
