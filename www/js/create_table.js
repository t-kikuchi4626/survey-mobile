document.addEventListener("deviceready", function () {
    database.transaction(function (transaction) {
        executeQuery(transaction);
    }, function (error, transaction) {
        alert("Error occured while executing SQL: " + error.message);
    });
});

function executeQuery(tx) {
    // tx.executeSql('DROP TABLE survey_area');
    // tx.executeSql('DROP TABLE survey_data');
    // tx.executeSql('DROP TABLE survey');
    // tx.executeSql('DROP TABLE survey_detail');
    // tx.executeSql('DROP TABLE synchronize_result');
    // tx.executeSql('DROP TABLE synchronize_result_detail');
    // tx.executeSql('DROP TABLE web_edit_mode');
    // tx.executeSql('DROP TABLE code_master');
    tx.executeSql(createSurveyTable);
    tx.executeSql(createSurveySetailTable);
    tx.executeSql(createSurveyAreaTable);
    tx.executeSql(createSurveyDataTable);
    tx.executeSql(createsSnchronizeResultTable);
    tx.executeSql(createsSnchronizeResultDetailTable);
    tx.executeSql(createsWebEditModeTable);
    tx.executeSql(createsWebEditModeResultTable);
    tx.executeSql(createCodeMasterTable);
    alterTable(tx, "survey_data", "survey_company_id", "INTEGER");
}

/**
 * ALTER TABLE でSQLlite(cordva)でIF NOT EXITSが使えないため下記で対応
 * @param tx トランザクション
 * @param tablename テーブル名
 * @param columnname カラム名
 * @param datatype データ型
 * */
function alterTable(tx, tablename, columnname, datatype) {
    tx.executeSql('select ' + columnname + ' from ' + tablename + '', [],
        function (tx, results) {
            console.log('coloumn exists');
        }, function (err) {
            console.log(tablename + ' - ' + columnname + ' select error ' + err);
            tx.executeSql('ALTER TABLE ' + tablename + ' ADD COLUMN ' + columnname + ' ' + datatype + '', [],
                function (tx, results) { },
                function (err) {
                    alert(tablename + ' - ' + columnname + ' alter error ' + err);
                }
                )
            return false;
        }
    )
}

var createSurveyTable = 'CREATE TABLE IF NOT EXISTS survey ' +
    '(id INTEGER, ' +
    'center_id INTEGER, ' +
    'survey_name TEXT, ' +
    'survey_company_id INTEGER, ' +
    'survey_company_name TEXT, ' +
    'survey_year TEXT, ' +
    'business_period_from DATE, ' +
    'business_period_to DATE, ' +
    'note TEXT, ' +
    'is_show BOOLEAN, ' +
    'status BOOLEAN, ' +
    'tree_type_value TEXT, ' +
    'special_tree TEXT, ' +
    'created_by INTEGER, ' +
    'created_date TIMESTAMP, ' +
    'modified_by INTEGER, ' +
    'modified_date TIMESTAMP)';

var createSurveySetailTable = 'CREATE TABLE IF NOT EXISTS survey_detail ' +
    '(id INTEGER, ' +
    'detail_number INTEGER, ' +
    'survey_id INTEGER, ' +
    'status BOOLEAN, ' +
    'survey_address TEXT, ' +
    'line_name TEXT, ' +
    'steal_tower_start TEXT, ' +
    'steal_tower_end TEXT, ' +
    'area_owner_name TEXT, ' +
    'area_owner_address TEXT, ' +
    'area_owner_tel TEXT, ' +
    'survey_witness_name TEXT, ' +
    'survey_witness_address TEXT, ' +
    'survey_witness_tel TEXT, ' +
    'area_classification TEXT, ' +
    's_numbering_sequence INTEGER, ' +
    'numbering_sequence INTEGER, ' +
    'created_by INTEGER, ' +
    'created_date TIMESTAMP, ' +
    'modified_by INTEGER, ' +
    'modified_date TIMESTAMP, ' + 
    'price_type TEXT, ' +
    'price_sub_type TEXT, ' +
    'all_need_cut_divide BOOLEAN, ' +
    'all_need_collect BOOLEAN, ' + 
    'order_number INTEGER, ' +
    'mobile_id INTEGER)';

var createSurveyAreaTable = 'CREATE TABLE IF NOT EXISTS survey_area ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'survey_company_id INTEGER, ' +
    'identify_code TEXT,' +
    'survey_detail_id INTEGER, ' +
    'tree_type TEXT, ' +
    'tree_measured_value INTEGER, ' +
    'trimming_area_value TEXT, ' +
    'trimming_tree_area_value TEXT, ' +
    'trimming_tree_count TEXT, ' +
    'target_area_value TEXT, ' +
    'target_area_value_ten TEXT, ' +
    'need_collect BOOLEAN, ' +
    'is_four_measured BOOLEAN, ' +
    'is_delete TEXT, ' +
    'web_edit_mode TEXT,' +
    'created_by INTEGER, ' +
    'created_date TIMESTAMP, ' +
    'modified_by INTEGER, ' +
    'modified_date TIMESTAMP, ' +
    'mobile_id INTEGER)';

var createSurveyDataTable = 'CREATE TABLE IF NOT EXISTS survey_data ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'survey_company_id INTEGER, ' +
    'identify_code TEXT,' +
    'color TEXT,' +
    'word TEXT,' +
    'number INTEGER,' +
    'branch_number INTEGER,' +
    'survey_detail_id INTEGER, ' +
    'survey_data_tree_type TEXT, ' +
    'tree_measured_value INTEGER, ' +
    'need_none BOOLEAN, ' +
    'need_rope BOOLEAN, ' +
    'need_wire BOOLEAN, ' +
    'need_cut_middle BOOLEAN, ' +
    'not_need_cut_middle BOOLEAN, ' +
    'need_cut_branch BOOLEAN, ' +
    'is_danger_tree BOOLEAN, ' +
    'is_delete BOOLEAN, ' +
    'latitude TEXT, ' +
    'longitude TEXT, ' +
    'note TEXT,' +
    'name TEXT,' +
    'web_edit_mode TEXT,' +
    'created_by INTEGER, ' +
    'created_date TIMESTAMP, ' +
    'modified_by INTEGER, ' +
    'modified_date TIMESTAMP, ' + 
    'mobile_id INTEGER)';

var createsSnchronizeResultTable = 'CREATE TABLE IF NOT EXISTS synchronize_result ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'status TEXT, ' +
    'company_id TEXT, ' +
    'message TEXT, ' +
    'modified_by INTEGER, ' +
    'modified_date TEXT)';

var createsSnchronizeResultDetailTable = 'CREATE TABLE IF NOT EXISTS synchronize_result_detail ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'synchronize_id INTEGER, ' +
    'cloud_synchronize_id INTEGER, ' +
    'status TEXT, ' +
    'message TEXT, ' +
    'modified_by INTEGER, ' +
    'modified_date TEXT)';

var createsWebEditModeTable = 'CREATE TABLE IF NOT EXISTS web_edit_mode ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'survey_company_id INTEGER, ' +
    'web_edit_mode TEXT, ' +
    'modified_by INTEGER, ' +
    'modified_date TEXT)';

var createsWebEditModeResultTable = 'CREATE TABLE IF NOT EXISTS web_edit_mode_result ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'status TEXT)';

var alterSurveyTable = 'ALTER TABLE survey ADD COLUMN company_id INTEGER';

var createCodeMasterTable = 'CREATE TABLE IF NOT EXISTS code_master ' +
    '(id INTEGER, ' +
    'category INTEGER, ' +
    'category_code INTEGER,' +
    'label TEXT, ' +
    'value INTEGER, ' +
    'order_number INTEGER, ' +
    'is_active BOOLEAN, ' +
    'created_by INTEGER, ' +
    'created_date TIMESTAMP, ' +
    'modified_by INTEGER, ' +
    'modified_date TIMESTAMP)';