/**
 * 伐採木データを4000件ずつ取得
 * @return 伐採木
 * @return offset
 */
function fetchSurveyDataAll(surveyDetailIdList, offset) {
    // IDの数だけプレースホルダを増やす
    var placeholderTmp = '';
    for (var i = 0; i < surveyDetailIdList.length; i++) {
        placeholderTmp += '?, ';
    }
    var placeholder = placeholderTmp.slice(0, -2);
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql(`SELECT * FROM survey_data WHERE survey_detail_id IN (${placeholder})  ORDER BY id ASC limit 4000 offset ${offset}`, surveyDetailIdList, function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 伐採木データ取得
 * @return 伐採木
 */
function fetchSurveyDataAllNoSurveyDetail() {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data', [], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに伐採木データ取得
 * @param 所在地ID
 * @return 伐採木
 */
function fetchSurveyDataBySurveyDetailId(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = ? order by created_date desc limit 2', [surveyDetailId, 'false'], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに伐採木データ取得（１件新しいもの）
 * @param 所在地ID
 * @return 伐採木
 */
function fetchSurveyNewDataBySurveyId(id) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT  ROW_NUMBER() OVER(ORDER BY created_date ASC) num,* FROM survey_data WHERE id >= ? AND is_delete = ? order by created_date desc limit 2', [id, 'false'], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに伐採木データ取得（１件新しいもの）(行指定)
 * @param 所在地ID
 * @return 伐採木
 */
function fetchSurveyNewDataBySurveyIdByrowNum(id, rowNum) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE id >= ? AND is_delete = ? order by created_date desc limit ? offset ?', [id, 'false', rowNum + 2, rowNum - 1], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}


/**
 * 所在地IDをもとに伐採木データ取得（１件）
 * @param 所在地ID
 * @return 伐採木
 */
function fetchSurveyDataBySurveyId(id) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE id = ? AND is_delete = ? order by created_date desc limit 2', [id, 'false'], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
  * 所在地IDをもとに伐採木データ取得（１件古いもの）
  * @param 所在地ID
  */
function fetchSurveyOldDataBySurveyId(id) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE id <= ? AND is_delete = ? order by created_date desc limit 2', [id, 'false'], function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}


/**
 * 伐採木の登録
 * @param 登録データ
 */
function insertSurveyData(param) {
    return new Promise(function (resolve, reject) {
        var sql = 'INSERT INTO survey_data (' +
            'survey_detail_id, ' +
            'identify_code, ' +
            'survey_company_id, ' +
            'name, ' +
            'color, ' +
            'word, ' +
            'number, ' +
            'branch_number, ' +
            'survey_data_tree_type, ' +
            'tree_measured_value, ' +
            'need_none, ' +
            'need_rope, ' +
            'need_wire, ' +
            'need_cut_middle, ' +
            'not_need_cut_middle, ' +
            'is_danger_tree, ' +
            'need_cut_branch, ' +
            'note, ' +
            'is_delete, ' +
            'web_edit_mode,' +
            'modified_by, ' +
            'created_by, ' +
            'modified_date,' +
            'created_date)' +
            'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, DATETIME(\'now\', \'localtime\'), DATETIME(\'now\', \'localtime\'))';
        database.transaction(function (transaction) {
            transaction.executeSql(sql, param, async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * ナンバリングをもとに伐採木データ取得
 * @param ナンバリング
 * @return 伐採木データ
 */
function fetchSurveyDataByNumbering(numbering) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_data_number = ?', [numbering], async function (ignored, resultSet) {
                resolve(resultSet.rows.item(0));
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに伐採木の登録件数を取得
 * @param 所在地ID
 * @return 登録件数
 */
function fetchSurveyDataCount(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            var sql = 'SELECT COUNT(*) AS count FROM survey_data WHERE survey_detail_id = ? AND is_delete = ?';
            transaction.executeSql(sql, [surveyDetailId, false], function (ignored, resultSet) {
                resolve(resultSet.rows.item(0).count);
            });
        }, function (error, transaction) {
            alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
        });
    });
}

/**
 * 伐採木更新処理
 * @param 伐採木ID
 * @param 更新する値
 * @param 更新するカラム
 * @param 更新するテーブル
 */
function updateSurveyData(id, inputdata, column) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            var sql = 'UPDATE survey_data SET ' +
                column + ' = ?, ' +
                'modified_by = ?, ' +
                'modified_date = DATETIME(\'now\', \'localtime\') ' +
                'WHERE id = ?';
            transaction.executeSql(sql, [inputdata, fetchUserId(), id], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        })
    })
}

/**
 * 伐採木IDをもとに更新
 * @param 伐採木ID
 * @param 更新する値
 * @param 更新するカラム
 */
function updateSurveyData(id, inputdata, column) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            var sql = 'UPDATE survey_data SET ' +
                column + ' = ?, ' +
                'modified_by = ?, ' +
                'modified_date = DATETIME(\'now\', \'localtime\') ' +
                'WHERE id = ?';
            transaction.executeSql(sql, [inputdata, fetchUserId(), id], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
};

/**
 * 伐採木のWeb編集モードを全件更新
 * @param Web編集モード
 * @param 調査会社ID
 */
function updateWebEditModeSurveyDataByCompanyId(webEditMode, companyId) {
    return new Promise(function (resolve, reject) {
        database.transaction(function (transaction) {
            var sql = 'UPDATE survey_data SET web_edit_mode = ?,' +
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
};

/**
 * 伐採木IDをもとに削除フラグを立てる
 * @param 伐採木ID
 */
function deleteSurveyDataById(id) {
    return new Promise(function (resolve, reject) {
        var sql = 'UPDATE survey_data SET is_delete = ? WHERE id = ?';
        database.transaction(function (transaction) {
            transaction.executeSql(sql, ['true', id], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
};

// 伐採木データを更新（同期処理）
function updateSurveyDataOfSynchronize(transaction, surveyData) {
    return new Promise(function (resolve, reject) {
        var sql = generateSurveyDataByIdentifyCodeSQL();
        transaction.executeSql(sql, surveyData, function (transaction) {
            resolve();
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

//どこからも呼び出しがないため、下記コメントアウト
//
// // 伐採木データ同期処理済みフラグを更新（同期処理）
// function updateSurveyDataIsSynchronize(surveyDataIdList) {
//     return new Promise(function (resolve, reject) {
//         database.transaction(function (transaction) {
//             var sql = 'UPDATE survey_data SET ' +
//                 'modified_by = ?, ' +
//                 'modified_date = DATETIME(\'now\', \'localtime\') ' +
//                 'WHERE id in (' + surveyDataIdList + ')';
//             transaction.executeSql(sql, [fetchUserId()], async function (ignored, resultSet) {
//                 resolve(resultSet);
//             }, function (error, transaction) {
//                 alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
//             });
//         });
//     });
// }

// 伐採木削除（同期処理）
function deleteSurveyDataByDetailId(transaction, surveyDetailIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyDetailIdList.forEach(function (surveyDetailId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        transaction.executeSql(generateSurveyDataDeleteSql(placeholder), surveyDetailIdList, function (ignored, resultSet) {
            resolve(resultSet);
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

// uuidリストを元に伐採木削除（同期処理）
function deleteSurveyDataByIdentifyCodes(transaction, IdentifyCodes) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        IdentifyCodes.forEach(function () {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        transaction.executeSql('DELETE FROM survey_data WHERE identify_code IN (' + placeholder + ') ', IdentifyCodes, function (transaction) {
            resolve();
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

/**
 * 伐採木削除フラグがtrueのデータを削除（同期処理）
 * @param {*} transaction
 */
function deleteSurveyDataIsDetele(transaction, surveyDetailIdList) {
    return new Promise(function (resolve, reject) {
        // 削除IDの数だけプレースホルダを増やす
        var placeholderTmp = '';
        surveyDetailIdList.forEach(function (surveyDetailId) {
            placeholderTmp += '?, ';
        })
        var placeholder = placeholderTmp.slice(0, -2);
        sql = '';
        if (surveyDetailIdList.length > 0) {
            sql = 'DELETE FROM survey_data WHERE is_delete = ? AND survey_detail_id NOT IN (' + placeholder + ') ';
        } else {
            sql = 'DELETE FROM survey_data WHERE is_delete = ? ';
        }
        surveyDetailIdList.unshift('true');
        transaction.executeSql(sql, surveyDetailIdList, function (ignored, resultSet) {
            resolve(resultSet);
        }, function (error, transaction) {
            errorHandler(transaction);
            reject(false);
        });
        resolve();
    });
}

function generateSurveyDataUpdateSql() {
    return 'update survey_data SET ' +
        'cloud_survey_data_id = ? ' +
        'WHERE id = ? ';
}

function generateSurveyDataDeleteSql(placeholder) {
    return 'DELETE FROM survey_data WHERE survey_detail_id IN (' + placeholder + ') ';
}

/**
 * 所在地IDをもとに伐採木データ取得
 * @param 所在地ID
 * @return 伐採木データ
 */
function fetchSurveyDataList(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT survey_detail_id, survey_data_tree_type FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' GROUP BY survey_data_tree_type', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地ID，樹種をもとに指定した直径以下の件数取得
 * @param 所在地ID
 * @param 樹種
 * @param 直径
 * @param 条件
 * @return 件数
 */
function fetchBeforeTerrTypeMeasuredValue(surveyDetailId, treeType, measuredValue) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT COUNT(*) AS count FROM survey_data WHERE survey_detail_id = ? AND survey_data_tree_type = ? AND tree_measured_value <= ? AND is_delete = \'false\'', [surveyDetailId, treeType, measuredValue], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地ID，樹種をもとに指定した最小直径～最大直径の件数取得
 * @param 所在地ID
 * @param 樹種
 * @param 最小直径
 * @param 最大直径
 * @return 件数
 */
function fetchBeforeAndAfterTerrTypeMeasuredValue(surveyDetailId, treeType, minMeasuredValue, maxMeasuredValue) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT COUNT(*) AS count FROM survey_data WHERE survey_detail_id = ? AND survey_data_tree_type = ? AND tree_measured_value > ? AND tree_measured_value <= ? AND is_delete = \'false\'', [surveyDetailId, treeType, minMeasuredValue, maxMeasuredValue], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地ID，樹種をもとに指定した直径を超過した件数取得
 * @param 所在地ID
 * @param 樹種
 * @param 直径
 * @param 条件
 * @return 件数
 */
function fetchAfterTerrTypeMeasuredValue(surveyDetailId, treeType, measuredValue) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT COUNT(*) AS count FROM survey_data WHERE survey_detail_id = ? AND survey_data_tree_type = ? AND tree_measured_value > ? AND is_delete = \'false\'', [surveyDetailId, treeType, measuredValue], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとにIDが最新の伐採木データ取得
 * @param 所在地ID 
 */
function fetchNewSurveyData(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' ORDER BY id DESC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet.rows.item(0));
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * IDをもとに伐採木データ取得(履歴リンクから遷移時に発火)
 * @param 所在地ID 
 */
function fetchNewSurveyHistoryDataById(id) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE id = ? AND is_delete = \'false\' ORDER BY id DESC', [id], async function (ignored, resultSet) {
                resolve(resultSet.rows.item(0));
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}
/**
 * 所在地IDをもとに削除されていない伐採木の登録件数を取得
 * @param 所在地ID
 */
function fetchNotDeleteSurveyDataCount(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT COUNT(*) AS count FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\'', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet.rows.item(0).count);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとにIDが伐採木データ取得（ページング付き）
 * @param 所在地ID 
 * @param skip
 */
function fetchSurveyDataHistoryList(surveyDetailId, skip) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' ORDER BY created_date ASC LIMIT 50 OFFSET ?', [surveyDetailId, skip], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとにIDが伐採木データ取得
 * @param 所在地ID 
 */
function fetchAllSurveyDataHistoryList(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' ORDER BY created_date ASC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに伐採ロープありのデータを取得
 * @param 所在地ID 
 */
function fetchNeedRope(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' AND need_rope = \'true\' ORDER BY created_date ASC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに伐採ワイヤーありのデータを取得
 * @param 所在地ID 
 */
function fetchNeedWire(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' AND need_wire = \'true\' ORDER BY created_date ASC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに中断切りロープありのデータを取得
 * @param 所在地ID 
 */
function fetchNeedCutMiddle(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' AND need_cut_middle = \'true\' ORDER BY created_date ASC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error, transaction) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + transaction.message);
            });
        });
    });
}

/**
 * 所在地IDをもとに中断切りロープなしのデータを取得
 * @param 所在地ID 
 */
function fetchNotNeedCutMiddle(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' AND not_need_cut_middle = \'true\' ORDER BY created_date ASC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + JSON.stringify(error));
            });
        });
    });
}

/**
 * 所在地IDをもとに危険木のデータを取得
 * @param 所在地ID 
 */
function fetchIsDangerTree(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' AND is_danger_tree = \'true\' ORDER BY created_date ASC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + JSON.stringify(error));
            });
        });
    });
}

/**
 * 所在地IDをもとに枝払いありのデータを取得
 * @param 所在地ID 
 */
function fetchNeedCutBranch(surveyDetailId) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT * FROM survey_data WHERE survey_detail_id = ? AND is_delete = \'false\' AND need_cut_branch = \'true\' ORDER BY created_date ASC', [surveyDetailId], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + JSON.stringify(error));
            });
        });
    });
}


/**
 * 所在地IDと樹種をもとに件数を取得
 * @param 所在地ID
 * @param 樹種
 * @return 件数
 */
function fetchTypeMeasuredValueByTreeType(surveyDetailId, treeType) {
    return new Promise(function (resolve) {
        database.transaction(function (transaction) {
            transaction.executeSql('SELECT COUNT(*) AS count FROM survey_data WHERE survey_detail_id = ? AND survey_data_tree_type = ? AND is_delete = \'false\'', [surveyDetailId, treeType], async function (ignored, resultSet) {
                resolve(resultSet);
            }, function (error) {
                alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
            });
        });
    });
}

/**
 * IDをもとに伐採木更新(モーダル)
 * @param 更新データ
 * @param ユーザID
 */
function updateSurveyDataByIdInModal(param) {
    return new Promise(function (resolve, reject) {
        var sql = 'UPDATE survey_data SET ' +
            'name = ?, ' +
            'color = ?, ' +
            'word = ?, ' +
            'number = ?, ' +
            'branch_number= ?,' +
            'survey_data_tree_type = ?, ' +
            'tree_measured_value = ?, ' +
            'need_none = ?, ' +
            'need_rope = ?, ' +
            'need_wire = ?, ' +
            'need_cut_middle = ?, ' +
            'not_need_cut_middle = ?, ' +
            'is_danger_tree = ?, ' +
            'need_cut_branch = ?, ' +
            'note = ?, ' +
            'modified_by = ?, ' +
            'modified_date = DATETIME(\'now\', \'localtime\') ' +
            'WHERE id = ? ';
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
 * IDをもとに伐採木更新
 * @param 更新データ
 * @param ユーザID
 */
function updateSurveyDataById(param) {
    var sql = 'UPDATE survey_data SET ' +
        'color = ?, ' +
        'word = ?, ' +
        'number = ?, ' +
        'survey_data_tree_type = ?, ' +
        'tree_measured_value = ?, ' +
        'need_rope = ?, ' +
        'need_wire = ?, ' +
        'need_cut_middle = ?, ' +
        'not_need_cut_middle = ?, ' +
        'is_danger_tree = ?, ' +
        'need_cut_branch = ?, ' +
        'need_cut_divide = ?, ' +
        'need_collect = ?, ' +
        'note = ?, ' +
        'name = ?, ' +
        'modified_by = ?, ' +
        'modified_date = DATETIME(\'now\', \'localtime\') ' +
        'WHERE id = ? ';
    database.transaction(function (transaction) {
        transaction.executeSql(sql, param);
    }, function (error) {
        alert('DB接続中にエラーが発生しました。管理者へお問い合わせください。: ' + error.message);
    });
}

/**
 * identifyCodeをもとに伐採木を更新するSQL
 */
function generateSurveyDataByIdentifyCodeSQL() {
    return 'UPDATE survey_data SET ' +
        'color = ?, ' +
        'word = ?, ' +
        'number = ?, ' +
        'branch_number = ?, ' +
        'survey_data_tree_type = ?, ' +
        'tree_measured_value = ?, ' +
        'need_none = ?, ' +
        'need_rope = ?, ' +
        'need_wire = ?, ' +
        'need_cut_middle = ?, ' +
        'not_need_cut_middle = ?, ' +
        'need_cut_branch = ?, ' +
        // 'need_cut_divide = ?, ' +
        // 'need_collect = ?, ' +
        'is_danger_tree = ?, ' +
        'note = ?, ' +
        'name = ?, ' +
        'modified_by = ?, ' +
        'modified_date = ? ' +
        'WHERE identify_code = ? ';
}