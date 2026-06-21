from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.api.auth import get_admin_user

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    type: str
    description: Optional[str] = None
    requirements: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("")
async def list_jobs(db: AsyncSession = Depends(get_db)):
    from app.models.job import Job

    result = await db.execute(select(Job).where(Job.is_active == True).order_by(Job.created_at.desc()))
    jobs = result.scalars().all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "type": j.type,
            "description": j.description,
            "requirements": j.requirements,
            "created_at": j.created_at.isoformat() if j.created_at else None,
        }
        for j in jobs
    ]


@router.get("/{job_id}")
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    from app.models.job import Job

    job = await db.get(Job, job_id)
    if not job or not job.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return {
        "id": job.id,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "type": job.type,
        "description": job.description,
        "requirements": job.requirements,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_job(body: JobCreate, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.job import Job

    job = Job(
        title=body.title,
        department=body.department,
        location=body.location,
        type=body.type,
        description=body.description,
        requirements=body.requirements,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return {"id": job.id, "message": "Job created successfully"}


@router.put("/{job_id}")
async def update_job(job_id: int, body: JobUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.job import Job

    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if body.title is not None:
        job.title = body.title
    if body.department is not None:
        job.department = body.department
    if body.location is not None:
        job.location = body.location
    if body.type is not None:
        job.type = body.type
    if body.description is not None:
        job.description = body.description
    if body.requirements is not None:
        job.requirements = body.requirements
    if body.is_active is not None:
        job.is_active = body.is_active

    await db.commit()
    return {"message": "Job updated successfully"}


@router.delete("/{job_id}")
async def delete_job(job_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.job import Job

    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted"}


@router.post("/{job_id}/apply")
async def apply_job(
    job_id: int,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    cover_letter: str = Form(""),
    resume: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
):
    from app.models.job import Job, JobApplication

    job = await db.get(Job, job_id)
    if not job or not job.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    resume_url = None
    if resume and resume.filename:
        import os, aiofiles
        upload_dir = "uploads/resumes"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = f"{upload_dir}/{job_id}_{resume.filename}"
        async with aiofiles.open(file_path, "wb") as f:
            content = await resume.read()
            await f.write(content)
        resume_url = f"/{file_path}"

    application = JobApplication(
        job_id=job_id,
        name=name,
        email=email,
        phone=phone,
        resume_url=resume_url,
        cover_letter=cover_letter,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return {"id": application.id, "message": "Application submitted successfully"}
