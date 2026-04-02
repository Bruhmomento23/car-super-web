import * as React from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function WorkshopPortal() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(145deg, rgba(12,32,62,0.04), rgba(12,32,62,0.01))',
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.2 }}>
            Workshop Portal
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Your workshop account is active
          </Typography>
          <Typography color="text.secondary">
            You are signed in as a workshop owner. We can now connect this portal to workshop dashboard modules,
            booking management, and verification workflows.
          </Typography>

          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 3,
              backgroundColor: 'background.default',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Planned next steps
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Workshop profile completion and verification status.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2. Claimed workshop listing and booking queue management.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3. Performance dashboard and customer request analytics.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
            <Button variant="contained" onClick={() => navigate('/Services')}>
              Explore Service Feed
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
