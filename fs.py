import json
from typing import Any
import os 
import shutil

def elem_from_json_path(path: str) -> dict[Any, Any]:
    with open(path, 'r', encoding='utf-8') as file:
        return json.load(file)

def create_and_insert_json(path: str, data: list[list[float]]) -> None:
    with open(path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    
def delete_folder(path: str) -> None:
    if os.path.exists(path): 
        shutil.rmtree(path)

def get_list_directories(path):

    directories = [f for f in os.listdir(path)]
    
    directories.sort(key=lambda d: os.path.getctime(os.path.join(path, d)))
    
    return directories


