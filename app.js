var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var cheerio =require('cheerio');
var request =require('request');
var port = process.env.PORT || 3000;
var jsonResponse = [];

request('http://www.ipu.ac.in/library.php', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    $('table').each(function(i, table) {
    var tableAsJson = [];
    // Get column headings
    // @fixme Doesn't support vertical column headings.
    // @todo Try to support badly formated tables.
    var columnHeadings = [];
    $(table).find('tr').each(function(i, row) {
      $(row).find('th').each(function(j, cell) {
        columnHeadings[j] = $(cell).text().trim();
      });
    });

    // Fetch each row
    $(table).find('tr').each(function(i, row) {
      var rowAsJson = {};
      $(row).find('td').each(function(j, cell) {
        if (columnHeadings[j]) {
          rowAsJson[ columnHeadings[j] ] = $(cell).text().trim();
        } else {
          rowAsJson[j] = $(cell).text().trim();
        }
      });

      // Skip blank rows
      if (JSON.stringify(rowAsJson) != '{}')
        tableAsJson.push(rowAsJson);
    });

    // Add the table to the response
    if (tableAsJson.length != 0)
      jsonResponse.push(tableAsJson);
  });
  }
});


app.get('/',function(req, res){
	res.setHeader('content-type', 'application/json');
    //res.send("hello world!!");
    res.end(JSON.stringify(jsonResponse));
});

app.listen(port);
console.log("Running on port 3000...");

