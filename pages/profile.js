import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Import components
import UserProfile from '../components/profile/UserProfile';
import SavedAddresses from '../components/profile/SavedAddresses';
import PaymentMethods from '../components/profile/PaymentMethods';
import Settings from '../components/profile/Settings';

// Import mock data
import { 
  userProfile, 
  savedAddresses, 
  paymentMethods, 
  userSettings 
} from '../lib/mockData';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState(userProfile);
  const [addresses, setAddresses] = useState(savedAddresses);
  const [payments, setPayments] = useState(paymentMethods);
  const [settings, setSettings] = useState(userSettings);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle drawer toggle
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Handle selection from drawer menu (mobile)
  const handleDrawerSelection = (index) => {
    setTabValue(index);
    setDrawerOpen(false);
  };
  
  // Tab content mapping
  const tabContent = [
    { icon: <PersonIcon />, label: 'Profile', component: <UserProfile user={profile} onUserUpdate={setProfile} /> },
    { icon: <LocationOnIcon />, label: 'Addresses', component: <SavedAddresses addresses={addresses} onAddressChange={setAddresses} /> },
    { icon: <CreditCardIcon />, label: 'Payment', component: <PaymentMethods paymentMethods={payments} onPaymentMethodChange={setPayments} /> },
    { icon: <SettingsIcon />, label: 'Settings', component: <Settings onSettingsChange={setSettings} /> }
  ];
  
  // Drawer content
  const drawer = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {tabContent.map((item, index) => (
          <ListItem 
            button 
            key={item.label} 
            onClick={() => handleDrawerSelection(index)}
            selected={tabValue === index}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Mobile Toolbar */}
      {isMobile && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {tabContent[tabValue].label}
          </Typography>
        </Box>
      )}
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Grid container spacing={3}>
        {/* Sidebar for Desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ height: '100%' }}>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={tabValue}
                onChange={handleTabChange}
                aria-label="Profile tabs"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                {tabContent.map((tab) => (
                  <Tab 
                    key={tab.label} 
                    icon={tab.icon} 
                    label={tab.label} 
                    sx={{ 
                      minHeight: 64, 
                      alignItems: 'flex-start', 
                      justifyContent: 'flex-start', 
                      textAlign: 'left',
                      minWidth: '100%' 
                    }} 
                  />
                ))}
              </Tabs>
            </Paper>
          </Grid>
        )}
        
        {/* Main Content */}
        <Grid item xs={12} md={!isMobile ? 9 : 12}>
          {tabContent.map((tab, index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
} 