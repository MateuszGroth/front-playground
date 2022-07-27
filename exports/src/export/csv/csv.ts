export interface CsvExportArg<T> {
  data: Array<T>;
  orderedKeys: (keyof T)[];
  headerMap?: Record<keyof T, string>;
  fileName?: string;
}

const formatValue = (value: unknown): string => {
  let innerValue;
  if (value instanceof Date) {
    innerValue = value.toLocaleString();
  } else if (value != null) {
    innerValue = String(value);
  } else {
    innerValue = "";
  }

  let result = innerValue.replace(/"/g, '""').replace(/(\r)?\n|\r/g, " ");
  if (/("|,|\n)/.test(result)) {
    result = '"' + result + '"';
  }

  return result;
};

export const exportToCsv = <T>({ data, orderedKeys, headerMap, fileName }: CsvExportArg<T>): void => {
  const csvRowsArray = [orderedKeys.map((key) => headerMap?.[key] ?? key).join(",")];

  data.forEach((rowData) => {
    csvRowsArray.push(orderedKeys.map((key) => formatValue(rowData[key])).join(","));
  });

  const csvString = csvRowsArray.join("\n");
  const csvBlob = new Blob([csvString], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);
  const csvLink = document.createElement("a");
  csvLink.href = csvUrl;
  csvLink.download = (fileName ?? "data") + ".csv";
  csvLink.click();
};
