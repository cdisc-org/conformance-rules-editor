import YamlEditor from "../YamlEditor/YamlEditor";
import ExplorerList from "../ExplorerList/ExplorerList";
import Stack from "@mui/material/Stack";
import Controls from "../Controls/Controls";
import { SplitPane } from "react-multi-split-pane";
import "./Resizer.css";
import GeneralAlert from "../GeneralAlert/GeneralAlert";
import { useEffect, useState } from "react";
import TabGroup from "../TabGroup/TabGroup";
import SyntaxTestStep from "../TestStep/SyntaxTestStep";
import SchemaTestStep from "../TestStep/SchemaTestStep";
import JsonTestStep from "../TestStep/JsonTestStep";
import LoadDatasetsTestStep from "../TestStep/LoadDatasetsTestStep";
import ResultsTestStep from "../TestStep/ResultsTestStep";
import LoadDefineXMLTestStep from "../TestStep/LoadDefineXMLTestStep";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export default function Layout() {
  const { height } = useWindowDimensions();

  return (
    <>
      <SplitPane split="vertical" defaultSizes={[2, 3]}>
        <Stack sx={{ maxHeight: "100%", overflow: "auto" }}>
          <Controls />
          <ExplorerList />
        </Stack>
        <Stack
          sx={{
            height: "100%",
            width: "100%",
          }}
        >
          <TabGroup
            parentHeight={height}
            tabPanels={[
              { label: "Edit", persist: true, children: <YamlEditor /> },
              {
                label: "Test",
                persist: false,
                children: (
                  <>
                    <SyntaxTestStep />
                    <SchemaTestStep />
                    <JsonTestStep />
                    <LoadDefineXMLTestStep />
                    <LoadDatasetsTestStep />
                    <ResultsTestStep />
                  </>
                ),
                scrollBars: true,
              },
            ]}
          />
        </Stack>
      </SplitPane>
      <GeneralAlert
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
