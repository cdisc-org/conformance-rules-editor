import Button from "@material-ui/core/Button";

interface Props {
    preEditRule,
    setPreEditRule,
    postEditRule,
    setPosEditRule,
}

const Controls: React.FC<Props> = (props) => {

    return (<>
        <Button variant="outlined">New Rule</Button>
        <Button variant="outlined" disabled={props.preEditRule === props.postEditRule}>Save Rule</Button>
    </>);

}
export default Controls;
