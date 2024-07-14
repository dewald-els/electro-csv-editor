import { ChangeEvent, useState } from "react";
import { EditorView } from "../types";
import {
  FiSave as SaveIcon,
  FiTable as TableIcon,
  FiList as ListIcon,
  FiEye as EyeOpenIcon,
  FiEyeOff as EyeOffIcon,
} from "react-icons/fi";

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headerRow, setHeaderRow] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<Record<string, string>[]>([]);
  const [rowValues, setRowValues] =
    useState<Record<string, string | null>[]>(null);
  const [editorView, setEditorView] = useState<EditorView>(EditorView.Table);
  const [hideEmptyFields, setHideEmptyFields] = useState<boolean>(false);

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

  return (
    <main>
      <header className="p-4 border-b border-slate-200 sticky top-0 bg-slate-100">
        <form>
          <input
            type="file"
            name="file"
            id="file"
            onChange={handleFileChange}
            accept="text/csv"
          />
        </form>
        {loading && <p>Loading</p>}
        {error && <p>{error}</p>}

        {selectedFile && (
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setEditorView(EditorView.Table)}
              className={
                "px-2 py-1 text-white rounded-md border flex items-center gap-2 " +
                (editorView === EditorView.Table
                  ? "bg-blue-500 border-blue-600 "
                  : "bg-slate-400 border-slate-500 ")
              }
            >
              <span>
                <TableIcon />
              </span>
              <span>Table View</span>
            </button>
            <button
              onClick={() => setEditorView(EditorView.Form)}
              className={
                "px-2 py-1 text-white rounded-md border flex items-center gap-2 " +
                (editorView === EditorView.Form
                  ? "bg-blue-500 border-blue-600 "
                  : "bg-slate-400 border-slate-500 ")
              }
            >
              <span>
                <ListIcon />
              </span>
              <span>Form View</span>
            </button>

            {editorView === EditorView.Form && (
              <button
                className="px-2 py-1 text-white rounded-md border flex items-center gap-2 bg-blue-500 ml-auto"
                onClick={() => setHideEmptyFields(!hideEmptyFields)}
              >
                {hideEmptyFields && (
                  <>
                    <span>
                      <EyeOpenIcon />
                    </span>
                    <span>Show Empty Fields</span>
                  </>
                )}
                {!hideEmptyFields && (
                  <>
                    <span>
                      <EyeOffIcon />
                    </span>
                    <span>Hide Empty Fields</span>
                  </>
                )}
              </button>
            )}
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
                    <th key={`data-th-${idx}`} align="left" className="p-1">
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
                    {Object.keys(dataRow).map((key, idx) => {
                      return (
                        <td key={`data-col-${idx}`}>
                          <input
                            type="text"
                            className="p-2"
                            value={dataRow[key]}
                            id={`${key}-${idx}`}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange(event, rowIdx, key)
                            }
                          />
                        </td>
                      );
                    })}
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
                {Object.keys(dataRow).map((key, idx) => {
                  if (!dataRow[key].trim() && hideEmptyFields) {
                    return <></>;
                  }

                  return (
                    <div key={`data-col-${idx}`} className="flex flex-col mb-4">
                      <label className="font-semibold text-sm mb-2">
                        {key}
                      </label>
                      <input
                        className="border border-slate-400 rounded-md p-2"
                        type="text"
                        value={dataRow[key]}
                        id={`${key}-${idx}`}
                        placeholder={key}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(event, rowIdx, key)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </form>
        </div>
      )}

      {dataRows.length > 0 && (
        <div className="p-4">
          <button
            onClick={handleSaveFile}
            className="px-2 py-1 bg-blue-500 text-white rounded-md border border-blue-600 flex items-center gap-2"
          >
            <span>
              <SaveIcon />
            </span>
            <span>Save</span>
          </button>
        </div>
      )}
    </main>
  );
};

export default App;
