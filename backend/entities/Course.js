
/* "id": "5e3b1f0a-9c1d-4e2f-8a7b-1c2d3e4f5a6b",
      "name": "重訓基礎入門",
      skill_id (ref to Skll.id)
      "status": "尚未開始",
      "start_at": "2026-08-20T10:00:00.000Z",
      "end_at": "2026-08-20T12:00:00.000Z",
      "max_participants": 10,
      "meeting_url": "https://meet.example.com/abc-defg-hij",
      "participants": 2 
      */

const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Course',        // 程式裡的名字：getRepository('Course') 用它
  tableName: 'course',  // 資料庫裡實際的表名
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,   
      unique: true,   
    },  
    user_id: 
    {
      type: 'uuid', 
      nullable: false,
    },
    skill_id: 
    {
      type: 'uuid',
      nullable: false,
    },
    status:{
      type:'varchar',
      length:10,
      nullable:false,
      default:'尚未開始',
    },
    start_at: { 
      type: 'timestamp',             
    },
    end_at: { 
      type: 'timestamp',             
    },
    max_participants: {
      type: 'integer',
      nullable: false,
    },
    meeting_url: { 
      type: 'varchar', 
      length: 2048, 
      nullable: true 
    },
    participants: {
      type: 'integer',
      nullable: false,
      default:0
    },
    cancelled_at:{
       type:'timestamp', 
       nullable: true,
    },
    created_at: { 
      type: 'timestamp', 
      createDate: true,
    },  
    updated_at:{
      type: 'timestamp', 
      createDate: true,
    }
  },  
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { 
        name: 'user_id',
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
