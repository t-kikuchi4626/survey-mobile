// 合計情報
var totalInfo = {};

document.addEventListener("deviceready", async function () {
    await controlEditScreen();
    var param = location.search.substring(1).split("&");
    var surveyId = param[0];
    var surveyDetailId = param[1];
    var surveyDetailMobileId = param[2];

    // 登録画面遷移タグ作成
    createRegisterLink(surveyId, surveyDetailId, surveyDetailMobileId);

    // サイドナビゲーションリンク作成
    createSidenavLink(surveyId, surveyDetailId, surveyDetailMobileId);
    createContactSidenavLink(contactFunction[4], surveyId, surveyDetailId);

    var surveyDataList = isNull(surveyDetailId) ? 
                            await fetchSurveyDataListBySurveyDetailMobileId(surveyDetailMobileId):
                            await fetchSurveyDataList(surveyDetailId);
    var texts = '';

    texts = setTableHeader(surveyDataList);
    var surveyDataListTitle = $('#survey-data-list-title');
    surveyDataListTitle.append(texts);

    // ～9の設定
    texts = await setTableDataTreeMeasuredValue9(surveyDataList);
    // 10～19の設定
    texts += await setTableDataTreeMeasuredValue(surveyDataList, "10～19", 9, 19);
    // 20～29の設定
    texts += await setTableDataTreeMeasuredValue(surveyDataList, "20～29", 19, 29);
    // 30～39の設定
    texts += await setTableDataTreeMeasuredValue(surveyDataList, "30～39", 29, 39);
    // 40～49の設定
    texts += await setTableDataTreeMeasuredValue(surveyDataList, "40～49", 39, 49);
    // 50～59の設定
    texts += await setTableDataTreeMeasuredValue(surveyDataList, "50～59", 49, 59);
    // 60～の設定
    texts += await setTableDataTreeMeasuredValue60(surveyDataList);
    // 合計の設定
    texts += setTableDataTotal(surveyDataList);
    var surveyDataListlItem = $('#survey-data-list-item');
    surveyDataListlItem.append(texts);
});

/**
 * テーブルヘッダ情報の設定
 * @param 伐採木データリスト
 */
function setTableHeader(surveyDataList) {
    var treeTypesCount = {};
    var freeTreeTypesCount = {};
    var sortTree = "杉,松,ひのき,天然生林";
    var arrayTreeTypes = sortTree.split(',');

    for (var i = 0; i < surveyDataList.rows.length; i++) {
        var surveyData = surveyDataList.rows.item(i);
        const index = arrayTreeTypes.indexOf(surveyData.survey_data_tree_type);
        if (index >= 0) {
            treeTypesCount[index] = "樹種";
        } else {
            freeTreeTypesCount[surveyData.survey_data_tree_type] = "樹種";
        }
    }

    //並び替え
    Object.keys(treeTypesCount).sort((function (a, b) { return a - b }));
    Object.keys(freeTreeTypesCount).sort((function (a, b) { return a.localeCompare(b, 'ja') }));

    var texts = '<tr class="border-style">';
    texts += '<th class="border-style">直径</th>';
    Object.keys(treeTypesCount).forEach(function (value) {
        texts += '<th class="border-style">' + arrayTreeTypes[value] + '</th>';
        totalInfo[arrayTreeTypes[value]] = 0;
    });

    Object.keys(freeTreeTypesCount).forEach(function (value) {
        texts += '<th class="border-style">' + value + '</th>';
        totalInfo[value] = 0;
    });

    texts += '</tr>';
    return texts;
}


/**
 * テーブルデータ情報の設定（直径10～19）
 * @param 伐採木データリスト
 */
async function setTableDataTreeMeasuredValue9(surveyDataList) {
    var texts = '<tr class="border-style">';
    texts += '<td class="border-style">～9</td>';
    for (var i = 0; i < surveyDataList.rows.length; i++) {
        var surveyData = surveyDataList.rows.item(i);
        var treeMeasuredValue = isNull(surveyData.survey_detail_id) ? 
                                    await fetchBeforeTerrTypeMeasuredValueBySurveyDetailMobileId(surveyData.mobile_id, surveyData.survey_data_tree_type, 9):
                                    await fetchBeforeTerrTypeMeasuredValue(surveyData.survey_detail_id, surveyData.survey_data_tree_type, 9);
        texts += '<td class="border-style">' + treeMeasuredValue.rows.item(0).count + '</td>';
        totalInfo[surveyData.survey_data_tree_type] += treeMeasuredValue.rows.item(0).count;
    }
    texts += '</tr>';
    return texts;
}

/**
 * テーブルデータ情報の設定（直径10～19、20～29、30～39、40～49、50～59）
 * @param 伐採木データリスト
 */
async function setTableDataTreeMeasuredValue(surveyDataList, title, minValue, maxValue) {
    var texts = '<tr class="border-style">';
    texts += '<td class="border-style">' + title + '</td>';
    for (var i = 0; i < surveyDataList.rows.length; i++) {
        var surveyData = surveyDataList.rows.item(i);
        var treeMeasuredValue = isNull(surveyData.survey_detail_id) ? 
                                    await fetchBeforeAndAfterTerrTypeMeasuredValueBySurveyDetailMobileId(surveyData.mobile_id, surveyData.survey_data_tree_type, minValue, maxValue):
                                    await fetchBeforeAndAfterTerrTypeMeasuredValue(surveyData.survey_detail_id, surveyData.survey_data_tree_type, minValue, maxValue);
        texts += '<td class="border-style">' + treeMeasuredValue.rows.item(0).count + '</td>';
        totalInfo[surveyData.survey_data_tree_type] += treeMeasuredValue.rows.item(0).count;
    }
    texts += '</tr>';
    return texts;
}

/**
 * テーブルデータ情報の設定（直径60～）
 * @param 伐採木データリスト
 */
async function setTableDataTreeMeasuredValue60(surveyDataList) {
    var texts = '<tr class="border-style">';
    texts += '<td class="border-style">60～</td>';
    for (var i = 0; i < surveyDataList.rows.length; i++) {
        var surveyData = surveyDataList.rows.item(i);
        var treeMeasuredValue = isNull(surveyData.survey_detail_id) ?
                                    await fetchAfterTerrTypeMeasuredValueBySurveyDetailMobileId(surveyData.mobile_id, surveyData.survey_data_tree_type, 59):
                                    await fetchAfterTerrTypeMeasuredValue(surveyData.survey_detail_id, surveyData.survey_data_tree_type, 59);
        texts += '<td class="border-style">' + treeMeasuredValue.rows.item(0).count + '</td>';
        totalInfo[surveyData.survey_data_tree_type] += treeMeasuredValue.rows.item(0).count;
    }
    texts += '</tr>';
    return texts;
}

/**
 * テーブルデータ情報の設定（合計）
 * @param 伐採木データリスト
 */
function setTableDataTotal(surveyDataList) {
    var texts = '<tr class="border-style">';
    texts += '<td class="border-style">合計</td>';
    for (var i = 0; i < surveyDataList.rows.length; i++) {
        var surveyData = surveyDataList.rows.item(i);
        texts += '<td class="border-style">' + totalInfo[surveyData.survey_data_tree_type] + '</td>';
    }
    texts += '</tr>';
    return texts;
}