//require('dotenv').config()

const { DataSource } = require('typeorm');
const config = require('../config/index');

const User = require('../entities/User');
const Coach = require('../entities/Coach');
const Skill = require('../entities/Skill');
const Credit_package = require('../entities/Credit_package');

const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: Number( config.get('db.port'),),
  username:  config.get('db.username'),
  password: config.get('db.password'),
  database:  config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  ssl: config.get('db.ssl'),
  
  entities:[
    User,
    Coach,
    Skill,    
    Credit_package,
  ],
});

module.exports = { dataSource } ;
