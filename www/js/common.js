var database = null;
var KEY = 'session';
var appPass = '#t2IOj4rVl2lQ%_$7)7pXeoGE/Jg#0&0-/$X-Suojg)!21RCLel#4Q%322BtS148';
var path = 'https://nw-tohoku-epco-tree-survey-app.com:8443/';
// var path = 'http://survey-develop.japanwest.cloudapp.azure.com:80/';
// var path = 'https://develop-survey.japaneast.cloudapp.azure.com:8443/';
// var path = 'http://172.21.144.1:8443/';
// var path = 'http://192.168.3.140:8443/';
// var path = 'https://nw-tohoku-epco-tree-survey-app.com:8443/';
// var path = 'http://172.18.41.197:8443/';

var surveyCompanyId = null;

var instances = null;
const STATUS = {
    processing: "processing",
    finish: "finish",
    error: "error"
}

$(document).ready(function () {
    $('.collapsible').collapsible();
    $('.tabs').tabs();
    $('.dropdown-trigger').dropdown();
    $('.modal').modal();
});


document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.sidenav');
    var options = {
        'edge': 'right',
        'draggable': true
    };
    instances = M.Sidenav.init(elems, options);
});

document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() {
    cordova.getAppVersion.getVersionNumber(function (versionNum) {
        $('#version').text(`Ver.${versionNum}`);
    });
}

document.addEventListener("deviceready", function () {
    database = window.sqlitePlugin.openDatabase({ name: 'logging.db', location: 'default' });
});

var pagetop = $('#page_top');
// ボタン非表示
pagetop.hide();
// 100px スクロールしたらボタン表示
$(window).scroll(function () {
    if ($(this).scrollTop() > 5) {
        pagetop.fadeIn();
    } else {
        pagetop.fadeOut();
    }
});
pagetop.click(function () {
    $('body, html').animate({ scrollTop: 0 }, 500);
    return false;
});

// 問合せ画面名ラベル
var contactFunction = [
    "survey-list",
    "survey-detail-list",
    "survey-data-edit",
    "survey-data-history",
    "survey-data-list",
    "survey-area-edit"
];

// 問合せ画面名のmapを生成
var contactFunctionNameList = new Map([
    [contactFunction[0], "調査業務一覧"],
    [contactFunction[1], "所在地一覧"],
    [contactFunction[2], "毎木調査登録"],
    [contactFunction[3], "伐採木データ履歴一覧"],
    [contactFunction[4], "伐採木一覧"],
    [contactFunction[5], "小径木登録"]
]);

/**
 * ログアウト
 */
function logout() {
    window.localStorage.removeItem(KEY);
    window.location.href = '../index.html';
}

/**
 * ローカルストレージからuserIdを取得
 */
function fetchUserId() {
    var item = localStorage.getItem(KEY);
    var obj = JSON.parse(item);
    return obj.user.id;
}

/**
 * ステータスコードを画面表記用へ変換
 * @param {*} status 
 */
function conversionStatusForDisplay(status) {
    var statusForDisplay = ''
    switch (status) {
        case 'true':
            statusForDisplay = '完了';
            break;
        case 'false':
            statusForDisplay = '未完了';
            break;
        default:
            break;
    }
    return statusForDisplay;
}

/**
 * 同期処理結果を画面表記用へ変換
 * @param {*} status 
 */
function conversionSynchronizeResultForDisplay(result) {
    var statusForDisplay = ''
    if (STATUS.finish == result) {
        statusForDisplay = '成功';
    } else if (STATUS.error == result) {
        statusForDisplay = '失敗';
    } else if (STATUS.processing == result) {
        statusForDisplay = '処理中';
    }
    return statusForDisplay;
}

/**
 * 現在日付を取得
 */
function getNowDate() {
    var date = new Date();
    var y = date.getFullYear();
    var m = ("00" + (date.getMonth() + 1)).slice(-2);
    var d = ("00" + date.getDate()).slice(-2);
    var result = y + m + d;
    return result;
}

/**
 * nullを空文字へ変換
 * @param {*} target 
 */
function convertSpace(target) {
    return target == null ? '' : target;
}

/**
 * DB（同期処理）でのエラー処理
 * @param {*} transaction
 */
async function errorHandler(transaction) {
    $('#modalLocation').modal('close');
    $('#error').text('DB接続中にエラーが発生しました。管理者へお問い合わせください。');
    $('#errorMessage').text(transaction.message);

    //surveyCompanyIdをセットする
    var item = localStorage.getItem(KEY);
    var obj = JSON.parse(item);
    if (obj.user != null) {
        surveyCompanyId = obj.user.survey_company_id;
    }
    var error = '同期中のエラー';
    // 同期処理結果へエラー情報を更新する
    let latestSynchronizeResult = await fetchLastSynchronizeResultByCompanyId(surveyCompanyId);
    await updateSynchronizeResult(['error', error, fetchUserId(), latestSynchronizeResult.rows.item(0).id]);
    await applySynchronizeResult();
    await showSurveyList();

    $('#modalLocation').modal({ close: true });
    $('#synchronizeError').modal('open');
}
/**
 * 問合せサイドナビゲーションのリンク作成
 * @param {number} contactFunction 遷移元番号
 * @param {string} surveyId 調査ID
 * @param {string} surveyDetailId 調査明細ID
 */
function createContactSidenavLink(contactFunction, surveyId, surveyDetailId) {
    // 問合せ一覧画面遷移タグ作成
    var contactListLink = $('#contact-list-link');
    var linkText = '';
    switch (contactFunction) {
        case contactFunction[0]:
            // 調査業務一覧より表示
            linkText = '<a href="../html/contact_list.html?' + contactFunction + '"><i class="material-icons">send</i>問合せ</a>';
            break;
        case contactFunction[1]:
            // 所在地一覧より表示
            linkText = '<a href="../html/contact_list.html?' + contactFunction + '&' + surveyId + '"><i class="material-icons">send</i>問合せ</a>';
            break;
        default:
            // 毎木調査登録より表示
            // 伐採木データ履歴一覧より表示
            // 伐採木一覧より表示
            // 小径木登録より表示
            linkText = '<a href="../html/contact_list.html?' + contactFunction + '&' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">send</i>問合せ</a>';
            break;
    }
    contactListLink.append(linkText);
}

/**
 * 識別コード生成
 * @param uuid 端末番号
 * @returns uuid + 現在日時分秒ミリ秒 + ランダムな文字列10桁
 */
function generateIdentifyCode(uuid) {
    var date = new Date();
    var now = date.getFullYear()
        + ("00" + (date.getMonth() + 1)).slice(-2)
        + ("00" + date.getDate()).slice(-2)
        + ('0' + date.getHours()).slice(-2)
        + ('0' + date.getMinutes()).slice(-2)
        + ('0' + date.getSeconds()).slice(-2);
    var random = Math.random().toString(36).slice(-25);
    return uuid + now + random;
}

/**
 * web編集モードより、画面のROCK状態を制御する
 */
async function controlEditScreen() {
    var item = localStorage.getItem(KEY);
    var obj = JSON.parse(item);
    if (obj.user != null) {
        surveyCompanyId = obj.user.survey_company_id;
    }
    const webEditMode = await fetchWebEditModeByCompanyId(surveyCompanyId);
    if (webEditMode.rows.length > 0 && webEditMode.rows.item(0).web_edit_mode === 'on') {
        $('.web-edit-mode').prop("disabled", true);
        $('.input-area').prop("disabled", true);
        $('.enter').addClass('edit-link');
        $('.create-button').addClass('edit-link');
        $('.web-edit-message').show();
    } else {
        $('.web-edit-mode').prop("disabled", false);
        $('.web-edit-message').hide();
    }
}

/**
* 指定した値がnullかどうかチェックをします。
* @param  {object}  val チェックする値。
* @return {boolean} undefined, null, "" なら true
*/
function isNull(val) {
    return val === undefined || val === null || val === "null";
}