import '../../App.css';
import { useState, useRef, useEffect, useContext } from "react";

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
import AppContext from "../AppContext";


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
    const { dataService } = useContext(AppContext)
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
            const initialEditor = editor.create(editorRef.current, {
                language: 'yaml',
                theme: "vs-dark",
                automaticLayout: true,
            });
            setcurrentEditor(initialEditor);
            /* Listen for editor text changes and set the postedit value to be used by other components */
            initialEditor.onDidChangeModelContent(e => {
                props.setPostEditRule(initialEditor.getValue());
            });
        }
    }, []);

    /* Load the editor with a new value */
    useEffect(() => {
        if (currentEditor && props.selectedRule) {
            dataService.get_rule(props.selectedRule)
                .then(function (response) {
                    return response.json();
                })
                .then(function (responseJson) {
                    const content = JSON.parse(responseJson.body).data.attributes.body.value;
                    props.setPreEditRule(content);
                    props.setPostEditRule(content);
                });
        }
    }, [currentEditor, props.selectedRule, dataService]);

    /* Set value of editor based on changes to Pre Edit Rule */
    useEffect(() => {
        if (currentEditor && props.preEditRule !== undefined) {
            currentEditor.setValue(props.preEditRule);
        }
    }, [currentEditor, props.preEditRule]);

    return (
        <>
            <div ref={editorRef} style={{ height: props.height }} />
        </>
    );
}

export default MonacoEditor;
