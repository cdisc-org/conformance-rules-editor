import Divider from "@material-ui/core/Divider";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from "@material-ui/core/ListItemText";
import Typography from '@material-ui/core/Typography';

interface Props {
    storageId,
    coreId,
    ruleType,
    description,
}

const ExplorerItem: React.FC<Props> = (props) => {

    return (
        <>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary={props.coreId}
                    secondary={
                        <>
                            <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                {props.ruleType}
                            </Typography>
                            <br />{props.description}
                        </>
                    }
                />
            </ListItem>
            <Divider variant="fullWidth" component="li" />
        </>
    );
}

export default ExplorerItem;
