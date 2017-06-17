const bodyParser = require('body-parser')

module.exports = ({ app, hello, slugs, protection, relay, allowCors }) => {
  app.post('/hello/:uuid', bodyParser.json(), hello.handleRequest)

  app.post('/protect/:uuid', bodyParser.json(), protection.handleProtect)
  app.delete('/protect/:uuid', bodyParser.json(), protection.handleUnprotect)

  // These routes are for the viewer to check if a stream is
  // protected with a password, and to validate passwords.
  // Since they will be called from the Viewer, we need to allow cross-origin (cors)
  app.get('/protect/:viewerId/:password', allowCors, protection.handleAuthorize)
  app.get('/protect/:viewerId', allowCors, protection.handleIsProtected)

  // Don't parse the body here because we're dealing with binary data
  app.post('/in/:uuid', relay.handleIngest)
  app.ws('/out/:viewerId', relay.handleViewer)
  app.ws('/out/:viewerId/:password', relay.handleViewer)
}
