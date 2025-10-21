# Ayrshare API Key Troubleshooting Guide

## 🚨 Error: "API Key not valid" (Code 102)

This error occurs when the Ayrshare API key is not properly configured or sent in the request headers.

## 🔍 Step-by-Step Troubleshooting

### Step 1: Verify Environment Variable

1. **Check if `.env.local` exists** in your project root
2. **Add the API key** to `.env.local`:
   ```bash
   AYRSHARE_API_KEY="your-actual-api-key-here"
   ```
3. **Restart your development server** after adding the environment variable:
   ```bash
   npm run dev
   ```

### Step 2: Get Your Ayrshare API Key

1. Go to [Ayrshare Dashboard](https://app.ayrshare.com/)
2. Sign up or log in to your account
3. Navigate to **API Settings** or **Developer** section
4. Generate a new API key
5. Copy the complete API key (it should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Test API Connection

Visit this URL in your browser to test the connection:
```
http://localhost:3000/api/ayrshare/test
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Ayrshare API connection successful",
  "accountsCount": 0,
  "accounts": []
}
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "AYRSHARE_API_KEY environment variable is required...",
  "details": "Check your AYRSHARE_API_KEY in .env.local file"
}
```

### Step 4: Common Issues & Solutions

#### Issue 1: Environment Variable Not Loading
**Symptoms:** API key appears as `undefined` in logs
**Solution:**
- Ensure `.env.local` is in the project root (same level as `package.json`)
- Restart your development server
- Check for typos in the variable name: `AYRSHARE_API_KEY`

#### Issue 2: Invalid API Key Format
**Symptoms:** "API Key not valid" error
**Solution:**
- Verify the API key is complete (not truncated)
- Ensure no extra spaces or quotes around the key
- Generate a new API key from Ayrshare dashboard

#### Issue 3: API Key Not Active
**Symptoms:** Authentication errors
**Solution:**
- Check if your Ayrshare account is active
- Verify the API key hasn't expired
- Ensure you have the correct permissions

### Step 5: Debug Information

Check your browser's developer console and server logs for:

1. **API Key Loading:**
   ```
   Initializing Ayrshare client with API key: eyJhbGciOi...
   ```

2. **Request Headers:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Error Details:**
   ```
   Ayrshare API Error: {"action":"authorization","status":"error","code":102...}
   ```

## 🛠️ Manual API Key Test

You can test your API key manually using curl:

```bash
curl -X GET "https://app.ayrshare.com/api/profiles" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "status": "success",
  "profiles": []
}
```

**Error Response:**
```json
{
  "action": "authorization",
  "status": "error",
  "code": 102,
  "message": "API Key not valid..."
}
```

## 📋 Environment Variable Checklist

- [ ] `.env.local` file exists in project root
- [ ] `AYRSHARE_API_KEY="your-key"` is added
- [ ] No extra spaces or quotes around the key
- [ ] Development server restarted after adding the key
- [ ] API key is valid and active in Ayrshare dashboard

## 🔧 Quick Fix Commands

```bash
# 1. Create .env.local if it doesn't exist
touch .env.local

# 2. Add your API key (replace with your actual key)
echo 'AYRSHARE_API_KEY="your-actual-api-key-here"' >> .env.local

# 3. Restart development server
npm run dev

# 4. Test the connection
curl http://localhost:3000/api/ayrshare/test
```

## 📞 Still Having Issues?

1. **Check Ayrshare Documentation:** [Ayrshare API Docs](https://www.ayrshare.com/docs/apis/overview#authorization)
2. **Verify Account Status:** Ensure your Ayrshare account is active
3. **Contact Support:** Reach out to Ayrshare support if the API key is still not working
4. **Check Server Logs:** Look for detailed error messages in your terminal

## ✅ Success Indicators

When everything is working correctly, you should see:
- ✅ API key loads successfully in server logs
- ✅ Test endpoint returns success response
- ✅ Connected accounts load (even if empty)
- ✅ No authorization errors in browser console

Remember: The API key must be added to `.env.local` and the server must be restarted for the changes to take effect!







