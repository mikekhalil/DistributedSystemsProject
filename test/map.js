
    var arr = [];
    var words = value.split(" ");
    for(var i = 0; i < words.length; i++) {
        var word = words[i];
        var obj = {key : word, value : 1 };
        arr.push(obj);
    }
    return arr;