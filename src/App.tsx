import { useContext } from "react";
import "./App.css";
import AppContext from "./components/AppContext";
import Layout from './components/Layout/Layout';

function App() {
  const { dataService } = useContext(AppContext)
  dataService.get_rules()
  return (
    <Layout />
  );
}

export default App;
