

// 調査業務ID
var surveyId = null;
// 所在地ID
var surveyDetailId = null;
// 直径
//var treeMeasuredValue = "";
// uuid
var uuid = "";

document.addEventListener("deviceready", async function () {
    var param = location.search.substring(1).split("&");
    surveyId = param[0];
    surveyDetailId = param[1];
    uuid = device.uuid;

    // 所在地一覧遷移タグ作成
    var surveyDetailListLink = $('#survey-detail-list-link');
    var detailListLinkText = '<a href="../html/survey_detail_list.html?' + surveyId + '"><i class="material-icons">arrow_back_ios</i></a>';
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
    initializeForm(surveyId, surveyDetailId);
    await controlEditScreen();
});

/**
 * 伐採木データ登録画面の初期化
 */
async function initializeForm(surveyId, surveyDetailId) {
    //地権者モーダル表示
    var surveyDetailItem = $('#area-ower-info');
    var surveyDetailList = await fetchSurveyDetailById(surveyDetailId);
    var texts = '';
    if (surveyDetailList.rows.length == 0) {
        texts += '<div class="col s12 m7">';
        texts += '<div class="card horizontal">';
        texts += '<div class="card-stacked">';
        texts += '<div class="card-content">';
        texts += '<p>データが存在しません。</p>'
        texts += '</div>';
        texts += '</div>';
        texts += '</div>';
        texts += '</div>';
    } else {
        texts = setSurveyDetail(texts, surveyDetailList.rows.item(0));
    }
    surveyDetailItem.append(texts);

    //履歴2件ずつページングで表示
    var surveyDetailItem = $('#history-list');
    var surveyDetailList = await fetchSurveyDataBySurveyDetailId(surveyDetailId);
    var texts = '';
    alert(surveyDetailList.rows.length)
    if (surveyDetailList.rows.length == 0) {
        texts += '<div class="col s12 m7">';
        texts += '<div class="card horizontal">';
        texts += '<div class="card-stacked">';
        texts += '<div class="card-content">';
        texts += '<p>データが存在しません。</p>'
        texts += '</div>';
        texts += '</div>';
        texts += '</div>';
        texts += '</div>';
    } else {
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            texts = setSurveyHistoryData(texts, surveyDetailList.rows.item(i));
        }
    }
    alert(texts);
    surveyDetailItem.append(texts);


    //初期表示
    var surveyData = await fetchNewSurveyData(surveyDetailId);

    if (surveyData != undefined) {
        setSurveyData(surveyData);
    }

    var surveyDataCount = await fetchNotDeleteSurveyDataCount(surveyDetailId);
    $('#survey-data-count').text(surveyDataCount);

}

/**
 * 調査データを画面に設定
 * @param 調査データ
 */
function setSurveyHistoryData(texts, surveyData) {
    var needText = "";
    texts += '<li class="collection-item">';
    texts += '<div id="history-list" class="history-list">';
    texts += `<span style="margin-right: 0.5rem;">${surveyData.color}-${surveyData.word}-${surveyData.number}</span>`
    if (surveyData.tree_type !== undefined) {
        texts += `<span style="margin-right: 0.5rem;">${surveyData.tree_type}</span>`
    } else {
        texts += `<span style="margin-right: 0.5rem;">樹種データなし</span>`
    }

    texts += `<span style="margin-right: 0.5rem;">${surveyData.tree_measured_value}cm</span>`
    if (surveyData.need_cut_middle == true) {
        needText += `中`;
        needText += `,`;
    }
    if (surveyData.need_cut_branch == true) {
        needText += `枝`;
        needText += `,`;
    }
    if (surveyData.need_cut_divide == true) {
        needText += `玉`;
        needText += `,`;
    }
    if (surveyData.need_collect == true) {
        needText += `集`;
        needText += `,`;
    }
    if (surveyData.is_danger_tree == true) {
        needText += `危`;
        needText += `,`;
    }
    texts += '<span style="margin-right: 0.5rem;">' + needText + '</span>'
    return texts;
}

/**
 * 所在地データを画面に設定
 * @param 所在地データ
 */
function setSurveyDetail(texts, surveyDetail) {
    texts += '<div class="row">';
    texts += '<div class="card horizontal">';
    texts += '<div class="card-stacked">';
    texts += '<div class="card-content">';
    texts += '<div class="col s12 m8">';
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
 * 伐採木データ設定
 * @param 伐採木データ
 */
function setSurveyData(surveyData) {
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
    $('#survey-data-tree-type').text(surveyData.survey_data_tree_type);
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
    } s
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
$("#tree-measured-value-1").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(1);
});

$("#tree-measured-value-2").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(2);
});

$("#tree-measured-value-3").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(3);
});

$("#tree-measured-value-4").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(4);
});

$("#tree-measured-value-5").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(5);
});

$("#tree-measured-value-6").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(6);
});

$("#tree-measured-value-7").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(7);
});

$("#tree-measured-value-8").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(8);
});

$("#tree-measured-value-9").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(9);
});

$("#tree-measured-value-0").on('touchstart', function () {
    applyMesuredValueOfNumericKeypad(0);
});

$("#tree-measured-value-none").on('touchstart', function () {
    $('#survey-data-mesured-value').text('');
    $('#survey-data-mesured-value').val('');
});

/**
 * 樹種テキストボックスの更新処理
 * @param {*} 更新内容
 * @param {*} 更新カラム
 * @param {*} 必須チェック有無
 * @param {*} 数値チェック有無
 */
function updateInputTreeTextArea(inputdata, column, required, number) {
    if (required && validateRequired(inputdata, column)) {
        return;
    }
    if (number && validateNumber(inputdata, column)) {
        return;
    }
    $('#survey-data-tree-type').val(inputdata);
}


/**
 * 伐採木データ作成および更新
 */
async function createEditSurveyData() {

    if (validate() == false) {
        $("#error").get(0).play();
        return;
    }

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
    if ($('#survey-data-no').text() == '' || $('#number').val() == '') {
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
        if ($('#survey-data-tree-type').val() == '') {
            alert("申し訳ございません。\r\n樹種の入力は必須です。樹種を入力してください。");
            result = false;
        }
    }
    // 直径チェック
    if (result) {
        if ($('#survey-data-mesured-value').val == '') {
            alert("申し訳ございません。\r\n直径の入力は必須です。直径を入力してください。");
            result = false;
        }
    }
    if (result) {
        if ($('#survey-data-mesured-value').val == 0) {
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
    alert('#survey-data-tree-type').val();
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
        $('#survey-data-tree-type').val(),
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
        $('#numeric-keypad').show();
        $('#key-pad-type').val('numeric-keypad');
    } else {
        $('#numeric-keypad').hide();
        $('#table-keypad').show();
        $('#key-pad-type').val('table-keypad');
    }
}