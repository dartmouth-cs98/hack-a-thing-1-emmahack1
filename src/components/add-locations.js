import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import DataDisplay from './display-data';

import {locationFileName, states} from '../constants';
let fs = window.require('fs');
const request  = require('request');
const csvtojson = require('csvtojson');

export const AddLocations = (props) => {
    const [locations, setLocations] = useState('');
    const [addLocation, setAddLocation] = useState('');
    const [buttonText, setButtonText] = useState('Refresh data');
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
        console.log(newData);
        let newList = []
        if (newData.length === 0) return '';
        fs.truncate(locationFileName, 0, function(){ 
            console.log("after");
            locations.forEach((location) => {
                let loc = newData.filter(e =>  e.state === location.name);
                if (loc.length === 1) loc = loc[0];
                newList.push({
                    name: location.name,
                    cases: loc.cases,
                    deaths: loc.deaths
                })
                fs.appendFileSync(locationFileName, location.name + ',' + loc.cases + ',' + loc.deaths + '\n');
            });
            console.log(newList)
            setLocations(newList);
        });
    };

    const loadLocationsFromFile = () => {
        // Adapted from https://www.tutorialspoint.com/electron/electron_file_handling.htm
        if(fs.existsSync(locationFileName)) {
            const locations = [];
            let data = fs.readFileSync(locationFileName, 'utf8').split('\n')
            data.forEach((location) => {
                if (location !== '') {
                    let [name, cases, deaths] = location.split(',')
                    locations.push({name, cases, deaths})
                }
            })
            setLocations(locations)            
        } else {
            console.log("File Doesn't Exist. Creating new file.")
            fs.writeFile(locationFileName, '', (err) => {
                if(err) console.log(err)
            })
        }
    }
    
    const addNewLocationToFile = (addLocation) => {
        if (addLocation !=='') {
            fs.appendFile(locationFileName, addLocation + ', , \n', function(){
                setAddLocation('');
                loadLocationsFromFile();
            });
        }
    }
    
    // The states list need to be properly formatted for the react-select dropdown
    const statesFormat = [];
    states.forEach((state) => {
        statesFormat.push({value: state, label: state});
    });

    if (locations === ''){
        loadLocationsFromFile();
    } 

    return(
        <div>
            <Select options = {statesFormat} onChange = {(newValue) => setAddLocation(newValue.value)}/>
            <br/>
            <Button onClick = {() => {addNewLocationToFile(addLocation);}}>
                Add Location
            </Button> 
            <br/>  
            <br/>
            <Button onClick = {() => {
                setButtonText('fetching'); 
                getCountyData();
            }}>
                {buttonText}
            </Button>
            <DataDisplay locations={locations} />     
        </div>
    );

};
export default AddLocations;
