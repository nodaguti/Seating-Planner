/**
 * @file カテゴリークラス
 * @license [MIT License]{@link http://opensource.org/licenses/mit-license.php}
 */

/**
 * @class カテゴリーを表すクラス
 * @constructor
 * @param {string} name カテゴリーの名前
 */
function Category(name){
    this.name = name;
    this.groups = [];
}

Category.prototype = {

    /**
     * カテゴリーの名前
     * @type {string}
     */
    name: null,

    /**
     * このカテゴリーに所属しているグループ
     * @type {Array.<Group>}
     */
    groups: null,


    /**
     * グループをカテゴリーに追加する
     * @param {Group} group
     */
    addGroup: function(group){
        this.groups.push(group);
    },

};
