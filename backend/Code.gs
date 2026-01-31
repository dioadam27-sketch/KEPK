
/**
 * GOOGLE APPS SCRIPT BACKEND
 * Copy paste code ini ke Code.gs di Script Editor Google Sheet Anda.
 */

function doPost(e) {
  // Gunakan Lock Service untuk mencegah collision data (Race Condition)
  var lock = LockService.getScriptLock();
  
  try {
    // Tunggu maksimal 30 detik untuk mendapatkan lock
    lock.waitLock(30000); 
    
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var payload = data.payload;
    var result = {};
    
    // Auto setup jika sheet belum ada (hanya sekali cek di awal)
    setupSheets();

    switch (action) {
      case 'login':
        result = handleLogin(payload);
        break;
      case 'register':
        result = handleRegister(payload);
        break;
      case 'createSubmission':
        result = handleCreateSubmission(payload);
        break;
      case 'updateSubmissionStatus':
        result = handleUpdateSubmissionStatus(payload);
        break;
      case 'updateUserStatus':
        result = handleUpdateUserStatus(payload);
        break;
      case 'deleteUser': // NEW ACTION
        result = handleDeleteUser(payload);
        break;
      case 'addConfig':
        result = handleAddConfig(payload);
        break;
       case 'deleteConfig':
        result = handleDeleteConfig(payload);
        break;
      default:
        result = { status: 'error', message: 'Unknown action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    // Selalu lepaskan lock di akhir
    lock.releaseLock();
  }
}

function doGet(e) {
  var action = e.parameter.action;
  var result = {};
  
  // Setup sheets biasanya tidak perlu lock untuk read, tapi baik untuk memastikan sheet ada
  setupSheets(); 

  if (action === 'getSubmissions') {
    result = handleGetSubmissions(e.parameter.role, e.parameter.email);
  } else if (action === 'getUsers') {
    result = handleGetUsers();
  } else if (action === 'getConfig') {
    result = handleGetConfig();
  } else {
    result = { status: 'error', message: 'Invalid GET action' };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}


// --- HANDLERS ---

function handleCreateSubmission(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");
  
  // 1. Handle File Uploads to Google Drive
  // Frontend mengirim 'content' sebagai base64 string
  if (data.documents && data.documents.length > 0 && data.driveFolderId) {
    var folder;
    try {
      folder = DriveApp.getFolderById(data.driveFolderId);
    } catch(e) {
      return { status: 'error', message: 'Invalid Drive Folder ID' };
    }
    
    // Loop dokumen dan simpan fisik file
    for (var i = 0; i < data.documents.length; i++) {
      var doc = data.documents[i];
      if (doc.content && doc.name) { 
        try {
          var decoded = Utilities.base64Decode(doc.content);
          var blob = Utilities.newBlob(decoded, doc.mimeType, doc.name);
          var file = folder.createFile(blob);
          
          // Set Permission Public Viewer
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          doc.url = file.getUrl();
          doc.content = ""; // Kosongkan base64 setelah upload sukses untuk menghemat storage sheet
        } catch (err) {
          doc.url = "";
          doc.error = "Upload failed: " + err.toString();
          Logger.log("Failed to upload " + doc.name + ": " + err.toString());
        }
      }
    }
  }

  // 2. Save Metadata to Sheet
  sheet.appendRow([
    data.id,
    data.title,
    data.researcherName,
    data.researcherEmail,
    data.institution,
    data.description,
    data.status,
    JSON.stringify(data.documents), 
    JSON.stringify(data.selfAssessment),
    data.submissionDate,
    data.approvalDate || '',
    data.feedback || '',
    JSON.stringify(data.progressReports || [])
  ]);
  
  // UPDATE: Return documents array which now contains the Google Drive URLs
  return { 
    status: 'success', 
    message: 'Submission created successfully',
    documents: data.documents 
  };
}

function handleLogin(payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var data = sheet.getDataRange().getValues();
  
  // Skip header (i=1)
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == payload.email && data[i][6] == payload.password) { // Email col 2, Pass col 6
       var user = {
         id: data[i][0],
         name: data[i][1],
         email: data[i][2],
         role: data[i][3],
         institution: data[i][4],
         status: data[i][5],
         identityNumber: data[i][8],
         phone: data[i][9],
         joinedAt: data[i][7]
       };
       
       if (user.status !== 'active') {
         return { status: 'error', message: 'Akun belum aktif, ditangguhkan (suspend), atau ditolak.' };
       }
       return { status: 'success', data: user };
    }
  }
  return { status: 'error', message: 'Email atau password salah.' };
}

function handleRegister(payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var id = 'USR-' + Math.floor(Math.random() * 100000);
  var joinedAt = new Date().toISOString();
  
  // Cek duplikasi email
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] == payload.email) {
      return { status: 'error', message: 'Email sudah terdaftar.' };
    }
  }
  
  sheet.appendRow([
    id,
    payload.name,
    payload.email,
    payload.role,
    payload.institution,
    'pending', // Default status pending
    payload.password,
    joinedAt,
    payload.identityNumber || '',
    payload.phone || ''
  ]);
  
  return { status: 'success', message: 'Registration successful' };
}

function handleGetSubmissions(role, email) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");
  var rows = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    // Filter logic
    if (role === 'researcher' && row[3] !== email) continue; // row[3] is researcherEmail
    
    // Safety check for JSON parsing
    var documents = [];
    var selfAssessment = [];
    var progressReports = [];
    
    try { documents = JSON.parse(row[7] || "[]"); } catch(e) {}
    try { selfAssessment = JSON.parse(row[8] || "[]"); } catch(e) {}
    try { progressReports = JSON.parse(row[12] || "[]"); } catch(e) {}

    result.push({
      id: row[0],
      title: row[1],
      researcherName: row[2],
      researcherEmail: row[3],
      institution: row[4],
      description: row[5],
      status: row[6],
      documents: documents,
      selfAssessment: selfAssessment,
      submissionDate: row[9],
      approvalDate: row[10],
      feedback: row[11],
      progressReports: progressReports
    });
  }
  return { status: 'success', data: result.reverse() }; // Terbaru diatas
}

function handleGetUsers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var rows = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    result.push({
      id: row[0],
      name: row[1],
      email: row[2],
      role: row[3],
      institution: row[4],
      status: row[5],
      joinedAt: row[7],
      identityNumber: row[8],
      phone: row[9]
    });
  }
  return { status: 'success', data: result };
}

function handleUpdateSubmissionStatus(payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");
  var rows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == payload.id) { // Match ID
      // Update Status (Col G -> index 6)
      sheet.getRange(i + 1, 7).setValue(payload.status);
      
      // Update Feedback (Col L -> index 11)
      if (payload.feedback) sheet.getRange(i + 1, 12).setValue(payload.feedback);
      
      // Update Approval Date (Col K -> index 10)
      if (payload.approvalDate) sheet.getRange(i + 1, 11).setValue(payload.approvalDate);
      
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'Submission ID not found' };
}

function handleUpdateUserStatus(payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var rows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == payload.id) {
       // Status is col 6 (index 5)
       sheet.getRange(i + 1, 6).setValue(payload.status);
       return { status: 'success' };
    }
  }
  return { status: 'error', message: 'User ID not found' };
}

function handleDeleteUser(payload) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var rows = sheet.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == payload.id) {
      // Baris = i + 1
      sheet.deleteRow(i + 1);
      return { status: 'success' };
    }
  }
  return { status: 'error', message: 'User ID not found' };
}


// --- CONFIG HANDLERS ---
function handleGetConfig() {
   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
   if (!sheet) return { status: 'success', data: [] };
   
   var rows = sheet.getDataRange().getValues();
   var result = [];
   for (var i = 1; i < rows.length; i++) {
     result.push({
       id: rows[i][0],
       label: rows[i][1],
       isRequired: rows[i][2]
     });
   }
   return { status: 'success', data: result };
}

function handleAddConfig(payload) {
   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
   sheet.appendRow([payload.id, payload.label, payload.isRequired]);
   return { status: 'success' };
}

function handleDeleteConfig(payload) {
   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
   var rows = sheet.getDataRange().getValues();
   for (var i = 1; i < rows.length; i++) {
     if (rows[i][0] == payload.id) {
       sheet.deleteRow(i + 1);
       return { status: 'success' };
     }
   }
   return { status: 'error' };
}

// --- SETUP UTILS ---

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Users Sheet
  if (!ss.getSheetByName("Users")) {
    var s = ss.insertSheet("Users");
    s.appendRow(["ID", "Name", "Email", "Role", "Institution", "Status", "Password", "JoinedAt", "IdentityNumber", "Phone"]);
  }
  
  // 2. Submissions Sheet
  if (!ss.getSheetByName("Submissions")) {
    var s = ss.insertSheet("Submissions");
    s.appendRow(["ID", "Title", "ResearcherName", "ResearcherEmail", "Institution", "Description", "Status", "DocumentsJSON", "AssessmentJSON", "SubmissionDate", "ApprovalDate", "Feedback", "ProgressReportsJSON"]);
  }

  // 3. Config Sheet
  if (!ss.getSheetByName("Config")) {
    var s = ss.insertSheet("Config");
    s.appendRow(["ID", "Label", "IsRequired"]);
    // Add defaults
    s.appendRow(["protocol", "Protokol Lengkap (PDF)", true]);
    s.appendRow(["consent", "Informed Consent / PSP", true]);
  }
}
