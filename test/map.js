
    var arr = [];
    //value = value.replace(/\n/g, ' ');
    
    value = value.replace(/[^0-9a-zA-Z]/gi, ' ');
    // value = value.replace(/\W+/g, " ");
    var words = value.split(/\s+/);
    for(var i = 0; i < words.length; i++) {
        var word = words[i];
        var obj = {key : word, value : 1 };
        if (word != "") 
            arr.push(obj);
    }
    return arr;