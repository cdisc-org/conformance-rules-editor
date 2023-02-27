import { useContext, useEffect, useState } from "react";
import Editor from "react-monaco-editor";
import AppContext from "../AppContext";
import { editor } from "monaco-editor";

window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case "editorWorkerService":
        return new Worker(
          new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url)
        );
      case "yaml":
        return new Worker(new URL("monaco-yaml/yaml.worker", import.meta.url));
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

export default function YamlEditor() {
  const {
    modifiedRule,
    setModifiedRule,
    isRuleModifiable,
    monacoInputValue,
    setMonacoInputValue,
  } = useContext(AppContext);

  const [model] = useState(editor.createModel("", "yaml"));

  const editorDidMount = () => {
    setMonacoInputValue({ value: modifiedRule });
  };

  useEffect(() => {
    model.setValue(monacoInputValue.value);
  }, [model, monacoInputValue]);

  return (
    <Editor
      language="yaml"
      value={monacoInputValue.value}
      onChange={setModifiedRule}
      editorDidMount={editorDidMount}
      theme="vs-dark"
      options={{
        automaticLayout: true,
        wordWrap: "on",
        readOnly: !isRuleModifiable(),
        tabSize: 2,
        model: model,
      }}
    />
  );
}
