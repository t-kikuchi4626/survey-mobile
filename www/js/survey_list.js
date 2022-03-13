var instance = null;
let timerId;

document.addEventListener("deviceready", async function () {
  var item = localStorage.getItem(KEY);
  var obj = JSON.parse(item);
  if (obj.user != null) {
    surveyCompanyId = obj.user.survey_company_id;
  }
  showSurveyList();
  $('.modal').modal();
  instance = M.Modal.getInstance('#synchronizeError');

  // 同期処理の実行ボタンの活性・非活性を設定
  let latestSynchronizeResult = await fetchLastSynchronizeResultByCompanyId(surveyCompanyId);
  let status = STATUS.finish;
  if (latestSynchronizeResult.rows.length > 0) {
    status = latestSynchronizeResult.rows.item(0).status;
  }
  if (status === STATUS[0]) {
    $('#synchronize-button').prop('disabled', true);
  }

  //現在のWEB編集モードを設定する
  let nowWebEditMode = await fetchWebEditModeByCompanyId(surveyCompanyId);
  if (nowWebEditMode.rows.length > 0) {
    statusWebEditMode = nowWebEditMode.rows.item(0).web_edit_mode;
  } else if (nowWebEditMode.rows.length === 0) {
    statusWebEditMode = 'off'
  }

  if (statusWebEditMode === 'on') {
    $('#on-web-edit-mode').prop('checked', true);
    $('#off-web-edit-mode').prop('checked', false);
  } else if (statusWebEditMode === 'off') {
    $('#on-web-edit-mode').prop('checked', false);
    $('#off-web-edit-mode').prop('checked', true);
  }

  // サイドナビゲーションリンク作成
  createContactSidenavLink(contactFunction[0], "", "");

  await controlEditScreen();
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
  const result = navigator.onLine;
  if (!result) {
    alert('申し訳ございません。現在オフラインです。オンラインになっていることを確かめてから、再度お試しください。');
    return;
  }

  if (surveyCompanyId == null) {
    var error = '同期処理実行権限エラー';
    $('#error').text(error);
    $('#errorMessage').text('申し訳ございません。調査会社情報が取得できません。調査会社アカウントで再度ログインしてから処理を実行してください。');
    $('#synchronizeError').modal('open');
    return;
  } else {
    let latestSynchronizeResult = await fetchLastSynchronizeResultByCompanyId(surveyCompanyId);
    if (latestSynchronizeResult.rows.length > 0 && latestSynchronizeResult.rows.item(0).status === STATUS.processing) {
      let result = window.confirm('同期処理結果を取得していません。再度同期処理を実行しますか？');
      return result ? generateSynchronizeData(false) : null;
    } else {
      generateSynchronizeData(false);
    }
  }
}

/**
 * Web編集モード切り替えボタン押下時
 */
async function switchWebEditMode() {

  const result = navigator.onLine;
  if (!result) {
    alert('申し訳ございません。現在オフラインです。オンラインになっていることを確かめてから、再度お試しください。');
    return;
  }

  if (surveyCompanyId == null) {
    $('#modalLocation').modal('close');
    var error = '同期処理実行権限エラー';
    $('#error').text(error);
    $('#errorMessage').text('申し訳ございません。調査会社情報が取得できません。調査会社アカウントで再度ログインしてから処理を実行してください。');
    $('#synchronizeError').modal('open');
    return;
  }

  const selectedWebEditMode = $('input[name="web-edit-mode"]:checked').val();
  const webEditMode = await fetchWebEditModeByCompanyId(surveyCompanyId);
  if (webEditMode.rows.length > 0 && webEditMode.rows.item(0).web_edit_mode === selectedWebEditMode) {
    return;
  }
  await updateWebEditModeSurveyDataByCompanyId(selectedWebEditMode, surveyCompanyId);
  await updateWebEditModeSurveyAreaByCompanyId(selectedWebEditMode, surveyCompanyId);
  if (selectedWebEditMode === 'on') {
    await generateSynchronizeData(true);
  } else if (selectedWebEditMode === 'off') {
    await generateWebEditModeOffData();
  }
}

/**
 * web編集モードテーブルへ登録/更新する
 * @param {*} webEditMode web編集モード
 */
async function createWebEditMode(webEditMode) {
  const webEditModeTmp = await fetchWebEditModeByCompanyId(surveyCompanyId);
  if (webEditModeTmp.rows.length > 0) {
    var param = [
      webEditMode,
      fetchUserId(),
      surveyCompanyId
    ];
    await updateWebEditMode(param);
  } else {
    var param = [
      surveyCompanyId,
      webEditMode,
      fetchUserId()
    ];
    await insertWebEditMode(param);
  }
}

/**
 * Web編集モードON→OFFへ変更した場合、クラウド側のデータをmobileへ反映する
 */
async function generateWebEditModeOffData() {

  $('#modalLocation').modal('open');
  const uuid = device.uuid;

  let surveyArray = [];
  let surveyDetailArray = [];
  let surveyIdList = [];
  let surveyDetailIdList = [];

  var surveyList = await fetchSurveyIdCompanyId(surveyCompanyId);
  if (surveyList.rows.length > 0) {
    [surveyArray, surveyIdList] = await fetchForSynchronizeSurvey(surveyList);
    [surveyDetailArray, surveyDetailIdList] = await fetchForSynchronizeSurveyDetail(surveyIdList);
    await webEditModeOffProcess(surveyCompanyId, surveyArray, surveyDetailArray, uuid);
  } else {
    await webEditModeOffProcess(surveyCompanyId, [], [], uuid);
 
  }

}

/**
 * Web編集モードOff実行
 * @param surveyCompanyId 調査会社ID
 * @param surveyArray 調査業データ
 * @param surveyDetailArray 所在地データ
 * @param surveyAreaIdList 小径木IDデータ
 * @param surveyDataIdList 伐採木IDデータ
 */
async function webEditModeOffProcess(surveyCompanyId, surveyArray, surveyDetailArray, uuid) {
  var item = localStorage.getItem(KEY);
  var obj = JSON.parse(item);
  var JSONdata = {
    surveyCompanyId: surveyCompanyId,
    uuid: uuid,
    survey: surveyArray,
    surveyDetail: surveyDetailArray
  };
  $.ajax({
    type: 'post',
    url: path + 'synchronize/change-web-edit-mode-off',
    data: JSON.stringify(JSONdata),
    contentType: 'application/json',
    dataType: 'JSON',
    scriptCharset: 'utf-8',
    timeout: 0,
    headers: {
      'Authorization': obj.token
    }
  })
  .done(async (data) => {

    var jsonData = JSON.stringify(data);
    var responseData = JSON.parse(jsonData);
    let webEditModeResult = await insertWebEditModeResult();
    timerId = setInterval(function() {updateWebToMobile(responseData.id, webEditModeResult.insertId)}, 5000);

  })
  .fail(async (jqXHR, textStatus, errorThrown) => {
    var jsonData = JSON.stringify(jqXHR);
    var responseData = JSON.parse(jsonData);
    var item = localStorage.getItem(KEY);
    var obj = JSON.parse(item);
    if (obj.user != null) {
      surveyCompanyId = obj.user.survey_company_id;
    }
    errorProcess(responseData, surveyCompanyId);
  });

}

let updateWebToMobile = function(id, webEditModeResultId) {
  var item = localStorage.getItem(KEY);
  var obj = JSON.parse(item);
  $.ajax({
    type: 'post',
    url: path + 'synchronize/fetch-web-survey-data',
    data: JSON.stringify({id: id}),
    contentType: 'application/json',
    dataType: 'JSON',
    scriptCharset: 'utf-8',
    timeout: 0,
    headers: {
      'Authorization': obj.token
    }
  })
  .done(async (data) => {

    var jsonData = JSON.stringify(data);
    var responseData = JSON.parse(jsonData);

    if (responseData.status === 'done') {
      let fetchWebEditModeResult = await fetchWebEditModeResultById(webEditModeResultId);
      if (fetchWebEditModeResult.rows.item(0).status === 'done') {
        clearInterval(timerId);
        return;
      }
      await updateWebEditModeResult(webEditModeResultId);
      clearInterval(timerId);
      // web編集モードが「OFF」の場合、mobileのロックを解除する
      await createWebEditMode('off');
      await controlEditScreen();
      await synchronizeWebToMobile(responseData.synchronizeToMobile);
      location.reload();
      $('#modalLocation').modal('close');
    }

  })
  .fail(async (jqXHR, textStatus, errorThrown) => {
    var jsonData = JSON.stringify(jqXHR);
    var responseData = JSON.parse(jsonData);
    var item = localStorage.getItem(KEY);
    var obj = JSON.parse(item);
  })
};

/**
* 同期処理データの作成
* @param isWebEditMode Web編集モードの処理か否か
*/
async function generateSynchronizeData(isWebEditMode) {
  $('#modalLocation').modal('open');

  let synchronizeResult = [];
  if (!isWebEditMode) {
    // 同期処理結果テーブルを「処理中」で作成する
    synchronizeResult = await insertSynchronizeResult([surveyCompanyId, 'processing', '', fetchUserId()]);
  }

  var surveyArray = [];
  var surveyDetailArray = [];
  var surveyAreaArray = [];
  let surveyDataArray = [];

  var surveyList = await fetchSurveyIdCompanyId(surveyCompanyId);
  if (surveyList.rows.length > 0) {

    let surveyIdList = [];
    let surveyDetailIdList = [];

    [surveyArray, surveyIdList] = await fetchForSynchronizeSurvey(surveyList);
    [surveyDetailArray, surveyDetailIdList] = await fetchForSynchronizeSurveyDetail(surveyIdList);
    surveyAreaArray = await fetchForSynchronizeSurveyArea(surveyDetailIdList);
    // 伐採木データを4000件ずつサーバへリクエストする
    if (surveyDetailIdList.length > 0) {
      let offset = 0;
      while (true) {
        surveyDataArray = [];
        let surveyDataList = await fetchSurveyDataAll(surveyDetailIdList, offset);
        if (surveyDataList.rows.length == 0 && offset == 0) {
          await synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, (!isWebEditMode) ? synchronizeResult.insertId : 0, isWebEditMode);
          break;
        } else if (surveyDataList.rows.length == 0 && offset != 0) {
          break;
        } else {
          for (var i = 0; i < surveyDataList.rows.length; i++) {
            surveyDataArray.push(surveyDataList.rows.item(i));
          }
          await synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, (!isWebEditMode) ? synchronizeResult.insertId : 0, isWebEditMode);
          offset = offset + 4000;
        }
      }
    } else {
      await synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, (!isWebEditMode) ? synchronizeResult.insertId : 0, isWebEditMode);
    }
  } else {
    await synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, (!isWebEditMode) ? synchronizeResult.insertId : 0, isWebEditMode);
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
 * @param isWebEditMode Web編集モードか否か
 */
async function synchronizeProcess(surveyCompanyId, surveyArray, surveyDetailArray, surveyAreaArray, surveyDataArray, synchronizeResultInsertId, isWebEditMode) {

  var item = localStorage.getItem(KEY);
  var obj = JSON.parse(item);
  var JSONdata = {
    userId: fetchUserId(),
    uuid: device.uuid,
    surveyCompanyId: surveyCompanyId,
    survey: surveyArray,
    surveyDetail: surveyDetailArray,
    surveyArea: surveyAreaArray,
    surveyData: surveyDataArray
  };

  $.ajax({
    type: 'post',
    url: path + 'synchronize',
    data: JSON.stringify(JSONdata),
    contentType: 'application/json',
    dataType: 'JSON',
    scriptCharset: 'utf-8',
    timeout: 0,
    headers: {
      'Authorization': obj.token
    }
  })
    .done(async (data) => {

      var jsonData = JSON.stringify(data);
      var responseData = JSON.parse(jsonData);
      await applySynchronizeResult();
      if (synchronizeResultInsertId != 0) {
        let param = [synchronizeResultInsertId, responseData.synchronizeHistory.id, 'processing', '', fetchUserId()]
        await createSynchronizeResultDetail(param);
      }
      $('#modalLocation').modal({ close: true });

      // web編集モードが「ON」の場合、mobileの画面をロックする
      if (isWebEditMode) {
        await createWebEditMode('on');
        await controlEditScreen();
        $('#web-edit-mode-on').modal('open');
      } else {
        $('#synchronize').modal('open');
      }

    })
    .fail(async (jqXHR, textStatus, errorThrown) => {
      var jsonData = JSON.stringify(jqXHR);
      var responseData = JSON.parse(jsonData);
      var item = localStorage.getItem(KEY);
      var obj = JSON.parse(item);
      if (obj.user != null) {
        surveyCompanyId = obj.user.survey_company_id;
      }
      errorProcess(responseData, surveyCompanyId);
    })
}

/**
 * 同期結果を確認するボタン押下時
 */
async function confirmSynchronize() {

  const result = navigator.onLine;
  if (!result) {
    alert('申し訳ございません。現在オフラインです。オンラインになっていることを確かめてから、再度お試しください。');
    return;
  }

  $('#synchronize-request').modal({ close: true });
  if (surveyCompanyId == null) {
    $('#modalLocation').modal('close');
    var error = '同期処理実行権限エラー';
    $('#error').text(error);
    $('#errorMessage').text('申し訳ございません。調査会社情報が取得できません。調査会社アカウントで再度ログインしてから処理を実行してください。');
    $('#synchronizeError').modal('open');
    return;
  } else {
    await requestSynchronizeResult(surveyCompanyId);
  }
}

/**
 * 同期処理結果をサーバへ確認する
 */
async function requestSynchronizeResult(surveyCompanyId) {
  $('#modalLocation').modal('open');

  let latestSynchronizeResult = await fetchLastSynchronizeResultByCompanyId(surveyCompanyId);
  let synchronizeResultDetailList = null;
  if (latestSynchronizeResult.rows.length === 0) {
    $('#modalLocation').modal('close');
    var error = '最新の同期処理データ取得エラー';
    $('#error').text(error);
    $('#errorMessage').text('申し訳ございません。最新の同期処理データがないようです。「同期処理を開始する」ボタンを押下後に、本ボタンで確認してください。');
    $('#synchronizeError').modal('open');
    return;
  }

  let latestSynchronizeResultId = latestSynchronizeResult.rows.item(0).id;
  if (latestSynchronizeResult.rows.length > 0) {
    synchronizeResultDetailList = await fetchAllSynchronizeResultDetail(latestSynchronizeResult.rows.item(0).id);
  }
  if (synchronizeResultDetailList.rows.length == 0 || synchronizeResultDetailList == null) {
    $('#modalLocation').modal({ close: true });
    $('#synchronize-success').modal('open');
    return;
  }
  let cloudSynchronizeId = [];
  for (var i = 0; i < synchronizeResultDetailList.rows.length; i++) {
    cloudSynchronizeId.push(synchronizeResultDetailList.rows.item(i).cloud_synchronize_id);
  }
  let item = localStorage.getItem(KEY);
  let obj = JSON.parse(item);
  let JSONdata = {
    cloudSynchronizeId: cloudSynchronizeId,
  };
  $.ajax({
    type: 'post',
    url: path + 'synchronize/result',
    data: JSON.stringify(JSONdata),
    contentType: 'application/json',
    dataType: 'JSON',
    scriptCharset: 'utf-8',
    timeout: 0,
    headers: {
      'Authorization': obj.token
    }
  })
    .done(async (data) => {

      var jsonData = JSON.stringify(data);
      if (data.length === 0) {
        $('#modalLocation').modal('close');
        return alert("正常に同期処理が終了しませんでした。再度同期処理を実行してください。");
      }

      var responseData = JSON.parse(jsonData);
      if (!isStatusFinish(responseData.synchronizeWebToMobile)) {
        $('#modalLocation').modal('close');
        return alert("現在同期処理実行中です。しばらくしてから再度確認ボタンを押してください。");
      }
      let status = await updateSynchronizeResultDetail(responseData.synchronizeWebToMobile);
      let error = await updateSynchronizeResultStatus(status, latestSynchronizeResultId);
      await applySynchronizeResult();
      if (status === STATUS.error) {
        applyErrorModal(status, error);
        $('#synchronizeError').modal('open');
      } else {
        for (var i = 0; i < responseData.synchronizeWebToMobile.length; i++) {
          let responseDataTmp = responseData.synchronizeWebToMobile[i];
          await synchronizeWebToMobile(responseDataTmp.synchronizeToMobile);
        }
        $('#synchronize-request').modal('open');
      }
      $('#modalLocation').modal('close');
      // 同期処理結果を画面表示
      location.reload();
    })
    .fail(async (jqXHR, textStatus, errorThrown) => {
      var jsonData = JSON.stringify(jqXHR);
      var responseData = JSON.parse(jsonData);
      var item = localStorage.getItem(KEY);
      var obj = JSON.parse(item);
      if (obj.user != null) {
        surveyCompanyId = obj.user.survey_company_id;
      }
      errorProcess(responseData, surveyCompanyId);
    });
}

/**
 * クラウド側の同期処理状態が完了済みか確認
 * @param {*} synchronizeWebToMobile クラウド側から連携されたデータ
 * @returns 完了済みか否か
 */
function isStatusFinish(synchronizeWebToMobile) {
  let isFinish = true;
  for (var i = 0; i < synchronizeWebToMobile.length; i++) {
    if (synchronizeWebToMobile[i].status === STATUS.processing) {
      isFinish = false;
      break;
    }
  }
  return isFinish;
}

/**
 * 同期処理結果詳細テーブルを全件更新する
 * @param {*} synchronizeWebToMobile クラウド側から連携されたデータ
 */
async function updateSynchronizeResultDetail(synchronizeWebToMobile) {
  let status = STATUS.finish;
  for (var i = 0; i < synchronizeWebToMobile.length; i++) {
    let synchronizeResultParam = [
      synchronizeWebToMobile[i].status,
      synchronizeWebToMobile[i].errorMessage,
      fetchUserId(),
      synchronizeWebToMobile[i].id
    ]
    await updateSynchronizeResultDetailById(synchronizeResultParam);
    if (synchronizeWebToMobile[i].status === STATUS.error) {
      status = STATUS.error;
    } else if (synchronizeWebToMobile[i].status === STATUS.processing) {
      status = STATUS.processing;
    }
  }
  return status;
}

/**
 * 同期処理結果をモーダルに反映する
 */
async function applySynchronizeResult() {
  var result = await fetchLastSynchronizeResultByCompanyId(surveyCompanyId);
  if (result.rows.length > 0) {
    $("#synchronizeStatus").html(conversionSynchronizeResultForDisplay(result.rows.item(0).status));
    $("#synchronizeMessage").html(result.rows.item(0).message);
    $("#synchronizeDate").html(result.rows.item(0).modified_date);
  }
}

/**
 * 同期処理結果を詳細データをもとに更新する
 * @param {*} status 同期処理状態
 * @param {*} latestSynchronizeResultId 同期処理結果ID
 */
async function updateSynchronizeResultStatus(status, latestSynchronizeResultId) {
  // 同期処理がすべて完了している場合、synchronize_result.statusをfinishにする。
  // 1件でもerrorがあればsynchronize_result.statusをerrorにする。
  let error = '';
  if (status === STATUS.error) {
    status = STATUS.error;
    error = '同期処理に失敗しました。再度同期処理を試してください。同じ現象が発生する場合は管理者へお問い合わせください。';
  }
  await updateSynchronizeResult([status, error, fetchUserId(), latestSynchronizeResultId]);
  return error;
}

/**
 * 同期処理用の調査業務データ取得
 * @returns surveyList
 */
async function fetchForSynchronizeSurvey(surveyList) {
  let surveyArray = [];
  let surveyIdList = [];
  for (var x = 0; x < surveyList.rows.length; x++) {
    surveyArray.push(surveyList.rows.item(x));
    surveyIdList.push(surveyList.rows.item(x).id);
  }
  return [surveyArray, surveyIdList];
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
  return [surveyDetailArray, surveyDetailIdList];
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
 * @param {*} surveyCompanyId
 */
async function errorProcess(responseData, surveyCompanyId) {
  var message = '';
  var error = '';
  if (responseData.status == 401) {
    message = '申し訳ございません。セッションタイムアウトエラーが発生しました。再度ログインしてから処理を実行してください。';
    error = 'セッションタイムアウトエラー';
  } else {
    message = '同期処理が失敗しました。もう一度処理を実行してください。実行後も同一の現象が発生する場合は、管理者へお問合せください。';
    error = responseData.responseJSON.message;
  }

  // 同期処理結果へエラー情報を更新する
  let latestSynchronizeResult = await fetchLastSynchronizeResultByCompanyId(surveyCompanyId);
  if (latestSynchronizeResult.rows.length > 0) {
    await updateSynchronizeResult(['error', error, fetchUserId(), latestSynchronizeResult.rows.item(0).id]);
  };
  await showSurveyList();
  await applySynchronizeResult();

  $('#modalLocation').modal({ close: true });
  applyErrorModal(error, message);
  $('#synchronizeError').modal('open');

}

/**
 * エラーモーダル表示
 * @param {*} error エラー
 * @param {*} message メッセージ
 */
function applyErrorModal(error, message) {
  $('#error').text(error);
  $('#errorMessage').text(message);
}

/**
 * Web編集用モーダルを表示する。
 */
function openWebEditModal() {
  $('#webEditModal').modal('open');
}
