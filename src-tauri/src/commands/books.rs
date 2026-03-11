use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// Copy a PDF file to the app's local books directory and return the destination path.
#[tauri::command]
pub async fn copy_book_file(source_path: String, app: tauri::AppHandle) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let books_dir = data_dir.join("books");
    fs::create_dir_all(&books_dir).map_err(|e| e.to_string())?;

    let src = PathBuf::from(&source_path);
    let file_name = src
        .file_name()
        .ok_or("Invalid file path")?
        .to_string_lossy()
        .to_string();

    let dest = books_dir.join(&file_name);

    if src != dest {
        fs::copy(&src, &dest).map_err(|e| e.to_string())?;
    }

    Ok(dest.to_string_lossy().to_string())
}

/// Get the file size in bytes.
#[tauri::command]
pub async fn get_file_size(file_path: String) -> Result<u64, String> {
    fs::metadata(&file_path)
        .map(|m| m.len())
        .map_err(|e| e.to_string())
}

/// Delete a file from disk.
#[tauri::command]
pub async fn delete_file(file_path: String) -> Result<(), String> {
    if PathBuf::from(&file_path).exists() {
        fs::remove_file(&file_path).map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

/// Get the app's data directory path.
#[tauri::command]
pub async fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    app.path()
        .app_data_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

/// Export a markdown string to a file in the app data directory.
#[tauri::command]
pub async fn save_export_file(
    file_name: String,
    content: String,
    app: tauri::AppHandle,
) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let exports_dir = data_dir.join("exports");
    fs::create_dir_all(&exports_dir).map_err(|e| e.to_string())?;

    let dest = exports_dir.join(&file_name);
    fs::write(&dest, content).map_err(|e| e.to_string())?;

    Ok(dest.to_string_lossy().to_string())
}
