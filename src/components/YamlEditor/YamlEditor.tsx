import { useContext, useEffect, useState } from "react";
import ReactMonacoEditor from "react-monaco-editor";
import AppContext from "../AppContext";
import { editor as MonacoEditor } from "monaco-editor";

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

  const [model] = useState(MonacoEditor.createModel("", "yaml"));
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor>(
    null
  );

  const editorDidMount = (
    mountedEditor: MonacoEditor.IStandaloneCodeEditor
  ) => {
    mountedEditor.addAction({
      id: "fold-level-1",
      label: "Fold Level 1",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1,
      run: () => {
        mountedEditor.setPosition({ lineNumber: 1, column: 1 });
        mountedEditor.trigger("", "editor.foldLevel1", null);
        mountedEditor.trigger("", "editor.fold", null);
      },
    });
    setEditor(mountedEditor);
    setMonacoInputValue({ value: modifiedRule });
  };

  useEffect(() => {
    model.setValue(monacoInputValue.value ?? "");
  }, [model, monacoInputValue]);

  return (
    <ReactMonacoEditor
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
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
}
