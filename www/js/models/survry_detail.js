/**
 * 所在地データ取得（IDと更新日付）
 * @return 所在地
 */
function fetchSurveyDetailIdAndModifiedDate(surveyIdList) {
    // IDの数だけプレースホルダを増やす
    var placeholderTmp = '';
    for (var i = 0; i < surveyIdList.length; i++) {
        placeholderTmp += '?, ';
    }
    var placeholder = placeholderTmp.slice(0, -2);
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT id, modified_date FROM survey_detail WHERE id IS NOT NULL AND survey_id IN (' + placeholder + ')', surveyIdList, function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * 所在地データ取得（IDと更新日付）
 * @return 所在地
 */
function fetchSurveyDetailIdAndModifiedDateNoSurveyId() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT id, modified_date FROM survey_detail', [], function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * IDをもとに所在地データ取得
 * @param ID
 * @return 所在地
 */
function fetchSurveyDetailById(id) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_detail WHERE id = ?', [id], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 端末所在地IDをもとに所在地データ取得
 * @param ID
 * @return 所在地
 */
 function fetchSurveyDetailBySurveyDetailId(surveyDetailMobileId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_detail WHERE mobile_id = ?', [surveyDetailMobileId], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 調査業務IDをもとに所在地データ取得
 * @param 調査業務ID
 * @return 所在地
 */
function fetchSurveyDetailBySurveyId(surveyId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_detail WHERE survey_id = ? order by detail_number asc', [surveyId], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 調査業務詳細IDをもとに所在地データ取得
 * @param 調査業務ID
 * @return 所在地
 */
function fetchSurveyDetailById(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_detail WHERE id = ? order by id asc', [surveyDetailId], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 調査業務IDをもとに所在地データ取得
 * @param 調査業務ID
 * @return 所在地
 */
async function fetchSurveyDetailBySurveyIds(surveyIds) {
    return new Promise(function (resolve) {
        database.transaction(async function (transaction) {
            // IDの数だけプレースホルダを増やす
            var placeholderTmp = '';
            await surveyIds.forEach(function (surveyId) {
                placeholderTmp += '?, ';
            })
            var placeholder = placeholderTmp.slice(0, -2);
            await transaction.executeSql('SELECT * FROM survey_detail WHERE survey_id IN(' + placeholder + ')', surveyIds, function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 所在地データの調査状況を更新
 * @param 所在地ID
 * @param 更新する調査状況
 */
function updateSurveyDetailStatus(surveyDetailId, status) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            transaction.executeSql('UPDATE survey_detail SET status = ?, modified_by = ?, modified_date = DATETIME(\'now\', \'localtime\') WHERE id = ?', [status, fetchUserId(), surveyDetailId], async function (ignored, resultSet) {
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。:' + transaction.message);
            });
        });
    });
}


/**
 * 小径木のナンバリング用連番取得
 * @param 所在地ID
 * @return ナンバリング用連番
 */
function fetchSNumberingSequence(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT s_numbering_sequence FROM survey_detail WHERE id = ?', [surveyDetailId], function (ignored, resultSet) {
                var surveyAreaNumber = resultSet.rows.item(0).s_numbering_sequence + 1;
                resolve(surveyAreaNumber);
                updateSNumberingSequence(surveyDetailId, surveyAreaNumber);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。:' + error.message);
        });
    });
}

/**
 * 小径木のナンバリング用連番更新
 * @param 所在地ID
 * @param 更新するナンバリング用連番
 */
function updateSNumberingSequence(surveyDetailId, surveyAreaNumber) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            transaction.executeSql('UPDATE survey_detail SET s_numbering_sequence = ?, modified_by = ?, modified_date = DATETIME(\'now\', \'localtime\') WHERE id = ?', [surveyAreaNumber, fetchUserId(), surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。:' + transaction.message);
            });
        });
    });
}

/**
 * 伐採木のナンバリング用連番取得
 * @param 所在地ID
 * @return ナンバリング用連番
 */
function fetchNumberingSequence(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT numbering_sequence FROM survey_detail WHERE id = ?', [surveyDetailId], function (ignored, resultSet) {
                var surveyDataNumber = resultSet.rows.item(0).numbering_sequence + 1;
                resolve(surveyDataNumber);
                updateNumberingSequence(surveyDetailId, surveyDataNumber);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。:' + error.message);
        });
    });
}

/**
 * 伐採木のナンバリング用連番更新
 * @param 所在地ID
 * @param 更新するナンバリング用連番
 */
function updateNumberingSequence(surveyDetailId, surveyDataNumber) {
    return new Promise(function (resolve, reject) {
        database.transaction(async function (transaction) {
            transaction.executeSql('UPDATE survey_detail SET numbering_sequence = ?, modified_by = ?, modified_date = DATETIME(\'now\', \'localtime\')  WHERE id = ?', [surveyDataNumber, fetchUserId(), surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。:' + transaction.message);
            });
        });
    });
}

// 調査明細データ登録（同期処理）
function insertSurveyDetail(transaction, surveyDetail) {
    return new Promise(function (resolve, reject) {
        var sql = generateSurveyDetailInsertSql();
        transaction.executeSql(sql, surveyDetail, function (transaction) {
            resolve();
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

// 調査明細データ更新（同期処理）
function updateSurveyDetail(transaction, surveyDetail) {
    return new Promise(function (resolve, reject) {
        var sql = generateSurveyUpdateDetailSql();
        transaction.executeSql(sql, surveyDetail, function (transaction) {
            resolve();
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

// 調査明細データ削除（同期処理）
function deleteSurveyDetailById(transaction, surveyDetailIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyDetailIdList.forEach(function (surveyDetailId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        transaction.executeSql(generateSurveyDetailDeleteSql(placeholder), [surveyDetailIdList], function (transaction) {
            resolve();
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

// 調査明細IDがNULLのデータを削除（同期処理）
function deleteSurveyDetailBySurveyDetailIdIsNull(transaction, surveyIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyIdList.forEach(function (surveyId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        transaction.executeSql(generateSurveyDetailDeleteBySurveyDetailIdIsNull(placeholder), surveyIdList, function (ignored, resultSet) {
            resolve();
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}


// 調査明細データ削除（同期処理_業務データ非表示）
function deleteSurveyDetailBySurveyId(transaction, surveyIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyIdList.forEach(function (surveyId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        transaction.executeSql(generateSurveyDetailDeleteBySurveySql(placeholder), surveyIdList, function (ignored, resultSet) {
            resolve();
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

function generateSurveyDetailInsertSql() {
    return 'INSERT INTO survey_detail (' +
        'id, ' +
        'detail_number, ' +
        'survey_id, ' +
        'survey_address, ' +
        'line_name, ' +
        'steal_tower_start, ' +
        'steal_tower_end, ' +
        'area_owner_name, ' +
        'area_owner_address, ' +
        'area_owner_tel, ' +
        'survey_witness_name, ' +
        'survey_witness_address, ' +
        'survey_witness_tel, ' +
        'area_classification, ' +
        'created_by, ' +
        'created_date, ' +
        'modified_by, ' +
        'modified_date) ' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
}

function generateSurveyUpdateDetailSql() {
    return 'UPDATE survey_detail SET ' +
        'id = ?, ' +
        'detail_number = ?, ' +
        'survey_id = ?, ' +
        'survey_address = ?, ' +
        'line_name = ?, ' +
        'steal_tower_start = ?, ' +
        'steal_tower_end = ?, ' +
        'area_owner_name = ?, ' +
        'area_owner_address = ?, ' +
        'area_owner_tel = ?, ' +
        'survey_witness_name = ?, ' +
        'survey_witness_address = ?, ' +
        'survey_witness_tel = ?, ' +
        'area_classification = ?, ' +
        'created_by = ?, ' +
        'created_date = ?, ' +
        'modified_by = ?, ' +
        'modified_date = ? ' +
        'WHERE id = ? ';
}

function generateSurveyDetailDeleteSql(placeholder) {
    return 'DELETE FROM survey_detail WHERE id IN (' + placeholder + ') ';
}

function generateSurveyDetailDeleteBySurveySql(placeholder) {
    return 'DELETE FROM survey_detail WHERE survey_id IN (' + placeholder + ') ';
}

function generateSurveyDetailDeleteBySurveyDetailIdIsNull(placeholder) {
    return 'DELETE FROM survey_detail WHERE survey_id IN (' + placeholder + ') AND id IS NULL';
}

/**
 * 所在地情報の登録
 * @param 登録データ
 * @return 登録データ
 */
 function insertSurveyDetailByMobile(param) {
    var sql = 'INSERT INTO survey_detail (' +
        'survey_id, ' +
        'survey_address, ' +
        'line_name, ' +
        'steal_tower_start, ' +
        'steal_tower_end, ' +
        'area_owner_name, ' +
        'area_owner_address, ' +
        'area_owner_tel, ' +
        'survey_witness_name, ' +
        'survey_witness_address, ' +
        'survey_witness_tel, ' +
        'area_classification, ' +
        'created_by , ' +
        'created_date, ' +
        'modified_by,' +
        'modified_date, ' +
        'detail_number, ' +
        'price_type, ' +
        'price_sub_type, ' +
        'all_need_cut_divide, ' +
        'all_need_collect, ' +
        'order_number,' +
        'mobile_id)' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,DATETIME(\'now\', \'localtime\'),?,DATETIME(\'now\', \'localtime\'),?,?,?,?,?,?,?)';

    
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(sql, param, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    })
}


/**
 * 所在地情報のデータ件数を取得
 * @return 所在地情報のデータ件数
 */
 function fetchSurveyDetailLength() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT COUNT(*) AS length FROM survey_detail', [], function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * 所在地情報のデータ件数を取得
 * @return 所在地情報のデータ件数
 */
 function fetchSurveyDetailByIdIsNull() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_detail WHERE id IS NULL', [], function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}