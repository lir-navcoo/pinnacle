"""
API Key 管理 API
"""

from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import APIKey
from app.schemas import (
    APIKeyCreate,
    APIKeyUpdate,
    APIKeyResponse,
    APIKeyListResponse,
)

router = APIRouter(prefix="/api-keys", tags=["API Key 管理"])


async def get_current_user_id(
    authorization: Optional[str] = None
) -> str:
    """获取当前用户ID"""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        payload = decode_access_token(token)
        if payload:
            return payload.get("sub", "anonymous")
    return "anonymous"


@router.get("", response_model=APIKeyListResponse)
async def list_api_keys(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取 API Key 列表"""
    query = select(APIKey).where(APIKey.user_id == user_id)
    
    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    offset = (page - 1) * page_size
    query = query.order_by(APIKey.created_at.desc()).offset(offset).limit(page_size)
    
    result = await db.execute(query)
    api_keys = result.scalars().all()
    
    # 返回时隐藏 key_hash
    items = []
    for ak in api_keys:
        items.append(APIKeyResponse(
            id=ak.id,
            name=ak.name,
            key="***",  # 不返回完整 key
            prefix=ak.prefix,
            user_id=ak.user_id,
            permissions=ak.permissions or [],
            rate_limit=ak.rate_limit,
            template_ids=ak.template_ids or [],
            is_active=ak.is_active,
            last_used_at=ak.last_used_at,
            created_at=ak.created_at,
        ))
    
    return APIKeyListResponse(items=items, total=total)


@router.post("", response_model=APIKeyResponse, status_code=201)
async def create_api_key(
    data: APIKeyCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """创建 API Key（返回完整 key，仅此一次）"""
    api_key, full_key = APIKey.create_with_key(
        name=data.name,
        user_id=user_id,
        permissions=data.permissions,
        rate_limit=data.rate_limit,
        template_ids=data.template_ids,
    )
    
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    
    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key=full_key,  # 首次返回完整 key
        prefix=api_key.prefix,
        user_id=api_key.user_id,
        permissions=api_key.permissions or [],
        rate_limit=api_key.rate_limit,
        template_ids=api_key.template_ids or [],
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at,
    )


@router.get("/{api_key_id}", response_model=APIKeyResponse)
async def get_api_key(
    api_key_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取 API Key 详情"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == api_key_id,
            APIKey.user_id == user_id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API Key 不存在")
    
    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key="***",  # 不返回完整 key
        prefix=api_key.prefix,
        user_id=api_key.user_id,
        permissions=api_key.permissions or [],
        rate_limit=api_key.rate_limit,
        template_ids=api_key.template_ids or [],
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at,
    )


@router.put("/{api_key_id}", response_model=APIKeyResponse)
async def update_api_key(
    api_key_id: str,
    data: APIKeyUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """更新 API Key"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == api_key_id,
            APIKey.user_id == user_id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API Key 不存在")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(api_key, field, value)
    
    await db.commit()
    await db.refresh(api_key)
    
    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key="***",
        prefix=api_key.prefix,
        user_id=api_key.user_id,
        permissions=api_key.permissions or [],
        rate_limit=api_key.rate_limit,
        template_ids=api_key.template_ids or [],
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at,
    )


@router.delete("/{api_key_id}")
async def delete_api_key(
    api_key_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """删除 API Key"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == api_key_id,
            APIKey.user_id == user_id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API Key 不存在")
    
    await db.delete(api_key)
    await db.commit()
    
    return {"message": "API Key 已删除"}
