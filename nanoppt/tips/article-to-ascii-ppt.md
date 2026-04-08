# Article to ASCII PPT Methodology

> Convert article content into ASCII PPT framework, providing precise layout guidance for AI image generation

---

## Core Process

```
Read Article → Extract Information → Design Structure → ASCII Drawing → Add Notes
```

---

## Step 1: Read Article, Extract Core Information

### 1.1 Quick Scan, Grasp the Overall Picture

- **Article Type**: Tutorial / Product Introduction / Opinion Piece / Technical Sharing
- **Target Audience**: Developers / Product Managers / General Users
- **Core Information**: 1-3 key points the author wants to convey

### 1.2 Mark Key Paragraphs

While reading, mark:
- **Pain Points/Problems**: Difficulties users encounter
- **Solutions**: Core value of the product/method
- **Advantages/Features**: 3-5 key selling points
- **Sections**: Natural divisions in the article

---

## Step 2: Design PPT Structure

### 2.1 Standard PPT Template (21 Pages)

| Page | Type | Content | Purpose |
|-----|------|---------|---------|
| 1 | cover | Cover | Capture attention |
| 2-3 | content | Pain point introduction | Build empathy |
| 4-6 | content | Solution/Advantages | Show value |
| 7 | section | Section divider 01 | Clear structure |
| 8-10 | content | Criteria/Use cases | Practical info |
| 11 | section | Section divider 02 | Continue flow |
| 12-14 | content | Core concepts/Principles | Deep explanation |
| 15 | section | Section divider 03 | Maintain rhythm |
| 16-18 | content | Case studies/Steps | Actionable content |
| 19 | section | Section divider 04 | Prepare conclusion |
| 20 | content | Summary | Reinforce memory |
| 21 | end | End page | Call to action |

### 2.2 Adjust Based on Article

- **Short articles (<1500 words)**: 10-15 pages, reduce section dividers
- **Long articles (>3000 words)**: 25-30 pages, add cases and details
- **Tutorial type**: Add step demonstration pages
- **Opinion type**: Add quote pages

---

## Step 3: ASCII Drawing

### 3.1 Basic Frames

```bash
# Standard full-screen frame
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Content Area                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

# Top-bottom split (Title + Content)
┌─────────────────────────────────────────────────────────────┐
│  Title Area                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Content Area                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

# Left-right split (Image + Text)
┌─────────────────────────────────────────────────────────────┐
│                   │                                         │
│   Left (Image)    │      Right (Text List)                  │
│                   │                                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Common Templates

#### Cover Page (cover)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [Main Title]                                   │
│         [Subtitle/One-line Description]                     │
│                                                             │
│                                            [Author/Date]    │
└─────────────────────────────────────────────────────────────┘
```

#### Pain Point Introduction (content)

```
┌─────────────────────────────────────────────────────────────┐
│  [Big Title]                                                │
├───────────────────┬─────────────────────────────────────────┤
│                   │  ❌ [Pain Point 1]                      │
│   [Expression     │  ❌ [Pain Point 2]                      │
│    Illustration]  │  ❌ [Pain Point 3]                      │
│                   │                                         │
│                   │  [Summary/Exclamation]                  │
└───────────────────┴─────────────────────────────────────────┘
```

#### Three Advantages (content)

```
┌─────────────────────────────────────────────────────────────┐
│  [Title]                                                    │
├───────────────────┬─────────────────────────────────────────┤
│                   │  ✅ [Advantage 1]                       │
│   [Comparison/    │  ✅ [Advantage 2]                       │
│    Flow Chart]    │  ✅ [Advantage 3]                       │
└───────────────────┴─────────────────────────────────────────┘
```

#### Section Divider Page (section)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [Section Number, e.g., 01, 02]                 │
│         [Section Title]                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Quote Page (quote)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     [Core Quote/Definition, Large Font]                     │
│                                                             │
│                    [Supplementary Note]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### List Page (content)

```
┌─────────────────────────────────────────────────────────────┐
│  [Title]                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ [Item 1]        [Brief Description]                     │
│  ✅ [Item 2]        [Brief Description]                     │
│  ✅ [Item 3]        [Brief Description]                     │
│  ❌ [Not Suitable 1] [Brief Description]                    │
│  ❌ [Not Suitable 2] [Brief Description]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Process Page (content)

```
┌─────────────────────────────────────────────────────────────┐
│  [Title]                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ① [Step 1]                                                 │
│         ↓                                                   │
│  ② [Step 2]                                                 │
│         ↓                                                   │
│  ③ [Step 3]                                                 │
│         ↓                                                   │
│  ④ [Step 4]                                                 │
│                                                             │
│         [Summary Data/Comparison]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 4: Add Notes

### 4.1 Image Suggestions

After each ASCII frame, add an image suggestion line:

```markdown
**Image Suggestion**: Use gradient or tech-style background
**Image Suggestion**: Place frustrated/helpless expression illustration on left
**Image Suggestion**: Use flowchart style, arrows appear with animation
```

### 4.2 Design Suggestions

For special pages, add design suggestions:

```markdown
**Design Suggestion**: Large section number, use prominent background color
**Design Suggestion**: Use large font to emphasize problem section
**Design Suggestion**: Use contrasting colors to distinguish suitable/unsuitable
```

### 4.3 AI Image Prompts (Optional)

If direct image generation is needed, add Prompt template at the end:

```markdown
---

## AI Image Prompt Reference

### Cover Background
```
Abstract technology background with gradient colors (purple to blue), clean and modern style, suitable for presentation cover, 4:3 ratio
```

### Frustrated Expression
```
Cartoon character looking frustrated and stressed, surrounded by floating documents and chat windows, simple flat design style
```
```

---

## Practical Examples

### Example 1: Technical Tutorial Article

**Original Structure**:
1. Introduce problem background
2. Pain points of traditional solutions
3. New solution introduction
4. Core principles
5. Usage steps
6. Practical case
7. Summary

**Conversion Approach**:
- PPT1: Cover (Technical Title + Subtitle)
- PPT2-3: Pain point pages (Problems with traditional approach)
- PPT4-6: New solution advantages (Comparative display)
- PPT7: Section "Principles"
- PPT8-10: Core principle explanation
- PPT11: Section "Practice"
- PPT12-15: Usage steps
- PPT16-18: Practical case
- PPT19: Summary
- PPT20: End page

### Example 2: Product Introduction Article

**Original Structure**:
1. User scenario description
2. Inadequacy of existing solutions
3. Product introduction
4. Core features
5. Use cases
6. Success stories

**Conversion Approach**:
- PPT1: Cover
- PPT2: Scenario introduction (Build empathy)
- PPT3: Pain points of existing solutions
- PPT4-6: Product introduction + Core features
- PPT7: Section "Use Cases"
- PPT8-10: Detailed use cases
- PPT11: Section "Success Stories"
- PPT12-15: Case display
- PPT16: Summary page
- PPT17: End page

---

## Statistics (Place at End)

```markdown
---

## Statistics

| Template Type | Purpose | Count |
|---------------|---------|-------|
| cover | Cover page | 1 |
| content | Content pages | 13 |
| section | Section dividers | 6 |
| quote | Quote pages | 2 |
| end | End page | 1 |
| **Total** | | **21** |
```

---

## Notes

### Content Simplification

- **One point per page**: Each page explains only one core piece of information
- **Minimal text**: Only put keywords and short sentences on PPT, no long paragraphs
- **Use icons**: Use ✅❌→↓ symbols to replace text explanations

### Visual Rhythm

- **Section dividers**: Add a section page after every 3-5 content pages
- **Style variation**: Cover, section, and end pages use prominent design
- **Content pages**: Maintain consistent style to avoid visual fatigue

### ASCII Drawing Tips

- **Alignment first**: Use monospace font, ensure all lines are aligned
- **Moderate whitespace**: Don't fill the entire frame, leave visual breathing room
- **Consistent symbols**: Uniformly use `│─┌┐└┘├┤` line symbols

---

## Quick Template

Copy this template to start:

```markdown
# [Article Title] - ASCII PPT Design

---

## PPT 1: Cover Page (cover)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [Main Title]                                   │
│         [Subtitle/One-line Description]                     │
│                                                             │
│                                            [Author/Date]    │
└─────────────────────────────────────────────────────────────┘
```

**Image Suggestion**: Use gradient or tech-style background

---

## PPT 2: Pain Point Introduction (content)

```
┌─────────────────────────────────────────────────────────────┐
│  Problems We Face Every Time                                │
├───────────────────┬─────────────────────────────────────────┤
│                   │  ❌ [Pain Point 1]                      │
│   [Frustrated     │  ❌ [Pain Point 2]                      │
│    Expression]    │  ❌ [Pain Point 3]                      │
└───────────────────┴─────────────────────────────────────────┘
```

**Image Suggestion**: Place frustrated/stressed expression illustration on left

---

(Continue adding more pages...)
```
