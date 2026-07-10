---
title: "Eigenvalues: Scale Along Stable Directions"
summary: "A geometric route to understanding why eigenvectors mark the special directions of a linear transformation."
date: "2026-07-10"
topic: "Analysis & Algebra"
tags: [Linear Algebra, Geometric Intuition]
order: 1
draft: false
---

# Begin with the transformation

A matrix is more than a table of numbers. Seen as a linear transformation of space, eigenvalues and eigenvectors become easier to picture: most vectors change direction, while a few special directions are only stretched, compressed, or reversed.

For a nonzero vector $v$, if

$$
Av = \lambda v,
$$

then $v$ is an eigenvector of $A$, and $\lambda$ is its corresponding eigenvalue.

## A two-dimensional example

Consider the matrix

$$
A =
\begin{pmatrix}
3 & 1 \\
0 & 2
\end{pmatrix}.
$$

Its eigenvalues are $3$ and $2$. The usual route to them is the characteristic equation:

$$
\det(A - \lambda I) = 0.
$$

| Eigenvalue | One matching direction | Geometric meaning |
| --- | --- | --- |
| $3$ | $(1, 0)^T$ | Scale that direction by three |
| $2$ | $(-1, 1)^T$ | Scale that direction by two |

## Check it with code

```python
import numpy as np

A = np.array([[3, 1], [0, 2]])
values, vectors = np.linalg.eig(A)

print(values)
print(vectors)
```

The vectors returned by the program may differ from a hand calculation by a nonzero scalar. That is expected: an eigenvector represents a direction, not an arrow of one fixed length.

## The useful intuition

1. Eigenvectors are the stable directions of a linear transformation.
2. Eigenvalues record the scale applied along those directions.
3. Diagonalization describes the transformation in coordinates built from eigenvectors.

When there are enough eigenvectors to form a basis, the matrix can be written as

$$
A = PDP^{-1}.
$$

Here, $P^{-1}$ moves into eigenvector coordinates, $D$ performs independent scaling along each axis, and $P$ returns to the original coordinates.
