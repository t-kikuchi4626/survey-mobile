$(document).ready(function () {
    $('select').formSelect();
});

// 遷移元画面ID
var transitionId = 0;
// 調査ID
var surveyId = "";
// 調査明細ID
var surveyDetailId = "";

document.addEventListener("deviceready", async function () {

    var param = location.search.substring(1).split("&");
    let contactId = param[0];

    transitionId = param[1];

    if (param.length > 2) {
        surveyId = param[2];
    }
    if (param.length > 3) {
        surveyDetailId = param[3];
    }

    // 問合せ一覧画面遷移タグ作成
    var contactListLink = $('#contact-list-link');
    var contactListLinkText = '<a href="../html/contact_list.html?' + transitionId + '&' + surveyId + '&' + surveyDetailId + '&0"><i class="material-icons">arrow_back_ios</i></a>';
    contactListLink.append(contactListLinkText);

    // 初期表示
    initView(contactId, transitionId);
});

/**
 * 初期表示
 * @param {number} contactId 問合せID
 * @param {string} functionName 遷移元画面名
 */
async function initView(contactId, functionName) {
    // 問合せデータ取得
    if (contactId > 0) {
        // 問合せデータ設定
        setTargetContact(contactId);
    }
    else {
        // 初期表示
        setInitContact(functionName);
    }
}
/**
 * 問合せフォームの初期表示
 * @param {string} functionName 遷移元画面名
 */
function setInitContact(functionName) {
    // 件名
    $('#contact-name').val("");
    // 氏名
    $('#user-name').val("");
    // 問合せ区分
    $('#contact-class').val("question");
    // 問合せ画面
    $('#contact-function').val(contactFunctionNameList.get(functionName));
    // 問合せ内容
    $('#contact-message').val("");
    // 問合せ回答非表示
    $('#contact-answer-field').hide();
    // 問合せ状態非表示
    $('#contact-status-field').hide();
}

/**
 * 取得した問合せデータを設定
 * @param {string} contactId 問合せID
 */
function setTargetContact(contactId) {
    var item = localStorage.getItem(KEY);
    var obj = JSON.parse(item);

    var JSONdata = {
        id: parseInt(contactId)
    };

    $.ajax({
        type: 'post',
        url: path + 'contact/edit',
        data: JSON.stringify(JSONdata),
        contentType: 'application/json',
        dataType: 'JSON',
        scriptCharset: 'utf-8',
        async: false,
        headers: { 'Authorization': obj.token }
    })
        .done(async (data) => {
            var jsonData = JSON.stringify(data);
            var responseData = JSON.parse(jsonData);

            // 問合せ情報
            var contactInfo = responseData.contactInfo;

            // 件名
            $('#contact-name-text').text(contactInfo.contact_name);
            $('#contact-name').hide();
            // 氏名
            $('#user-name-text').text(contactInfo.user_name);
            $('#user-name').hide();
            // 問合せ区分
            $('#contact-class').val(contactInfo.contact_class);
            $('#contact-class').prop("disabled", true);
            // 問合せ画面
            $('#contact-function-text').text(contactInfo.contact_function);
            $('#contact-function').hide();
            // 問合せ内容
            $('#contact-message-text').text(contactInfo.contact_message);
            $('#contact-message').hide();
            // 問合せ内容説明文非表示
            $('#contact-message-description').hide();
            // 問合せ回答
            $('#contact-answer-text').text(contactInfo.contact_answer);
            // 問合せ状態
            $('#' + contactInfo.status).prop("checked", true);
            $('#unsupported').prop("disabled", true);
            $('#in_supported').prop("disabled", true);
            $('#resolved').prop("disabled", true);
            $('#pending').prop("disabled", true);
            // 問合せ内容送信ボタン非表示
            $('#register-field').hide();
            // select 属性をreadonlyへ設定
            $('select').prop("readonly", true);
        })
        .fail(async (jqXHR, textStatus, errorThrown) => {
            var jsonData = JSON.stringify(jqXHR);
            var responseData = JSON.parse(jsonData);
            errorProcessByGetContact(responseData);
        })
}

/**
 * 問合せ登録処理
 */
function save() {
    // 入力チェック
    if (validate()) {
        var item = localStorage.getItem(KEY);
        var obj = JSON.parse(item);
        var JSONdata = {
            contact_name: $('#contact-name').val(),
            user_name: $('#user-name').val(),
            contact_class: $('#contact-class').val(),
            contact_function: $('#contact-function').val(),
            contact_message: $('#contact-message').val(),
            status: "unsupported",
            userId: fetchUserId()
        };

        $.ajax({
            type: 'post',
            url: path + 'contact/save',
            data: JSON.stringify(JSONdata),
            contentType: 'application/json',
            dataType: 'JSON',
            scriptCharset: 'utf-8',
            async: false,
            headers: { 'Authorization': obj.token }
        })
            .done(async (data) => {
                M.toast({ html: '登録しました！', displayLength: 2000 });
                // 問合せ一覧表示
                location.href = "../html/contact_list.html?" + transitionId + "&" + surveyId + "&" + surveyDetailId + "&" + 1;
            })
            .fail(async (jqXHR, textStatus, errorThrown) => {
                var jsonData = JSON.stringify(jqXHR);
                var responseData = JSON.parse(jsonData);
                errorProcessByRegisterContact(responseData);
            })
    }
}
/**
 * 入力チェック
 */
function validate() {
    var result = true;
    // 件名チェック
    if ($.trim($('#contact-name').val()) == '') {
        alert("申し訳ございません。\n件名の入力は必須です。件名を入力してください。");
        result = false;
    }
    // 問合せ内容チェック
    if (result) {
        if ($.trim($('#contact-message').val()) == '') {
            alert("申し訳ございません。\n問合せ内容の入力は必須です。問合せ内容を入力してください。");
            result = false;
        }
    }

    return result;
}

/**
 * テキストボックスの更新処理
 * @param {*} 更新内容
 * @param {*} 更新カラム
 * @param {*} 必須チェック有無
 * @param {*} 数値チェック有無
 */
function updateInputTextArea(inputdata, column, required) {
    if (required && validateRequired(inputdata, column)) {
        return;
    }
}

/**
 * 必須チェック
 * @param {*} 入力値
 * @param {*} 更新カラム
 */
function validateRequired(inputdata, column) {
    if (inputdata.value === '') {
        $('#' + column + '_required').show();
        inputdata.style.background = 'pink';
        return true;
    }
    $('#' + column + '_required').hide();
    inputdata.style.background = 'white';
    return false;
}

/**
 * 問合せ取得結果がエラーだった場合の処理
 * @param {object} responseData
 */
async function errorProcessByGetContact(responseData) {
    var message = '';
    var error = '';
    if (responseData.status == 401) {
        message = '申し訳ございません。セッションタイムアウトエラーが発生しました。再度ログインしてから処理を実行してください。';
        error = 'セッションタイムアウトエラー';
    }
    else if (responseData.status == 0) {
        // API接続なし
        // NW接続なし
        message = 'ネットワークエラーが発生しました。ネットワークに接続されていることを確認し、もう一度件名リンクをクリックしてください。確認後も同一の現象が発生する場合は、管理者へお問合せください。';
        error = 'サーバ接続エラー';
    }
    else {
        message = '問合せ取得処理が失敗しました。もう一度処理を実行してください。実行後も同一の現象が発生する場合は、管理者へお問合せください。';
        error = responseData.responseJSON.message;
    }

    $('#error').text(error);
    $('#errorMessage').text(message);
    $('#contactError').modal('open');
}

/**
 * 問合せ登録結果がエラーだった場合の処理
 * @param {object} responseData
 */
async function errorProcessByRegisterContact(responseData) {
    var message = '';
    var error = '';
    if (responseData.status == 401) {
        message = '申し訳ございません。セッションタイムアウトエラーが発生しました。再度ログインしてから処理を実行してください。';
        error = 'セッションタイムアウトエラー';
    }
    else if (responseData.status == 0) {
        // API接続なし
        // NW接続なし
        message = 'ネットワークエラーが発生しました。ネットワークに接続されていることを確認し、もう一度「問合せ内容送信」ボタンをクリックしてください。確認後も同一の現象が発生する場合は、管理者へお問合せください。';
        error = 'サーバ接続エラー';
    }
    else {
        message = '問合せ登録処理が失敗しました。もう一度処理を実行してください。実行後も同一の現象が発生する場合は、管理者へお問合せください。';
        error = responseData.responseJSON.message;
    }

    $('#error').text(error);
    $('#errorMessage').text(message);
    $('#contactError').modal('open');
}