-- Your data insert statements go here;
-- Insert the two mandatory user accounts
-- Note: Password hashes are generated using pgcrypto's crypt function with a random salt
-- The passwords are 'annaadmin' and 'mollymember' as specified in the requirements

\c test

INSERT INTO members (email, password_hash, user_data)
VALUES (
  'anna@books.com',
  crypt('annaadmin', gen_salt('bf')),
  jsonb_build_object(
    'name', 'Anna Admin',
    'role', 'admin',
    'status', 'active',
    'created_at', CURRENT_TIMESTAMP,
    'last_login', NULL,
    'preferences', jsonb_build_object(
      'last_workspace', NULL,
      'last_channel', NULL,
      'last_message', NULL
    )
  )
);

INSERT INTO members (email, password_hash, user_data)
VALUES (
  'molly@books.com',
  crypt('mollymember', gen_salt('bf')),
  jsonb_build_object(
    'name', 'Molly Member',
    'role', 'member',
    'status', 'active',
    'created_at', CURRENT_TIMESTAMP,
    'last_login', NULL,
    'preferences', jsonb_build_object(
      'last_workspace', NULL,
      'last_channel', NULL,
      'last_message', NULL
    )
  )
);

-- Add a few more users for better testing
INSERT INTO members (email, password_hash, user_data)
VALUES (
  'bob@books.com',
  crypt('bobuser', gen_salt('bf')),
  jsonb_build_object(
    'name', 'Bob User',
    'role', 'member',
    'status', 'active',
    'created_at', CURRENT_TIMESTAMP,
    'last_login', NULL,
    'preferences', jsonb_build_object(
      'last_workspace', NULL,
      'last_channel', NULL,
      'last_message', NULL
    )
  )
);

INSERT INTO members (email, password_hash, user_data)
VALUES (
  'carol@books.com',
  crypt('caroluser', gen_salt('bf')),
  jsonb_build_object(
    'name', 'Carol User',
    'role', 'member',
    'status', 'away',
    'created_at', CURRENT_TIMESTAMP,
    'last_login', NULL,
    'preferences', jsonb_build_object(
      'last_workspace', NULL,
      'last_channel', NULL,
      'last_message', NULL
    )
  )
);

-- Sample data: Create workspaces, channels, and messages with variables to store IDs
DO $$
DECLARE
  cse186_id UUID;
  cse187_id UUID;
  cse191_id UUID;
  anna_id UUID;
  molly_id UUID;
  bob_id UUID;
  carol_id UUID;
  
  -- Channel IDs for CSE186
  general_186_id UUID;
  assignment1_186_id UUID;
  assignment2_186_id UUID;
  assignment3_186_id UUID;
  assignment4_186_id UUID;
  
  -- Channel IDs for CSE187
  general_187_id UUID;
  assignment1_187_id UUID;
  assignment2_187_id UUID;
  
  -- Channel IDs for CSE191
  general_191_id UUID;
  project_191_id UUID;
  
  -- Message IDs
  message1_id UUID;
  message2_id UUID;
  message3_id UUID;
  reply1_id UUID;
BEGIN
  -- Insert workspaces
  INSERT INTO workspaces (name) VALUES ('CSE186') RETURNING id INTO cse186_id;
  INSERT INTO workspaces (name) VALUES ('CSE187') RETURNING id INTO cse187_id;
  INSERT INTO workspaces (name) VALUES ('CSE191') RETURNING id INTO cse191_id;
  
  -- Get member IDs
  SELECT id INTO anna_id FROM members WHERE email = 'anna@books.com';
  SELECT id INTO molly_id FROM members WHERE email = 'molly@books.com';
  SELECT id INTO bob_id FROM members WHERE email = 'bob@books.com';
  SELECT id INTO carol_id FROM members WHERE email = 'carol@books.com';
  
  -- Add users to workspaces
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse186_id, anna_id);
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse187_id, anna_id);
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse191_id, anna_id);
  
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse186_id, molly_id);
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse191_id, molly_id);
  
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse186_id, bob_id);
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse187_id, bob_id);
  
  INSERT INTO workspace_members (workspace_id, member_id) VALUES (cse191_id, carol_id);
  
  -- Create channels for CSE186
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse186_id, 'General') 
  RETURNING id INTO general_186_id;
  
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse186_id, 'Assignment 1') 
  RETURNING id INTO assignment1_186_id;
  
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse186_id, 'Assignment 2') 
  RETURNING id INTO assignment2_186_id;
  
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse186_id, 'Assignment 3') 
  RETURNING id INTO assignment3_186_id;
  
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse186_id, 'Assignment 4') 
  RETURNING id INTO assignment4_186_id;
  
  -- Create channels for CSE187
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse187_id, 'General') 
  RETURNING id INTO general_187_id;
  
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse187_id, 'Assignment 1') 
  RETURNING id INTO assignment1_187_id;
  
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse187_id, 'Assignment 2') 
  RETURNING id INTO assignment2_187_id;
  
  -- Create channels for CSE191
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse191_id, 'General') 
  RETURNING id INTO general_191_id;
  
  INSERT INTO channels (workspace_id, name) 
  VALUES (cse191_id, 'Project') 
  RETURNING id INTO project_191_id;
  
  -- Add some sample messages to channels with specific timestamps
  -- CSE186 General channel messages
  INSERT INTO messages (channel_id, sender_id, content, sent_at) 
  VALUES (general_186_id, anna_id, 'Welcome to CSE186! This channel is for general discussion about the course.', 
          CURRENT_TIMESTAMP - INTERVAL '7 days');
  
  INSERT INTO messages (channel_id, sender_id, content, sent_at) 
  VALUES (general_186_id, molly_id, 'Hi everyone! Looking forward to the course.', 
          CURRENT_TIMESTAMP - INTERVAL '6 days 12 hours');
  
  -- CSE186 Assignment 4 channel messages
  INSERT INTO messages (channel_id, sender_id, content, sent_at) 
  VALUES (assignment4_186_id, anna_id, 'The deadline for Assignment 4 has been extended to next Friday.',
          CURRENT_TIMESTAMP - INTERVAL '2 days')
  RETURNING id INTO message1_id;
  
  INSERT INTO messages (channel_id, sender_id, content, sent_at) 
  VALUES (assignment4_186_id, bob_id, 'Could you please clarify the requirements for Part 3?',
          CURRENT_TIMESTAMP - INTERVAL '1 day 4 hours')
  RETURNING id INTO message2_id;
  
  -- Add some replies
  INSERT INTO messages (channel_id, sender_id, parent_id, content, sent_at) 
  VALUES (assignment4_186_id, anna_id, message1_id, 'This extension only applies to those who have completed the first three assignments.',
          CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours')
  RETURNING id INTO reply1_id;
  
  INSERT INTO messages (channel_id, sender_id, parent_id, content, sent_at) 
  VALUES (assignment4_186_id, molly_id, message2_id, 'Part 3 requires implementing the channel selection functionality.',
          CURRENT_TIMESTAMP - INTERVAL '10 hours');
  
  -- CSE191 Project channel messages
  INSERT INTO messages (channel_id, sender_id, content, sent_at) 
  VALUES (project_191_id, anna_id, 'Project teams will be announced next week.',
          CURRENT_TIMESTAMP - INTERVAL '5 days')
  RETURNING id INTO message3_id;
  
  INSERT INTO messages (channel_id, sender_id, parent_id, content, sent_at) 
  VALUES (project_191_id, carol_id, message3_id, 'Can we choose our own teams or will they be assigned?',
          CURRENT_TIMESTAMP - INTERVAL '4 days 8 hours');
  
  INSERT INTO messages (channel_id, sender_id, parent_id, content, sent_at) 
  VALUES (project_191_id, anna_id, message3_id, 'Teams will be self-selected, but I need to approve the final composition.',
          CURRENT_TIMESTAMP - INTERVAL '4 days 3 hours');
  
  -- Add current day messages
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_186_id, bob_id, 'Does anyone have notes from yesterdays lecture?',
          CURRENT_TIMESTAMP - INTERVAL '3 hours');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_186_id, molly_id, 'I can share mine, check your email in a few minutes.',
          CURRENT_TIMESTAMP - INTERVAL '2 hours 45 minutes');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_186_id, bob_id, 'Thanks Molly!',
          CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes');
  
  -- Add more recent messages to Assignment 2 channel
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment2_186_id, carol_id, 'Has anyone started on the extra credit portion?',
          CURRENT_TIMESTAMP - INTERVAL '1 day 18 hours');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment2_186_id, bob_id, 'Im working on it now. The recursion part is tricky.',
          CURRENT_TIMESTAMP - INTERVAL '1 day 16 hours');
  
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment2_186_id, anna_id, 'Remember that you need to handle the base cases properly.',
          CURRENT_TIMESTAMP - INTERVAL '1 day 15 hours');
  
  -- Add messages to CSE187 channels
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_187_id, anna_id, 'Welcome to CSE187! This is a more advanced course that builds on CSE186.',
          CURRENT_TIMESTAMP - INTERVAL '10 days');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_187_id, bob_id, 'Looking forward to diving deeper into these topics!',
          CURRENT_TIMESTAMP - INTERVAL '9 days 22 hours');
  
  -- Add messages to other channels to ensure all channels have some content
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment1_186_id, anna_id, 'Assignment 1 is now available in the course materials section.',
          CURRENT_TIMESTAMP - INTERVAL '20 days');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment1_186_id, molly_id, 'Is this assignment similar to last years?',
          CURRENT_TIMESTAMP - INTERVAL '19 days 23 hours');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment1_186_id, anna_id, 'Weve updated it to use the latest APIs, but the core concepts are similar.',
          CURRENT_TIMESTAMP - INTERVAL '19 days 22 hours');
  
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment3_186_id, anna_id, 'Assignment 3 focuses on authentication and authorization.',
          CURRENT_TIMESTAMP - INTERVAL '12 days');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment3_186_id, bob_id, 'Are we using JWT for this assignment?',
          CURRENT_TIMESTAMP - INTERVAL '11 days 20 hours');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (assignment3_186_id, anna_id, 'Yes, please use JWT for token-based authentication.',
          CURRENT_TIMESTAMP - INTERVAL '11 days 18 hours');
          
  -- Add messages to CSE191 general channel
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_191_id, anna_id, 'This course will focus on research methods in computer science.',
          CURRENT_TIMESTAMP - INTERVAL '15 days');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_191_id, carol_id, 'Will we be publishing our research at the end of the term?',
          CURRENT_TIMESTAMP - INTERVAL '14 days 12 hours');
          
  INSERT INTO messages (channel_id, sender_id, content, sent_at)
  VALUES (general_191_id, anna_id, 'The best projects will be recommended for publication at undergraduate research conferences.',
          CURRENT_TIMESTAMP - INTERVAL '14 days 10 hours');
  
END $$;

-- Add this to the end of the DO $$ block in data.sql, just before the END $$;

  -- Add direct messages between users
  -- Anna and Molly conversation
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (anna_id, molly_id, 'Hi Molly, how are you progressing with Assignment 3?', 
          CURRENT_TIMESTAMP - INTERVAL '3 days', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (molly_id, anna_id, 'Hi Anna! Im almost done, just working on the auth part.', 
          CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '30 minutes', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (anna_id, molly_id, 'Great! Let me know if you need any help with JWT implementation.', 
          CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '45 minutes', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (molly_id, anna_id, 'Actually, I do have a question about token expiration. Whats the recommended approach?', 
          CURRENT_TIMESTAMP - INTERVAL '2 days', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (anna_id, molly_id, 'For this assignment, a 24-hour expiration is sufficient. In production, you might use refresh tokens.', 
          CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '15 minutes', true);
  
  -- Anna and Bob conversation
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (bob_id, anna_id, 'Hello Prof. Anna, I might miss tomorrows lecture. Will it be recorded?', 
          CURRENT_TIMESTAMP - INTERVAL '1 day 4 hours', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (anna_id, bob_id, 'Yes, Bob. All lectures are recorded and posted within 24 hours.', 
          CURRENT_TIMESTAMP - INTERVAL '1 day 3 hours', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (bob_id, anna_id, 'Thank you! I appreciate it.', 
          CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours', false);
  
  -- Bob and Molly conversation
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (bob_id, molly_id, 'Hey Molly, are you joining the study group tonight?', 
          CURRENT_TIMESTAMP - INTERVAL '5 hours', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (molly_id, bob_id, 'Yes, Ill be there! Im bringing my notes from last week too.', 
          CURRENT_TIMESTAMP - INTERVAL '4 hours 30 minutes', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (bob_id, molly_id, 'Perfect! Lisa and Tom will be joining too.', 
          CURRENT_TIMESTAMP - INTERVAL '4 hours', false);
  
  -- Anna and Carol conversation
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (anna_id, carol_id, 'Carol, your project proposal looks great. Ive approved it.', 
          CURRENT_TIMESTAMP - INTERVAL '6 days', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (carol_id, anna_id, 'Thanks for the quick review! Ill get started right away.', 
          CURRENT_TIMESTAMP - INTERVAL '6 days' + INTERVAL '2 hours', true);
  
  INSERT INTO direct_messages (sender_id, recipient_id, content, sent_at, is_read)
  VALUES (anna_id, carol_id, 'Just a reminder - interim reports are due in two weeks.', 
          CURRENT_TIMESTAMP - INTERVAL '2 days 12 hours', false);