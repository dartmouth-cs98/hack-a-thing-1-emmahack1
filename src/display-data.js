import React,{useState} from "react";
import Button from 'react-bootstrap/Button';

const request  = require('request')
const csvtojson = require('csvtojson')
const DataDisplay = (props) => {
    const [buttonText, setButtonText] = useState('Refresh data');
    const [data, setData] = useState('');


    const COUNTIES_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv';

    const getCountyData = () => {
        let newData = [];
        csvtojson()
            .fromStream(request.get(COUNTIES_URL))
            .subscribe((json) => {
                newData.push(json);
            }, (error) => {
                console.log(error);
            }, () => {
                console.log(newData);
                setButtonText("Refresh data");
                setData(JSON.stringify(newData));
            });
    };
    return(
        <div>
            <Button onClick = {() => {setButtonText('fetching'); getCountyData()}}>
                {buttonText}
            </Button>
            <p>{data}</p>
        </div>
    );
}
export default DataDisplay;