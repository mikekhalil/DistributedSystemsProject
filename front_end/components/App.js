import React from 'react';
import Upload from './Upload';


export default class App extends React.Component {
  render() {
    return (
	  	<div className="container">
		  <div className="row">
		    <div className="col-sm-4">
		      <Upload fileType={'map'}/>
		    </div>
		    <div className="col-sm-4">
		      <Upload fileType={'reduce'}/>
		    </div>
		    <div className="col-sm-4">
		      <Upload fileType={'data'}/>
		    </div>
		  </div>
		</div>
    );
  }
}