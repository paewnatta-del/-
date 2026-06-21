const LINE_TOKEN = ""; // กรุณาใส่ LINE Notify Token ของแพทย์หรือกลุ่มที่ต้องการแจ้งเตือน

function doPost(e) {
  try {
    // ตรวจสอบว่ามีข้อมูลถูกส่งมาหรือไม่
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("No data provided").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // แปลงข้อมูลจาก String เป็น JSON Object
    const data = JSON.parse(e.postData.contents);
    const patient = data.patient;
    const triageLevel = data.triage;
    const symptoms = data.symptoms;
    
    // ส่งแจ้งเตือนเฉพาะเมื่อเป็น Red หรือ Yellow flag
    if (triageLevel === "Red" || triageLevel === "Yellow") {
      
      // เลือก Emoji ตามความรุนแรง
      const alertEmoji = triageLevel === "Red" ? "🚨 [RED FLAG] ฉุกเฉิน" : "⚠️ [YELLOW FLAG] เฝ้าระวัง";
      
      // จัดรูปแบบข้อความ
      let message = `\n${alertEmoji}\nแจ้งเตือนอาการผิดปกติเส้นฟอกไต\n`;
      message += `----------------------------\n`;
      message += `ข้อมูลผู้ป่วย:\n`;
      message += `- เพศ: ${patient.gender}\n`;
      message += `- อายุ: ${patient.age} ปี\n`;
      message += `- โรคประจำตัว: ${patient.disease}\n`;
      message += `- ตำแหน่งเส้น: ${patient.location}\n`;
      message += `- แพทย์ผู้ดูแล: ${patient.doctor}\n`;
      message += `----------------------------\n`;
      message += `อาการที่พบ:\n`;
      
      symptoms.forEach((symptom, index) => {
        message += `${index + 1}. ${symptom}\n`;
      });
      
      message += `----------------------------\n`;
      message += `กรุณาพิจารณาให้คำแนะนำหรือติดต่อผู้ป่วยค่ะ`;

      // ส่งข้อความเข้า LINE Notify
      if (LINE_TOKEN !== "") {
        sendLineNotify(message);
      }
    }
    
    // ส่งสถานะกลับไปว่าทำงานสำเร็จ
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // ส่งสถานะ Error กลับไป
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
