const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'CreditPackage',        // 程式裡的名字：getRepository('Skill') 用它
  tableName: 'credit_package',  // 資料庫裡實際的表名
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
    credit_amount: {
      type: 'integer',
      nullable: false,
    },
    price: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    created_at: { 
      type: 'timestamp', 
      createDate: true 
    },  
  },
});
