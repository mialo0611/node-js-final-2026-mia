const { EntitySchema } = require('typeorm') ;

module.exports = new EntitySchema({
  name: 'User',                  // 程式裡的名字：getRepository('user') 用它
  tableName: 'users',  // 資料庫裡實際的表名
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
    },
    password: { 
        type: 'varchar', 
        length: 255, 
        nullable: false 
    },
    email: {
        type: 'varchar',
        length: 320,
        nullable: false,
        unique: true,
    },
    role: {
      type: 'varchar',
      length: 20,
      nullable: false,
      default: 'USER',  // 預設角色為 'user'
    },    
    created_at: {
      type: 'timestamp',
      createDate: true,  // 新增資料時自動填入當下時間      
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,  // 更新資料時自動填入當下時間      
    },
  },
}) ;
