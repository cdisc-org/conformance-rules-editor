import MonacoEditor from "../MonacoEditor/MonacoEditor";

import ExplorerList from "../ExplorerList/ExplorerList";
import ExplorerItem from "../ExplorerItem/ExplorerItem";
import Stack from "@material-ui/core/Stack";
import Controls from "../Controls/Controls";
import { useEffect, useState, useContext } from "react";
import SplitPane from "react-split-pane"
import AppContext from "../AppContext";
import './Resizer.css'

const Layout: React.FC = () => {

    const [selectedRule, setSelectedRule] = useState();

    const [rulesSchema, setRulesSchema] = useState([]);
    const { dataService } = useContext(AppContext)
    const getRulesSchema = () => {
        fetch('schema/RulesSchema.json'
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
    useEffect(() => {
        dataService.get_rules()
            .then(function (response) {
                return response.json();
            })
            .then(function (responseJson) {
                setRulesList(JSON.parse(responseJson.body).data.map((ruleItem, ruleIndex) => (
                    <ExplorerItem storageId={ruleItem.id} coreId={ruleItem.attributes.title} ruleType={ruleItem.type} description={`Rule Description${ruleIndex + 1}`} setSelectedRule={setSelectedRule} />
                )));
            });
    }, [dataService]);

    return (
        <SplitPane split="vertical" defaultSize={200} allowResize={true}>
            <Stack sx={{ maxHeight: '100%', overflow: 'auto' }}>
                <Controls />
                <ExplorerList items={rulesList} />
            </Stack>
            <Stack >
                <MonacoEditor height="100vh" schema={rulesSchema} selectedRule={selectedRule} />
            </Stack>
        </SplitPane>
    );
}

export default Layout;
