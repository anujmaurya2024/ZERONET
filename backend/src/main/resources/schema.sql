-- ==============================================================================
-- ZeroNet AI Real-Time Translation Database Schema Migration
-- Compatible with MySQL, PostgreSQL, and H2
-- ==============================================================================

-- 1. User Language Preferences
CREATE TABLE IF NOT EXISTS user_language_settings (
    user_id VARCHAR(64) PRIMARY KEY,
    preferred_display_language VARCHAR(10) NOT NULL DEFAULT 'en',
    preferred_incoming_language VARCHAR(10) NOT NULL DEFAULT 'en',
    default_outgoing_language VARCHAR(10) NOT NULL DEFAULT 'en',
    auto_translate_incoming BOOLEAN NOT NULL DEFAULT TRUE,
    auto_detect_language BOOLEAN NOT NULL DEFAULT TRUE,
    explain_technical_terms BOOLEAN NOT NULL DEFAULT TRUE,
    display_preference VARCHAR(20) NOT NULL DEFAULT 'BOTH',
    updated_at BIGINT NOT NULL
);

-- 2. Canonical Messages Table (Original Message Preservation)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    original_content TEXT NOT NULL,
    original_language VARCHAR(10) NOT NULL DEFAULT 'en',
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',
    created_at BIGINT NOT NULL,
    edited_at BIGINT,
    deleted_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at);

-- 3. Message Translations Table (Separate from Original Content)
CREATE TABLE IF NOT EXISTS message_translations (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_content TEXT NOT NULL,
    translation_provider VARCHAR(50) NOT NULL DEFAULT 'composite',
    translation_version VARCHAR(20) NOT NULL DEFAULT 'v1',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    CONSTRAINT uq_msg_target_version UNIQUE (message_id, target_language, translation_version)
);

CREATE INDEX IF NOT EXISTS idx_translations_msg ON message_translations(message_id);
CREATE INDEX IF NOT EXISTS idx_translations_target ON message_translations(target_language);

-- 4. Technical Term Explanations Table
CREATE TABLE IF NOT EXISTS technical_term_explanations (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    explanation_content TEXT NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'ai-glossary',
    created_at BIGINT NOT NULL,
    CONSTRAINT uq_exp_msg_target UNIQUE (message_id, target_language)
);

CREATE INDEX IF NOT EXISTS idx_explanations_msg ON technical_term_explanations(message_id);

-- ==============================================================================
-- 5. Mobile Number Accounts & Verification
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_phone_accounts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    phone_number_e164 VARCHAR(30) NOT NULL,
    country_code VARCHAR(10) NOT NULL DEFAULT '+91',
    display_name VARCHAR(100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    CONSTRAINT uq_phone_user UNIQUE (user_id),
    CONSTRAINT uq_verified_phone UNIQUE (phone_number_e164)
);

CREATE INDEX IF NOT EXISTS idx_phone_user ON user_phone_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_e164 ON user_phone_accounts(phone_number_e164);

-- 6. OTP Verifications (Cryptographically hashed, salted, rate-limited)
CREATE TABLE IF NOT EXISTS phone_otp_verifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    phone_number_e164 VARCHAR(30) NOT NULL,
    otp_hash VARCHAR(128) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    expires_at BIGINT NOT NULL,
    last_sent_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON phone_otp_verifications(phone_number_e164);
CREATE INDEX IF NOT EXISTS idx_otp_user ON phone_otp_verifications(user_id);

-- 7. User Privacy Settings
CREATE TABLE IF NOT EXISTS user_privacy_settings (
    user_id VARCHAR(64) PRIMARY KEY,
    discovery_visibility VARCHAR(20) NOT NULL DEFAULT 'EVERYONE',
    phone_visibility VARCHAR(20) NOT NULL DEFAULT 'CONTACTS',
    allow_contact_discovery BOOLEAN NOT NULL DEFAULT TRUE,
    allow_message_requests BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 8. User Address Book Contacts
CREATE TABLE IF NOT EXISTS user_contacts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    contact_phone_e164 VARCHAR(30) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    created_at BIGINT NOT NULL,
    CONSTRAINT uq_user_contact UNIQUE (user_id, contact_phone_e164)
);

CREATE INDEX IF NOT EXISTS idx_contacts_user ON user_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON user_contacts(contact_phone_e164);

-- 9. User Blocks & Moderation
CREATE TABLE IF NOT EXISTS user_blocks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    blocked_user_id VARCHAR(64) NOT NULL,
    reason VARCHAR(255),
    created_at BIGINT NOT NULL,
    CONSTRAINT uq_user_block UNIQUE (user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_user ON user_blocks(user_id);

-- 10. Direct Conversations (Prevents duplicate 1-to-1 conversations)
CREATE TABLE IF NOT EXISTS direct_conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_one_id VARCHAR(64) NOT NULL,
    user_two_id VARCHAR(64) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    CONSTRAINT uq_direct_pair UNIQUE (user_one_id, user_two_id)
);

CREATE INDEX IF NOT EXISTS idx_direct_user_one ON direct_conversations(user_one_id);
CREATE INDEX IF NOT EXISTS idx_direct_user_two ON direct_conversations(user_two_id);

