"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPassword = exports.sendCertificateEmail = exports.sendRegistrationEmail = void 0;
const otp_1 = __importDefault(require("../db/otp"));
const axios_1 = __importDefault(require("axios"));
require('dotenv').config();
// TribeArc API key
const apiKey = process.env.TRIBEC_MAIL_KEY;
const fromEmail = 'lispendes@lispendes.com';
const replyToEmail = 'lispendes@lispendes.com';
const platformName = 'Lispendes';
// Send OTP via email
function sendVerificationEmail(email, otpCode, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = 'OTP Verification';
        const htmlText = `    
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
    
      <!-- Web Font / @font-face : BEGIN -->
      <!--[if mso]>
        <style type="text/css">
          body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
        </style>
      <![endif]-->
      <!--[if !mso]><!-->
      <!-- Insert web font reference, for example Google Fonts -->
      <!--<![endif]-->
    
      <!-- CSS Reset : BEGIN -->
      <style>
    
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
        }
    
        /* What it does: Stops email clients resizing small text. */
        * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
    
        /* What it does: Forces Outlook.com to display emails full width. */
        .ExternalClass {
          width: 100%;
        }
    
        /* What is does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
          margin: 0 !important;
        }
    
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
    
        /* What it does: Fixes webkit padding issue. */
        table {
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          margin: 0 auto !important;
        }
    
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
          -ms-interpolation-mode: bicubic;
        }
    
        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
          text-decoration: none;
        }
    
        /* What it does: A work-around for email clients meddling in triggered links. */
        a[x-apple-data-detectors],  /* iOS */
        .unstyle-auto-detected-links a,
        .aBn {
          border-bottom: 0 !important;
          cursor: default !important;
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
    
        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
          display: none !important;
          opacity: 0.01 !important;
        }
    
        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
          color: inherit !important;
        }
    
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
          display: none !important;
        }
    
        /* What it does: Adds a default line-height to all tables. */
        table {
          border-collapse: collapse !important;
        }
    
        /* What it does: Prevents clients from adding padding to the body. */
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
    
        /* What it does: Makes the email width 100% on all devices and remove the margin */
        .email-container {
          max-width: 600px !important;
          margin: auto !important;
        }
    
        /* What it does: Makes the text size adjustable */
        .email-container p, 
        .email-container span, 
        .email-container a, 
        .email-container li, 
        .email-container td, 
        .email-container body {
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
    
        /* What it does: Fixes Outlook.com line-height bug. */
        .email-container table {
          width: 100% !important;
        }
    
      </style>
      <!-- CSS Reset : END -->
    
      <!-- Progressive Enhancements : BEGIN -->
      <style>
    
        /* What it does: Hover styles for buttons */
        .button-td, 
        .button-a {
          transition: all 100ms ease-in;
        }
        .button-td:hover, 
        .button-a:hover {
          background: #555555 !important;
          border-color: #555555 !important;
        }
    
      </style>
      <!-- Progressive Enhancements : END -->
    
    </head>
    <body width="100%" bgcolor="#f1f1f1" style="margin: 0; mso-line-height-rule: exactly;">
      <center style="width: 100%; background: #f1f1f1; text-align: left;">
    
        <!-- Visually Hidden Preheader Text : BEGIN -->
        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          Please verify your email address
        </div>
        <!-- Visually Hidden Preheader Text : END -->
    
        <br>
        <br>
        <br>
        <!-- Create background white div : BEGIN -->
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
          <!--[if mso]>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px 20px; text-align: center; font-family: sans-serif; font-size: 24px; mso-height-rule: exactly; line-height: 1.3;">
                <h1 style="margin: 0; font-size: 24px;">One Time Password (OTP)</h1>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center;">
                <!-- Button : BEGIN -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
                  <tr>
                    <td class="button-td" style="border-radius: 4px; text-align: center;">
                      <p>Your OTP code is: ${otpCode}</p>
                    </td>
                  </tr>
                </table>
                <!-- Button : END -->
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">If you did not request this email, you can safely ignore it.</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">Thank you,<br>Lispendes</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </div>
        <br>
        <br>
        <br>
        <!-- Create background white div : END -->
    
      </center>
    </body>
    </html>
    
    `;
        const data = {
            api_key: apiKey,
            from_name: platformName,
            from_email: fromEmail,
            reply_to: replyToEmail,
            subject: subject,
            html_text: htmlText,
            track_opens: '1',
            track_clicks: '1',
            send_campaign: '1',
            json: '1',
            emails: email,
            business_address: "Lagos, Nigeria",
            business_name: 'Your Business Name',
            editor_type: 'editor'
        };
        try {
            const response = yield axios_1.default.post('https://mail.tribearc.com/api/campaigns/send_now.php', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Api-Token': apiKey
                }
            });
            const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
            const otpDocument = new otp_1.default({ otpCode, expiry, userId });
            yield otpDocument.save();
            console.log('Email sent:', response.data);
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send verification email');
        }
    });
}
// Send registration details via email
const sendRegistrationEmail = (email, password, username) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = 'New account creation details';
    const htmlText = `    
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
    
      <!-- Web Font / @font-face : BEGIN -->
      <!--[if mso]>
        <style type="text/css">
          body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
        </style>
      <![endif]-->
      <!--[if !mso]><!-->
      <!-- Insert web font reference, for example Google Fonts -->
      <!--<![endif]-->
    
      <!-- CSS Reset : BEGIN -->
      <style>
    
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
        }
    
        /* What it does: Stops email clients resizing small text. */
        * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
    
        /* What it does: Forces Outlook.com to display emails full width. */
        .ExternalClass {
          width: 100%;
        }
    
        /* What is does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
          margin: 0 !important;
        }
    
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
    
        /* What it does: Fixes webkit padding issue. */
        table {
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          margin: 0 auto !important;
        }
    
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
          -ms-interpolation-mode: bicubic;
        }
    
        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
          text-decoration: none;
        }
    
        /* What it does: A work-around for email clients meddling in triggered links. */
        a[x-apple-data-detectors],  /* iOS */
        .unstyle-auto-detected-links a,
        .aBn {
          border-bottom: 0 !important;
          cursor: default !important;
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
    
        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
          display: none !important;
          opacity: 0.01 !important;
        }
    
        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
          color: inherit !important;
        }
    
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
          display: none !important;
        }
    
        /* What it does: Adds a default line-height to all tables. */
        table {
          border-collapse: collapse !important;
        }
    
        /* What it does: Prevents clients from adding padding to the body. */
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
    
        /* What it does: Makes the email width 100% on all devices and remove the margin */
        .email-container {
          max-width: 600px !important;
          margin: auto !important;
        }
    
        /* What it does: Makes the text size adjustable */
        .email-container p, 
        .email-container span, 
        .email-container a, 
        .email-container li, 
        .email-container td, 
        .email-container body {
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
    
        /* What it does: Fixes Outlook.com line-height bug. */
        .email-container table {
          width: 100% !important;
        }
    
      </style>
      <!-- CSS Reset : END -->
    
      <!-- Progressive Enhancements : BEGIN -->
      <style>
    
        /* What it does: Hover styles for buttons */
        .button-td, 
        .button-a {
          transition: all 100ms ease-in;
        }
        .button-td:hover, 
        .button-a:hover {
          background: #555555 !important;
          border-color: #555555 !important;
        }
    
      </style>
      <!-- Progressive Enhancements : END -->
    
    </head>
    <body width="100%" bgcolor="#f1f1f1" style="margin: 0; mso-line-height-rule: exactly;">
      <center style="width: 100%; background: #f1f1f1; text-align: left;">
    
        <!-- Visually Hidden Preheader Text : BEGIN -->
        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          Please verify your email address
        </div>
        <!-- Visually Hidden Preheader Text : END -->
    
        <br>
        <br>
        <br>
        <!-- Create background white div : BEGIN -->
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
          <!--[if mso]>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px 20px; text-align: center; font-family: sans-serif; font-size: 24px; mso-height-rule: exactly; line-height: 1.3;">
                <h1 style="margin: 0; font-size: 24px;">New account creation details</h1>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">Below is your account details</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center;">
                <!-- Button : BEGIN -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
                  <tr>
                    <td class="button-td"  style="border-radius: 4px; text-align: center;">
                    Hello ${username},<br>Your new account details:<br><p>Email: ${email}</p><p>Password: ${password}</p>
                    </td>
                  </tr>
                </table>
                <!-- Button : END -->
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <br>
                <br>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0; margin:top 5px;">Thank you,<br>Lispendes</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </div>
        <br>
        <br>
        <br>
        <!-- Create background white div : END -->
    
      </center>
    </body>
    </html>
    
    `;
    const data = {
        api_key: apiKey,
        from_name: platformName,
        from_email: fromEmail,
        reply_to: replyToEmail,
        subject: subject,
        html_text: htmlText,
        track_opens: '1',
        track_clicks: '1',
        send_campaign: '1',
        json: '1',
        emails: email,
        business_address: "Lagos, Nigeria",
        business_name: 'Your Business Name',
        editor_type: 'editor'
    };
    try {
        const response = yield axios_1.default.post('https://mail.tribearc.com/api/campaigns/send_now.php', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Api-Token': apiKey
            }
        });
        console.log('Email sent successfully:', response.data);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
exports.sendRegistrationEmail = sendRegistrationEmail;
// Send email with PDF attachment
const sendCertificateEmail = (email, pdfFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = 'Certificate Attachment';
    const htmlText = `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
    
      <!-- Web Font / @font-face : BEGIN -->
      <!--[if mso]>
        <style type="text/css">
          body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
        </style>
      <![endif]-->
      <!--[if !mso]><!-->
      <!-- Insert web font reference, for example Google Fonts -->
      <!--<![endif]-->
    
      <!-- CSS Reset : BEGIN -->
      <style>
    
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
        }
    
        /* What it does: Stops email clients resizing small text. */
        * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
    
        /* What it does: Forces Outlook.com to display emails full width. */
        .ExternalClass {
          width: 100%;
        }
    
        /* What is does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
          margin: 0 !important;
        }
    
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
    
        /* What it does: Fixes webkit padding issue. */
        table {
          border-spacing: 0 !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
          margin: 0 auto !important;
        }
    
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
          -ms-interpolation-mode: bicubic;
        }
    
        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
          text-decoration: none;
        }
    
        /* What it does: A work-around for email clients meddling in triggered links. */
        a[x-apple-data-detectors],  /* iOS */
        .unstyle-auto-detected-links a,
        .aBn {
          border-bottom: 0 !important;
          cursor: default !important;
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
    
        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
          display: none !important;
          opacity: 0.01 !important;
        }
    
        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
          color: inherit !important;
        }
    
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
          display: none !important;
        }
    
        /* What it does: Adds a default line-height to all tables. */
        table {
          border-collapse: collapse !important;
        }
    
        /* What it does: Prevents clients from adding padding to the body. */
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
    
        /* What it does: Makes the email width 100% on all devices and remove the margin */
        .email-container {
          max-width: 600px !important;
          margin: auto !important;
        }
    
        /* What it does: Makes the text size adjustable */
        .email-container p, 
        .email-container span, 
        .email-container a, 
        .email-container li, 
        .email-container td, 
        .email-container body {
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
    
        /* What it does: Fixes Outlook.com line-height bug. */
        .email-container table {
          width: 100% !important;
        }
    
      </style>
      <!-- CSS Reset : END -->
    
      <!-- Progressive Enhancements : BEGIN -->
      <style>
    
        /* What it does: Hover styles for buttons */
        .button-td, 
        .button-a {
          transition: all 100ms ease-in;
        }
        .button-td:hover, 
        .button-a:hover {
          background: #555555 !important;
          border-color: #555555 !important;
        }
    
      </style>
      <!-- Progressive Enhancements : END -->
    
    </head>
    <body width="100%" bgcolor="#f1f1f1" style="margin: 0; mso-line-height-rule: exactly;">
      <center style="width: 100%; background: #f1f1f1; text-align: left;">
    
        <!-- Visually Hidden Preheader Text : BEGIN -->
        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          Please verify your email address
        </div>
        <!-- Visually Hidden Preheader Text : END -->
    
        <br>
        <br>
        <br>
        <!-- Create background white div : BEGIN -->
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
          <!--[if mso]>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px 20px; text-align: center; font-family: sans-serif; font-size: 24px; mso-height-rule: exactly; line-height: 1.3;">
                <h1 style="margin: 0; font-size: 24px;">Certificate</h1>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center;">
                <!-- Button : BEGIN -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
                  <tr>
                    <td class="button-td" style="border-radius: 4px; text-align: center;">
                      <p>Please find the certificate attached</p>
                    </td>
                  </tr>
                </table>
                <!-- Button : END -->
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">If you did not request this email, you can safely ignore it.</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0;">Thank you,<br>Lispendes</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </div>
        <br>
        <br>
        <br>
        <!-- Create background white div : END -->
    
      </center>
    </body>
    </html>
    
    `;
    const data = {
        api_key: apiKey,
        from_name: platformName,
        from_email: fromEmail,
        reply_to: replyToEmail,
        subject: subject,
        html_text: htmlText,
        track_opens: '1',
        track_clicks: '1',
        send_campaign: '1',
        json: '1',
        emails: email,
        business_address: "Lagos, Nigeria",
        business_name: 'Your Business Name',
        editor_type: 'editor'
    };
    try {
        const response = yield axios_1.default.post('https://mail.tribearc.com/api/campaigns/send_now.php', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Api-Token': apiKey
            }
        });
        console.log('Email sent successfully:', response.data);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
exports.sendCertificateEmail = sendCertificateEmail;
// Send registration details via email
const sendResetPassword = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const resetLink = token;
    const subject = 'Reset password request';
    const htmlText = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Reset Request</h1>
          <p>Hello,</p>
          <p>You are receiving this email because you requested a password reset for your account. Please click the button below to reset your password:</p>
          <a href="https://lis-pendens-enugu.vercel.app/reset-password/${resetLink}" class="button">Reset Password</a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>Lispendes</p>
        </div>
      </body>
      </html>
    `;
    const data = {
        api_key: apiKey,
        from_name: platformName,
        from_email: fromEmail,
        reply_to: replyToEmail,
        subject: subject,
        html_text: htmlText,
        track_opens: '1',
        track_clicks: '1',
        send_campaign: '1',
        json: '1',
        emails: email,
        business_address: "Lagos, Nigeria",
        business_name: 'Your Business Name',
        editor_type: 'editor'
    };
    try {
        const response = yield axios_1.default.post('https://mail.tribearc.com/api/campaigns/send_now.php', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Api-Token': apiKey
            }
        });
        console.log('Reset password sent successfully:', response.data);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
exports.sendResetPassword = sendResetPassword;
exports.default = {
    sendVerificationEmail,
    sendRegistrationEmail: exports.sendRegistrationEmail,
    sendCertificateEmail: exports.sendCertificateEmail,
    sendResetPassword: exports.sendResetPassword
};
