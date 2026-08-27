const { EntitySchema } = require('typeorm')


module.exports = new EntitySchema({
  name: 'CreditPurchase',        // 程式裡的名字：getRepository('CreditPurchase') 用它
  tableName: 'credit_purchase',  // 資料庫裡實際的表名
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    user_id: { 
      type: 'uuid', 
      nullable: false,      
    },
    credit_package_id: { 
      type: 'uuid', 
      nullable: false,      
    },
    purchased_credit: {
      type: 'integer',
      nullable: false,
    },
    price_paid: {
      type: 'numeric',
      nullable: false,
    },
    purchase_at:{
      type: 'timestamp', 
      createDate: true 
    },    
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User', // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { 
        name: 'user_id' , // ← 對應本表的欄位名
        referencedColumnName: 'id',
      }, 
    },
    credit_package: {
      type: 'many-to-one',
      target: 'CreditPackage', // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { 
        name: 'credit_package_id' , // ← 對應本表的欄位名
        referencedColumnName: 'id',
      }, 
    },
  },
});

