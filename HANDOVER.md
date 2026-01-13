# 🚀 Deployment Handover Guide

This document contains everything you need to get `onFORMAT` live on the internet.

---

## 1. The GitHub Process
*Goal: Save your latest code to the cloud so Vercel can see it.*

Since you are non-technical, simply open your **Terminal** app (or the terminal in your code editor) and type these commands one by one. Press `Enter` after each line.

```bash
# 1. Stage all your changes
git add .

# 2. Save them with a message
git commit -m "Ready for Deployment: Feedback & Stripe Integration"

# 3. Send them to GitHub
git push origin main
```

*(Note: If you get an error saying "origin" does not exist, you may need to creating a repository on GitHub.com first and follow the "push an existing repository" instructions they give you).*

---

## 2. The Vercel Process
*Goal: Turn your code into a live website.*

1.  Go to **[vercel.com](https://vercel.com)** and Log In.
2.  Click **"Add New..."** -> **"Project"**.
3.  You should see your GitHub repository listed (e.g., `creative-os`). Click **Import**.
4.  **Important:** Do NOT click "Deploy" yet. Look for the **"Environment Variables"** section.

---

## 3. Environment Variables (The Keys)
*Goal: Give Vercel the passwords it needs to talk to Supabase and Stripe.*

In the "Environment Variables" section on Vercel, add these exactly as shown.

| Variable Name (Key) | Value (Where to find it) |
| :--- | :--- |
| **SUPABASE Keys** | |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key (Settings > API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key (Settings > API) **(Keep Secret!)** |
| | |
| **STRIPE Keys** | |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API Keys > Secret Key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Developers > Webhooks > Your Endpoint (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_FREE` | The Price ID for your Free Beta (`price_...`) |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` | The Price ID for your Pro Plan (`price_...`) |
| | |
| **APP Config** | |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g., `https://creative-os.vercel.app`) - *You can update this after deployment* |

---

## 4. Final Verification
1.  Once variables are added, click **Deploy**.
2.  Wait for the confetti! 🎉
3.  Visit your live URL.
4.  **Test:** Log in, click "Subscription (Beta)", and see if it takes you to Stripe.
5.  **Test:** Click "Send Feedback" and check your `/admin` dashboard.

---

## 5. Connecting Your Domain (onset.io)
*Goal: Use your professional GoDaddy domain instead of the `.vercel.app` one.*

1.  **In Vercel:**
    *   Go to **Settings** > **Domains**.
    *   Enter `onset.io` and click **Add**.
    *   Vercel will show you a confusing "Invalid Configuration" screen with some numbers. **Keep this open.**

2.  **In GoDaddy:**
    *   Log in and go to "My Products".
    *   Find `onset.io` and click **DNS**.
    *   **Delete** any existing "A" records with the name `@` (Parked).
    *   **Add New Record**:
        *   Type: `A`
        *   Name: `@`
        *   Value: `76.76.21.21` (This is Vercel's IP)
        *   TTL: `1 Hour` (or default)
    *   **Add Another Record**:
        *   Type: `CNAME`
        *   Name: `www`
        *   Value: `cname.vercel-dns.com`

3.  **Finish:**
    *   Go back to Vercel. It might take a few minutes (up to an hour), but it should eventually turn **Green**.
    *   Once Green, your site is live at `onset.io`!

You are ready for takeoff.
