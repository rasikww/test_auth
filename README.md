# TEST - OAuth 2.0 and JWT Authentication Project

This project demonstrates implementing OAuth 2.0 Authorization Code Flow with PKCE for authentication and JWT (JSON Web Token) for authorization. It includes key management, securing REST API endpoints, and using PostgreSQL for database management.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [API Endpoints](#api-endpoints)

## Installation

**Clone the Repository:**

Install Dependencies:

bash

npm install

Set Up Environment Variables:

Create a .env file in the root directory with the following content:

env

DB_CONNECTION_STRING="your_database_connection_url_string"
MY_CLIENT_ID="your_idp(google)\_client_id"
MY_CLIENT_SECRET="your_idp(google)\_client_secret"

2. Configuration

Database: Ensure PostgreSQL is running and configured according to your .env file.

Database setup:

Use following table creation queries

CREATE TABLE auth_state (
state VARCHAR(255) PRIMARY KEY,
nonce VARCHAR(255),
code_challenge VARCHAR(255),
origin_url VARCHAR(255)
);

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
username VARCHAR(255) NOT NULL UNIQUE,
email VARCHAR(255) NOT NULL UNIQUE,  
 profile_picture VARCHAR(255)  
);

CREATE TABLE user_token (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
idp_subject_id TEXT,
idp_access_token TEXT,
idp_access_token_expires_at TIMESTAMPTZ,
idp_refresh_token TEXT,
idp_refresh_token_expires_at TIMESTAMPTZ,
app_refresh_token TEXT NOT NULL,
app_refresh_token_expires_at TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()  
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_policy ON users
USING (id = current_setting('app.user_id')::uuid);

CREATE TABLE signing_key (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
private_key TEXT NOT NULL,
public_key TEXT NOT NULL,
expires_at TIMESTAMPTZ NOT NULL,
is_revoked BOOLEAN DEFAULT FALSE
);

OAuth 2.0: Update OAuth 2.0 client credentials and redirect URIs as necessary.

3. Usage

Start the Server:

bash
while in the directory where package.json file is located run
node src/server

Access the Application:

Navigate to http://localhost:3000/auth in your browser.
you will have to login to your idp(google) account.
upon successful login you will get a token to use the app.
Navigate to http://localhost:3000/api/users with providing the token in the header.

4. API Endpoints:

Use the following endpoints to interact with the API:

/auth: Initiates OAuth 2.0 authentication flow.
/auth-callback: Handles OAuth 2.0 callback from the identity provider(Google).
/token: Returns a JWT token for authenticated users.
/api/users: Protected endpoint for user information (requires JWT).
provide Headers: Authorization: Bearer <JWT>
