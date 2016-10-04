


//including dropzone options within this file as well
Dropzone.options.myDropZone = {
  maxFileSize : 1000, //1 gb for now
  addRemoveLinks : true,
  maxFiles : 3,
  accept : function(file,done) {
      console.log(file);
      done();
  },
  clickable : true
};