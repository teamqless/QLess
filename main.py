import cv2
import requests
import time
import winsound

SCRIPT_URL = "https://script.google.com/macros/s/AKfycbznWUEYDXo0lcfcV_c-31fczZWDYDQNpaD-EMUTezEnQChAFlDGPTQuUmTFBlhlP4zC/exec"

# Change to 1 or 2 if using DroidCam
CAMERA_ID = 1 

def check_online(qr_data):
    """Sends QR data to Google Sheet via Internet"""
    try:
        # Prepare data packet
        payload = {'action': 'scan', 'reg_no': qr_data}
        
        # Send to Google Script
        print(f"Sending {qr_data} to server...")
        response = requests.post(SCRIPT_URL, data=payload)
        
        # Read Response
        data = response.json()
        return data['result'], data['message']
    except Exception as e:
        print(f"Connection Error: {e}")
        return "error", "Internet Error!"

# --- MAIN SETUP ---
cap = cv2.VideoCapture(CAMERA_ID)
detector = cv2.QRCodeDetector()
last_scan = 0
msg = "Online Scanner Ready..."
color = (255, 255, 255)

print("--- JHALAK '25 ONLINE SCANNER ---")
print(f"Target: {SCRIPT_URL}")
print("Waiting for QR Codes...")

# ... (Previous code remains the same)

while True:
    success, img = cap.read()
    
    # 1. Safety Check: If camera disconnects or sends empty frame
    if not success or img is None:
        print("Camera signal lost... Retrying...")
        time.sleep(0.5)
        continue
    
    try:
        # 2. Safety Block: Protect the detection code
        data, bbox, _ = detector.detectAndDecode(img)
    except cv2.error:
        # If OpenCV crashes on a specific frame, just skip it
        continue

    if data and time.time() - last_scan > 3.0:
        print(f"Scanned: {data}")
        
        # UI Feedback "Thinking..."
        cv2.rectangle(img, (0, 0), (640, 60), (50, 50, 50), -1)
        cv2.putText(img, "Checking Server...", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        cv2.imshow('Scanner', img)
        cv2.waitKey(1) # Force UI update

        # HIT THE API
        status, text = check_online(data)
        
        last_scan = time.time()
        print(f"Server Response: {text}")

        # Feedback Logic
        if status == "success":
            msg = text
            color = (0, 255, 0) # Green
            winsound.Beep(1000, 200) # High Beep
        elif status == "dup":
            msg = text
            color = (0, 255, 255) # Yellow
            winsound.Beep(500, 500) # Long Beep
        else: # fail or error
            msg = text
            color = (0, 0, 255) # Red
            winsound.Beep(400, 800) # Error Beep

    # UI Overlay (Wrap this in try-except too just in case)
    try:
        if bbox is not None:
            for i in range(len(bbox)):
                pt1 = bbox[i][0].astype(int)
                pt2 = bbox[i][1].astype(int)
                cv2.line(img, tuple(pt1), tuple(pt2), color, 3)

        cv2.rectangle(img, (0, 0), (640, 60), (0, 0, 0), -1)
        cv2.putText(img, msg, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        cv2.imshow('Scanner', img)
    except Exception as e:
        print("UI Error (Skipping frame)")

    if cv2.waitKey(1) == ord('q'): break

cap.release()
cv2.destroyAllWindows()