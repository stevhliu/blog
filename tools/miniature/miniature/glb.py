"""Read and rewrite a GLB's JSON chunk, leaving its binary chunk untouched."""
from __future__ import annotations

import json
import struct
from pathlib import Path

JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942


def read_glb(path: Path) -> tuple[dict, bytes]:
    data = path.read_bytes()
    json_length = struct.unpack("<I", data[12:16])[0]
    gltf = json.loads(data[20 : 20 + json_length])
    rest = data[20 + json_length :]
    binary = rest[8 : 8 + struct.unpack("<I", rest[:4])[0]] if rest else b""
    return gltf, binary


def write_glb(path: Path, gltf: dict, binary: bytes) -> None:
    def padded(chunk: bytes, fill: bytes) -> bytes:
        return chunk + fill * ((4 - len(chunk) % 4) % 4)

    body = padded(json.dumps(gltf, separators=(",", ":")).encode(), b" ")
    chunks = struct.pack("<II", len(body), JSON_CHUNK) + body
    if binary:
        binary = padded(binary, b"\0")
        chunks += struct.pack("<II", len(binary), BIN_CHUNK) + binary
    path.write_bytes(struct.pack("<III", 0x46546C67, 2, 12 + len(chunks)) + chunks)
