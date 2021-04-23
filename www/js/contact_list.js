document.addEventListener("deviceready", function () {
  var param = location.search.substring(1).split("&");

  // 遷移元ID取得
  var transitionId = parseInt(param[0]);
  // 調査ID取得
  var surveyId = "";
  if (param.length > 1) {
    surveyId = param[1];
  }
  // 調査明細ID取得
  var surveyDetailId = "";
  if (param.length > 2) {
    surveyDetailId = param[2];
  }

  // 戻るタグ作成
  createBackLink(transitionId, surveyId, surveyDetailId);

  // TODO 一覧作成
  showContactList();
});

/**
 * 問合せを一覧表示する
 */
function showContactList() {
  $('#contact-item').empty();
  var contactItem = $('#contact-item');
  // TODO 仮の一覧データ作成
  var dataCount = 3;
  var texts = '';
  if (dataCount === 0) {
    texts += '<div class="col s12 m7">';
    texts += '<div class="card horizontal">';
    texts += '<div class="card-stacked">';
    texts += '<div class="card-content">';
    texts += '<p>データが存在しません。</p>';
    texts += '</div>';
    texts += '</div>';
    texts += '</div>';
    texts += '</div>';
  } else {
    for (var i = 0; i < dataCount; i++) {
      texts += '<div class="col s12 m7">';
      texts += '<div class="card horizontal">';
      texts += '<div class="card-stacked">';
      texts += '<div class="card-content">';
      texts += '問合せ区分：' + '質問';
      texts += '<br>';
      texts += '件名：<a href="../html/contact.html?' + 1 + '">' + convertSpace('調査業務データの変更方法について') + '</a>';
      texts += '<br>';
      texts += '問合せ状態：' + '未対応';
      texts += '<br>';
      texts += '問合せ日時：' + '2021/4/23';
      texts += '</div>';
      texts += '</div>';
      texts += '</div>';
      texts += '</div>';
    }
  }
  contactItem.append(texts);
}

/**
 * 戻るリンク作成
 * @param {number} transitionId 遷移元番号
 * @param {string} surveyId 調査ID
 * @param {string} surveyDetailId 調査明細ID
 */
function createBackLink(transitionId, surveyId, surveyDetailId) {
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

