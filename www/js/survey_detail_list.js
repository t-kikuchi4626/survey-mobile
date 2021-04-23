// 調査ID
var surveyId = null;

document.addEventListener("deviceready", async function () {

    surveyId = location.search.substring(1);
    var survey = await fetchSurveyById(surveyId);
    setSurvey(survey.rows.item(0));

    var surveyDetailItem = $('#survey-detail-item');
    var surveyDetailList = await fetchSurveyDetailBySurveyId(surveyId);
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
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            texts = setSurveyDetail(texts, surveyDetailList.rows.item(i));
        }
    }
    surveyDetailItem.append(texts);

    // サイドナビゲーションリンク作成
    createContactSidenavLink(2, surveyId, "");
});

/**
 * 業務データを画面に設定
 * @param 業務データ
 */
function setSurvey(survey) {
    $('#business-period-from').text(convertSpace(survey.business_period_from));
    $('#business-period-to').text(convertSpace(survey.business_period_to));
    $('#center-id').text(convertSpace(survey.center_id));
    $('#survey-name').text(convertSpace(survey.survey_name));
    $('#survey-company-id').text(convertSpace(survey.survey_company_name));
    $('#note').text(convertSpace(survey.note));
    $('#modified-date').text(convertSpace(survey.modified_date));
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
    texts += '<input type="hidden" id="survey-detail-id" name="surveyDetailId" value="' + surveyDetail.id + '">';
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
    texts += '<label><input type="checkbox" id="status" onchange="saveSatus(' + surveyDetail.id + ', this.checked)" ' + setStatusChecked(surveyDetail.status) + '/><span>調査済</span></label>';
    texts += '<br>';
    texts += '</div>';
    texts += '<div class="col s12 m4">';
    texts += '<div style="margin-bottom: 2rem; margin:5px" class="mobile-btn-block">';
    texts += '<a href="../html/survey_data_register.html?' + surveyId + '&' + surveyDetail.id + '" class="btn normal-button mobile-btn">伐採木登録</a>';
    texts += '</div>';
    texts += '<div class="mobile-btn-block" style="margin:5px">';
    texts += '<a href="../html/survey_data_edit.html?' + surveyId + '&' + surveyDetail.id + '" class="btn normal-button mobile-btn">小径木登録</a>';
    texts += '</div>';
    texts += '</div>';
    texts += '</div>';
    texts += '</div>';
    texts += '</div>';
    texts += '</div>';
    return texts;
}


/**
 * 調査状況を更新
 * @param 所在地ID 
 * @param 調査状況
 */
function saveSatus(surveyDetailId, status) {
    updateSurveyDetailStatus(surveyDetailId, status);
}

/**
 * 調査状況のチェック状態を返す
 * @param 調査状況
 */
function setStatusChecked(status) {
    return status == 'true' ? 'checked' : ''
}
