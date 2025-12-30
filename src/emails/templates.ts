// Email templates for FlowCraft authentication
// These can be used with Resend or copied into Supabase's email templates

export const emailStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #0a0a0a;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 560px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background: linear-gradient(180deg, #18181b 0%, #09090b 100%);
    border: 1px solid #27272a;
    border-radius: 16px;
    padding: 40px;
  }
  .logo {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo-text {
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  h1 {
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin: 0 0 16px 0;
  }
  p {
    color: #a1a1aa;
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 24px 0;
    text-align: center;
  }
  .button {
    display: block;
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%);
    color: #ffffff !important;
    text-decoration: none;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    margin: 24px 0;
  }
  .button:hover {
    background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  }
  .code {
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    font-family: monospace;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 8px;
    color: #ffffff;
    margin: 24px 0;
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #27272a;
  }
  .footer p {
    color: #71717a;
    font-size: 13px;
    margin: 0;
  }
  .footer a {
    color: #a855f7;
    text-decoration: none;
  }
  .small {
    font-size: 13px;
    color: #71717a;
  }
`;

// Magic Link Email
export const magicLinkTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in to FlowCraft</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">FlowCraft</span>
      </div>

      <h1>Sign in to FlowCraft</h1>

      <p>Click the button below to sign in to your account. This link will expire in 24 hours.</p>

      <a href="{{ .ConfirmationURL }}" class="button">Sign In to FlowCraft</a>

      <p class="small">If you didn't request this email, you can safely ignore it.</p>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Ventryx. All rights reserved.</p>
        <p><a href="https://flowcraft.ventryx.ai">flowcraft.ventryx.ai</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email Confirmation (Sign Up)
export const confirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm your email</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">FlowCraft</span>
      </div>

      <h1>Welcome to FlowCraft!</h1>

      <p>Thanks for signing up. Please confirm your email address by clicking the button below.</p>

      <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Address</a>

      <p class="small">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Ventryx. All rights reserved.</p>
        <p><a href="https://flowcraft.ventryx.ai">flowcraft.ventryx.ai</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Password Reset Email
export const passwordResetTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset your password</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">FlowCraft</span>
      </div>

      <h1>Reset Your Password</h1>

      <p>We received a request to reset your password. Click the button below to choose a new password.</p>

      <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>

      <p class="small">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Ventryx. All rights reserved.</p>
        <p><a href="https://flowcraft.ventryx.ai">flowcraft.ventryx.ai</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email Change Confirmation
export const emailChangeTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm email change</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">FlowCraft</span>
      </div>

      <h1>Confirm Email Change</h1>

      <p>You requested to change your email address. Click the button below to confirm this change.</p>

      <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email</a>

      <p class="small">If you didn't request this change, please contact support immediately.</p>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Ventryx. All rights reserved.</p>
        <p><a href="https://flowcraft.ventryx.ai">flowcraft.ventryx.ai</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Reauthentication Email
export const reauthenticationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify your identity</title>
  <style>${emailStyles}
  .warning {
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: 8px;
    padding: 12px 16px;
    margin: 24px 0;
  }
  .warning p {
    color: #facc15;
    font-size: 13px;
    margin: 0;
  }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">FlowCraft</span>
      </div>

      <h1>Verify Your Identity</h1>

      <p>We need to confirm it's you before proceeding with a sensitive action on your account.</p>

      <a href="{{ .ConfirmationURL }}" class="button">Verify Identity</a>

      <div class="warning">
        <p>If you did not initiate this request, please secure your account by changing your password immediately.</p>
      </div>

      <p class="small">This link will expire in 10 minutes for your security.</p>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Ventryx. All rights reserved.</p>
        <p><a href="https://flowcraft.ventryx.ai">flowcraft.ventryx.ai</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Invite User Email
export const inviteTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>You're invited to FlowCraft</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">FlowCraft</span>
      </div>

      <h1>You're Invited!</h1>

      <p>You've been invited to join FlowCraft - the free, open-source Mermaid flowchart editor. Click below to accept the invitation and create your account.</p>

      <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>

      <p class="small">This invitation will expire in 7 days.</p>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Ventryx. All rights reserved.</p>
        <p><a href="https://flowcraft.ventryx.ai">flowcraft.ventryx.ai</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;
