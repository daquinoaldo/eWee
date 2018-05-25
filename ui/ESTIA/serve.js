const serve = require('serve');

serve(__dirname, {
  port: 8080,
  ignore: ['node_modules']
});