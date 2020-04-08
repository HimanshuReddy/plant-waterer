import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/core/styles';

const CardTitle = styled(Typography)({
  textAlign: 'center',
  fontSize: '20px',
})

const ValueTextField = styled(TextField)({
  width: '80%',
  margin: '0 10%',
})

const FetchValueButton = styled(Button)({
  border: '3px',
  borderColor: 'black',
  borderRadius: '15px',
  height: '50px',
  padding: '0 10px',
  width: '70%',
  margin: '0 15%',
});

// INPUT: 'name' is the title of the card
//        'value' is the value that the card displays
//        'onClick' is a function that is called when 
//         the card's button is clicked 
function DataCard({ name, value, onClick }) {
  return (
    <React.Fragment>
      <Card raised={true} style={{display: 'inline-block', width: '300px'}}> 
        <CardContent>
          <CardTitle>
            {name}
          </CardTitle>
          <ValueTextField
            id="outlined-basic"
            label={'Current ' + name}
            InputProps ={{
              readOnly: true
            }}
            value={Math.round(value)}
            variant="outlined"
          />
        </CardContent>
        <CardActionArea>
          <FetchValueButton
            onClick={onClick}
          >
            Get Value
          </FetchValueButton>
        </CardActionArea>
      </Card>
    </React.Fragment>
  )
}

export default DataCard;