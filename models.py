from pydantic import BaseModel
from typing import Optional
import pathes

class Recognition_data(BaseModel):
    data: list[float|int]
    folder_name: Optional[str] = None

class Create_folder(BaseModel):
    folder_name: str
    base_path: str = pathes.DIRECTORY_OF_NETWORKS_PATH

class Delete_folder(BaseModel):
    folder_name: str
    base_path: str = pathes.DIRECTORY_OF_NETWORKS_PATH

class Get_data_set(BaseModel):
    ai_name: str
    answer: str
    base_path: str = pathes.DIRECTORY_OF_NETWORKS_PATH

class Create_case(BaseModel):
    ai_name: str
    answer: str
    data: list[int|float]
    base_path: str = pathes.DIRECTORY_OF_NETWORKS_PATH

class Delete_case(BaseModel):
    ai_name: str
    answer: str
    index: str
    base_path: str = pathes.DIRECTORY_OF_NETWORKS_PATH

class Learn_ai(BaseModel):
    ai_name: str
    base_path: str = pathes.DIRECTORY_OF_NETWORKS_PATH
