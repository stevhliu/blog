#!/usr/bin/env bash
# Builds the miniature pipeline's environment from scratch on an Apple
# Silicon Mac: a Python 3.11 venv, PyTorch, Stable Fast 3D (vendored at a
# pinned commit, with its two native extensions compiled against that
# PyTorch) and the macOS Vision OCR wrapper. Safe to re-run.
#
# Needs: Homebrew, uv, Xcode command line tools, and a Hugging Face login
# (`hf auth login`) on an account that has accepted the Stable Fast 3D
# licence at https://huggingface.co/stabilityai/stable-fast-3d.
set -euo pipefail
cd "$(dirname "$0")"

SF3D_REPO=https://github.com/Stability-AI/stable-fast-3d
SF3D_COMMIT=ff21fc491b4dc5314bf6734c7c0dabd86b5f5bb2

# SF3D's texture baker compiles with OpenMP, which Apple's clang lacks.
brew list libomp >/dev/null 2>&1 || brew install libomp
OMP="$(brew --prefix libomp)"

if [ ! -d vendor/stable-fast-3d ]; then
  mkdir -p vendor
  git clone -q "$SF3D_REPO" vendor/stable-fast-3d
fi
git -C vendor/stable-fast-3d checkout -q "$SF3D_COMMIT"

[ -d .venv ] || uv venv --python 3.11 .venv
PY=.venv/bin/python

uv pip install --python "$PY" torch torchvision "setuptools==69.5.1" wheel scipy
# The extensions must build against the torch just installed, so no build
# isolation, and they need OpenMP's headers and library. SF3D's requirements
# name them as ./texture_baker/ and ./uv_unwrapper/, so install from its folder.
(
  cd vendor/stable-fast-3d
  CPPFLAGS="-I$OMP/include" CFLAGS="-I$OMP/include" LDFLAGS="-L$OMP/lib" \
    uv pip install --python ../../.venv/bin/python --no-build-isolation -r requirements.txt
)
uv pip install --python "$PY" ocrmac

"$PY" -c "import torch, texture_baker, uv_unwrapper, ocrmac; print('ready: torch', torch.__version__)"
