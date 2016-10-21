
    var arr = [];
    var words = value.split(" ");
    for(var i = 0; i < words.length; i++) {
        var word = words[i].replace(/[^0-9a-z]/gi, '');
        var obj = {key : word, value : 1 };
        if (word != "") 
            arr.push(obj);
    }
    return arr;