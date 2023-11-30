import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  TooltipProps,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ValueType,
  NameType
} from 'recharts/types/component/DefaultTooltipContent';
import { Typography, Paper, Box } from '@mui/material';
import { COLORS } from 'theme';

export type GraphDataType = { time: number; position: number };

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload
}) => {
  if (active && payload && payload.length) {
    if (!payload || !payload[0]) return null;
    const { time, position } = payload[0].payload as GraphDataType;
    return (
      <Paper
        elevation={0}
        sx={{
          padding: '5px 10px',
          background: COLORS.highlightLighter
        }}
      >
        <Box color={COLORS.primary}>
          <Typography variant="subtitle2" fontWeight={600}>
            Details
          </Typography>
          <Typography variant="subtitle2">Time: {time}</Typography>
          <Typography variant="subtitle2">Position: {position}</Typography>
        </Box>
      </Paper>
    );
  }

  return null;
};

export const LineGraph: React.FC<{
  graphData: GraphDataType[];
}> = ({ graphData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        width={500}
        height={300}
        data={graphData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <XAxis dataKey="time" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="position"
          stroke={COLORS.secondary}
          fill={COLORS.highlight}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
