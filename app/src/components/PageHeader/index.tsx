import { Box, Stack, Typography } from '@mui/material';
import theme from 'theme';
import { COLORS } from 'theme';
interface Props {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
}

/*
 * Page header component
 */

export const PageHeader: React.FC<Props> = ({ icon, title, subtitle }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        width: '100%',
        background: `${theme.palette.primary.main}`,
        borderBottom: `1px solid ${COLORS.paper}`,
        padding: '15px',
        height: '85px'
      }}
    >
      <Stack direction={'row'} spacing={1}>
        <Box width={'58px'} height={'55px'}>
          {icon}
        </Box>
        <Stack direction={'column'}>
          <Typography variant={'h5'}>{title}</Typography>
          <Typography variant={'subtitle2'}>{subtitle}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
