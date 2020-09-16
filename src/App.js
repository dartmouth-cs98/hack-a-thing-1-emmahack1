import React from 'react';
import './App.css';
import DataDisplay from './display-data';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  let locations = [{name: "Illinois", cases: '',  deaths: ''}];
  return (
    <div className="App">
      <DataDisplay locations = {locations}/>
    </div>
  );
}

export default App;
