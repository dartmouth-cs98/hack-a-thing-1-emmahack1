import React,{useState} from "react";
import Button from 'react-bootstrap/Button';

const request  = require('request')
const csvtojson = require('csvtojson')
const DataDisplay = (props) => {   
    // We love react hooks
    const [buttonText, setButtonText] = useState('Refresh data');
    const [list, setList] = useState(props.locations);

    
    // This is the link for the live covid19 data for all of the states
    const COUNTIES_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv';

    // Fetch the data. Since this app is so small, I don't think I need redux here.
    const getCountyData = () => {
        let newData = [];
        csvtojson()
            .fromStream(request.get(COUNTIES_URL))
            .subscribe((json) => {
                newData.push(json);
            }, (error) => {
                console.log(error);
            }, () => {
                setButtonText("Refresh data");
                formatData(newData);
            });
    };

    // Format the data to display appropriately
    const formatData = (newData) => {
        let newList = []
        if (newData.length === 0) return '';
        props.locations.forEach((location) => {
            let loc = newData.filter(e =>  e.state === location.name);
            if (loc.length === 1) loc = loc[0];
            newList.push({
                name: location.name,
                cases: loc.cases,
                deaths: loc.deaths
            })

        });
        setList(newList);
    };

    return(
        <div>
            <Button onClick = {() => {setButtonText('fetching'); getCountyData()}}>
                {buttonText}
            </Button>
            {list.map((location) => {
                return(
                    <div key = {location.name}>
                        <h2>{location.name}</h2>
                        <p>Cases: {location.cases}</p>
                        <p>Deaths: {location.deaths}</p>
                    </div>
                );
            })}
        </div>
    );
}
export default DataDisplay;