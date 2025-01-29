import { styled } from '@mui/material/styles';
import { Toolbar } from '@mui/material';

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: 70,
  display: 'flex',
  justifyContent: 'space-between',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1),
  },
}));