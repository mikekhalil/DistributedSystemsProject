var React = require('react');
var Dropzone = require('react-dropzone');

var Upload = React.createClass({
    onDrop: function (acceptedFiles, rejectedFiles) {
        var fd = new FormData();
        fd.append("file", acceptedFiles[0]);
        fd.append("type", this.props.fileType);
        $.ajax({
            url: 'http://localhost:8080/InputFiles',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data){
                console.log(data)
            }
        });
    },

    render: function () {
      return (
          <div>
            <Dropzone onDrop={this.onDrop}>
              <div>{this.props.fileType}</div>
            </Dropzone>
          </div>
      );
    }
});

module.exports = Upload;