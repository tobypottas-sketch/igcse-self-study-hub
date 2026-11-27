# Transport verification checkpoint
The client transport now checks the authenticated identity and requires a complete acknowledgement for the exact batch. The timing clock emits integral milliseconds compatible with the server validator.
The endpoint name is reserved, not deployed. No production flag is enabled.
Release blockers: actual authenticated endpoint and trusted catalogue resolver; immutable SQL candidate validation in isolated PostgreSQL; durable queue batch limits and expiry handling; native browser tests; end-to-end verification. Existing telemetry remains untouched.
