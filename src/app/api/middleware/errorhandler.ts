export function errorHandler(error: any) {
    let status = 500;
    let message = error.message || "Internal Server Error";
  
    switch (error.name) {
      case 'invalid input':
        status = 400;
        message = error.message || 'Input tidak valid';
        break;
      case 'FileRequired':
        status = 400;
        message = error.message || 'File harus diupload';
        break;
      case 'Upload failed':
        status = 500;
        message = 'Gagal mengupload file ke Cloudinary';
        break;
      default:
        status = 500;
        message = 'ERROR 500, ANJING ERROR GK JELAS';
        break;
    }
  
    return { status, message };
  }
  