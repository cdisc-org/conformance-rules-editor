import Button from "@material-ui/core/Button";
import React from "react";

interface Props {
    preEditRule,
    setPreEditRule,
    postEditRule,
    setPosEditRule,
}

class Controls extends React.Component<Props>  {

    constructor(props: Props) {
        super(props);

        // This binding is necessary to make `this` work in the callback
        this.newRule = this.newRule.bind(this);
    }


    newRule() {
        this.props.setPreEditRule("");
    }

    render() {
        return (<>
            <Button variant="outlined" disabled={this.props.preEditRule !== this.props.postEditRule} onClick={this.newRule}>New Rule</Button>
            <Button variant="outlined" disabled={this.props.preEditRule === this.props.postEditRule}>Save Rule</Button>
            <Button variant="outlined" disabled={this.props.preEditRule === this.props.postEditRule}>Discard Changes</Button>
        </>);
    }

}
export default Controls;
