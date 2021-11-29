import XLSX from "xlsx";

export interface IDataset {
  filename: string;
  name?: string;
  label?: string;
  domain?: string;
  filesize?: string;
  variables?: IVariable[];
  records?: {};
}

export interface IVariable {
  name: string;
  label: string;
  type: string;
  length: string;
}

const datasetsSheetName: string = "Datasets";

const readFile = async (file: File): Promise<string | ArrayBuffer> => {
  return new Promise((resolve) => {
    const fileReader: FileReader = new FileReader();
    fileReader.onload = (e: ProgressEvent<FileReader>) =>
      resolve(fileReader.result);
    fileReader.readAsBinaryString(file);
  });
};

const getDatasets = (workbook: XLSX.WorkBook): IDataset[] => {
  const datasetsRows: {}[] = XLSX.utils.sheet_to_json<{}>(
    workbook.Sheets[datasetsSheetName]
  );
  return datasetsRows.map<IDataset>((row: {}) => ({
    filename: row["Filename"],
    ...(row["Dataset Name"] ? { name: row["Dataset Name"] } : {}),
    ...(row["Label"] ? { label: row["Label"] } : {}),
    ...(row["Size"] ? { size: row["Size"] } : {}),
  }));
};

const getMatchingDataset = (
  datasets: IDataset[],
  sheetName: string
): IDataset => {
  const matchingDatasets: IDataset[] = datasets.filter(
    (dataset: IDataset) => dataset.filename === sheetName
  );
  return matchingDatasets.length
    ? matchingDatasets[0]
    : datasets[datasets.push({ filename: sheetName }) - 1];
};

const getVariables = (cols: string[], rows: {}[]): IVariable[] => {
  return cols.map<IVariable>(
    (col: string): IVariable => ({
      name: col,
      label: rows[0][col],
      type: rows[1][col],
      length: rows[2][col],
    })
  );
};

const getRecords = (cols: string[], rows: {}[]): {} => {
  return Object.fromEntries(
    cols.map((col) => [
      col,
      rows
        .slice(3)
        .map<string>((row: {}): string => (row[col] ? row[col] : "")),
    ])
  );
};

export const excelToJsonDatasets = async (file: File): Promise<IDataset[]> => {
  const workbook: XLSX.WorkBook = XLSX.read(await readFile(file), {
    type: "binary",
  });

  const datasets: IDataset[] = getDatasets(workbook);

  for (const [sheetName, sheet] of Object.entries(workbook.Sheets).filter(
    ([sheetName, sheet]: [string, XLSX.WorkSheet]) =>
      sheetName !== datasetsSheetName
  )) {
    const dataset = getMatchingDataset(datasets, sheetName);
    const rows: {}[] = XLSX.utils.sheet_to_json<{}>(sheet);

    if (rows.length > 3 && rows[3]["DOMAIN"]) {
      dataset.domain = rows[3]["DOMAIN"];
    }

    const cols: string[] = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
    })[0];
    dataset.variables = getVariables(cols, rows);
    dataset.records = getRecords(cols, rows);
  }
  return datasets;
};
