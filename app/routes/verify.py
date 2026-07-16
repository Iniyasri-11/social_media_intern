"""
app/routes/verify.py

Defines the /verify endpoint using an APIRouter, rather than attaching
routes directly to the main `app` object. This keeps main.py clean and
lets each feature area (verify, and later e.g. auth, history, admin) live
in its own router module that main.py simply includes.
"""

from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from typing import Optional

from app.schemas.verify import VerifyResponse
from app.services.verification_service import verify_post

# prefix/tags here keep Swagger UI organized and give all routes in this
# file a consistent base path (e.g. this could become /api/v1/verify later)
router = APIRouter(
    prefix="/verify",
    tags=["Verification"],
)


@router.post(
    "",
    response_model=VerifyResponse,
    summary="Verify the authenticity of a social media post",
    description=(
        "Accepts a post's text (and optionally an image file or source URL) "
        "and returns an authenticity verdict. Supports both JSON body payloads "
        "and multipart/form-data image uploads. "
        "Supported file formats: JPEG, JPG, PNG."
    ),
)
async def verify(
    request: Request,
    post_text: Optional[str] = Form(None),
    post_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
) -> VerifyResponse:
    """
    Route handler that processes either a JSON payload or a multipart form-data upload.
    Reads image file bytes asynchronously, performs file format checks, and delegates to the service layer.
    """
    content_type = request.headers.get("content-type", "")
    resolved_text = None
    resolved_url = None
    image_bytes = None
    image_filename = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            resolved_text = body.get("post_text")
            resolved_url = body.get("post_url")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON payload.")
    else:
        # Use multipart/form-data parameters parsed by FastAPI
        resolved_text = post_text
        resolved_url = post_url
        if image:
            filename = image.filename or "uploaded_image.jpg"
            ext = filename.split(".")[-1].lower() if "." in filename else ""
            mime_type = image.content_type or ""

            # Validate format (support jpeg, jpg, png)
            allowed_extensions = ("jpeg", "jpg", "png")
            allowed_mimes = ("image/jpeg", "image/png", "image/jpg")

            if ext not in allowed_extensions and mime_type not in allowed_mimes:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported image format. Only JPEG, JPG, and PNG are supported. Received: {filename}",
                )

            try:
                image_bytes = await image.read()
                image_filename = filename
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to read uploaded image bytes: {str(e)}",
                )

    try:
        # Delegate to the verification service layer
        return verify_post(
            post_text=resolved_text,
            post_url=resolved_url,
            image_bytes=image_bytes,
            image_filename=image_filename,
        )
    except ValueError as e:
        # Catch and map image format corruption or validation errors to HTTP 400
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected internal error occurred: {str(e)}",
        )

