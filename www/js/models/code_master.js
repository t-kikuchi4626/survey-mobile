/**
 * カテゴリ―番号をもとにマスタデータを取得
 * @param 調査業務ID
 * @return 所在地
 */
function fetchCodeMasterByCategoryNumber(category_code) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM code_master WHERE category_code = ? ORDER BY order_number', [category_code], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}


/**
 * コードマスタ―に同期後の情報を登録
 * @param {*} codeMaster 同期処理で取得したcodeMasterテーブルの情報
 */
function insertCodeMaster(codeMaster) {
    return new Promise(function (resolve) {
        let sql = generateCodeMasterInsertSql();
        database.transaction(function (transaction) {
            transaction.executeSql(sql, codeMaster, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    })
}

/**
 * コードマスタ―削除（同期処理）
 */
 function deleteCodeMaster() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('DELETE FROM code_master', [], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * コードマスタ―登録時SQL文の発行（同期処理）
 * @returns コードマスタの登録SQL文
 */
function generateCodeMasterInsertSql() {
    return 'INSERT INTO code_master (' +
        'id, ' +
        'category, ' +
        'category_code, ' +
        'label, ' +
        'value, ' +
        'order_number, ' +
        'is_active, ' +
        'created_by, ' +
        'created_date, ' +
        'modified_by, ' +
        'modified_date)' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?) ';
}