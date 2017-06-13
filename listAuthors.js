var fs = require('fs');

var authors = {}, parsed = 0, ts, selected;

loadData('texts', function() {

  var keysSorted = Object.keys(authors).sort(function(a,b){
    return authors[a].length - authors[b].length;
  });
  for (var i = 0; i < keysSorted.length; i++) {
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
  //console.log('parseAuthor: '+fname+' '+(+new Date()));
  var lines = data.split(/\r?\n/);
//  for (var j = 0; j < 4; j++) {
    var line = lines[0].replace(/ +/g, ' ');
    if (line.length) {
      if (!selected || line === selected) {
        if (!authors[line]) {
          authors[line] = [];
        }
        authors[line].push(fname);
        ++parsed;
      }
    }
    return parsed;
//  }
}

function handleRemoves() {

  var removes = ['Lewis Carroll','William Cowper','Melanie Almeder','Henry Timrod'];
    /*"William Shakespeare",'Emily Dickinson', 'Matthew Arnold','Ben Jonson','John Donne','Andrew Marvell', 'Robert Herrick', 'Edmund Spenser', "William Wordsworth", "Alfred, Lord Tennyson", "Anonymous", 'Christopher Marlowe',
    "Robert Browning", "Algernon Charles Swinburne",'William Blake','Sir Philip Sidney', "Henry Wadsworth Longfellow", "John Keats",'Anne Finch, Countess of Winchilsea','Mother Goose','Rabindranath Tagore','Lord Byron (George Gordon)',
    "Samuel Taylor Coleridge",'Edna St. Vincent Millay','Knight of the White Elephant of Burmah William McGonagall','Lady Mary Wortley Montagu',
    "John Milton", 'Walt Whitman','Anne Bradstreet','Edgar Lee Masters','Geoffrey  Chaucer','George Herbert','Sir Thomas Wyatt','Dante Gabriel Rossetti','Percy Bysshe Shelley','Elizabeth Barrett Browning','Christina Rossetti'*/

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
