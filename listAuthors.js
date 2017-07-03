var fs = require('fs');

var authors = {}, parsed = 0, ts,
  search, doRemoves = 0, removes = [];

parseArgs(process.argv.slice(2));

loadData('texts', function() {

  var keysSorted = Object.keys(authors).sort(function(a,b){
    return authors[a].length - authors[b].length;
  });
  for (var i = 0; false && i < keysSorted.length; i++) {
    console.log('\''+keysSorted[i]+'\'', authors[keysSorted[i]].length);
  }
  console.log('\nParsed '+parsed+' files in ' + (+new Date()-ts)+' ms');

  handleRemoves();
});

function loadData(dir, cb) {
  ts = +new Date();
  fs.readdir(dir, function(err, filenames) {
    if (err) throw err;
    for (var i = 0; i < filenames.length; i++) {
      var fname = dir + '/' +filenames[i];
      fs.readFile(fname, 'utf8', function(fn, err, data) {
        if (err) throw err;
        if (parseAuthor(fn, data) === filenames.length)
          cb();
      }.bind(null, fname))
    }
  });
}

function parseAuthor(fname, data) {

  var lines = data.split(/\r?\n/);
  var author = lines[0].replace(/ +/g, ' ');
  if (author.length) {
    if (!authors[author]) {
      authors[author] = [];
    }
    authors[author].push(fname);
    ++parsed;
  }

  if (search && author && author.length) {
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].includes(search)) {
        if (!removes || removes.indexOf(author) === -1) {
          console.log('found '+author+': '+lines[i]);
          removes && removes.push(author);
        }
      }
    }
  }

  return parsed;
}

function handleRemoves() {
  if (!doRemoves) return;
  for (var j = 0; j < removes.length; j++) {
    var files = authors[removes[j]];
    if (files) {
      console.log('Removing '+removes[j]);
      for (var i = 0; i < files.length; i++) {
        console.log('  moving '+files[i] + ' to '+files[i].replace(/texts\//,'unused/'));
        fs.rename(files[i], files[i].replace(/texts\//,'unused/'), function(e){ e && console.error(e); });
      }
    }
  }
}

function parseArgs(args) {

  if (args.length === 2) {
    var opt = args[0]
    if (opt === '-f') {       // --find-by-string-match
      search = args[1];
    }
    else if (opt === '-fd') { // --find-and-delete-by-match
      search = args[1];
      doRemoves = true;
    }
    else if (opt ===  '-a') { // --find-by-author-name
      removes.push(args[1]);
    }
    else if (opt === '-ad') { // --find-and-delete-by-author
      removes.push(args[1]);
      doRemoves = true;
    }
  }
}
