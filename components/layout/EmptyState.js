import { Typography, Paper } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const ICONS = {
  'directions_car': DriveEtaIcon,
  'receipt': ReceiptIcon,
  'map': MapIcon,
  'person': PersonIcon
};

export default function EmptyState({ 
  title = 'No data found', 
  description = 'There are no items to display.', 
  icon = 'sentiment_dissatisfied' 
}) {
  // Choose the icon component
  let IconComponent = SentimentDissatisfiedIcon;
  if (ICONS[icon]) {
    IconComponent = ICONS[icon];
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2,
        mt: 2
      }}
    >
      <IconComponent 
        sx={{ 
          fontSize: 48, 
          color: 'text.secondary',
          mb: 2 
        }} 
      />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
} 