from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "statusCode": exc.status_code,
            "message": exc.detail,
            "data": None,
            },
    )
    
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "statusCode": 422,
            "message": "Validation error",
            "data": exc.errors()[0].get("msg"),
        },
    )