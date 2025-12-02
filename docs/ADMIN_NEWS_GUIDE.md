# Admin News Dashboard - Quick Start Guide

## 🚀 Accessing the Admin Dashboard

**URL:** `http://localhost:3001/admin/news`

---

## 📝 How to Generate News Articles

### Step 1: Configure Article Count
Select the number of articles you want to generate (1-6) from the dropdown menu.

### Step 2: Generate Articles
Click the **"Generate Articles"** button. The system will:
- Use OpenAI GPT-4o to create professional articles
- Generate content about real estate tokenization topics
- Assign random categories (Tokenization, Markets, Technology, Regulation, DeFi, Infrastructure)
- Calculate estimated read times

### Step 3: Review Generated Content
Each generated article displays:
- **Category badge** (colored tag)
- **Title** (compelling headline)
- **Summary** (2-3 sentence overview)
- **Full content** (expandable details section)
- **Read time** (estimated minutes)
- **Publication date**

### Step 4: Save to Database
Click **"Save to Site"** to:
- Import articles into the database
- Make them available on the landing page
- Get feedback on import statistics (imported/skipped)

### Step 5: Clear (Optional)
Click **"Clear"** to remove generated articles from the preview without saving.

---

## 🎯 Article Topics

The AI generates articles about:
- Commercial real estate tokenization trends
- Blockchain in property investment
- Fractional ownership opportunities
- AI-powered real estate valuation
- DeFi lending for property investors
- Regulatory updates for digital assets
- Institutional adoption of tokenized real estate
- Sustainable infrastructure investments
- Data center real estate boom
- Multifamily housing tokenization
- REIT vs tokenized property comparison
- Cross-border real estate investment

---

## 📊 Article Categories

Generated articles are randomly assigned to these categories:
- **Tokenization** - Asset tokenization and blockchain integration
- **Markets** - Market trends and analysis
- **Technology** - Tech innovations and platforms
- **Regulation** - Legal and compliance updates
- **DeFi** - Decentralized finance applications
- **Infrastructure** - Real estate infrastructure developments

---

## 🔧 API Endpoints

### Generate Articles
```bash
POST /api/news/generate
Content-Type: application/json

{
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "articles": [...],
  "message": "Generated 3 news articles"
}
```

### Import Articles
```bash
POST /api/admin/import-news
Content-Type: application/json

{
  "articles": [
    {
      "title": "Article Title",
      "summary": "Brief summary",
      "content": "Full content",
      "category": "Tokenization",
      "readTime": 5,
      "publishedAt": "Dec 2, 2025"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "imported": 3,
  "skipped": 0,
  "total": 3
}
```

### List Articles
```bash
GET /api/news?limit=10&published=true
```

### Get Single Article
```bash
GET /api/news/[slug-or-id]
```

---

## ⚙️ Environment Setup

Required environment variables in `/apps/dashboard/.env`:

```env
# OpenAI API Key (required for article generation)
OPENAI_API_KEY=sk-proj-...

# Database URL (required for saving articles)
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## 🗄️ Database Schema

Articles are stored in the `NewsArticle` entity with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `slug` | String | SEO-friendly URL slug (indexed) |
| `title` | String | Article headline |
| `summary` | Text | Brief summary |
| `content` | Text | Full article content (optional) |
| `category` | String | Article category |
| `imageUrl` | String | Featured image URL (optional) |
| `readTime` | Number | Estimated reading time in minutes |
| `publishedAt` | String | Publication date |
| `isGenerated` | Boolean | AI-generated flag |
| `isPublished` | Boolean | Published status |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

---

## 🎨 UI Features

### Status Messages
- **Success** (green): Articles generated/saved successfully
- **Error** (red): Generation or save failed

### Loading States
- **Generating...** - Shows spinner while AI creates articles
- **Saving...** - Shows spinner while importing to database

### Interactive Elements
- **Expandable content** - Click "View full content" to read entire article
- **Hover effects** - Article cards highlight on hover
- **Smooth animations** - Framer Motion animations for better UX

---

## 🔍 Troubleshooting

### "OpenAI API key not configured"
- Ensure `OPENAI_API_KEY` is set in `.env`
- Restart the development server after adding the key

### "Failed to save articles"
- Check database connection (`DATABASE_URL`)
- Ensure NewsArticle table exists (run migrations)
- Check server logs for detailed error messages

### Articles not appearing on landing page
- Verify `isPublished` is set to `true`
- Check the landing page news component is fetching from the correct API
- Clear cache and refresh the landing page

### Duplicate articles skipped
- The system automatically skips articles with duplicate slugs
- Slugs are generated from article titles
- Check the import statistics to see how many were skipped

---

## 📱 Mobile Responsive

The admin dashboard is fully responsive and works on:
- Desktop (optimal experience)
- Tablet (touch-friendly)
- Mobile (compact layout)

---

## 🔐 Security Notes

- This admin interface should be protected with authentication
- Consider adding role-based access control (RBAC)
- Rate limit the OpenAI API calls to prevent abuse
- Validate all inputs before saving to database

---

## 🚦 Next Steps

1. **Add Authentication** - Protect the `/admin` routes
2. **Add Image Generation** - Generate featured images for articles
3. **Add Editing** - Allow editing of generated articles before saving
4. **Add Scheduling** - Schedule articles for future publication
5. **Add Analytics** - Track article views and engagement
6. **Add Categories Management** - Allow custom categories
7. **Add Tags** - Support article tagging for better organization

---

## 📞 Support

For issues or questions:
1. Check the migration summary: `ADMIN_MIGRATION.md`
2. Review API documentation above
3. Check server logs for detailed errors
4. Verify environment variables are set correctly
