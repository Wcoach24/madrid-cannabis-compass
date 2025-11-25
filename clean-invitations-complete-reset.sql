-- Complete Reset: Delete ALL invitation requests and audit logs
-- This script will:
-- 1. Delete all audit log entries
-- 2. Delete all invitation requests
-- 3. Reset ID sequences to start from 1

-- Step 1: Delete all audit logs first (due to foreign key reference)
DELETE FROM invitation_audit_log;

-- Step 2: Delete all invitation requests
DELETE FROM invitation_requests;

-- Step 3: Reset sequence counters so new IDs start from 1
ALTER SEQUENCE invitation_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE invitation_audit_log_id_seq RESTART WITH 1;

-- Verify the cleanup (should return 0 rows)
SELECT COUNT(*) as invitation_requests_count FROM invitation_requests;
SELECT COUNT(*) as audit_log_count FROM invitation_audit_log;

-- Check that sequences are reset (should show last_value = 1)
SELECT last_value FROM invitation_requests_id_seq;
SELECT last_value FROM invitation_audit_log_id_seq;
