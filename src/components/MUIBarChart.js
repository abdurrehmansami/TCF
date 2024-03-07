import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';


export const MUIBarChart = ({data, label, labelStyle, tickLabels, tickLabelStyle, margin={top: 0, right: 0, bottom: 0, left: 0}, barColor, barGap=.5, width=450, height=300}) => {
    return(
      <BarChart
        xAxis={[{
          scaleType: 'band',
          data: tickLabels,
          categoryGapRatio: barGap,
          // tickLabelInterval: ()=>true, //show all tick labels
          tickLabelStyle: {fontSize: 0}
        }]}
        series={[
          { data: data, color: barColor },
        ]}
        width={width}
        height={height}
        margin={margin}
        sx={{
          [`.${axisClasses.left} .${axisClasses.label}`]: labelStyle,
          [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: tickLabelStyle,
        }}
      />
    )
  }