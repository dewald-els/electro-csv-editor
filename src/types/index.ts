export enum EventNames {
  ReadSelectedFile = "fs:readSelectedFile",
  WriteSelectedFile = "fs:writeSelectedFile",
}

export interface FileReadResult {
  headers?: string[];
  data?: Record<string, string>[];
  error?: string;
}

export enum EditorView {
  Table,
  Form,
}
