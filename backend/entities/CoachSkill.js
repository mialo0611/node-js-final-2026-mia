
const { EntitySchema } = require('typeorm');
module.exports = new EntitySchema({
  name: 'CoachSkill',
  tableName: 'coach_skill',
  columns: {
    coach_id: {
      type: 'uuid', // 若 Coach 的主鍵是 int，此處請改為 'int'
      primary: true,
    },
    skill_id: {
      type: 'uuid', // 若 Skill 的主鍵是 int，此處請改為 'int'
      primary: true,
    },
  },
  relations: {
    coach: {
      type: 'many-to-one',
      target: 'Coach',
      joinColumn: {
        name: 'coach_id',
        referencedColumnName: 'id',
      },
    },
    skill: {
      type: 'many-to-one',
      target: 'Skill',
      joinColumn: {
        name: 'skill_id',
        referencedColumnName: 'id',
      },
    },
  },    
});