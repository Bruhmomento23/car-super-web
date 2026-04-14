import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import { 
  Box, AppBar, Toolbar, Button, IconButton, Container, 
  Divider, MenuItem, Drawer, Menu, Typography, Stack 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../backend/Firebase_config';

// Icons/Theme Components
import ColorModeIconDropdown from '../theme/ColorModelIconDropdown';
import SitemarkIcon from './SitemarkIcon';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut(auth);
    navigate('/');
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <SitemarkIcon />
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
              
              {user && (
                <>
                <Button variant="text" color="info" size="small" component={Link} to="/">Home</Button>
                  <Button variant="text" color="info" size="small" component={Link} to="/Services">Services</Button>
                  <Button variant="text" color="info" size="small" component={Link} to="/Bookings">My Bookings</Button>
                  <Button variant="text" color="info" size="small" component={Link} to="/Contact">Contact Us</Button>
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {!user ? (
              <>
                <Button color="primary" variant="text" size="small" component={Link} to="/SignIn">Sign in</Button>
                <Button color="primary" variant="contained" size="small" component={Link} to="/SignUp">Sign up</Button>
                {/* Keep theme toggle outside if logged out for easier access */}
                <ColorModeIconDropdown />
              </>
            ) : (
              <>
                <IconButton
                  size="large"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{ p: 0.5 }}
                >
                  <AccountCircle color="primary" fontSize="large" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  disableScrollLock
                  PaperProps={{
                    sx: { mt: 1.5, minWidth: 200, borderRadius: 3, p: 1 }
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" noWrap>{user.email}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  
                  {/* Theme Toggle moved INSIDE the menu */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
                    <Typography variant="body2">Appearance</Typography>
                    <ColorModeIconDropdown />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <MenuItem onClick={handleMenuClose} component={Link} to="/Profile">
                    <PersonIcon fontSize="small" sx={{ mr: 1.5 }} /> Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Mobile View */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              disableScrollLock
              PaperProps={{ sx: { top: 'var(--template-frame-height, 0px)' } }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6" fontWeight="bold">Menu</Typography>
                   <IconButton onClick={toggleDrawer(false)}><CloseRoundedIcon /></IconButton>
                </Box>
                
                <MenuItem component={Link} to="/" onClick={toggleDrawer(false)}>Home</MenuItem>
                {user && (
                  <>
                    <MenuItem component={Link} to="/Services" onClick={toggleDrawer(false)}>Services</MenuItem>
                    <MenuItem component={Link} to="/Bookings" onClick={toggleDrawer(false)}>My Bookings</MenuItem>
                    <MenuItem component={Link} to="/Profile" onClick={toggleDrawer(false)}>Profile</MenuItem>
                    <MenuItem component={Link} to="/Contact" onClick={toggleDrawer(false)}>Contact Us</MenuItem>
                  </>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, mb: 2 }}>
                  <Typography variant="body2">Theme</Typography>
                  <ColorModeIconDropdown />
                </Box>

                {!user ? (
                  <Stack spacing={1}>
                    <Button color="primary" variant="contained" fullWidth component={Link} to="/SignUp" onClick={toggleDrawer(false)}>Sign up</Button>
                    <Button color="primary" variant="outlined" fullWidth component={Link} to="/SignIn" onClick={toggleDrawer(false)}>Sign in</Button>
                  </Stack>
                ) : (
                  <Button color="error" variant="contained" fullWidth onClick={() => { handleLogout(); setOpen(false); }}>
                    Logout
                  </Button>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}