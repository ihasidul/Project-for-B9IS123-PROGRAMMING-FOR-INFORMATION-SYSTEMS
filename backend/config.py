import os
import importlib
from dotenv import load_dotenv
from passlib.context import CryptContext


load_dotenv()

SECRET_KEY=str(os.getenv("SECRET_KEY"))
ALGORITHM=str(os.getenv("ALGORITHM", "HS256"))
ACCESS_TOKEN_EXPIRE_MINUTES=float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")


