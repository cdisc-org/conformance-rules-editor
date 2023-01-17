import { useContext } from "react";
import Editor from "react-monaco-editor";
import AppContext from "../AppContext";

// NOTE: using loader syntax becuase Yaml worker imports editor.worker directly and that
// import shouldn't go through loader syntax.
// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from "worker-loader!monaco-editor/esm/vs/editor/editor.worker";
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from "worker-loader!monaco-yaml/lib/esm/yaml.worker";

import "monaco-editor";

window.MonacoEnvironment = {
  getWorker(workerId, label) {
    if (label === "yaml") {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};

export default function YamlEditor() {
  const { modifiedRule, setModifiedRule, isRuleModifiable } = useContext(AppContext);

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
        tabSize: 2
      }}
    />
  );
}
