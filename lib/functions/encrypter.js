async function dBinary(str) {
var newBin = str.split(" ")
var binCode = []
for (i = 0; i < newBin.length; i++) {
    binCode.push(String.fromCharCode(parseInt(newBin[i], 2)))
  }
return binCode.join("")
}

async function eBinary(str = ''){    
let res = ''
res = str.split('').map(char => {       
return char.charCodeAt(0).toString(2);  
 }).join(' ')
return res
}

function textToOctal(text) {
    var octalResult = "";
    for (var i = 0; i < text.length; i++) {
        var charCode = text.charCodeAt(i);
        var octalChar = charCode.toString(8);
        octalResult += octalChar + " ";
    }
    return octalResult.trim();
}

function octalToText(octalString) {
    var octalValues = octalString.split(" ");
    var result = "";
    for (var i = 0; i < octalValues.length; i++) {
        var charCode = parseInt(octalValues[i], 8);
        result += String.fromCharCode(charCode);
    }
    return result;
}

module.exports = {
    dBinary,
    eBinary,
    textToOctal,
    octalToText
};   