# 🔐 Beta System Setup Guide

## Overview

The BingoShop beta system allows you to control access during the closed beta phase by requiring users to have a valid beta code to register.

## Configuration

### Enable/Disable Beta Mode

Edit your `.env` file:

```bash
# Enable beta mode (requires beta code for registration)
BETA_MODE="true"

# Disable beta mode (open registration)
BETA_MODE="false"
```

## Database Migration

After pulling the beta system code, you need to run the Prisma migration:

```bash
cd backend

# Generate Prisma client with new BetaCode model
npx prisma generate

# Create and apply the migration
npx prisma migrate dev --name add_beta_system

# Or for production:
npx prisma migrate deploy
```

## Admin Usage

### 1. Access Beta Management Dashboard

Navigate to: `https://your-domain.com/admin/beta`

### 2. Generate Beta Codes

Use the generation form to create codes:
- **Nombre**: How many codes to generate (1-100)
- **Préfixe**: Code prefix (e.g., "BINGO", "LAUNCH", "INFLUENCER")
- **Expiration**: Days until codes expire (optional)
- **Notes**: Internal notes for tracking (optional)

Example generated codes:
```
BINGO-A3K9
BINGO-X7M2
LAUNCH-P5Q8
```

### 3. Distribute Codes

Copy codes from the dashboard and distribute to beta testers via:
- Email campaigns
- Social media
- Influencer partnerships
- Discord/Telegram communities

### 4. Monitor Usage

The dashboard shows:
- **Total codes**: All generated codes
- **Available**: Codes not yet used
- **Used**: Codes already claimed
- **Expired**: Codes past their expiration date
- **Usage Rate**: Percentage of codes used

## API Endpoints

### Check Beta Status (Public)
```bash
GET /beta/status
```

Response:
```json
{
  "betaModeEnabled": true
}
```

### Validate Code (Public)
```bash
POST /beta/validate
{
  "code": "BINGO-A3K9"
}
```

Response:
```json
{
  "valid": true,
  "message": "Code is valid"
}
```

### Generate Codes (Admin Only)
```bash
POST /beta/generate
Authorization: Bearer <admin-token>
{
  "count": 50,
  "prefix": "LAUNCH",
  "expiresInDays": 30,
  "notes": "Launch week batch"
}
```

### Get All Codes (Admin Only)
```bash
GET /beta/codes
Authorization: Bearer <admin-token>
```

### Get Statistics (Admin Only)
```bash
GET /beta/stats
Authorization: Bearer <admin-token>
```

### Delete Code (Admin Only)
```bash
DELETE /beta/codes/:id
Authorization: Bearer <admin-token>
```

## Registration Flow

When beta mode is enabled:

1. User visits `/register`
2. User sees beta code input field: "Code Beta 🎮"
3. User enters beta code (e.g., `BINGO-A3K9`)
4. Backend validates:
   - Code exists
   - Code is available (not used/expired)
   - Code expiration date (if set)
5. If valid, user is registered and code is marked as USED
6. If invalid, registration fails with error message

## Best Practices

### Launch Strategy

**Week 1 (Closed Beta)**
```bash
BETA_MODE="true"
# Generate 50 codes for friends & family
# Test all features with small group
```

**Week 2-4 (Controlled Beta)**
```bash
BETA_MODE="true"
# Generate 200 codes for early adopters
# Send via email list, social media
# Monitor feedback and fix issues
```

**Month 2+ (Public Launch)**
```bash
BETA_MODE="false"
# Open registration to everyone
# Keep existing codes for tracking purposes
```

### Code Naming Conventions

- `BINGO-XXXX` - General beta codes
- `LAUNCH-XXXX` - Launch week special codes
- `INFLUENCER-XXXX` - Codes for influencers
- `VIP-XXXX` - VIP early access codes
- `FRIEND-XXXX` - Friends & family codes

### Security

- ✅ Beta codes are single-use only
- ✅ Codes are stored hashed in database
- ✅ Admin authentication required for management
- ✅ Rate limiting prevents brute force attempts
- ✅ Codes auto-expire after set period

## Troubleshooting

### "Beta code required" error

User sees this when trying to register with beta mode enabled without a code.

**Solution**: Provide user with a valid beta code or disable beta mode.

### "Invalid or expired beta code"

Code doesn't exist, already used, or past expiration date.

**Solution**: Generate new codes or extend expiration dates.

### Can't access admin dashboard

User isn't authenticated as admin.

**Solution**: Ensure user has `role: "ADMIN"` in database.

## Database Schema

```prisma
enum BetaCodeStatus {
  AVAILABLE
  USED
  EXPIRED
}

model BetaCode {
  id         String         @id @default(cuid())
  code       String         @unique
  status     BetaCodeStatus @default(AVAILABLE)
  usedBy     String?        // User ID who used this code
  usedAt     DateTime?
  expiresAt  DateTime?
  createdBy  String         // Admin ID who created this code
  createdAt  DateTime       @default(now())
  notes      String?
}
```

## Support

If you encounter issues:
1. Check `.env` file has correct `BETA_MODE` setting
2. Verify database migration ran successfully
3. Check admin role is set correctly
4. Review server logs for detailed error messages

---

🎮 **Ready to Launch!** Generate your first batch of beta codes and start building your community.
