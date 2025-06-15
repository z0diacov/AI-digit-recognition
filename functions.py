import random

def create_random_array(m: int, n: int, min: int = -1, max: int = 1) -> list:
    return [[random.uniform(min, max) for _ in range(n)] for _ in range(m)]
