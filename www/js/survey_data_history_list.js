// 調査業務ID
var surveyId = null;
// 所在地ID
var surveyDetailId = null;
// IDリスト
var idList = [];
// データ情報リスト
var surveyDataInfoList = {};
// 選択行ID
var selectId = "";
// 直径
var treeMeasuredValue = "";
// 編集中フラグ
var isEdit = false;
// 現在のページ数
var currentPage = 1;

document.addEventListener("deviceready", async function () {
    var param = location.search.substring(1).split("&");
    surveyId = param[0];
    surveyDetailId = param[1];
    await initialize();
    await controlEditScreen();
});

/**
 * 画面初期化
 */
async function initialize() {
    // 登録画面遷移タグ作成
    createRegisterLink(surveyId, surveyDetailId);
    // サイドナビゲーションリンク作成
    createSidenavLink(surveyId, surveyDetailId);
    createContactSidenavLink(4, surveyId, surveyDetailId);
    // 樹種ボタン取得
    var survey = await fetchSurveyById(surveyId);
    // 樹種ボタン設定
    var treeTypeValue = convertSpace(survey.rows.item(0).tree_type_value);
    var specialTree = convertSpace(survey.rows.item(0).special_tree);
    setTreeTypeButton(treeTypeValue, specialTree, "surveyDataTreeType");
    // 伐採木履歴データの設定
    await setPage();
}

/**
 * 伐採木履歴データ一覧表示
 * @param 表示するページ
 */
async function setPage() {
    // 履歴データ取得
    var skip = 0;
    if (currentPage > 1) {
        skip = (50 * currentPage) - 50;
    }
    var surveyDataHistoryList = await fetchSurveyDataHistoryList(surveyDetailId, skip);
    // 全履歴データのカウント取得
    var allSurveyDataHistoryList = await fetchAllSurveyDataHistoryList(surveyDetailId);
    // ページング設定
    if (allSurveyDataHistoryList.rows.length > 0) {
        var pageCount = Math.ceil(allSurveyDataHistoryList.rows.length / 50);
        setPagination(pageCount);
    }
    // 伐採時の備考ごとの集計値設定
    await setSurveyDataNote();

    // 伐採木データ情報の設定
    setSurveyDataHistoryList(surveyDataHistoryList);
    $('.sticky-table-wrapper').scrollTop(0);
}

/**
 * 伐採時の備考ごとに集計し、画面へ設定
 */
async function setSurveyDataNote() {
    var needRopeList = await fetchNeedRope(surveyDetailId);
    $('#need-rope-count').text(needRopeList.rows.length);

    var needWireList = await fetchNeedWire(surveyDetailId);
    $('#need-wire-count').text(needWireList.rows.length);

    var needCutMiddleList = await fetchNeedCutMiddle(surveyDetailId);
    $('#need-cut-middle-count').text(needCutMiddleList.rows.length);

    var notNeedCutMiddleList = await fetchNotNeedCutMiddle(surveyDetailId);
    $('#not-need-cut-middle-count').text(notNeedCutMiddleList.rows.length);

    var isDangerTreeList = await fetchIsDangerTree(surveyDetailId);
    $('#is-danger-tree-count').text(isDangerTreeList.rows.length);

    var needNeedCutBranchList = await fetchNeedCutBranch(surveyDetailId);
    $('#need-cut-branch-count').text(needNeedCutBranchList.rows.length);
}

/**
 * 伐採木履歴データの設定
 * @param 伐採木履歴データ
 */
function setSurveyDataHistoryList(surveyDataHistoryList) {
    var surveyDataHistoryListlItem = $('#survey-data-history-list-item');
    surveyDataHistoryListlItem.empty();
    var texts = "";

    // 履歴一覧の作成
    for (var i = 0; i < surveyDataHistoryList.rows.length; i++) {
        var surveyData = surveyDataHistoryList.rows.item(i);
        // 伐採木データリスト作成
        setSurveyDataInfoList(surveyData);
        // テーブルデータ作成
        texts += setDisplayHistoryData(surveyData);
    }
    surveyDataHistoryListlItem.append(texts);

    // 画面情報設定
    setDisplayInfo();
}

/**
 * 伐採木データリスト設定
 * @param 伐採木データ 
 */
function setSurveyDataInfoList(surveyData) {
    // No設定
    var no = "";
    if (surveyData.color != "") {
        no += surveyData.color + "-";
    }
    if (surveyData.word != "") {
        no += surveyData.word + "-";
    }
    no += surveyData.number;

    // データ情報設定
    idList.push(surveyData.id);
    var dataInfo = {
        'color': surveyData.color,
        'word': surveyData.word,
        'number': surveyData.number,
        'no': no,
        'treeType': surveyData.survey_data_tree_type,
        'measuredValue': surveyData.tree_measured_value,
        'needRope': surveyData.need_rope,
        'needWire': surveyData.need_wire,
        'needCutMiddle': surveyData.need_cut_middle,
        'notNeedCutMiddle': surveyData.not_need_cut_middle,
        'isDengerTree': surveyData.is_danger_tree,
        'needCutBranch': surveyData.need_cut_branch,
        'note': surveyData.note,
        'name': surveyData.name,
        'editFlag': true
    }
    surveyDataInfoList[surveyData.id] = dataInfo;
}

/**
 * ページング設定
 * @param 伐採木データ
 */
function setPagination(pageCount) {
    let pagination = '';
    if (pageCount > 1) {
        $('#survey-data-header').css('display', 'none');
        pagination += '<ul class="pagination" style="text-align: right;">';
        pagination += '<li class="waves-effect">';
        pagination += `<a onclick="handlePage(1)" class="enter"><i class="material-icons">chevron_left</i></a>`;
        pagination += '</li>';

        let i = 1;
        if (currentPage > 5) {
            i = Number(currentPage) - 4;
        }
        for (i; i <= pageCount; i++) {
            if (currentPage == i) {
                pagination += `<li class="active"><a href="#!">${i}</a></li>`;
            } else {
                pagination += '<li class="waves-effect">';
                pagination += `<a onclick="handlePage(${i})" class="enter">${i}</a>`
                pagination += '</li>';
            }
            if (i == (Number(currentPage) + 4)) { break; }
        }
        pagination += '<li class="waves-effect">';
        pagination += `<a onclick="handlePage(${pageCount})" class="enter"><i class="material-icons">chevron_right</i></a>`;
        pagination += '</li>';
        pagination += '</ul>';
    } else {
        $('#survey-data-header').css('display', 'block');
    }
    $('#pagination').html(pagination);
}

/**
 * 履歴一覧表示設定
 * @param 伐採木データ 
 */
function setDisplayHistoryData(surveyData) {
    // 履歴一覧データ作成
    var tagInfo = '<tr class="border-style">';
    // Noリンク
    tagInfo += '<td id="cell-no-' + surveyData.id + '" class="border-style-no">';
    tagInfo += '<a class="modal-trigger" id="survey-data-no-link-' + surveyData.id + '" href="#number-target-modal" onclick="setModalNo(' + surveyData.id + ');">';
    tagInfo += '<span id="survey-data-no-' + surveyData.id + '"></span></a></td>';
    // 樹種リンク
    tagInfo += setDisplayLinkItem(
        "cell-tree-type-" + surveyData.id,
        "survey-data-tree-type-link-" + surveyData.id,
        "survey-data-tree-type-" + surveyData.id,
        "#tree-type-target-modal",
        "setModalTreeType(" + surveyData.id + ");"
    );
    // 直径リンク
    tagInfo += setDisplayLinkItem(
        "cell-measured-value-" + surveyData.id,
        "survey-data-measured-value-link-" + surveyData.id,
        "survey-data-measured_value-" + surveyData.id,
        "#measured-value-target-modal",
        "setModalMeasuredValue(" + surveyData.id + ");"
    );
    // 伐採ロープあり
    tagInfo += setDisplayCheckItem("cell-need-rope-" + surveyData.id, "survey-data-need-rope-" + surveyData.id);
    // 伐採ワイヤーあり
    tagInfo += setDisplayCheckItem("cell-need-wire-" + surveyData.id, "survey-data-need-wire-" + surveyData.id);
    // 中断切りロープあり
    tagInfo += setDisplayCheckItem("cell-need-cut-middle-" + surveyData.id, "survey-data-need-cut-middle-" + surveyData.id);
    // 中断切りロープなし
    tagInfo += setDisplayCheckItem("cell-not-need-cut-middle-" + surveyData.id, "survey-data-not-need-cut-middle-" + surveyData.id);
    // 危険木
    tagInfo += setDisplayCheckItem("cell-is-denger-tree-" + surveyData.id, "survey-data-is-denger-tree-" + surveyData.id);
    // 枝払い
    tagInfo += setDisplayCheckItem("cell-need-cut-branch-" + surveyData.id, "survey-data-need-cut-branch-" + surveyData.id);
    // 備考リンク
    tagInfo += setDisplayLinkItem(
        "cell-note-" + surveyData.id,
        "survey-data-note-link-" + surveyData.id,
        "survey-data-note-" + surveyData.id,
        "#note-target-modal",
        "setModalNote(" + surveyData.id + ");"
    );
    // 担当者リンク
    tagInfo += setDisplayLinkItem(
        "cell-name-" + surveyData.id,
        "survey-data-name-link-" + surveyData.id,
        "survey-data-name-" + surveyData.id,
        "#name-target-modal",
        "setModalName(" + surveyData.id + ");"
    );
    // 削除
    tagInfo += '<td id="cell-delete-' + surveyData.id + '" class="border-style">';
    tagInfo += '<a class="modal-trigger enter" id="delete-' + surveyData.id + '" href="#delete-target-modal" onclick="setDeleteId(' + surveyData.id + ');">';
    tagInfo += '<span id="button-delete-name-' + surveyData.id + '"><i class="material-icons tiny">delete</i></span></td>';
    tagInfo += '</tr>';

    return tagInfo;
}

/**
 * リンク項目画面設定
 * @param セルタグID
 * @param リンクタグID
 * @param 表示タグID
 * @param リンクターゲット
 * @param 関数定義
 */
function setDisplayLinkItem(cellTagId, linkTagId, displayTagId, linkTarget, fuctionDefine) {
    var tag = '<td id="' + cellTagId + '" class="border-style">';
    // tag += '<a class="modal-trigger" id="' + linkTagId + '" href="' + linkTarget + '" onclick="' + fuctionDefine + '">';
    tag += '<span id="' + displayTagId + '"></span></a></td>';
    return tag;
}

/**
 * チェック項目画面設定
 * @param セルタグID
 * @param チェックタグID
 */
function setDisplayCheckItem(cellTagId, checkTagId) {
    var tag = '<td id="' + cellTagId + '" class="border-style ' + checkTagId + '">';
    tag += '<span id="' + checkTagId + '" class="hidden mobile-check"" style="font-size:6px!important">✔</span>';
    tag += '<input type="hidden" name="' + checkTagId + '" value="" /></td>';
    return tag;
}

/**
 * 画面情報設定
 */
function setDisplayInfo() {
    // 各項目情報設定
    for (var i = 0; i < idList.length; i++) {
        var dataInfo = surveyDataInfoList[idList[i]];
        // No
        $('#survey-data-no-' + idList[i]).text(dataInfo.no);
        // 樹種
        $('#survey-data-tree-type-' + idList[i]).text(dataInfo.treeType);
        // 直径
        $('#survey-data-measured_value-' + idList[i]).text(dataInfo.measuredValue);
        // 伐採ロープあり
        setDIsplayCheckInfo("survey-data-need-rope-" + idList[i], dataInfo.needRope);
        // 伐採ワイヤーあり
        setDIsplayCheckInfo("survey-data-need-wire-" + idList[i], dataInfo.needWire);
        // 中断切りロープあり
        setDIsplayCheckInfo("survey-data-need-cut-middle-" + idList[i], dataInfo.needCutMiddle);
        // 中断切りロープなし
        setDIsplayCheckInfo("survey-data-not-need-cut-middle-" + idList[i], dataInfo.notNeedCutMiddle);
        // 危険木
        setDIsplayCheckInfo("survey-data-is-denger-tree-" + idList[i], dataInfo.isDengerTree);
        // 枝払い
        setDIsplayCheckInfo("survey-data-need-cut-branch-" + idList[i], dataInfo.needCutBranch);
        // 玉切り
        setDIsplayCheckInfo("survey-data-need-cut-divide-" + idList[i], dataInfo.needCutDivide);
        // 集積あり
        setDIsplayCheckInfo("survey-data-need-collect-" + idList[i], dataInfo.needCollect);
        // 備考
        if (dataInfo.note == '') {
            $('#survey-data-note-' + idList[i]).text('　');
        } else {
            $('#survey-data-note-' + idList[i]).text(dataInfo.note[0]);
        }
        // 担当者
        if (dataInfo.name == '') {
            $('#survey-data-name-' + idList[i]).text('　');
        } else {
            $('#survey-data-name-' + idList[i]).text(dataInfo.name[0]);
        }
        // 編集不可設定
        changeTargetLineDisable(idList[i]);
    }
}

/**
 * チェック情報画面設定
 * @param タグID
 * @param データ
 */
function setDIsplayCheckInfo(tagId, data) {
    if (data == 'true') {
        $('#' + tagId).removeClass("hidden");
        $('input[name="' + tagId + '"]').val(true);
    } else {
        $('#' + tagId).addClass("hidden");
        $('input[name="' + tagId + '"]').val(false);
    }
    // タッチイベント設定
    $("." + tagId).on('touchstart', function () {
        var changeId = this.id;
        changeId = changeId.replace("cell", "survey-data");
        if ($("#" + changeId).hasClass('hidden')) {
            $("#" + changeId).removeClass('hidden');
            $('input[name="' + changeId + '"]').val(true);
        } else {
            $("#" + changeId).addClass('hidden');
            $('input[name="' + changeId + '"]').val(false);
        }
    });
}

/**
 * 対象行を編集不可に設定
 * @param 対象ID 
 */
function changeTargetLineDisable(targetId) {
    // Noリンク
    changeTargetLinkItemDisable("#cell-no-" + targetId, "#survey-data-no-link-" + targetId);
    // 樹種リンク
    changeTargetLinkItemDisable("#cell-tree-type-" + targetId, "#survey-data-tree-type-link-" + targetId);
    // 直径リンク
    changeTargetLinkItemDisable("#cell-measured-value-" + targetId, "#survey-data-measured-value-link-" + targetId);
    // 伐採ロープあり
    changeTargetCheckItemDisable("#cell-need-rope-" + targetId);
    // 伐採ワイヤーあり
    changeTargetCheckItemDisable("#cell-need-wire-" + targetId);
    // 中断切りロープあり
    changeTargetCheckItemDisable("#cell-need-cut-middle-" + targetId);
    // 中断切りロープなし
    changeTargetCheckItemDisable("#cell-not-need-cut-middle-" + targetId);
    // 危険木
    changeTargetCheckItemDisable("#cell-is-denger-tree-" + targetId);
    // 枝払い
    changeTargetCheckItemDisable("#cell-need-cut-branch-" + targetId);
    // 玉切り
    changeTargetCheckItemDisable("#cell-need-cut-divide-" + targetId);
    // 集積あり
    changeTargetCheckItemDisable("#cell-need-collect-" + targetId);
    // 備考リンク
    changeTargetLinkItemDisable("#cell-note-" + targetId, "#survey-data-note-link-" + targetId);
    // 担当者リンク
    changeTargetLinkItemDisable("#cell-name-" + targetId, "#survey-data-name-link-" + targetId);
    // 編集反映
    $('#cell-edit-' + targetId).css("background-color", "darkgray");
    // 削除
    $('#cell-delete-' + targetId).css("background-color", "darkgray");
    // フラグ設定
    surveyDataInfoList[targetId].editFlag = true;
}

/**
 * リンク項目の編集不可設定
 * @param セルタグID
 * @param リンクタグID
 */
function changeTargetLinkItemDisable(cellTagId, linkTagId) {
    $(cellTagId).css("background-color", "darkgray");
    $(linkTagId).css("pointer-events", "none");
    $(linkTagId).css("color", "gray");
}

/**
 * チェック項目の編集不可設定
 * @param タグID
 */
function changeTargetCheckItemDisable(tagId) {
    $(tagId).css("background-color", "darkgray");
    $(tagId).css("pointer-events", "none");
    $(tagId).css("color", "gray");
}

/**
 * 編集反映および削除ボタンの使用不可設定
 * @param 対象ID
 */
function changeButtonDisable(targetId) {
    for (var i = 0; i < idList.length; i++) {
        // 押下したボタン以外を使用不可に設定
        if (targetId != idList[i]) {
            // 編集反映
            $('#' + idList[i]).css("pointer-events", "none");
            $('#' + idList[i]).css("color", "gray");
        }
        // 削除
        $('#delete-' + idList[i]).css("pointer-events", "none");
        $('#delete-' + idList[i]).css("color", "gray");
    }
}

/**
 * 編集反映および削除ボタンの使用可能設定
 */
function changeButtonEnable() {
    for (var i = 0; i < idList.length; i++) {
        // 編集反映
        $('#' + idList[i]).css("pointer-events", "auto");
        $('#' + idList[i]).css("color", "");
        // 削除
        $('#delete-' + idList[i]).css("pointer-events", "auto");
        $('#delete-' + idList[i]).css("color", "");
    }
}
/**
 * ナンバリング入力用モーダル画面の表示設定
 * @param Id
 */
function setModalNo(id) {
    selectId = id;
    $('#color').val(surveyDataInfoList[id].color);
    $('#word').val(surveyDataInfoList[id].word);
    $('#number').val(surveyDataInfoList[id].number);
}

/**
 * 樹種入力用モーダル画面の表示設定
 * @param Id
 */
function setModalTreeType(id) {
    selectId = id;
    $('#survey-data-tree-type-modal').val(surveyDataInfoList[id].treeType);
}

/**
 * 直径入力用モーダル画面の表示設定
 * @param Id
 */
function setModalMeasuredValue(id) {
    selectId = id;
    $('#measured-value-modal').text(surveyDataInfoList[id].measuredValue);
}

/**
 * 備考入力用モーダル画面の表示設定
 * @param Id
 */
function setModalNote(id) {
    selectId = id;
    $('#note-modal').val(surveyDataInfoList[id].note);
}

/**
 * 担当者入力用モーダル画面の表示設定
 * @param Id
 */
function setModalName(id) {
    selectId = id;
    $('#name-modal').val(surveyDataInfoList[id].name);
}

/**
 * 削除対象ID設定
 * @param Id 
 */
function setDeleteId(id) {
    selectId = id;
}

/**
 * Noの表示設定
 */
function setNo() {
    surveyDataInfoList[selectId].color = $('#color').val();
    surveyDataInfoList[selectId].word = $('#word').val();
    surveyDataInfoList[selectId].number = $('#number').val();
    var no = "";
    if (surveyDataInfoList[selectId].color != "") {
        no += surveyDataInfoList[selectId].color + "-";
    }
    if (surveyDataInfoList[selectId].word != "") {
        no += surveyDataInfoList[selectId].word + "-";
    }
    no += surveyDataInfoList[selectId].number;
    $('#survey-data-no-' + selectId).text(no);
    if (no == '') {
        $('#survey-data-no-' + selectId).text('　');
    }
}

/**
 * 樹種の表示設定
 */
function setTreeType() {
    surveyDataInfoList[selectId].treeType = $('#survey-data-tree-type-modal').val();
    $('#survey-data-tree-type-' + selectId).text(surveyDataInfoList[selectId].treeType);
    if (surveyDataInfoList[selectId].treeType == '') {
        $('#survey-data-tree-type-' + selectId).text('　');
    }
}

/**
 * 直径の表示設定
 */
function setMeasuredValue() {
    surveyDataInfoList[selectId].measuredValue = treeMeasuredValue;
    $('#survey-data-measured_value-' + selectId).text(surveyDataInfoList[selectId].measuredValue);
    if (surveyDataInfoList[selectId].measuredValue == '') {
        $('#survey-data-measured_value-' + selectId).text('　');
    }
}

/**
 * 備考の表示設定
 */
function setNote() {
    surveyDataInfoList[selectId].note = $('#note-modal').val();
    if (surveyDataInfoList[selectId].note == '') {
        $('#survey-data-note-' + selectId).text('　');
    } else {
        $('#survey-data-note-' + selectId).text(surveyDataInfoList[selectId].note[0]);
    }
}

/**
 * 担当者の表示設定
 */
function setName() {
    surveyDataInfoList[selectId].name = $('#name-modal').val();
    if (surveyDataInfoList[selectId].name == '') {
        $('#survey-data-name-' + selectId).text('　');
    } else {
        $('#survey-data-name-' + selectId).text(surveyDataInfoList[selectId].name[0]);
    }
}

/**
 * 伐採木データ削除
 */
async function deleteData() {
    // 伐採木データ削除
    deleteSurveyDataById(selectId);
    // 伐採木データ履歴一覧再表示
    setPage();
}

/**
 * 直径の設定
 * @param {*} value 設定する直径
 */
function applyMesuredValue(value) {
    if (treeMeasuredValue == '0') {
        treeMeasuredValue = '';
    }
    treeMeasuredValue += value;
    $('#measured-value-modal').text(treeMeasuredValue);
}

/**
 * ページング処理
 * @param {*} ページ 
 */
function handlePage(targetPage) {
    if (isEdit) {
        return alert('編集中の行があります。更新してから画面遷移してください。')
    }
    currentPage = targetPage;
    setPage();
}