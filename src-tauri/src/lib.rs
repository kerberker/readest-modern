mod commands;
mod db;
mod models;

use commands::books::{
    copy_book_file, delete_file, get_app_data_dir, get_file_size, save_export_file,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:readest.db", db::get_migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            copy_book_file,
            delete_file,
            get_app_data_dir,
            get_file_size,
            save_export_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
