/**
 * @file テーブルクラス
 * @license [MIT License]{@link http://opensource.org/licenses/mit-license.php}
 */

/**
 * @class テーブルを表すクラス
 * @constructor
 * @param {number} seats テーブルの最大座席数
 */
function Table(seats){
    this.seats = Number(seats);
    this.members = [];
}

Table.prototype = {

    /**
     * テーブルの最大座席数
     * @type {number}
     */
    seats: 0,

    /**
     * テーブルに座るメンバー
     * @type {Array.<Member>}
     */
    members: null,

    /**
     * 満席かどうかを表す内部フラグ
     * 満席でなくても強制的に満席にする場合に使用する
     * @type {boolean}
     * @private
     */
    _filled: false,


    /**
     * 座るメンバーを追加する
     * @param {Member} member
     * @return {boolean} 追加に成功した場合には true が返る
     */
    addMember: function(member){
        if(this.isFilled()){
            return false;
        }

        this.members.push(member);
        return true;
    },

    /**
     * テーブルが満席かどうかを返す
     * @return {boolean}
     */
    isFilled: function(){
        return this._filled || this.members.length >= this.seats;
    },

    /**
     * 満席フラグを設定する
     * 満席でなくても強制的に満席にする場合に使用する
     * @param {boolean} filledFlag 満席フラグ
     */
    setFilled: function(filledFlag){
        this._filled = filledFlag;
    }

};
