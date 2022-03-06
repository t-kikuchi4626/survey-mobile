/**
 * Web編集モード結果を登録する
 */
function insertWebEditModeResult() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(insertWebEditModeResultSql(), [], function (ignored, resultSet) {
                resolve(resultSet);
            });
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

/**
 * Web編集モード結果を更新する
 * @param {*} param 
 */
function updateWebEditModeResult(id) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            transaction.executeSql(updateWebEditModeResultSql(), [id], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
};

/**
 * Web編集モード結果を取得する
 * @param {*} companyId 
 * @return Web編集モード
 */
 function fetchWebEditModeResultById(id) {
    return new Promise(function (resolve) {
        database.transaction(async function (transaction) {
            transaction.executeSql('SELECT * FROM web_edit_mode_result WHERE id = ?', [id], function (ignored, resultSet) {
                resolve(resultSet);
            })
        }, function (error) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
        });
    });
}

function updateWebEditModeResultSql() {
    return 'UPDATE web_edit_mode_result SET status = \'done\' where id = ?'
}

function insertWebEditModeResultSql() {
    return 'INSERT INTO web_edit_mode_result (status) VALUES (\'processing\')';
}
