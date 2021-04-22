var surveyCompanyId = null;
var instance = null;
document.addEventListener("deviceready", function () {
  var item = localStorage.getItem(KEY);
  var obj = JSON.parse(item);
  if (obj.user != null) {
    surveyCompanyId = obj.user.survey_company_id;
  }
  showSurveyList();
  showSynchronizeResult();
  $('.modal').modal();
  instance = M.Modal.getInstance('#synchronizeError');
});

/**
 * 調査業務を一覧表示する
 */
async function showSurveyList() {
  $('#survey-item').empty();
  var suveyItem = $('#survey-item');
  var surveyList = await fetchSurveyAll(surveyCompanyId);
  var texts = '';
  if (surveyList.rows.length == 0) {
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
    for (var i = 0; i < surveyList.rows.length; i++) {
      texts += '<div class="col s12 m7">';
      texts += '<div class="card horizontal">';
      texts += '<div class="card-stacked">';
      texts += '<div class="card-content">';
      texts += '<span class="badge">' + conversionStatusForDisplay(surveyList.rows.item(i).status) + '</span>';
      texts += '<i class="material-icons title-icon">description</i>調査業務名：<a href="../html/survey_detail_list.html?' + surveyList.rows.item(i).id + '">' + convertSpace(surveyList.rows.item(i).survey_name) + '</a>';
      texts += '<br>';
      texts += '<span><i class="material-icons title-icon">event_note</i>業務委託期間：' + convertSpace(surveyList.rows.item(i).business_period_from) + ' ~ ' + convertSpace(surveyList.rows.item(i).business_period_to) + '</span>';
      texts += '</div>';
      texts += '</div>';
      texts += '</div>';
      texts += '</div>';
    }
  }
  suveyItem.append(texts);
}

/**
 * 同期処理実行ボタン押下時
 */
async function synchronize() {
  if (surveyCompanyId == null) {
    var error = '同期処理実行権限エラー';
    $('#error').text(error);
    $('#errorMessage').text('申し訳ございません。調査会社情報が取得できません。調査会社アカウントで再度ログインしてから処理を実行してください。');
    $('#synchronizeError').modal('open');
    return;
  } else {
    await generateSynchronizeData();
  }
}

/**
* 同期処理データの作成
*/
async function generateSynchronizeData() {
  $('#modalLocation').modal('open');
  
  // 同期処理結果テーブルを「処理中」で作成する
  let synchronizeResult = await insertSynchronizeResult(['processing', '', fetchUserId()]);

  var surveyArray = [];
  var surveyDetailArray = [];
  var surveyAreaArray = [];
  let surveyDataArray = [];

  var surveyList = await fetchSurveyIdAndModifiedDate(surveyCompanyId);
  if (surveyList.rows.length > 0) {
    
    let surveyIdList = [];
    let surveyDetailIdList = [];

    surveyArray, surveyIdList = await fetchForSynchronizeSurvey(surveyList);
    surveyDetailArray, surveyDetailIdList = await fetchForSynchronizeSurveyDetail(surveyIdList);
    surveyAreaArray = await fetchForSynchronizeSurveyArea(surveyDetailIdList);

    // 伐採木データを4000件ずつサーバへリクエストする
    if (surveyDetailIdList.length > 0) {
      let offset = 0;
      while (true) {
        surveyDataArray = [];
        let surveyDataList = await fetchSurveyDataAll(surveyDetailIdList, offset);
        if (surveyDataList.rows.length == 0 && offset == 0) {
          await synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, synchronizeResult.insertId);
          break;
        } else if (surveyDataList.rows.length == 0 && offset != 0) {
          break;
        } else {
          for (var i = 0; i < surveyDataList.rows.length; i++) {
            surveyDataArray.push(surveyDataList.rows.item(i));
          }
          console.log(surveyDataArray.length)
          await synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, synchronizeResult.insertId);
          offset = offset + 4000;
        }
      }
    }
  } else {
    await synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, synchronizeResult.insertId);
  }
};

/**
 * 同期処理実行
 * @param surveyCompanyId 調査会社ID
 * @param surveyArray 調査業データ
 * @param surveyDetailArray 所在地データ
 * @param surveyAreaArray 小径木データ
 * @param surveyDataArray 伐採木データ
 * @param synchronizeResultInsertId 同期処理ID
 */
async function synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, synchronizeResultInsertId) {

  var item = localStorage.getItem(KEY);
  var obj = JSON.parse(item);

  var JSONdata = {
    surveyCompanyId: surveyCompanyId,
    survey: surveyArray,
    surveyDetail: surveyDetailArray,
    surveyArea: surveyAreaArray,
    surveyData: surveyDataArray,
  };

  $.ajax({
    type: 'post',
    url: path + 'synchronize',
    data: JSON.stringify(JSONdata),
    contentType: 'application/json',
    dataType: 'JSON',
    scriptCharset: 'utf-8',
    async: false,
    headers: {
      'Authorization': obj.token
    }
  })
    .done(async (data) => {

      var jsonData = JSON.stringify(data);
      var responseData = JSON.parse(jsonData);

      // 同期処理結果詳細を登録
      let param = [synchronizeResultInsertId, responseData.synchronizeHistory.id, 'processing', '', fetchUserId()]
      await createSynchronizeResultDetail(param);

      // 伐採木と小径木は同期フラグをtrueへ変更する
      // 同期処理の確認結果を取得せずに同期処理を実行した場合、サーバ側へ二重で登録されるのを防ぐために同期処理実行済みのフラグを追加
      let surveyDataIdList = surveyDataArray.map(surveyData => surveyData.id);
      await updateSurveyDataIsSynchronize(surveyDataIdList);

      $('#modalLocation').modal({ close: true });
      $('#synchronize').modal('open');
      showSynchronizeResult();

    })
    .fail(async (jqXHR, textStatus, errorThrown) => {
      var jsonData = JSON.stringify(jqXHR);
      var responseData = JSON.parse(jsonData);
      errorProcess(responseData);
    })
}

/**
 * 同期結果を確認するボタン押下時
 */
async function confirmSynchronize() {
  if (surveyCompanyId == null) {
    var error = '同期処理実行権限エラー';
    $('#error').text(error);
    $('#errorMessage').text('申し訳ございません。調査会社情報が取得できません。調査会社アカウントで再度ログインしてから処理を実行してください。');
    $('#synchronizeError').modal('open');
    return;
  } else {
    requestSynchronizeResult();
  }
}

/**
 * 同期処理結果をサーバへ確認する
 */
async function requestSynchronizeResult() {

  $('#modalLocation').modal('open');

  let latestSynchronizeResult = await fetchLastSynchronizeResult();
  let synchronizeResultDetail = null;
  if (latestSynchronizeResult.rows.length > 0) {
    synchronizeResultDetail = await fetchAllSynchronizeResultDetail(latestSynchronizeResult.rows.item(0).id);
  }

  if (synchronizeResultDetail.rows.length == 0 || synchronizeResultDetail == null) {
    $('#modalLocation').modal({ close: true });
    $('#error').text('同期処理実行エラー');
    $('#errorMessage').text('既に端末のデータは同期済みです。もう一度同期処理を実行する場合は「データを同期する」ボタンを押してください。');
    $('#synchronizeError').modal('open');
    return;
  }

  for (var i = 0; i < synchronizeResultDetail.rows.length; i++) {

    let item = localStorage.getItem(KEY);
    let obj = JSON.parse(item);
    let JSONdata = {
      cloudSynchronizeId: synchronizeResultDetail.rows.item(i).cloud_synchronize_id,
    };

    $.ajax({
      type: 'post',
      url: path + 'synchronize/result',
      data: JSON.stringify(JSONdata),
      contentType: 'application/json',
      dataType: 'JSON',
      scriptCharset: 'utf-8',
      async: false,
      headers: {
        'Authorization': obj.token
      }
    })
      .done(async (data) => {
        var jsonData = JSON.stringify(data);
        var responseData = JSON.parse(jsonData);
 
        // 同期処理結果を更新する
        await synchronizeWebToMobile(JSON.parse(responseData.synchronizeWebToMobile.synchronizeToMobile));
        let synchronizeResultParam = [
          responseData.synchronizeWebToMobile.status,
          responseData.synchronizeWebToMobile.errorMessage,
          fetchUserId(),
          responseData.synchronizeWebToMobile.id
        ]
        await updateSynchronizeResultDetail(synchronizeResultParam);
        await updateSynchronizeResultStatus();
        showSynchronizeResult();

        // 同期処理結果を画面表示
        await showSurveyList();
        $('#modalLocation').modal({ close: true });
        $('#synchronize-request').modal('open');
        showSynchronizeResult();

      })
      .fail(async (jqXHR, textStatus, errorThrown) => {
        var jsonData = JSON.stringify(jqXHR);
        var responseData = JSON.parse(jsonData);
        errorProcess(responseData);
      })
  }
}

/**
 * 同期処理結果をモーダルに反映する
 */
 async function showSynchronizeResult() {
  var result = await fetchLastSynchronizeResult();
  if (result.rows.length > 0) {
    $("#synchronizeStatus").html(conversionSynchronizeResultForDisplay(result.rows.item(0).status));
    $("#synchronizeMessage").html(result.rows.item(0).message);
    $("#synchronizeDate").html(result.rows.item(0).modified_date);
  }
}

/**
 * 同期処理結果を詳細データをもとに更新する
 */
async function updateSynchronizeResultStatus() {
  // 同期処理がすべて完了している場合、synchronize_result.statusをfinishにする。
  // 1件でもerrorがあればsynchronize_result.statusをerrorにする。
  let latestSynchronizeResult = await fetchLastSynchronizeResult();
  let synchronizeResultDetail = await fetchDetailBySynchronizeResultId(latestSynchronizeResult.rows.item(0).id);
  let status = 'finish';
  let error = '';
  for (var i = 0; i <  synchronizeResultDetail.rows.length; i++) {
    if (synchronizeResultDetail.rows.item(i).status == 'error') {
      status = 'error';
      error = '同期処理に失敗しました。再度同期処理を試してください。同じ現象が発生する場合は管理者へお問い合わせください。';
      break;
    } else if (synchronizeResultDetail.rows.item(i).status == 'processing') {
      status = 'processing'
    }
  }
  await updateSynchronizeResult([status, error, fetchUserId(), latestSynchronizeResult.rows.item(0).id]);
  return;
}

/**
 * 同期処理用の調査業務データ取得
 * @returns surveyList
 */
 async function fetchForSynchronizeSurvey(surveyList) {
  let surveyArray = [];
  let surveyIdList = [];
  for (var x = 0; x < surveyList.rows.length; x++) {
    surveyArray.push(surveyList.rows.item(0));
    surveyIdList.push(surveyList.rows.item(0).id);
  }
  return surveyArray, surveyIdList;
}

/**
 * 同期処理用の所在地データ取得
 * @returns surveyIdList
 */
 async function fetchForSynchronizeSurveyDetail(surveyIdList) {
  let surveyDetailArray = [];
  let surveyDetailIdList = [];
  if (surveyIdList.length > 0) {
    let surveyDetailList = await fetchSurveyDetailIdAndModifiedDate(surveyIdList);
    for (var i = 0; i < surveyDetailList.rows.length; i++) {
      surveyDetailArray.push(surveyDetailList.rows.item(i));
      surveyDetailIdList.push(surveyDetailList.rows.item(i).id);
    }
  }
  return surveyDetailArray, surveyDetailIdList;
}

/**
 * 同期処理用の小径木データ取得
 * @returns surveyDetailIdList
 */
 async function fetchForSynchronizeSurveyArea(surveyDetailIdList) {
  var surveyAreaArray = [];
  if (surveyDetailIdList.length > 0) {
    var surveyAreaList = await fetchSurveyAreaAll(surveyDetailIdList);
    for (var i = 0; i < surveyAreaList.rows.length; i++) {
      surveyAreaArray.push(surveyAreaList.rows.item(i));
    }
  }
  return surveyAreaArray;
}

/**
 * 同期処理結果がエラーだった場合の共通処理
 * @param {*} responseData
 */
async function errorProcess(responseData) {
  var message = '';
  var error = '';
  if (responseData.status == 401) {
    message = '申し訳ございません。セッションタイムアウトエラーが発生しました。再度ログインしてから処理を実行してください。';
    error = 'セッションタイムアウトエラー';
  } else if (responseData.status == 0) {
    //API接続なし //NW接続なし
    message = 'ネットワークエラーが発生しました。ネットワークに接続されていることを確認し、もう一度「データを同期する」ボタンをクリックしてください。確認後も同一の現象が発生する場合は、管理者へお問合せください。';
    error = 'サーバ接続エラー';
  } else {
    message = '同期処理が失敗しました。もう一度処理を実行してください。実行後も同一の現象が発生する場合は、管理者へお問合せください。';
    error = responseData.responseJSON.message;
  }

  // 同期処理結果へエラー情報を更新する
  let latestSynchronizeResult = await fetchLastSynchronizeResult();
  await updateSynchronizeResult(['error', error, fetchUserId(), latestSynchronizeResult.rows.item(0)]);
  await showSurveyList();
  await showSynchronizeResult();
  $('#modalLocation').modal({ close: true });

  $('#error').text(error);
  $('#errorMessage').text(message);
  $('#synchronizeError').modal('open');
}
