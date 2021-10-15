import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

interface Props {
    contentText,
    open,
    setOpen,
    handleOkay,
}

export default function PromptDialog(props: Props) {

    const handleOkay = () => {
        props.handleOkay();
        handleClose();
    };

    const handleClose = () => {
        props.setOpen(false);
    };

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            aria-describedby="alert-dialog-description"
        >
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {props.contentText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOkay} color="primary" autoFocus>
                    Okay
                </Button>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
