/**
 * ログインボタン押下時
 */
$("#login-button").click(function () {
  var username = $('#username').val();
  var password = $('#password').val();

  // 入力チェック
  if (username == '' || password == '') {
    $("#error-message").html("IDとPasswordは必須です。");
  } else {
    // window.location.href = 'html/survey_list.html';
    loginApi(username, password);
  }
});

/**
 * ログインAPI
 * @param {*} username
 * @param {*} password
 */
function loginApi(username, password) {
  var url = path + "login";

  var JSONdata = {
    username: username,
    password: password,
    appPass: appPass,
  };

  $.ajax({
    type: 'post',
    url: url,
    data: JSON.stringify(JSONdata),
    contentType: 'application/json',
    dataType: 'JSON',
    scriptCharset: 'utf-8',
    success: function (data) {
      window.localStorage.setItem(KEY, JSON.stringify(data));
      window.location.href = 'html/survey_list.html';
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {

      //認証エラー
      if (XMLHttpRequest.status === 401) {
        $("#error-message").html("IDまたはPasswordが正しくありません。<br>もう一度試してください。");
      } else if (XMLHttpRequest.status === 404) {
        $("#error-message").html("申し訳ございませんがアクセスが許可されておりません。<br>管理者へ問い合わせてください。");
      } else if (XMLHttpRequest.status === 500) {
        $("#error-message").html("システムエラーが発生しています。<br>管理者へ問い合わせてください。");
      } else if (XMLHttpRequest.status === 429) {
      // アクセス試行回数
        $("#error-message").html("アクセス数が多いため一時的にブロックしています。<br>再度ログインするにはしばらくお待ちください。");
      } else if (XMLHttpRequest.status === 0) {
      //API接続なし //NW接続なし
        $("#error-message").html("ネットワークエラーが発生しました。ネットワークに接続されていることを確認し、もう一度ログインしてください。確認後も同一の現象が発生する場合は、管理者へお問合せください。");
      }
    }
  });
};