# Text Correction

Fix text errors in generated images using image-to-image.

## Usage

```bash
python scripts/generate.py \
  --input slide-01.png \
  --prompt "Fix the text: change Helo to Hello. Keep everything else unchanged." \
  --model pro \
  --output slide-01-fixed.png
```

## Prompt Tips

| Tip | Example |
|-----|---------|
| Be specific | "Change 'Helo' to 'Hello'" not "Fix typo" |
| One change at a time | Don't request multiple fixes in one call |
| Preserve context | Add "Keep everything else unchanged" |
| Specify location | "In the title at top center" |

## Notes

- AI text correction has randomness, may need 2-3 attempts
- Always verify the result after each generation
- For complex multi-text fixes, do them one at a time
