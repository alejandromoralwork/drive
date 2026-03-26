#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

from eth_account import Account

SECP256K1_N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141


def normalize_words(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text.strip().lower())
    if not cleaned:
        raise ValueError("Input words cannot be empty")
    return cleaned


def derive_private_key(words: str, salt: str = "", rounds: int = 1) -> str:
    if rounds < 1:
        raise ValueError("rounds must be >= 1")

    material = f"{normalize_words(words)}|{salt}".encode("utf-8")
    digest = hashlib.sha256(material).digest()

    for _ in range(rounds - 1):
        digest = hashlib.sha256(digest).digest()

    value = int.from_bytes(digest, "big")

    if value == 0 or value >= SECP256K1_N:
        digest = hashlib.sha256(digest + b"|retry").digest()
        value = int.from_bytes(digest, "big")
        if value == 0 or value >= SECP256K1_N:
            raise RuntimeError("Derived key was out of valid secp256k1 range")

    return "0x" + digest.hex()


def build_result(private_key_hex: str, words: str, salt: str, rounds: int) -> dict[str, Any]:
    account = Account.from_key(private_key_hex)

    return {
        "algorithm": "sha256",
        "rounds": rounds,
        "salt": salt,
        "note": "ETH and BSC use the same EVM private key format.",
        "input": {
            "normalized_words": normalize_words(words),
        },
        "private_key": private_key_hex,
        "ethereum": {
            "address": account.address,
            "private_key": private_key_hex,
        },
        "bsc": {
            "address": account.address,
            "private_key": private_key_hex,
            "chain_id": 97,
        },
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Derive an EVM private key from a set of words (deterministic SHA-256)."
    )
    parser.add_argument(
        "--words",
        required=True,
        help="Words/sentence used as input material (quoted).",
    )
    parser.add_argument(
        "--salt",
        default="",
        help="Optional salt to make derivation unique per app/environment.",
    )
    parser.add_argument(
        "--rounds",
        type=int,
        default=1,
        help="Number of SHA-256 rounds (default: 1).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print JSON output.",
    )
    parser.add_argument(
        "--out",
        default="",
        help="Optional output JSON file path.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    private_key = derive_private_key(words=args.words, salt=args.salt, rounds=args.rounds)
    result = build_result(private_key, args.words, args.salt, args.rounds)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print("Derived EVM Private Key")
        print(f"Private Key: {result['private_key']}")
        print(f"ETH Address: {result['ethereum']['address']}")
        print(f"BSC Address: {result['bsc']['address']} (chain_id={result['bsc']['chain_id']})")
        print("Note: ETH and BSC use the same private key format.")

    if args.out:
        output_path = Path(args.out).resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(f"Saved output to {output_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
