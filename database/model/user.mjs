/**
 * 
 * @export
 * @class User
 */
export class User {
  /**
   * @type {string}
   */
  id;
  /**
   * @type {string}
   */
  username;
  constructor($b = {}){
    this.id = $b.id
    this.username = $b.username
  }
}
