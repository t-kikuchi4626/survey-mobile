let surveyId = null;
const PERSON_B_VALUE = 'person-b';
const PERSON_A_VALUE = 'person-a';
const CORPORATE_B_VALUE = 'corporate-b';
const CORPORATE_A_VALUE = 'corporate-a';
const PERSON_B_LABEL = '個人/B単価';
const PERSON_A_LABEL = '個人/A単価';
const CORPORATE_B_LABEL = '法人/B単価';
const CORPORATE_A_LABEL = '法人/A単価';
priceTypeLabelList = [
    PERSON_B_LABEL,
    PERSON_A_LABEL,
    CORPORATE_B_LABEL,
    CORPORATE_A_LABEL
];
priceTypeValueList = [
    PERSON_B_VALUE,
    PERSON_A_VALUE,
    CORPORATE_B_VALUE,
    CORPORATE_A_VALUE
];
priceTypeList = [
    { label: PERSON_B_LABEL, value: PERSON_B_VALUE },
    { label: PERSON_A_LABEL, value: PERSON_A_VALUE },
    { label: CORPORATE_B_LABEL, value: CORPORATE_B_VALUE },
    { label: CORPORATE_A_LABEL, value: CORPORATE_A_VALUE }
];
valueToLabelMap = {
    [PERSON_B_VALUE]: PERSON_B_LABEL,
    [PERSON_A_VALUE]: PERSON_A_LABEL,
    [CORPORATE_B_VALUE]: CORPORATE_B_LABEL,
    [CORPORATE_A_VALUE]: CORPORATE_A_LABEL
};
labelToValueMap = {
    [PERSON_B_LABEL]: PERSON_B_VALUE,
    [PERSON_A_LABEL]: PERSON_A_VALUE,
    [CORPORATE_B_LABEL]: CORPORATE_B_VALUE,
    [CORPORATE_A_LABEL]: CORPORATE_A_VALUE
};

const AREA_CLASSIFICATION_CATEGORY_CODE = 6

/**
 * 所在地情報登録画面の初期表示を行う。
 */
document.addEventListener("deviceready", async function () {
    surveyId = location.search.substring(1)
    $('#pageBack').attr('href', './survey_detail_list.html?' + surveyId);

    let codeMasterList = await fetchCodeMasterByCategoryNumber(AREA_CLASSIFICATION_CATEGORY_CODE)
    for (let rowCount = 0; rowCount < codeMasterList.rows.length; rowCount++) {
        if (!codeMasterList.rows.item(rowCount).is_active) {
            continue;
        }
        $('#areaClassification').append('<option value="' + codeMasterList.rows.item(rowCount).value + '">' + codeMasterList.rows.item(rowCount).label + '</option>')
    }

    for (let priceType in labelToValueMap) {
        $('#priceType').append('<option value="' + labelToValueMap[priceType] + '">' + priceType + '</option>')
    }
});

/**
 * 所在地情報を登録
 */
async function createSurveyDetail() {
    let errorMessages = validateSurveyDetail()
    if (errorMessages.length > 0) {
        alert(errorMessages.join('\n'))
        return
    }

    surveyId = location.search.substring(1);
    let surveyDetailLength = await fetchSurveyDetailLength()
    let surveyDetailList = await fetchSurveyDetailBySurveyId(surveyId);
    let detailNumberList = []
    for (let rowCount = 0; rowCount < surveyDetailList.rows.length; rowCount++) {
        detailNumberList.push(surveyDetailList.rows.item(rowCount).detail_number)
    }
    let maxVal = Math.max(...detailNumberList);
    let detailNumber = isFinite(maxVal) ? maxVal + 1 : 1;
    let param = [
        location.search.substring(1),
        $('#surveyAddress').val(),
        $('#lineName').val(),
        $('#stealTowerStart').val(),
        $('#stealTowerEnd').val(),
        $('#areaOwnerName').val(),
        $('#areaOwnerAddress').val(),
        $('#areaOwnerTel').val(),
        $('#surveyWitnessName').val(),
        $('#surveyWitnessAddress').val(),
        $('#surveyWitnessTel').val(),
        $('#areaClassification').val(),
        fetchUserId(),
        fetchUserId(),
        detailNumber,
        $('#priceType').val().split("-")[0],
        $('#priceType').val().split("-")[1],
        true,
        true,
        surveyDetailList.rows.length === undefined ? 1 : surveyDetailList.rows.length + 1,
        generateIdentifyCode()
    ];
    let result = insertSurveyDetailByMobile(param);

    if (result !== null) {
        M.toast({ html: '登録しました！', displayLength: 2000 });
        initView();
    }
}

/**
 * 所在地情報登録時の入力チェック
 */
function validateSurveyDetail() {
    let errors = [];
    if (!isEmpty($('#priceType').val()) && !priceTypeValueList.includes($('#priceType').val())) {
        errors.push(`単価種別は（${priceTypeLabelList.join('、')}）を指定してください。`);
    }

    if (!isEmpty($('#lineName').val()) && String($('#lineName').val()).length > 30) {
        errors.push("線路名は30文字以内で入力してください。");
    }

    if (!isEmpty($('#stealTowerStart').val()) && String($('#stealTowerStart').val()).length > 10) {
        errors.push("径間（開始）は10文字以内で入力してください。");
    }

    if (!isEmpty($('#stealTowerEnd').val()) && String($('#stealTowerEnd').val()).length > 10) {
        errors.push("径間（終了）は10文字以内で入力してください。");
    }

    if (isEmpty($('#surveyAddress').val())) {
        errors.push("所在地番は必須です。");
    }
    if (!isEmpty($('#surveyAddress').val()) && String($('#surveyAddress').val()).length > 200) {
        errors.push("所在地番は200文字以内で入力してください。");
    }

    if (!isEmpty($('#areaOwnerName').val()) && String($('#areaOwnerName').val()).length > 800) {
        errors.push("所有者氏名は800文字以内で入力してください。");
    }

    if (!isEmpty($('#areaOwnerAddress').val()) && String($('#areaOwnerAddress').val()).length > 200) {
        errors.push("所有者住所は200文字以内で入力してください。");
    }

    if (!isEmpty($('#areaOwnerTel').val()) && String($('#areaOwnerTel').val()).length > 20) {
        errors.push("所有者電話番号は20文字以内で入力してください。");
    }

    if (!isEmpty($('#surveyWitnessName').val()) && String($('#surveyWitnessName').val()).length > 800) {
        errors.push("調査立会人氏名は800文字以内で入力してください。");
    }

    if (!isEmpty($('#surveyWitnessAddress').val()) && String($('#surveyWitnessAddress').val()).length > 200) {
        errors.push("調査立会人氏名は200文字以内で入力してください。");
    }

    if (!isEmpty($('#surveyWitnessTel').val()) && String($('#surveyWitnessTel').val()).length > 20) {
        errors.push("調査立会人氏名は20文字以内で入力してください。");
    }

    return errors
}

/**
* 指定した値が空文字かどうかチェックします。
* @param  {object}  val チェックする値。
* @return {boolean} undefined, null, "" なら true
*/
function isEmpty(val) {
    return val === undefined || val === null || val === "";
}
