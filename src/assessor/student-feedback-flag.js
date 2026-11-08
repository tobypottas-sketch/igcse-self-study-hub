// Master switch for the student feedback panel in the writing apps. KEEP FALSE until the controlled pilot is approved:
// the Worker route, quota secret, school-approved privacy notice and Supabase mode must all be ready first.
// Turning it on is a one-line change reviewed in its own pull request. The server (Supabase mode + pilot list) remains the real gate.
export const STUDENT_FEEDBACK_UI_ENABLED = false;
