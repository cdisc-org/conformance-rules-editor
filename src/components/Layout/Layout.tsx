import MonacoEditor from "../MonacoEditor/MonacoEditor";
import ExplorerList from "../ExplorerList/ExplorerList";
import Stack from "@material-ui/core/Stack";
import Controls from "../Controls/Controls";
import SplitPane from "react-split-pane"
import './Resizer.css'
import GeneralAlert from "../GeneralAlert/GeneralAlert";

export default function Layout() {
    return (
        <>
            <SplitPane split="vertical" defaultSize={200} allowResize={true}>
                <Stack sx={{ maxHeight: '100%', overflow: 'auto' }}>
                    <Controls />
                    <ExplorerList />
                </Stack>
                <Stack >
                    <MonacoEditor height="100vh" />
                </Stack>
            </SplitPane>
            <GeneralAlert anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
        </>
    );
}
