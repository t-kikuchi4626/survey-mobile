/**
 * 同期処理結果をローカルDBへ反映する
 * @param {*} data 
 */
 async function synchronizeWebToMobile(synchronizeToMobile) {
    console.log("test2")
    alert(2)
    let data = JSON.parse(synchronizeToMobile);
    var surveyList = await convertSurveyList(data.insertSurveyList);
    var updateSurveyList = await convertSurveyList(data.updateSurveyList);
    var surveyDetailList = await convertSurveyDetailList(data.insertSurveyDetailList);
    var updateSurveyDetailList = await convertSurveyDetailList(data.updateSurveyDetailList);
    var surveyDeatilIdIfIsNotShow = await fetchsurveyDeatilIdIfIsNotShow(data.isShowFalseList);
    var surveyDetailIdIsSurveyIsDelete = await fetchSurveyDetailIdIsSurveyIsDelete(data.deleteSurveyList);
    var surveyDetailIdIsSurveyIsStatusTrue = await fetchSurveyDetailIdBySurveyStatusIsTrue(data.updateSurveyList);
    var updateSurveyDataList = await convertSurveyDataList(data.surveyDataList);
    var deleteSurveyDataList = await convertDeleteList(data.surveyDataList);
    var updateSurveyAreaList = await convertSurveyAreaList(data.surveyAreaList);
    var deleteSurveyAreaList = await convertDeleteList(data.surveyAreaList);
    var updateMobileInsertSurveyAreaList = await convertMobileSurveyAreaList(data.mobileUpdateSurveyArea);
    var updateMobileInsertSurveyDataList = await convertMobileSurveyDataList(data.mobileUpdateSurveyData);
   
    // 既に登録済みの場合は登録対象外
    let insertSurveyList = [];
    let insertSurveyDetailList = [];
    for (var i = 0; i < surveyList.length; i++) {
        let survey = await fetchSurveyById(surveyList[i][0]);
        if (survey.rows.length == 0) {
            insertSurveyList.push(surveyList[i]);
        }
    }

    for (var i = 0; i < surveyDetailList.length; i++) {
        let surveyDitail = await fetchSurveyDetailById(surveyDetailList[i][0]);
        if (surveyDitail.rows.length == 0) {
            insertSurveyDetailList.push(surveyDetailList[i]);
        }
    }
    // 伐採木データ更新
    if (updateSurveyDataList != null) {
        for (var i = 0; i < updateSurveyDataList.length; i++) {
            await updateSurveyDataOfSynchronize(updateSurveyDataList[i]);
        }
    }

    return new Promise(async function (resolve, reject) {
        database.transaction(async function (transaction) {
            // 調査業務登録
            if (insertSurveyList != null) {
                for (var i = 0; i < insertSurveyList.length; i++) {
                    // 既に登録済みの場合は登録対象外
                    await insertSurvey(transaction, insertSurveyList[i]);
                }
            }
            // 調査業務更新
            if (updateSurveyList != null) {
                for (var i = 0; i < updateSurveyList.length; i++) {
                    // WHERE句用のIDを末尾に付与
                    updateSurveyList[i].push(updateSurveyList[i][0]);
                    await updateSurvey(transaction, updateSurveyList[i]);
                }
            }
            // 調査業務削除
            if (data.deleteSurveyList.length > 0) {
                await deleteSurvey(transaction, data.deleteSurveyList);
                await deleteSurveyDetailBySurveyId(transaction, data.deleteSurveyList);
            }
            if (surveyDetailIdIsSurveyIsDelete.length > 0) {
                await deleteSurveyDataByDetailId(transaction, surveyDetailIdIsSurveyIsDelete);
                await deleteSurveyAreaByDetailId(transaction, surveyDetailIdIsSurveyIsDelete);
            }
            // 調査業務非表示
            if (data.isShowFalseList.length > 0) {
                await deleteSurvey(transaction, data.isShowFalseList);
                await deleteSurveyDetailBySurveyId(transaction, data.isShowFalseList);
            }
            if (surveyDeatilIdIfIsNotShow.length > 0) {
                await deleteSurveyDataByDetailId(transaction, surveyDeatilIdIfIsNotShow);
                await deleteSurveyAreaByDetailId(transaction, surveyDeatilIdIfIsNotShow);
            }
            // 調査明細データ新規登録
            if (insertSurveyDetailList != null) {
                let surveyDetailIdIsNullList =[]
                for (var i = 0; i < insertSurveyDetailList.length; i++) {
                    await insertSurveyDetail(transaction, insertSurveyDetailList[i]);
                    surveyDetailIdIsNullList.push(insertSurveyDetailList[i][2])
                }
                surveyDetailIdIsNullList = Array.from(new Set(surveyDetailIdIsNullList))
                await deleteSurveyDetailBySurveyDetailIdIsNull(transaction, surveyDetailIdIsNullList);
            }
            // 調査明細データ更新
            if (updateSurveyDetailList != null) {
                for (var i = 0; i < updateSurveyDetailList.length; i++) {
                    updateSurveyDetailList[i].push(updateSurveyDetailList[i][0]);
                    await updateSurveyDetail(transaction, updateSurveyDetailList[i]);
                }
            }
            // 調査明細データ削除
            if (data.deleteSurveyDetailList.length > 0) {
                await deleteSurveyDetailById(transaction, data.deleteSurveyDetailList);
                await deleteSurveyDataByDetailId(transaction, data.deleteSurveyDetailList);
                await deleteSurveyAreaByDetailId(transaction, data.deleteSurveyDetailList);
            }

            // 伐採木データを削除
            if (deleteSurveyDataList != null) {
                await deleteSurveyDataByIdentifyCodes(transaction, deleteSurveyDataList);
            }

            // 小径木データを削除
            if (deleteSurveyAreaList != null) {
                await deleteSurveyAreaByIdentifyCodes(transaction, deleteSurveyAreaList);
            }

            // 小径木データ更新
            if (updateSurveyAreaList != null) {
                for (var i = 0; i < updateSurveyAreaList.length; i++) {
                    await updateSurveyAreaOfSynchronize(transaction, updateSurveyAreaList[i]);
                }
            }

            if (updateMobileInsertSurveyAreaList != null) {
                for (var i = 0; i < updateMobileInsertSurveyAreaList.length; i++) {
                    await updateSurveyAreaOfSynchronize(transaction, updateMobileInsertSurveyAreaList[i]);
                }
            }

            // 伐採木データ更新
            if (updateMobileInsertSurveyDataList != null) {
                for (var i = 0; i < updateMobileInsertSurveyDataList.length; i++) {
                    await updateSurveyDataOfSynchronizeMobile(transaction, updateMobileInsertSurveyDataList[i]);
                }
            }

            resolve();
        }, function (error, transaction) {
            $('#error').text('DB接続中にエラーが発生しました。管理者へお問い合わせください。');
            $('#errorMessage').text(transaction.message);
            $('#synchronizeError').modal('open');
            reject(transaction);
        });

    });
};


/**
 * 調査業務を登録用に変換
 * @param {*} surveyData 
 */
function convertSurveyList(surveyData) {
    var surveyList = [];

    surveyData.forEach(function (survey) {
        var param = [
            survey['id'],
            survey['centerId'],
            survey['surveyName'],
            survey['surveyCompanyId'],
            survey['surveyCompanyName'],
            survey['surveyYear'],
            survey['surveyPeriodFrom'],
            survey['surveyPeriodTo'],
            survey['note'],
            survey['isShow'],
            survey['status'],
            survey['treeTypeValue'],
            survey['specialTree'],
            survey['createdBy'],
            survey['createdDate'],
            survey['modifiedBy'],
            survey['modifiedDate']
        ]
        surveyList.push(param)
    });

    return surveyList;
}

/**
 * 調査明細を登録用に変換
 * @param {*} surveyDetailData 
 */
function convertSurveyDetailList(surveyDetailData) {
    var surveyDetailList = [];

    surveyDetailData.forEach(function (surveyDetail) {
        var param = [
            surveyDetail['id'],
            surveyDetail['detailNumber'],
            surveyDetail['surveyId'],
            surveyDetail['surveyAddress'],
            surveyDetail['lineName'],
            surveyDetail['stealTowerStart'],
            surveyDetail['stealTowerEnd'],
            surveyDetail['areaOwnerName'],
            surveyDetail['areaOwnerAddress'],
            surveyDetail['areaOwnerTel'],
            surveyDetail['surveyWitnessName'],
            surveyDetail['surveyWitnessAddress'],
            surveyDetail['surveyWitnessTel'],
            surveyDetail['areaClassification'],
            surveyDetail['createdBy'],
            surveyDetail['createdDate'],
            surveyDetail['modifiedBy'],
            surveyDetail['modifiedDate'],
        ]

        surveyDetailList.push(param)
    });

    return surveyDetailList;
}

/**
 * 伐採木データ登録用に変換
 * @param {*} list
 */
function convertSurveyDataList(list) {
    var surveyDataList = [];
    list.forEach(function (surveyData) {
        if (surveyData['isDelete'] === 'true') {
            return;
        }
        var param = [
            surveyData['color'],
            surveyData['word'],
            surveyData['number'],
            surveyData['branchNumber'],
            surveyData['treeType'],
            surveyData['treeMeasuredValue'],
            surveyData['needNone'],
            surveyData['needRope'],
            surveyData['needWire'],
            surveyData['needCutMiddle'],
            surveyData['needCutBranch'],
            surveyData['isDangerTree'],
            surveyData['note'],
            surveyData['name'],
            surveyData['modifiedBy'],
            surveyData['modifiedDate'],
            surveyData['identifyCode'],
            surveyData['surveyDetailId'],
        ]
        surveyDataList.push(param)
    });

    return surveyDataList;
}

/**
 * 伐採木データ登録用に変換
 * @param {*} list
 */
 function convertMobileSurveyDataList(list) {
    var surveyDataList = [];
    if(list.length === 0){
        return surveyDataList
    }
    list.forEach(function (surveyData) {
        if (surveyData['is_delete'] === 'true') {
            return;
        }
        var param = [
            surveyData[0]['color'],
            surveyData[0]['word'],
            surveyData[0]['number'],
            surveyData[0]['branch_number'],
            surveyData[0]['tree_type'],
            surveyData[0]['tree_measured_value'],
            surveyData[0]['survey_detail_id'],
            surveyData[0]['need_none'],
            surveyData[0]['need_rope'],
            surveyData[0]['need_wire'],
            surveyData[0]['need_cut_middle'],
            surveyData[0]['need_cut_branch'],
            surveyData[0]['is_danger_tree'],
            surveyData[0]['note'],
            surveyData[0]['name'],
            surveyData[0]['modified_by'],
            surveyData[0]['modified_date'],
            surveyData[0]['identify_code'],
        ]
        surveyDataList.push(param)
    });

    return surveyDataList;
}

/**
 * 削除対象のデータを取得
 * @param {*} list
 */
function convertDeleteList(list) {
    var deleteList = [];
    list.forEach(function (target) {
        if (target['isDelete'] === true) {
            deleteList.push(target['identifyCode'])
        }
    });
    return deleteList;
}

/**
 * 小径木データ登録用に変換
 * @param {*} list
 */
function convertSurveyAreaList(list) {
    var surveyAreaList = [];
    list.forEach(function (surveyArea) {
        var param = [
            surveyArea['treeType'],
            surveyArea['trimmingAreaValue'],
            surveyArea['trimmingTreeAreaValue'],
            surveyArea['trimmingTreeCount'],
            surveyArea['targetAreaValue'],
            surveyArea['targetAreaValueTen'],
            surveyArea['needCollect'],
            surveyArea['isFourMeasured'],
            surveyArea['modifiedBy'],
            surveyArea['modifiedDate'],
            surveyArea['identifyCode'],
            surveyArea['surveyDetailId']
        ]
        surveyAreaList.push(param)
    });

    return surveyAreaList;
}

/**
 * 小径木データ登録用に変換(survey_detail_idがnullで登録されたデータのみ)
 * @param {*} list
 */
 function convertMobileSurveyAreaList(list) {
    var surveyAreaList = [];
    if(list.length === 0){
        return surveyAreaList
    }
    list.forEach(function (surveyArea) {
        var param = [
            surveyArea[0]['tree_type'],
            surveyArea[0]['trimming_area_value'],
            surveyArea[0]['trimming_tree_area_value'],
            surveyArea[0]['trimming_tree_count'],
            surveyArea[0]['target_area_value'],
            surveyArea[0]['target_area_value_ten'],
            surveyArea[0]['need_collect'],
            surveyArea[0]['is_four_measured'],
            surveyArea[0]['modified_by'],
            surveyArea[0]['modified_date'],
            surveyArea[0]['identify_code'],
        ]
        surveyAreaList.push(param)
    });

    return surveyAreaList;
}

/**
 * 調査明細のIDリストを取得
 * @param {*} isNotShowId 
 */
async function fetchSurveyDeatilIdListBySurveyIds(surveyIds) {
    var surveyDetailIdList = [];
    var surveyDetailList = await fetchSurveyDetailBySurveyIds(surveyIds);
    for (var i = 0; i < surveyDetailList.rows.length; i++) {
        surveyDetailIdList.push(surveyDetailList.rows.item(i).id);
    }

    return surveyDetailIdList;
}

/**
 * 調査業務が削除されたデータに紐づく調査明細IDを取得
 * @param {*} deleteSurveyList 
 */
async function fetchSurveyDetailIdIsSurveyIsDelete(deleteSurveyList) {
    var surveyDetailIdIsSurveyIsDelete = [];
    if (deleteSurveyList.length > 0) {
        surveyDetailIdIsSurveyIsDelete = await fetchSurveyDeatilIdListBySurveyIds(deleteSurveyList);
    }
    return surveyDetailIdIsSurveyIsDelete;
}

/**
 * 調査業務がの表示が「非表示」のデータに紐づく調査明細IDを取得
 * @param {*} isShowFalseList 
 */
async function fetchsurveyDeatilIdIfIsNotShow(isShowFalseList) {
    var surveyDeatilIdIfIsNotShow = [];
    if (isShowFalseList.length > 0) {
        surveyDeatilIdIfIsNotShow = await fetchSurveyDeatilIdListBySurveyIds(isShowFalseList);
    }
    return surveyDeatilIdIfIsNotShow;
}

/**
 * 調査業務の状態が「完了」のデータに紐づく調査明細IDを取得
 * @param {*} updateSurveyList 
 */
async function fetchSurveyDetailIdBySurveyStatusIsTrue(updateSurveyList) {
    var surveyDetailIdIsSurveyIsStatusTrue = [];
    var statusIsTrueList = [];
    // 調査業務更新データのうち、状態が「非表示」のデータを取得
    if (updateSurveyList.length > 0) {
        for (var i = 0; i < updateSurveyList.length; i++) {
            if (updateSurveyList[i].status == true) {
                statusIsTrueList.push(updateSurveyList[i].id);
            }
        }
    }
    // ローカルDB内のうち、状態が「完了」のデータを取得
    var surveyStatusIsTrue = await fetchSurveyAllStatusIsTrue(surveyCompanyId);
    for (var i = 0; i < surveyStatusIsTrue.rows.length; i++) {
        statusIsTrueList.push(surveyStatusIsTrue.rows.item(i).id);
    }
    if (statusIsTrueList.length > 0) {
        surveyDetailIdIsSurveyIsStatusTrue = await fetchSurveyDeatilIdListBySurveyIds(statusIsTrueList);
    }

    return surveyDetailIdIsSurveyIsStatusTrue;
}

/**
 * コードマスタ―を登録用に変換
 * @param {*} codeMasterData
 */
 function convertCodeMaster(codeMasterData) {
    var codeMasterList = [];

    codeMasterData.forEach(function (codeMaster) {
        var param = [
            codeMaster['id'],
            codeMaster['category'],
            codeMaster['category_code'],
            codeMaster['label'],
            codeMaster['value'],
            codeMaster['order_number'],
            codeMaster['is_activate'],
            codeMaster['created_by'],
            codeMaster['created_date'],
            codeMaster['modified_by'],
            codeMaster['modified_date']
        ]
        codeMasterList.push(param)
    });

    return codeMasterList;
}