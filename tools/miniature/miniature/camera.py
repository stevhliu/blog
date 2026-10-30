"""Pinhole camera for projecting a mesh into the source photo.

Conventions follow OpenCV: camera x points right, y points down and z points
forward, so a point in front of the camera has positive depth. Pixel (0, 0)
is the top-left corner of the image.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np


def rotation(yaw: float, pitch: float, roll: float) -> np.ndarray:
    """World rotation from Euler angles in degrees: yaw about y, pitch about x,
    roll about z, applied in that order."""
    y, p, r = np.radians([yaw, pitch, roll])
    ry = np.array([[np.cos(y), 0, np.sin(y)], [0, 1, 0], [-np.sin(y), 0, np.cos(y)]])
    rx = np.array([[1, 0, 0], [0, np.cos(p), -np.sin(p)], [0, np.sin(p), np.cos(p)]])
    rz = np.array([[np.cos(r), -np.sin(r), 0], [np.sin(r), np.cos(r), 0], [0, 0, 1]])
    return rz @ rx @ ry


@dataclass
class Camera:
    """A camera on the -z axis looking toward +z, then turned by yaw, pitch and
    roll about the origin and nudged by an image-plane shift. This matches how
    Stable Fast 3D frames its input: the model's front faces -z."""

    size: int  # square image, in pixels
    fovy: float = 40.0  # degrees
    distance: float = 1.6
    yaw: float = 0.0
    pitch: float = 0.0
    roll: float = 0.0
    shift_x: float = 0.0  # principal point offset, as a fraction of size
    shift_y: float = 0.0
    # An explicit world-to-camera rotation (3x3) and translation, as nested
    # lists, for cameras solved from point matches rather than angles. When
    # set it replaces yaw, pitch, roll and distance.
    pose: tuple | None = None

    @property
    def focal(self) -> float:
        return (self.size / 2) / np.tan(np.radians(self.fovy) / 2)

    def world_to_camera(self) -> tuple[np.ndarray, np.ndarray]:
        """Rotation and translation taking world points into camera space."""
        if self.pose is not None:
            return np.asarray(self.pose[0], float), np.asarray(self.pose[1], float)
        # Base pose: eye at (0, 0, -distance), looking at the origin, y up.
        # Looking along +z with y up, image-right is world -x and image-down
        # is world -y.
        base = np.array([[-1.0, 0, 0], [0, -1.0, 0], [0, 0, 1.0]])
        r = base @ rotation(self.yaw, self.pitch, self.roll)
        t = np.array([0.0, 0.0, self.distance])
        return r, t

    def eye(self) -> np.ndarray:
        r, t = self.world_to_camera()
        return -r.T @ t

    def project(self, points: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Project world points to pixel coordinates. Returns (N, 2) pixels and
        (N,) depths along the camera's forward axis."""
        r, t = self.world_to_camera()
        cam = points @ r.T + t
        depth = cam[:, 2]
        f = self.focal
        cx = self.size / 2 + self.shift_x * self.size
        cy = self.size / 2 + self.shift_y * self.size
        px = np.stack([f * cam[:, 0] / depth + cx, f * cam[:, 1] / depth + cy], axis=1)
        return px, depth

    def view_dirs(self, points: np.ndarray) -> np.ndarray:
        """Unit vectors from each point toward the camera."""
        d = self.eye() - points
        return d / np.linalg.norm(d, axis=1, keepdims=True)
