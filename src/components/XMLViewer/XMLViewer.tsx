import Editor from "react-monaco-editor";

export default function XMLViewer({ value, height }) {
  return (
    <Editor
      language="xml"
      value={value}
      theme="vs-dark"
      height={height}
      options={{
        automaticLayout: true,
        wordWrap: "on",
        readOnly: true,
        tabSize: 2,
      }}
    />
  );
}
