# Microsoft sign-in staff pilot

The pilot uses a separate entry point, `microsoft-sign-in.html`. Password sign-in remains available at the Hub. The pilot button starts hidden and is controlled by `MICROSOFT_STAFF_PILOT_ENABLED` in `src/microsoft-sign-in.js`.

## Before enabling

- Ask IT to replace any exposed Entra client secret. Enter the replacement directly into the Supabase Azure provider settings.
- Restrict the single-tenant enterprise application to an explicitly assigned staff test group in Entra. The pilot page is a user-facing entry point. Entra assignments must restrict who can authenticate through the provider.
- Verify the Entra app emits a trustworthy email identity for linking. Follow the Supabase Azure provider guidance for the `xms_edov` claim and verified domains. Verify that only pilot staff have matching, active Hub profiles before enabling the provider.
- Use the Web redirect URI `https://grjshlamooglytsajoun.supabase.co/auth/v1/callback` in Entra. In Supabase, configure the Azure provider with the application ID, replacement secret and the school tenant URL in the form `https://login.microsoftonline.com/<tenant-id>`.
- Add the exact GitHub Pages pilot callback URL to the Supabase redirect allowlist, including the query string `?microsoft-return=1`. Keep the existing Hub redirect configuration.
- Enable the pilot flag only when the provider and access restrictions are ready.

After the first sign-in, compare the Hub profile UUID, role and class assignments with the participant's existing password login. Confirm a different or unassigned account is denied. The pilot page rejects sessions without an Azure identity or an active, fully set-up teacher or administrator profile. It never creates Hub profiles or assigns roles.

[Supabase Azure provider guidance](https://supabase.com/docs/guides/auth/social-sign-in/auth-azure)
