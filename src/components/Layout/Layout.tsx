import YamlEditor from "../YamlEditor/YamlEditor";
import ExplorerList from "../ExplorerList/ExplorerList";
import Stack from "@mui/material/Stack";
import Controls from "../Controls/Controls";
import SplitPane from "react-split-pane";
import "./Resizer.css";
import GeneralAlert from "../GeneralAlert/GeneralAlert";
import { Box } from "@mui/system";
import { Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import TestPanel from "../TestPanel/TestPanel";

enum TabIds {
  Edit,
  Test,
}

interface ITabPanelProps {
  children?: React.ReactNode;
  tabId: TabIds;
  selectedTab: TabIds;
  scrollBars?: boolean;
}

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
  const [selectedTab, setSelectedTab] = useState<TabIds>(TabIds.Edit);
  const [splitPaneWidth, setSplitPaneWidth] = useState<number>();
  const [tabsPaneHeight, setTabsPaneHeight] = useState<number>();
  const { height, width } = useWindowDimensions();

  const handleTabChange = (
    event: React.SyntheticEvent,
    newSelectedTab: TabIds
  ) => {
    setSelectedTab(newSelectedTab);
  };

  function TabPanel(props: ITabPanelProps) {
    const { children, selectedTab, tabId, scrollBars } = props;

    return (
      <div
        role="tabpanel"
        hidden={selectedTab !== tabId}
        id={`tabpanel-${tabId}`}
        style={{
          ...(tabsPaneHeight
            ? {
                height: `${height - tabsPaneHeight}px`,
              }
            : {}),
          ...(scrollBars
            ? {
                overflow: "auto",
              }
            : {}),
        }}
      >
        {selectedTab === tabId && <>{children}</>}
      </div>
    );
  }

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
          <Box
            ref={(newRef: any) =>
              setTabsPaneHeight(newRef ? newRef.offsetHeight : 0)
            }
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="Edit" />
              <Tab label="Test" />
            </Tabs>
          </Box>
          <TabPanel selectedTab={selectedTab} tabId={TabIds.Edit}>
            <YamlEditor />
          </TabPanel>
          <TabPanel
            selectedTab={selectedTab}
            tabId={TabIds.Test}
            scrollBars={true}
          >
            <TestPanel />
          </TabPanel>
        </Stack>
      </SplitPane>
      <GeneralAlert
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
