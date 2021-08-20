import MonacoEditor from "../MonacoEditor/MonacoEditor";
import rulesSchema from '../../resources/RulesSchema';

import Explorer from "../Explorer/Explorer";
import Stack from "@material-ui/core/Stack";
import Controls from "../Controls/Controls";
import { useState } from "react";
import testRules from "../../resources/TestRules";
import SplitPane from "react-split-pane"
import './Resizer.css'

const Layout: React.FC = () => {

    const [fileName, setFileName] = useState("rule1.yaml");
    const rule = testRules[fileName];


    return (
        <SplitPane split="vertical" defaultSize={200} allowResize={true}>
            <Stack sx={{ maxHeight: '100%', overflow: 'auto' }}>
                <Controls fileName={fileName} setFileName={setFileName} />
                <Explorer />
            </Stack>
            <Stack >
                <MonacoEditor height="100vh" schema={rulesSchema} value={rule.value} />
            </Stack>
        </SplitPane>
    );
}

export default Layout;
