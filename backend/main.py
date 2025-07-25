from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.product.routers import router as product_router
from apps.user.routers import router as user_router
from apps.bulk_request.routers import router as bulk_request_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # I will have to update this on production for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
API_PREFIX = "/api"
app.include_router(product_router, prefix=API_PREFIX)
app.include_router(user_router, prefix=API_PREFIX)
app.include_router(bulk_request_router, prefix=API_PREFIX)


@app.get("/")
def health_check():
    return "Service is running!"
