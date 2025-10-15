from typing import Annotated, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core import get_settings, logger, get_gateway_service
from app.service import GatewayService, fetch_started_data, enrich_data
from app.model import ExtensionStartedData, EnrichmentRequestData

settings = get_settings()
router = APIRouter(prefix="/extension", tags=["Расширение"])


@router.post(
    path="/search",
    summary="Получить список пациентов по фильтру",
    description="Получить список пациентов по фильтру",
)
async def search_patients_hospitals(patient: ExtensionStartedData,
                                    gateway_service: Annotated[GatewayService, Depends(get_gateway_service)]):
    logger.info("Запрос на поиск пациентов")
    result = await fetch_started_data(patient, gateway_service)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Данные не найдены"
        )
    return result


@router.post(
    path="/enrich-data",
    summary="Обогатить данные для фронта",
    description="Обогатить данные для фронта",
    response_model=Dict[str, Any]
)
async def enrich_started_data_for_front(
        enrich_request: EnrichmentRequestData,
        gateway_service: Annotated[GatewayService, Depends(get_gateway_service)]
) -> Dict[str, Any]:
    logger.info("Обащение данных для фронта")
    result = await enrich_data(enrich_request, gateway_service)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Не удалось обогатить данные"
        )
    return result
