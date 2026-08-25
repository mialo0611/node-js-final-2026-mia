
const { EntitySchema } = require('typeorm');
module.exports = new EntitySchema({
  name: 'CoachSkill',
  tableName: 'coach_skill',
  relations: {   
    student: {
      type: 'many-to-one',
      target: 'Coach',
      joinColumn: { name: 'coach_id' },
      nullable: false,
    },    
    subject: {
      type: 'many-to-one',
      target: 'Skill',
      joinColumn: { name: 'skill_id' },
      nullable: false,
    },
  },
  uniques: [
    {      
      name: 'UQ_Caoch_Skill',  // 唯一索引的名字
      columns: ['coach','skill' ],
    }
  ],     
  })