/**
 * 同期処理結果取得
 * @return 同期処理結果
 */
function fetchSynchronizeResult() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM synchronize_result', [], function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
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
            transaction.executeSql(insertSynchronizeResultSql(), SynchronizeResult, function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * 同期処理結果を更新する
 * @param {*} SynchronizeResult 
 */
function updateSynchronizeResult(SynchronizeResult) {

    database.transaction(async function (transaction) {
        transaction.executeSql(updateSynchronizeResultSql(), SynchronizeResult);
    }, function (error) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
    });
}

/**
 * 最新の同期処理結果を取得する
 * @param {*} SynchronizeResult 
 */
function fetchLastSynchronizeResult() {
    return new Promise(function (resolve) {
        database.transaction(async function (transaction) {
        transaction.executeSql(selectLastSynchronizeResultSql(), [], function (ignored, resultSet) {
            resolve(resultSet);
        })
        }, function (error) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
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
        'status, ' +
        'message, ' +
        'modified_by, ' +
        'modified_date) ' +
        'VALUES (?,?,?,DATETIME(\'now\', \'localtime\')) ';
}

/**
 * 最新の同期処理結果取得SQL
 */
function selectLastSynchronizeResultSql() {
    return 'SELECT * FROM synchronize_result ORDER BY id DESC';
}
  