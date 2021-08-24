import Button from "@material-ui/core/Button";

interface Props {
}

const Controls: React.FC<Props> = (props) => {

    return (<>
        <Button variant="outlined">New Rule</Button>
        <Button variant="outlined">Save Rule</Button>
    </>);

}
export default Controls;
