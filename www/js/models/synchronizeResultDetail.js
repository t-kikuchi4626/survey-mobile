/**
 * 同期処理詳細結果登録
 * @param 同期処理ID
 * @param 同期処理明細結果
 */
function createSynchronizeResultDetail(param) {
  return new Promise(function (resolve) {
    database.transaction(function (transaction) {
      transaction.executeSql(insertSynchronizeResultDetailSql(), param, async function (ignored, resultSet) {
        resolve(resultSet);
      }, function (error, transaction) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
      });
    });
  });
}

/**
 * 同期処理詳細結果を更新する
 * @param {*} SynchronizeResult 
 */
function updateSynchronizeResultDetailById(param) {
  return new Promise(function (resolve) {
    database.transaction(async function (transaction) {
      transaction.executeSql(updateSynchronizeResultDetailSql(), param, async function (ignored, resultSet) {
        resolve(resultSet);
      }, function (error, transaction) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
      });
    });
  });
}

/**
 * 同期処理詳細結果取得
 * @return 同期処理結果
 */
function fetchAllSynchronizeResultDetail(synchronizeId) {
  return new Promise(function (resolve) {
    database.transaction(function (transaction) {
      transaction.executeSql('SELECT * FROM synchronize_result_detail where status == \'processing\' and synchronize_id = ? ', [synchronizeId], async function (ignored, resultSet) {
        resolve(resultSet);
      }, function (error, transaction) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
      });
    });
  });
}

/**
 * 同期処理詳細結果を同期処理IDをもとに取得
 * @param {*} synchronizeResultId 
 * @return 同期処理結果
 */
function fetchDetailBySynchronizeResultId(synchronizeResultId) {
  return new Promise(function (resolve) {
    database.transaction(function (transaction) {
      transaction.executeSql('SELECT * FROM synchronize_result_detail where synchronize_id = ? ', [synchronizeResultId], function (ignored, resultSet) {
        resolve(resultSet);
      }, function (error, transaction) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
      });
    });
  });
}

/**
 * 同期処理結果詳細を全件削除する
 */
function deleteSynchronizeResultDetail() {
  return new Promise(function (resolve) {
    database.transaction(function (transaction) {
      transaction.executeSql('DELETE FROM synchronize_result_detail', [], function (ignored, resultSet) {
        resolve(resultSet);
      }, function (error, transaction) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
      });
    });
  });
}

/**
 * 同期処理明細新規登録SQL
 * @param 同期処理ID
 * @param 同期処理明細結果
 */
function insertSynchronizeResultDetailSql() {
  return 'INSERT INTO synchronize_result_detail (' +
    'synchronize_id, ' +
    'cloud_synchronize_id, ' +
    'status, ' +
    'message, ' +
    'modified_by, ' +
    'modified_date) ' +
    'VALUES (?,?,?,?,?,DATETIME(\'now\', \'localtime\')) ';
}

/**
 * 同期処理明細更新SQL
 */
function updateSynchronizeResultDetailSql() {
  return 'UPDATE synchronize_result_detail SET ' +
    'status = ?, ' +
    'message = ?, ' +
    'modified_by = ?, ' +
    'modified_date = DATETIME(\'now\', \'localtime\') ' +
    'where cloud_synchronize_id = ?'
}