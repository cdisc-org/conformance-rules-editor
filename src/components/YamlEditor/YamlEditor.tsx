import { CSSProperties, FC, useEffect, useRef } from "react";
import "./YamlEditor.css";
import {
  editor,
  Environment,
  languages,
  MarkerSeverity,
  Position,
  Range,
  Uri,
} from "monaco-editor";
import { ILanguageFeaturesService } from "monaco-editor/esm/vs/editor/common/services/languageFeatures.js";
import { OutlineModel } from "monaco-editor/esm/vs/editor/contrib/documentSymbols/browser/outlineModel.js";
import { StandaloneServices } from "monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js";
import { setDiagnosticsOptions } from "monaco-yaml";
import "monaco-editor";
import { v4 as uuidv4 } from "uuid";

declare global {
  interface Window {
    // @ts-ignore
    MonacoEnvironment: Environment | undefined;
  }
}

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

function* iterateSymbols(
  symbols: languages.DocumentSymbol[],
  position: Position
): Iterable<languages.DocumentSymbol> {
  for (const symbol of symbols) {
    if (Range.containsPosition(symbol.range, position)) {
      yield symbol;
      if (symbol.children) {
        //@ts-ignore
        yield* iterateSymbols(symbol.children, position);
      }
    }
  }
}

interface MonacoYamlEditorProps {
  value: string;
  schemaUri: string;
  theme?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
  style?: CSSProperties;
}

const YamlEditor: FC<MonacoYamlEditorProps> = ({
  value,
  schemaUri,
  style,
  theme,
  readOnly,
  onChange,
}) => {
  const editorElementRef = useRef<any>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: theme
          ? theme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "vs-dark"
          : "vs-light",
      });
    } else if (
      value !== null &&
      value !== undefined &&
      schemaUri &&
      editorElementRef.current
    ) {
      try {
        const fileMatchURI = `${uuidv4()}.yaml`;

        const schema = {
          uri: schemaUri,
          fileMatch: [fileMatchURI],
        };

        const schemas = [schema];

        setDiagnosticsOptions({
          validate: true,
          enableSchemaRequest: true,
          format: true,
          hover: true,
          completion: true,
          // @ts-ignore
          schemas,
        });

        const ed = editor.create(editorElementRef.current, {
          readOnly: readOnly ? true : false,
          automaticLayout: true,
          model: editor.createModel(value, "yaml", Uri.parse(fileMatchURI)),
          theme: theme
            ? theme
            : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "vs-dark"
            : "vs-light",
        });

        editorRef.current = ed;

        ed.onDidChangeModelContent((e) => {
          const value: string = ed.getValue();
          if (onChange) {
            onChange(value);
          }
        });

        ed.onDidChangeCursorPosition(async (event) => {
          const breadcrumbs = document.getElementById("breadcrumbs");
          const { documentSymbolProvider } = StandaloneServices.get(
            ILanguageFeaturesService
          );
          const editorModel = ed.getModel();
          if (editorModel !== null) {
            const outline = await OutlineModel.create(
              documentSymbolProvider,
              editorModel
            );
            const symbols = outline.asListOfDocumentSymbols();
            while (breadcrumbs?.lastChild) {
              breadcrumbs.lastChild.remove();
            }
            //@ts-ignore
            for (const symbol of iterateSymbols(symbols, event.position)) {
              const breadcrumb = document.createElement("span");
              breadcrumb.setAttribute("role", "button");
              breadcrumb.classList.add("breadcrumb");
              breadcrumb.textContent = symbol.name;
              breadcrumb.title = symbol.detail;
              if (symbol.kind === languages.SymbolKind.Array) {
                breadcrumb.classList.add("array");
              } else if (symbol.kind === languages.SymbolKind.Module) {
                breadcrumb.classList.add("object");
              }
              breadcrumb.addEventListener("click", () => {
                ed.setPosition({
                  lineNumber: symbol.range.startLineNumber,
                  column: symbol.range.startColumn,
                });
                ed.focus();
              });
              breadcrumbs?.append(breadcrumb);
            }
          }
        });

        editor.onDidChangeMarkers(([resource]) => {
          const problems = document.getElementById("problems");
          const markers = editor.getModelMarkers({ resource });
          while (problems?.lastChild) {
            problems.lastChild.remove();
          }
          for (const marker of markers) {
            if (marker.severity === MarkerSeverity.Hint) {
              continue;
            }
            const wrapper = document.createElement("div");
            wrapper.setAttribute("role", "button");
            const codicon = document.createElement("div");
            const text = document.createElement("div");
            wrapper.classList.add("problem");
            codicon.classList.add(
              "codicon",
              marker.severity === MarkerSeverity.Warning
                ? "codicon-warning"
                : "codicon-error"
            );
            text.classList.add("problem-text");
            text.textContent = marker.message;
            wrapper.append(codicon, text);
            wrapper.addEventListener("click", () => {
              ed.setPosition({
                lineNumber: marker.startLineNumber,
                column: marker.startColumn,
              });
              ed.focus();
            });
            problems?.append(wrapper);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [value, schemaUri, editorElementRef, theme, readOnly, onChange]);

  return (
    <div id="monaco-yaml-editor-box">
      <div id="monaco-yaml-breadcrumbs"></div>
      <div
        id="monaco-yaml-editor"
        ref={editorElementRef}
        style={{ width: 500, height: 500, ...style }}
      />
      <div id="monaco-yaml-problems"></div>
    </div>
  );
};

export default YamlEditor;
