#!/usr/bin/env python3
"""Tokenization and alignment for grounding LLM extractions to source text.

Ported from google/langextract (Apache 2.0). Provides:
  - RegexTokenizer / UnicodeTokenizer for splitting text into tokens
  - WordAligner for mapping extraction strings back to char positions
  - CLI: reads source text + extractions JSON, outputs grounded extractions

Usage:
  python align.py --source file.txt --extractions extractions.json
  python align.py --source file.txt --extractions extractions.json --unicode
  echo '{"source":"...","extractions":[...]}' | python align.py --stdin
"""
from __future__ import annotations

import abc
import argparse
import collections
import dataclasses
import difflib
import enum
import json
import re
import sys
import unicodedata
from typing import Iterator, Sequence

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

class AlignmentStatus(enum.Enum):
    MATCH_EXACT = "match_exact"
    MATCH_GREATER = "match_greater"
    MATCH_LESSER = "match_lesser"
    MATCH_FUZZY = "match_fuzzy"


@dataclasses.dataclass(slots=True)
class CharInterval:
    start_pos: int
    end_pos: int


@dataclasses.dataclass(slots=True)
class TokenInterval:
    start_index: int = 0
    end_index: int = 0


class TokenType(enum.IntEnum):
    WORD = 0
    NUMBER = 1
    PUNCTUATION = 2


@dataclasses.dataclass(slots=True)
class Token:
    index: int
    token_type: TokenType
    char_interval: CharInterval = dataclasses.field(
        default_factory=lambda: CharInterval(0, 0)
    )
    first_token_after_newline: bool = False


@dataclasses.dataclass
class TokenizedText:
    text: str
    tokens: list[Token] = dataclasses.field(default_factory=list)


@dataclasses.dataclass
class Extraction:
    extraction_class: str
    extraction_text: str
    char_interval: CharInterval | None = None
    alignment_status: AlignmentStatus | None = None
    token_interval: TokenInterval | None = None
    attributes: dict | None = None

    def to_dict(self) -> dict:
        d = {
            "extraction_class": self.extraction_class,
            "extraction_text": self.extraction_text,
        }
        if self.char_interval:
            d["char_interval"] = {
                "start_pos": self.char_interval.start_pos,
                "end_pos": self.char_interval.end_pos,
            }
        if self.alignment_status:
            d["alignment_status"] = self.alignment_status.value
        if self.token_interval:
            d["token_interval"] = {
                "start_index": self.token_interval.start_index,
                "end_index": self.token_interval.end_index,
            }
        if self.attributes:
            d["attributes"] = self.attributes
        return d


# ---------------------------------------------------------------------------
# Tokenizers
# ---------------------------------------------------------------------------

_LETTERS_PATTERN = r"[^\W\d_]+"
_DIGITS_PATTERN = r"\d+"
_SYMBOLS_PATTERN = r"([^\w\s]|_)\1*"

_TOKEN_PATTERN = re.compile(
    rf"{_LETTERS_PATTERN}|{_DIGITS_PATTERN}|{_SYMBOLS_PATTERN}", re.UNICODE
)
_WORD_PATTERN = re.compile(rf"(?:{_LETTERS_PATTERN}|{_DIGITS_PATTERN})\Z", re.UNICODE)


class Tokenizer(abc.ABC):
    @abc.abstractmethod
    def tokenize(self, text: str) -> TokenizedText: ...


class RegexTokenizer(Tokenizer):
    """Regex-based tokenizer, fast for spaced languages (English, etc.)."""

    def tokenize(self, text: str) -> TokenizedText:
        tokenized = TokenizedText(text=text)
        previous_end = 0
        for token_index, match in enumerate(_TOKEN_PATTERN.finditer(text)):
            start_pos, end_pos = match.span()
            matched_text = match.group()
            token = Token(
                index=token_index,
                char_interval=CharInterval(start_pos=start_pos, end_pos=end_pos),
                token_type=TokenType.WORD,
            )
            if token_index > 0:
                has_newline = (
                    text.find("\n", previous_end, start_pos) != -1
                    or text.find("\r", previous_end, start_pos) != -1
                )
                if has_newline:
                    token.first_token_after_newline = True
            if re.fullmatch(_DIGITS_PATTERN, matched_text):
                token.token_type = TokenType.NUMBER
            elif _WORD_PATTERN.fullmatch(matched_text):
                token.token_type = TokenType.WORD
            else:
                token.token_type = TokenType.PUNCTUATION
            tokenized.tokens.append(token)
            previous_end = end_pos
        return tokenized


# CJK / non-spaced script detection
_CJK_RANGES = (
    ("\u4e00", "\u9fff"),    # CJK Unified
    ("\u3040", "\u309f"),    # Hiragana
    ("\u30a0", "\u30ff"),    # Katakana
    ("\uac00", "\ud7af"),    # Hangul Syllables
)
_NON_SPACED_RANGES = (
    ("\u0e00", "\u0e7f"),    # Thai
    ("\u0e80", "\u0eff"),    # Lao
    ("\u1780", "\u17ff"),    # Khmer
    ("\u1000", "\u109f"),    # Myanmar
)

def _is_cjk(c: str) -> bool:
    for lo, hi in _CJK_RANGES:
        if lo <= c <= hi:
            return True
    return False

def _is_non_spaced(c: str) -> bool:
    for lo, hi in _NON_SPACED_RANGES:
        if lo <= c <= hi:
            return True
    return False

def _classify_char(c: str) -> TokenType:
    cat = unicodedata.category(c)
    if cat.startswith("L"):
        return TokenType.WORD
    if cat.startswith("N"):
        return TokenType.NUMBER
    return TokenType.PUNCTUATION

# Grapheme cluster regex — uses standard re with surrogate-aware pattern
_GRAPHEME_PATTERN = re.compile(r".", re.DOTALL)

def _get_script(c: str) -> str:
    if ord(c) < 128:
        return "Latin"
    cat = unicodedata.category(c)
    if cat.startswith("L"):
        # Use east_asian_width as a rough heuristic
        name = unicodedata.name(c, "")
        for script in ("LATIN", "CYRILLIC", "GREEK", "ARABIC", "HEBREW", "DEVANAGARI"):
            if script in name:
                return script
    return "Unknown"


class UnicodeTokenizer(Tokenizer):
    """Unicode-aware tokenizer for CJK and non-spaced languages."""

    def tokenize(self, text: str) -> TokenizedText:
        tokens: list[Token] = []
        current_start = 0
        current_type: TokenType | None = None
        current_script: str | None = None
        previous_end = 0

        i = 0
        while i < len(text):
            c = text[i]
            i += 1

            if c.isspace():
                if current_type is not None:
                    self._emit(tokens, text, current_start, i - 1, current_type, previous_end)
                    previous_end = i - 1
                    current_type = None
                    current_script = None
                continue

            g_type = _classify_char(c)
            should_merge = False

            if current_type is not None and current_type == g_type:
                if current_type == TokenType.WORD:
                    if _is_cjk(c) or _is_non_spaced(c):
                        should_merge = False
                    elif current_script == "NO_GROUP":
                        should_merge = False
                    else:
                        g_script = _get_script(c)
                        if current_script == g_script and g_script != "Unknown":
                            should_merge = True
                elif current_type == TokenType.NUMBER:
                    should_merge = True
                elif current_type == TokenType.PUNCTUATION:
                    last_char = text[i - 2] if i >= 2 else ""
                    if last_char == c:
                        should_merge = True

            if not should_merge:
                if current_type is not None:
                    self._emit(tokens, text, current_start, i - 1, current_type, previous_end)
                    previous_end = i - 1
                current_start = i - 1
                current_type = g_type
                if current_type == TokenType.WORD:
                    if _is_cjk(c) or _is_non_spaced(c):
                        current_script = "NO_GROUP"
                    else:
                        current_script = _get_script(c)
                else:
                    current_script = None

        if current_type is not None:
            self._emit(tokens, text, current_start, len(text), current_type, previous_end)

        return TokenizedText(text=text, tokens=tokens)

    def _emit(self, tokens: list[Token], text: str, start: int, end: int,
              token_type: TokenType, previous_end: int) -> None:
        token = Token(
            index=len(tokens),
            char_interval=CharInterval(start_pos=start, end_pos=end),
            token_type=token_type,
        )
        if start > previous_end:
            gap = text[previous_end:start]
            if "\n" in gap or "\r" in gap:
                token.first_token_after_newline = True
        tokens.append(token)


_DEFAULT_TOKENIZER = RegexTokenizer()


def tokenize(text: str, tokenizer: Tokenizer | None = None) -> TokenizedText:
    return (tokenizer or _DEFAULT_TOKENIZER).tokenize(text)


# ---------------------------------------------------------------------------
# Alignment
# ---------------------------------------------------------------------------

_FUZZY_THRESHOLD = 0.75


def _tokenize_lowercase(text: str, tokenizer_impl: Tokenizer | None = None) -> Iterator[str]:
    t = (tokenizer_impl or _DEFAULT_TOKENIZER).tokenize(text)
    for tok in t.tokens:
        yield t.text[tok.char_interval.start_pos:tok.char_interval.end_pos].lower()


def _normalize_token(token: str) -> str:
    token = token.lower()
    if len(token) > 3 and token.endswith("s") and not token.endswith("ss"):
        token = token[:-1]
    return token


class WordAligner:
    """Aligns extraction strings to source text using difflib."""

    def align(
        self,
        extractions: list[Extraction],
        source_text: str,
        token_offset: int = 0,
        char_offset: int = 0,
        enable_fuzzy: bool = True,
        fuzzy_threshold: float = _FUZZY_THRESHOLD,
        accept_lesser: bool = True,
        tokenizer_impl: Tokenizer | None = None,
    ) -> list[Extraction]:
        if not extractions:
            return []

        delim = "\u241f"
        source_tokens = list(_tokenize_lowercase(source_text, tokenizer_impl))
        extraction_tokens = list(_tokenize_lowercase(
            f" {delim} ".join(e.extraction_text for e in extractions),
            tokenizer_impl,
        ))

        matcher = difflib.SequenceMatcher(autojunk=False, a=source_tokens, b=extraction_tokens)
        tokenized_text = (tokenizer_impl or _DEFAULT_TOKENIZER).tokenize(source_text)

        # Build index: extraction_token_offset -> extraction object
        delim_tokens = list(_tokenize_lowercase(delim, tokenizer_impl))
        delim_len = len(delim_tokens)
        index_map: dict[int, Extraction] = {}
        offset = 0
        for ext in extractions:
            index_map[offset] = ext
            ext_tok_len = len(list(_tokenize_lowercase(ext.extraction_text, tokenizer_impl)))
            offset += ext_tok_len + delim_len

        aligned: set[int] = set()

        # Phase 1: Exact matching via difflib
        for i, j, n in matcher.get_matching_blocks()[:-1]:
            ext = index_map.get(j)
            if ext is None:
                continue

            ext_tok_len = len(list(_tokenize_lowercase(ext.extraction_text, tokenizer_impl)))

            ext.token_interval = TokenInterval(
                start_index=i + token_offset,
                end_index=i + n + token_offset,
            )
            try:
                start_token = tokenized_text.tokens[i]
                end_token = tokenized_text.tokens[i + n - 1]
                ext.char_interval = CharInterval(
                    start_pos=char_offset + start_token.char_interval.start_pos,
                    end_pos=char_offset + end_token.char_interval.end_pos,
                )
            except IndexError:
                continue

            if ext_tok_len == n:
                ext.alignment_status = AlignmentStatus.MATCH_EXACT
                aligned.add(id(ext))
            elif accept_lesser:
                ext.alignment_status = AlignmentStatus.MATCH_LESSER
                aligned.add(id(ext))
            else:
                ext.token_interval = None
                ext.char_interval = None
                ext.alignment_status = None

        # Phase 2: Fuzzy alignment for unmatched extractions
        if enable_fuzzy:
            for ext in extractions:
                if id(ext) in aligned:
                    continue
                self._fuzzy_align(
                    ext, source_tokens, tokenized_text,
                    token_offset, char_offset, fuzzy_threshold, tokenizer_impl,
                )

        return extractions

    def _fuzzy_align(
        self,
        extraction: Extraction,
        source_tokens: list[str],
        tokenized_text: TokenizedText,
        token_offset: int,
        char_offset: int,
        fuzzy_threshold: float,
        tokenizer_impl: Tokenizer | None,
    ) -> None:
        ext_tokens = list(_tokenize_lowercase(extraction.extraction_text, tokenizer_impl))
        ext_tokens_norm = [_normalize_token(t) for t in ext_tokens]
        if not ext_tokens:
            return

        best_ratio = 0.0
        best_span: tuple[int, int] | None = None
        len_e = len(ext_tokens)
        ext_counts = collections.Counter(ext_tokens_norm)
        min_overlap = int(len_e * fuzzy_threshold)
        matcher = difflib.SequenceMatcher(autojunk=False, b=ext_tokens_norm)

        for window_size in range(len_e, len(source_tokens) + 1):
            if window_size > len(source_tokens):
                break
            window_deque = collections.deque(source_tokens[:window_size])
            window_counts = collections.Counter(_normalize_token(t) for t in window_deque)

            for start_idx in range(len(source_tokens) - window_size + 1):
                if (ext_counts & window_counts).total() >= min_overlap:
                    window_norm = [_normalize_token(t) for t in window_deque]
                    matcher.set_seq1(window_norm)
                    matches = sum(sz for _, _, sz in matcher.get_matching_blocks())
                    ratio = matches / len_e if len_e > 0 else 0.0
                    if ratio > best_ratio:
                        best_ratio = ratio
                        best_span = (start_idx, window_size)

                if start_idx + window_size < len(source_tokens):
                    old = window_deque.popleft()
                    old_n = _normalize_token(old)
                    window_counts[old_n] -= 1
                    if window_counts[old_n] == 0:
                        del window_counts[old_n]
                    new = source_tokens[start_idx + window_size]
                    window_deque.append(new)
                    window_counts[_normalize_token(new)] += 1

        if best_span and best_ratio >= fuzzy_threshold:
            si, ws = best_span
            try:
                extraction.token_interval = TokenInterval(
                    start_index=si + token_offset,
                    end_index=si + ws + token_offset,
                )
                start_tok = tokenized_text.tokens[si]
                end_tok = tokenized_text.tokens[si + ws - 1]
                extraction.char_interval = CharInterval(
                    start_pos=char_offset + start_tok.char_interval.start_pos,
                    end_pos=char_offset + end_tok.char_interval.end_pos,
                )
                extraction.alignment_status = AlignmentStatus.MATCH_FUZZY
            except IndexError:
                pass


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Align extractions to source text")
    parser.add_argument("--source", help="Path to source text file")
    parser.add_argument("--extractions", help="Path to extractions JSON file")
    parser.add_argument("--stdin", action="store_true", help="Read JSON from stdin")
    parser.add_argument("--unicode", action="store_true", help="Use UnicodeTokenizer")
    parser.add_argument("--fuzzy-threshold", type=float, default=0.75)
    args = parser.parse_args()

    if args.stdin:
        data = json.load(sys.stdin)
        source_text = data["source"]
        raw_extractions = data["extractions"]
    else:
        if not args.source or not args.extractions:
            parser.error("--source and --extractions required (or use --stdin)")
        with open(args.source) as f:
            source_text = f.read()
        with open(args.extractions) as f:
            raw_extractions = json.load(f)

    tokenizer_impl = UnicodeTokenizer() if args.unicode else RegexTokenizer()

    extractions = []
    for item in raw_extractions:
        extractions.append(Extraction(
            extraction_class=item["extraction_class"],
            extraction_text=item["extraction_text"],
            attributes=item.get("attributes"),
        ))

    aligner = WordAligner()
    aligned = aligner.align(
        extractions, source_text,
        enable_fuzzy=True,
        fuzzy_threshold=args.fuzzy_threshold,
        tokenizer_impl=tokenizer_impl,
    )

    result = {
        "source": source_text,
        "extractions": [e.to_dict() for e in aligned],
    }
    json.dump(result, sys.stdout, indent=2, ensure_ascii=False)
    print()


if __name__ == "__main__":
    main()
