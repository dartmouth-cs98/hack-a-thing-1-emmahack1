import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';

import {locationFileName, states} from '../constants';
let fs = window.require('fs');
const request  = require('request');
const csvtojson = require('csvtojson');
const { ipcRenderer } = window.require('electron');


export const AddLocations = (props) => {
    const [data, setData] = useState('EMPTY');
    const [locations, setLocations] = useState([]);
    const [addLocation, setAddLocation] = useState('');
    const [buttonText, setButtonText] = useState('Refresh data');
    // This is the link for the live covid19 data for all of the states
    const COUNTIES_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv';

    // Tells the tray to update
    const sendUpdate = () => {
        console.log("sent update");

        ipcRenderer.send('UPDATED', '');
    }
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
        fs.truncate(locationFileName, 0, function(){ 
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
            sendUpdate();
            setLocations(newList);
        });
    };

    const loadLocationsFromFile = () => {
        // Adapted from https://www.tutorialspoint.com/electron/electron_file_handling.htm
        if(fs.existsSync(locationFileName)) {
            const locations = [];
            let data = fs.readFileSync(locationFileName, 'utf8').split('\n');
            data.forEach((location) => {
                if (location !== '') {
                    let [name, cases, deaths] = location.split(',')
                    locations.push({name, cases, deaths})
                }
            });
            if (data[0] === '') setData(data);
            else setLocations(locations);
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
            sendUpdate();
        }
    }

    const deleteLocationFromFile = (idx) => {
        let newData = locations;
        newData.splice(idx, 1);
        fs.truncate(locationFileName, 0, function(){ 
            if(newData.length === 0) return;
            newData.forEach((location) => {
                fs.appendFileSync(locationFileName, location.name + ',' + location.cases + ',' + location.deaths + '\n');
            });
            sendUpdate();
            loadLocationsFromFile();

        });
    }
    
    // The states list need to be properly formatted for the react-select dropdown
    const statesFormat = [];
    states.forEach((state) => {
        statesFormat.push({value: state, label: state});
    });

    if (locations.length === 0 && data === 'EMPTY'){
        loadLocationsFromFile();
    } 

    return(
        <div style ={{margin: '2vw'}}>
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
            <br/>  
            <br/>
            {locations.map((location, idx) => {
                return(
                    <div key = {location.name}>
                        <h3>{location.name}</h3>
                        <p>Cases: {location.cases === " " ? "please refresh" : location.cases}</p>
                        <p>Deaths: {location.deaths === " " ? "please refresh" : location.deaths}</p>
                        <Button variant = "danger" onClick = {() => {deleteLocationFromFile(idx)}}>
                            Delete Location
                        </Button>
                        <br/>  
                        <br/>
                    </div>
                );
            })}        
        </div>
    );

};
export default AddLocations;
