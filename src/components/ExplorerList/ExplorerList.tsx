import List from "@material-ui/core/List";


interface Props {
    items
}

const ExplorerList: React.FC<Props> = (props) => {

    return (
        <List id="explorer" sx={{ width: '100%', overflow: 'auto', bgcolor: 'background.paper' }} >
            {props.items}
        </List>
    );
}

export default ExplorerList;
