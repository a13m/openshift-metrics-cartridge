var fs, http, itemRespond, serveFile, server, url;
http = require('http');
url = require('url');
fs = require('fs');
itemRespond = function(item, response) {
  var options;
  console.log("item: " + item);
  options = {
    host: 'cgroup-mmcgrath3.dev.rhcloud.com',
    port: 80,
    path: "/read.php?item=" + item
  };
  return http.get(options, function(res) {
    var body;
    console.log("Status code: " + res.statusCode);
    if (res.statusCode === 200) {
      body = '';
      res.on('data', function(chunk) {
        body += chunk;
        return console.log("body: " + body);
      });
      return res.on('end', function() {
        console.log("end of res");
        response.writeHead(200, {
          'Content-length': body.length,
          'Content-type': 'application/json'
        });
        response.write(body);
        return response.end();
      });
    } else {
      response.writeHead(res.statusCode);
      return response.end('');
    }
  });
};
serveFile = function(file, response, contentType) {
  var f;
  if (contentType == null) {
    contentType = 'text/html';
  }
  console.log("Serving file " + file);
  try {
    f = fs.readFileSync(file, 'utf-8');
  } catch (err) {
    f = '';
  }
  response.writeHead(200, {
    'Content-length': f.length,
    'Content-type': contentType
  });
  return response.end(f);
};
server = http.createServer(function(request, response) {
  var ext, file, item, mime, parsed, path, query;
  parsed = url.parse(request.url, true);
  path = parsed.pathname;
  console.log("path: " + path);
  query = parsed.query;
  switch (path) {
    case '/item':
      item = query.item;
      if (item) {
        console.log('Item found');
        return itemRespond(item, response);
      } else {
        console.log('No item found');
        response.writeHead(200);
        return response.end('');
      }
      break;
    case '/index':
      return serveFile('index.html', response);
    default:
      file = path.slice(1);
      ext = path.split('.').pop();
      mime = (function() {
        switch (ext) {
          case 'css':
            return 'text/css';
          case 'js':
            return 'text/javascript';
          case 'png':
            return 'image/png';
          case 'jpg':
            return 'image/jpeg';
          case 'html':
            return 'text/html';
          default:
            return 'text/plain';
        }
      })();
      return serveFile(file, response, mime);
  }
});
server.listen(1337);