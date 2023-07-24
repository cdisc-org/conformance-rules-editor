import { Tab, Tabs } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";

interface ITabPanel {
  label: string;
  persist: boolean /* Should the tab panel stay mounted when it is inactive? */;
  children: React.ReactNode;
  scrollBars?: boolean;
  index?: number;
  selectedTab?: number;
  parentHeight?: number;
  tabsPaneHeight?: number;
}

interface ITabGroup {
  parentHeight: number;
  tabPanels: ITabPanel[];
}

function TabPanel(props: ITabPanel) {
  const {
    persist,
    children,
    scrollBars,
    index,
    selectedTab,
    parentHeight,
    tabsPaneHeight,
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={selectedTab !== index}
      id={`tabpanel-${index}`}
      style={{
        ...(tabsPaneHeight
          ? {
              height: `${parentHeight - tabsPaneHeight}px`,
            }
          : {}),
        ...(scrollBars
          ? {
              overflow: "auto",
            }
          : {}),
      }}
    >
      {(persist || selectedTab === index) && <>{children}</>}
    </div>
  );
}

export default function TabGroup(props: ITabGroup) {
  const { parentHeight, tabPanels } = props;
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [tabsPaneHeight, setTabsPaneHeight] = useState<number>();

  const handleTabChange = (
    event: React.SyntheticEvent,
    newSelectedTab: number
  ) => {
    setSelectedTab(newSelectedTab);
  };

  return (
    <>
      <Box
        ref={(newRef: any) =>
          setTabsPaneHeight(newRef ? newRef.offsetHeight : 0)
        }
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tabs value={selectedTab} onChange={handleTabChange}>
          {tabPanels.map((tabPanel: ITabPanel, tabPanelIndex: number) => (
            <Tab key={tabPanelIndex} label={tabPanel.label} />
          ))}
        </Tabs>
      </Box>
      {tabPanels.map((tabPanel: ITabPanel, tabPanelIndex: number) => (
        <TabPanel
          label={tabPanel.label}
          persist={tabPanel.persist}
          {...(tabPanel.scrollBars ? { scrollBars: tabPanel.scrollBars } : {})}
          index={tabPanelIndex}
          key={tabPanelIndex}
          selectedTab={selectedTab}
          parentHeight={parentHeight}
          tabsPaneHeight={tabsPaneHeight}
        >
          {tabPanel.children}
        </TabPanel>
      ))}
    </>
  );
}
