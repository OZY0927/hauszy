# Telegram enquiries

1. Run `supabase/telegram-settings.sql` once in the Supabase SQL Editor for the database already used by this site's image storage. The host needs the existing `SUPABASE_SECRET_KEY` configuration.
2. Create a Telegram bot with @BotFather. Start your bot in the destination private chat, or add it to the receiving group with permission to send messages.
3. Find that chat's numeric ID from Telegram's getUpdates API after sending the bot a message (group IDs are negative). Never paste the bot token into public pages or logs.
4. In Admin → Settings → Telegram enquiries, save the bot token, destination chat ID and enable delivery. A blank token on future saves preserves the saved token; it is never returned by the settings API.
5. Submit an enquiry and viewing request on the website to verify receipt. Success is shown only after Telegram returns `ok: true`. No live bot message is sent during automated tests.

The private Supabase table is protected by RLS and only accessible using the server service role. Public forms send only to the saved destination; visitors cannot choose a bot or recipient. Enquiry contents are not persisted by the website. Same-origin checks, bounded request bodies, validation, duplicate-submit protection and a per-instance rate limiter are applied. Use hosting-level rate limits for shared abuse protection across instances.

API reference: https://core.telegram.org/bots/api#sendmessage
