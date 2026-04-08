---
name: youtube
description: Access YouTube data - channels, videos, search, and transcripts. Use when user needs YouTube channel info, video listings, search results, or video transcripts. Triggers include "youtube", "youtube channel", "youtube video", "video transcript", "youtube search", "channel videos", "latest videos from".
---

# YouTube

Access YouTube channel data, videos, search, and transcripts.

{{include:auth.md}}

## Data Proxy Operations

All official YouTube API operations go through the data proxy. Use `$API_URL` and `$AUTH_TOKEN` from the authentication setup above.

### Get Channel Info

Look up a YouTube channel by handle to get its metadata and uploads playlist ID.

```bash
curl -X POST "$API_URL/api/data/youtube/channel" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"handle": "mkbhd"}'
```

**Response:**
```json
{
  "success": true,
  "channelId": "UCBcRF18a7Qf58cCRy5xuWwQ",
  "name": "Marques Brownlee",
  "uploadsPlaylistId": "UUBcRF18a7Qf58cCRy5xuWwQ",
  "statistics": {
    "subscriberCount": "19600000",
    "videoCount": "1800"
  }
}
```

Use `uploadsPlaylistId` with the playlist items operation to get the channel's videos.

### Get Playlist Items (Latest Videos)

Fetch videos from a playlist. Use with `uploadsPlaylistId` to get a channel's latest uploads.

```bash
curl -X POST "$API_URL/api/data/youtube/playlistItems" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playlistId": "UUBcRF18a7Qf58cCRy5xuWwQ",
    "maxResults": 10
  }'
```

**Parameters:**
- `playlistId` (required): Playlist ID (use `uploadsPlaylistId` from channel response)
- `maxResults` (optional): 1-50, default 15
- `pageToken` (optional): For pagination

**Response includes** `videos[]` with: `videoId`, `title`, `description`, `publishedAt`, `url`

### Get Video Details

Get duration, view count, like count for specific videos. Useful for filtering out Shorts.

```bash
curl -X POST "$API_URL/api/data/youtube/videoDetails" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoIds": "dQw4w9WgXcQ,jNQXAC9IVRw"}'
```

**Parameters:**
- `videoIds` (required): Comma-separated video IDs (max 50)

**Response includes** `videos[]` with: `duration`, `isLikelyShort`, `statistics`, `caption` (whether captions exist)

### Search YouTube

Search for videos, channels, or playlists.

```bash
curl -X POST "$API_URL/api/data/youtube/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "machine learning tutorial",
    "type": "video",
    "maxResults": 10,
    "order": "relevance"
  }'
```

**Parameters:**
- `q` (required): Search query
- `type` (optional): `video`, `channel`, or `playlist` (default: `video`)
- `maxResults` (optional): 1-50, default 10
- `order` (optional): `relevance`, `date`, `rating`, `viewCount`, `title`
- `channelId` (optional): Filter to a specific channel
- `pageToken` (optional): For pagination

**Note:** For a channel's latest videos in chronological order, use channel + playlistItems instead of search.

---

## Transcripts

The official YouTube API does not support downloading transcripts for videos you don't own. Use the `youtube-transcript-api` Python library instead.

### Setup

```bash
pip install youtube-transcript-api
```

### Get Transcript

```python
from youtube_transcript_api import YouTubeTranscriptApi

ytt_api = YouTubeTranscriptApi()
transcript = ytt_api.fetch("VIDEO_ID")

# Combine into full text
full_text = " ".join(segment.text for segment in transcript)
print(full_text)
```

### Get Transcript with Timestamps

```python
ytt_api = YouTubeTranscriptApi()
transcript = ytt_api.fetch("VIDEO_ID")

for segment in transcript:
    print(f"[{segment.start:.1f}s] {segment.text}")
```

### Notes

- Add 2-second delays between requests to avoid rate limiting
- Some videos don't have transcripts (live streams, music, disabled captions)
- Auto-generated transcripts may have spelling errors for names and technical terms
- Use `videoDetails` operation first to check if `caption` is true before attempting transcript fetch

---

## Common Workflows

### Get Latest Videos from a Channel

1. Call `channel` with the handle to get `uploadsPlaylistId`
2. Call `playlistItems` with that playlist ID
3. Call `videoDetails` to filter out Shorts (`isLikelyShort: true`)

### Get Transcript of a Video

1. Call `videoDetails` to confirm captions exist
2. Use `youtube-transcript-api` to fetch the transcript

---

## Delivering Output

After generating any output files (transcripts, reports, etc.), upload them to the Artifact Store so the user can access them.
