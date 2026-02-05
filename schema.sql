
-- lookcerto.com Database Schema (Mozambique & International)
-- Compatible with PostgreSQL

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'GRÁTIS',
    credits INTEGER DEFAULT 5,
    currency VARCHAR(10) DEFAULT 'MZN', -- Added currency support
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mockups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    person_image_url TEXT NOT NULL,
    product_image_url TEXT NOT NULL,
    result_image_url TEXT NOT NULL,
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) DEFAULT 'STRIPE', -- MPESA, STRIPE, PAYPAL
    external_ref VARCHAR(255),
    status VARCHAR(50),
    plan_type VARCHAR(50),
    current_period_end TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_mockups_user ON mockups(user_id);
CREATE INDEX idx_users_email ON users(email);
