import { Tab, Tabs } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";

interface ITabPanel {
  label: string;
  children: React.ReactNode;
  scrollBars?: boolean;
  index?: number;
}

interface ITabGroup {
  parentHeight: number;
  tabPanels: ITabPanel[];
}

export default function TabGroup(props: ITabGroup) {
  const { parentHeight, tabPanels } = props;
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [tabsPaneHeight, setTabsPaneHeight] = useState<number>();

  const handleTchildrenhange = (
    event: React.SyntheticEvent,
    newSelectedTab: number
  ) => {
    setSelectedTab(newSelectedTab);
  };

  function TabPanel(props: ITabPanel) {
    const { children, scrollBars, index } = props;

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
        {selectedTab === index && <>{children}</>}
      </div>
    );
  }

  return (
    <>
      <Box
        ref={(newRef: any) =>
          setTabsPaneHeight(newRef ? newRef.offsetHeight : 0)
        }
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tabs value={selectedTab} onChange={handleTchildrenhange}>
          {tabPanels.map((tabPanel: ITabPanel, tabPanelIndex: number) => (
            <Tab key={tabPanelIndex} label={tabPanel.label} />
          ))}
        </Tabs>
      </Box>
      {tabPanels.map((tabPanel: ITabPanel, tabPanelIndex: number) => (
        <TabPanel
          label={tabPanel.label}
          {...(tabPanel.scrollBars ? { scrollBars: tabPanel.scrollBars } : {})}
          index={tabPanelIndex}
          key={tabPanelIndex}
        >
          {tabPanel.children}
        </TabPanel>
      ))}
    </>
  );
}
