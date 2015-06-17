/**
 * @file UIおよびアプリケーションロジック
 * @license [MIT License]{@link http://opensource.org/licenses/mit-license.php}
 */

/**
 * ページが読み込まれたときに全体の初期化を行う
 */
function init(){
    CreateWizard.init();
    initEditableTable();

    //テーブルの入力欄において、
    //「追加」ボタンを押した行の値を新規追加された行にコピーする
    //テーブルの席数は同じであることが多いので、
    //こうすることでユーザーの労力が軽減される.
    $('.table-list .table-btn-add').on('click', function(){
        var itemBtnClicked = $(this).closest('.table-item, .table-template');

        itemBtnClicked.next().find('.table-list-max-seats > input').val(
            itemBtnClicked.find('.table-list-max-seats > input').val()
        );
    });


    //「すべて閉じる」および「すべて開く」
    $('.btn-closeAll').on('click', function(){
        $('.table-group .table-item .panel-collapse').collapse('hide');
    });

    $('.btn-expandAll').on('click', function(){
        $('.table-group .table-item .panel-collapse').collapse('show');
    });
}

/**
 * 列の「追加」「削除」機能を持ったテーブルを初期化する
 * @todo 本来はjQueryのプラグインとして実装するのがよい
 */
function initEditableTable(){
    $('.table-btn-add').click(function(event){
        event.stopPropagation();

        var table = $(this).closest('table');

        //.not() は入れ子になっている部分の要素を排除するために使用する
        //すなわち、「まさに今処理しているテーブル」の要素のみを対象とする
        //他の部分も同様。
        var itemNum = table.find('.table-item').not(table.find('table').find('.table-item')).length;
        var newItem = table.find('.table-template').not(table.find('table').find('.table-template')).clone(true);

        newItem.removeClass('table-template').addClass('table-item');

        //add column id
        newItem.attr('data-id', itemNum);
        newItem.find('button[href]').not(table.find('table').find('button[href]')).attr('href', function(){
            //href属性が空の時にNaNになるのを防ぐ必要がある
            return ($(this).attr('href') + itemNum) || '';
        });
        newItem.find('[id]').not(table.find('table').find('[id]')).attr('id', function(){
            return $(this).attr('id') + itemNum;
        });

        newItem.insertAfter($(this).closest('.table-item, .table-template'));

        //open the child element in added column if it contains accordion
        newItem.find('.panel-collapse').collapse('show');

        //focus the first input element in added column
        newItem.find('input').first().focus();
    });


    $('.table-btn-delete').click(function(event){
        event.stopPropagation();

        var button = $(this);
        var table = button.closest('table');

        //最後の1列の場合には削除をすると追加ができなくなるため、
        //削除させない
        if(
            table.find('.table-item')
                .not(table.find('table').find('.table-item')).length < 2
        ){
            return;
        }

        //通常のテーブルの場合
        button.closest('tr')
        //アコーディオン形式の場合
        .add(button.closest('tbody').find('.panel-heading').closest('.panel'))
        .remove();
    });


    //最初の列を挿入する
    //反転て後のテーブルから処理していかないと、
    //テーブルが入れ子になっている場合に
    //子テーブルの列が追加されなくなってしまう
    $($('.table-template .table-btn-add').get().reverse()).click();
}


/**
 * 作成画面のウィザード
 * @namespace
 */
var CreateWizard = {

    /**
     * テーブル
     * @type {Array.<Table>}
     */
    tables: null,

    /**
     * カテゴリ
     * @type {Array.<Category>}
     */
    categories: null,

    /**
     * グループ
     * @type {Array.<Group>}
     */
    groups: null,


    /** ウィザードのページ番号を表す定数 **/

    /**
     * 「データの入力」ページを表す定数
     * @type {number}
     */
    PAGE_ENTER_DATA: 0,

    /**
     * 「グループ序列の決定」ページを表す定数
     * @type {number}
     */
    PAGE_SORT_GROUPS: 1,

    /**
     * 「肩書き序列の決定」ページを表す定数
     * @type {number}
     */
    PAGE_SORT_STATUSES: 2,

    /**
     * 「メンバー序列の決定」ページを表す定数
     * @type {number}
     */
    PAGE_SORT_MEMBERS: 3,

    /**
     * 「結果」ページを表す定数
     * @type {number}
     */
    PAGE_RESULT: 4,


    /**
     * ウィザードの初期化を行う。起動時に一度だけ呼ばれる。
     */
    init: function(){
        this.tables = [];
        this.categories = [];
        this.groups = [];

        $('#createWizard').steps({
            headerTag: 'h1',
            bodyTag: 'section',
            autoFocus: true,
            enableFinishButton: false,

            //Go to the next page
            onStepChanging: function(event, currentIndex, nextIndex){
                switch(currentIndex){

                    case this.PAGE_ENTER_DATA:
                        this.doLoadData();
                        return this.validateData();

                    case this.PAGE_SORT_GROUPS:
                        this.doSortGroups();
                        break;

                    case this.PAGE_SORT_STATUSES:
                        this.doSortStatuses();
                        break;

                    case this.PAGE_SORT_MEMBERS:
                        this.doSortMembers();
                        break;

                }

                return true;
            }.bind(this),

            onStepChanged: function(event, currentIndex, priorIndex){
                //we should repeat previous pages' processes
                //in order to prevent inconsistent of data
                for(var i=0; i<=priorIndex; i++){
                    switch(i){
                        case this.PAGE_ENTER_DATA:
                            this.doLoadData();
                            break;

                        case this.PAGE_SORT_GROUPS:
                            this.doSortGroups();
                            break;

                        case this.PAGE_SORT_STATUSES:
                            this.doSortStatuses();
                            break;

                        case this.PAGE_SORT_MEMBERS:
                            this.doSortMembers();
                            break;
                    }
                }

                //init the page just moved
                switch(currentIndex){

                    case this.PAGE_SORT_GROUPS:
                        this.initSortGroups();
                        break;

                    case this.PAGE_SORT_STATUSES:
                        this.initSortStatuses();
                        break;

                    case this.PAGE_SORT_MEMBERS:
                        this.initSortMembers();
                        break;

                    case this.PAGE_RESULT:
                        this.initResult();
                        break;

                }
            }.bind(this),
        });

        //since "PAGE_ENTER_DATA" is shown by default,
        //init the page when loaded the page.
        this.initLoadData();
    },


    /**
     * 「データの入力」画面の初期化を行う
     */
    initLoadData: function(){
        var self = this;

        $('.btn-import').on('click', function(){
            var modal = $(
                '<div class="modal fade import-dialog">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header">' +
                                '<h4 class="modal-title">データの読み込み</h4>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<p>データファイル(seating-planner-data-xxxxxx.dat, xには数字が入る)を選択するか、ウィンドウにドロップして下さい。</p>' +
                                '<p>現在入力されているデータはすべて消去されますのでご注意下さい。</p>' +
                                '<input type="file" class="import-dialog-file-input" value="ファイルの選択" />' +
                                '<a href="#" class="btn btn-primary btn-import">ファイルを選択</a>' +
                            '</div>' +
                            '<div class="modal-footer">' +
                                '<button type="button" class="btn btn-primary" data-dismiss="modal">キャンセル</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            ).appendTo('body').modal();

            modal.on('dragenter dragover dragend dragleave', function(event){
                event.preventDefault();
            });

            modal.on('drop', function(event){
                event.preventDefault();
                modal.modal('hide');
                CreateWizard.importData(event.dataTransfer.files, modal);
            });

            modal.find('.btn-import').on('click', function(event){
                event.preventDefault();
                modal.find('.import-dialog-file-input').click();
            });

            modal.find('.import-dialog-file-input').on('change', function(event){
                modal.modal('hide');
                CreateWizard.importData(this.files);
            });

            modal.on('hidden.bs.modal', function(){
                modal.remove();
            });
        });

        $('.btn-export').on('click', function(){
            self.doLoadData(true);

            var exportData = {
                tables: self.tables,
                categories: self.categories
            };

            var url = "data:application/octet-stream," + encodeURIComponent(JSON.stringify(exportData));

            var modal = $(
                '<div class="modal fade export-dialog">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header">' +
                                '<h4 class="modal-title">データの保存</h4>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<p>下のボタンを押すと「seating-planner-data-xxxxxx.dat」(xには数字が入る)というファイル名の' +
                                'ファイルがダウンロードされます。</p>' +
                                '<a href="' + url + '" download="seating-planner-data-' + Date.now() + '.dat' +
                                '" class="btn btn-primary center-block">データのダウンロード</a>' +
                            '</div>' +
                            '<div class="modal-footer">' +
                                '<button type="button" class="btn btn-primary" data-dismiss="modal">閉じる</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            ).appendTo('body').modal();

            modal.on('hidden.bs.modal', function(){
                modal.remove();
            });
        });

    },

    /**
     * ファイルからデータを読み込み、画面に反映させる
     * @param {FileList} files 読みこむ対象のファイル
     */
    importData: function(files){
        if(!files.length === 1){
            alert('複数個のファイルの読み込みはサポートしていません。');
            return;
        }

        var file = files[0];
        var reader = new FileReader();

        reader.onerror = function(event){
            alert('ファイルの読み込みに失敗しました。\n\n' + event.target.error);
        };

        reader.onload = function(event){
            var data = JSON.parse(event.target.result);

            //Remove existed data
            $('.table-list tr.table-item').remove();
            $('.table-group > tbody.table-item').remove();

            //load tables
            data.tables.forEach(function(table){
                //add new table
                $('.table-list .table-btn-add').last().click();

                //apply the data of this table
                $('.table-list tr.table-item').last()
                    .find('.table-list-max-seats > input').val(table.seats)
            }, this);

            //load groups
            data.categories.forEach(function(category, index){
                category.groups.forEach(function(group){
                    //add new group
                    $('.table-group > tbody > .panel-heading .table-btn-add').last().click();

                    //apply the data of this group
                    var newGroup = $('.table-group > tbody.table-item').last();

                    newGroup.find('.table-group-name > input').val(group.name)
                    newGroup.find('.table-list-category > select').val(index);

                    //remove first blank member
                    newGroup.find('.table-member tr.table-item').remove();

                    //load members
                    group.members.forEach(function(member){
                        newGroup.find('.table-member .table-btn-add').last().click();

                        var newMember = newGroup.find('.table-member tr.table-item').last();

                        newMember.find('.table-member-name > input').val(member.name);
                        newMember.find('.table-member-year > input').val(member.year);
                        newMember.find('.table-member-status > input').val(member.status);
                    });
                });
            });
        }.bind(this);

        reader.readAsText(file, 'utf-8');
    },

    /**
     * 入力されたデータを読み込む
     * @param {boolean} [forJSON=false] json出力用のインスタンスを生成するかどうか
     */
    doLoadData: function(forJSON){
        //load tables
        this.tables = $('.table-list tr.table-item > .table-list-max-seats > input').get().map(function(input){
            return new Table($(input).val());
        });

        //initialize categories
        this.categories = [
            new Category("主賓"),
            new Category("上司"),
            new Category("恩師"),
            new Category("同僚"),
            new Category("友人"),
            new Category("親族")
        ];

        //load groups
        this.groups = $('.table-group > .panel.table-item').get().map(function(panel){
            panel = $(panel);

            var category = this.categories[panel.find('.table-list-category > select > option:selected').val() - 0];

            //Create group
            var group = new Group(
                panel.find('.table-group-name > input').val(),
                forJSON ?
                    null :
                    category
            );

            category.addGroup(group);

            //Register members belong to this group
            panel.find('.table-member tr.table-item').each(function(index){
                var $this = $(this);

                var member = new Member(
                    $this.find('.table-member-name > input').val(),
                    $this.find('.table-member-year > input').val(),
                    $this.find('.table-member-status > input').val(),
                    forJSON ?
                        null :
                        group
                );

                //exclude blank data without warning
                if(!member.name && !member.status && !member.year){
                    return;
                }

                //warn if required fields are not filled
                if(!member.name || !member.year){
                    alert((index+1) + '番目のメンバーの 名前 もしくは 年齢 が入力されていません。');
                    return;
                }

                group.addMember(member);
            });

            return group;
        }, this);
    },

    /**
     * 入力されたデータの正当性をチェックする
     * @return {boolean} チェックに通過すればtrueを返す
     */
    validateData: function(){
        //check if there is empty group
        if(this.groups.some(function(group){
            if(!group.members.length){
                alert('グループ「' + group.name + '」が空です.');
                return true;
            }

            return false;
        })){
            return false;
        }

        //check over-capacity
        var maxCapacity = 0;
        this.tables.forEach(function(table){ maxCapacity += table.seats; });

        var peopleNum = 0;
        this.groups.forEach(function(group){ peopleNum += group.members.length; });

        if(maxCapacity < peopleNum){
            alert('参加人数が座席数を超えています.');
            return false;
        }

        return true;
    },


    /**
     * 「グループ序列の決定」画面の初期化を行う
     */
    initSortGroups: function(){
        var content = $('.page-sort-groups-content');
        content.empty();

        this.categories.forEach(function(category, index){
            content.append(
                '<h2>' + category.name + '</h2>' +
                '<ul class="group-sortable-' + index + ' sortable"></ul>'
            );

            category.groups.forEach(function(group, index2){
                $('.group-sortable-' + index).append("<li class='ui-state-default' data-id='" + index2 + "'>" + group.name + "</li>");
            });
        });

        $('[class*="group-sortable-"]').each(function(){
            if(!this.hasChildNodes()){
                //delete empty categories' sort forms
                $(this).prev().addBack().remove();
            }else{
                //make li's sortable
                $(this).sortable().disableSelection();
            }
        });
    },

    /**
     * ユーザーの指定に基づきグループのソートを行う
     */
    doSortGroups: function(){
         //sort groups just as user specified
        $('[class*="group-sortable-"]').get().forEach(function(ul){
            var category = this.categories[(ul.className.match(/group-sortable-(\d+)/) || [])[1]];
            var _groups = [].concat(category.groups);

            //use "in-place sorting" algorithm
            category.groups = $(ul).children('li').get().map(function(li){
                return _groups[li.dataset.id - 0];
            });
        }, this);
    },


    /**
     * 「肩書き序列の決定」ページの初期化を行う
     */
    initSortStatuses: function(){
        var content = $('.page-sort-statuses-content');
        content.empty();

        this.groups.forEach(function(group, index){
            content.append(
                '<h2>' + group.name + '</h2>' +
                '<ul class="status-sortable-$INDEX$ sortable" data-id="$INDEX$"></ul>'.replace(/\$INDEX\$/g, index)
            );

            var ul = $('.status-sortable-' + index);

            group.statuses.forEach(function(status, index2){
                ul.append(
                    //if status of some members is not given, use "(指定なし)" instead of blank name
                    '<li class="ui-state-default" data-id="' + index2 + '">' + (status || '(指定なし)') + "</li>"
                );
            }, this);

            ul.sortable().disableSelection();
        }, this);
    },

    /**
     * ユーザーの指定に基づき肩書きのソートを行う<br />
     * また、肩書きに基づきグループ内のメンバーをソートしておく<br />
     * (「メンバー序列の決定」でのユーザーの負担を減らすため)
     */
    doSortStatuses: function(){
        $('[class*="status-sortable-"]').get().forEach(function(ul){
            var group = this.groups[(ul.className.match(/status-sortable-(\d+)/) || [])[1]];
            var _statuses = [].concat(group.statuses);

            //sort status
            //use "in-place sorting" algorithm
            group.statuses = $(ul).children('li').get().map(function(li){
                return _statuses[li.dataset.id - 0];
            });

            //sort members as status hierarchy
            group.members.sort(function(a, b){
                //When "a" has a status superior to "b",
                //group.statuses.indexOf(a.status) is smaller than that of "b".
                //Also, we consider older person is higher in rank when both members' status is same.
                return group.statuses.indexOf(a.status) - group.statuses.indexOf(b.status) ||
                        b.year - a.year;
            });
        }, this);
    },


    /**
     * 「メンバー序列の決定」ページの初期化を行う
     */
    initSortMembers: function(){
        var content = $('.page-sort-members-content');
        content.empty();

        this.groups.forEach(function(group, index){
            content.append(
                ('<h2>' + group.name + '</h2>' +
                '<table class="member-sortable-$INDEX$ table table-bordered table-condensed" data-id="$INDEX$">' +
                '<tbody><tr><th>名前</th><th>年齢</th><th>役職・肩書き</th></tr></tbody></table>').replace(/\$INDEX\$/g, index)
            );

            group.members.forEach(function(member, index2){
                $('.member-sortable-' + index + ' > tbody').append(
                    '<tr data-id="' + index2 + '">' +
                        '<td>' + member.name + '</td>' +
                        '<td>' + member.year + '</td>' +
                        '<td>' + member.status + '</td>' +
                    '</tr>'
                );
            }, this);

            $('.member-sortable-' + index).sortable({
                items: "tr[data-id]",
                opacity: 0.75,
                helper: function(e, tr){
                    //prevent tr from shrinking while it being moved
                    var $originals = tr.children();
                    var $helper = tr.clone();
                    $helper.children().each(function(index) {
                        $(this).width($originals.eq(index).width());
                    });
                    return $helper;
                }
            }).disableSelection();
        }, this);
    },

    /**
     * ユーザーの指定に基づきメンバーのソートを行う
     */
    doSortMembers: function(){
        $('[class*="member-sortable-"]').get().forEach(function(table){
            var group = this.groups[(table.className.match(/member-sortable-(\d+)/) || [])[1]];
            var _members = [].concat(group.members);

            //sort members
            //use "in-place sorting" algorithm
            group.members = $(table).find('tr[data-id]').get().map(function(tr){
                return _members[tr.dataset.id - 0];
            });
        }, this);
    },


    /**
     * 「結果」ページの初期化を行う
     */
    initResult: function(){
        //追加するテーブルの番号を表す
        var tableAdding;

        //親族の人たちに関しては、
        //  ・ばらさない(ばらすとより上座のテーブルに行く可能性がある)
        //  ・必ず一番下座のテーブルである
        //という条件があるので、先に処理を行う
        //親族の中で、序列が低い順に後から詰めていけばよい。
        //また、親族はグループ別に分ける必要はないだろう
        //関係の悪い親族同士というのも考えられるが、
        //その場合手動で分けてもらえばよい話である。

        //一番後ろののテーブルから追加する
        tableAdding = this.tables.length - 1;

        this.categories.pop().groups.reverse().forEach(function(group){
            group.members.reverse().forEach(function(member){
                //もし満席の場合は次のテーブルに入れる
                if(this.tables[tableAdding].isFilled()){
                    //逆順で入れているから、ひっくり返す必要がある
                    this.tables[tableAdding].members = this.tables[tableAdding].members.reverse();

                    //次のテーブルを処理対象にする
                    tableAdding--;
                }

                this.tables[tableAdding].addMember(member);
            },this);
        }, this);

        //親族を最後に入れたテーブルでは
        //後処理をしていないので別に行う
        if(this.tables[tableAdding].members.length > 0){
            //逆順で入れているから、ひっくり返す必要がある
            this.tables[tableAdding].members = this.tables[tableAdding].members.reverse();

            //埋まっていなかったとしても、親族のテーブルには相席させない
            this.tables[tableAdding].setFilled(true);
        }


        //その他の人たちは、序列の高い順に上座のテーブルから入れる。
        //なるべくグループごとに座れるようにする。

        //先頭のテーブルから処理する
        tableAdding = 0;

        this.categories.forEach(function(category, index){
            category.groups.forEach(function(group){
                group.members.forEach(function(member){
                    //もし満席の場合は次のテーブルに入れる
                    if(this.tables[tableAdding].isFilled()){
                        tableAdding++;
                    }

                    //もしテーブルの数が足りなくなった場合には、
                    //下座のテーブルで空いている席から順に埋めていく
                    if(!this.tables[tableAdding] || this.tables[tableAdding].isFilled()){
                        while(tableAdding >= 0 && (!this.tables[tableAdding] || this.tables[tableAdding].isFilled())){
                            tableAdding--;
                        }
                    }

                    //席数がどうしても足りない場合
                    //(親族を相席にしないようにしているため, 席数が足りなくなる可能性がある)
                    if(tableAdding < 0){
                        if(confirm("親族と別のグループのメンバーを相席にしない場合, 席数が足りません。相席を許可しますか？")){
                            this.tables.forEach(function(table, index2){
                                table.setFilled(false);

                                if(!table.isFilled()){
                                    tableAdding = index2;
                                }
                            });
                        }else{
                            alert('座席数を増やして再度始めから実行してください。');
                            throw '';
                        }
                    }

                    this.tables[tableAdding].addMember(member);
                }, this);

                //グループごとに座るようにするため、
                //次のグループのメンバーは次のテーブルから入れていく
                //ただし、半分以上テーブルが埋まっていない場合には次のグループと相席にする
                //   テーブルの使用が非効率になると, テーブルが足りなくなる可能性が高くなる。
                //   足りなくなった場合には序列後方のグループとの相席になるため、
                //   不自然な席次になる可能性が高まる。
                if(this.tables[tableAdding].members.length > (this.tables[tableAdding].seats / 2)){
                    tableAdding++;
                }
            }, this);
        }, this);


        var content = $('.page-result-content');
        content.empty();

        this.tables.forEach(function(table, index){
           content.append(
                '<h2>テーブル' + (index+1) + '</h2>' +
                '<table class="table table-bordered table-striped table-condensed result-table-' + index + '">' +
                    '<tbody><tr><th>名前</th><th>年齢</th><th>所属カテゴリ</th><th>所属グループ</th><th>役職・肩書き</th></tr></tbody>' +
                '</table>'
            );

            table.members.forEach(function(member){
                $('.result-table-' + index + ' > tbody').append(
                    '<tr>' +
                        '<td>' + member.name + '</td>' +
                        '<td>' + member.year + '</td>' +
                        '<td>' + member.group.category.name + '</td>' +
                        '<td>' + member.group.name + '</td>' +
                        '<td>' + member.status + '</td>' +
                    '</tr>'
                );
            });
        });
    },
};
