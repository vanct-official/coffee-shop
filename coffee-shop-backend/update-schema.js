const db = require('./src/config/database');

async function updateSchema() {
    try {
        console.log('Adding latitude and longitude to receipt_settings...');
        try {
            await db.query('ALTER TABLE receipt_settings ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER address');
            await db.query('ALTER TABLE receipt_settings ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude');
        } catch (e) {
            console.log('receipt_settings coordinates already exist or skipped:', e.message);
        }
        
        // Cập nhật giá trị mặc định cho record hiện tại (nếu có)
        // Dựa theo userRequest: 21.026065, 105.5455133
        await db.query('UPDATE receipt_settings SET latitude = 21.026065, longitude = 105.5455133 WHERE latitude IS NULL');

        console.log('Checking main_table_id column in tables...');
        try {
            await db.query('ALTER TABLE tables ADD COLUMN main_table_id INT NULL DEFAULT NULL AFTER current_session_id, ADD INDEX idx_tables_main_table_id (main_table_id)');
            console.log('Added main_table_id to tables');
        } catch (e) {
            console.log('tables.main_table_id already exists or skipped:', e.message);
        }
        
        console.log('Successfully updated schema.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

updateSchema();

