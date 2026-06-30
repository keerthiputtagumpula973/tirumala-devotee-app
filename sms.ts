/**
 * Sends a 6-digit OTP code to a mobile number using the Fast2SMS REST API.
 * Automatically falls back to local simulation if no Fast2SMS API key is configured.
 */
export interface SmsResult {
  success: boolean;
  message: string;
}

export const sendSmsOtp = async (mobile: string, otp: string): Promise<SmsResult> => {
  const apiKey = import.meta.env.VITE_FAST2SMS_API_KEY;

  // Detect if API key is still placeholder or empty -> fallback to local simulation
  const isConfigured = !!(apiKey && apiKey !== 'your_fast2sms_api_key' && apiKey.trim() !== '');

  if (!isConfigured) {
    console.log(`[SIMULATED SMS] Fast2SMS key not set. Code for ${mobile}: ${otp}`);
    return {
      success: true,
      message: 'SIMULATION: OTP has been logged to the console.'
    };
  }

  try {
    // Fast2SMS expects a 10-digit Indian mobile number
    const sanitizedMobile = mobile.replace(/^\+91/, '').replace(/\D/g, '');

    // Trigger HTTP GET Request to Fast2SMS Bulk SMS / OTP endpoint
    const response = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${encodeURIComponent(otp)}&numbers=${encodeURIComponent(sanitizedMobile)}`,
      {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: `Gateway returned status ${response.status}.`
      };
    }

    const data = await response.json();
    if (data.return) {
      return {
        success: true,
        message: data.message[0] || 'SMS sent successfully.'
      };
    } else {
      return {
        success: false,
        message: data.message || 'SMS provider returned an error.'
      };
    }
  } catch (error: any) {
    console.error('Fast2SMS Gateway Error:', error);
    return {
      success: false,
      message: error.message || 'Network error connecting to SMS gateway.'
    };
  }
};
