# Cognito Client Secret Fix

## Problem
Your current App Client has a client secret enabled, causing "SECRET_HASH was not received" error.

## Solution
Create a new App Client without client secret:

### Steps:
1. Go to Cognito Console → User pools → us-east-1_5eyUXAamx
2. App integration → **Create app client**
3. App client name: `electro-web-public`
4. **Client secret: Don't generate** (leave unchecked)
5. Auth flows: Enable `ALLOW_USER_PASSWORD_AUTH` and `ALLOW_USER_SRP_AUTH`
6. Create app client
7. Copy the new Client ID

### Update Files:
Replace all instances of `135fgcksti97eha1jo8ui0jqjv` with your new Client ID in:
- register.html (3 places)
- login.html (1 place)

### Alternative:
Delete the current app client and create a new one without secret, keeping the same name.