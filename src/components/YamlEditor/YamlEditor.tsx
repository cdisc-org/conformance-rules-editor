import { useContext } from "react";
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
  const { modifiedRule, setModifiedRule, isRuleModifiable } = useContext(
    AppContext
  );
  return (
    <Editor
      language="yaml"
      value={modifiedRule}
      onChange={setModifiedRule}
      theme="vs-dark"
      options={{
        automaticLayout: true,
        wordWrap: "on",
        readOnly: !isRuleModifiable(),
        tabSize: 2,
        model: editor.createModel("", "yaml"),
      }}
    />
  );
}
