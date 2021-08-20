import React, { useState } from "react";
import MonacoEditor from "../MonacoEditor/MonacoEditor";
import rulesSchema from '../../resources/RulesSchema';
import testRules from "../../resources/TestRules";
import Explorer from "../Explorer/Explorer";
import Stack from "@material-ui/core/Stack";
import Button from "@material-ui/core/Button";

const Layout: React.FC = ({ children }: { children: React.ReactNode }) => {


    const [fileName, setFileName] = useState("rule1.yaml");
    const rule = testRules[fileName];

    // TODO: List should scroll independently
    // TODO: monaco should fill
    // TODO: show star when rule has been edited
    //TODO: versioning
    //TODO: padding between edges

    return (
        <>

            <Stack width="100%" direction="row" spacing={1}>
                <Stack width="10%" spacing={1}>
                    <Button variant="contained">New Rule</Button>
                    <Button variant="contained">Save Rule</Button>
                    <button
                        disabled={fileName === "rule1.yaml"}
                        onClick={() => setFileName("rule1.yaml")}
                    >
                        rule1.yaml
                    </button>
                    <button
                        disabled={fileName === "rule2.yaml"}
                        onClick={() => setFileName("rule2.yaml")}
                    >
                        rule2.yaml
                    </button>
                    <button
                        disabled={fileName === "rule3.yaml"}
                        onClick={() => setFileName("rule3.yaml")}
                    >
                        rule3.yaml
                    </button>
                    <Explorer />
                </Stack>
                <MonacoEditor width="90%" height="100vh" schema={rulesSchema} value={rule.value} />
            </Stack>




        </>
    );
}

export default Layout;
