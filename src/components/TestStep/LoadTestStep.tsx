import { useContext } from "react";
import AppContext, { Status, Steps } from "../AppContext";
import { excelToJsonDatasets, IDataset } from "../../utils/ExcelDataset";
import TestStep from "./TestStep";
import FileInput from "../FileInput/FileInput";

export default function LoadTestStep() {
  const { loadCheck, setLoadCheck, selectedRule } = useContext(AppContext);

  const handleFileSelected = async (event) => {
    if (event.target.files.length) {
      const file: File = event.target.files[0];
      const data: IDataset[] = await excelToJsonDatasets(file);
      setLoadCheck({
        status: Status.Pass,
        details: [file, data],
      });
    }
  };

  return (
    <TestStep title="Load Test Data" step={Steps.Load} results={loadCheck}>
      <FileInput
        id={selectedRule}
        label="Test Datasets File..."
        onChange={handleFileSelected}
      />
    </TestStep>
  );
}
