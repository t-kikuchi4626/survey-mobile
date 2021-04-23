var database = null;
var KEY = 'session';
var appPass = '#t2IOj4rVl2lQ%_$7)7pXeoGE/Jg#0&0-/$X-Suojg)!21RCLel#4Q%322BtS148';
// var path = 'https://nw-tohoku-epco-tree-survey-app.com:8443/';
// var path = 'http://survey-develop.japanwest.cloudapp.azure.com:80/';
var path = 'http://develop-survey.japaneast.cloudapp.azure.com:8443/';

var instances = null;

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
    if ('finish' == result) {
        statusForDisplay = '成功';
    } else if ('error' == result) {
        statusForDisplay = '失敗';
    } else if ('processing' == result) {
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
 * 問合せサイドナビゲーションのリンク作成
 * @param {number} id 遷移元番号
 * @param {string} surveyId 調査ID
 * @param {string} surveyDetailId 調査明細ID
 */
function createContactSidenavLink(id, surveyId, surveyDetailId) {
    // 問合せ一覧画面遷移タグ作成
    var contactListLink = $('#contact-list-link');
    var linkText = '';
    switch (id) {
        case 1:
            // 調査業務一覧より表示
            linkText = '<a href="../html/contact_list.html?' + id + '"><i class="material-icons">send</i>問合せ</a>';
            break;
        case 2:
            // 所在地一覧より表示
            linkText = '<a href="../html/contact_list.html?' + id + '&' + surveyId + '"><i class="material-icons">send</i>問合せ</a>';
            break;
        case 3:
        case 4:
        case 5:
        case 6:
            // 毎木調査登録より表示
            // 伐採木データ履歴一覧より表示
            // 伐採木一覧より表示
            // 小径木登録より表示
            linkText = '<a href="../html/contact_list.html?' + id + '&' + surveyId + '&' + surveyDetailId + '"><i class="material-icons">send</i>問合せ</a>';
            break;
    }
    contactListLink.append(linkText);
}
