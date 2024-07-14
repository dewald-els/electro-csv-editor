import { ChangeEvent, useState } from "react";

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headerRow, setHeaderRow] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<Record<string, string>[]>([]);
  const [rowValues, setRowValues] =
    useState<Record<string, string | null>[]>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    console.log(event.target.files);
    if (!event.target || !event.target.files || event.target.files.length < 1) {
      return;
    }

    const { files } = event.target;
    const [file] = files;

    try {
      setSelectedFile(file);
      const { headers, data, error } =
        await window.csvReaderAPI.readSelectedFile(file.path);
      console.log(headers, data, error);
      if (!error) {
        setHeaderRow(headers);
        setDataRows(data);
        setRowValues(data);
      } else {
        throw new Error("Could not read the file");
      }
    } catch (error) {
      setError("Unable to read the file");
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    currentIdx: number,
    colName: string
  ) => {
    const value = event.currentTarget.value;
    const newRowValues = [...rowValues];
    newRowValues[currentIdx][colName] = value;
    setRowValues(newRowValues);
  };

  const handleSaveFile = async () => {
    try {
      const dataString = [];
      dataString.push(headerRow.join(","));
      const dataRowString = rowValues.map((row, rowIdx) => {
        return Object.keys(row)
          .map((key) => {
            return rowValues[rowIdx][key];
          })
          .join(",");
      });

      dataString.push(...dataRowString);

      const result = await window.csvReaderAPI.writeFileToPath({
        filePath: selectedFile.path,
        data: dataString.join("\n"),
      });

      alert(result ? "Successfully updated file" : "Failed to update the file");
    } catch (error) {
      console.log("Failed to write");
    }
  };

  console.log("rowvalues", rowValues);

  return (
    <main>
      <header>
        <h1>CSV Editor</h1>
        <span>Start by selecting a file</span>
        <br />
        <br />
      </header>
      <form>
        <input
          type="file"
          name="file"
          id="file"
          onChange={handleFileChange}
          accept="text/csv"
        />
        <br />
        <br />
      </form>
      {selectedFile && (
        <div>
          <p>Editing File: {selectedFile.name}</p>
          <br />
        </div>
      )}
      {loading && <p>Loading</p>}
      {error && <p>{error}</p>}

      <div className="table-container">
        <table>
          {headerRow.length > 0 && (
            <thead>
              <tr>
                {headerRow.map((header, idx) => (
                  <th key={`data-th-${idx}`} align="left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          {headerRow.length > 0 && (
            <tbody>
              {dataRows.map((dataRow, rowIdx) => (
                <tr key={`data-row-${rowIdx}`}>
                  {Object.keys(dataRow).map((key, idx) => (
                    <td key={`data-col-${idx}`}>
                      <input
                        type="text"
                        value={dataRow[key]}
                        id={`${key}-${idx}`}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(event, rowIdx, key)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {dataRows.length > 0 && <button onClick={handleSaveFile}>Save</button>}
    </main>
  );
};

export default App;
