import React from 'react';
import { Paper, Table, TableHead, TableBody, TableRow, TableCell, TextField, Typography } from '@material-ui/core';
import { styled } from '@material-ui/core';


const TableExplanationText = styled(Typography) ({
  textAlign: 'center',
  fontStyle: 'italic',
  color: '#bfbfbf',
})

const NumberBoxExplanationText = styled(Typography) ({
  textAlign: 'center',
  fontStyle: 'italic',
  color: '#bfbfbf',
})


// INPUT: 'data' is an array that contains the times
//        'onNewNum' is a function to handle a change 
//         in the value of the text box
function MotorDataTable({ data, onNewNum }) {
  let dataComponents = [];

  for (let i = 0; i < data.length; i++) {
    dataComponents.push(
      <TableRow>
        <TableCell>
          {data[i]}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <React.Fragment>
    
      <Paper style={{height: 400, overflow: 'auto'}}>
        <Table style={{margin: '20px'}} stickyHeader>

          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Times of Motor Activation:</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {dataComponents}
          </TableBody>

        </Table>
      </Paper>

      <TableExplanationText>
        This table shows the times that the motor was activated
      </TableExplanationText>

      <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
        <TextField label="Number of Records:" variant="filled" onChange={(event) => onNewNum(event.target.value)}/> 
      </div>

      <NumberBoxExplanationText>
        Enter how many records you want to see
      </NumberBoxExplanationText>

    </React.Fragment>
  )
}

export default MotorDataTable;


