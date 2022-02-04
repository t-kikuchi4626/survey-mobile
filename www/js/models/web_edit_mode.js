/**
 * Web編集モードを調査会社IDより取得する
 * @param {*} companyId 
 * @return Web編集モード
 */
function fetchWebEditModeByCompanyId(companyId) {
    return new Promise(function (resolve) {
        database.transaction(async function (transaction) {
            transaction.executeSql('SELECT * FROM web_edit_mode WHERE survey_company_id = ?', [companyId], function (ignored, resultSet) {
                resolve(resultSet);
            })
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * Web編集モードを登録する
 * @param {*} param 
 */
function insertWebEditMode(param) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(insertWebEditModeSql(), param, function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * Web編集モードを更新する
 * @param {*} param 
 */
function updateWebEditMode(param) {
    database.transaction(async function (transaction) {
        transaction.executeSql(updateWebEditModeSql(), param);
    }, function (error) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
    });
}

function updateWebEditModeSql() {
    return 'UPDATE web_edit_mode SET ' +
        'web_edit_mode = ?, ' +
        'modified_by = ?, ' +
        'modified_date = DATETIME(\'now\', \'localtime\') ' +
        'where survey_company_id = ?'
}

function insertWebEditModeSql() {
    return 'INSERT INTO web_edit_mode (' +
        'survey_company_id, ' +
        'web_edit_mode, ' +
        'modified_by, ' +
        'modified_date) ' +
        'VALUES (?,?,?,DATETIME(\'now\', \'localtime\')) ';
}
