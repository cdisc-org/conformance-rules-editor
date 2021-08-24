import '../../App.css';
import { useState, useRef, useEffect } from "react";

/* Uncomment to convert from jsx to tsx */
//import { editor, Environment } from 'monaco-editor';
import { editor } from 'monaco-editor';

import { setDiagnosticsOptions } from 'monaco-yaml';

// NOTE: using loader syntax becuase Yaml worker imports editor.worker directly and that
// import shouldn't go through loader syntax.
// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker?filename=editor.worker.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker?filename=yaml.worker.js';


/* Uncomment to convert from jsx to tsx */
// declare global {
//     interface Window {
//         MonacoEnvironment: Environment;
//     }
// }

window.MonacoEnvironment = {
    getWorker(workerId, label) {
        if (label === 'yaml') {
            return new YamlWorker();
        }
        return new EditorWorker();
    },
};


function MonacoEditor(props) {
    const editorRef = useRef();

    /* Uncomment to convert from jsx to tsx */
    //const [currentEditor, setcurrentEditor] = useState < editor.IStandaloneCodeEditor > ();
    const [currentEditor, setcurrentEditor] = useState();

    useEffect(() => {
        if (props.schema) {
            setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                format: true,
                hover: true,
                completion: true,
                schemas: [
                    {
                        uri: "https://cdisc.org/rules/1-0",
                        fileMatch: ['*'],
                        schema: props.schema
                    },
                ],
            });
        }
    }, [props.schema]);

    /* Initialize the editor */
    useEffect(() => {
        if (editorRef.current) {
            console.log(editorRef.current)
            setcurrentEditor(editor.create(editorRef.current, {
                language: 'yaml',
                theme: "vs-dark",
                automaticLayout: true,
            }));
        }
    }, []);

    /* Load the editor with a new value */
    useEffect(() => {
        if (currentEditor) {
            currentEditor.setValue(props.value);
        }
    }, [currentEditor, props.value]);

    return (
        <>
            <div ref={editorRef} style={{ height: props.height }} />
        </>
    );
}

export default MonacoEditor;
