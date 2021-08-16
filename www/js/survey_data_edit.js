// 調査業務ID
var surveyId = null;
// 所在地ID
var surveyDetailId = null;
// 直径
var treeMeasuredValue = "";
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

    var treeTypeValue = convertSpace(survey.rows.item(0).tree_type_value);
    var specialTree = convertSpace(survey.rows.item(0).special_tree);
    setTreeTypeButton(treeTypeValue, specialTree, "survey-data-tree-type-modal");
    
    initializeForm();
    await controlEditScreen();
});

/**
 * 伐採木データ登録画面の初期化
 */
async function initializeForm() {

    var surveyData = await fetchNewSurveyData(surveyDetailId);

    if (surveyData != undefined) {
        setSurveyData(surveyData);
    }

    var surveyDataCount = await fetchNotDeleteSurveyDataCount(surveyDetailId);
    $('#survey-data-count').text(surveyDataCount);

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
    $('#note-modal').val('');
    $('#note').text('');
    // No
    $('#color').val(surveyData.color);
    $('#word').val(surveyData.word);
    $('#number').val(surveyData.number + 1);
    setNo();
    // 樹種
    $('#survey-data-tree-type-modal').val(surveyData.survey_data_tree_type);
    $('#survey-data-tree-type').text(surveyData.survey_data_tree_type);
    // 直径
    treeMeasuredValue = "";
    $('#survey-data-mesured-value').text("");
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
    var no = "";
    if (color != "") {
        no += color + "-";
    }
    if (word != "") {
        no += word + "-";
    }
    no += number;
    $('#survey-data-no').text(no);
}

/**
 * 樹種の表示設定
 */
function setTreeType() {
    $('#survey-data-tree-type').text($('#survey-data-tree-type-modal').val());
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
    applyMesuredValue(1);
});

$("#tree-measured-value-2").on('touchstart', function () {
    applyMesuredValue(2);
});

$("#tree-measured-value-3").on('touchstart', function () {
    applyMesuredValue(3);
});

$("#tree-measured-value-4").on('touchstart', function () {
    applyMesuredValue(4);
});

$("#tree-measured-value-5").on('touchstart', function () {
    applyMesuredValue(5);
});

$("#tree-measured-value-6").on('touchstart', function () {
    applyMesuredValue(6);
});

$("#tree-measured-value-7").on('touchstart', function () {
    applyMesuredValue(7);
});

$("#tree-measured-value-8").on('touchstart', function () {
    applyMesuredValue(8);
});

$("#tree-measured-value-9").on('touchstart', function () {
    applyMesuredValue(9);
});

$("#tree-measured-value-0").on('touchstart', function () {
    applyMesuredValue(0);
});

$("#tree-measured-value-none").on('touchstart', function () {
    treeMeasuredValue = '';
    $('#survey-data-mesured-value').text(treeMeasuredValue);
});

/**
 * 直径の設定
 * @param {*} value 設定する直径
 */
function applyMesuredValue(value) {
  if (treeMeasuredValue == '0') {
    treeMeasuredValue = '';
  }
  treeMeasuredValue += value;
  $('#survey-data-mesured-value').text(treeMeasuredValue);
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
        if ($('#survey-data-tree-type-modal').val() == '') {
            alert("申し訳ございません。\r\n樹種の入力は必須です。樹種を入力してください。");
            result = false;
        }
    }
    // 直径チェック
    if (result) {
        if (treeMeasuredValue == '') {
            alert("申し訳ございません。\r\n直径の入力は必須です。直径を入力してください。");
            result = false;
        }
    }
    if (result) {
        if (treeMeasuredValue == 0) {
            alert("申し訳ございません。\r\n直径は0以上で入力してください。");
            result = false;
        }
    }
    // 直径の桁数チェック
    if (result) {
        if (Number(treeMeasuredValue) >= 1000) {
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
        $('#survey-data-tree-type-modal').val(),
        treeMeasuredValue,
        $('input[name="survey-data-need-rope"]').val(),
        $('input[name="survey-data-need-wire"]').val(),
        $('input[name="survey-data-need-cut-middle"]').val(),
        $('input[name="survey-data-not-need-cut-middle"]').val(),
        $('input[name="survey-data-is-denger-tree"]').val(),
        $('input[name="survey-data-need-cut-branch"]').val(),
        $('input[name="survey-data-need-cut-divide"]').val(),
        $('input[name="survey-data-need-collect"]').val(),
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

function test() {
    $("#input").get(0).play();
}
