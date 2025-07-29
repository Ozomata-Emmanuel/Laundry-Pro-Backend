export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email | Laundry Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
  </style>
</head>
<body style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <div style="background: #0A2463; padding: 25px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-weight: 600; font-size: 22px;">Verify Your Email Address</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin: 0 0 20px 0;">Welcome to Laundry Pro! We're excited to have you on board.</p>
    <p style="margin: 0 0 20px 0;">To complete your registration and start using our laundry services, please enter the following verification code in the app or website:</p>
    
    <div style="background: #F5F9FF; border: 1px solid #3E92CC; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <div style="font-size: 32px; font-weight: 600; letter-spacing: 3px; color: #0A2463; padding: 10px 0; margin: 0 auto; display: inline-block;">{verificationCode}</div>
    </div>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #555;">This verification code will expire in 15 minutes for security purposes. If you didn't request this code, please disregard this email or contact our support team immediately.</p>
    
    <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 20px;">
      <p style="margin: 0 0 10px 0; font-weight: 500; color: #0A2463;">Getting Started:</p>
      <p style="margin: 0 0 15px 0; font-size: 14px;">Once verified, you can schedule your first laundry pickup in just a few taps. We offer same-day service for orders placed before 12 PM.</p>
    </div>
    
    <p style="margin: 25px 0 0 0;">Thank you for choosing Laundry Pro.<br><strong>The Laundry Pro Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 25px; color: #7A7A7A; font-size: 12px; line-height: 1.5;">
    <p style="margin: 0;">If you need assistance, please contact our support team at support@laundrypro.com</p>
    <p style="margin: 8px 0 0 0;">© {currentYear} Laundry Pro. All rights reserved.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Updated | Laundry Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
  </style>
</head>
<body style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <div style="background: #0A2463; padding: 25px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-weight: 600; font-size: 22px;">Password Successfully Updated</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin: 0 0 20px 0;">Your Laundry Pro account password has been successfully updated as of {time} on {date}.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: #0A2463; color: white; width: 70px; height: 70px; line-height: 70px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    
    <div style="background: #F5F9FF; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 500; color: #0A2463;">Account Security Note:</p>
      <p style="margin: 0; font-size: 14px;">If you did not make this change, please contact our support team immediately at support@laundrypro.com. We take account security seriously and will help secure your account.</p>
    </div>
    
    <p style="margin: 25px 0 0 0;">You can now log in to your account with your new password to schedule laundry services or manage your account.<br><strong>The Laundry Pro Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 25px; color: #7A7A7A; font-size: 12px; line-height: 1.5;">
    <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
    <p style="margin: 8px 0 0 0;">© {currentYear} Laundry Pro. All rights reserved.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password | Laundry Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
  </style>
</head>
<body style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <div style="background: #0A2463; padding: 25px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-weight: 600; font-size: 22px;">Reset Your Password</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin: 0 0 20px 0;">We received a request to reset your Laundry Pro account password.</p>
    <p style="margin: 0 0 20px 0;">To create a new password, please click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background: #3E92CC; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; display: inline-block;">Reset Password</a>
    </div>
    
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #555;">This password reset link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email - your account remains secure.</p>
    
    <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 20px;">
      <p style="margin: 0 0 10px 0; font-weight: 500; color: #0A2463;">Password Tips:</p>
      <p style="margin: 0 0 15px 0; font-size: 14px;">When creating your new password, we recommend using a combination of letters, numbers, and special characters. Avoid using passwords you've used elsewhere.</p>
    </div>
    
    <p style="margin: 25px 0 0 0;">If you have any questions about your account security, please don't hesitate to contact us.<br><strong>The Laundry Pro Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 25px; color: #7A7A7A; font-size: 12px; line-height: 1.5;">
    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
    <p style="margin: 8px 0 0 0;">© {currentYear} Laundry Pro. All rights reserved.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Laundry Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
  </style>
</head>
<body style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <div style="background: #0A2463; padding: 25px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-weight: 600; font-size: 22px;">Welcome to Laundry Pro!</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; border-top: none;">
    <p style="margin: 0 0 20px 0;">Thank you for creating your Laundry Pro account. We're committed to making your laundry experience simple and hassle-free.</p>
    
    <div style="border-left: 4px solid #3E92CC; padding-left: 15px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 500; color: #0A2463;">Here's what you can do now:</p>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Schedule pickups and deliveries at your convenience</li>
        <li style="margin-bottom: 8px;">Track your laundry orders in real-time</li>
        <li style="margin-bottom: 0;">Save your preferences for faster future orders</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="{appURL}" style="background: #3E92CC; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; display: inline-block;">Start Your First Order</a>
    </div>
    
    <div style="background: #F5F9FF; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 500; color: #0A2463;">Need Help?</p>
      <p style="margin: 0; font-size: 14px;">Visit our <a href="{helpURL}" style="color: #3E92CC; text-decoration: none;">Help Center</a> for FAQs or contact our customer service team at support@laundrypro.com. We're here to help 7 days a week.</p>
    </div>
    
    <p style="margin: 25px 0 0 0;">We look forward to serving your laundry needs.<br><strong>The Laundry Pro Team</strong></p>
  </div>
  <div style="text-align: center; margin-top: 25px; color: #7A7A7A; font-size: 12px; line-height: 1.5;">
    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
    <p style="margin: 8px 0 0 0;">© {currentYear} Laundry Pro. All rights reserved.</p>
  </div>
</body>
</html>`;