const LINE_TOKEN = ""; // กรุณาใส่ LINE Notify Token 

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("No data provided").setMimeType(ContentService.MimeType.TEXT);
    }
    
    const data = JSON.parse(e.postData.contents);
    const patient = data.patient;
    const triageLevel = data.triage;
    const symptoms = data.symptoms;
    
    if (triageLevel === "Red" || triageLevel === "Yellow") {
      
      const alertEmoji = triageLevel === "Red" ? "🚨 [RED FLAG] ฉุกเฉิน" : "⚠️ [YELLOW FLAG] เฝ้าระวัง";
      
      // เพิ่มการแจ้งเตือนถึง @paewnatta
      let message = `\n${alertEmoji}\nแจ้งเตือนถึง @paewnatta\n`;
      message += `----------------------------\n`;
      message += `ข้อมูลผู้ป่วยเบื้องต้น:\n`;
      message += `- เพศ: ${patient.gender}\n`;
      message += `- อายุ: ${patient.age} ปี\n`;
      message += `- ตำแหน่งเส้น: ${patient.location}\n`;
      message += `- แพทย์ผู้ดูแล: ${patient.doctor}\n`;
      message += `----------------------------\n`;
      message += `อาการผิดปกติที่พบ:\n`;
      
      symptoms.forEach((symptom, index) => {
        message += `${index + 1}. ${symptom}\n`;
      });
      
      message += `----------------------------\n`;
      message += triageLevel === "Red" ? `ด่วน! กรุณาพิจารณาให้คำแนะนำหรือติดต่อผู้ป่วยทันทีค่ะ` : `กรุณาพิจารณาติดตามอาการผู้ป่วยค่ะ`;

      if (LINE_TOKEN !== "") {
        sendLineNotify(message);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendLineNotify(message) {
  const url = "https://notify-api.line.me/api/notify";
  const options = {
    "method": "post",
    "payload": {
      "message": message
    },
    "headers": {
      "Authorization": "Bearer " + LINE_TOKEN
    }
  };
  
  UrlFetchApp.fetch(url, options);
}
