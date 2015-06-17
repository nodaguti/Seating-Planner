/**
 * @file グループクラス
 * @license [MIT License]{@link http://opensource.org/licenses/mit-license.php}
 */

/**
 * @class グループを表すクラス
 * @constructor
 * @param {string} name グループの名前
 * @param {?Category} category グループが属するカテゴリー
 */
function Group(name, category){
    this.name = name;
    this.category = category;
    this.members = [];
    this.statuses = [];
}

Group.prototype = {

    /**
     * グループの名前
     * @type {string}
     */
    name: null,

    /**
     * グループに属しているメンバー
     * @type {Array.<Member>}
     */
    members: null,

    /**
     * グループが属しているカテゴリー
     * @type {Category}
     */
    category: null,

    /**
     * グループのメンバーが持っている肩書き. {@link Group#addMember} により更新される.
     * @type {Array.<string>}
     */
    statuses: null,

    /**
     * グループにメンバーを追加する.
     * もしこれまでに登録されていない肩書きを持っているメンバーが追加された場合には,
     * {@link Group#statuses} も同時に更新される
     * @param {Member} member
     */
    addMember: function(member){
        this.members.push(member);

        if(this.statuses.indexOf(member.status) === -1){
            this.statuses.push(member.status);
        }
    }

};
