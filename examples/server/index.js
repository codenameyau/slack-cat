const SlackCat = require('../index.js');
const Path = require('path');

const configPath = Path.join(__dirname, 'config.json');
const dbPath = Path.join(__dirname, 'db.sqlite');
const modules = Path.join(__dirname, '/modules');

// No modules in example.
new SlackCat('', configPath, dbPath).start();
