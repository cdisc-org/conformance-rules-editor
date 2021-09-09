import React, { useContext } from 'react';
import Snackbar, { SnackbarOrigin } from '@material-ui/core/Snackbar';
import Alert from '@material-ui/core/Alert';
import AppContext from "../AppContext";
import { AlertColor } from "@material-ui/core";

interface Props {
    anchorOrigin: SnackbarOrigin
}

export interface AlertState {
    message: string;
    severity: AlertColor;
}

export default function GeneralAlert(props: Props) {
    const { alertState, setAlertState } = useContext(AppContext);
    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlertState(null);
    };

    return (
        <Snackbar
            anchorOrigin={props.anchorOrigin}
            open={alertState !== null}
            autoHideDuration={5000}
            onClose={handleClose}>
            <Alert severity={alertState === null ? "error" : alertState.severity} onClose={handleClose}>
                {alertState === null ? "" : alertState.message}
            </Alert>
        </Snackbar>
    );
}
