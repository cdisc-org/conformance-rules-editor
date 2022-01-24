import { read, utils, WorkBook, WorkSheet } from "xlsx";

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
  label?: string;
  type?: string;
  length?: string;
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

const getDatasets = (workbook: WorkBook): IDataset[] => {
  const datasetsRows: {}[] = utils.sheet_to_json<{}>(
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
      ...(rows.length > 0 ? { label: rows[0][col] } : {}),
      ...(rows.length > 1 ? { type: rows[1][col] } : {}),
      ...(rows.length > 2 ? { length: rows[2][col] } : {}),
    })
  );
};

/* 
Take a worksheet and for each cell in the worksheet, 
convert the datatype to the datatype indicated by the type value in the column's header
 */
const setDatatypes = (sheet: WorkSheet) => {
  const range = utils.decode_range(sheet["!ref"]);
  for (var C = range.s.c; C <= range.e.c; ++C) {
    const typeCell = sheet[utils.encode_cell({ c: C, r: 2 })];
    const type = typeCell ? typeCell["v"] : null;
    for (var R = range.s.r + 4; R <= range.e.r; ++R) {
      const cell = sheet[utils.encode_cell({ c: C, r: R })];
      if (cell) {
        if (type === "Char") {
          cell["t"] = "s";
          cell["v"] = cell["v"].toString();
        }
        if (type === "Num") {
          cell["t"] = "n";
          cell["v"] = Number(cell["v"]);
        }
      }
    }
  }
};

const getRecords = (cols: string[], rows: {}[]): {} => {
  return Object.fromEntries(
    cols
      .filter((col) => col)
      .map((col) => [
        col,
        rows
          .slice(3)
          .map<string>((row: {}): string => (row[col] ? row[col] : "")),
      ])
  );
};

export const excelToJsonDatasets = async (file: File): Promise<IDataset[]> => {
  const workbook: WorkBook = read(await readFile(file), {
    type: "binary",
  });

  const datasets: IDataset[] = getDatasets(workbook);

  for (const [sheetName, sheet] of Object.entries(
    workbook.Sheets
  ).filter(([sheetName, sheet]: [string, WorkSheet]) =>
    sheetName.toLowerCase().endsWith(".xpt")
  )) {
    const dataset = getMatchingDataset(datasets, sheetName);
    setDatatypes(sheet);
    const rows: {}[] = utils.sheet_to_json<{}>(sheet);

    if (rows.length > 3 && rows[3]["DOMAIN"]) {
      dataset.domain = rows[3]["DOMAIN"];
    }

    const sheetJson: string[][] = utils.sheet_to_json<string[]>(sheet, {
      header: 1,
    });
    const cols: string[] = sheetJson.length ? sheetJson[0] : [];
    dataset.variables = getVariables(cols, rows);
    dataset.records = getRecords(cols, rows);
  }
  return datasets;
};
