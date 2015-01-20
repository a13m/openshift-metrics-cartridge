http = require 'http'
url = require 'url'
fs = require 'fs'

itemRespond = (item, response) ->
  console.log "item: #{item}"
  options =
    host: 'cgroup-mmcgrath3.dev.rhcloud.com'
    port: 80
    path: "/read.php?item=#{item}"
    
  http.get options, (res) ->
    console.log "Status code: #{res.statusCode}"
    if res.statusCode == 200
      body = ''
      res.on 'data', (chunk) ->
        body += chunk
        console.log "body: #{body}"
      res.on 'end', ->
        console.log "end of res"
        response.writeHead 200, 'Content-length' : body.length, 'Content-type' : 'application/json'
        response.write body
        response.end()
    else
      response.writeHead res.statusCode
      response.end ''

serveFile = (file, response, contentType='text/html') ->
  console.log "Serving file #{file}"
  try
    f = fs.readFileSync file, 'utf-8'
  catch err
    f = ''
  response.writeHead 200, 'Content-length' : f.length, 'Content-type' : contentType
  response.end f
        
server = http.createServer (request, response) ->
  parsed = url.parse request.url, true
  path = parsed.pathname
  console.log "path: #{path}"
  query = parsed.query
  switch path
    when '/item'
      item = query.item
      if item
        console.log 'Item found'
        itemRespond item, response
      else
        console.log 'No item found'
        response.writeHead 200
        response.end ''
    when '/index'
      serveFile 'index.html', response
    else
      file = path.slice 1
      ext = path.split('.').pop()
      mime = switch ext
        when 'css' then 'text/css'
        when 'js' then 'text/javascript'
        when 'png' then 'image/png'
        when 'jpg' then 'image/jpeg'
        when 'html' then 'text/html'
        else 'text/plain'
      serveFile file, response, mime
  
server.listen 1337