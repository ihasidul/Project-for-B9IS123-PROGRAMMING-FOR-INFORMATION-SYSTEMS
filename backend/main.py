from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.product.routers import router as product_router
from apps.user.routers import router as user_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # I will have to update this on production for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(product_router)
app.include_router(user_router)

@app.get("/")
def health_check():
    return "Service is running!"
