//require('dotenv').config()

const { DataSource } = require('typeorm');
const config = require('../config/index');

const User = require('../entities/User');
const Coach = require('../entities/Coach');
const Skill = require('../entities/Skill');
const CreditPackage = require('../entities/CreditPackage');
const CoachSkill = require('../entities/CoachSkill');
const Course = require('../entities/Course');


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
    CreditPackage,
    CoachSkill,
    Course,
  ],
});

module.exports = { dataSource } ;
