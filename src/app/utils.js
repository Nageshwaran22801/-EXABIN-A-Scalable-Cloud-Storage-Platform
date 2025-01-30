function getClientTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, 
      timeZone: getClientTimeZone()
    });
  
    return formattedDate.replace(',', ''); // Removes the comma between date and time
}

export function formatSize(bytes){
  if (bytes === 0) return '0 Bytes';
  const k = 1024; // 1 KB = 1024 Bytes
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k)); // Determine the size unit
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
  