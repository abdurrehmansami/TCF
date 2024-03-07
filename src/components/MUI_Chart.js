import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';


export const MUI_Chart = ({
    chartType,
    data,
    label,
    labelStyle,
    tickLabels,
    tickLabelStyle,
    margin={top: 0, right: 0, bottom: 0, left: 0},
    color='#606060',
    barGap=.5,
    width=450,
    height=300,
    lineCurve='natural'
}) => {
    return(
      <>
        {(chartType == 'bar') &&
          <BarChart
            xAxis={[{
              scaleType: 'band', //'band' for Bar, 'point' for Line charts
              data: tickLabels,
              categoryGapRatio: barGap,
              //tickLabelInterval: ()=>true, //show all tick labels
              tickLabelStyle: {fontSize: 0}
            }]}
            series={[
              { data: data, color: color },
            ]}
            width={width}
            height={height}
            margin={margin}
            sx={{
              // [`.${axisClasses.left} .${axisClasses.tickLabel}`]: {fontSize: 8},
              [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: tickLabelStyle,
            }}
          />
        }
        {(chartType == 'line') &&
          <LineChart
            xAxis={[{
              scaleType: 'point', //'band' for Bar, 'point' for Line charts
              data: tickLabels,
              //tickLabelInterval: ()=>true, //show all tick labels
              tickLabelStyle: {fontSize: 0}
            }]}
            series={[
              { data: data, color: color, area: true, curve: lineCurve, showMark: ({index})=> {
                  if(data.length <= 50) return index%2 === 0;
                  else if(data.length <= 100) return index%4 === 0;
                  else if(data.length <= 500) return index%10 === 0;
                  else if(data.length <= 1000) return index%20 === 0;
                  else return index%30 === 0;
                }
              },
            ]}
            width={width}
            height={height}
            margin={margin}
            sx={{
              // [`.${axisClasses.left} .${axisClasses.tickLabel}`]: {fontSize: 8},
              [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: tickLabelStyle,
            }}
          />
        }
      </>
    )
  }