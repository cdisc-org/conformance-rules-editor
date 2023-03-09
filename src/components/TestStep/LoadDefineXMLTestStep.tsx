import { useContext, useEffect, useState } from "react";
import AppContext, { DetailsType, Status, Steps } from "../AppContext";
import FileInput from "../FileInput/FileInput";
import TestStep from "./TestStep";

const readFile = async (file: File): Promise<string | ArrayBuffer> => {
  return new Promise((resolve) => {
    const fileReader: FileReader = new FileReader();
    fileReader.onload = (e: ProgressEvent<FileReader>) =>
      resolve(fileReader.result);
    fileReader.readAsText(file);
  });
};

export default function LoadDefineXMLTestStep() {
  const {
    loadDefineXMLCheck,
    setLoadDefineXMLCheck,
    selectedRule,
  } = useContext(AppContext);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    const loadXML = async () => {
      const data = await readFile(file);
      setLoadDefineXMLCheck({
        status: Status.Pass,
        details: [
          { detailsType: DetailsType.file, details: file },
          { detailsType: DetailsType.xml, details: data },
        ],
      });
    };
    if (file) {
      loadXML();
    }
  }, [setLoadDefineXMLCheck, file]);

  return (
    <TestStep
      title="Load Test Define.xml"
      step={Steps.LoadDefineXML}
      results={loadDefineXMLCheck}
    >
      <FileInput
        accept="text/xml"
        id={selectedRule}
        label="Test Define.xml File..."
        setFile={setFile}
      />
    </TestStep>
  );
}
