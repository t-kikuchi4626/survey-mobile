// 遷移元画面ID
var transitionId   = 0;
// 調査ID
var surveyId       = "";
// 調査明細ID
var surveyDetailId = "";
// 登録フラグ
var isRegister     = 0;

document.addEventListener("deviceready", function () {
  var param = location.search.substring(1).split("&");

  // 遷移元ID取得
  transitionId = parseInt(param[0]);
  // 調査ID取得
  if (param.length > 1) {
    surveyId = param[1];
  }
  // 調査明細ID取得
  if (param.length > 2) {
    surveyDetailId = param[2];
  }
  // 登録フラグ取得
  if (param.length > 3) {
    isRegister = parseInt(param[3]);
  }

  // 戻るタグ作成
  createBackLink(transitionId, surveyId, surveyDetailId);

  // 一覧作成
  showContactList();
});

/**
 * 問合せを一覧表示する
 */
function showContactList() {
  $('#contact-item').empty();

  var item = localStorage.getItem(KEY);
  var obj  = JSON.parse(item);

  var JSONdata = {
    userId: fetchUserId()
  };

  $.ajax({
    type          : 'post',
    url           : path + 'contact/list',
    data          : JSON.stringify(JSONdata),
    contentType   : 'application/json',
    dataType      : 'JSON',
    scriptCharset : 'utf-8',
    async         : false,
    headers       : { 'Authorization': obj.token }
  })
    .done(async (data) => {
      var jsonData     = JSON.stringify(data);
      var responseData = JSON.parse(jsonData);

      // 一覧データ作成
      var contactItem = $('#contact-item');
      var texts       = '';
      var contactList = responseData.contactList;
      if (contactList && contactList.length > 0) {
        contactList.forEach(function (contact) {
          texts = "";
          var contactClass = "";
          if (contact.contact_class === "question") {
            contactClass = "質問";
          }
          else if (contact.contact_class === "fault") {
            contactClass = "障害";
          }
          else if (contact.contact_class === "request") {
            contactClass = "要望";
          }
          else if (contact.contact_class === "nice") {
            contactClass = "いいね！";
          }
          else if (contact.contact_class === "other") {
            contactClass = "その他";
          }
          var contactStatus = "";
          if (contact.status === "unsupported") {
            contactStatus = "未対応";
          }
          else if (contact.status === "in_supported") {
            contactStatus = "対応中";
          }
          else if (contact.status === "resolved") {
            contactStatus = "解決済";
          }
          else if (contact.status === "pending") {
            contactStatus = "保留";
          }
          texts += '<div class="row">';
          texts += '<div class="card horizontal">';
          texts += '<div class="card-stacked">';
          texts += '<div class="card-content">';
          texts += '<div class="col s12 m6">';
          texts += '件名：<a href="../html/contact.html?' + contact.id + '&' + transitionId + '&' + surveyId + '&' + surveyDetailId + '">';
          texts += convertSpace(contact.contact_name) + '</a>';
          texts += '<br>';
          texts += '問合せ区分：' + contactClass;
          texts += '</div>';
          texts += '<div class="col s12 m6">';
          texts += '問合せ状態：' + contactStatus;
          texts += '<br>';
          texts += '問合せ日時：' + contact.created_date;
          texts += '</div>';
          texts += '</div>';
          texts += '</div>';
          texts += '</div>';
          texts += '</div>';
          contactItem.append(texts);
        });
      } else {
        texts += '<div class="col s12 m7">';
        texts += '<div class="card horizontal">';
        texts += '<div class="card-stacked">';
        texts += '<div class="card-content">';
        texts += '<p>対象データが存在しません</p>';
        texts += '</div>';
        texts += '</div>';
        texts += '</div>';
        texts += '</div>';
        contactItem.append(texts);
      }
      // 登録トースト表示
      if (isRegister === 1) {
        M.toast({ html: '登録しました！', displayLength: 2000 });
      }
    })
    .fail(async (jqXHR, textStatus, errorThrown) => {
      var jsonData     = JSON.stringify(jqXHR);
      var responseData = JSON.parse(jsonData);
      errorProcess(responseData);
    })
}

/**
 * 問合せ一覧取得結果がエラーだった場合の処理
 * @param {object} responseData
 */
async function errorProcess(responseData) {
  var message = '';
  var error   = '';
  if (responseData.status == 401) {
    message = '申し訳ございません。セッションタイムアウトエラーが発生しました。再度ログインしてから処理を実行してください。';
    error   = 'セッションタイムアウトエラー';
  }
  else if (responseData.status == 0) {
    // API接続なし
    // NW接続なし
    message = 'ネットワークエラーが発生しました。ネットワークに接続されていることを確認し、もう一度「問合せする」ボタンをクリックしてください。確認後も同一の現象が発生する場合は、管理者へお問合せください。';
    error   = 'サーバ接続エラー';
  }
  else {
    message = '問合せ一覧取得処理が失敗しました。もう一度処理を実行してください。実行後も同一の現象が発生する場合は、管理者へお問合せください。';
    error   = responseData.responseJSON.message;
  }

  $('#error').text(error);
  $('#errorMessage').text(message);
  $('#contactError').modal('open');
}

/**
 * 戻るリンク作成
 */
function createBackLink() {
  var backLink     = $('#transition-view-link');
  var backLinkText = '';
  switch (transitionId) {
    case 1:
      // 調査業務一覧へ遷移
      backLinkText = '<a href="../html/survey_list.html"><i class="material-icons">arrow_back_ios</i></a>';
      break;
    case 2:
      // 所在地一覧へ遷移
      backLinkText = '<a href="../html/survey_detail_list.html?' + surveyId + '"><i class="material-icons">arrow_back_ios</i></a>';
      break;
    case 3:
      // 毎木調査登録へ遷移
      backLinkText = '<a href="../html/survey_data_register.html?' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">arrow_back_ios</i></a>';
      break;
    case 4:
      // 伐採木データ履歴一覧へ遷移
      backLinkText = '<a href="../html/survey_data_history_list.html?' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">arrow_back_ios</i></a>';
      break;
    case 5:
      // 伐採木一覧へ遷移
      backLinkText = '<a href="../html/survey_data_list.html?' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">arrow_back_ios</i></a>';
      break;
    case 6:
      // 小径木登録へ遷移
      backLinkText = '<a href="../html/survey_data_edit.html?' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">arrow_back_ios</i></a>';
  }
  backLink.append(backLinkText);
}

/**
 * 問合せフォーム画面遷移
 */
function edit() {
  location.href = "../html/contact.html?" + 0 + '&' + transitionId + '&' + surveyId + '&' + surveyDetailId;
}

