/**
 * 同期処理結果取得
 * @return 同期処理結果
 */
function fetchSynchronizeResult() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM synchronize_result', [], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 同期処理結果を登録する
 * @param {*} SynchronizeResult 
 */
function insertSynchronizeResult(SynchronizeResult) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(insertSynchronizeResultSql(), SynchronizeResult, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 同期処理結果を更新する
 * @param {*} SynchronizeResult 
 */
function updateSynchronizeResult(SynchronizeResult) {
    return new Promise(function (resolve, reject) {
        database.transaction(async function (transaction) {
            transaction.executeSql(updateSynchronizeResultSql(), SynchronizeResult, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 企業IDを元に、最新の同期処理結果を取得する
 * @param {*} companyId 企業ID
 */
function fetchLastSynchronizeResultByCompanyId(companyId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(selectLastSynchronizeResultSql(), [companyId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

function updateSynchronizeResultSql() {
    return 'UPDATE synchronize_result SET ' +
        'status = ?, ' +
        'message = ?, ' +
        'modified_by = ?, ' +
        'modified_date = DATETIME(\'now\', \'localtime\') ' +
        'where id = ?'
}

function insertSynchronizeResultSql() {
    return 'INSERT INTO synchronize_result (' +
        'company_id, ' +
        'status, ' +
        'message, ' +
        'modified_by, ' +
        'modified_date) ' +
        'VALUES (?,?,?,?,DATETIME(\'now\', \'localtime\')) ';
}

/**
 * 最新の同期処理結果取得SQL
 */
function selectLastSynchronizeResultSql() {
    return 'SELECT * FROM synchronize_result WHERE company_id = ? ORDER BY id DESC';
}
