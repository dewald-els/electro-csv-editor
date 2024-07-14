import { ChangeEvent, useState } from "react";
import { EditorView } from "../types";

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headerRow, setHeaderRow] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<Record<string, string>[]>([]);
  const [rowValues, setRowValues] =
    useState<Record<string, string | null>[]>(null);
  const [editorView, setEditorView] = useState<EditorView>(EditorView.Table);

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
      <header className="p-4 border-b border-slate-200">
        <h2>CSV Editor</h2>
        <span>Start by selecting a file</span>
        <br />
        <br />
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

        {selectedFile && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditorView(EditorView.Table)}
              className={
                "px-2 py-1 text-white rounded-md border " +
                (editorView === EditorView.Table
                  ? "bg-blue-500 border-blue-600 "
                  : "bg-slate-400 border-slate-500 ")
              }
            >
              Table View
            </button>
            <button
              onClick={() => setEditorView(EditorView.Form)}
              className={
                "px-2 py-1 text-white rounded-md border " +
                (editorView === EditorView.Form
                  ? "bg-blue-500 border-blue-600 "
                  : "bg-slate-400 border-slate-500 ")
              }
            >
              Form View
            </button>
          </div>
        )}
      </header>

      {editorView === EditorView.Table && (
        <div className="data-container">
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
      )}

      {editorView === EditorView.Form && (
        <div className="data-container">
          <form>
            {dataRows.map((dataRow, rowIdx) => (
              <div key={`data-row-${rowIdx}`}>
                {Object.keys(dataRow).map((key, idx) => (
                  <div key={`data-col-${idx}`} className="data-row">
                    <label>{key}</label>
                    <input
                      type="text"
                      value={dataRow[key]}
                      id={`${key}-${idx}`}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(event, rowIdx, key)
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
          </form>
        </div>
      )}

      {dataRows.length > 0 && (
        <div className="p-4">
          <button
            onClick={handleSaveFile}
            className="px-2 py-1 bg-blue-500 text-white rounded-md border border-blue-600"
          >
            Save
          </button>
        </div>
      )}
    </main>
  );
};

export default App;
