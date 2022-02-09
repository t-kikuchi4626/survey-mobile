/**
 * 調査業務取得
 * @return 調査業務
 */
function fetchSurveyAll(surveyCompanyId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey WHERE survey_company_id = ? order by id desc', [surveyCompanyId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * IDをもとに調査業務取得
 * @param ID
 * @return 調査業務
 */
function fetchSurveyById(id) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey WHERE id = ?', [id], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 調査業務取得（IDと更新日付）
 * @return 調査業務
 */
function fetchSurveyIdAndModifiedDate(surveyCompanyId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT id, modified_date FROM survey WHERE survey_company_id = ?', [surveyCompanyId], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 調査業務登録（同期処理）
 * @param {*} transaction 
 * @param {*} survey 
 */
function insertSurvey(transaction, survey) {
    return new Promise(function (resolve, reject) {
        var sql = generateSurveyInsertSql();
        database.transaction(function (transaction) {
            transaction.executeSql(sql, survey, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 調査業務更新（同期処理）
 * @param {*} transaction 
 * @param {*} survey 
 */
function updateSurvey(transaction, survey) {
    return new Promise(function (resolve, reject) {
        var sql = generateSurveyUpdateSql();
        database.transaction(function (transaction) {
            transaction.executeSql(sql, survey, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 調査業務削除（同期処理）
 * @param {*} transaction 
 * @param {*} surveyIdList 
 */
function deleteSurvey(transaction, surveyIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyIdList.forEach(function (surveyId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        database.transaction(function (transaction) {
            transaction.executeSql(generateSurveyDeleteSql(placeholder), surveyIdList);
            resolve(resultSet);
        }, function (error, transaction) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
        });
    });
}

/**
 * 完了の調査業務取得（同期処理）
 * @return 調査業務
 */
function fetchSurveyAllStatusIsTrue(surveyCompanyId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey WHERE survey_company_id = ? AND status = ? order by id desc', [surveyCompanyId, 'true'], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * 完了の調査業務取得（同期処理）
 * @return 調査業務
 */
function test() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT count(*) count FROM survey_data', [], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}


function generateSurveyInsertSql() {
    return 'INSERT INTO survey (' +
        'id, ' +
        'center_id, ' +
        'survey_name, ' +
        'survey_company_id, ' +
        'survey_company_name, ' +
        'survey_year, ' +
        'business_period_from, ' +
        'business_period_to, ' +
        'note, ' +
        'is_show, ' +
        'status, ' +
        'tree_type_value, ' +
        'special_tree, ' +
        'created_by, ' +
        'created_date, ' +
        'modified_by, ' +
        'modified_date) ' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
}

function generateSurveyUpdateSql() {
    return 'UPDATE survey SET ' +
        'id = ?, ' +
        'center_id = ?, ' +
        'survey_name = ?, ' +
        'survey_company_id = ?, ' +
        'survey_company_name = ?, ' +
        'survey_year = ?, ' +
        'business_period_from = ?, ' +
        'business_period_to = ?, ' +
        'note = ?, ' +
        'is_show = ?, ' +
        'status = ?, ' +
        'tree_type_value = ?, ' +
        'special_tree = ?, ' +
        'created_by = ?, ' +
        'created_date = ?, ' +
        'modified_by = ?, ' +
        'modified_date = ? ' +
        'WHERE id = ? ';
}

function generateSurveyDeleteSql(placeholder) {
    return 'DELETE FROM survey WHERE id IN (' + placeholder + ') ';
}