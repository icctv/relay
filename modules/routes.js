const bodyParser = require('body-parser')

module.exports = ({ app, hello, slugs, protection, relay }) => {
  app.post('/hello/:uuid', bodyParser.json(), hello.handleRequest)

  app.post('/protect/:uuid', bodyParser.json(), protection.handleProtect)
  app.delete('/protect/:uuid', bodyParser.json(), protection.handleUnprotect)

  // Don't parse the body here because we're dealing with binary data
  app.post('/in/:uuid', relay.handleIngest)
  app.ws('/out/:viewerId', relay.handleViewer)
  app.ws('/out/:viewerId/:password', relay.handleViewer)
}
