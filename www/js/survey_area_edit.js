// 調査ID
var surveyId = null;
// 所在地ID
var surveyDetailId = null;
// アップデートフラグ
var isUpdate = false;
// 対象ID
var targetId = null;
// 端末番号
var uuid = "";

$(document).ready(function () {
    $('select').formSelect();
});

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
    createContactSidenavLink(6, surveyId, surveyDetailId);

    // 初期表示
    initView();

    await controlEditScreen();
});

/**
 * 初期表示
 */
async function initView() {
    // 樹種ボタン生成
    $('#tree-type-list').empty();
    var survey = await fetchSurveyById(surveyId);
    var treeTypeValue = convertSpace(survey.rows.item(0).tree_type_value);
    var specialTree = convertSpace(survey.rows.item(0).special_tree);
    setTreeTypeButton(treeTypeValue, specialTree, "survey-area-tree-type");

    // 用材本数取得
    var surveyDataCount = await fetchNotDeleteSurveyDataCount(surveyDetailId);
    $('#trimming-tree-count').val(surveyDataCount);
    // 小径木データ取得
    var surveyAreaList = await fetchSurveyAreaBySurveyDetailId(surveyDetailId);
    if (surveyAreaList.rows.length > 0) {
        // 小径木データ設定
        isUpdate = true;
        targetId = surveyAreaList.rows.item(0).id;
        setTargetSurveyArea(surveyAreaList.rows.item(0));
        //削除ボタンの処理がキックされる削除モーダルへのリンクを無効化する
        $('#delete-btn').css('pointer-events', 'auto');
    } else {
        // 小径木データ初期表示
        setInitTargetSurveyArea();
        //削除ボタンの処理がキックされる削除モーダルへのリンクを無効化する
        $('#delete-btn').css('pointer-events', 'none');
    }
}

/**
 * 小径木データの初期表示
 */
function setInitTargetSurveyArea() {
    // 樹種
    $('#survey-area-tree-type').val("");
    // 伐採面積
    $('#trimming-area-value').val("");
    // 用材面積
    $('#trimming-tree-area-value').val("");
    // 補償面積
    $('#target-area-value').val("");
    // 補償面積（10）
    $('#target-area-value-ten').val("");
    // 集積あり/4cm未満
    $('#need-collect-is-not-four-measured').prop("checked", true);
}

/**
 * 取得した小径木データ表示
 * @param 小径木データ
 * @param 樹種タイプ
 * @param 特殊樹
 */
function setTargetSurveyArea(surveyArea) {
    // 樹種
    $('#survey-area-tree-type').val(surveyArea.tree_type);
    // 伐採面積
    $('#trimming-area-value').val(surveyArea.trimming_area_value);
    // 用材面積
    $('#trimming-tree-area-value').val(surveyArea.trimming_tree_area_value);
    // 補償面積
    $('#target-area-value').val(surveyArea.target_area_value);
    // 補償面積（10）
    $('#target-area-value-ten').val(surveyArea.target_area_value_ten);
    // 集積あり/4cm未満
    if (surveyArea.need_collect == 'true' && surveyArea.is_four_measured == 'true') {
        $('input[name=len]:eq(0)').prop("checked", true);
        // 集積あり/4cm以上
    } else if (surveyArea.need_collect == 'true' && surveyArea.is_four_measured == 'false') {
        $('input[name=len]:eq(1)').prop("checked", true);
        // 集積なし/4cm未満
    } else if (surveyArea.need_collect == 'false' && surveyArea.is_four_measured == 'true') {
        $('input[name=len]:eq(2)').prop("checked", true);
        // 集積なし/4cm以上
    } else if (surveyArea.need_collect == 'false' && surveyArea.is_four_measured == 'false') {
        $('input[name=len]:eq(3)').prop("checked", true);
    }
}

/**
 * 小径木データ登録および更新
 */
async function createEditSurveyArea() {
    //2件以上更新される不具合の対応
    var param = [];
    var result = null;
    // 入力チェック
    if (validate()) {

        let [needCollect, isFourMeasured] = applyLen();
        if (isUpdate) {
            // 更新項目
            param = [
                $('#survey-area-tree-type').val(),
                $('#trimming-area-value').val(),
                $('#trimming-tree-area-value').val(),
                $('#trimming-tree-count').val(),
                $('#target-area-value').val(),
                $('#target-area-value-ten').val(),
                needCollect,
                isFourMeasured,
                $('#tree-measured-value').val(),
                fetchUserId(),
                targetId
            ];
            result = await updateSurveyArea(param);
        } else {
            // 登録項目
            param = [
                surveyDetailId,
                generateIdentifyCode(uuid),
                surveyCompanyId,
                $('#survey-area-tree-type').val(),
                $('#trimming-area-value').val(),
                $('#trimming-tree-area-value').val(),
                $('#trimming-tree-count').val(),
                $('#target-area-value').val(),
                $('#target-area-value-ten').val(),
                needCollect,
                isFourMeasured,
                $('#tree-measured-value').val(),
                false,
                'off',
                fetchUserId(),
            ];
            result = await insertSurveyArea(param);
        }
        if (result !== null) {
            M.toast({ html: '登録しました！', displayLength: 2000 });
            initView();
        }

    }

}

/**
 * 集積4cm未満の場合、胸高直径を3で設定する
 * 集積4cm未満の場合、胸高直径を4で設定する
 * @param 設定する胸高直径
 */
function changeDefaultNeedCollect(treeMeasuredValue) {
    $('#tree-measured-value').val(treeMeasuredValue);
    $('#tree-measured-value').formSelect();
}

/**
 * 集積あり/なし、4cm未満/以上の設定
 */
function applyLen() {
    let needCollect = true;
    let isFourMeasured = true;
    if ($('#need-collect-is-four-measured').prop("checked")) {
        needCollect = true;
        isFourMeasured = true;
    } else if ($('#need-collect-is-not-four-measured').prop("checked")) {
        needCollect = true;
        isFourMeasured = false;
    } else if ($('#not-need-collect-is-four-measured').prop("checked")) {
        needCollect = false;
        isFourMeasured = true;
    } else if ($('#not-need-collect-is-not-four-measured').prop("checked")) {
        needCollect = false;
        isFourMeasured = false;
    }
    return [needCollect, isFourMeasured];
}

/**
 * 入力チェック
 */
function validate() {
    var result = true;
    // 樹種チェック
    if ($('#survey-area-tree-type').val() == '') {
        alert("申し訳ございません。\n樹種の入力は必須です。樹種を入力してください。");
        result = false;
    }
    // 伐採面積チェック
    if (result) {
        if ($('#trimming-area-value').val() == '') {
            alert("申し訳ございません。\n伐採面積(㎡)の入力は必須です。伐採面積(㎡)を入力してください。");
            result = false;
        }
    }
    // 伐採面積の半角数字と小数点チェック
    if (result) {
        if (!$('#trimming-area-value').val().match(/^[-]?([1-9]\d*|0)(\.\d+)?$/)) {
            alert("申し訳ございません。\n伐採面積(㎡)は半角数字と小数点のみ有効です。半角数字と小数点のみ入力してください。");
            result = false;
        }
    }
    // 用材面積チェック
    if (result) {
        if ($('#trimming-tree-area-value').val() == '') {
            alert("申し訳ございません。\n用材面積(㎡/本)の入力は必須です。用材面積(㎡/本)を入力してください。");
            result = false;
        }
    }
    // 用材面積の半角数字と小数点チェック
    if (result) {
        if (!$('#trimming-tree-area-value').val().match(/^[-]?([1-9]\d*|0)(\.\d+)?$/)) {
            alert("申し訳ございません。\n用材面積(㎡/本)は半角数字と小数点のみ有効です。半角数字と小数点のみ入力してください。");
            result = false;
        }
    }

    // 補償面積(㎡)チェック
    if (result) {
        if ($('#target-area-value').val() == '') {
            alert("申し訳ございません。\n補償面積(㎡)の入力は必須です。補償面積(㎡)を入力してください。");
            result = false;
        }
    }
    // 補償面積積(㎡)の半角数字と小数点チェック
    if (result) {
        if (!$('#target-area-value').val().match(/^[-]?([1-9]\d*|0)(\.\d+)?$/)) {
            alert("申し訳ございません。\n補償面積(㎡)は半角数字と小数点のみ有効です。半角数字と小数点のみ入力してください。");
            result = false;
        }
    }

    // 補償面積(10㎡)チェック
    if (result) {
        if ($('#target-area-value-ten').val() == '') {
            alert("申し訳ございません。\n補償面積(10㎡)の入力は必須です。補償面積(10㎡)を入力してください。");
            result = false;
        }
    }
    // 補償面積積(10㎡)の半角数字と小数点チェック
    if (result) {
        if (!$('#target-area-value-ten').val().match(/^[-]?([1-9]\d*|0)(\.\d+)?$/)) {
            alert("申し訳ございません。\n補償面積(10㎡)は半角数字と小数点のみ有効です。半角数字と小数点のみ入力してください。");
            result = false;
        }
    }

    return result;
}

/**
 * 小径木削除処理
 */
async function deleteSurveyArea() {
    // 小径木削除
    deleteSurveyAreaById(targetId);
    M.toast({ html: '削除しました！', displayLength: 2000 });
    // 再表示
    initView();
}

/**
 * 補償面積の自動計算
 * @param 更新対象form
 */
function calculation(inputdata, form) {
    if (validateCalculation(inputdata)) {
        return;
    }
    // 伐採面積
    var trimmingAreaValue = Number(form.trimmingAreaValue.value);
    // 用材本数
    var trimmingTreeCount = Number(form.trimmingTreeCount.value);
    // 用材面積
    var trimmingTreeAreaValue = Number(form.trimmingTreeAreaValue.value);

    // 補償面積(㎡) = 伐採面積(㎡) - (用材本数(本) × 用材面積(㎡/本))
    var targetAreaValue = trimmingAreaValue - (trimmingTreeCount * trimmingTreeAreaValue);
    var targetAreaValueTen = targetAreaValue / 10;

    form.targetAreaValue.value = targetAreaValue;
    form.targetAreaValueTen.value = targetAreaValueTen;
}

/**
 * 補償面積自動計算
 * @param {*} inputdata
 */
function validateCalculation(inputdata) {
    // 数値チェック
    if (isNaN(inputdata.value)) {
        $('#target_area_number').show();
        inputdata.style.background = 'pink';
        return true;
    } else {
        $('#target_area_number').hide();
        inputdata.style.background = 'white';
    }
    // 必須チェック
    if (inputdata.value === '') {
        $('#target_area_required').show();
        inputdata.style.background = 'pink';
        return true;
    } else {
        $('#target_area_required').hide();
        inputdata.style.background = 'white';
    }
    return false;
}