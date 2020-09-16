import React from "react";

const DataDisplay = (props) => {   
    return(
        <div>
            {props.locations.map((location) => {
                return(
                    <div key = {location.name}>
                        <h2>{location.name}</h2>
                        <p>Cases: {location.cases === " " ? "please refresh" : location.cases}</p>
                        <p>Deaths: {location.deaths === " " ? "please refresh" : location.deaths}</p>
                    </div>
                );
            })}
        </div>
    );
}
export default DataDisplay;