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
