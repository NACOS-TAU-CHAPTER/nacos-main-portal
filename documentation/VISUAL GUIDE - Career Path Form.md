# VISUAL GUIDE - Career Path Form

**Date**: August 3, 2026  
**Purpose**: Show what the new career path form looks like

---

## 📋 Complete Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Add Career Path                                        [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Title *                        Category *                  │
│  ┌──────────────────────────┐  ┌────────────────────────┐  │
│  │ Backend Developer        │  │ Development ▼          │  │
│  └──────────────────────────┘  └────────────────────────┘  │
│                                                             │
│  Description *                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Build scalable server-side applications using Node.js,│ │
│  │ databases, and APIs...                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Skills (comma-separated)       Tools (comma-separated)    │
│  ┌──────────────────────────┐  ┌────────────────────────┐ │
│  │ JavaScript, Node.js,     │  │ VS Code, Git, Docker   │ │
│  │ PostgreSQL, REST APIs    │  │                        │ │
│  └──────────────────────────┘  └────────────────────────┘ │
│                                                             │
│  External Resources                                         │
│  ┌─────────────────────┐ ┌────────────────────────┐       │
│  │ Node.js Docs        │ │ https://nodejs.org     │ [🗑️] │
│  └─────────────────────┘ └────────────────────────┘       │
│  ┌─────────────────────┐ ┌────────────────────────┐       │
│  │ Express Guide       │ │ https://expressjs.com  │ [🗑️] │
│  └─────────────────────┘ └────────────────────────┘       │
│                                                             │
│  [+ Add Another Resource]                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                          [Cancel]  [Add Career Path]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Field Breakdown

### Row 1: Title and Category
```
Title *                          Category *
┌──────────────────────────┐    ┌──────────────────────┐
│ [Your text here]         │    │ [Select dropdown]  ▼│
└──────────────────────────┘    └──────────────────────┘
```

**Title**: Free text, required  
**Category**: Dropdown with 8 options, required

**Category Options**:
- Development
- Data Science
- DevOps
- Cybersecurity
- Design
- Mobile Development
- AI/Machine Learning
- Cloud Computing

---

### Row 2: Description
```
Description *
┌─────────────────────────────────────────────────┐
│ [Multi-line text area]                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Description**: Multi-line textarea, required  
**Min height**: 2 rows  
**Placeholder**: "Describe this career path..."

---

### Row 3: Skills and Tools
```
Skills (comma-separated)         Tools (comma-separated)
┌──────────────────────────┐    ┌──────────────────────┐
│ JavaScript, Node.js,     │    │ VS Code, Git, Docker │
│ PostgreSQL               │    │                      │
└──────────────────────────┘    └──────────────────────┘
```

**Skills**: Comma-separated list, optional  
**Tools**: Comma-separated list, optional  
**Example**: "JavaScript, Node.js, PostgreSQL, REST APIs"

---

### Row 4+: External Resources (Dynamic)
```
External Resources

Row 1 (Initial - always present):
┌─────────────────────┐ ┌──────────────────────┐
│ Node.js Docs        │ │ https://nodejs.org   │ [🗑️]
└─────────────────────┘ └──────────────────────┘
 Resource Name (5/12)    URL (6/12)              (1/12)

Row 2 (Added dynamically):
┌─────────────────────┐ ┌──────────────────────┐
│ Express Guide       │ │ https://expressjs.com│ [🗑️]
└─────────────────────┘ └──────────────────────┘

Row 3 (Added dynamically):
┌─────────────────────┐ ┌──────────────────────┐
│ PostgreSQL Tutorial │ │ https://postgresql.  │ [🗑️]
└─────────────────────┘ └──────────────────────┘

[+ Add Another Resource]
```

**Resource Name**: Text input, 5 columns wide  
**URL**: URL input, 6 columns wide  
**Remove Button**: 1 column wide, only shows when >1 resource  
**Add Button**: Adds new empty row below

---

## 🎨 Visual States

### State 1: Initial Load (No Resources Added Yet)
```
External Resources
┌─────────────────────┐ ┌──────────────────────┐
│                     │ │                      │
└─────────────────────┘ └──────────────────────┘
 No trash icon (hidden because only 1 field)

[+ Add Another Resource]
```

### State 2: One Resource Filled
```
External Resources
┌─────────────────────┐ ┌──────────────────────┐
│ Node.js Docs        │ │ https://nodejs.org   │
└─────────────────────┘ └──────────────────────┘
 Still no trash icon (only 1 field)

[+ Add Another Resource]
```

### State 3: Two Resources (Trash Icons Appear)
```
External Resources
┌─────────────────────┐ ┌──────────────────────┐
│ Node.js Docs        │ │ https://nodejs.org   │ [🗑️] ← Now visible
└─────────────────────┘ └──────────────────────┘
┌─────────────────────┐ ┌──────────────────────┐
│ Express Guide       │ │ https://expressjs.com│ [🗑️] ← Visible
└─────────────────────┘ └──────────────────────┘

[+ Add Another Resource]
```

### State 4: Three Resources
```
External Resources
┌─────────────────────┐ ┌──────────────────────┐
│ Node.js Docs        │ │ https://nodejs.org   │ [🗑️]
└─────────────────────┘ └──────────────────────┘
┌─────────────────────┐ ┌──────────────────────┐
│ Express Guide       │ │ https://expressjs.com│ [🗑️]
└─────────────────────┘ └──────────────────────┘
┌─────────────────────┐ ┌──────────────────────┐
│ PostgreSQL Tutorial │ │ https://postgresql.  │ [🗑️]
└─────────────────────┘ └──────────────────────┘

[+ Add Another Resource]
```

### State 5: After Removing Middle Resource
```
External Resources
┌─────────────────────┐ ┌──────────────────────┐
│ Node.js Docs        │ │ https://nodejs.org   │ [🗑️]
└─────────────────────┘ └──────────────────────┘
┌─────────────────────┐ ┌──────────────────────┐
│ PostgreSQL Tutorial │ │ https://postgresql.  │ [🗑️]
└─────────────────────┘ └──────────────────────┘

[+ Add Another Resource]
```

### State 6: Back to One Resource (Icons Hide)
```
External Resources
┌─────────────────────┐ ┌──────────────────────┐
│ Node.js Docs        │ │ https://nodejs.org   │
└─────────────────────┘ └──────────────────────┘
 Trash icon hidden again

[+ Add Another Resource]
```

---

## 🖱️ User Interactions

### Adding a Resource
```
1. User clicks [+ Add Another Resource]
   ↓
2. New empty row appears below
   ↓
3. Trash icons appear on ALL rows
   ↓
4. User can fill in new resource
```

### Removing a Resource
```
1. User clicks [🗑️] on any row
   ↓
2. That row disappears immediately
   ↓
3. If only 1 row remains, trash icon hides
   ↓
4. If multiple rows remain, trash icons stay visible
```

### Submitting Form
```
1. User clicks [Add Career Path]
   ↓
2. Validation checks required fields
   ↓
3. Collects all filled resource fields
   ↓
4. Skips empty/incomplete resource fields
   ↓
5. Builds JSON array automatically
   ↓
6. Sends to backend API
   ↓
7. On success: Modal closes, table refreshes
   ↓
8. Form resets to initial state (1 empty resource field)
```

---

## 📏 Responsive Layout

### Desktop (≥992px)
```
┌────────────────────────┬────────────────────────┐
│ Title (50%)            │ Category (50%)         │
└────────────────────────┴────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Description (100%)                               │
└──────────────────────────────────────────────────┘
┌────────────────────────┬────────────────────────┐
│ Skills (50%)           │ Tools (50%)            │
└────────────────────────┴────────────────────────┘
┌────────────────┬──────────────────┬─────────────┐
│ Name (41.67%)  │ URL (50%)        │ Del (8.33%) │
└────────────────┴──────────────────┴─────────────┘
```

### Tablet (768px - 991px)
```
┌────────────────────────┬────────────────────────┐
│ Title (50%)            │ Category (50%)         │
└────────────────────────┴────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Description (100%)                               │
└──────────────────────────────────────────────────┘
┌────────────────────────┬────────────────────────┐
│ Skills (50%)           │ Tools (50%)            │
└────────────────────────┴────────────────────────┘
┌────────────────┬──────────────────┬─────────────┐
│ Name (41.67%)  │ URL (50%)        │ Del (8.33%) │
└────────────────┴──────────────────┴─────────────┘
```

### Mobile (<768px)
```
┌──────────────────────────────────────────────────┐
│ Title (100%)                                     │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Category (100%)                                  │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Description (100%)                               │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Skills (100%)                                    │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Tools (100%)                                     │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Resource Name (100%)                             │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ Resource URL (100%)                              │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│ [Delete]                                         │
└──────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Buttons
- **Primary (Add Career Path)**: Green (#1b8c0c)
- **Secondary (Add Another Resource)**: Gray outline
- **Danger (Remove/Trash)**: Red outline
- **Cancel**: Gray

### Inputs
- **Border**: Light gray (#ced4da)
- **Focus**: Blue outline
- **Required indicator**: Red asterisk (*)

### Text
- **Labels**: Dark gray (#555)
- **Placeholders**: Light gray (#6c757d)
- **Help text**: Muted gray

---

## ✅ Validation Visual Feedback

### Valid Input
```
Resource Name
┌─────────────────────┐
│ Node.js Docs        │  ← Normal border
└─────────────────────┘
```

### Required Field Empty (on submit attempt)
```
Title *
┌─────────────────────┐
│                     │  ← Red border (invalid)
└─────────────────────┘
❌ This field is required
```

### Invalid URL Format
```
URL
┌─────────────────────┐
│ not-a-valid-url     │  ← Red border (invalid)
└─────────────────────┘
❌ Please enter a valid URL
```

---

## 🔄 Animation/Transitions

### Adding Resource Field
```
[+ Add Another Resource] clicked
↓
New row slides in from bottom (0.3s)
↓
Trash icons fade in (0.2s)
```

### Removing Resource Field
```
[🗑️] clicked
↓
Row fades out (0.2s)
↓
Remaining rows move up (0.3s)
↓
If back to 1 row, trash icon fades out (0.2s)
```

---

## 📱 Example: Complete Filled Form

```
┌─────────────────────────────────────────────────────────────┐
│  Add Career Path                                        [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Title *                        Category *                  │
│  ┌──────────────────────────┐  ┌────────────────────────┐  │
│  │ Full Stack Developer     │  │ Development ▼          │  │
│  └──────────────────────────┘  └────────────────────────┘  │
│                                                             │
│  Description *                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Design and develop both frontend and backend          │ │
│  │ components of web applications. Work with databases,  │ │
│  │ APIs, and modern JavaScript frameworks.               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Skills (comma-separated)       Tools (comma-separated)    │
│  ┌──────────────────────────┐  ┌────────────────────────┐ │
│  │ HTML, CSS, JavaScript,   │  │ VS Code, Git, Chrome   │ │
│  │ React, Node.js, MongoDB  │  │ DevTools, Postman      │ │
│  └──────────────────────────┘  └────────────────────────┘ │
│                                                             │
│  External Resources                                         │
│  ┌─────────────────────┐ ┌────────────────────────┐       │
│  │ MDN Web Docs        │ │ https://developer.mozi │ [🗑️] │
│  │                     │ │ lla.org                │       │
│  └─────────────────────┘ └────────────────────────┘       │
│  ┌─────────────────────┐ ┌────────────────────────┐       │
│  │ React Documentation │ │ https://react.dev      │ [🗑️] │
│  └─────────────────────┘ └────────────────────────┘       │
│  ┌─────────────────────┐ ┌────────────────────────┐       │
│  │ Node.js Guide       │ │ https://nodejs.org/docs│ [🗑️] │
│  └─────────────────────┘ └────────────────────────┘       │
│                                                             │
│  [+ Add Another Resource]                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                          [Cancel]  [Add Career Path]        │
└─────────────────────────────────────────────────────────────┘
```

**This will be saved as**:
```javascript
{
  title: "Full Stack Developer",
  category: "Development",
  description: "Design and develop both frontend and backend...",
  skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"],
  tools: ["VS Code", "Git", "Chrome DevTools", "Postman"],
  resources: [
    {name: "MDN Web Docs", url: "https://developer.mozilla.org"},
    {name: "React Documentation", url: "https://react.dev"},
    {name: "Node.js Guide", url: "https://nodejs.org/docs"}
  ]
}
```

---

**RESULT**: Clean, intuitive form that anyone can use without technical knowledge!
