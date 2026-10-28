import json
from typing import List, Optional, Dict, Any, Union
from pathlib import Path

def load_cv_data():
    with open('CV_DATA.json', 'r') as f:
        cv_data = json.load(f)
    return cv_data

def reset_cv_data(cv_data:Dict[str,Any]):
    with open('CV_DATA.json', 'w') as f:
        json.dump(cv_data, f)