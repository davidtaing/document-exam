from sqlalchemy import Column, String, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSON, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from src.database import db
import uuid

class LangchainPgCollection(db.Model):
    __tablename__ = 'langchain_pg_collection'
    
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    cmetadata = Column(JSON)
    
    embeddings = relationship("LangchainPgEmbedding", back_populates="collection", cascade="all, delete-orphan")


class LangchainPgEmbedding(db.Model):
    __tablename__ = 'langchain_pg_embedding'
    
    id = Column(String, primary_key=True)
    collection_id = Column(UUID(as_uuid=True), ForeignKey('langchain_pg_collection.uuid', ondelete='CASCADE'))
    embedding = Column(Vector)
    document = Column(String)
    cmetadata = Column(JSONB)
    
    collection = relationship("LangchainPgCollection", back_populates="embeddings")
    
    __table_args__ = (
        Index('ix_cmetadata_gin', 'cmetadata', postgresql_using='gin', postgresql_ops={'cmetadata': 'jsonb_path_ops'}),
    )