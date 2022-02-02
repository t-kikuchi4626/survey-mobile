// 調査業務ID
var surveyId = null;
// 所在地ID
var surveyDetailId = null;
// uuid
var uuid = "";
var id = null;
var isHistoryFlag = false;
document.addEventListener("deviceready", async function () {
    var param = location.search.substring(1).split("&");
    uuid = device.uuid;
    surveyId = param[0];
    surveyDetailId = param[1];

    //更新用に値を保持する
    $("#modal-survey-detail-id").val(surveyDetailId);

    // 所在地一覧遷移タグ作成
    var surveyDetailListLink = $('#survey-detail-list-link');
    var detailListLinkText = `<a href="../html/survey_detail_list.html?${surveyId}"><i class="material-icons">arrow_back_ios</i></a>`;
    surveyDetailListLink.append(detailListLinkText);

    // サイドナビゲーションリンク作成
    createSidenavLink(surveyId, surveyDetailId);
    createContactSidenavLink(3, surveyId, surveyDetailId);

    var survey = await fetchSurveyById(surveyId);
    var treeTypeValue = await convertSpace(survey.rows.item(0).tree_type_value);
    var specialTree = await convertSpace(survey.rows.item(0).special_tree);
    setTreeTypeButton(treeTypeValue, specialTree, "surveyDataTreeType");
    setTreeTypeButtonInModal(treeTypeValue, specialTree, "modalSurveyDataTreeType");
    var treeCountArray = await fetchTreeTypeCount(treeTypeValue, specialTree, surveyDetailId);
    setTreeCount(treeCountArray);
    initializeForm(surveyId, surveyDetailId, id);
    await controlEditScreen();
});

/**
 * 伐採木データ登録画面の初期化
 */
async function initializeForm(surveyId, surveyDetailId, id) {
    //地権者モーダル表示
    var surveyDetailItem = $('#area-info');
    var surveyDetailList = await fetchSurveyDetailById(surveyDetailId);
    var texts = '';
    surveyDetailList.rows.length == 0 ?
        (v => {
            texts += '<div class="row">';
            texts += '<p>データが存在しません。</p>'
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
        })() :
        (v => {
            texts = setSurveyDetailModal(texts, surveyDetailList.rows.item(0));
        })();
    surveyDetailItem.append(texts);
    //履歴2件ずつページングで表示
    var surveyHistoryItem = $('#history-list-contents');
    var surveyDetailList = await fetchSurveyDataBySurveyDetailId(surveyDetailId);
    var texts = "";
    surveyDetailList.rows.length == 0 ?
        (v => {
            texts += '<div class="row">';
            texts += '<p>データが存在しません。</p>'
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
            texts += '</div>';
        })() :
        (v => {
            for (var i = 0; i < surveyDetailList.rows.length; i++) {
                texts = setSurveyHistoryData(texts, surveyDetailList.rows.item(i), i);
            }
        })();
    surveyHistoryItem.append(texts);
    //初期表示
    if (surveyDetailList.rows.item(0) != undefined) {
        setSurveyData(surveyDetailList.rows.item(0));
    }
}

/**
 * 所在地データを画面に設定
 * @param 所在地データ
 */
function setSurveyDetailModal(texts, surveyDetail) {
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
    return texts;
}

/**
 * 調査データを画面に設定
 * @param 調査データ
 */
function setSurveyHistoryData(texts, surveyData, countRows) {

    var needText = "";
    texts += '<tr id="historyTr" style="border:1px solid #e3e3e3!important;">';
    texts += '<td>';
    texts += '<div class="first col s0.2" style="display:flex;">';
    if (countRows === 0) {
        texts += `<a onclick="modalSetData('${surveyData.id}')" class="waves-effect waves-light enter mobile-floating" style="display:flex;">`;
    } else {
        texts += `<a onclick="modalSetData('${surveyData.id}')" class="waves-effect waves-light enter mobile-floating" style="display:flex;">`;
    }
    texts += '<li id="history-data" class="collection-item" style="display:flex;">';
    texts += `<span style="margin-right: 0.5rem;">${surveyData.color}-${surveyData.word}-${surveyData.number}</span>`
    surveyData.survey_data_tree_type !== null ?
        texts += `<span style="margin-right: 0.5rem;">${surveyData.survey_data_tree_type}</span>` :
        texts += `<span style="margin-right: 0.5rem;">樹種データなし</span>`

    texts += `<span style="margin-right: 0.5rem;">${surveyData.tree_measured_value}cm</span>`

    surveyData.need_cut_middle == true ?
        (v => {
            needText += `中`;
            needText += `,`;
        })() : "";
    surveyData.need_cut_branch == true ?
        (v => {
            needText += `枝`;
            needText += `,`;
        })() : "";

    surveyData.need_cut_divide == true ?
        (v => {
            needText += `玉`;
            needText += `,`;
        })() : "";

    surveyData.need_collect == true ?
        (v => {
            needText += `集`;
            needText += `,`;
        })() : "";

    surveyData.is_danger_tree == true ?
        (v => {
            needText += `危`;
            needText += `,`;
        })() : "";

    texts += `<span style="margin-right: 0.5rem;">${needText}</span>`;
    texts += '</li>';
    texts += '</a>';
    texts += '</div>';
    texts += '<div class="col s0.2 right" style="display:flex;">';
    if (countRows === 0) {
        texts += `<a class="new-history-data" onclick="newHistoryData('${surveyData.id}')" id="${surveyData.id}">`;
        texts += '<i style="color:#122344!important;font-size: 1.5em;" class="material-icons">expand_less</i>';
        texts += '</a>';
        texts += '</il>'
    } else {
        texts += `<a class="old-history-data" onclick="oldHistoryData('${surveyData.id}')" id="${surveyData.id}">`;
        texts += '<i style="color:#122344!important;font-size: 1.5em;" class="material-icons">expand_more</i>';
        texts += '</a>';
        texts += '</il>'
    }
    texts += '</div>';
    texts += '</td>';
    texts += '</tr>';
    return texts;
}

/**
 * 伐採木データ設定(モーダル)
 * @param 伐採木データ
 */
function initializeModalData() {
    // 担当者名
    $('#modal-name-modal').val();
    $('#modal-name').text();
    // 備考
    $('#modal-note-modal').val();
    $('#modal-note').text();
    // No
    $('#modal-color').val();
    $('#modal-word').val();
    $('#modal-number').val();
    $('#modal-branch-number').val();
    // 樹種
    $('#modalSurveyDataTreeType').text();
    $('#modalSurveyDataTreeType').val();
    // 直径
    $('#modal-survey-data-mesured-value').val();
    $('#modal-survey-data-mesured-value').text();
    // 伐採ロープ
    $('#modal-survey-data-need-rope').addClass("not-select");
    $('input[name="modal-survey-data-need-rope"]').val(false);
    // 伐採ワイヤー
    $('#modal-survey-data-need-wire').addClass("not-select");
    $('input[name="modal-survey-data-need-wire"]').val(false);
    //中断切ロープ有
    $('#modal-survey-data-need-cut-middle').addClass("not-select");
    $('input[name="modal-survey-data-need-cut-middle"]').val(false);
    // 中断切ロープ無
    $('#modal-survey-data-not-need-cut-middle').addClass("not-select");
    $('input[name="modal-survey-data-not-need-cut-middle"]').val(false);
    // 危険木
    $('#modal-survey-data-is-denger-tree').addClass("not-select");
    $('input[name="modal-survey-data-is-denger-tree"]').val(false);
    // 枝払い
    $('#modal-survey-data-need-cut-branch').addClass("not-select");
    $('input[name="modal-survey-data-need-cut-branch"]').val(false);
}

/**
 * 伐採木データ設定(モーダル)
 * @param 伐採木データ
 */
function setSurveyDataInModal(surveyData) {
    // 備考
    $('#modal-note-modal').val(surveyData.note);
    $('#modal-note').text(surveyData.note);
    // No
    $('#modal-color').val(surveyData.color);
    $('#modal-word').val(surveyData.word);
    $('#modal-number').val(surveyData.number);
    $('#modal-branch-number').val(surveyData.branch_number);
    setNoInModal(false);
    // 樹種
    $('#modal-' + surveyData.survey_data_tree_type).removeClass("not-select");
    $('#modalSurveyDataTreeType').text(surveyData.survey_data_tree_type);
    $('#modalSurveyDataTreeType').val(surveyData.survey_data_tree_type);
    setTreeTypeInModal(surveyData)
    // 直径
    $('#modal-survey-data-mesured-value').val(surveyData.tree_measured_value);
    $('#modal-survey-data-mesured-value').text(surveyData.tree_measured_value);
    // 伐採ロープ
    if (surveyData.need_rope === 'true') {
        $('#modal-survey-data-need-rope').removeClass('not-select');
        $('#modal-survey-data-need-rope').val(true);
    } else {
        $('#modal-survey-data-need-rope').addClass('not-select');
        $('#modal-survey-data-need-rope').val(false);
    }
    // 伐採ワイヤー
    if (surveyData.need_wire === 'true') {
        $('#modal-survey-data-need-wire').removeClass('not-select')
        $('#modal-survey-data-need-wire').val(true);
    } else {
        $('#modal-survey-data-need-wire').addClass('not-select')
        $('#modal-survey-data-need-wire').val(false);
    }
    // 中断切ロープ有
    if (surveyData.need_cut_middle === 'true') {
        $('#modal-survey-data-need-cut-middle').removeClass('not-select');
        $('#modal-survey-data-need-cut-middle').val(true);
    } else {
        $('#modal-survey-data-need-cut-middle').addClass('not-select');
        $('#modal-survey-data-need-cut-middle').val(false);
    }
    // 中断切ロープ無
    if (surveyData.not_need_cut_middle === 'true') {
        $('#modal-survey-data-not-need-cut-middle').removeClass('not-select');
        $('#modal-survey-data-not-need-cut-middle').val(true);
    } else {
        $('#modal-survey-data-not-need-cut-middle').addClass('not-select');
        $('#modal-survey-data-not-need-cut-middle').val(false);
    }
    // 危険木
    if (surveyData.is_danger_tree === 'true') {
        $('#modal-survey-data-is-denger-tree').removeClass('not-select');
        $('#modal-survey-data-is-denger-tree').val(true);
    } else {
        $('#modal-survey-data-is-denger-tree').addClass('not-select');
        $('.modal-survey-data-is-denger-tree').val(false);
    }
    // 枝払い
    if (surveyData.need_cut_branch === 'true') {
        $('#modal-survey-data-need-cut-branch').removeClass('not-select');
        $('#modal-survey-data-need-cut-branch').val(true);
    } else {
        $('#modal-survey-data-need-cut-branch').addClass('not-select');
        $('#modal-survey-data-need-cut-branch').val(false);
    }
}

/**
 * 伐採木データ設定
 * @param 伐採木データ
 */
async function modalSetData(id) {
    var surveyDetailList = await fetchSurveyDataBySurveyId(id);
    if (surveyDetailList.rows.length !== 0) {
        initializeModalData();
        setSurveyDataInModal(surveyDetailList.rows.item(0));
        //更新用に値を保持する
        $("#modal-id").val(surveyDetailList.rows.item(0).id);
        $('#history-modal').modal('open');
    }
}

/**
 * 伐採木データ設定
 * @param 伐採木データ
 */
function setSurveyData(surveyData) {
    // 担当者名
    $('#name-modal').val(surveyData.name);
    $('#name').text(surveyData.name);
    // 備考
    $('#note-modal').val(surveyData.note);
    $('#note').text(surveyData.note);
    // No
    $('#color').val(surveyData.color);
    $('#word').val(surveyData.word);
    $('#number').val(surveyData.number);
    $('#branch-number').val(surveyData.branch_number);
    setNo();
    // 樹種
    $('#' + surveyData.survey_data_tree_type).removeClass("not-select");
    $('#surveyDataTreeType').text(surveyData.survey_data_tree_type);
    $('#surveyDataTreeType').val(surveyData.survey_data_tree_type);
    setTreeType(surveyData)
    // 直径
    $('#survey-data-mesured-value').val(surveyData.tree_measured_value);
    $('#survey-data-mesured-value').text(surveyData.tree_measured_value);
    // 伐採ロープ
    if (surveyData.need_rope === 'true') {
        $("#survey-data-need-rope").removeClass("not-select");
        $('input[name="survey-data-need-rope"]').val(true);
    } else {
        $("#survey-data-need-wire").addClass('not-select');
        $('input[name="survey-data-need-rope"]').val(false);
    }
    // 伐採ワイヤー
    if (surveyData.need_wire === 'true') {
        $("#survey-data-need-wire").removeClass('not-select');
        $('input[name="survey-data-need-wire"]').val(true);
    } else {
        $("#survey-data-need-wire").addClass('not-select');
        $('input[name="survey-data-need-wire"]').val(false);
    }
    // 中断切ロープ有
    if (surveyData.need_cut_middle === 'true') {
        $("#survey-data-need-cut-middle").removeClass('not-select');
        $('input[name="survey-data-need-cut-middle"]').val(true);
    } else {
        $("#survey-data-need-cut-middle").addClass('not-select');
        $('input[name="survey-data-need-cut-middle"]').val(false);
    }
    // 中断切ロープ無
    if (surveyData.not_need_cut_middle === 'true') {
        $("#survey-data-not-need-cut-middle").removeClass('not-select');
        $('input[name="survey-data-not-need-cut-middle"]').val(true);
    } else {
        $("#survey-data-not-need-cut-middle").addClass('not-select');
        $('input[name="survey-data-not-need-cut-middle"]').val(false);
    }
    // 危険木
    if (surveyData.is_danger_tree === 'true') {
        $("#survey-data-is-denger-tree").removeClass('not-select');
        $('input[name="survey-data-is-denger-tree"]').val(true);
    } else {
        $("#survey-data-is-denger-tree").addClass('not-select');
        $('input[name="survey-data-is-denger-tree"]').val(false);
    }
    // 枝払い
    if (surveyData.need_cut_branch === 'true') {
        $("#survey-data-need-cut-branch").removeClass('not-select');
        $('input[name="survey-data-need-cut-branch"]').val(true);
    } else {
        $("#survey-data-need-cut-branch").addClass('not-select');
        $('input[name="survey-data-need-cut-branch"]').val(false);
    }
}

/**
 * Noの表示設定
 */
function setNo() {
    var color = $('#color').val();
    var word = $('#word').val();
    var number = $('#number').val();
    var branchNumber = $('#branch-number').val();
    var no = "";
    if (color != "") {
        no += color + "-";
    }
    if (word != "") {
        no += word + "-";
    }
    if (number != "") {
        no += number + "-";
    }
    no += branchNumber;
    $('#survey-data-no').text(no);
}

/**
 * Noの表示設定(モーダル内)
 */
function setNoInModal(initfFag) {
    var color = $('#modal-color').val();
    var word = $('#modal-word').val();
    var number = $('#modal-number').val();
    var branchNumber = $('#modal-branch-number').val();
    var no = "";
    if (color != "") {
        no += color + "-";
    }
    if (word != "") {
        no += word + "-";
    }
    if (number != "") {
        no += number + "-";
    }
    no += branchNumber;
    $('#modal-survey-data-no').text(no);
    if (initfFag === 'true') {
        $('#modal-number-target-modal').modal('close');
    }
}

/**
 * 樹種の表示設定
 */
function setTreeType(surveyData) {
    if (surveyData.survey_data_tree_type !== null) {
        $('#surveyDataTreeType').text(surveyData.survey_data_tree_type);
        $('#surveyDataTreeType').val(surveyData.survey_data_tree_type);
        //選択ボタンを押下状態にする
        inputTreeType("#surveyDataTreeType", surveyData.survey_data_tree_type)
    }
}

/**
 * 樹種の表示設定
 */
function setTreeTypeInModal(surveyData) {
    if (surveyData.survey_data_tree_type !== null) {
        $('#modalSurveyDataTreeType').text(surveyData.survey_data_tree_type);
        $('#modalSurveyDataTreeType').val(surveyData.survey_data_tree_type);
        //選択ボタンを押下状態にする
        inputTreeTypeInModal("#modalSurveyDataTreeType", 'modal-' + surveyData.survey_data_tree_type)
    }
}

/**
 * 備考の表示設定
 */
function setNote() {
    $('#note').text($('#note-modal').val());
}

/**
 * 備考の表示設定
 */
function setNoteInModal() {
    $('#modal-note').text($('#modal-note-modal').val());
    $('#modal-note-target-modal').modal('close');
}

/**
 * 担当者名の表示設定
 */
function setName() {
    $('#name').text($('#name-modal').val());
}


/**
 * 【expand_less】の矢印を押下したとき（最新の履歴を取得）
 */
async function newHistoryData(newId) {
    var texts = "";
    var tbTexts = "";
    var surveyDetailList = await fetchSurveyNewDataBySurveyId(newId);
    var surveyHistoryItem = $('#history-list-contents');
    var historyTrItem = $('#history-list-data');
    //一番古いIDが同じIDならばアラートを出力する
    if (surveyDetailList.rows.length == 1) {
        alert('今表示している履歴データより最新の履歴データはありませんでした！');
    } else {
        tbTexts = '<table id="history-list-contents" style="width:100%;table-layout:fixed;">';
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            var rowNum = surveyDetailList.rows.item(i).num;
            var id = surveyDetailList.rows.item(i).id;
        }
        var surveyDetailNewList = await fetchSurveyNewDataBySurveyIdByrowNum(newId, rowNum);

        for (var i = 0; i < surveyDetailNewList.rows.length; i++) {
            texts = setSurveyHistoryData(texts, surveyDetailNewList.rows.item(i), i);
        }
        tbTexts = tbTexts + texts;
        tbTexts = tbTexts + '</table>'
        surveyHistoryItem.remove();
        historyTrItem.append(tbTexts);
    }
};

/**
 * 【expand_more】の矢印を押下したとき（最新の履歴を取得）
 */
async function oldHistoryData(oldId) {
    var texts = "";
    var tbTexts = "";
    var surveyDetailList = await fetchSurveyOldDataBySurveyId(oldId);
    var surveyHistoryItem = $('#history-list-contents');
    var historyTrItem = $('#history-list-data');
    //一番古いIDが同じIDならばアラートを出力する
    if (surveyDetailList.rows.length == 1) {
        alert('今表示している履歴データより過去の履歴データはありませんでした！');
    } else {
        tbTexts = '<table id="history-list-contents" style="width:100%;table-layout:fixed;">';
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            texts = setSurveyHistoryData(texts, surveyDetailList.rows.item(i), i);
        }
        tbTexts = tbTexts + texts;
        tbTexts = tbTexts + '</table>'
        surveyHistoryItem.remove();
        historyTrItem.append(tbTexts);
    }
};

/**
 * 直径変更
 */
$("[id^=tree-measured-value-]").on('touchstart', function () {
    var number = $(this).attr("id").replace('tree-measured-value-', "");
    number == 'none' ?
        (v => {
            $('#survey-data-mesured-value').text('');
            $('#survey-data-mesured-value').val('');
        })() :
        (v => {
            applyMesuredValueOfNumericKeypad(number);
        })();
});

/**
 * 直径変更(モーダル内)
 */
$("[id^=modal-tree-measured-value-]").on('touchstart', function () {
    var number = $(this).attr("id").replace('modal-tree-measured-value-', "");
    alert(number)
    number == 'none' ?
        (v => {
            $('#modal-survey-data-mesured-value').text('');
            $('#modal-survey-data-mesured-value').val('');
        })() :
        (v => {
            applyMesuredValueOfNumericKeypadInModal(number);
        })();
});

/**
 * 伐採木データ作成および更新
 */
async function createEditSurveyData() {
    try {
        if (validate() == false) {
            $("#error").get(0).play();
            return;
        }
        createSurveyData();
        let count = await editSurveyTrimmingTreeCount();
        soundMessage(count);
        M.toast({ html: '登録しました！', displayLength: 2000 });
        initializeForm();
    } catch (e) {
        alert(e)
    }

}

/**
 * 伐採木データ作成および更新(履歴データから)
 */
async function createEditSurveyDataInModal() {
    if (validateInModal() == false) {
        $("#error").get(0).play();
        return;
    }
    try {
        var result = await createSurveyDataInModal();
        let count = await editSurveyTrimmingTreeCount();
        soundMessage(count);
        M.toast({ html: '更新しました！', displayLength: 2000 });

        //画面の履歴を初期化
        var texts = "";
        var tbTexts = "";
        var surveyHistoryItem = $('#history-list-contents');
        var historyTrItem = $('#history-list-data');
        tbTexts = '<table id="history-list-contents" style="width:100%;table-layout:fixed;">';
        var suveyDetailId = $("#modal-survey-detail-id").val();
        var surveyDetailNewList = await fetchSurveyDataBySurveyDetailId(suveyDetailId);

        for (var i = 0; i < surveyDetailNewList.rows.length; i++) {
            texts = setSurveyHistoryData(texts, surveyDetailNewList.rows.item(i), i);
        }
        tbTexts = tbTexts + texts;
        tbTexts = tbTexts + '</table>'
        surveyHistoryItem.remove();
        historyTrItem.append(tbTexts);
    } catch (e) {
        alert(e)
        $("#error").get(0).play();
        return;
    }
}


/**
 * 登録本数により音声を流す
 * @param {*} count 登録本数
 */
function soundMessage(count) {
    if (count == 100) {
        $("#submit-100").get(0).play();
    } else if (count == 300) {
        $("#submit-300").get(0).play();
    } else if (count == 500) {
        $("#submit-500").get(0).play();
    } else if (count == 1000) {
        $("#submit-1000").get(0).play();
    } else if (count == 10000) {
        $("#submit-10000").get(0).play();
    } else {
        $("#submit").get(0).play();
    }
}

/**
 * 入力チェック
 */
function validate() {
    var result = true;
    // Noチェック
    if ($('#survey-data-no').text() === '' || $('#number').val() === '') {
        alert("申し訳ございません。\r\n連番の入力は必須です。連番を入力してください。");
        result = false;
    }
    // Noの数字チェック
    if (result) {
        if (!$('#number').val().match(/^\d+$/)) {
            alert("申し訳ございません。\r\n連番は半角数字のみ有効です。半角数字のみ入力してください。");
            result = false;
        }
    }
    // 樹種チェック
    if (result) {
        if ($('#surveyDataTreeType').val() === '') {
            alert("申し訳ございません。\r\n樹種の入力は必須です。樹種を入力してください。");
            result = false;
        }
    }
    // 直径チェック
    if (result) {
        if ($('#survey-data-mesured-value').val === '') {
            alert("申し訳ございません。\r\n直径の入力は必須です。直径を入力してください。");
            result = false;
        }
    }
    if (result) {
        if ($('#survey-data-mesured-value').val === 0) {
            alert("申し訳ございません。\r\n直径は0以上で入力してください。");
            result = false;
        }
    }
    // 直径の桁数チェック
    if (result) {
        if (Number($('#survey-data-mesured-value').val) >= 1000) {
            alert("申し訳ございません。\r\n直径は1000以上は登録できません。1000未満で入力してください。");
            result = false;
        }
    }
    return result;
}

/**
 * 入力チェック(モーダル内)
 */
function validateInModal() {
    var result = true;
    // Noチェック
    if ($('#modal-survey-data-no').text() === '' || $('#modal-number').val() === '') {
        alert("申し訳ございません。\r\n連番の入力は必須です。連番を入力してください。");
        result = false;
    }
    // Noの数字チェック
    if (result) {
        if (!$('#modal-number').val().match(/^\d+$/)) {
            alert("申し訳ございません。\r\n連番は半角数字のみ有効です。半角数字のみ入力してください。");
            result = false;
        }
    }
    // 樹種チェック
    if (result) {
        if ($('#modalSurveyDataTreeType').val() === '') {
            alert("申し訳ございません。\r\n樹種の入力は必須です。樹種を入力してください。");
            result = false;
        }
    }
    // 直径チェック
    if (result) {
        if ($('#modal-survey-data-mesured-value').val === '') {
            alert("申し訳ございません。\r\n直径の入力は必須です。直径を入力してください。");
            result = false;
        }
    }
    if (result) {
        if ($('#modal-survey-data-mesured-value').val === 0) {
            alert("申し訳ございません。\r\n直径は0以上で入力してください。");
            result = false;
        }
    }
    // 直径の桁数チェック
    if (result) {
        if (Number($('#modal-survey-data-mesured-value').val) >= 1000) {
            alert("申し訳ございません。\r\n直径は1000以上は登録できません。1000未満で入力してください。");
            result = false;
        }
    }
    return result;
}



/**
 * 伐採木データ作成
 */
async function createSurveyData() {
    var param = [
        surveyDetailId,
        generateIdentifyCode(uuid),
        surveyCompanyId,
        $('#name-modal').val(),
        $('#color').val(),
        $('#word').val(),
        $('#number').val(),
        $('#branch-number').val(),
        $('#surveyDataTreeType').val(),
        $('#survey-data-mesured-value').val(),
        $('input[name="survey-data-need-rope"]').val(),
        $('input[name="survey-data-need-wire"]').val(),
        $('input[name="survey-data-need-cut-middle"]').val(),
        $('input[name="survey-data-need-cut-middle"]').val() ? false : true,
        $('input[name="survey-data-is-denger-tree"]').val(),
        $('input[name="survey-data-need-cut-branch"]').val(),
        $('#note-modal').val(),
        false,
        'off',
        fetchUserId(),
        fetchUserId()
    ];

    insertSurveyData(param);
}

/**
 * 伐採木データ作成(モーダル)
 */
async function createSurveyDataInModal() {
    var id = $('#modal-id').val();
    var param = [
        $('#modal-color').val(),
        $('#modal-word').val(),
        $('#modal-number').val(),
        $('#modal-branch-number').val(),
        $('#modalSurveyDataTreeType').val(),
        $('#modal-survey-data-mesured-value').val(),
        $('input[name="modal-survey-data-need-rope"]').val(),
        $('input[name="modal-survey-data-need-wire"]').val(),
        $('input[name="modal-survey-data-need-cut-middle"]').val(),
        $('input[name="modal-survey-data-need-cut-middle"]').val() ? false : true,
        $('input[name="modal-survey-data-is-denger-tree"]').val(),
        $('input[name="modal-survey-data-need-cut-branch"]').val(),
        $('#modal-note-modal').val(),
        id,
        id
    ];
    var result = updateSurveyDataByIdInModal(param);
    return result;
}

/**
 * 伐採木データ本数更新
 */
async function editSurveyTrimmingTreeCount() {
    var surveyDataCount = await fetchNotDeleteSurveyDataCount(surveyDetailId);
    updateSurveyDataTrimmingTreeCount(surveyDataCount, surveyDetailId);
    return surveyDataCount;
}

$(".enter").on('touchstart', function () {
    $("#input").get(0).play();
});

async function fetchTreeTypeCount(treeTypes, specialTree, surveyDetailId) {
    if (treeTypes) {
        var treeTypesCount = {};
        var arrayTreeTypes = treeTypes.split(',');
        for (let i in arrayTreeTypes) {
            var count = await fetchTypeMeasuredValueByTreeType(surveyDetailId, arrayTreeTypes[i]);
            treeTypesCount[arrayTreeTypes[i]] = count.rows.item(0).count;
        }
    }
    if (specialTree) {
        var arraySpecialTreeTypes = specialTree.split(',');
        for (let i in arraySpecialTreeTypes) {
            var count = await fetchTypeMeasuredValueByTreeType(surveyDetailId, arraySpecialTreeTypes[i]);
            treeTypesCount[arraySpecialTreeTypes[i]] = count.rows.item(0).count;
        }
    }
    return treeTypesCount;
}

/**
 * 伐採方法ボタンをタップした際に、not-selectedクラスを削除する
 * @param 伐採方法ボタンID
 */
function setSurveyMethod(surveyMethod) {
    if ($('#' + surveyMethod).hasClass("not-select")) {
        $('#' + surveyMethod).removeClass("not-select");
        $(`input[name="${surveyMethod}"]`).val(true);
    } else {
        $('#' + surveyMethod).addClass("not-select");
        $(`input[name="${surveyMethod}"]`).val(false);
    }
}

/**
 * 伐採方法ボタンをタップした際に、not-selectedクラスを削除する(モーダル内)
 * @param 伐採方法ボタンID
 */
function setSurveyMethodInModal(surveyMethod) {
    if ($('#' + surveyMethod).hasClass("not-select")) {
        $('#' + surveyMethod).removeClass("not-select");
        $(`input[name="${surveyMethod}"]`).val(true);
    } else {
        $('#' + surveyMethod).addClass("not-select");
        $(`input[name="${surveyMethod}"]`).val(false);
    }
}

/**
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テーブル形式の場合）
 * @param 直径ID
 * @param 直径
 */
function applyMesuredValueOfTableKeypad(mesuredValueId, value) {
    $('.circle').removeClass("checked");
    $(mesuredValueId).addClass("checked");
    $('#survey-data-mesured-value').text(value);
    $('#survey-data-mesured-value').val(value);
}


/**
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テーブル形式の場合）(モーダル内)
 * @param 直径ID
 * @param 直径
 */
function applyMesuredValueOfTableKeypadInModal(mesuredValueId, value) {
    $('.modal-circle').removeClass("checked");
    $(mesuredValueId).addClass("checked");
    $('#modal-survey-data-mesured-value').text(value);
    $('#modal-survey-data-mesured-value').val(value);
}

/**
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テンキー形式の場合）
 * @param {*} value 設定する直径
 */
function applyMesuredValueOfNumericKeypad(value) {
    if ($('#survey-data-mesured-value').val == '0') {
        $('#survey-data-mesured-value').val = '';
    }
    value = $('#survey-data-mesured-value').val() + value
    $('#survey-data-mesured-value').text(value);
    $('#survey-data-mesured-value').val(value);
}

/**
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テンキー形式の場合）(モーダル内)
 * @param {*} value 設定する直径
 */
function applyMesuredValueOfNumericKeypadInModal(value) {
    if ($('#modal-survey-data-mesured-value').val == '0') {
        $('#modal-survey-data-mesured-value').val = '';
    }
    value = $('#modal-survey-data-mesured-value').val() + value
    $('#modal-survey-data-mesured-value').text(value);
    $('#modal-survey-data-mesured-value').val(value);
}

/**
 * 直径入力欄をテンキーかテーブル形式か変換する
 */
function changeKeyPad() {
    if ($('#key-pad-type').val() === 'table-keypad') {
        $('#table-keypad').hide();
        $('#numeric-keypad').show();
        $('#key-pad-type').val('numeric-keypad');
    } else {
        $('#numeric-keypad').hide();
        $('#table-keypad').show();
        $('#key-pad-type').val('table-keypad');
    }
}

/**
 * 直径入力欄をテンキーかテーブル形式か変換する(モーダル内)
 */
function changeKeyPadInModal() {
    if ($('#modal-key-pad-type').val() === "table-keypad") {
        $('#modal-table-keypad').hide();
        $('#modal-numeric-keypad').show();
        $('#modal-key-pad-type').val('numeric-keypad');
    } else {
        $('#modal-numeric-keypad').hide();
        $('#modal-table-keypad').show();
        $('#modal-key-pad-type').val('table-keypad');
    }
}
