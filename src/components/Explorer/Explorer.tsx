import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from "@material-ui/core/ListItemText";
import Typography from '@material-ui/core/Typography';
import { Fragment } from "react";

const Explorer: React.FC = ({ children }: { children: React.ReactNode }) => {

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="RULEID1"
                    secondary={
                        <>
                            <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                RuleType1
                            </Typography>
                            {" Rule description1"}
                        </>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="RULEID2"
                    secondary={
                        <>
                            <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                RuleType2
                            </Typography>
                            {" Rule Description2"}
                        </>
                    }
                />
            </ListItem>

        </List>
    );
}

export default Explorer;
