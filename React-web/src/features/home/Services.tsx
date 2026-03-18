import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid'; // Using Grid2 for modern 'size' prop
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';

// Icons for the Auto Workshop look
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

import AppTheme from '../../theme/AppTheme';
import AppAppBar from '../../components/AppAppBar';
import Footer from '../../components/Footer';

export default function Services(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />

      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 16 }, mb: 10 }}>
        <Grid container spacing={4}>
          
          {/* LEFT SIDE: Search & Filters (3.5 units wide) */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                position: { md: 'sticky' }, 
                top: '100px', 
                bgcolor: 'background.paper' 
              }}
            >
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Your search
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Location" placeholder="Near me / City" fullWidth size="small" />
                <TextField label="Service Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} />
                <TextField label="Vehicle Type" placeholder="e.g. SUV, Sedan" fullWidth size="small" />
                
                <Button variant="contained" size="large" fullWidth sx={{ mt: 1, borderRadius: 2, fontWeight: 'bold' }}>
                  Find Workshops
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" fontWeight="700" gutterBottom>
                Popular filters
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Open Now" />
                <FormControlLabel control={<Checkbox size="small" />} label="Mobile Service (We come to you)" />
                <FormControlLabel control={<Checkbox size="small" />} label="Warranty Included" />
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT SIDE: Dashboard & Results (8.5 units wide) */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            
            {/* 1. SECTION: POPULAR SEARCHES (From App Screenshot) */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box component="span" sx={{ color: 'primary.main' }}>⚡</Box> Popular Searches
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Chip icon={<SettingsIcon />} label="Oil Change" onClick={() => {}} variant="outlined" sx={{ borderRadius: 3, px: 1, py: 2.5, color: 'primary.main', fontWeight: 'bold' }} />
                <Chip icon={<LocalCarWashIcon />} label="Car Wash" onClick={() => {}} variant="outlined" sx={{ borderRadius: 3, px: 1, py: 2.5, color: 'primary.main', fontWeight: 'bold' }} />
                <Chip icon={<BuildIcon />} label="Brake Service" onClick={() => {}} variant="outlined" sx={{ borderRadius: 3, px: 1, py: 2.5, color: 'primary.main', fontWeight: 'bold' }} />
                <Chip icon={<TireRepairIcon />} label="Tire Rotation" onClick={() => {}} variant="outlined" sx={{ borderRadius: 3, px: 1, py: 2.5, color: 'primary.main', fontWeight: 'bold' }} />
              </Box>
            </Box>

            {/* 2. SECTION: BROWSE CATEGORIES (From App Screenshot) */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="800">Browse Categories</Typography>
                <Button size="small" sx={{ textTransform: 'none', fontWeight: 'bold' }}>View All</Button>
              </Box>
              
              <Grid container spacing={2}>
                {/* Category 1 */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, textAlign: 'center', bgcolor: 'rgba(0, 102, 255, 0.03)', border: '1px solid rgba(0, 102, 255, 0.1)' }}>
                    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderRadius: 3, display: 'inline-flex', mb: 1, boxShadow: '0 4px 10px rgba(0,102,255,0.3)' }}>
                      <BuildIcon />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">General Care</Typography>
                    <Typography variant="caption" color="text.secondary">150+ workshops</Typography>
                  </Paper>
                </Grid>

                {/* Category 2 */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, textAlign: 'center', bgcolor: 'rgba(255, 51, 102, 0.03)', border: '1px solid rgba(255, 51, 102, 0.1)' }}>
                    <Box sx={{ bgcolor: '#ff3366', color: 'white', p: 1.5, borderRadius: 3, display: 'inline-flex', mb: 1, boxShadow: '0 4px 10px rgba(255,51,102,0.3)' }}>
                      <AutoFixHighIcon />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">Bodywork</Typography>
                    <Typography variant="caption" color="text.secondary">89+ workshops</Typography>
                  </Paper>
                </Grid>

                {/* Category 3 */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, textAlign: 'center', bgcolor: 'rgba(156, 39, 176, 0.03)', border: '1px solid rgba(156, 39, 176, 0.1)' }}>
                    <Box sx={{ bgcolor: '#9c27b0', color: 'white', p: 1.5, borderRadius: 3, display: 'inline-flex', mb: 1, boxShadow: '0 4px 10px rgba(156,39,176,0.3)' }}>
                      <BatteryChargingFullIcon />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">Battery</Typography>
                    <Typography variant="caption" color="text.secondary">45+ workshops</Typography>
                  </Paper>
                </Grid>

                {/* Category 4 */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, textAlign: 'center', bgcolor: 'rgba(76, 175, 80, 0.03)', border: '1px solid rgba(76, 175, 80, 0.1)' }}>
                    <Box sx={{ bgcolor: '#4caf50', color: 'white', p: 1.5, borderRadius: 3, display: 'inline-flex', mb: 1, boxShadow: '0 4px 10px rgba(76,175,80,0.3)' }}>
                      <LocalCarWashIcon />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">Cleaning</Typography>
                    <Typography variant="caption" color="text.secondary">110+ workshops</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* 3. SECTION: ACTUAL WORKSHOP RESULTS */}
            <Typography variant="h5" fontWeight="800" sx={{ mb: 3 }}>
              Recommended Workshops
            </Typography>

            {[1, 2, 3].map((item) => (
              <Card 
                key={item} 
                variant="outlined" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 4, 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  overflow: 'hidden'
                }}
              >
                {/* Image Section */}
                <Box 
                  sx={{ 
                    width: { xs: '100%', sm: 280 }, 
                    minHeight: 200, 
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                   <Typography variant="caption" color="text.secondary">Workshop Photo</Typography>
                </Box>

                {/* Content Section */}
                <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h5" fontWeight="700">AutoPro Workshop {item}</Typography>
                      <Box sx={{ textAlign: 'right' }}>
                         <Typography variant="subtitle2" color="success.main" fontWeight="bold">Excellent 9.8</Typography>
                         <Typography variant="caption" color="text.secondary">450 reviews</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      2.5 km from your location • Open until 19:00
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                       <Button size="small" variant="text" sx={{ borderRadius: 5, textTransform: 'none', bgcolor: 'action.hover', px: 2, minWidth: 0, color: 'text.primary', fontWeight: 'bold', fontSize: '0.75rem' }}>
                         #Certified
                       </Button>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" fontWeight="800">from $45</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>Estimate for General Care</Typography>
                      <Button variant="contained" sx={{ borderRadius: 2 }}>Book Appointment</Button>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}

            {/* VIEW MORE BUTTON */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="outlined" 
                size="large" 
                sx={{ borderRadius: 3, px: 8, py: 1.5, fontWeight: 'bold', textTransform: 'none', borderWidth: 2 }}
              >
                View more workshops
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Container>

      <Footer />
    </AppTheme>
  );
}