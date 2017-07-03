// NEXT:
//   open in editor (node canvas or browser?)
//   better-handling of line-breaks

var fs = require('fs');
var rita = require('rita');

var args = process.argv.slice(2), selected, target;

if (args.length == 1) {
  target = parseInt(args[0]);
}
else if (args.length == 2) {
  selected = args[0];
  target = parseInt(args[1]);
}

loadData('texts', function(poems) {

  console.log('\nLoaded '+ poems.length + ' poems'
    + (selected ? (' by '+selected) : '')+'\n');

  generate(poems);
});

function generate(poems) {

  var rm = new rita.RiMarkov(3);
  rm.allowDuplicates = false;
  rm.loadText(poems.join('\n'));

  var sents = rm.generateSentences(10);
  for (var i = 0; i < sents.length; i++) {
    var sent = sents[i]
      .replace(/["()]/g,'')
      .replace(/' /g,' ')
      .replace(/ '/g,' ')
      .replace(/!/g,'.');
    console.log(sent+' ');
  }

  console.log();
  for (var i = 0; i < 0; i++) {
    var sent = rm.generateSentences(1)[0];
    console.log(i+':', sent);
  }
}

function loadData(dir, cb) {

  var poems = [];

  function handleLine(line, i) {

    if (!line.length || line === '~~~~!~~~')
      return '';
    if (line === '****!****')
      return false;
    return line.trim() + ' ';
  }

  function postProcess(d) {

    return d.replace(/- ([^ ])/g, '-$1').replace(/\\/g,'');
  }

  function onFileRead(err, data) {

    if (err) throw err;

    var buffer = '', lines = data.split(/\r?\n/),
      author = lines[0].replace(/ +/g, ' ');

    //console.log(author);

    if (!selected || selected === author) {

      for (var j = 0; j < lines.length; j++) {
        var line = handleLine(lines[j], j);
        buffer += line;
        if (line === false) // reset
          buffer = '';
      }

      poems.push(postProcess(buffer).trim());

      //console.log("Found "+buffer.length+' '+poems.length +'/'+target);
      if (poems.length === target) {

        cb(poems);
      }
    }
  }

  fs.readdir(dir, function(err, filenames) {

     var shuffle = function(a) { // a: array
      var newArray = a.slice(),
        len = newArray.length,
        i = len;
      while (i--) {
        var p = parseInt(Math.random() * len),
          t = newArray[i];
        newArray[i] = newArray[p];
        newArray[p] = t;
      }
      return newArray;
    }

    if (err) throw err;

    target = target || filenames.length;

    filenames = shuffle(filenames);

    for (var i = 0; i < filenames.length; i++) {

      fs.readFile(dir + '/' +filenames[i], 'utf8', onFileRead);
    }
  });
}
