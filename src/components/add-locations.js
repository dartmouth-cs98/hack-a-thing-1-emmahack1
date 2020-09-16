import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import DataDisplay from './display-data';

import {locationFileName, states} from '../constants';
let fs = window.require('fs');
export const loadLocations = () => {
    // Adapted from https://www.tutorialspoint.com/electron/electron_file_handling.htm
    let locations = [];
    if(fs.existsSync(locationFileName)) {
        let data = fs.readFileSync(locationFileName, 'utf8').split('\n')
        
        data.forEach((location) => {
            if (location !== '') {
                let [name, cases, deaths] = location.split(',')
                locations.push({name, cases, deaths})
            }
        })
     
     } else {
        console.log("File Doesn't Exist. Creating new file.")
        fs.writeFile(locationFileName, '', (err) => {
           if(err) console.log(err)
        })
     }
     return locations;
}

export const AddLocations = (props) => {
    const [locations, setLocations] = useState('');
    const [addLocation, setAddLocation] = useState('');
    const statesFormat = [];
    states.forEach((state) => {
        statesFormat.push({value: state, label: state});
    });
    

    const addNewLocationToFile = (addLocation) => {
        console.log(addLocation);
        if (addLocation !=='' ) {
            fs.appendFileSync(locationFileName, addLocation + ', , \n');
        }
        setAddLocation('');
        setLocations(loadLocations());
    }
    if (locations === '') setLocations(loadLocations());
    return(
        <div>
            <Select options = {statesFormat} onChange = {(newValue) => setAddLocation(newValue.value)}/>
            <br/>
            <Button onClick = {() => {addNewLocationToFile(addLocation);}}>
                Add Location
            </Button> 
            <br/>  
            <DataDisplay locations={locations} />     
        </div>
    );

};
export default AddLocations;
