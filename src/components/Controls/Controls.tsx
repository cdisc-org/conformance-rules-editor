import Button from "@material-ui/core/Button";

interface Props {
    fileName,
    setFileName
}

const Controls: React.FC<Props> = (props) => {

    return (<>
        <Button variant="outlined">New Rule</Button>
        <Button variant="outlined">Save Rule</Button>

        <br />
        These 3 buttons will be replaced by the explorer list below them:
        <button
            disabled={props.fileName === "rule1.yaml"}
            onClick={() => props.setFileName("rule1.yaml")}
        >
            rule1.yaml
        </button>
        <button
            disabled={props.fileName === "rule2.yaml"}
            onClick={() => props.setFileName("rule2.yaml")}
        >
            rule2.yaml
        </button>
        <button
            disabled={props.fileName === "rule3.yaml"}
            onClick={() => props.setFileName("rule3.yaml")}
        >
            rule3.yaml
        </button>
        <br />

    </>);

}
export default Controls;
