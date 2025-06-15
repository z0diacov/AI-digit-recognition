import os

CURRENT_DIR_PATH = os.getcwd()

TEMPLATES_DIR_PATH = os.path.join(CURRENT_DIR_PATH, "templates")
STATIC_DIR_PATH = os.path.join(CURRENT_DIR_PATH, "static")
EXECUTABLE_NEURAL_NETWORK_PATH = os.path.join(CURRENT_DIR_PATH, "recognitor", "main")
EXECUTABLE_NEURAL_NETWORK_LEARN_PATH = os.path.join(CURRENT_DIR_PATH, "recognitor", "learn")
DIRECTORY_OF_NETWORKS_PATH = os.path.join(CURRENT_DIR_PATH, "networks")
CONFIGS_DIR_PATH = os.path.join(CURRENT_DIR_PATH, "configs")
NETWORK_HYPERPARAMETERS_PATH = os.path.join(CONFIGS_DIR_PATH, "network_hyperparameters.json")
DIRECTORY_OF_IDEAL_PATH = os.path.join(CURRENT_DIR_PATH, "ideal")