-- Create users table for authentication
\c test

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_data JSONB NOT NULL
);

-- Index for faster user lookup by email
CREATE INDEX idx_members_email ON members(email);

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  workspace_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Create workspace_members junction table for many-to-many relationship
CREATE TABLE workspace_members (
  workspace_id UUID NOT NULL,
  member_id UUID NOT NULL,
  PRIMARY KEY (workspace_id, member_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_member ON workspace_members(member_id);

-- Create channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  channel_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE (workspace_id, name)
);

-- Create index for faster channel lookups by workspace
CREATE INDEX idx_channels_workspace ON channels(workspace_id);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  parent_id UUID,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  message_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Create indexes for faster message lookups
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_parent ON messages(parent_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- Create direct_messages table
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  message_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Create indexes for faster direct message lookups
CREATE INDEX idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient ON direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_sent_at ON direct_messages(sent_at);

-- Create a view to easily query conversation between two users
CREATE VIEW dm_conversations AS
SELECT 
  CASE 
    WHEN sender_id < recipient_id THEN sender_id 
    ELSE recipient_id 
  END as user1_id,
  CASE 
    WHEN sender_id < recipient_id THEN recipient_id 
    ELSE sender_id 
  END as user2_id,
  id,
  sender_id,
  recipient_id,
  content,
  sent_at,
  is_read,
  is_deleted
FROM direct_messages
WHERE NOT is_deleted;

-- Create index on the view for faster lookups
CREATE INDEX idx_dm_conversations_users ON dm_conversations(user1_id, user2_id, sent_at);