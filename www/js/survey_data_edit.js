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
    setTreeTypeButtonInModal1(treeTypeValue, specialTree, "ModalTreeType1");
    setTreeTypeButtonInModal2(treeTypeValue, specialTree, "ModalTreeType2");
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
                texts = setSurveyHistoryData(texts, surveyDetailList.rows.item(i), surveyId, surveyDetailId, i);
            }
        })();
    surveyHistoryItem.append(texts);
    //初期表示
    var surveyData = await fetchNewSurveyHistoryDataById(id);
    if (surveyData != undefined) {
        setSurveyData(surveyData);

    }
    for (var i = 0; i < surveyDetailList.rows.length; i++) {
        setSurveyDataInModal(surveyDetailList.rows.item(i), i);
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
function setSurveyHistoryData(texts, surveyData, surveyId, surveyDetailId, countRows) {
    var needText = "";
    texts += '<tr id="historyTr" style="border:1px solid #e3e3e3!important;">';
    texts += '<td>';
    texts += '<div class="col s0.2" style="display:flex;">';
    if (countRows === 0) {
        texts += `<a href="#1history-modal" class="modal-trigger waves-effect waves-light enter mobile-floating" style="display:flex;" val= "../html/survey_data_edit.html?${surveyId}&${surveyData.id}&${surveyDetailId}>`;
    } else {
        texts += `<a href="#2history-modal" class="modal-trigger waves-effect waves-light enter mobile-floating" style="display:flex;" val= "../html/survey_data_edit.html?${surveyId}&${surveyData.id}&${surveyDetailId}>`;
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
        texts += '<il style="color:#122344!important;display:flex;">';
        texts += `<a class="new-history-data" id="${surveyData.id}">`;
        texts += '<i style="color:#122344!important;font-size: 1.5em;" class="material-icons">expand_less</i>';
        texts += '</a>';
        texts += '</il>'
    } else {
        texts += '<il style="color:#122344!important;display:flex;">';
        texts += `<a class="old-history-data" id="${surveyData.id}">`;
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
function setSurveyDataInModal(surveyData, rowsnum) {
    if (rowsnum === 0) {
        // 担当者名
        $('#1modal-name-modal').val(surveyData.name);
        $('#1modal-name').text(surveyData.name);
        // 備考
        $('#1modal-note-modal').val(surveyData.note);
        $('#1modal-note').text(surveyData.note);
        // No
        $('#1modal-color').val(surveyData.color);
        $('#1modal-word').val(surveyData.word);
        $('#1modal-number').val(surveyData.number + 1);
        $('#1modal-branch-number').val(surveyData.branch_number);
        setNoInModal1();
        // 樹種
        $('#1modal' + surveyData.survey_data_tree_type).removeClass("not-select");
        $('#surveyDataTreeTypeInModal1').text(surveyData.survey_data_tree_type);
        $('#surveyDataTreeTypeInModal1').val(surveyData.survey_data_tree_type);
        setTreeTypeInModal1(surveyData)
        // 直径
        $('#1modal-survey-data-mesured-value').val(surveyData.tree_measured_value);
        $('#1modal-survey-data-mesured-value').text(surveyData.tree_measured_value);
        // 伐採ロープ
        if (surveyData.need_rope == 'true') {
            $('#1modal-survey-data-need-rope').removeClass("hidden");
            $('input[name="1modal-survey-data-need-rope"]').val(true);
        } else {
            $('#1modal-survey-data-need-rope').addClass("hidden");
            $('input[name="1modal-survey-data-need-rope"]').val(false);
        }
        // 伐採ワイヤー
        if (surveyData.need_wire == 'true') {
            $('#1modal-survey-data-need-wire').removeClass("hidden");
            $('input[name="1modal-survey-data-need-wire"]').val(true);
        } else {
            $('#1modal-survey-data-need-wire').addClass("hidden");
            $('input[name="1modal-survey-data-need-wire"]').val(false);
        }
        // 中断切ロープ有
        if (surveyData.need_cut_middle == 'true') {
            $('#1modal-survey-data-need-cut-middle').removeClass("hidden");
            $('input[name="1modal-survey-data-need-cut-middle"]').val(true);
        } else {
            $('#1modal-survey-data-need-cut-middle').addClass("hidden");
            $('input[name="1modal-survey-data-need-cut-middle"]').val(false);
        }
        // 中断切ロープ無
        if (surveyData.not_need_cut_middle == 'true') {
            $('#1modal-survey-data-not-need-cut-middle').removeClass("hidden");
            $('input[name="1modal-survey-data-not-need-cut-middle"]').val(true);
        } else {
            $('#1modal-survey-data-not-need-cut-middle').addClass("hidden");
            $('input[name="1modal-survey-data-not-need-cut-middle"]').val(false);
        }
        // 危険木
        if (surveyData.is_danger_tree == 'true') {
            $('#1modal-survey-data-is-denger-tree').removeClass("hidden");
            $('input[name="1modal-survey-data-is-denger-tree"]').val(true);
        } else {
            $('#1modal-survey-data-is-denger-tree').addClass("hidden");
            $('input[name="1modal-survey-data-is-denger-tree"]').val(false);
        }
        // 枝払い
        if (surveyData.need_cut_branch == 'true') {
            $('#1modal-survey-data-need-cut-branch').removeClass("hidden");
            $('input[name="1modal-survey-data-need-cut-branch"]').val(true);
        } else {
            $('#1modal-survey-data-need-cut-branch').addClass("hidden");
            $('input[name="1modal-survey-data-need-cut-branch"]').val(false);
        }
        // 玉切り
        if (surveyData.need_cut_divide == 'true') {
            $('#1modal-survey-data-need-cut-divide').removeClass("hidden");
            $('input[name="1modal-survey-data-need-cut-divide"]').val(true);
        } else {
            $('#1modal-survey-data-need-cut-divide').addClass("hidden");
            $('input[name="1modal-survey-data-need-cut-divide"]').val(false);
        }
        // 集積
        if (surveyData.need_collect == 'true') {
            $('#1modal-survey-data-need-collect').removeClass("hidden");
            $('input[name="1modal-survey-data-need-collect"]').val(true);
        } else {
            $('#1modal-survey-data-need-collect').addClass("checked", false);
        }
    } else {
        // 担当者名
        $('#2modal-name-modal').val(surveyData.name);
        $('#2modal-name').text(surveyData.name);
        // 備考
        $('#2modal-note-modal').val(surveyData.note);
        $('#2modal-note').text(surveyData.note);
        // No
        $('#2modal-color').val(surveyData.color);
        $('#2modal-word').val(surveyData.word);
        $('#2modal-number').val(surveyData.number + 1);
        $('#2modal-branch-number').val(surveyData.branch_number);
        setNoInModal2();
        // 樹種
        $('#2modal' + surveyData.survey_data_tree_type).removeClass("not-select");
        $('#surveyDataTreeTypeInModal2').text(surveyData.survey_data_tree_type);
        $('#surveyDataTreeTypeInModal2').val(surveyData.survey_data_tree_type);
        setTreeTypeInModal2(surveyData)
        // 直径
        $('#2modal-survey-data-mesured-value').val(surveyData.tree_measured_value);
        $('#2modal-survey-data-mesured-value').text(surveyData.tree_measured_value);
        // 伐採ロープ
        if (surveyData.need_rope == 'true') {
            $('#2modal-survey-data-need-rope').removeClass("hidden");
            $('input[name="2modal-survey-data-need-rope"]').val(true);
        } else {
            $('#2modal-survey-data-need-rope').addClass("hidden");
            $('input[name="2modal-survey-data-need-rope"]').val(false);
        }
        // 伐採ワイヤー
        if (surveyData.need_wire == 'true') {
            $('#2modal-survey-data-need-wire').removeClass("hidden");
            $('input[name="2modal-survey-data-need-wire"]').val(true);
        } else {
            $('#2modal-survey-data-need-wire').addClass("hidden");
            $('input[name="2modal-survey-data-need-wire"]').val(false);
        }
        // 中断切ロープ有
        if (surveyData.need_cut_middle == 'true') {
            $('#2modal-survey-data-need-cut-middle').removeClass("hidden");
            $('input[name="2modal-survey-data-need-cut-middle"]').val(true);
        } else {
            $('#2modal-survey-data-need-cut-middle').addClass("hidden");
            $('input[name="2modal-survey-data-need-cut-middle"]').val(false);
        }
        // 中断切ロープ無
        if (surveyData.not_need_cut_middle == 'true') {
            $('#2modal-survey-data-not-need-cut-middle').removeClass("hidden");
            $('input[name="2modal-survey-data-not-need-cut-middle"]').val(true);
        } else {
            $('#2modal-survey-data-not-need-cut-middle').addClass("hidden");
            $('input[name="2modal-survey-data-not-need-cut-middle"]').val(false);
        }
        // 危険木
        if (surveyData.is_danger_tree == 'true') {
            $('#2modal-survey-data-is-denger-tree').removeClass("hidden");
            $('input[name="2modal-survey-data-is-denger-tree"]').val(true);
        } else {
            $('#2modal-survey-data-is-denger-tree').addClass("hidden");
            $('input[name="2modal-survey-data-is-denger-tree"]').val(false);
        }
        // 枝払い
        if (surveyData.need_cut_branch == 'true') {
            $('#2modal-survey-data-need-cut-branch').removeClass("hidden");
            $('input[name="2modal-survey-data-need-cut-branch"]').val(true);
        } else {
            $('#2modal-survey-data-need-cut-branch').addClass("hidden");
            $('input[name="2modal-survey-data-need-cut-branch"]').val(false);
        }
        // 玉切り
        if (surveyData.need_cut_divide == 'true') {
            $('#2modal-survey-data-need-cut-divide').removeClass("hidden");
            $('input[name="2modal-survey-data-need-cut-divide"]').val(true);
        } else {
            $('#2modal-survey-data-need-cut-divide').addClass("hidden");
            $('input[name="2modal-survey-data-need-cut-divide"]').val(false);
        }
        // 集積
        if (surveyData.need_collect == 'true') {
            $('#2modal-survey-data-need-collect').removeClass("hidden");
            $('input[name="2modal-survey-data-need-collect"]').val(true);
        } else {
            $('#2modal-survey-data-need-collect').addClass("checked", false);
        }
    }

}
/**
 * 伐採木データ設定
 * @param 伐採木データ
 */
function setSurveyData(surveyData) {
    //id
    $('#survey-data-id').val(surveyData.id);
    // 担当者名
    $('#name-modal').val(surveyData.name);
    $('#name').text(surveyData.name);
    // 備考
    $('#note-modal').val(surveyData.note);
    $('#note').text(surveyData.note);
    // No
    $('#color').val(surveyData.color);
    $('#word').val(surveyData.word);
    $('#number').val(surveyData.number + 1);
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
    if (surveyData.need_rope == 'true') {
        $('#survey-data-need-rope').removeClass("hidden");
        $('input[name="survey-data-need-rope"]').val(true);
    } else {
        $('#survey-data-need-rope').addClass("hidden");
        $('input[name="survey-data-need-rope"]').val(false);
    }
    // 伐採ワイヤー
    if (surveyData.need_wire == 'true') {
        $('#survey-data-need-wire').removeClass("hidden");
        $('input[name="survey-data-need-wire"]').val(true);
    } else {
        $('#survey-data-need-wire').addClass("hidden");
        $('input[name="survey-data-need-wire"]').val(false);
    }
    // 中断切ロープ有
    if (surveyData.need_cut_middle == 'true') {
        $('#survey-data-need-cut-middle').removeClass("hidden");
        $('input[name="survey-data-need-cut-middle"]').val(true);
    } else {
        $('#survey-data-need-cut-middle').addClass("hidden");
        $('input[name="survey-data-need-cut-middle"]').val(false);
    }
    // 中断切ロープ無
    if (surveyData.not_need_cut_middle == 'true') {
        $('#survey-data-not-need-cut-middle').removeClass("hidden");
        $('input[name="survey-data-not-need-cut-middle"]').val(true);
    } else {
        $('#survey-data-not-need-cut-middle').addClass("hidden");
        $('input[name="survey-data-not-need-cut-middle"]').val(false);
    }
    // 危険木
    if (surveyData.is_danger_tree == 'true') {
        $('#survey-data-is-denger-tree').removeClass("hidden");
        $('input[name="survey-data-is-denger-tree"]').val(true);
    } else {
        $('#survey-data-is-denger-tree').addClass("hidden");
        $('input[name="survey-data-is-denger-tree"]').val(false);
    }
    // 枝払い
    if (surveyData.need_cut_branch == 'true') {
        $('#survey-data-need-cut-branch').removeClass("hidden");
        $('input[name="survey-data-need-cut-branch"]').val(true);
    } else {
        $('#survey-data-need-cut-branch').addClass("hidden");
        $('input[name="survey-data-need-cut-branch"]').val(false);
    }
    // 玉切り
    if (surveyData.need_cut_divide == 'true') {
        $('#survey-data-need-cut-divide').removeClass("hidden");
        $('input[name="survey-data-need-cut-divide"]').val(true);
    } else {
        $('#survey-data-need-cut-divide').addClass("hidden");
        $('input[name="survey-data-need-cut-divide"]').val(false);
    }
    // 集積
    if (surveyData.need_collect == 'true') {
        $('#survey-data-need-collect').removeClass("hidden");
        $('input[name="survey-data-need-collect"]').val(true);
    } else {
        $('#survey-data-need-collect').addClass("checked", false);
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
function setNoInModal1() {
    var color = $('#1modal-color').val();
    var word = $('#1modal-word').val();
    var number = $('#1modal-number').val();
    var branchNumber = $('#1modal-branch-number').val();
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
    $('#1modal-survey-data-no').text(no);
}

/**
 * Noの表示設定(モーダル内)
 */
function setNoInModal2() {
    var color = $('#2modal-color').val();
    var word = $('#2modal-word').val();
    var number = $('#2modal-number').val();
    var branchNumber = $('#2modal-branch-number').val();
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
    $('#2modal-survey-data-no').text(no);
}

/**
 * 樹種の表示設定
 */
function setTreeType(surveyData) {
    if (surveyData.survey_data_tree_type !== null) {
        $('#surveyDataTreeType').text(surveyData.survey_data_tree_type);
        $('#surveyDataTreeType').val(surveyData.survey_data_tree_type);
        //選択ボタンを押下状態にする
        inputTreeType("survey-area-tree-type", surveyData.survey_data_tree_type)
    }
}

/**
 * 樹種の表示設定(モーダル)
 */
function setTreeTypeInModal1(surveyData) {
    if (surveyData.survey_data_tree_type !== null) {
        $('#ModalTreeType1').text(surveyData.survey_data_tree_type);
        $('#ModalTreeType1').val(surveyData.survey_data_tree_type);
        //選択ボタンを押下状態にする
        inputTreeTypeInModal1("ModalTreeType1", surveyData.survey_data_tree_type)
    }
}

/**
 * 樹種の表示設定(モーダル)
 */
function setTreeTypeInModal2(surveyData) {
    if (surveyData.survey_data_tree_type !== null) {
        $('#ModalTreeType2').text(surveyData.survey_data_tree_type);
        $('#ModalTreeType2').val(surveyData.survey_data_tree_type);
        //選択ボタンを押下状態にする
        inputTreeTypeInModal2("ModalTreeType2", surveyData.survey_data_tree_type)
    }
}

/**
 * 備考の表示設定
 */
function setNote() {
    $('#note').text($('#note-modal').val());
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
$(".new-history-data").on('touchstart', async function () {
    var newId = $(this).attr("id");
    var surveyDetailList = await fetchSurveyNewDataBySurveyId(newId);
    var surveyHistoryItem = $('#history-list-contents');
    var historyTrItem = $('#historyTr');
    //一番新しいIDが同じIDならばアラートを出力する
    if (surveyDetailList.rows.length == 0) {
        alert('今表示している履歴データより最新の履歴データはありませんでした！');
    } else {
        surveyHistoryItem.removeChild(historyTrItem);
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            texts = setSurveyHistoryData(texts, surveyDetailList.rows.item(i), surveyId, surveyDetailId, i);
        }
        surveyHistoryItem.append(texts);
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            setSurveyDataInModal(surveyDetailList.rows.item(i), i);
        }
    }
});


/**
 * 【expand_more】の矢印を押下したとき（最新の履歴を取得）
 */
$(".old-history-data").on('touchstart', async function () {
    var oldId = $(this).attr("id");
    var surveyDetailList = await fetchSurveyOldDataBySurveyId(oldId);
    var surveyHistoryItem = $('#history-list-contents');
    var historyTrItem = $('#historyTr');
    //一番古いIDが同じIDならばアラートを出力する
    if (surveyDetailList.rows.length == 0) {
        alert('今表示している履歴データより過去の履歴データはありませんでした！');
    } else {
        surveyHistoryItem.removeChild(historyTrItem);
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            texts = setSurveyHistoryData(texts, surveyDetailList.rows.item(i), surveyId, surveyDetailId, i);
        }
        surveyHistoryItem.append(texts);
        for (var i = 0; i < surveyDetailList.rows.length; i++) {
            setSurveyDataInModal(surveyDetailList.rows.item(i), i);
        }
    }
});

/**
 * 伐採時の備考（伐採ロープ有り）設定
 */
$(".survey-data-need-rope").on('touchstart', function () {
    if ($("#survey-data-need-rope").hasClass('hidden')) {
        $("#survey-data-need-rope").removeClass('hidden');
        $('input[name="survey-data-need-rope"]').val(true);
    } else {
        $("#survey-data-need-rope").addClass('hidden');
        $('input[name="survey-data-need-rope"]').val(false);
    }
});

/**
 * 伐採時の備考（伐採ワイヤー有り）設定
 */
$(".survey-data-need-wire").on('touchstart', function () {
    if ($("#survey-data-need-wire").hasClass('hidden')) {
        $("#survey-data-need-wire").removeClass('hidden');
        $('input[name="survey-data-need-wire"]').val(true);
    } else {
        $("#survey-data-need-wire").addClass('hidden');
        $('input[name="survey-data-need-wire"]').val(false);
    }
});

/**
 * 伐採時の備考（中断切りロープ有り）設定
 */
$(".survey-data-need-cut-middle").on('touchstart', function () {
    if ($("#survey-data-need-cut-middle").hasClass('hidden')) {
        $("#survey-data-need-cut-middle").removeClass('hidden');
        $('input[name="survey-data-need-cut-middle"]').val(true);
    } else {
        $("#survey-data-need-cut-middle").addClass('hidden');
        $('input[name="survey-data-need-cut-middle"]').val(false);
    }
});

/**
 * 伐採時の備考（中断切りロープ無し）設定
 */
$(".survey-data-not-need-cut-middle").on('touchstart', function () {
    if ($("#survey-data-not-need-cut-middle").hasClass('hidden')) {
        $("#survey-data-not-need-cut-middle").removeClass('hidden');
        $('input[name="survey-data-not-need-cut-middle"]').val(true);
    } else {
        $("#survey-data-not-need-cut-middle").addClass('hidden');
        $('input[name="survey-data-not-need-cut-middle"]').val(false);
    }
});

/**
 * 伐採時の備考（危険木）設定
 */
$(".survey-data-is-denger-tree").on('touchstart', function () {
    if ($("#survey-data-is-denger-tree").hasClass('hidden')) {
        $("#survey-data-is-denger-tree").removeClass('hidden');
        $('input[name="survey-data-is-denger-tree"]').val(true);
    } else {
        $("#survey-data-is-denger-tree").addClass('hidden');
        $('input[name="survey-data-is-denger-tree"]').val(false);
    }
});

/**
 * 伐採時の備考（枝切り）設定
 */
$(".survey-data-need-cut-branch").on('touchstart', function () {
    if ($("#survey-data-need-cut-branch").hasClass('hidden')) {
        $("#survey-data-need-cut-branch").removeClass('hidden');
        $('input[name="survey-data-need-cut-branch"]').val(true);
    } else {
        $("#survey-data-need-cut-branch").addClass('hidden');
        $('input[name="survey-data-need-cut-branch"]').val(false);
    }
});

/**
 * 伐採時の備考（玉切り）設定
 */
$(".survey-data-need-cut-divide").on('touchstart', function () {
    if ($("#survey-data-need-cut-divide").hasClass('hidden')) {
        $("#survey-data-need-cut-divide").removeClass('hidden');
        $('input[name="survey-data-need-cut-divide"]').val(true);
    } else {
        $("#survey-data-need-cut-divide").addClass('hidden');
        $('input[name="survey-data-need-cut-divide"]').val(false);
    }
});

/**
 * 伐採時の備考（集積）設定
 */
$(".survey-data-need-collect").on('touchstart', function () {
    if ($("#survey-data-need-collect").hasClass('hidden')) {
        $("#survey-data-need-collect").removeClass('hidden');
        $('input[name="survey-data-need-collect"]').val(true);
    } else {
        $("#survey-data-need-collect").addClass('hidden');
        $('input[name="survey-data-need-collect"]').val(false);
    }
});

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
 * 直径変更(モーダル1内)
 */
$("[id^=1modal-tree-measured-value-]").on('touchstart', function () {
    var number = $(this).attr("id").replace('1modal-tree-measured-value-', "");
    number == 'none' ?
        (v => {
            $('#1modal-survey-data-mesured-value').text('');
            $('#1modal-survey-data-mesured-value').val('');
        })() :
        (v => {
            applyMesuredValueOfTableKeypadInModal1(number);
        })();
});

/**
 * 直径変更(モーダル2内)
 */
$("[id^=2modal-tree-measured-value-]").on('touchstart', function () {
    var number = $(this).attr("id").replace('2modal-tree-measured-value-', "");
    number == 'none' ?
        (v => {
            $('#2modal-survey-data-mesured-value').text('');
            $('#2modal-survey-data-mesured-value').val('');
        })() :
        (v => {
            applyMesuredValueOfTableKeypadInModal2(number);
        })();
});

/**
 * 伐採木データ作成および更新
 */
async function createEditSurveyData() {
    validate() == false ?
        (v => {
            $("#error").get(0).play();
            return;
        })() : "";
    createSurveyData();
    let count = await editSurveyTrimmingTreeCount();
    soundMessage(count);
    M.toast({ html: '登録しました！', displayLength: 2000 });

    initializeForm();
}

/**
 * 伐採木データ作成および更新(履歴データから)
 */
async function createEditSurveyDataInModal1() {
    validateInModal1() == false ?
        (v => {
            $("#error").get(0).play();
            return;
        })() : "";
    createSurveyDataInModal1();
    let count = await editSurveyTrimmingTreeCount();
    soundMessage(count);
    M.toast({ html: '登録しました！', displayLength: 2000 });

    initializeForm();
}

/**
 * 伐採木データ作成および更新(履歴データから)
 */
async function createEditSurveyDataInModal2() {
    validateInModal2() == false ?
        (v => {
            $("#error").get(0).play();
            return;
        })() : "";
    createSurveyDataInModal2();
    let count = await editSurveyTrimmingTreeCount();
    soundMessage(count);
    M.toast({ html: '登録しました！', displayLength: 2000 });

    initializeForm();
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
function validateInModal1() {
    var result = true;
    // Noチェック
    if ($('#1modal-survey-data-no').text() === '' || $('#1modal-number').val() === '') {
        alert("申し訳ございません。\r\n連番の入力は必須です。連番を入力してください。");
        result = false;
    }
    // Noの数字チェック
    if (result) {
        if (!$('#1modal-number').val().match(/^\d+$/)) {
            alert("申し訳ございません。\r\n連番は半角数字のみ有効です。半角数字のみ入力してください。");
            result = false;
        }
    }
    // 樹種チェック
    if (result) {
        if ($('#1modal-surveyDataTreeType').val() === '') {
            alert("申し訳ございません。\r\n樹種の入力は必須です。樹種を入力してください。");
            result = false;
        }
    }
    // 直径チェック
    if (result) {
        if ($('#1modal-survey-data-mesured-value').val === '') {
            alert("申し訳ございません。\r\n直径の入力は必須です。直径を入力してください。");
            result = false;
        }
    }
    if (result) {
        if ($('#1modal-survey-data-mesured-value').val === 0) {
            alert("申し訳ございません。\r\n直径は0以上で入力してください。");
            result = false;
        }
    }
    // 直径の桁数チェック
    if (result) {
        if (Number($('#1modal-survey-data-mesured-value').val) >= 1000) {
            alert("申し訳ございません。\r\n直径は1000以上は登録できません。1000未満で入力してください。");
            result = false;
        }
    }
    return result;
}

/**
 * 入力チェック(モーダル内)
 */
function validateInModal2() {
    var result = true;
    // Noチェック
    if ($('#2modal-survey-data-no').text() === '' || $('#2modal-number').val() === '') {
        alert("申し訳ございません。\r\n連番の入力は必須です。連番を入力してください。");
        result = false;
    }
    // Noの数字チェック
    if (result) {
        if (!$('#2modal-number').val().match(/^\d+$/)) {
            alert("申し訳ございません。\r\n連番は半角数字のみ有効です。半角数字のみ入力してください。");
            result = false;
        }
    }
    // 樹種チェック
    if (result) {
        if ($('#2modal-surveyDataTreeType').val() === '') {
            alert("申し訳ございません。\r\n樹種の入力は必須です。樹種を入力してください。");
            result = false;
        }
    }
    // 直径チェック
    if (result) {
        if ($('#2modal-survey-data-mesured-value').val === '') {
            alert("申し訳ございません。\r\n直径の入力は必須です。直径を入力してください。");
            result = false;
        }
    }
    if (result) {
        if ($('#2modal-survey-data-mesured-value').val === 0) {
            alert("申し訳ございません。\r\n直径は0以上で入力してください。");
            result = false;
        }
    }
    // 直径の桁数チェック
    if (result) {
        if (Number($('#2modal-survey-data-mesured-value').val) >= 1000) {
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
        $('input[name="need-rope"]').val(),
        $('input[name="need-wire"]').val(),
        $('input[name="need-cut-middle"]').val(),
        $('input[name="need-cut-middle"]').val() ? false : true,
        $('input[name="is-denger-tree"]').val(),
        $('input[name="need-cut-branch"]').val(),
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
async function createSurveyDataInModal1() {
    var newId = $(".new-history-data").attr("id");
    var param = [
        $('#1modal-color').val(),
        $('#1modal-word').val(),
        $('#1modal-number').val(),
        $('#1modal-branch-number').val(),
        $('#ModalTreeType1').val(),
        $('#1modal-survey-data-mesured-value').val(),
        $('input[name="1modal-need-rope"]').val(),
        $('input[name="1modal-need-wire"]').val(),
        $('input[name="1modal-need-cut-middle"]').val(),
        $('input[name="1modal-need-cut-middle"]').val() ? false : true,
        $('input[name="1modal-is-denger-tree"]').val(),
        $('input[name="1modal-need-cut-branch"]').val(),
        $('#1modal-note-modal').val(),
        false,
        'off',
        newId,
        newId
    ];
    updateSurveyDataByIdInModal(param);
}

/**
 * 伐採木データ作成(モーダル)
 */
async function createSurveyDataInModal2() {
    var newId = $(".old-history-data").attr("id");
    var param = [
        $('#2modal-color').val(),
        $('#2modal-word').val(),
        $('#1modal-number').val(),
        $('#2modal-branch-number').val(),
        $('#ModalTreeType2').val(),
        $('#2modal-survey-data-mesured-value').val(),
        $('input[name="2modal-need-rope"]').val(),
        $('input[name="2modal-need-wire"]').val(),
        $('input[name="2modal-need-cut-middle"]').val(),
        $('input[name="2modal-need-cut-middle"]').val() ? false : true,
        $('input[name="2modal-is-denger-tree"]').val(),
        $('input[name="2modal-need-cut-branch"]').val(),
        $('#2modal-note-modal').val(),
        false,
        'off',
        newId,
        newId
    ];
    updateSurveyDataByIdInModal(param);
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
        $(`input[name="${surveyMethod}]`).val(true);
    } else {
        $('#' + surveyMethod).addClass("not-select");
        $(`input[name="${surveyMethod}]`).val(false);
    }
    // $('#' + surveyMethod).hasClass("not-select") ? $('#' + surveyMethod).removeClass("not-select") : $('#' + surveyMethod).addClass("not-select");
    // $(`input[name="${surveyMethod}]`).val(true);
}

/**
 * 伐採方法ボタンをタップした際に、not-selectedクラスを削除する(モーダル内)
 * @param 伐採方法ボタンID
 */
function setSurveyMethodInModal(surveyMethod) {
    if ($('#' + surveyMethod).hasClass("not-select")) {
        $('#' + surveyMethod).removeClass("not-select");
        $(`input[name="${surveyMethod}]`).val(true);
    } else {
        $('#' + surveyMethod).addClass("not-select");
        $(`input[name="${surveyMethod}]`).val(false);
    }
    // $('#' + surveyMethod).hasClass("not-select") ? $('#' + surveyMethod).removeClass("not-select") : $('#' + surveyMethod).addClass("not-select");
    // $(`input[name="${surveyMethod}]`).val(true);
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
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テーブル形式の場合）
 * @param 直径ID
 * @param 直径
 */
function applyMesuredValueOfTableKeypadInModal2(mesuredValueId, value) {
    $('.2modal-circle').removeClass("checked");
    $(mesuredValueId).addClass("checked");
    $('#2modal-survey-data-mesured-value').text(value);
    $('#2modal-survey-data-mesured-value').val(value);
}

/**
 * 直径ボタンをタップした際に、選択した直径の背景色を変更する（テーブル形式の場合）
 * @param 直径ID
 * @param 直径
 */
function applyMesuredValueOfTableKeypadInModal1(mesuredValueId, value) {
    $('.1modal-circle').removeClass("checked");
    $(mesuredValueId).addClass("checked");
    $('#1modal-survey-data-mesured-value').text(value);
    $('#1modal-survey-data-mesured-value').val(value);
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
 * 直径入力欄をテンキーかテーブル形式か変換する
 */
function changeKeyPad() {
    if ($('#key-pad-type').val() === 'table-keypad') {
        $('#table-keypad').hide();
        $('#done').hide();
        $('#numeric-keypad').show();
        $('#key-pad-type').val('numeric-keypad');
    } else {
        $('#numeric-keypad').hide();
        $('#table-keypad').show();
        $('#done').show();
        $('#key-pad-type').val('table-keypad');
    }
}

/**
 * 直径入力欄をテンキーかテーブル形式か変換する(モーダル内)
 */
function changeKeyPadInModal2() {
    if ($('#2modal-key-pad').val() === 'table-keypad') {
        $('#2modal-table-keypad').hide();
        $('#2modal-done').hide();
        $('#2modal-numeric-keypad').show();
        $('#2modal-key-pad-type').val('numeric-keypad');
    } else {
        $('#2modal-numeric-keypad').hide();
        $('#2modal-table-keypad').show();
        $('#2modal-done').show();
        $('#2modal-key-pad-type').val('table-keypad');
    }
}

/**
 * 直径入力欄をテンキーかテーブル形式か変換する(モーダル内)
 */
function changeKeyPadInModal1() {
    if ($('#1modal-key-pad').val() === 'table-keypad') {
        $('#1modal-table-keypad').hide();
        $('#1modal-done').hide();
        $('#1modal-numeric-keypad').show();
        $('#1modal-key-pad-type').val('numeric-keypad');
    } else {
        $('#1modal-numeric-keypad').hide();
        $('#1modal-table-keypad').show();
        $('#1modal-done').show();
        $('#1modal-key-pad-type').val('table-keypad');
    }
}

