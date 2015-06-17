/**
 * @file メンバークラス
 * @license [MIT License]{@link http://opensource.org/licenses/mit-license.php}
 */

/**
 * @class メンバーを表すクラス
 * @constructor
 * @param {string} name 名前
 * @param {number} year 年齢
 * @param {string} status 肩書き
 * @param {?Group} group 所属するグループ
 */
function Member(name, year, status, group){
    this.name = name;
    this.year = year;
    this.status = status;
    this.group = group;
}
