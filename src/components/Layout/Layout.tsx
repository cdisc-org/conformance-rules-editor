import YamlEditor from "../YamlEditor/YamlEditor";
import ExplorerList from "../ExplorerList/ExplorerList";
import Stack from "@mui/material/Stack";
import Controls from "../Controls/Controls";
import SplitPane from "react-split-pane";
import "./Resizer.css";
import GeneralAlert from "../GeneralAlert/GeneralAlert";
import { useEffect, useState } from "react";
import TestPanel from "../TestPanel/TestPanel";
import TabGroup from "../TabGroup/TabGroup";

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

  return (
    <>
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
              { label: "Edit", children: <YamlEditor /> },
              { label: "Test", children: <TestPanel />, scrollBars: true },
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
