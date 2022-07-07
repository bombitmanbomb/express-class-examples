import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'
import lodash from 'lodash'
const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)
await db.read();
db.data ??= {
  users: [],
  books: []
}
await db.write()
db.chain = lodash.chain(db.data)
export class Database {
  static get data(){
    return db.data
  }
  static get chain(){
    return db.chain
  }
  static read(){
    return db.read()
  }
  static write(){
    return db.write()
  }
}
export default Database
