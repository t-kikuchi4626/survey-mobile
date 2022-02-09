
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
        'identify_code, ' +
        'survey_company_id, ' +
        'tree_type, ' +
        'trimming_area_value, ' +
        'trimming_tree_area_value, ' +
        'trimming_tree_count, ' +
        'target_area_value, ' +
        'target_area_value_ten, ' +
        'need_collect, ' +
        'is_four_measured, ' +
        'tree_measured_value , ' +
        'is_delete, ' +
        'web_edit_mode,' +
        'modified_by, ' +
        'created_by, ' +
        'modified_date,' +
        'created_date)' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, DATETIME(\'now\', \'localtime\'),DATETIME(\'now\', \'localtime\'))';

    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(sql, param, async function (ignored, resultSet) {
                // transaction.executeSql('SELECT * FROM survey_area WHERE rowid = last_insert_rowid()', [], async function (ignored, resultSet) {
                //     var count = await fetchSurveyAreaCount(surveyDetailId);
                // resolve([resultSet.rows.item(0), count]);
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });

        // });
    })
}

/**
 * 小径木のWeb編集モードを全件更新
 * @param Web編集モード
 * @param 調査会社ID
 */
function updateWebEditModeSurveyAreaByCompanyId(webEditMode, companyId) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            var sql = 'UPDATE survey_area SET web_edit_mode = ?,' +
                'modified_by = ?, ' +
                'modified_date = DATETIME(\'now\', \'localtime\') ' +
                'WHERE survey_company_id = ?';
            transaction.executeSql(sql, [webEditMode, fetchUserId(), companyId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
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
    return new Promise(function (resolve, reject) {
        var sql = 'UPDATE survey_area SET is_delete = ? WHERE id = ?';
        database.transaction(function (transaction) {
            transaction.executeSql(sql, ['true', id], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 小径木削除フラグがtrueのデータを削除（同期処理）
 * @param {*} transaction 
 */
function deleteSurveyAreaIsDetele(transaction, surveyDetailIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyDetailIdList.forEach(function (surveyDetailId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        surveyDetailIdList.unshift('true');
        database.transaction(function (transaction) {
            transaction.executeSql('DELETE FROM survey_area WHERE is_delete = ? AND survey_detail_id NOT IN (' + placeholder + ') ', surveyDetailIdList, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}


// uuidリストを元に小径木削除（同期処理）
function deleteSurveyAreaByIdentifyCodes(transaction, IdentifyCodes) {
    return new Promise(function (resolve, reject) {

        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        IdentifyCodes.forEach(function () {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        database.transaction(function (transaction) {
            transaction.executeSql('DELETE FROM survey_area WHERE identify_code IN (' + placeholder + ') ', IdentifyCodes, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

// 小径木データを更新（同期処理）
function updateSurveyAreaOfSynchronize(transaction, surveyArea) {
    return new Promise(function (resolve, reject) {
        var sql = generateSurveyAreaByIdentifyCodeSQL();
        database.transaction(function (transaction) {
            transaction.executeSql(sql, surveyArea, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

// 小径木削除（同期処理）
function deleteSurveyAreaByDetailId(transaction, surveyDetailIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyDetailIdList.forEach(function (surveyDetailId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        database.transaction(function (transaction) {
            transaction.executeSql(generateSurveyAreaDeleteSql(placeholder), surveyDetailIdList, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

function generateSurveyAreaDeleteSql(placeholder) {
    return 'DELETE FROM survey_area WHERE survey_detail_id IN (' + placeholder + ') ';
}

/**
 * 所在地IDをもとに用材本数更新
 */
function updateSurveyDataTrimmingTreeCount(count, surveyDetailId) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            var sql = 'UPDATE survey_area SET ' +
                'trimming_tree_count = ?, ' +
                'modified_by = ?, ' +
                'modified_date = DATETIME(\'now\', \'localtime\') ' +
                'WHERE survey_detail_id = ?';
            transaction.executeSql(sql, [count, fetchUserId(), surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 小径木更新処理
 * @param 更新項目および更新条件
 */
function updateSurveyArea(param) {
    return new Promise(function (resolve, reject) {
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
                'tree_measured_value = ?, ' +
                'modified_by = ?, ' +
                'modified_date = DATETIME(\'now\', \'localtime\') ' +
                'WHERE id = ?';
            transaction.executeSql(sql, param, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * identifyCodeをもとに伐採木を更新するSQL
 */
function generateSurveyAreaByIdentifyCodeSQL() {
    return 'UPDATE survey_area SET ' +
        'tree_type = ?, ' +
        'trimming_area_value = ?, ' +
        'trimming_tree_area_value = ?, ' +
        'trimming_tree_count = ?, ' +
        'target_area_value = ?, ' +
        'target_area_value_ten = ?, ' +
        'need_collect = ?, ' +
        'is_four_measured = ?, ' +
        'tree_measured_value = ?, ' +
        'modified_by = ?, ' +
        'modified_date = ? ' +
        'WHERE identify_code = ? ';
}
