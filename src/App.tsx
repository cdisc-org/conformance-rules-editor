<<<<<<< HEAD
import './App.css';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Layout />
=======
import React, { useContext, useState } from "react";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { ForceLogin } from "./components/AuthenticationProvider";
import "./App.css";
import AppContext from "./components/AppContext";
import MonacoEditor from "./components/MonacoEditor/MonacoEditor";
import rulesSchema from './resources/RulesSchema';
import testRules from "./resources/TestRules";

function App() {
  const { dataService } = useContext(AppContext)
  const [fileName, setFileName] = useState("rule1.yaml");
  const rule = testRules[fileName];
  dataService.getRules()
  return (
    <>
      <UnauthenticatedTemplate>
        <ForceLogin />
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
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
    </AuthenticatedTemplate>
  </>
>>>>>>> 041b488 (Add user auth and API request structure)
  );
}

export default App;
