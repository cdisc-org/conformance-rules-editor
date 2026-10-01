import React, { useContext, useState } from 'react';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AppContext from "../AppContext";
import { AlertColor } from "@mui/material";

interface Props {
    anchorOrigin: SnackbarOrigin
}

export interface AlertState {
    message: string;
    severity: AlertColor;
}

export default function GeneralAlert(props: Props) {
    const { alertState, setAlertState } = useContext(AppContext);
    // Remember the last alert so its content stays the same while the Snackbar
    // plays its exit transition. Falling back to an empty "error" alert there
    // made every closing notification flash red (#215).
    const [lastAlertState, setLastAlertState] = useState<AlertState>(alertState);
    if (alertState !== null && alertState !== lastAlertState) {
        setLastAlertState(alertState);
    }
    const shownAlertState = alertState ?? lastAlertState;
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
            <Alert severity={shownAlertState?.severity ?? "info"} onClose={handleClose}>
                {shownAlertState?.message ?? ""}
            </Alert>
        </Snackbar>
    );
}
