import ListItem from '@material-ui/core/ListItem';
import ListItemText from "@material-ui/core/ListItemText";
import Typography from '@material-ui/core/Typography';
import { useContext } from "react";
import AppContext from "../AppContext";

interface Props {
    storageId,
    coreId,
    ruleType,
    description
}

export default function ExplorerItem(props: Props) {

    const { selectedRule, setSelectedRule, isRuleDirty } = useContext(AppContext);

    const handleListItemClick = (event) => {
        setSelectedRule(props.storageId);
    };

    return (
        <>
            <ListItem alignItems="flex-start" onClick={(event) => handleListItemClick(event)} disabled={isRuleDirty()} selected={selectedRule === props.storageId}
                divider={true} button={true}>
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
        </>
    );
}
