-- Set admin role for authorized users
-- Run this to grant admin access to whitelisted emails

-- Update existing users to have admin role
UPDATE users 
SET role = 'admin' 
WHERE email IN (
  'saasmamu@gmail.com',
  'zulaihaaliyu440@gmail.com'
);

-- Verify the update
SELECT id, email, name, role, created_at 
FROM users 
WHERE email IN (
  'saasmamu@gmail.com',
  'zulaihaaliyu440@gmail.com'
);



