import { CellObject, read, utils, WorkBook, WorkSheet } from "xlsx";

export interface IDatasets {
  datasets: IDataset[];
  standard?: IStandard;
  codelists?: string[];
}

export interface IDataset {
  filename: string;
  name?: string;
  label?: string;
  domain?: string;
  file_size?: string;
  variables?: IVariable[];
  records?: {};
}

export interface IStandard {
  product: string;
  version: string;
}

export interface IVariable {
  name: string;
  label?: string;
  type?: string;
  length?: number;
}

const datasetsSheetName: string = "Datasets";
const librarySheetName: string = "Library";

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
      ...(rows.length > 2 ? { length: parseInt(rows[2][col]) } : {}),
    })
  );
};

const cellTypeMappings: { [type: string]: (cell: CellObject) => void } = {
  /* XPT Types */
  Char: (cell) => {
    cell.t = "s";
    cell.v = cell.v.toString();
  },
  Num: (cell) => {
    const originalValue = cell.v.toString();
    const trimmedValue = originalValue.trim();
    if (trimmedValue === '') {
      cell.t = "n";
      cell.v = null;
    } else {
      cell.t = "n";
      cell.v = Number(cell.v);
    }
  },
  /* JSON Types */
  Boolean: (cell) => {
    cell.t = "b";
    /* Can't just convert in js, because "false" string is true */
    if (cell.v.toString().toLowerCase() === "true") {
      cell.v = true;
    } else if (cell.v.toString().toLowerCase() === "false") {
      cell.v = false;
    }
  },
  Number: (cell) => {
    const originalValue = cell.v.toString();
    const trimmedValue = originalValue.trim();
    if (trimmedValue === '') {
      cell.t = "n";
      cell.v = null;
    } else {
      cell.t = "n";
      cell.v = Number(cell.v);
    }
  },
  String: (cell) => {
    cell.t = "s";
    cell.v = cell.v.toString();
  },
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
      if (cell && type in cellTypeMappings) {
        cellTypeMappings[type](cell);
      }
    }
  }
};

const getRecords = (cols: IVariable[], rows: {}[]): {} => {
  return Object.fromEntries(
    cols
      .filter((col) => col)
      .map((col) => [
        col.name,
        rows
          .slice(3)
          .map<string>((row: {}): string =>
            col.name in row ? row[col.name] : col.type === "Char" ? "" : null
          ),
      ])
  );
};

const getDomainName = (rows: {}[], sheetName: string): string => {
  if (rows.length > 3) {
    const domainRow = rows[3];
    const domainName = domainRow["DOMAIN"];
    return domainName || sheetName.toUpperCase().replace(".XPT", "");
  }
  return sheetName.toUpperCase().replace(".XPT", "");
};

const mergeDatasetRecords = (
  workbook: WorkBook,
  datasets: IDataset[]
): void => {
  for (const [sheetName, sheet] of Object.entries(
    workbook.Sheets
  ).filter(([sheetName, sheet]: [string, WorkSheet]) =>
    sheetName.toLowerCase().endsWith(".xpt")
  )) {
    const dataset = getMatchingDataset(datasets, sheetName);
    setDatatypes(sheet);
    const rows: {}[] = utils.sheet_to_json<{}>(sheet);

    dataset.domain = getDomainName(rows, sheetName);

    const sheetJson: string[][] = utils.sheet_to_json<string[]>(sheet, {
      header: 1,
    });
    const cols: string[] = sheetJson.length ? sheetJson[0] : [];
    dataset.variables = getVariables(cols, rows);
    dataset.records = getRecords(dataset.variables, rows);
  }
};

const getLibrary = (workbook: WorkBook): IStandard[] => {
  if (!(librarySheetName in workbook.Sheets)) {
    return [];
  }
  const libraryRows: {}[] = utils.sheet_to_json<{}>(
    workbook.Sheets[librarySheetName]
  );
  return libraryRows.map<IStandard>((row: {}) => ({
    ...(row["Product"] && { product: row["Product"] }),
    ...(row["Version"] && { version: row["Version"] }),
    ...(row["Substandard"] && { substandard: row["Substandard"] }),
  }));
};

const isCT = (standard: IStandard): boolean => 
  standard.product.toLowerCase().includes("ct");

const getStandard = (library: IStandard[]): IStandard =>
  library.find((standard) => !isCT(standard));

const getCodelists = (library: IStandard[]): string[] =>
  library
    .filter(isCT)
    .map((standard) => {
      if (standard.product.includes("-")) {
        return standard.product;
      }
      return `${standard.product}-${standard.version}`;
    });

export const excelToJsonDatasets = async (file: File): Promise<IDatasets> => {
  const workbook: WorkBook = read(await readFile(file), {
    type: "binary",
  });
  const datasets: IDataset[] = getDatasets(workbook);
  mergeDatasetRecords(workbook, datasets);
  const library = getLibrary(workbook);
  const standard = getStandard(library);
  const codelists = getCodelists(library);
  return {
    datasets: datasets,
    ...(standard && { standard }),
    ...(codelists && { codelists }),
  };
};
