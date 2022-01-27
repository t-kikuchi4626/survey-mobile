// 調査業務ID
var surveyId = null;
// 所在地ID
var surveyDetailId = null;
// uuid
var uuid = "";
var id = null;
var isHistoryFlag = false;
document.addEventListener("deviceready", async function () {
    var param = location.search.substring(1).split("&");
    uuid = device.uuid;
    param.length === 3 ?
        (v => {
            //履歴リンクから移動時の対応
            surveyId = param[0];
            id = param[1];
            surveyDetailId = param[2];
            surveyDetailId = surveyDetailId.substring(0, surveyDetailId.indexOf("%"));
        })() :
        (v => {
            surveyId = param[0];
            surveyDetailId = param[1];
        })();

    // 所在地一覧遷移タグ作成
    var surveyDetailListLink = $('#survey-detail-list-link');
    var detailListLinkText = `<a href="../html/survey_detail_list.html?${surveyId}"><i class="material-icons">arrow_back_ios</i></a>`;
    surveyDetailListLink.append(detailListLinkText);

    // サイドナビゲーションリンク作成
    createSidenavLink(surveyId, surveyDetailId);
    createContactSidenavLink(3, surveyId, surveyDetailId);

    var survey = await fetchSurveyById(surveyId);
    var treeTypeValue = await convertSpace(survey.rows.item(0).tree_type_value);
    var specialTree = await convertSpace(survey.rows.item(0).special_tree);
    setTreeTypeButton(treeTypeValue, specialTree, "surveyDataTreeType");
    var treeCountArray = await fetchTreeTypeCount(treeTypeValue, specialTree, surveyDetailId);
    setTreeCount(treeCountArray);

    param.length === 3 ? isHistoryFlag = true : isHistoryFlag = false;
    initializeForm(surveyId, surveyDetailId, isHistoryFlag, id);
    setSurveyData()
    await controlEditScreen();
});

/**
 * 伐採木データ登録画面の初期化
 */
async function initializeForm(surveyId, surveyDetailId, isHistoryFlag, id) {
    //地権者モーダル表示
    var surveyDetailItem = $('#area-info');
    var surveyDetailList = await fetchSurveyDetailById(surveyDetailId);
    var texts = '';
    surveyDetailList.rows.length == 0 ?
        (v => {
            texts += '<div class="row">';
            texts += '<p>データが存在しません。</p>'
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
        })() :
        (v => {
            texts = setSurveyDetailModal(texts, surveyDetailList.rows.item(0));
        })();
    surveyDetailItem.append(texts);
    //履歴2件ずつページングで表示
    var surveyHistoryItem = $('#history-list-contents');
    var surveyDetailList = await fetchSurveyDataBySurveyDetailId(surveyDetailId);
    var texts = "";
    surveyDetailList.rows.length == 0 ?
        (v => {
            texts += '<div class="row">';
            texts += '<p>データが存在しません。</p>'
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
        })() :
        (v => {
            for (var i = 0; i < surveyDetailList.rows.length; i++) {
                texts = setSurveyHistoryData(texts, surveyDetailList.rows.item(i), surveyId, surveyDetailId);
            }
        })();
    surveyHistoryItem.append(texts);
    if (isHistoryFlag) {
        //初期表示
        var surveyData = await fetchNewSurveyHistoryDataById(id);
        if (surveyData != undefined) {
            setSurveyData(surveyData);
        }
    } else {
        //履歴リンクから遷移した時
        var surveyData = await fetchNewSurveyData(surveyDetailId);
        if (surveyData != undefined) {
            setSurveyData(surveyData);
        }
    }

}

/**
 * 所在地データを画面に設定
 * @param 所在地データ
 */
function setSurveyDetailModal(texts, surveyDetail) {
    texts += '所在地No：' + convertSpace(surveyDetail.detail_number);
    texts += '<br>';
    texts += '線路名：' + convertSpace(surveyDetail.line_name)
    texts += '<br>';
    texts += '支持物：No' + convertSpace(surveyDetail.steal_tower_start);
    texts += '~';
    texts += 'No' + convertSpace(surveyDetail.steal_tower_end);
    texts += '<br>'
    texts += '所在地：' + convertSpace(surveyDetail.survey_address);
    texts += '<br>'
    texts += '地権者名：' + convertSpace(surveyDetail.area_owner_name);
    texts += '<br>'
    return texts;
}

/**
 * 調査データを画面に設定
 * @param 調査データ
 */
function setSurveyHistoryData(texts, surveyData, surveyId, surveyDetailId) {
    var needText = "";
    var countRow = 1;
    texts += '<tr style="border:1px solid #e3e3e3!important;">';
    texts += '<td>';
    texts += `<a class="ajax" href="javascript:getsurveyNextHistoryData();" val= "../html/survey_data_edit.html?${surveyId}&${surveyData.id}&${surveyDetailId}>`;
    texts += '<li id="history-data" class="collection-item" style="display:flex;">';
    texts += `<span style="margin-right: 0.5rem;">${surveyData.color}-${surveyData.word}-${surveyData.number}</span>`
    surveyData.survey_data_tree_type !== null ?
        texts += `<span style="margin-right: 0.5rem;">${surveyData.survey_data_tree_type}</span>` :
        texts += `<span style="margin-right: 0.5rem;">樹種データなし</span>`

    texts += `<span style="margin-right: 0.5rem;">${surveyData.tree_measured_value}cm</span>`

    surveyData.need_cut_middle == true ?
        (v => {
            needText += `中`;
            needText += `,`;
        })() : "";
    surveyData.need_cut_branch == true ?
        (v => {
            needText += `枝`;
            needText += `,`;
        })() : "";

    surveyData.need_cut_divide == true ?
        (v => {
            needText += `玉`;
            needText += `,`;
        })() : "";

    surveyData.need_collect == true ?
        (v => {
            needText += `集`;
            needText += `,`;
        })() : "";

    surveyData.is_danger_tree == true ?
        (v => {
            needText += `危`;
            needText += `,`;
        })() : "";

    texts += `<span style="margin-right: 0.5rem;">${needText}</span>`;
    texts += '</li>';
    texts += '</a>';
    if (countRow === 1) {
        texts += '<il style="color:#122344!important;display:flex;padding:0.1em;margin-bottom:1em;">';
        texts += '<a id="before-history-data" class="waves-effect waves-light" style="display:flex;">';
        texts += '<i style="color:#122344!important;" class="material-icons fa-5x">expand_less</i>';
        texts += '</a>';
        texts += '</il>'
    } else {
        texts += '<il style="color:#122344!important;display:flex;padding:0.1em;margin-bottom:1em;">';
        texts += '<a id="before-history-data" class="waves-effect waves-light">';
        texts += '<i style="color:#122344!important;" class="material-icons fa-5x">>expand_more</i>';
        texts += '</a>';
        texts += '</il>'
    }
    texts += '</td>';
    texts += '</tr>';
    return texts;
}

/**
 * 伐採木データ設定
 * @param 伐採木データ
 */
function setSurveyData(surveyData) {
    //id
    $('#survey-data-id').val(surveyData.id);
    // 担当者名
    $('#name-modal').val(surveyData.name);
    $('#name').text(surveyData.name);
    // 備考
    $('#note-modal').val(surveyData.note);
    $('#note').text(surveyData.note);
    // No
    $('#color').val(surveyData.color);
    $('#word').val(surveyData.word);
    $('#number').val(surveyData.number + 1);
    $('#branch-number').val(surveyData.branch_number);
    setNo();
    // 樹種
    $('#' + surveyData.survey_data_tree_type).removeClass("not-select");
    $('#surveyDataTreeType').text(surveyData.survey_data_tree_type);
    $('#surveyDataTreeType').val(surveyData.survey_data_tree_type);
    setTreeType(surveyData)
    // 直径
    $('#survey-data-mesured-value').val(surveyData.tree_measured_value);
    $('#survey-data-mesured-value').text(surveyData.tree_measured_value);
    // 伐採ロープ
    if (surveyData.need_rope == 'true') {
        $('#survey-data-need-rope').removeClass("hidden");
        $('input[name="survey-data-need-rope"]').val(true);
    } else {
        $('#survey-data-need-rope').addClass("hidden");
        $('input[name="survey-data-need-rope"]').val(false);
    }
    // 伐採ワイヤー
    if (surveyData.need_wire == 'true') {
        $('#survey-data-need-wire').removeClass("hidden");
        $('input[name="survey-data-need-wire"]').val(true);
    } else {
        $('#survey-data-need-wire').addClass("hidden");
        $('input[name="survey-data-need-wire"]').val(false);
    }
    // 中断切ロープ有
    if (surveyData.need_cut_middle == 'true') {
        $('#survey-data-need-cut-middle').removeClass("hidden");
        $('input[name="survey-data-need-cut-middle"]').val(true);
    } else {
        $('#survey-data-need-cut-middle').addClass("hidden");
        $('input[name="survey-data-need-cut-middle"]').val(false);
    }
    // 中断切ロープ無
    if (surveyData.not_need_cut_middle == 'true') {
        $('#survey-data-not-need-cut-middle').removeClass("hidden");
        $('input[name="survey-data-not-need-cut-middle"]').val(true);
    } else {
        $('#survey-data-not-need-cut-middle').addClass("hidden");
        $('input[name="survey-data-not-need-cut-middle"]').val(false);
    }
    // 危険木
    if (surveyData.is_danger_tree == 'true') {
        $('#survey-data-is-denger-tree').removeClass("hidden");
        $('input[name="survey-data-is-denger-tree"]').val(true);
    } else {
        $('#survey-data-is-denger-tree').addClass("hidden");
        $('input[name="survey-data-is-denger-tree"]').val(false);
    }
    // 枝払い
    if (surveyData.need_cut_branch == 'true') {
        $('#survey-data-need-cut-branch').removeClass("hidden");
        $('input[name="survey-data-need-cut-branch"]').val(true);
    } else {
        $('#survey-data-need-cut-branch').addClass("hidden");
        $('input[name="survey-data-need-cut-branch"]').val(false);
    }
    // 玉切り
    if (surveyData.need_cut_divide == 'true') {
        $('#survey-data-need-cut-divide').removeClass("hidden");
        $('input[name="survey-data-need-cut-divide"]').val(true);
    } else {
        $('#survey-data-need-cut-divide').addClass("hidden");
        $('input[name="survey-data-need-cut-divide"]').val(false);
    }
    // 集積
    if (surveyData.need_collect == 'true') {
        $('#survey-data-need-collect').removeClass("hidden");
        $('input[name="survey-data-need-collect"]').val(true);
    } else {
        $('#survey-data-need-collect').addClass("checked", false);
    }
}

/**
 * Noの表示設定
 */
function setNo() {
    var color = $('#color').val();
    var word = $('#word').val();
    var number = $('#number').val();
    var branchNumber = $('#branch-number').val();
    var no = "";
    if (color != "") {
        no += color + "-";
    }
    if (word != "") {
        no += word + "-";
    }
    if (number != "") {
        no += number + "-";
    }
    no += branchNumber;
    $('#survey-data-no').text(no);
}

/**
 * 樹種の表示設定
 */
function setTreeType(surveyData) {
    if (surveyData.survey_data_tree_type !== null) {
        $('#surveyDataTreeType').text(surveyData.survey_data_tree_type);
        $('#surveyDataTreeType').val(surveyData.survey_data_tree_type);
        //選択ボタンを押下状態にする
        inputTreeType("survey-area-tree-type", surveyData.survey_data_tree_type)
    }
}


/**
 * 備考の表示設定
 */
function setNote() {
    $('#note').text($('#note-modal').val());
}

/**
 * 担当者名の表示設定
 */
function setName() {
    $('#name').text($('#name-modal').val());
}

/**
 * 伐採時の備考（伐採ロープ有り）設定
 */
$(".survey-data-need-rope").on('touchstart', function () {
    if ($("#survey-data-need-rope").hasClass('hidden')) {
        $("#survey-data-need-rope").removeClass('hidden');
        $('input[name="survey-data-need-rope"]').val(true);
    } else {
        $("#survey-data-need-rope").addClass('hidden');
        $('input[name="survey-data-need-rope"]').val(false);
    }
});

/**
 * 伐採時の備考（伐採ワイヤー有り）設定
 */
$(".survey-data-need-wire").on('touchstart', function () {
    if ($("#survey-data-need-wire").hasClass('hidden')) {
        $("#survey-data-need-wire").removeClass('hidden');
        $('input[name="survey-data-need-wire"]').val(true);
    } else {
        $("#survey-data-need-wire").addClass('hidden');
        $('input[name="survey-data-need-wire"]').val(false);
    }
});

/**
 * 伐採時の備考（中断切りロープ有り）設定
 */
$(".survey-data-need-cut-middle").on('touchstart', function () {
    if ($("#survey-data-need-cut-middle").hasClass('hidden')) {
        $("#survey-data-need-cut-middle").removeClass('hidden');
        $('input[name="survey-data-need-cut-middle"]').val(true);
    } else {
        $("#survey-data-need-cut-middle").addClass('hidden');
        $('input[name="survey-data-need-cut-middle"]').val(false);
    }
});

/**
 * 伐採時の備考（中断切りロープ無し）設定
 */
$(".survey-data-not-need-cut-middle").on('touchstart', function () {
    if ($("#survey-data-not-need-cut-middle").hasClass('hidden')) {
        $("#survey-data-not-need-cut-middle").removeClass('hidden');
        $('input[name="survey-data-not-need-cut-middle"]').val(true);
    } else {
        $("#survey-data-not-need-cut-middle").addClass('hidden');
        $('input[name="survey-data-not-need-cut-middle"]').val(false);
    }
});

/**
 * 伐採時の備考（危険木）設定
 */
$(".survey-data-is-denger-tree").on('touchstart', function () {
    if ($("#survey-data-is-denger-tree").hasClass('hidden')) {
        $("#survey-data-is-denger-tree").removeClass('hidden');
        $('input[name="survey-data-is-denger-tree"]').val(true);
    } else {
        $("#survey-data-is-denger-tree").addClass('hidden');
        $('input[name="survey-data-is-denger-tree"]').val(false);
    }
});

/**
 * 伐採時の備考（枝切り）設定
 */
$(".survey-data-need-cut-branch").on('touchstart', function () {
    if ($("#survey-data-need-cut-branch").hasClass('hidden')) {
        $("#survey-data-need-cut-branch").removeClass('hidden');
        $('input[name="survey-data-need-cut-branch"]').val(true);
    } else {
        $("#survey-data-need-cut-branch").addClass('hidden');
        $('input[name="survey-data-need-cut-branch"]').val(false);
    }
});

/**
 * 伐採時の備考（玉切り）設定
 */
$(".survey-data-need-cut-divide").on('touchstart', function () {
    if ($("#survey-data-need-cut-divide").hasClass('hidden')) {
        $("#survey-data-need-cut-divide").removeClass('hidden');
        $('input[name="survey-data-need-cut-divide"]').val(true);
    } else {
        $("#survey-data-need-cut-divide").addClass('hidden');
        $('input[name="survey-data-need-cut-divide"]').val(false);
    }
});

/**
 * 伐採時の備考（集積）設定
 */
$(".survey-data-need-collect").on('touchstart', function () {
    if ($("#survey-data-need-collect").hasClass('hidden')) {
        $("#survey-data-need-collect").removeClass('hidden');
        $('input[name="survey-data-need-collect"]').val(true);
    } else {
        $("#survey-data-need-collect").addClass('hidden');
        $('input[name="survey-data-need-collect"]').val(false);
    }
});

/**
 * 直径変更
 */
$("[id^=tree-measured-value-]").on('touchstart', function () {
    var number = $(this).attr("id").replace('tree-measured-value-', "");
    number == 'none' ?
        (v => {
            $('#survey-data-mesured-value').text('');
            $('#survey-data-mesured-value').val('');
        })() :
        (v => {
            applyMesuredValueOfNumericKeypad(number);
        })();
});

/**
 * 伐採木データ作成および更新
 */
async function createEditSurveyData() {
    validate() == false ?
        (v => {
            $("#error").get(0).play();
            return;
        })() : "";
    createSurveyData();
    let count = await editSurveyTrimmingTreeCount();
    soundMessage(count);
    M.toast({ html: '登録しました！', displayLength: 2000 });

    initializeForm();
}

/**
 * 登録本数により音声を流す
 * @param {*} count 登録本数
 */
function soundMessage(count) {
    if (count == 100) {
        $("#submit-100").get(0).play();
    } else if (count == 300) {
        $("#submit-300").get(0).play();
    } else if (count == 500) {
        $("#submit-500").get(0).play();
    } else if (count == 1000) {
        $("#submit-1000").get(0).play();
    } else if (count == 10000) {
        $("#submit-10000").get(0).play();
    } else {
        $("#submit").get(0).play();
    }
}

/**
 * 入力チェック
 */
function validate() {
    var result = true;
    // Noチェック
    if ($('#survey-data-no').text() === '' || $('#number').val() === '') {
        alert("申し訳ございません。\r\n連番の入力は必須です。連番を入力してください。");
        result = false;
    }
    // Noの数字チェック
    if (result) {
        if (!$('#number').val().match(/^\d+$/)) {
            alert("申し訳ございません。\r\n連番は半角数字のみ有効です。半角数字のみ入力してください。");
            result = false;
        }
    }
    // 樹種チェック
    if (result) {
        if ($('#surveyDataTreeType').val() === '') {
            alert("申し訳ございません。\r\n樹種の入力は必須です。樹種を入力してください。");
            result = false;
        }
    }
    // 直径チェック
    if (result) {
        if ($('#survey-data-mesured-value').val === '') {
            alert("申し訳ございません。\r\n直径の入力は必須です。直径を入力してください。");
            result = false;
        }
    }
    if (result) {
        if ($('#survey-data-mesured-value').val === 0) {
            alert("申し訳ございません。\r\n直径は0以上で入力してください。");
            result = false;
        }
    }
    // 直径の桁数チェック
    if (result) {
        if (Number($('#survey-data-mesured-value').val) >= 1000) {
            alert("申し訳ございません。\r\n直径は1000以上は登録できません。1000未満で入力してください。");
            result = false;
        }
    }
    return result;
}

/**
 * 伐採木データ作成
 */
async function createSurveyData() {
    var param = [
        surveyDetailId,
        generateIdentifyCode(uuid),
        surveyCompanyId,
        $('#name-modal').val(),
        $('#color').val(),
        $('#word').val(),
        $('#number').val(),
        $('#branch-number').val(),
        $('#surveyDataTreeType').val(),
        $('#survey-data-mesured-value').val(),
        $('input[name="need-rope"]').val(),
        $('input[name="need-wire"]').val(),
        $('input[name="need-cut-middle"]').val(),
        $('input[name="need-cut-middle"]').val() ? false : true,
        $('input[name="is-denger-tree"]').val(),
        $('input[name="need-cut-branch"]').val(),
        $('#note-modal').val(),
        false,
        'off',
        fetchUserId(),
        fetchUserId()
    ];

    insertSurveyData(param);
}

/**
 * 伐採木データ本数更新
 */
async function editSurveyTrimmingTreeCount() {
    var surveyDataCount = await fetchNotDeleteSurveyDataCount(surveyDetailId);
    updateSurveyDataTrimmingTreeCount(surveyDataCount, surveyDetailId);
    return surveyDataCount;
}

$(".enter").on('touchstart', function () {
    $("#input").get(0).play();
});

async function fetchTreeTypeCount(treeTypes, specialTree, surveyDetailId) {
    if (treeTypes) {
        var treeTypesCount = {};
        var arrayTreeTypes = treeTypes.split(',');
        for (let i in arrayTreeTypes) {
            var count = await fetchTypeMeasuredValueByTreeType(surveyDetailId, arrayTreeTypes[i]);
            treeTypesCount[arrayTreeTypes[i]] = count.rows.item(0).count;
        }
    }
    if (specialTree) {
        var arraySpecialTreeTypes = specialTree.split(',');
        for (let i in arraySpecialTreeTypes) {
            var count = await fetchTypeMeasuredValueByTreeType(surveyDetailId, arraySpecialTreeTypes[i]);
            treeTypesCount[arraySpecialTreeTypes[i]] = count.rows.item(0).count;
        }
    }
    return treeTypesCount;
}

/**
 * 伐採方法ボタンをタップした際に、not-selectedクラスを削除する
 * @param 伐採方法ボタンID
 */
function setSurveyMethod(surveyMethod) {
    if ($('#' + surveyMethod).hasClass("not-select")) {
        $('#' + surveyMethod).removeClass("not-select");
        $(`input[name="${surveyMethod}]`).val(true);
    } else {
        $('#' + surveyMethod).addClass("not-select");
        $(`input[name="${surveyMethod}]`).val(false);
    }
    // $('#' + surveyMethod).hasClass("not-select") ? $('#' + surveyMethod).removeClass("not-select") : $('#' + surveyMethod).addClass("not-select");
    // $(`input[name="${surveyMethod}]`).val(true);
}

/**
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テーブル形式の場合）
 * @param 直径ID
 * @param 直径
 */
function applyMesuredValueOfTableKeypad(mesuredValueId, value) {
    $('.circle').removeClass("checked");
    $(mesuredValueId).addClass("checked");
    $('#survey-data-mesured-value').text(value);
    $('#survey-data-mesured-value').val(value);
}

/**
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テンキー形式の場合）
 * @param {*} value 設定する直径
 */
function applyMesuredValueOfNumericKeypad(value) {
    if ($('#survey-data-mesured-value').val == '0') {
        $('#survey-data-mesured-value').val = '';
    }
    value = $('#survey-data-mesured-value').val() + value
    $('#survey-data-mesured-value').text(value);
    $('#survey-data-mesured-value').val(value);
}

/**
 * 直径入力欄をテンキーかテーブル形式か変換する
 */
function changeKeyPad() {
    if ($('#key-pad-type').val() === 'table-keypad') {
        $('#table-keypad').hide();
        $('#done').hide();
        $('#numeric-keypad').show();
        $('#key-pad-type').val('numeric-keypad');
    } else {
        $('#numeric-keypad').hide();
        $('#table-keypad').show();
        $('#done').show();
        $('#key-pad-type').val('table-keypad');
    }
}

// /**
//  * 履歴データを今より1個先（新しいもの）を表示する
//  */
// $("#before-history-data").on('touchstart', function () {
//     await fetchSurveyNewDataBySurveyId(id);
// })

/**
  * 履歴データを今より1個後（古いもの）を表示する
  */
$("#before-history-data").on('touchstart', function () {
    var surveyHistoryItem = $('#history-list-contents');
    var id = $('#survey-data-id').val();
    // var surveyNextHistoryDataList = await fetchSurveyOldDataBySurveyId(id);
    // var texts = "";
    // surveyNextHistoryDataList.rows.length == 0 ?
    //     (v => {
    //         texts += '<div class="row">';
    //         texts += '<p>データが存在しません。</p>'
    //         texts += '</div>';
    //         texts += '</div>';
    //         texts += '</div>';
    //         texts += '</div>';
    //     })() :
    //     (v => {
    //         for (var i = 0; i < surveyNextHistoryDataList.rows.length; i++) {
    //             texts = setSurveyHistoryData(texts, surveyNextHistoryDataList.rows.item(i), surveyId, surveyDetailId);
    //         }
    //     })();
    // surveyHistoryItem.append(texts);
    // alert(id);
});

/**
 * 履歴ページをモーダルで表示する
 */
$(function () {
    $(".ajax").colorbox({
        maxWidth: "80%",
        maxHeight: "80%",
        opacity: 0.7
    });
});
