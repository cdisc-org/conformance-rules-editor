import YamlEditor from "../YamlEditor/YamlEditor";
import ExplorerList from "../ExplorerList/ExplorerList";
import Stack from "@mui/material/Stack";
import Controls from "../Controls/Controls";
import SplitPane from "react-split-pane";
import "./Resizer.css";
import GeneralAlert from "../GeneralAlert/GeneralAlert";
import { useEffect, useState, useContext } from "react";
import TabGroup from "../TabGroup/TabGroup";
import SyntaxTestStep from "../TestStep/SyntaxTestStep";
import SchemaTestStep from "../TestStep/SchemaTestStep";
import JsonTestStep from "../TestStep/JsonTestStep";
import LoadTestStep from "../TestStep/LoadTestStep";
import ResultsTestStep from "../TestStep/ResultsTestStep";
import AppContext from "../AppContext";

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
  const [splitPaneWidth, setSplitPaneWidth] = useState<number>();
  const { height, width } = useWindowDimensions();
  const { modifiedRule, setModifiedRule, isRuleModifiable } = useContext(
    AppContext
  );

  return (
    <>
      {/* 
      // @ts-expect-error */}
      <SplitPane
        ref={(newRef: any) =>
          setSplitPaneWidth(newRef ? newRef.pane1.offsetWidth : 0)
        }
        split="vertical"
        defaultSize={"40%"}
        allowResize={true}
        onDragFinished={(size: number) => setSplitPaneWidth(size)}
      >
        <Stack sx={{ maxHeight: "100%", overflow: "auto" }}>
          <Controls />
          <ExplorerList />
        </Stack>
        <Stack
          sx={{
            height: "100%",
            ...(splitPaneWidth
              ? {
                  width: `${width - splitPaneWidth}px`,
                }
              : {}),
          }}
        >
          <TabGroup
            parentHeight={height}
            tabPanels={[
              {
                label: "Edit",
                children: (
                  <YamlEditor
                    value={modifiedRule}
                    onChange={setModifiedRule}
                    schemaUri="/schema/CORE-base.json"
                  />
                ),
              },
              {
                label: "Test",
                children: (
                  <>
                    <SyntaxTestStep />
                    <SchemaTestStep />
                    <JsonTestStep />
                    <LoadTestStep />
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
