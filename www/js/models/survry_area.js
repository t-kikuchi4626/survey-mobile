
/**
 * 小径木データ取得
 * @return 小径木
 */
function fetchSurveyAreaAll(surveyDetailIdList) {
    // IDの数だけプレースホルダを増やす
    var placeholderTmp = '';
    for (var i = 0; i < surveyDetailIdList.length; i++) {
        placeholderTmp += '?, ';
    }
    var placeholder = placeholderTmp.slice(0, -2);
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_area WHERE survey_detail_id IN (' + placeholder + ')', surveyDetailIdList, function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 小径木データ取得
 * @return 小径木
 */
function fetchSurveyAreaAllNoSurveyDetail() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_area', [], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに小径木データ取得
 * @param 所在地ID
 * @return 小径木
 */
function fetchSurveyAreaBySurveyDetailId(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_area WHERE survey_detail_id = ? AND is_delete = ? order by id asc', [surveyDetailId, 'false'], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 小径木の登録
 * @param 登録データ
 * @return 登録データ
 */
function insertSurveyArea(param) {
    var sql = 'INSERT INTO survey_area (' +
        'survey_detail_id, ' +
        'is_synchronize, ' +
        'tree_type, ' +
        'trimming_area_value, ' +
        'trimming_tree_area_value, ' +
        'trimming_tree_count, ' +
        'target_area_value, ' +
        'target_area_value_ten, ' +
        'need_collect, ' +
        'is_four_measured, ' +
        'is_delete, ' +
        'modified_by, ' +
        'created_by, ' +
        'modified_date,' +
        'created_date)' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, DATETIME(\'now\', \'localtime\'),DATETIME(\'now\', \'localtime\'))';

    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(sql, param, function (_ignored, resultSet) {
                transaction.executeSql('SELECT * FROM survey_area WHERE rowid = last_insert_rowid()', [], async function (ignored, resultSet) {
                    var count = await fetchSurveyAreaCount(surveyDetailId);
                    resolve([resultSet.rows.item(0), count]);
                }, function (error) {
                    alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
                });
            });
        });
    });
}

/**
 * 所在地IDをもとに小径木の登録件数を取得
 * @param 所在地ID
 * @return 登録件数
 */
function fetchSurveyAreaCount(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            var sql = 'SELECT COUNT(*) AS count FROM survey_area WHERE survey_detail_id = ? AND is_delete = ?';
            transaction.executeSql(sql, [surveyDetailId, false], function (ignored, resultSet) {
                resolve(resultSet.rows.item(0).count);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * 小径木IDをもとに削除フラグを立てる
 * @param 小径木ID
 */
function deleteSurveyAreaById(id) {
    var sql = 'UPDATE survey_area SET is_delete = ? WHERE id = ?';
    database.transaction(function (transaction) {
        transaction.executeSql(sql, ['true', id]);
    }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
    });
}

/**
 * 小径木削除フラグがtrueのデータを削除（同期処理）
 * @param {*} transaction 
 */
function deleteSurveyAreaIsDetele(transaction, surveyDetailIdList) {
    // 削除IDの数だけプレースホルダを増やす
    var placeholderTmp = '';
    surveyDetailIdList.forEach(function (surveyDetailId) {
        placeholderTmp += '?, ';
    })
    var placeholder = placeholderTmp.slice(0, -2);
    surveyDetailIdList.unshift('true');
    transaction.executeSql('DELETE FROM survey_area WHERE is_delete = ? AND survey_detail_id NOT IN (' + placeholder + ') ', surveyDetailIdList);
}

// 小径木データ新規登録（同期処理）
function updateSurveyAreaCloudId(transaction, surveyArea) {
    var sql = generateSurveyAreaUpdateSql();
    transaction.executeSql(sql, surveyArea);
}

// 小径木削除（同期処理）
function deleteSurveyAreaByDetailId(transaction, surveyDetailIdList) {
    // 削除IDの数だけプレースホルダを増やす
    var placeholderTmp = '';
    surveyDetailIdList.forEach(function (surveyDetailId) {
        placeholderTmp += '?, ';
    })
    var placeholder = placeholderTmp.slice(0, -2);
    transaction.executeSql(generateSurveyAreaDeleteSql(placeholder), surveyDetailIdList);
}

function generateSurveyAreaUpdateSql() {
    return 'update survey_area SET ' +
        'cloud_survey_area_id =? ' +
        'WHERE id = ? ';
}

function generateSurveyAreaDeleteSql(placeholder) {
    return 'DELETE FROM survey_area WHERE survey_detail_id IN (' + placeholder +') ';
}

/**
 * 所在地IDをもとに用材本数更新
 */
function updateSurveyDataTrimmingTreeCount(count, surveyDetailId) {
    database.transaction(function (transaction) {
        var sql = 'UPDATE survey_area SET ' +
            'trimming_tree_count = ?, ' +
            'modified_by = ?, ' +
            'modified_date = DATETIME(\'now\', \'localtime\') ' +
            'WHERE survey_detail_id = ?';
        transaction.executeSql(sql, [count, fetchUserId(), surveyDetailId]);
    }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
    });
}

/**
 * 小径木更新処理
 * @param 更新項目および更新条件
 */
function updateSurveyArea(param) {

    database.transaction(function (transaction) {
        var sql = 'UPDATE survey_area SET ' +
            'tree_type = ?, ' +
            'trimming_area_value = ?, ' +
            'trimming_tree_area_value = ?, ' +
            'trimming_tree_count = ?, ' +
            'target_area_value = ?, ' +
            'target_area_value_ten = ?, ' +
            'need_collect = ?, ' +
            'is_four_measured = ?, ' +
            'modified_by = ?, ' +
            'modified_date = DATETIME(\'now\', \'localtime\') ' +
            'WHERE id = ?';
        transaction.executeSql(sql, param);
    }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
    });
}