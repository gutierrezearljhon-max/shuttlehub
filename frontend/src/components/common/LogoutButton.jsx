import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';

const LogoutButton = ({ variant = 'contained', fullWidth = false, size = 'medium', showIcon = true }) => {
  const { logout } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    setOpenDialog(false);
  };

  return (
    <>
      <Button
        variant={variant}
        color="error"
        fullWidth={fullWidth}
        size={size}
        onClick={handleOpenDialog}
        startIcon={showIcon && <LogoutIcon />}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Logout'}
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LogoutIcon color="error" />
            <Typography variant="h6">Confirm Logout</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout? You will need to login again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleLogout} variant="contained" color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;