import { useContext, useEffect, useState } from "react";
import AppContext, { Status, Steps } from "../AppContext";
import { excelToJsonDatasets, IDataset } from "../../utils/ExcelDataset";
import TestStep from "./TestStep";
import FileInput from "../FileInput/FileInput";

export default function LoadTestStep() {
  const { loadCheck, setLoadCheck, selectedRule } = useContext(AppContext);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    const loadExcel = async () => {
      const data: IDataset[] = await excelToJsonDatasets(file);
      setLoadCheck({
        status: Status.Pass,
        details: [file, data],
      });
    };
    if (file) {
      loadExcel();
    }
  }, [setLoadCheck, file]);

  return (
    <TestStep title="Load Test Data" step={Steps.Load} results={loadCheck}>
      <FileInput
        id={selectedRule}
        label="Test Datasets File..."
        setFile={setFile}
      />
    </TestStep>
  );
}
