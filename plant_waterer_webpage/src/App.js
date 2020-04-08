import React from 'react';
import Grid from '@material-ui/core/Grid';
import DataCard from './Components/DataCard';
import HistoricalSensorDataChart from './Components/HistoricalSensorDataChart';
import MotorDataTable from './Components/MotorDataTable';
import { styled } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

// Address of my raspberry pi, running an express server on port 3000
const serverAddress = 'http://192.168.1.220:3000';

const Title = styled(Typography) ({
  textAlign: "center",
  fontSize: "50px",
  fontWeight: '550',
})


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temperature: "N/A",
      humidity: "N/A",
      moisture: "N/A",
      historicalSensorData: [],
      historicalMotorData: []
    }

    this.updateData = this.updateData.bind(this);
    this.getHistoricalSensorData = this.getHistoricalSensorData.bind(this);
    this.getHistoricalMotorData = this.getHistoricalMotorData.bind(this);
  }

  componentDidMount() {
    this.updateData('temperature');
    this.updateData('humidity');
    this.updateData('moisture');
    this.getHistoricalSensorData(5);
    this.getHistoricalMotorData(5);
  }

  // INPUT: The type of data to update, which is either 'temperature', 'humidity', or 'moisture'
  // OUTPUT: Sets the state variables of either temperature, humidity, or moisture to the new value
  updateData(type) {
    fetch(serverAddress + '/' + type)
      .then(rawData => rawData.json())
      .then(data => this.setState({ [type]: data[type] }));
  }

  // INPUT: The number of records to return
  // OUTPUT: Sets the historicalSensorData state array to the new historical results
  getHistoricalSensorData(num) {
    fetch(serverAddress + `/historical-sensor-data?quantity=${encodeURIComponent(num)}`)
      .then(rawData => rawData.json())
      .then(objData => objData.data)
      .then(arrData => arrData.map(item => JSON.parse(item)).reverse()) 
      .then(finalData => this.setState({ historicalSensorData: finalData }))
  }

  // INPUT: The number of records to return
  // OUTPUT: Sets the historicalMotorData state array to the new historical results
  getHistoricalMotorData(num) {
    fetch(serverAddress + `/historical-motor-data?quantity=${encodeURIComponent(num)}`)
      .then(rawData => rawData.json())
      .then(objData => objData.data)
      .then(arrData => arrData.map(item => JSON.parse(item).date).reverse())
      .then(finalData => this.setState({ historicalMotorData: finalData}))
      
  }

  render() {
    return ( 
      <React.Fragment>

        <Title>
          Dashboard
        </Title>

        <Grid container margin='100px' direction="row" justify="space-evenly" spacing={5} >
          <Grid item>
            <DataCard name={'Temperature'} value={this.state.temperature} onClick={() => this.updateData('temperature')} />
          </Grid> 

          <Grid item>
            <DataCard name={'Humidity'} value={this.state.humidity} onClick={() => this.updateData('humidity')} />
          </Grid>

          <Grid item>
            <DataCard name={'Moisture'} value={this.state.moisture} onClick={() => this.updateData('moisture')} />
          </Grid>
        </Grid>

        <HistoricalSensorDataChart data={this.state.historicalSensorData} onNewNum={(num) => this.getHistoricalSensorData(num)} />

        <MotorDataTable data={this.state.historicalMotorData} onNewNum={(num) => this.getHistoricalMotorData(num)} />

      </React.Fragment>
     );
  }

}

export default App;
