# Microsoft sign-in staff pilot

The [pilot page](https://tobypottas-sketch.github.io/igcse-self-study-hub/microsoft-sign-in.html) is separate from the [Hub password login](https://tobypottas-sketch.github.io/igcse-self-study-hub/). Its release flag defaults to off. The first participant is the existing Hub administrator.

## Prepare production

1. In Entra **Enterprise applications → iGCSE Self-Study Hub → Properties**, set **Assignment required?** to **Yes**. In **Users and groups**, assign only the named pilot administrator directly and verify there are no broader assignments. Confirm the school tenant is the one configured in Supabase. Keep the existing Microsoft callback and Graph permissions.
2. Verify the assigned account's Entra email matches the confirmed Auth email and existing active administrator profile's school email. Verify Entra emits the `email` and `xms_edov` claims in its ID token following [Supabase's Azure guidance](https://supabase.com/docs/guides/auth/social-sign-in/auth-azure). Confirm unverified-domain authentication is disabled.
3. Verify there are no existing Azure identities, then test the version-controlled `microsoft_pilot_signup_hook` migration with Supabase Auth on staging before applying it. Insert only the confirmed administrator UUID and normalized school email into `microsoft_pilot_private.allowed_accounts` via a privileged database connection. The identity trigger blocks Azure writes for every other UUID, including anyone exempt from Entra's assignment requirement. In Supabase **Authentication → Hooks**, register `public.microsoft_pilot_before_user_created` as **Before User Created**. If an existing hook is configured, combine the policies and test their existing behavior before switching. Check that an Azure signup without an existing account is denied and that staff provisioning still works. Leave manual identity linking disabled for this pilot.
4. Add the exact pilot page URL above under Supabase **Authentication → URL Configuration → Redirect URLs**. Keep the existing production Site URL and root redirect. The OAuth callback code is appended by Supabase at runtime.
5. Confirm the assignment restriction with an unassigned school account under IT supervision. Direct OAuth requests must be denied by Entra even when they skip the pilot page. Enable the release flag only once the production controls and checks are in place.

The app uses PKCE on the pilot page and Supabase's existing automatic identity linking. The normal Hub and password recovery continue using their existing session flow. Existing account provisioning confirms the Auth email when creating the password account. Supabase decides whether to link the incoming verified Microsoft email to an existing Auth user before the browser receives the callback. The callback comparison is an additional check and does not undo any change Supabase already committed. For that reason, the Entra assignment, verified email claims, database allowlist and signup hook are prerequisites. A confirmed Hub email, by itself, does not identify the assigned Microsoft user.

## Administrator verification

1. In Supabase, privately record the existing Auth UUID, confirmed school email and current identity providers. Confirm the corresponding active Hub profile is an administrator with password setup complete. Record the administrator functionality you can already access.
2. Sign in to the Hub with your existing password. In the same browser tab, open the pilot page. Choose **Sign in with Microsoft**, select the assigned school account and complete Microsoft authentication and any MFA.
3. If the pilot verifies the account, use the Hub link and check your administrator functions. In Supabase, independently confirm that the same Auth UUID and Hub profile remain, that exactly one expected Azure identity was added to that UUID, and that there are no extra Auth accounts or profiles associated with the Microsoft sign-in.
4. Sign out and check email and password login again. If you see a different UUID, a second user, an unexpected identity, or a role or permissions change, pause the pilot. Investigate with the application owner before changing any accounts.

## Later student pilot

With a separately approved existing test student, capture the UUID, active profile, class, diagnostic, vocabulary progress, XP, purchased and equipped cosmetics, and writing submissions before sign-in. Compare the same records after sign-in. Verify staff pages and other students' records are inaccessible. Keep ordinary password sign-in available throughout.
