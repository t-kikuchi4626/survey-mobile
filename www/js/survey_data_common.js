/**
 * テキストボックスの更新処理
 * @param {*} 更新内容
 * @param {*} 更新カラム
 * @param {*} 必須チェック有無
 * @param {*} 数値チェック有無
 */
function updateInputTextArea(inputdata, column, required, number) {
    if (required && validateRequired(inputdata, column)) {
        return;
    }
    if (number && validateNumber(inputdata, column)) {
        return;
    }
}

/**
 * 必須チェック
 * @param {*} 入力値
 * @param {*} 更新カラム
 */
function validateRequired(inputdata, column) {
    if (inputdata.value === '') {
        $('#' + column + '_required').show();
        inputdata.style.background = 'pink';
        return true;
    }
    $('#' + column + '_required').hide();
    inputdata.style.background = 'white';
    return false;
}

/**
 * 数値チェック
 * @param {*} 入力値
 * @param {*} 更新カラム
 */
function validateNumber(inputdata, column) {
    if (isNaN(inputdata.value)) {
        $('#' + column + '_number').show();
        inputdata.style.background = 'pink';
        return true;
    }
    inputdata.style.background = 'white'
    $('#' + column + '_number').hide();
    return false;
}

/**
 * 樹種ボタン押下時、入力欄に樹種名を設定
 * @param 樹種入力欄ID
 * @param 設定する樹種名
 * @param 樹種ボタンのID
 */
function inputTreeType(id, val) {
    $(id).val(val);
    $(id).change();
    $('.tree-select-btn').addClass("not-select");
    $('#' + val).removeClass("not-select");
}

/**
 * 樹種ボタン押下時、入力欄に樹種名を設定(モーダル内)
 * @param 樹種入力欄ID
 * @param 設定する樹種名
 * @param 樹種ボタンのID
 */
function inputTreeTypeInModal(id, val) {
    var vals = val.replace('modal-', "");
    $(id).val(vals);
    $(id).change();
    $('.tree-select-btn-in-modal').addClass("not-select");
    $('#' + val).removeClass("not-select");
}

/**
 * 樹種選択ボタンの生成
 * @param 樹種タイプ
 * @param 特殊樹
 * @param 入力項目
 */
function setTreeTypeButton(treeTypes, specialTree, input) {
    if (treeTypes) {
        var arrayTreeTypes = treeTypes.split(',');
        for (let i in arrayTreeTypes) {
            var html = `<a id="${arrayTreeTypes[i]}" href="javascript:inputTreeType('#${input}', '${arrayTreeTypes[i]}')" class="tree-select-btn waves-effect waves-light btn normal-button enter mobile-btn tree-btn not-select">${arrayTreeTypes[i]}</a>`;
            $('#tree-type-list').append(html);
        }
    }
    if (specialTree) {
        var arrayspecialTree = specialTree.split(',');
        for (let i in arrayspecialTree) {
            var html = `<a id="${arrayspecialTree[i]}" href="javascript:inputTreeType('#${input}', '${arrayspecialTree[i]}')" class="tree-select-btn waves-effect waves-light btn normal-button enter mobile-btn tree-btn not-select">${specialTree}</a>`;
            $('#tree-type-list').append(html);
        }
    }
}

/**
 * モーダル内樹種選択ボタンの生成
 * @param 樹種タイプ
 * @param 特殊樹
 * @param 入力項目
 */
function setTreeTypeButtonInModal(treeTypes, specialTree, input) {
    if (treeTypes) {
        var arrayTreeTypes = treeTypes.split(',');
        for (let i in arrayTreeTypes) {
            var html = `<a id="modal-${arrayTreeTypes[i]}" href="javascript:inputTreeTypeInModal('#${input}', 'modal-${arrayTreeTypes[i]}')" class="tree-select-btn-in-modal waves-effect waves-light btn normal-button enter mobile-btn tree-btn not-select">${arrayTreeTypes[i]}</a>`;
            $('#modal-tree-type-list').append(html);
        }
    }
    if (specialTree) {
        var arrayspecialTree = specialTree.split(',');
        for (let i in arrayspecialTree) {
            var html = `<a id="modal-${arrayspecialTree[i]}" href="javascript:inputTreeTypeInModal('#${input}', 'modal-${arrayspecialTree[i]}')" class="tree-select-btn-in-modal waves-effect waves-light btn normal-button enter mobile-btn tree-btn not-select">${specialTree}</a>`;
            $('#modal-tree-type-list').append(html);
        }
    }
}


/**
 * 樹種ごとのカウントをテーブル形式で表示
 * @param 連想配列（樹種、カウント数）
 */
function setTreeCount(treeCountArray) {
    $('#tree-type-list-count-header').empty();
    $('#tree-type-list-count-value').empty();
    Object.keys(treeCountArray).forEach(function (value) {
        var html = `<th>${value}</th>`;
        $('#tree-type-list-count-header').append(html);
    });
    $('#tree-type-list-count-header').append('<th>合計</th>');
    var counts = 0;
    Object.keys(treeCountArray).forEach(function (value) {
        var td = `<td>${treeCountArray[value]}本</td>`;
        $('#tree-type-list-count-value').append(td);
        counts = counts + treeCountArray[value];
    });
    $('#tree-type-list-count-value').append('<td>' + counts + '本</td>');
}

/**
 * 登録画面遷移リンク作成
 * @param 調査ID
 * @param 所在地ID
 */
function createRegisterLink(surveyId, surveyDetailId) {
    var surveyDataRegisterLink = $('#survey-data-register-link');
    var registerLinkText = `<a href="../html/survey_data_edit.html?${surveyId}&${surveyDetailId}"><i class="material-icons">arrow_back_ios</i></a>`;
    surveyDataRegisterLink.append(registerLinkText);
}

/**
 * サイドナビゲーションのリンク作成
 * @param 調査ID
 * @param 所在地ID
 */
function createSidenavLink(surveyId, surveyDetailId) {
    // 一覧画面遷移タグ作成
    var surveyDataListLink = $('#survey-data-list-link');
    var linkText = `<a href="../html/survey_data_list.html?${surveyId}&${surveyDetailId}"><i class="material-icons">list</i>伐採木データ一覧画面</a>`;
    surveyDataListLink.append(linkText);

    // 履歴一覧画面遷移タグ作成
    var surveyDataHistoryListLink = $('#survey-data-history-list-link');
    var historyLinkText = `<a href="../html/survey_data_history_list.html?${surveyId}&${surveyDetailId}"><i class="material-icons">history</i>伐採木データ履歴一覧画面</a>`;
    surveyDataHistoryListLink.append(historyLinkText);
}
