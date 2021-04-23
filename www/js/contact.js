// 調査ID
var contactId = null;

document.addEventListener("deviceready", async function () {
    contactId = location.search.substring(1);

    // 初期表示
    initView();
});

/**
 * 初期表示
 */
async function initView() {
    // 問合せデータ取得
    // TODO ajax
    var test = true;
    if (test) {
        // TODO 問合せデータ設定
        setTargetContact();
    } else {
        // 初期表示
        setInitContact();
    }
}
/**
 * 問合せフォームの初期表示
 */
function setInitContact() {
    // 件名
    $('#contact-name').val("");
    // 氏名
    $('#user-name').val("");
    // TODO 問合せ区分
    // TODO 問合せ画面
    // 問合せ内容
    $('#contact-message').val("");
    // 問合せ回答非表示
    $('#contact-answer-field').hide();
}

/**
 * 取得した問合せデータを設定
 */
function setTargetContact() {
    // 件名
    $('#contact-name').val("調査業務データの変更方法について");
    $('#contact-name').prop("disabled", true);
    // 氏名
    $('#user-name').val("匿名");
    $('#user-name').prop("disabled", true);
    // TODO 問合せ区分
    // TODO 問合せ画面
    // 問合せ内容
    $('#contact-message').val("調査業務の変更ができないですが、どのように操作する必要があるのか教えてください。");
    $('#contact-message').prop("disabled", true);
    // 問合せ回答
    $('#contact-answer').val("回答");
    $('#contact-answer').prop("disabled", true);
}

/**
 * 入力チェック
 */
function validate() {
    var result = true;
    // 件名チェック
    if ($('#contact-name').val() == '') {
        alert("申し訳ございません。\n件名の入力は必須です。件名を入力してください。");
        result = false;
    }
    // 問合せ内容チェック
    if (result) {
        if ($('#contact-message').val() == '') {
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