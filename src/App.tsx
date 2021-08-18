import React, { useState } from 'react';
import './App.css';
import MonacoEditor from "./components/MonacoEditor/MonacoEditor";
import rulesSchema from './resources/RulesSchema';
import testRules from "./resources/TestRules";

function App() {

  const [fileName, setFileName] = useState("rule1.yaml");
  const rule = testRules[fileName];

  return (
    <>
      <button
        disabled={fileName === "rule1.yaml"}
        onClick={() => setFileName("rule1.yaml")}
      >
        rule1.yaml
      </button>
      <button
        disabled={fileName === "rule2.yaml"}
        onClick={() => setFileName("rule2.yaml")}
      >
        rule2.yaml
      </button>
      <button
        disabled={fileName === "rule3.yaml"}
        onClick={() => setFileName("rule3.yaml")}
      >
        rule3.yaml
      </button>
      <MonacoEditor schema={rulesSchema} value={rule.value} width={800} height={900} />
    </>
  );
}

export default App;
