import List from "@material-ui/core/List";
import ExplorerItem from "../ExplorerItem/ExplorerItem";
import AppContext from "../AppContext";
import { useEffect, useState, useContext } from "react";

interface Props {
}

export default function ExplorerList(props: Props) {

    const [rulesList, setRulesList] = useState([]);
    const { dataService, dirtyExplorerList, setDirtyExplorerList } = useContext(AppContext);

    /* Load list of rules */
    useEffect(() => {
        if (dirtyExplorerList) {
            /* Unset before the async call so that api is only called once */
            setDirtyExplorerList(false);
            dataService.get_rules()
                .then(function (response) {
                    return response.json();
                })
                .then(function (responseJson) {
                    setRulesList(JSON.parse(responseJson.body).data.map((ruleItem, ruleIndex) => (
                        <ExplorerItem key={ruleItem.id} storageId={ruleItem.id} coreId={ruleItem.attributes.title} ruleType={ruleItem.attributes.field_rule_type} creator={ruleItem.attributes.field_creator} />
                    )));
                });
        }
    }, [dataService, dirtyExplorerList, setDirtyExplorerList]);

    return (
        <List sx={{ width: '100%', overflow: 'auto', bgcolor: 'background.paper' }} >
            {rulesList}
        </List>
    );
}
