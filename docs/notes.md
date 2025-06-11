- Alembic Create Migrations command 
```
 python -m alembic revision --autogenerate -m "<Migration message>"
```
- Apply Migrations 
```
python -m alembic upgrade head
```
