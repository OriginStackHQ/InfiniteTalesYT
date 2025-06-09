from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any

def response(message: str = "", data: Any = None, status_code: int = 200):
    # Convert single model
    if isinstance(data, BaseModel):
        data = data.model_dump()

    # Convert list of models
    elif isinstance(data, list) and all(isinstance(item, BaseModel) for item in data):
        data = [item.dict() for item in data]

    return JSONResponse(
        status_code=status_code,
        content={
            "success": True if status_code < 400 else False,
            "statusCode": status_code,
            "message": message,
            "data": data
        }
    )
