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
 */
function inputTreeType(id, val) {
    $(id).val(val);
    $(id).change();
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
            var html = '<a href="javascript:inputTreeType(\'#' + input + '\', \'' + arrayTreeTypes[i] + '\')" class="waves-effect waves-green btn normal-button enter mobile-btn tree-btn">' + arrayTreeTypes[i] + '</a>';
            $('#tree-type-list').append(html);
        }
    }
    if (specialTree) {
        var html = '<a href="javascript:inputTreeType(\'#' + input + '\', \'' + specialTree + '\')" class="waves-effect waves-green btn normal-button enter mobile-btn" tree-btn>' + specialTree + '</a>';
        $('#tree-type-list').append(html);
    }
}

/**
 * 登録画面遷移リンク作成
 * @param 調査ID
 * @param 所在地ID
 */
function createRegisterLink(surveyId, surveyDetailId) {
    var surveyDataRegisterLink = $('#survey-data-register-link');
    var registerLinkText = '<a href="../html/survey_data_edit.html?' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">arrow_back_ios</i></a>';
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
    var linkText = '<a href="../html/survey_data_list.html?' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">list</i>伐採木データ一覧画面</a>';
    surveyDataListLink.append(linkText);

    // 履歴一覧画面遷移タグ作成
    var surveyDataHistoryListLink = $('#survey-data-history-list-link');
    var historyLinkText = '<a href="../html/survey_data_history_list.html?' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">history</i>伐採木データ履歴一覧画面</a>';
    surveyDataHistoryListLink.append(historyLinkText);
}
