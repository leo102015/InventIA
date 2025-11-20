from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexión. 
# PARA PRODUCCIÓN: Usa una variable de entorno.
# Ejemplo PostgreSQL: "postgresql://usuario:password@localhost/inventia_db"
# Ejemplo SQLite (para pruebas rápidas): "sqlite:///./inventia.db"
SQLALCHEMY_DATABASE_URL = "postgresql://inventia_user:tall3r_1nvent14@localhost/inventia_db"

# Argumentos específicos para SQLite (eliminar si usas PostgreSQL)
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para obtener la sesión de DB en cada request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()