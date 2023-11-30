import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Avatar, Popover, Stack, Typography } from '@mui/material';
import { useDashboard, logOut } from 'store/dashboard';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

const drawerWidth = 240;

const navLinks = [
  {
    text: 'Audio Tool',
    icon: <GppGoodOutlinedIcon />,
    path: '/audio-tool'
  },
  {
    text: 'Game Mode',
    icon: <SportsEsportsRoundedIcon />,
    path: '/match'
  },
  // JUST FOR TESTING STRIPE
  // {
  //   text: 'TEST PAYMENT',
  //   icon: <SportsEsportsRoundedIcon />,
  //   path: '/payment'
  // },
  {
    text: 'User',
    icon: <PersonOutlinedIcon />,
    path: '/user'
  },
  // {
  //   text: 'Archives',
  //   icon: <AccountBalanceWalletOutlinedIcon />,
  //   path: '/archives'
  // },
  {
    text: 'Range Test',
    icon: <SettingsOutlinedIcon />,
    path: '/range-test'
  },
  {
    text: 'FAQ',
    icon: <HelpOutlineOutlinedIcon />,
    path: '/faq'
  }
];

export const Navigation = () => {
  const dispatch = useDispatch();
  const { user } = useDashboard();
  const navigate = useNavigate();
  const name = user.name || 'FirstName LastName';
  const email = user.email || 'name.email@xyz.com';
  const [openProfile, setOpenProfile] = useState(false);


  const onNavItemClicked = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    setOpenProfile(false);
    dispatch(logOut());
    navigate(0);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <List>
          {navLinks.map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={() => onNavItemClicked(path)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <List sx={{ bottom: 0, marginTop: 'auto' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenProfile(true)}>
              <Stack
                sx={{
                  alignItems: 'center'
                }}
                direction={'row'}
                spacing={1}
              >
                <Avatar alt={name} src="url/avatar" />
                <Stack direction={'column'} spacing={0}>
                  <Typography variant="subtitle1">{name}</Typography>
                  <Typography variant="subtitle2">{email}</Typography>
                </Stack>
              </Stack>
            </ListItemButton>
          </ListItem>
        </List>
        <Popover
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          anchorReference="anchorPosition"
          anchorPosition={{ top: window.screen.height, left: 0 }}
          sx={{
            '.MuiPaper-root': {
              borderRadius: '8px'
            }
          }}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>Logout</ListItemButton>
            </ListItem>
          </List>
        </Popover>
      </Drawer>
    </Box>
  );
};
