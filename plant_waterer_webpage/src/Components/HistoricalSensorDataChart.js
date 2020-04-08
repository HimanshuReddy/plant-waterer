import React from 'react';
import { styled } from '@material-ui/core/styles';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Typography, TextField } from '@material-ui/core';

const UnitExplanationText = styled(Typography) ({
  textAlign: 'center',
  fontStyle: 'italic',
  color: '#bfbfbf',
})

const NumberBoxExplanationText = styled(Typography) ({
  textAlign: 'center',
  fontStyle: 'italic',
  color: '#bfbfbf',
})

const GraphTitle = styled(Typography) ({
  textAlign: 'center',
  fontSize: '30px',
  color: '#000000',
})

// INPUT: 'data' is an array, with the format [ obj1, obj2, obj3 ], where each object has  
//        the format {date: val, temperature: val, humidty: val, moisture: val}, {obj2}, {obj3} 
//        'onNewNum' is a function that handles a change in the number of requested records
function HistoricalSensorDataChart({ data, onNewNum }) {
  return(
    <React.Fragment>
      <GraphTitle>Historical Sensor Data</GraphTitle>
      <div style={{paddingLeft: '5%'}}>
        <ResponsiveContainer width="90%" height={500}>
          <LineChart data={data}>
            <XAxis dataKey="date"/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#ee0000"/>
            <Line type="monotone" dataKey="humidity" stroke="#00ee00"/>
            <Line type="monotone" dataKey="moisture" stroke="#0000ee"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <UnitExplanationText>
        The temperature is in degrees fahrenheit while the humidity and moisture values are percentages.
      </UnitExplanationText>

      <div style={{display: 'flex', justifyContent: 'center'}}>
        <TextField label="Number of Records:" variant="filled" onChange={(event) => onNewNum(event.target.value)}/> 
      </div>
      
      <NumberBoxExplanationText>
        Enter a number for how many records to graph.
      </NumberBoxExplanationText>

    </React.Fragment>
  )
}

export default HistoricalSensorDataChart;