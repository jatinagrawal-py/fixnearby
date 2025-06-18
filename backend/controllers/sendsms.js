import axios from 'axios'

const BASE_URL = 'https://api.textbee.dev/api/v1'
const API_KEY = "ebded941-c417-4e3a-988e-1fca38e3fd3a"
const DEVICE_ID = "684c242d7ed0c508631bf5ce"

export const  sendSignupOTP = async (number,otp)=> {
  try {
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients: [`+91${number}`], // <-- Your number
        message: `Your FixNearby OTP is ${otp}. It is valid for 1 hour. Do not share it with anyone.`
      },
      {
        headers: { 'x-api-key': API_KEY }
      }
    )
    console.log(response.data.data.success)
    return response.data.data.success   // data.sucesss
  } catch (err) {
    console.error('Error sending SMS:', err.response?.data || err.message)
  }
}

export const  serviceAccepted = async (usernumber,username,number,name,issue)=> {
  try {
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients: [`+91${usernumber}`], // <-- Your number
        message: `Hi ${username}, a FixNearby repairer has accepted your service request.\nName: ${name}\nContact: +91${number}\nIssue: "${issue}". Please call your repairer accordingly.`
      },
      {
        headers: { 'x-api-key': API_KEY }
      }
    )
    console.log(response)
    return response.data.data.success   // data.sucesss
  } catch (err) {
    console.error('Error sending SMS:', err.response?.data || err.message)
  }
}

export const  serviceCompleteOTP = async (usernumber,otp,issue,estimatedPrice)=> {
  try {
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients: [`+91${usernumber}`], // <-- Your number
        message:  `To confirm completion of your FixNearby service for "${issue}", verify OTP: ${otp} . Pay ₹${estimatedPrice} via website QR Code.`

      },
      {
        headers: { 'x-api-key': API_KEY }
      }
    )

    return response.data.data.success   // data.sucesss
  } catch (err) {
    console.error('Error sending SMS:', err.response?.data || err.message)
  }
}