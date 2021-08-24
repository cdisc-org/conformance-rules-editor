import MonacoEditor from "../MonacoEditor/MonacoEditor";

import ExplorerList from "../ExplorerList/ExplorerList";
import ExplorerItem from "../ExplorerItem/ExplorerItem";
import Stack from "@material-ui/core/Stack";
import Controls from "../Controls/Controls";
import { useEffect, useState } from "react";
import testRules from "../../resources/TestRules";
import SplitPane from "react-split-pane"
import './Resizer.css'

const Layout: React.FC = () => {

    const [fileName, setFileName] = useState("rule1.yaml");
    const rule = testRules[fileName];

    const [rulesSchema, setRulesSchema] = useState([]);
    const getRulesSchema = () => {
        fetch('RulesSchema.json'
            , {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        )
            .then(function (response) {
                return response.json();
            })
            .then(function (responseJson) {
                setRulesSchema(responseJson)
            });
    }
    useEffect(() => {
        getRulesSchema()
    }, []);

    const [rulesList, setRulesList] = useState([]);
    const getRulesList = () => {
        fetch('all_rules.json'
            , {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        )
            .then(function (response) {
                return response.json();
            })
            .then(function (responseJson) {
                setRulesList(responseJson.data.map(item => (
                    <ExplorerItem storageId={item.id} coreId="RULEID1" ruleType={item.type} description="Rule description1" />
                )))
            });
    }
    useEffect(() => {
        getRulesList()
    }, []);

    return (
        <SplitPane split="vertical" defaultSize={200} allowResize={true}>
            <Stack sx={{ maxHeight: '100%', overflow: 'auto' }}>
                <Controls fileName={fileName} setFileName={setFileName} />
                <ExplorerList items={rulesList} />
            </Stack>
            <Stack >
                <MonacoEditor height="100vh" schema={rulesSchema} value={rule.value} />
            </Stack>
        </SplitPane>
    );
}

export default Layout;
