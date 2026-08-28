
const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'CourseBooking',        // 程式裡的名字：getRepository('Course') 用它
  tableName: 'course_booking',  // 資料庫裡實際的表名
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    user_id: 
    {
      type: 'uuid', 
      nullable: false,
    },
    course_id: 
    {
      type: 'uuid',
      nullable: false,
    },
    created_at: { 
      type: 'timestamp', 
      createDate: true,
    },
    cancelled_at:{
       type:'timestamp', 
       nullable: true,
    },
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
    course: {
      type: 'many-to-one',
      target: 'Course', 
      joinColumn: { 
        name: 'course_id',
        referencedColumnName: 'id',
      },
    },
  },
});
